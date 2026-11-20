# ADR-0004: TypeGPU qualifizieren und Effekte als eigenen Vertrag modellieren

Datum: 2026-11-01. Status: angenommen; M3-Proof implementiert. Vollständige Produktionsqualifikation offen.
[Nachweise und Grenzen](../milestones/m3.md).

## Beschluss

1. Three.js bleibt Scene-/Renderer-Unterbau. TypeGPU wird für ausgewählte komplexe
   Shader und GPU-Ressourcen nach einem isolierten Qualifikationsgate eingesetzt.
2. Neue Kernels werden als separat gebautes Paket in Next eingebunden. Ein Gerät,
   ein Scheduler und klare Ressourcenbesitzer bleiben verbindlich.
3. Zod definiert Produkt-/Ereignisverträge; TypeGPU-Schemas definieren GPU-Speicher
   und Shader-Schnittstellen. Core und Studio-Dokumente hängen nicht von GPU-Objekten ab.
4. Fachlicher Commit und visuelle Sequenz sind getrennt. Effekte erzeugen keine
   künstlichen fachlichen Zwischenzustände.
5. Effektwahl: aus, fest, seeded-random oder je Case. Auflösung: explizite
   Transition-Regel → Case-Regel → Projektstandard. Die gewählte Quelle ist sichtbar.
6. Die Effekt-Library enthält versionierte Rezepte mit Parametern, Fähigkeiten,
   Kostenbudget und Reduced-Motion-/Fallback-Verhalten. Ein Random-Pool enthält nur
   für Quelle, Ziel, Inhalt und Backend qualifizierte Rezepte.
7. Der Trace speichert die tatsächliche Auswahl einschließlich Seed und Version.
   Replay wählt nicht neu. Eine spätere Library-Änderung verändert alte Runs nicht.
8. Marketplace bleibt RP8. Erste Effektpakete sind kuratiert und lokale Build-
   Abhängigkeiten; Projektdateien laden keinen beliebigen Shader-/Remote-Code.

## Konsistenzauflösung

| Frage | Entscheidung |
|---|---|
| Gewünschte Sequenz Quelle → Effekt → Ziel versus atomarer Core | Sequenz ist Präsentation; Ziel-Snapshot ist bereits gültig committed |
| Zufall versus deterministische Szenarien | Einmalige Seed-/Rezeptauflösung im ResolvedEffectPlan |
| Globaler Effekt versus je Case | Explizite Priorität und sichtbare Herkunft; kein implizites Überschreiben |
| WebGL2-Fallback versus TypeGPU-Compute | Compute ist optional; CPU/TSL-Pfad und Capability-Gate sind vorgeschrieben |
| Dokumentation versus veröffentlichtes Three-Adapterpaket | 0.12.2 besitzt GLSL-Pfad; eigene Backend-Abnahme bleibt Pflicht |
| Zusätzliche TypeGPU-React-Loop | Vorhandenen zentralen Surface-Scheduler verwenden |
| Next/Turbopack versus Shader-Build-Plugin | Separat getesteter Vite-Library-Build; Next konsumiert erzeugtes JS |
| ESLint 10 versus Plugin-Peer ^9 | Kein erzwungener Peer-Override, Tooling-Gate dokumentieren |
| Glyph-TSL versus experimenteller TypeGPU-Textpfad | Bewährten TSL-Textpfad behalten; Alternative isoliert vergleichen |

## Gates für T47–T49

- Clean Install und strikter Build ohne Peer-Overrides oder TypeScript-Fork.
- Shape-Kernel mit unabhängigen Geometrie-Invarianten; CPU/GPU-Abweichung in
  begründeter absoluter/relativer f32-Toleranz, keine Behauptung bitgleicher Pixel.
- Three-Einbindung über öffentliche Adapter, einschließlich Text und WebGL2-Subset.
- Keine zweite GPUDevice-Anforderung oder RAF-Schleife.
- Quelle/Ziel und Inhalt bleiben über Unterbrechung, Device Loss und Replay erhalten.
- Fixed-, Random- und Case-Regeln einschließlich leerem/inkompatiblem Pool geprüft.
- Reduced Motion und Nutzerabschaltung erhalten die vollständige Funktion.
- Studio zeigt Bibliothek, Parameter, Dauer, Seed, Herkunft und aufgelösten Fallback;
  Vorschau und Runtime verwenden denselben ResolvedEffectPlan. Die Showcase-
  Effektleiste wird ebenfalls mit GPU gezeichnet und verwendet dieselbe Policy.
- Zusätzlicher Produktionsaufwand benötigt gemessenen Nutzen beziehungsweise einen
  ausdrücklich gewünschten visuellen Effekt. Geschwindigkeitsgewinne sind offen.

[Recherche](../research/typegpu.md), [bewertete Optionen](typegpu-scores.json),
[aktualisierter Gesamtplan](../implementation-plan.md).
