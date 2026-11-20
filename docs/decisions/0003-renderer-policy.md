# ADR-0003: WebGPU bevorzugen, WebGL2 transparent zulassen

Datum: 2026-11-01. Ersetzt die frühere strikte Backend-Grenze auf ausdrücklichen
Nutzerwunsch: Three.js-Fallback ist akzeptabel, WebGPU bleibt Default und muss
als tatsächliches Backend erkennbar sein.

- Standard `webgpu-first`: API/Adapter/Gerät anfordern, dann Three.js initialisieren.
- Ohne WebGPU ist WebGL2 zulässig. Keine sichtbare HTML-Ersatzimplementierung.
- `webgpu-only` bleibt als Host-/Diagnoseoption möglich.
- `webgl2` ist ein ausdrücklich gewählter Diagnosemodus, kein neuer Default.
- Backend-Metrik und Badge stammen vom initialisierten Renderer, nicht von
  Browsernamen, Konfiguration oder bloßer Existenz von navigator.gpu.
- Der Fallback wird mit Grund angezeigt. Text und Interaktion müssen auf jedem
  Backend geprüft werden; ein leeres Canvas ist keine erfolgreiche Qualifikation.
- Laufender Backendwechsel ersetzt die Surface, erhält aber den Domain-Snapshot.

[Three.js-Dokumentation](https://threejs.org/docs/pages/WebGPURenderer.html),
[geprüfte r187-Implementierung](https://github.com/mrdoob/three.js/blob/r187/src/renderers/webgpu/WebGPURenderer.js).
Die vorhandenen kompatiblen Versionen werden beibehalten. Bewertung: T46 im Plan.
