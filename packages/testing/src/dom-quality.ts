import { DESIGN_TOKENS, type QualityCheck, type QualityFinding, type SceneNode } from '@fluidkit/contracts';
import { measuredCheck, openCheck } from './quality';

type Rect = Pick<DOMRectReadOnly, 'x' | 'y' | 'width' | 'height'>;
export function intersectText(a: Rect, b: Rect, tolerance = 1) {
  return Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > tolerance &&
    Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > tolerance;
}
/** Proves intentional occlusion by opaque fixed/sticky chrome at all sampled
 * overlap points. Ordinary flow collisions and transparent overlays still fail. */
export function occludedByChrome(a: Element, b: Element, area: Rect): boolean {
  const doc = a.ownerDocument, view = doc.defaultView;
  if (!view || typeof doc.elementsFromPoint !== 'function') return false;
  const inset = Math.min(.25, area.width / 4, area.height / 4);
  const points = [[area.x + inset, area.y + inset], [area.x + area.width - inset, area.y + inset], [area.x + inset, area.y + area.height - inset], [area.x + area.width - inset, area.y + area.height - inset], [area.x + area.width / 2, area.y + area.height / 2]];
  for (const [front, back] of [[a, b], [b, a]] as const) for (let chrome: Element | null = front; chrome; chrome = chrome.parentElement) {
    const style = view.getComputedStyle(chrome);
    if (!['sticky', 'fixed'].includes(style.position) || chrome.contains(back)) continue;
    const rgb = /^rgba?\(([^)]+)\)$/.exec(style.backgroundColor)?.[1]?.split(/[,\s/]+/).filter(Boolean);
    if (!rgb || (rgb.length !== 3 && !(rgb.length === 4 && Number(rgb[3]) === 1))) continue;
    let opaque = true;
    for (let parent: Element | null = chrome; parent; parent = parent.parentElement) if (Number(view.getComputedStyle(parent).opacity || '1') !== 1) opaque = false;
    if (!opaque) continue;
    const candidate = chrome;
    if (points.every(([x, y]) => {
      if (x === undefined || y === undefined || x < 0 || y < 0 || x >= view.innerWidth || y >= view.innerHeight) return false;
      const stack = doc.elementsFromPoint(x, y), overlay = stack.indexOf(candidate), underlying = stack.findIndex(element => element === back || back.contains(element));
      return overlay >= 0 && underlying > overlay;
    })) return true;
  }
  return false;
}
function target(element: Element, index: number) {
  return { nodes: [element.id || element.getAttribute('data-testid') || `dom:${element.tagName.toLowerCase()}:${index}`] };
}
export function hiddenByClosedDetails(element: Element): boolean {
  for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.tagName === 'DETAILS' && !ancestor.hasAttribute('open')) {
      const summary = [...ancestor.children].find(child => child.tagName === 'SUMMARY');
      if (!summary?.contains(element)) return true;
    }
  }
  return false;
}
function rendered(element: Element, view: Window): boolean {
  if (element.closest('[hidden],[inert],[data-quality-ui],.fluid-semantics,script,style,pre') || hiddenByClosedDetails(element)) return false;
  for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
    const style = view.getComputedStyle(ancestor);
    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) return false;
  }
  return element.getClientRects().length > 0;
}

