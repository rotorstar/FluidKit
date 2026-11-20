# Drei zusätzliche Fluid-Rezepte: Recherche und Architekturentscheidung

Recherche: **3. November 2026**. Bezogen auf den vorhandenen M3-/M6-Unterbau und
den freigegebenen [M7-Plan](../milestones/m7-plan.md). Diese Recherche begründet
die Verfahren; sie ist kein ausgeführter Rendering- oder Leistungsnachweis.

## Aktuelle Basis

Offizielle npm-Metadaten wurden am Recherchedatum mit den Projekt-Pins abgeglichen.
Für M7 ist kein Upgrade vorgesehen.

| Paket | Installierte und abgefragte aktuelle Version | Bedeutung |
|---|---|---|
| three | 0.187.0 | bestehender Renderer und TSL |
| typegpu | 0.12.9 | typisierte Shaderfunktionen |
| @typegpu/three | 0.12.2 | TypeGPU-/TSL-Brücke |
| @typegpu/gl | 0.12.8 | experimenteller GLSL-Teilumfang |
| @typegpu/sdf | 0.12.2 | vorhandene Distanzfeldfunktionen |
| unplugin-typegpu | 0.12.7 | separater Kernel-Build |

Primärmetadaten: [Three](https://registry.npmjs.org/three/latest),
[TypeGPU](https://registry.npmjs.org/typegpu/latest),
[Three-Adapter](https://registry.npmjs.org/@typegpu%2fthree/latest),
[GL-Adapter](https://registry.npmjs.org/@typegpu%2fgl/latest),
[SDF](https://registry.npmjs.org/@typegpu%2fsdf/latest),
[Build-Plugin](https://registry.npmjs.org/unplugin-typegpu/latest).

## Verfahren und Transfer

| Primärquelle / Befund | Entscheidung für Fluid |
|---|---|
| [Three-WebGPU-Anleitung](https://threejs.org/manual/pages/webgpurenderer): eigener TSL-/Node-Pfad statt klassischem EffectComposer | Vorhandene Node-Materialien und einen begrenzten Compositor erweitern; kein zweiter Renderer |
| [TypeGPU-/Three-Integration](https://docs.swmansion.com/TypeGPU/ecosystem/typegpu-three/): typisierte Funktionen, Attribute, Uniforms und Texturzugriff können in TSL eingebunden werden | Analytische Masken, Brechungsfeld und Materialfunktionen verwenden; Uhr und Konfiguration bleiben explizite Inputs |
| [Three RenderTarget](https://threejs.org/docs/pages/RenderTarget.html): separat gerenderte Texturen können nachbearbeitet und ausdrücklich freigegeben werden | Lokale Brechung nur über kontrollierte, vom Surface besessene Targets; keine gleichzeitige Lese-/Schreib-Rückkopplung |
| [Three InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html): gleichartige Geometrien können gemeinsam gezeichnet werden | Begrenzte Fragmente statt eines eigenen Mesh-/Draw-Calls je Partikel |
| [TypeGPU GL](https://docs.swmansion.com/TypeGPU/ecosystem/typegpu-gl/): experimenteller Render-Subset; Compute und Storage Buffer fehlen | Neue Effekte benötigen kein Compute; beide Backends haben eigene Kompilierungs-/Bildnachweise und sichtbare Diagnosen |
| [W3C Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html): nicht notwendige Bewegung abschaltbar machen | Reduced Motion bleibt vorrangig; weder Linse noch Partikel verhindern den gültigen Zielzustand |
| [Heer/Robertson](https://idl.uw.edu/papers/animated-transitions): kontrollierte Studien zu gestaffelten Übergängen in Datengrafiken | Objektidentität, klare Phasen und nachvollziehbare Zuordnung als Gestaltungsgrundlage; kein daraus abgeleiteter gemessener Fluid-Usabilitygewinn |

Die TypeGPU-Three-Dokumentation enthält weiterhin eine pauschale WebGPU-only-
Warnung. Das installierte `@typegpu/three@0.12.2` importiert dagegen `glOptions`,
erkennt WebGL-Builder und enthält GLSL-Erzeugung. Der bereits dokumentierte
[Widerspruch](typegpu.md) bleibt bestehen. Paketcode zeigt technische Machbarkeit,
aber keine automatische Kompatibilität sämtlicher neuer Shader.

## Warum diese drei Rezepte?

**Silk Cascade** nutzt ruhige Staffelung und gruppierte Bewegung. Das passt zur
Neuanordnung derselben Daten und unterscheidet sich vom vorhandenen Federimpuls.
Materialakzente vermitteln Tiefe, ohne interaktive Geometrie perspektivisch zu drehen.

**Liquid Lens** ergänzt echte lokale Hintergrundbrechung. Ein unabhängiger
Darstellungsschritt lässt Glyphtext, Fokus und Eingabe scharf. Vollständige
physikalische Transmission der gesamten UI wäre für den beabsichtigten Übergang
unverhältnismäßig und würde zusätzliche Qualitätsrisiken erzeugen.

**Particle Weave** benutzt Seed und normalisierte Zeit statt fortlaufend integrierter
Physik. Das erlaubt direktes Scrubbing, reproduzierbare Zwischenbilder und
kontrolliertes Zusammensetzen entlang stabiler Komponenten-IDs. Der expressive
Charakter wird bewusst gewählt; er wird nicht in alte Random-Pools eingeschleust.

## Befunde aus dem Quellcode-Audit

- Im Ausgangsstand berechnete der GPU-Dock drei Buttons in einer festen Zeile und verschob
  Inhalte um einen konstanten Betrag. Sechs Rezepte benötigen gemeinsame responsive
  Geometrie für Buttons, Dock und Surfacehöhe.
- Der alte Renderer bewahrt bei Retargeting Node-Geometrie, aber keine vollständige
  Shader-/Partikeldarstellung. Ein flacher Snapshot ersetzt wachsende Effektketten.
- Nach Abschluss entfernte Quellobjekte müssen für rückwärts gerichtetes Scrubbing
  aus einem unveränderlichen Clip rekonstruierbar bleiben.
- Die bestehende achtpunktige SDF-Prüfung validiert keine neue Linse oder Partikelbahn.
- Bisheriges Rehearsal belegt ausgewählte Frames. Vollständige Sequenzabdeckung und
  natürliches Echtzeit-Pacing werden getrennt erhoben.

Die [bewerteten Optionen und AC](../milestones/m7-plan.md) führen jeden Befund bis
zur Abnahme. Renderingqualität, Performance, Zugänglichkeit und Produktwirkung
werden weiterhin anhand ihrer jeweils passenden Nachweise beurteilt.

## Beobachtete Backendgrenzen während M7

Die echte WebGL2-Prüfung von Build `fluid-339a0c4d705d1a307729` zeigte
Shaderkompilierungsfehler in neu eingeführten TypeGPU-/TSL-Funktionen. Unter anderem
mussten Funktionstypisierung und die Übersetzung von Winkel-/Auswahloperationen
anhand des erzeugten GLSL korrigiert werden. Ein TypeScript-/Vite-Build allein
hatte diese Probleme nicht erkannt. Der
originale Fehlerbericht (internes Archiv)
bleibt deshalb ein negativer Backendnachweis des ursprünglichen Builds.

Parallel gezeichnete Glyphen waren kein Beleg dafür, dass sämtliche Panel- und
Effektprogramme funktionierten. Shader- und Device-Validierungsfehler müssen den
Lauf daher vor positiver Frame-/Sequenzabnahme abbrechen. Erst tatsächliche
Kompilation, Originalbilder und erneute Prüfung auf WebGPU **und** WebGL2
qualifizieren eine korrigierte Funktion. Neue Versionspins waren für die
Ursachenbehebung nicht erforderlich.
