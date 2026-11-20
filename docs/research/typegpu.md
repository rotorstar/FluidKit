# TypeGPU für FluidKit Pro

Recherche: 1. November 2026. Veröffentlichungen bis 31. Oktober 2026 wurden anhand
von npm-Paketmetadaten und offiziellen Quellen geprüft. Ergebnis: TypeGPU ist für
komplexe Shader und typisierte GPU-Ressourcen sinnvoll. Gewählt wird eine
schrittweise Integration in den vorhandenen Three.js-/TSL-Pfad mit einem
verbindlichen Qualifikationsgate, kein sofortiger vollständiger Renderer-Neubau.

## Nutzen für unser Produkt

TypeGPU erlaubt typisierte GPU-Datenschemas sowie Shader in einer unterstützten
Teilmenge von TypeScript. Geeignete Funktionen können auch auf der CPU ausgeführt
werden. Das unterstützt nachvollziehbare Tests für SDF-Geometrie, Morphing und
numerische Hilfsfunktionen. Es garantiert weder bessere Frameraten noch visuelle
Qualität; diese müssen am eigenen Szenario gemessen werden.
[Überblick](https://docs.swmansion.com/TypeGPU/),
[Getting Started](https://docs.swmansion.com/TypeGPU/getting-started/).

`@typegpu/sdf` liefert Formeln und Kompositionshilfen für shaderseitige
Distanzfelder. Das passt zu optionalen Zusatzeffekten wie weichem Verschmelzen,
Form-Morphing, Masken und Konturen. Layout, Inhalt, Tabellenlogik und Semantik bleiben
Aufgaben unseres Komponentenmodells. Eine Effekt-Library entsteht erst durch
unsere versionierten Rezepte und deren Abnahme.
[SDF](https://docs.swmansion.com/TypeGPU/ecosystem/typegpu-sdf/).

Über `@typegpu/three` können ausgewählte TypeGPU-Funktionen als TSL-Nodes in die
bestehenden Materialien eingebunden werden. Das erlaubt ein schrittweises Vorgehen
mit Three als Scene-/Renderer-Unterbau. Standard-Widgets benötigen deshalb keinen
neuen Grafik-Unterbau.
[Three-Integration](https://docs.swmansion.com/TypeGPU/ecosystem/typegpu-three/).

## Wichtiger Dokumentationswiderspruch beim Fallback

Die Three-Integrationsseite enthält noch eine pauschale WebGPU-only-Warnung.
Das **veröffentlichte Paket @typegpu/three 0.12.2** importiert dagegen
`@typegpu/gl`, erkennt WebGL-Builder und verwendet `glOptions()` für GLSL-Erzeugung.
Der offizielle npm-Tarball wurde gelesen und seine SHA-512-Integrität verifiziert.
Damit ist die pauschale Warnung für diese Version zu weitgehend. Dies beweist
jedoch noch keine funktionierende Fluid-Integration auf beiden Backends.
[Dokumentation](https://docs.swmansion.com/TypeGPU/ecosystem/typegpu-three/),
[veröffentlichte Paketmetadaten](https://registry.npmjs.org/@typegpu%2fthree/0.12.2).

`@typegpu/gl` ist ausdrücklich experimentell und bietet nur einen Teil der Render-
APIs. Compute, Storage Buffers und Bind Groups sind dort nicht allgemein verfügbar.
Deshalb bekommt jedes Effekt-Rezept Capability-Anforderungen und einen definierten
Fallback. Ein CPU- oder einfacher TSL-Pfad hält Kerninteraktionen bedienbar.
[WebGL-Grenzen](https://docs.swmansion.com/TypeGPU/ecosystem/typegpu-gl/).

## Konkreter Kompatibilitätsstand

| Baustein | Geprüfte Version / Vertrag | Entscheidung |
|---|---|---|
| typegpu | 0.12.9, veröffentlicht 23.10.2026, MIT | Kandidat für T47; noch nicht als Projektabhängigkeit installiert |
| @typegpu/three | 0.12.2, 16.10.2026; typegpu ^0.12.8 und @typegpu/gl ^0.12.7 | Kandidat für Shader-Brücke |
| @typegpu/gl | 0.12.8, 23.10.2026; typegpu 0.12.9 | Experimenteller Render-Subset, getrennt qualifizieren |
| @typegpu/sdf | 0.12.2; typegpu ^0.12.8 | Kandidat für Effekt-Kernels |
| unplugin-typegpu | 0.12.7; typegpu ^0.12.9 | Vite-/Rollup-Library-Build bevorzugen |
| eslint-plugin-typegpu | 0.12.1; ESLint ^9 | Nicht in ESLint 10 erzwingen; kein Peer-Override |
| @typegpu/react | 0.12.3; React ^19 und typegpu ^0.12.9 | Vorerst unnötig; ein vorhandener Surface-Scheduler bleibt zuständig |
| Glyph | installierte 0.1.0 | Enthält optionale TypeGPU-Peers und öffentliche Adapter; TypeGPU-Three-Konfiguration ist als experimentell markiert |
| Three / React / TS | 0.187.0 / 19.2.9 / 6.0.3 | Bestehende kompatible Basis beibehalten |

Die installierten Glyph-Paketmetadaten und Type-Deklarationen belegen die Adapter;
aktiv verwendet der aktuelle Showcase weiterhin Glyphs TSL-Konfiguration.
[Glyph-Metadaten](https://registry.npmjs.org/@pmndrs%2fglyph/0.1.0),
[TypGPU-Kandidat](https://registry.npmjs.org/typegpu/0.12.9),
[GL-Kandidat](https://registry.npmjs.org/@typegpu%2fgl/0.12.8).

## Build und Ressourcen

Die offiziellen Build-Plugins unterstützen unter anderem Vite/Rollup, diese Pfade
werden aktiv getestet. Eine fertige Turbopack-Integration ist dort nicht belegt.
Shader-Kernels werden deshalb im Qualifikationspaket mit dem vorhandenen Vite
separat gebaut; Next konsumiert das erzeugte JavaScript. Normale TypeScript-
Syntax und explizite `std`-Vektoroperationen vermeiden eine zusätzliche
Operator-Overloading-Toolchain. Der isolierte Clean Build ist ein hartes Gate.
[Build Plugin](https://docs.swmansion.com/TypeGPU/tooling/unplugin-typegpu/),
[Lint Plugin](https://docs.swmansion.com/TypeGPU/tooling/eslint-plugin-typegpu/).

TypeGPU kann das von Fluid besessene Gerät über `tgpu.initFromDevice` verwenden.
Es wird kein zweites Gerät oder eine zweite Frame-Schleife eingeführt.
`root.destroy()` räumt bei einem geliehenen Gerät nicht automatisch alle
anwendungseigenen Buffer/Textures ab. Deshalb erhalten Ressourcen explizite Besitzer
und werden bei Disposal und Device Loss gemeinsam neu erzeugt.
[Interoperabilität](https://docs.swmansion.com/TypeGPU/integration/webgpu-interoperability/),
[Root-Lebenszyklus](https://docs.swmansion.com/TypeGPU/apis/roots/).

## Effektmodell aus der Nutzerpräzisierung

Die visuelle Sequenz lautet **aktuelles Bild → optionaler Zusatzeffekt → Zielbild**.
Der fachliche Zustand wird weiterhin atomar committed. Ein Effekt erzeugt keine
zusätzlichen fachlichen Zwischenzustände und führt keine externen Aktionen aus.

| Auswahl | Verhalten |
|---|---|
| Ohne Zusatz | Definierte Basisbewegung beziehungsweise Reduced-Motion-Pfad |
| Fest | Ein bestimmtes versioniertes Rezept für jeden passenden Übergang |
| Seeded Random | Auswahl aus einer kompatiblen Allowlist, mit aufgezeichnetem Seed |
| Je Case | Case-Regel wählt Rezept/Pool; Transition kann ausdrücklich überschreiben |

Die Auflösung erfolgt einmal je Transition. Effekt-ID, Version, Seed, Parameter,
Quell-/Zielrevision und eventueller Capability-Fallback werden im Trace gespeichert.
Replay verwendet diese Auflösung und würfelt nicht neu. Zufälligkeit steuert die
Darstellung, nicht Nutzerdaten, Autorisierung oder fachliche Outcomes.

## Gewählter nächster Schritt

T47 qualifiziert TypeGPU an einer kleinen Shape-/SDF-Funktion und der Integration
in Three/Glyph, einschließlich WebGL2-Grenzen, Lifecycle und reproduzierbarer Builds.
T48 definiert davon unabhängige Effekt-/Policy-Verträge. T49 bringt die kuratierte
Effekt-Library, Vorschau und Case-Regeln ins Studio. Danach werden ausgewählte neue
komplexe Kernels bevorzugt mit TypeGPU entwickelt, sofern die Gates bestanden sind.
Bestehende einfache TSL-Primitives und die sortierbare Tabelle bleiben nutzbar.

Status: Recherche und Plananpassung; noch kein TypeGPU-Performance- oder GPU-
Integrationsnachweis für Fluid. Die weitere Anwendungsausweitung wurde für diese
Architekturprüfung auf Nutzerwunsch unterbrochen.
