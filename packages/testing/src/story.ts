import { StoryDefinitionSchema, type RuntimeSnapshot, type StoryDefinition } from '@fluidkit/contracts';
import type { FluidRuntime } from '@fluidkit/core';

export function createStoryRunner(runtime: FluidRuntime, input: StoryDefinition) {
  const story = StoryDefinitionSchema.parse(input);
  function freeze(value: unknown) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) freeze(child); } }
  freeze(story);
  if (story.flowId !== runtime.flow.id || story.mode !== 'guided') throw new Error('Story/runtime mismatch');
  for (const beat of story.beats) {
    if (!runtime.flow.states[beat.expectedState]) throw new Error('Unknown expected story state');
    for (const id of Object.keys(beat.expectedFields)) if (!runtime.flow.fields.some(field => field.id === id)) throw new Error('Unknown expected story field');
  }
  let index = -1, stopped = false;
  let expectedRevision = runtime.getSnapshot().revision;
  const records: { beatId: string; eventId: string | null; eventType: string | null; before: number; after: number; state: string; effectId: string | null }[] = [];
  function assertExpected(snapshot: RuntimeSnapshot, beat: StoryDefinition['beats'][number]) {
    if (snapshot.state !== beat.expectedState || Object.entries(beat.expectedFields).some(([key, value]) => snapshot.fields[key] !== value)) throw new Error(`Story-Ergebnis stimmt nicht: ${beat.id}`);
  }
  return {
    story,
    getRecords: () => records.map(record => ({ ...record })),
    stop() { stopped = true; },
    advance(viewport: { width: number; height: number }, studioControl?: string) {
      if (stopped) throw new Error('Story gestoppt. Neu starten, um fortzufahren.');
      if (runtime.getSnapshot().revision !== expectedRevision) { stopped = true; throw new Error('Nutzerübernahme oder fremdes Event: Story gestoppt.'); }
      const beat = story.beats[index + 1];
      if (!beat) throw new Error('Story bereits abgeschlossen');
      const before = runtime.getSnapshot().revision;
      try {
        if (beat.target.kind === 'part') {
          const part = runtime.getScene(viewport).find(node => node.id === (beat.target.kind === 'part' ? beat.target.nodeId : ''));
          if (!part || part.disabled || part.opacity <= 0 || part.width < 24 || part.height < 24 || part.onActivate !== beat.target.eventType) throw new Error(`Story-Ziel oder Eventvertrag nicht bedienbar: ${beat.id}`);
        }
        if (beat.target.kind === 'studio' && studioControl !== beat.target.controlId) throw new Error('Studio-Control muss ausdrücklich aktiviert werden.');
        if (beat.target.kind !== 'context') {
          const result = runtime.send(beat.target.eventType, {}, 'host', 'programmatic');
          if (!result.accepted) throw new Error(`Story-Event abgewiesen: ${result.reason}`);
        }
        const snapshot = runtime.getSnapshot(); assertExpected(snapshot, beat);
        expectedRevision = snapshot.revision; index++;
        const event = [...runtime.getTrace()].reverse().find(entry => entry.kind === 'accepted' && entry.revision === snapshot.revision);
        records.push({ beatId: beat.id, eventId: beat.target.kind === 'context' ? null : event?.eventId ?? null, eventType: beat.target.kind === 'context' ? null : beat.target.eventType, before, after: snapshot.revision, state: snapshot.state, effectId: runtime.getVisualState().current?.selected?.id ?? null });
        return { beat, index, complete: index === story.beats.length - 1, snapshot };
      } catch (error) { stopped = true; throw error; }
    },
  };
}