/** Inspects computed, rendered DOM. It deliberately never infers canvas contents. */
export function inspectDomQuality(root: HTMLElement): QualityCheck[] {
  const doc = root.ownerDocument, view = doc.defaultView;
  if (!view) return [openCheck('dom-layout', 'dom', 'DOM-Layout', 'Kein Browserfenster verfügbar.', 'unsupported')];
  const layout: QualityFinding[] = [], typography: QualityFinding[] = [], targets: QualityFinding[] = [];
  const fragments: { box: Rect; owner: Element; ref: QualityFinding['target'] }[] = [];
  let textCount = 0, controlCount = 0;
  for (const [index, element] of [...root.querySelectorAll('*')].entries()) {
    if (!rendered(element, view)) continue;
    const style = view.getComputedStyle(element), ref = target(element, index);
    const textNodes = [...element.childNodes].filter(node => node.nodeType === 3 && node.textContent?.trim());
    if (textNodes.length) {
      textCount++;
      if (parseFloat(style.fontSize) < DESIGN_TOKENS.captionPx - 0.05) typography.push({ rule: 'minimum-caption-size', severity: 'warning', message: `DOM-Schrift unterschreitet ${DESIGN_TOKENS.captionPx} CSS-px.`, target: ref });
      for (const node of textNodes) {
        const range = doc.createRange(); range.selectNodeContents(node);
        for (const rect of range.getClientRects()) if (rect.width > 0 && rect.height > 0) fragments.push({ box: rect, owner: element, ref });
      }
      if (element.scrollWidth > element.clientWidth + 1 && /(hidden|clip)/.test(style.overflowX + style.overflow)) layout.push({ rule: 'text-clipped', severity: 'warning', message: 'DOM-Text ist horizontal abgeschnitten; Langinhalt prüfen.', target: ref });
    }
    if (element.matches('button,input:not([type="file"]),select,textarea,a[href]') && !element.matches(':disabled')) {
      controlCount++;
      const input = element as HTMLInputElement;
      const area = input.labels?.[0] ?? element;
      const rect = area.getBoundingClientRect();
      if (rect.width < DESIGN_TOKENS.minimumTargetPx || rect.height < DESIGN_TOKENS.minimumTargetPx) targets.push({ rule: 'minimum-target-size', severity: 'warning', message: 'Aktivierungsfläche unterschreitet die gewählte 24-px-Basis; Abstände und Ausnahme prüfen.', target: ref });
    }
  }
  if (doc.documentElement.scrollWidth > doc.documentElement.clientWidth + 1) layout.push({ rule: 'page-overflow', severity: 'error', message: 'Die Seite läuft horizontal über den Viewport hinaus.', target: { nodes: ['document'] } });
  const pairs = new Set<string>();
  for (let i = 0; i < fragments.length; i++) for (let j = i + 1; j < fragments.length; j++) {
    const a = fragments[i]!, b = fragments[j]!;
    if (!intersectText(a.box, b.box)) continue;
    const x = Math.max(a.box.x, b.box.x), y = Math.max(a.box.y, b.box.y);
    if (occludedByChrome(a.owner, b.owner, { x, y, width: Math.min(a.box.x + a.box.width, b.box.x + b.box.width) - x, height: Math.min(a.box.y + a.box.height, b.box.y + b.box.height) - y })) continue;
    const key = [a.ref.nodes[0], b.ref.nodes[0]].sort().join('|');
    if (pairs.has(key)) continue;
    pairs.add(key); layout.push({ rule: 'dom-text-overlap', severity: 'error', message: 'Gerenderte DOM-Textfragmente überschneiden sich.', target: { nodes: [...a.ref.nodes, ...b.ref.nodes] } });
  }
  return [measuredCheck('dom-layout', 'dom', 'DOM-Text und Seitenbreite', textCount, layout),
    measuredCheck('dom-typography', 'dom', 'DOM-Schriftgrößen', textCount, typography),
    measuredCheck('dom-targets', 'dom', 'DOM-Aktivierungsflächen', controlCount, targets)];
}

/** Compares the native bridge with the canonical Scene contract, without exposing field contents. */
export function inspectSemantics(root: HTMLElement, nodes: SceneNode[]): QualityCheck[] {
  if (root.querySelector('.replay-banner')) return [openCheck('semantics-contract', 'semantics', 'Native Semantikbrücke', 'Replay ist schreibgeschützt; Live-Ansicht für die Semantikabnahme wiederherstellen.')];
  const controls = [...root.querySelectorAll<HTMLElement>('.fluid-semantics [data-fluid-node]')];
  const expected = nodes.filter(node => node.anatomy.behavior === 'button' || node.anatomy.behavior === 'textbox');
  const findings: QualityFinding[] = [];
  for (const node of expected) {
    const matches = controls.filter(control => control.dataset.fluidNode === node.id);
    const ref = { componentId: node.anatomy.componentId, part: node.anatomy.part, nodes: [node.id] };
    const problem = (rule: string, message: string) => findings.push({ rule, severity: 'error', message, target: ref });
    if (matches.length !== 1) { problem('bridge-cardinality', 'Ein interaktiver Part benötigt genau ein natives Control.'); continue; }
    const control = matches[0]!;
    const actual = control.getAttribute('aria-label') || control.textContent?.trim();
    if (actual !== (node.label || node.text)) problem('accessible-name', 'Der zugängliche Name stimmt nicht mit dem Part-Vertrag überein.');
    if (control.closest('[aria-hidden="true"],[hidden],[inert]')) problem('hidden-control', 'Ein aktiver Part ist für assistive Technik verborgen.');
    if (node.pressed !== undefined && control.getAttribute('aria-pressed') !== String(node.pressed)) problem('pressed-state', 'Der ausgewählte Zustand der Brücke ist nicht synchron.');
    if (control.matches(':disabled') !== node.disabled) problem('disabled-state', 'Der Disabled-Zustand der Brücke ist nicht synchron.');
    if (node.anatomy.behavior === 'textbox' && control.tagName !== 'INPUT') problem('native-input', 'Textbox benötigt die native Eingabebrücke.');
    if (node.semantics?.sort && control.closest('th')?.getAttribute('aria-sort') !== node.semantics.sort) problem('sort-state', 'Die native Tabellen-Sortierrichtung ist nicht synchron.');
  }
  return [measuredCheck('semantics-contract', 'semantics', 'Native Namen und Part-Zustände', expected.length, findings)];
}
