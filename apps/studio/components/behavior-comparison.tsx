'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { useStudioLocale } from './studio-locale';
import { Button } from '@base-ui/react/button';
import { Tabs, TabsList, TabsTab, TabsPanel } from '@ui-sdk/react/tabs';
import { Select, SelectLabel, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@ui-sdk/react/select';
import { Dialog, DialogTrigger, DialogBackdrop, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@ui-sdk/react/dialog';
import { createFluidRuntime } from '@fluidkit/core';
import { createWorkspaceFlow, workspaceCollectionOrder, workspaceRows, workspaceScene, type WorkspaceData } from '@fluidkit/cases';
import { DEFAULT_EFFECT_SETTINGS, type RuntimeSnapshot, type ChangeReason } from '@fluidkit/contracts';
import { FluidProvider } from '@fluidkit/react';
import type { SurfaceMetrics } from '@fluidkit/webgpu';
import { WorkspaceSurface } from './workspace-surface';
import styles from './behavior-comparison.module.css';

const VIEWS = [
  { value: 'table', label: 'Tabelle', description: 'Module sortieren und Werte direkt vergleichen.' },
  { value: 'cards', label: 'Karten', description: 'Dieselben Module mit mehr Raum für ihren Kontext.' },
  { value: 'map', label: 'Map', description: 'Abhängigkeiten zwischen den Modulen erkunden.' },
  { value: 'detail', label: 'Detail', description: 'Das ausgewählte Modul und seine Beziehungen prüfen.' },
] as const;
const GROUPS = [
  { value: 'all', label: 'Alle Ebenen' }, { value: 'Kernel', label: 'Kernel' },
  { value: 'Adapter', label: 'Adapter' }, { value: 'Tooling', label: 'Tooling' },
];
type Library = 'ui-sdk' | 'base-ui';
type ControlsProps = {
  snapshot: RuntimeSnapshot;
  data: WorkspaceData;
  changeView(value: unknown, reason?: ChangeReason): boolean;
  changeGroup(value: unknown, reason?: ChangeReason): boolean;
  dialogOpen: boolean;
  onDialogOpenChange(open: boolean, reason: string): void;
};
type Observation = {
  id: number; library: Library; event: string; reason: string;
  before: number; after: number; accepted: boolean;
};

type InputCause = { reason: 'keyboard' | 'pointer'; scope: 'view' | 'group'; at: number; target: Element; key?: string };
function inputScope(target: Element | null): InputCause['scope'] | null {
  return target?.closest('[role="tab"], [role="tablist"]') ? 'view'
    : target?.closest('[role="combobox"], [role="option"], [role="listbox"]') ? 'group' : null;
}
function inputReason(event: Event | undefined, attributed: WeakMap<Event, InputCause['reason']>): ChangeReason {
  if (event?.type.startsWith('key')) return 'keyboard';
  if (event && /^(mouse|pointer|touch)/.test(event.type)) return 'pointer';
  if (event?.type === 'click' && 'detail' in event && typeof event.detail === 'number' && event.detail > 0) return 'pointer';
  return event ? attributed.get(event) ?? 'programmatic' : 'programmatic';
}

function InspectorValues({ snapshot, data }: Pick<ControlsProps, 'snapshot' | 'data'>) {
  const {locale} = useStudioLocale();
  const selected = data.modules.find(module => module.id === snapshot.fields.selected);
  return <dl className={styles.values}>
    <div><dt>Ansicht</dt><dd>{VIEWS.find(view => view.value === snapshot.state)?.label ?? snapshot.state}</dd></div>
    <div><dt>Ebene</dt><dd>{GROUPS.find(group => group.value === snapshot.fields.group)?.label ?? String(snapshot.fields.group)}</dd></div>
    <div><dt>Fachrevision</dt><dd>r{snapshot.revision}</dd></div>
    <div><dt>Sortierung</dt><dd>{String(snapshot.fields.sort)} · {String(snapshot.fields.direction)}</dd></div>
    <div><dt>Aktuelles Modul</dt><dd>{selected?.name ?? 'Noch kein Modul geöffnet'}</dd></div>
    <div><dt>Sichtbare Module</dt><dd>{workspaceRows(data, snapshot, locale).length} / {data.modules.length}</dd></div>
  </dl>;
}

/** Only DOM behavior changes between adapters. Values and actions belong to Fluid. */
export function BehaviorControls({ library, ...props }: ControlsProps & { library: Library }) {
  const { snapshot, data, changeView, changeGroup, dialogOpen, onDialogOpenChange } = props;
  const hasSelection = data.modules.some(module => module.id === snapshot.fields.selected);
  const inputCause = useRef<InputCause | null>(null);
  const attributed = useRef(new WeakMap<Event, InputCause['reason']>());
  function captureInput(event: Event, reason: InputCause['reason'], key?: string) {
    const target = event.target instanceof Element ? event.target : null, scope = inputScope(target);
    const activationKey = key === undefined || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', ' '].includes(key);
    inputCause.current = target && scope && activationKey ? { reason, scope, target, key, at: performance.now() } : null;
  }
  function captureDerived(event: Event) {
    const cause = inputCause.current;
    if (!cause) return;
    const age = performance.now() - cause.at;
    if (age < 0 || age > 500) { inputCause.current = null; return; }
    const target = event.target instanceof Element ? event.target : null;
    if (!target || inputScope(target) !== cause.scope) return;
    const focus = event.type === 'focusin';
    const related = 'relatedTarget' in event ? event.relatedTarget : null;
    // A deferred focus must originate from the element that received the input.
    // A zero-detail selection click must have an actual activation key/pointer.
    const matches = focus ? related === cause.target || target === cause.target
      : event.type === 'click' && (cause.reason === 'pointer' || cause.key === 'Enter' || cause.key === ' ');
    if (!matches) return;
    attributed.current.set(event, cause.reason);
    // Consume at the native event, even when the focused tab is disabled and
    // produces no value callback. Never retain a global last-modality label.
    inputCause.current = null;
  }
  const capture = {
    onKeyDownCapture: (event: React.KeyboardEvent<HTMLDivElement>) => captureInput(event.nativeEvent, 'keyboard', event.key),
    onKeyUpCapture: (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') captureInput(event.nativeEvent, 'keyboard', event.key);
      else inputCause.current = null;
    },
    onPointerDownCapture: (event: React.PointerEvent<HTMLDivElement>) => captureInput(event.nativeEvent, 'pointer'),
    onMouseUpCapture: (event: React.MouseEvent<HTMLDivElement>) => captureInput(event.nativeEvent, 'pointer'),
    onFocusCapture: (event: React.FocusEvent<HTMLDivElement>) => captureDerived(event.nativeEvent),
    onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => captureDerived(event.nativeEvent),
  };
  if (library === 'ui-sdk') return <div {...capture} className={styles.controls} data-behavior-library="ui-sdk">
    <Tabs value={snapshot.state} activation="automatic" onValueChange={(value, details) => { if (!changeView(value, inputReason(details.event, attributed.current))) details.cancel(); }}>
      <p className={styles.fieldLabel}>Ansicht</p>
      <TabsList className={styles.tabs} aria-label="Workspace-Ansicht">
        {VIEWS.map(view => <TabsTab key={view.value} value={view.value} disabled={view.value === 'detail' && !hasSelection} className={styles.tab}>{view.label}</TabsTab>)}
      </TabsList>
      {VIEWS.map(view => <TabsPanel key={view.value} value={view.value} className={styles.tabDescription}>{view.description}</TabsPanel>)}
    </Tabs>
    <Select value={String(snapshot.fields.group)} items={GROUPS} onValueChange={(value, details) => { if (!changeGroup(value, inputReason(details.event, attributed.current))) details.cancel(); }}>
      <SelectLabel className={styles.fieldLabel}>Modulebene</SelectLabel>
      <SelectTrigger className={styles.selectTrigger}><SelectValue /><span aria-hidden="true">⌄</span></SelectTrigger>
      <SelectContent className={styles.selectPopup} sideOffset={6}>
        {GROUPS.map(group => <SelectItem key={group.value} value={group.value} className={styles.selectItem}>{group.label}</SelectItem>)}
      </SelectContent>
    </Select>
    <Dialog open={dialogOpen} onOpenChange={(open, details) => onDialogOpenChange(open, details.reason)}>
      <DialogTrigger className={styles.primaryButton}>Kontext prüfen <span aria-hidden="true">↗</span></DialogTrigger>
      <DialogBackdrop className={styles.backdrop} />
      <DialogContent className={styles.dialog} finalFocus="trigger">
        <p className={styles.eyebrow}>UI SDK · KONTEXTINSPECTOR</p>
        <DialogTitle className={styles.dialogTitle}>Derselbe Workspace-Zustand.</DialogTitle>
        <DialogDescription className={styles.dialogDescription}>Die Werte kommen direkt aus Fluid. Öffnen und Schließen ändern die Fachrevision nicht.</DialogDescription>
        <InspectorValues snapshot={snapshot} data={data} />
        <DialogClose className={styles.primaryButton}>Zurück zur Arbeitsfläche</DialogClose>
      </DialogContent>
    </Dialog>
  </div>;

  return <div {...capture} className={styles.controls} data-behavior-library="base-ui">
    <BaseTabs.Root value={snapshot.state} onValueChange={(value, details) => { if (!changeView(value, inputReason(details.event, attributed.current))) details.cancel(); }}>
      <p className={styles.fieldLabel}>Ansicht</p>
      <BaseTabs.List className={styles.tabs} activateOnFocus aria-label="Workspace-Ansicht">
        {VIEWS.map(view => <BaseTabs.Tab key={view.value} value={view.value} disabled={view.value === 'detail' && !hasSelection} className={styles.tab}>{view.label}</BaseTabs.Tab>)}
      </BaseTabs.List>
      {VIEWS.map(view => <BaseTabs.Panel key={view.value} value={view.value} className={styles.tabDescription}>{view.description}</BaseTabs.Panel>)}
    </BaseTabs.Root>
    <BaseSelect.Root value={String(snapshot.fields.group)} items={GROUPS} onValueChange={(value, details) => { if (!changeGroup(value, inputReason(details.event, attributed.current))) details.cancel(); }}>
      <BaseSelect.Label className={styles.fieldLabel}>Modulebene</BaseSelect.Label>
      <BaseSelect.Trigger className={styles.selectTrigger}><BaseSelect.Value /><span aria-hidden="true">⌄</span></BaseSelect.Trigger>
      <BaseSelect.Portal><BaseSelect.Positioner className={styles.selectPositioner} sideOffset={6}>
        <BaseSelect.Popup className={styles.selectPopup}>
          {GROUPS.map(group => <BaseSelect.Item key={group.value} value={group.value} className={styles.selectItem}><BaseSelect.ItemText>{group.label}</BaseSelect.ItemText></BaseSelect.Item>)}
        </BaseSelect.Popup>
      </BaseSelect.Positioner></BaseSelect.Portal>
    </BaseSelect.Root>
    <BaseDialog.Root open={dialogOpen} onOpenChange={(open, details) => onDialogOpenChange(open, details.reason)}>
      <BaseDialog.Trigger className={styles.primaryButton}>Kontext prüfen <span aria-hidden="true">↗</span></BaseDialog.Trigger>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Popup className={styles.dialog}>
          <p className={styles.eyebrow}>BASE UI · KONTEXTINSPECTOR</p>
          <BaseDialog.Title className={styles.dialogTitle}>Derselbe Workspace-Zustand.</BaseDialog.Title>
          <BaseDialog.Description className={styles.dialogDescription}>Die Werte kommen direkt aus Fluid. Öffnen und Schließen ändern die Fachrevision nicht.</BaseDialog.Description>
          <InspectorValues snapshot={snapshot} data={data} />
          <BaseDialog.Close className={styles.primaryButton}>Zurück zur Arbeitsfläche</BaseDialog.Close>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  </div>;
}

export function BehaviorComparison({ data, buildId }: { data: WorkspaceData; buildId: string }) {
  const runtime = useMemo(() => createFluidRuntime({
    flow: createWorkspaceFlow(data), effectSettings: DEFAULT_EFFECT_SETTINGS,
    collectionOrder: (snapshot, _id, language) => workspaceCollectionOrder(data, snapshot, language),
    projections: { workspace: (snapshot, viewport, settings, language, context) => workspaceScene(data, snapshot, viewport, settings, language, context) },
  }), [data]);
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  const [library, setLibrary] = useState<Library>('ui-sdk');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [metrics, setMetrics] = useState<SurfaceMetrics | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [error, setError] = useState('');
  const sequence = useRef(0);
  const lifetime = useRef<{ runtime: typeof runtime; token: symbol } | null>(null);
  useEffect(() => {
    const token = Symbol(); lifetime.current = { runtime, token };
    return () => { queueMicrotask(() => { if (lifetime.current?.runtime !== runtime || lifetime.current.token === token) runtime.dispose(); }); };
  }, [runtime]);

  function observe(event: string, reason: string, before: number, accepted: boolean) {
    const entry: Observation = { id: ++sequence.current, library, event, reason, before, after: runtime.getSnapshot().revision, accepted };
    setObservations(previous => [entry, ...previous].slice(0, 12));
  }
  function request(event: string, reason: ChangeReason) {
    const before = runtime.getSnapshot().revision;
    const result = runtime.send(event, {}, 'user', reason);
    setError(result.accepted ? '' : result.reason);
    observe(event, result.accepted ? `${reason} · vom Core übernommen` : result.reason, before, result.accepted);
    return result.accepted;
  }
  function changeView(value: unknown, reason: ChangeReason = 'programmatic') {
    if (typeof value !== 'string' || !VIEWS.some(view => view.value === value)) return false;
    if (runtime.getSnapshot().state === value) return true;
    if (value === 'detail') {
      const selected = runtime.getSnapshot().fields.selected;
      return typeof selected === 'string' && data.modules.some(module => module.id === selected) ? request(`select.${selected}`, reason) : false;
    }
    return request(`view.${value}`, reason);
  }
  function changeGroup(value: unknown, reason: ChangeReason = 'programmatic') {
    if (typeof value !== 'string' || !GROUPS.some(group => group.value === value)) return false;
    if (runtime.getSnapshot().fields.group === value) return true;
    return request(`filter.${value}`, reason);
  }
  const rows = workspaceRows(data, snapshot, runtime.getLocale());
  return <FluidProvider runtime={runtime}><main className={styles.page}>
    <header className={styles.heading}><p className={styles.eyebrow}>M8 · KOMPONENTENVERHALTEN</p><h1>Zwei Bibliotheken.<br />Eine Arbeitsfläche.</h1><p>Ansicht wählen, Module filtern und ihren Kontext prüfen. Die Steuerung wechselt. Daten, Fachzustand und GPU-Vorschau bleiben dieselben.</p></header>
    <div className={styles.layout}>
      <section className={styles.controlCard} aria-labelledby="behavior-control-heading">
        <div className={styles.cardHeading}><span className={styles.step}>01</span><h2 id="behavior-control-heading">Steuerung vergleichen</h2></div>
        <div className={styles.libraryPicker} role="group" aria-label="Komponentenbibliothek">
          {(['ui-sdk', 'base-ui'] as const).map(value => <Button key={value} type="button" aria-pressed={library === value} disabled={dialogOpen} onClick={() => {
            if (library === value) return;
            observe('adapter.change', `Wechsel zu ${value}; Fachzustand unverändert`, runtime.getSnapshot().revision, true);
            setLibrary(value);
          }}>{value === 'ui-sdk' ? 'UI SDK' : 'Base UI'}<small>{value === 'ui-sdk' ? '0.1.0-beta.13' : '1.9.0'}</small></Button>)}
        </div>
        <BehaviorControls library={library} snapshot={snapshot} data={data} changeView={changeView} changeGroup={changeGroup} dialogOpen={dialogOpen} onDialogOpenChange={(open, reason) => {
          setDialogOpen(open); observe(open ? 'inspector.open' : 'inspector.close', reason, runtime.getSnapshot().revision, true);
        }} />
        <p className={styles.keyboardHint}>Tabs: Pfeiltasten. Auswahl: Pfeile und Eingabe. Dialog: Escape und Rückkehr zum Auslöser.</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className={styles.snapshot} data-runtime-revision={snapshot.revision} data-runtime-view={snapshot.state} data-runtime-group={String(snapshot.fields.group)}>
          <p className={styles.eyebrow}>GEMEINSAMER CORE</p><strong>{snapshot.state} <span>· r{snapshot.revision}</span></strong><p>{rows.length} von {data.modules.length} Modulen · {String(snapshot.fields.group)}</p>
        </div>
      </section>
      <section className={styles.preview} aria-label="Gemeinsame GPU-Arbeitsfläche">
        <div className={styles.previewHeading}><div><span className={styles.statusDot} data-ready={Boolean(metrics)} /><strong>{metrics ? metrics.backend === 'webgpu' ? 'WebGPU aktiv' : 'WebGL2 aktiv' : 'GPU wird initialisiert'}</strong></div><span>Eine Surface · Live-Import</span></div>
        {metrics?.fallbackReason && <p className={styles.fallback} role="status">{metrics.fallbackReason}</p>}
        <WorkspaceSurface data={data} moduleCount={data.modules.length} onMetrics={setMetrics} backendMode="webgpu-first" />
      </section>
    </div>
    <section className={styles.review} aria-labelledby="behavior-review-heading">
      <div className={styles.cardHeading}><span className={styles.step}>02</span><h2 id="behavior-review-heading">Was der Vergleich zeigt</h2></div>
      <div className={styles.reviewGrid}>
        <div><h3>In diesem Lauf beobachtet</h3>{observations.length ? <ol className={styles.events}>{observations.map(entry => <li key={entry.id}><div><code>{entry.event}</code><span>{entry.library} · r{entry.before} → r{entry.after}</span></div><p>{entry.accepted ? '' : 'Abgewiesen: '}{entry.reason}</p></li>)}</ol> : <p>Wähle eine Ansicht, eine Ebene oder öffne den Inspector. Hier erscheinen die tatsächlichen Requests und ihre Core-Revisionen.</p>}</div>
        <div><h3>Getrennt zu qualifizieren</h3><ul className={styles.checklist}><li>Native Tastaturbedienung, Escape und Fokusrückgabe auf beiden Adaptern.</li><li>Screenreader, Mobilgeräte und weitere Browserprofile.</li><li>Bundle-Delta und Echtzeitmessung unter identischen Bedingungen.</li></ul><p>Das Protokoll belegt einzelne Interaktionen. Es bewertet keine Bibliothek automatisch als besser und ersetzt keine Conformance-Abnahme.</p></div>
      </div>
    </section>
    <footer className={styles.footer}><span>{data.source} · {data.capturedAt}</span><span>Build {buildId} · keine AI-Anfrage</span></footer>
  </main></FluidProvider>;
}
