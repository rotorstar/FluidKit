import { MOTION_LIMITS, MotionPlanSchema, type MotionPlan, type MorphRelation, type SceneNode } from '@fluidkit/contracts';

function relationId(kind: string, sources: readonly string[], targets: readonly string[]) {
  let hash = 2166136261;
  for (const value of `${kind}:${sources.join('|')}>${targets.join('|')}`) hash = Math.imul(hash ^ value.charCodeAt(0), 16777619) >>> 0;
  return `morph-${kind}-${hash.toString(16)}`;
}
function checkPorts(nodes: readonly SceneNode[]) {
  const byId = new Map(nodes.map(node => [node.id, node]));
  for (const node of nodes) {
    const visited = new Set([node.id]); let id = node.motion?.follow;
    while (id) { const owner = byId.get(id); if (!owner || visited.has(id)) throw new Error('Invalid or cyclic motion follower'); visited.add(id); id = owner.motion?.follow; }
  }
  for (const node of nodes) if (node.motion?.connector) {
    if (node.anatomy.behavior !== 'presentation') throw new Error('Connectors must be decorative parts');
    for (const reference of [node.motion.connector.from, node.motion.connector.to]) {
      const owner = byId.get(reference.nodeId);
      if (!owner || owner.motion?.connector) throw new Error('Connector requires an existing non-connector node');
      if (reference.portId !== 'center' && !owner.motion?.ports?.some(port => port.id === reference.portId)) throw new Error('Unknown connector port');
    }
  }
}

/** Validate a recorded plan against its actual scenes, never against current policies. */
export function validateMotionPlan(input: unknown, source: readonly SceneNode[], target: readonly SceneNode[]): MotionPlan {
  const plan = MotionPlanSchema.parse(input);
  const sources = new Map(source.map(node => [node.id, node])), targets = new Map(target.map(node => [node.id, node]));
  const sourceOwners = new Set<string>(), targetOwners = new Set<string>(), ids = new Set<string>();
  if (source.length > MOTION_LIMITS.presentedNodes || target.length > MOTION_LIMITS.sceneNodes || new Set([...sources.keys(), ...targets.keys()]).size > MOTION_LIMITS.presentedNodes) throw new Error('Motion scene budget exceeded');
  if (sources.size !== source.length || targets.size !== target.length) throw new Error('Duplicate motion node');
  checkPorts(source); checkPorts(target);
  let coupled = 0;
  for (const relation of plan.relations) {
    if (ids.has(relation.id)) throw new Error('Duplicate morph relation');
    ids.add(relation.id);
    for (const id of relation.sources) { if (!sources.has(id) || sourceOwners.has(id)) throw new Error('Unknown or multiply owned morph source'); sourceOwners.add(id); }
    for (const id of relation.targets) { if (!targets.has(id) || targetOwners.has(id)) throw new Error('Unknown or multiply owned morph target'); targetOwners.add(id); }
    if (relation.kind === 'split' || relation.kind === 'merge') {
      coupled++;
      const members = [...relation.sources.map(id => sources.get(id)!), ...relation.targets.map(id => targets.get(id)!)];
      if (members.some(node => node.anatomy.behavior !== 'presentation' || node.kind === 'text' || node.text || node.motion?.connector || node.rotation !== 0)) throw new Error('Split/merge requires unrotated decorative shells; content and controls remain separate parts');
      if (new Set(members.map(node => node.layer)).size !== 1) throw new Error('Coupled shells require one paint layer');
    }
  }
  if (coupled > MOTION_LIMITS.couplingGroups) throw new Error('Coupling group budget exceeded');
  if (sourceOwners.size !== source.length || targetOwners.size !== target.length) throw new Error('Incomplete morph correspondence');
  return plan;
}

/** Conditional declarations are evaluated once; the resolved ownership is recorded. */
export function compileMotionPlan(source: readonly SceneNode[], target: readonly SceneNode[], sourceState?: string): MotionPlan {
  const sourceById = new Map(source.map(node => [node.id, node]));
  const relations: MorphRelation[] = [], claimed = new Set<string>(), assigned = new Set<string>();
  const splits = new Map<string, { targets: string[]; groupId?: string }>();
  const applicable = (node: SceneNode) => (node.motion?.correspondence ?? []).filter(rule => (!rule.whenState || rule.whenState === sourceState) && (!rule.whenPresent || rule.whenPresent.every(id => sourceById.has(id))));
  for (const node of target) {
    const rules = applicable(node).filter(rule => rule.kind !== 'exit');
    if (rules.length > 1) throw new Error(`Ambiguous morph declaration: ${node.id}`);
    const rule = rules[0]; if (!rule) continue;
    if (rule.sources.some(id => !sourceById.has(id))) throw new Error(`Unknown declared morph source: ${node.id}`);
    assigned.add(node.id);
    if (rule.kind === 'split') {
      const id = rule.sources[0]!; const group = splits.get(id) ?? { targets: [], groupId: rule.groupId };
      if (group.groupId !== rule.groupId) throw new Error('Split targets disagree on group identity');
      group.targets.push(node.id); splits.set(id, group);
    } else relations.push({ id: rule.groupId ?? relationId(rule.kind, rule.sources, [node.id]), kind: rule.kind, sources: rule.sources, targets: [node.id], ...(rule.route ? { route: rule.route } : {}) });
  }
  for (const [id, group] of splits) relations.push({ id: group.groupId ?? relationId('split', [id], group.targets), kind: 'split', sources: [id], targets: group.targets });
  for (const relation of relations) for (const id of relation.sources) { if (claimed.has(id)) throw new Error('Multiply owned morph source'); claimed.add(id); }
  for (const node of source) if (!claimed.has(node.id) && applicable(node).some(rule => rule.kind === 'exit')) {
    relations.push({ id: relationId('exit', [node.id], []), kind: 'exit', sources: [node.id], targets: [] }); claimed.add(node.id);
  }
  for (const node of target) if (!assigned.has(node.id)) {
    const from = sourceById.has(node.id) && !claimed.has(node.id) ? [node.id] : [];
    const kind = from.length ? 'match' : 'enter';
    relations.push({ id: relationId(kind, from, [node.id]), kind, sources: from, targets: [node.id] });
    if (from.length) claimed.add(node.id);
  }
  for (const node of source) if (!claimed.has(node.id)) relations.push({ id: relationId('exit', [node.id], []), kind: 'exit', sources: [node.id], targets: [] });
  return validateMotionPlan({ schemaVersion: 1, relations }, source, target);
}
