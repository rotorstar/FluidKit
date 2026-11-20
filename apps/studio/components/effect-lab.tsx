'use client';
import { useId, useState, useSyncExternalStore } from 'react';
import { useStudioLocale, useStudioMessages } from './studio-locale';
import { Button } from '@base-ui/react/button';
import { StudioInput, StudioSelect } from './studio-controls';
import { EFFECT_LIBRARY, effectReference } from '@fluidkit/effects';
import { LOCALE_NAMES } from '@fluidkit/i18n';
import { RestagedRecordingSchema, EffectSettingsSchema, type EffectSettings } from '@fluidkit/contracts';
import type { FluidRuntime } from '@fluidkit/core';
import type { SurfaceMetrics, SurfacePlaybackControls } from '@fluidkit/webgpu';

const descriptionKeys: Partial<Record<string, 'fluidMorph' | 'springReflow' | 'rippleReveal' | 'silkCascade' | 'liquidLens' | 'particleWeave'>> = {
  'fluid-morph': 'fluidMorph', 'spring-reflow': 'springReflow', 'ripple-reveal': 'rippleReveal',
  'silk-cascade': 'silkCascade', 'liquid-lens': 'liquidLens', 'particle-weave': 'particleWeave',
};

export function EffectLab({ runtime, metrics, controls, onPreview }: {
  runtime: FluidRuntime; metrics: SurfaceMetrics | null;
  controls: SurfacePlaybackControls | null; onPreview: () => void;
}) {
  const {locale} = useStudioLocale(), t = useStudioMessages();
  const inputId = useId();
  const visual = useSyncExternalStore(runtime.subscribeVisual, runtime.getVisualState, runtime.getVisualState);
  const { settings, current } = visual;
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  function configure(patch: Partial<EffectSettings>) {
    try { runtime.configureEffects(EffectSettingsSchema.parse({ ...settings, ...patch })); setMessage(''); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Ungültige Effekt-Einstellung'); }
  }
  const selected = settings.mode === 'case' ? settings.caseRules[runtime.flow.id]?.effect?.id ?? settings.effect.id : settings.effect.id;
  const selectedDefinition = EFFECT_LIBRARY.find(effect => effect.id === selected);
  const caseRule = settings.mode === 'case' ? settings.caseRules[runtime.flow.id] : undefined;
  const parameters = { ...settings.parameters, ...caseRule?.parameters };
  const frequencyLabel = t(settings.mode === 'random' ? 'parameter' : selected === 'silk-cascade' ? 'stagger' : selected === 'liquid-lens' ? 'lensFrequency' : selected === 'particle-weave' ? 'weaveFrequency' : 'frequency');
  function updateParameters(next: EffectSettings['parameters']) {
    if (settings.mode === 'case' && caseRule?.mode === 'fixed') configure({ caseRules: { ...settings.caseRules, [runtime.flow.id]: { ...caseRule, parameters: next } } });
    else configure({ parameters: next });
  }
  function applyPreset() {
    if (!selectedDefinition) return;
    updateParameters(selectedDefinition.recommendedParameters);
  }
  function choose(id: string) {
    const definition = EFFECT_LIBRARY.find(effect => effect.id === id);
    if (!definition) return;
    const effect = effectReference(definition);
    const result=runtime.send('visual.command',{command:{type:'effect.select',effect}},'user','pointer');
    setMessage(result.accepted?'':result.reason);
  }
  function download(value: unknown, name: string) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
    const link = document.createElement('a'); link.href=url; link.download=name; link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function exportRestaged() {
    try {
      const result = await controls?.getRestagedRecording?.(locale);
      if (!result) { setMessage(t('noRestage')); return; }
      download(result, `fluid-effect-${result.recording.caseId}-${locale}.json`);
      setMessage(t('restaged'));
    } catch (error) { setMessage(error instanceof Error ? error.message : t('noRestage')); }
  }
  function exportRecording() {
    const recording = controls?.getRecording();
    if (!recording) { setMessage('Zuerst einen Übergang ausführen.'); return; }
    download(recording, `fluid-effect-${recording.caseId}.json`);
    setMessage('Versionierter visueller Run exportiert. Sensible Felder sind redigiert.');
  }
  async function verify() {
    if (!controls) return;
    setBusy(true);
    try { const result = await controls.verifyKernels(); setMessage(`GPU-Prüfung bestanden: ${result.samples} Panel- und ${result.lens.samples} Linsenpunkte. Abweichung ${result.maxAbsoluteError.toExponential(2)} / ${result.lens.maxAbsoluteError.toExponential(2)} (Toleranz ${result.tolerance} / ${result.lens.tolerance}).`); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'GPU-Prüfung fehlgeschlagen'); }
    finally { setBusy(false); }
  }
  return <section className="effect-lab" aria-label={t('effectLibrary')}>
    <div className="effect-heading"><div><span className="eyebrow">TRANSITION DESIGN / LIVE RUNTIME</span><h2>{t('effectQuestion')}</h2><p>{t('effectIntro')}</p></div><Button className="play-button" disabled={!controls} onClick={onPreview}>{t('previewEffect')}</Button></div>
    <div className="effect-presets">{EFFECT_LIBRARY.map(effect => <Button key={effect.id} className={`effect-preset ${selected === effect.id ? 'chosen' : ''}`} aria-pressed={selected === effect.id} onClick={() => choose(effect.id)}><span className="effect-category">{t(effect.style).toLocaleUpperCase(locale)}</span><strong>{effect.title}</strong><span>{descriptionKeys[effect.id] ? t(descriptionKeys[effect.id]!) : effect.description}</span><small>{effect.engine === 'typegpu' ? 'TypeGPU' : t('deterministic')} · v{effect.version}</small></Button>)}</div>
    <div className="effect-preset-action"><p>{t('presetDetails', { name: selectedDefinition?.title ?? selected })}</p><Button className="outline-button" disabled={!selectedDefinition || settings.mode === 'random'} onClick={applyPreset}>{t('usePreset')}</Button></div>
    <div className="effect-settings">
      <label>{t('motion')}<StudioSelect aria-label={t('motionPref')} value={settings.motionPreference} onChange={event => { const value = event.target.value; if (value === 'system' || value === 'reduced') configure({ motionPreference: value }); }}><option value="system">{t('systemPref')}</option><option value="reduced">{t('reduceMotion')}</option></StudioSelect><small>{t('respectMotion')}</small></label>
      <label>{t('effectChoice')}<StudioSelect aria-label={t('effectChoice')} value={settings.mode} onChange={event => { const mode = event.target.value; if (mode === 'off' || mode === 'fixed' || mode === 'random' || mode === 'case') configure({ mode, enabled: mode !== 'off' }); }}><option value="off">{t('modeOff')}</option><option value="fixed">{t('modeFix')}</option><option value="random">{t('modeRandom')}</option><option value="case">{t('modeCase')}</option></StudioSelect></label>
      <label htmlFor={`${inputId}-duration`}>{t('durationLabel')} <output>{parameters.durationMs} ms</output><StudioInput id={`${inputId}-duration`} aria-label={t('effectDuration')} type="range" min="200" max="3000" step="50" value={parameters.durationMs} onChange={event => updateParameters({ ...parameters, durationMs: Number(event.target.value) })}/></label>
      <label htmlFor={`${inputId}-intensity`}>{t('intensityLabel')} <output>{Math.round(parameters.intensity * 100)} %</output><StudioInput id={`${inputId}-intensity`} aria-label={t('effectIntensity')} type="range" min="0" max="1" step="0.05" value={parameters.intensity} onChange={event => updateParameters({ ...parameters, intensity: Number(event.target.value) })}/></label>
      <label htmlFor={`${inputId}-frequency`}>{frequencyLabel} <output>{parameters.frequency.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</output><StudioInput id={`${inputId}-frequency`} aria-label={frequencyLabel} type="range" min="0.5" max="6" step="0.5" value={parameters.frequency} onChange={event => updateParameters({ ...parameters, frequency: Number(event.target.value) })}/></label>
      <label htmlFor={`${inputId}-seed`}>{t('runSeed')}<StudioInput id={`${inputId}-seed`} aria-label={t('effectSeed')} type="number" min="0" max="4294967295" value={settings.seed} onChange={event => { const seed = event.currentTarget.valueAsNumber; if (Number.isInteger(seed) && seed >= 0 && seed <= 4294967295) configure({ seed }); }}/></label>
    </div>
    {settings.mode === 'random' && <fieldset className="effect-pool"><legend>{t('effectPool')}</legend>{EFFECT_LIBRARY.map(effect => <label key={effect.id}><StudioInput type="checkbox" checked={settings.pool.some(ref => ref.id === effect.id)} onChange={event => configure({ pool: event.target.checked ? [...settings.pool, effectReference(effect)] : settings.pool.filter(ref => ref.id !== effect.id) })}/>{effect.title}</label>)}</fieldset>}
    {settings.mode === 'case' && <p className="effect-rule">{t('caseRule',{id:runtime.flow.id,selected})}</p>}

    <div className="effect-resolution"><span>{t('resolved')}: <strong>{current?.selected?.id ?? t('basicMotion')}</strong></span><span>{t('policy')}: <code>{current?.policySource ?? 'project'}</code></span><span>{t('seedLabel')}: <code>{current?.seed ?? settings.seed}</code></span><span>Shader: <code>{metrics?.shader ?? 'initialisiert'}</code></span>{current?.fallbackReason && <span>{current.fallbackReason}</span>}</div>
    <div className="effect-utilities"><Button className="surface-info" disabled={!controls || busy || metrics?.backend !== 'webgpu'} onClick={() => { void verify(); }}>{t(busy ? 'checkingGPU' : 'verifyKernel')}</Button><Button className="surface-info" disabled={!metrics?.canReplay} onClick={exportRecording}>{t('exportRun')}</Button><Button className="surface-info" disabled={!metrics?.canReplay || !controls?.getRestagedRecording} onClick={() => { void exportRestaged(); }}>{t('restage')}</Button><label className="recording-import">{t('importRun')}<StudioInput aria-label={t('importScenario')} type="file" accept="application/json,.json" disabled={!controls} onChange={event => { const file = event.currentTarget.files?.[0]; if (!file) return; if (file.size > 2000000) { setMessage('Aufzeichnung überschreitet 2 MB.'); return; } void file.text().then(text => { const input: unknown = JSON.parse(text);
        const envelope = input && typeof input === 'object' && 'kind' in input && input.kind === 'restaged-recording' ? RestagedRecordingSchema.parse(input) : null;
        controls?.importRecording(envelope ? envelope.recording : input); setMessage('Aufzeichnung geladen: schreibgeschützte visuelle Vorschau. „Live“ stellt den aktuellen Zustand dar.'); }).catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Import fehlgeschlagen')); event.currentTarget.value = ''; }}/></label></div>
    {message && <p className="effect-message" role="status">{message}</p>}
  </section>;
}

export function EffectTransport({controls,metrics}:{controls:SurfacePlaybackControls|null;metrics:SurfaceMetrics|null}) {
  const t = useStudioMessages();
  const recipe = EFFECT_LIBRARY.find(effect => effect.id === metrics?.effectId);
  const progress = Math.round((metrics?.progress ?? 1) * 100);
  const phase = !metrics?.canReplay ? t('ready') : metrics.phase === 'paused' ? t('paused', { n: progress })
    : t(progress === 100 ? 'finished' : metrics.effectPhase === 'bridge' ? 'effectPhase' : metrics.effectPhase === 'source' ? 'startPhase' : 'endPhase');
  return <div className="effect-timeline">
    <div className="effect-playback-buttons"><Button className="outline-button" disabled={!controls || !metrics?.canReplay} onClick={() => controls?.replay()}>{t('replay')}</Button>
      <Button className="outline-button" disabled={!controls || !metrics?.canReplay} onClick={() => metrics?.phase === 'paused' ? controls?.play() : controls?.pause()}>{t(metrics?.phase === 'paused' ? 'resume' : 'pause')}</Button>
      <Button className="outline-button" disabled={!controls} onClick={() => controls?.restoreLive()}>{t('live')}</Button></div>
    <span className="effect-run-label">{t('run')} · {recipe?.title ?? t('baseMotion')}</span>
    {controls?.getPresentationMode() === 'replay' && metrics?.recordingLanguage !== undefined && <span className="effect-run-label">{t('originalLanguage',{language:metrics.recordingLanguage ? LOCALE_NAMES[metrics.recordingLanguage] : t('languageUnknown')})}</span>}
    <label>{t('source')} <StudioInput aria-label={t('position')} type="range" min="0" max="100" step="1" disabled={!metrics?.canReplay} value={progress} onPointerDown={event => controls?.seek(event.currentTarget.valueAsNumber / 100)} onInput={event => controls?.seek(event.currentTarget.valueAsNumber / 100)}/> {t('target')}</label>
    <span className="effect-phase">{phase}</span>
  </div>;
}
