import { RestagedRecordingSchema, type RecordingLanguageProfile, type SceneNode, type VisualScenario } from '@fluidkit/contracts';
import { redactSceneNode } from './privacy';

/** Restaging needs the exact local endpoint projections. Baked archives contain no translatable source model. */
export async function deriveLocalizedRecording(original: VisualScenario, source: SceneNode[], target: SceneNode[], languageProfile: RecordingLanguageProfile) {
  if (original.schemaVersion !== 5 || original.sourceCheckpoint) return null;
  const resolvedSource = new Map(source.map(node => [node.id,node]));
  const resolvedTarget = new Map(target.map(node => [node.id,node]));
  if (original.source.some(node=>!resolvedSource.has(node.id)) || original.target.length!==target.length || original.target.some(node=>!resolvedTarget.has(node.id))) return null;
  const localized = (node: SceneNode, resolved: SceneNode) => {
    // Recording privacy cannot be weakened by a changed projection.
    return redactSceneNode({...resolved,sensitive:node.sensitive || resolved.sensitive});
  };
  const recording = {...original,
    source:original.source.map(node=>localized(node,resolvedSource.get(node.id)!)),
    target:original.target.map(node=>localized(node,resolvedTarget.get(node.id)!)),
    languageProfile,
  };
  const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(original)));
  return RestagedRecordingSchema.parse({schemaVersion:1,kind:'restaged-recording',sourceRecordingSha256:Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join(''),recording});
}
