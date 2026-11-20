# Recherche für M2 und RP1-Fortsetzung

Datum: 2026-11-01. Bestehende kompatible Paketversionen bleiben erhalten.

- Sortierbare Datentabelle: Header enthalten Buttons; aria-sort gehört zur aktiven
  Spalte. Tabellen mit einzelnen Bedienelementen sind kein Spreadsheet-Grid.
  Die Brücke verwendet native table/tbody/tr/th/td-Elemente. Eine eigene
  Screenreader-Matrix bleibt notwendig.
  [WAI-Beispiel](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/),
  [Table Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/).
- Three.js r187 unterstützt WebGPU-first und WebGL2. Nach der ausdrücklichen
  Nutzerkorrektur wird dieses Verhalten zugelassen und transparent angezeigt.
  Die Meldung folgt dem tatsächlich initialisierten Backend, nicht der Präferenz.
  [Three.js](https://threejs.org/docs/pages/WebGPURenderer.html).
- Der installierte WebGPUBackend ignoriert in seinem Callback absichtliche
  device.destroy()-Verluste. Die Surface besitzt ihr GPUDevice selbst und
  beobachtet zusätzlich dessen lost-Promise. Unmount setzt den Disposal-Zustand
  vor destroy; echte Verluste im Mount lösen begrenzte Recovery aus.
  [r187-Quelle](https://github.com/mrdoob/three.js/blob/r187/src/renderers/webgpu/WebGPUBackend.js).
- Mermaid 12.2.0 bietet parse für Syntaxprüfung. Der Parser verwendet DOMPurify
  auch ohne Bildrendering; jsdom 30.1.3 stellt ausschließlich im isolierten
  Doku-CLI die DOM-Umgebung bereit. Beide sind exakt fixierte Entwicklungswerkzeuge.
  Die vorhandene Node-24.18.1-Version erfüllt ihre Engine-Verträge. Tooling-Recherche
  erfolgte am 1. November, ohne die ursprüngliche Oktober-Produktbasis umzudatieren.
  [Mermaid API](https://mermaid.js.org/config/usage.html),
  [Mermaid-Metadaten](https://registry.npmjs.org/mermaid/12.2.0),
  [jsdom-Metadaten](https://registry.npmjs.org/jsdom/30.1.3).

Die gewichteten Alternativen für M2 und Backend-Policy sind reproduzierbar in
[showcase-scores.json](../decisions/showcase-scores.json). Keine Performance- oder
Conversion-Behauptung wird aus diesen Planungsbewertungen abgeleitet.
