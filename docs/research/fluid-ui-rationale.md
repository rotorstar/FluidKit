# Warum eine fließende, GPU-gezeichnete Arbeitsoberfläche?

Recherche: **2. November 2026**. Produktbezug: FluidKit Pro Alpha 0.2.0.
Installiert: Three.js 0.187.0. Keine Abhängigkeit wurde für diese Textarbeit
aktualisiert. Aktuelle Primärquellen und vorhandene Verträge wurden gemeinsam
geprüft. Die Grundlagenforschung zur Wahrnehmung ist älter und wird als solche
benannt; sie bleibt relevant, ohne eine eigene FluidKit-Nutzerstudie zu ersetzen.
Der offizielle [npm-`latest`-Tag](https://registry.npmjs.org/three/latest) zeigt zum
Recherchezeitpunkt ebenfalls Three.js 0.187.0; daraus entsteht kein Upgradeauftrag.

## Ergebnis und gewählte Positionierung

Der produktive Kern ist eine **aufgabengerechte Oberfläche mit erhaltenem Kontext**.
Tabelle, Karten, Graph und Detail sind Perspektiven auf dieselben Objekte. Die
grafische Umsetzung erlaubt, ihre Beziehungen über einen Wechsel hinweg sichtbar
zu machen. WebGPU bietet dafür zusätzliche Render-/Compute-Möglichkeiten.

Das Nutzungsmodell funktioniert grundsätzlich auch mit anderen Renderern. Sein
Wert entsteht aus Identitäten, Informationsarchitektur, Kontrolle und gutem Timing.
Eine eigene GPU-Szene ist besonders interessant, wenn solche Ansichten eng mit
komplexer Grafik, gemeinsam choreografierter Bewegung oder Simulation verbunden sind.
Für FluidKit ist diese Eignung eine begründete Architekturentscheidung; eine
allgemeine Überlegenheit gegenüber DOM-UIs wurde nicht gemessen.

Die bewerteten Alternativen und dokumentationsbezogenen AC stehen im
[Umsetzungsplan](../milestones/ui-rationale-plan.md). Gewählt wurde die Kombination
aus Usability-Begründung, technischen Hebeln, konstruktiven Grenzen und klar
markierten Zukunftsoptionen (97/100 Planungsbewertung).

## Usability: Evidenz und Übertragung auf FluidKit

| Prinzip | Primärbeleg | Unsere Ableitung und Grenze |
|---|---|---|
| Objektkontinuität | [Bostock: Object Constancy, 2012](https://bost.ocks.org/mike/constancy/) erläutert, wie stabile Datenzuordnung das Verfolgen beim Filtern und Umsortieren unterstützt. | Ein Modul behält ID und Auswahl durch Tabelle/Karten/Map/Detail. Das Design soll unnötiges erneutes Suchen reduzieren. Kein eigener gemessener Zeitgewinn. |
| Verständliche Übergänge | [Heer/Robertson, 2007](https://idl.uw.edu/papers/animated-transitions) berichten zwei kontrollierte Experimente zu statistischen Grafiken; geeignete Übergänge verbesserten darin die grafische Wahrnehmung. | Bewegung kann Herkunft, Ziel und Änderung erklären. Das Studienergebnis gilt nicht pauschal für Formulare, alle Effekte oder sämtliche Nutzer. |
| Dosierte Komplexität | [Nielsen: Progressive Disclosure, 2006](https://www.nngroup.com/articles/progressive-disclosure/) beschreibt das zugängliche Anordnen häufiger und zusätzlicher Funktionen. | Übersicht und Details passend entfalten. Häufig benötigte Funktionen bleiben direkt erreichbar; zu viele Offenlegungsstufen wären ein neues Hindernis. |
| Passende Arbeitsansicht | Produkt-/Designableitung aus den genannten Prinzipien. | Tabelle für Wertevergleich, Karten für visuelle Auswahl, Graph für Beziehungen. Nutzen hängt von Aufgabe und Daten ab; mehr Ansichten allein erhöhen die Qualität nicht. |
| Kontrollierte Assistenz | Bestehender Core-/DecisionPlan-Vertrag, kein neuer externer Wirksamkeitsbeleg. | AI darf Ansichten vorschlagen; Guards, aktiver Fokus und explizite Nutzeraktionen behalten Vorrang. Produktives Intent-Ranking bleibt offen. |
| Zugängliche Bewegung | [W3C zu SC 2.3.3, Level AAA](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html): nichtessenzielle interaktionsausgelöste Bewegung abschaltbar machen. | Reduced Motion, Effekt-Aus und Unterbrechbarkeit schützen Wahlfreiheit. Kein WCAG-Konformitätsclaim allein durch einen Schalter. |

Damit sind **bessere Orientierung, leichteres Wiedererkennen und verständlichere
Änderungen** die tragfähigsten Nutzenargumente. Kürzere Bearbeitungszeiten, geringere
Fehlerraten, schnelleres Lernen und höhere Zufriedenheit sind plausible, getrennt
zu evaluierende Produktziele. Conversion, Engagement und Neuartigkeit ersetzen
keinen erfolgreichen Arbeitsablauf.

## Geeignete Aufgaben

| Aufgabe | Mögliche Fluid-Erfahrung | Stand / notwendiger Nachweis |
|---|---|---|
| Abhängigkeiten analysieren | Bestand sortieren, dieselbe Auswahl als Graph untersuchen, Moduldetail öffnen | Workspace-Ansichten vorhanden; Verständnis und Wiederfindezeit mit Nutzern prüfen |
| Angebote vergleichen | Von visueller Vorauswahl zum strukturierten Wertevergleich wechseln | synthetische Cases vorhanden; echte Anbieteradapter und aufgabenspezifische Journeys offen |
| Planung und Design | Objekt bearbeiten und Auswirkungen in einer verbundenen Vorschau verfolgen | langfristige Einsatzrichtung; kein fertiger universeller Editor |
| Geführte Einführung | Eine kurze Story erklärt Ursache, Wechsel und Ergebnis; Nutzer übernimmt | erster Rehearsal-Proof; kontinuierliche Bewegungs-/Pacing-Abnahme offen |
| Räumliche Produkte erkunden | Datenansicht, 3D-Objekt und Bedienelemente in einem visuellen Modell verbinden | Three.js ermöglicht den Unterbau; eigenständiger Produkt-/Geräteproof erforderlich |

## Technische Hebel

**WebGPU** spezifiziert Rendering und allgemeine GPU-Berechnung. Für gleichartige
parallele Aufgaben und komplexe Effekte bietet es passende Ausführungswege. Render
Bundles ermöglichen wiederverwendbare Renderbefehle und können CPU-Submission
reduzieren. Das ist ein Optimierungshebel, kein belegter FluidKit-Speedup.
[Spezifikation](https://www.w3.org/TR/webgpu/),
[Chrome-Team: Fähigkeiten und Ökosystem](https://web.dev/blog/webgpu-supported-major-browsers).

**Three.js/TSL** liefert den Scene-/Material-Unterbau, programmierbare Nodes und
Postprocessing. TSL kann für passende Renderfunktionen WGSL oder GLSL erzeugen;
der WebGPU-Renderer unterstützt einen WebGL2-Backendpfad. Seine offizielle Doku
benennt zugleich experimentellen Status, Featurelücken und workloadabhängige
Performance. Vollständige Featureparität wird daher nicht versprochen.
[Offizielles Handbuch](https://threejs.org/manual/pages/webgpurenderer).

**Gemeinsame Choreografie und eigene visuelle Sprache** sind Fluid-Designentscheidungen:
Eine Scene/Timeline kann Formen, Text und Content gemeinsam inszenieren. TypeGPU
ergänzt gezielte Shader und Kernels; der vorhandene
[Integrationsbericht](typegpu.md) beschreibt Kompatibilität und Grenzen.

**Worker und lokale Modelle** sind zusätzliche Entwicklungsmöglichkeiten.
OffscreenCanvas erlaubt Canvas-Arbeit in einem Worker; ONNX Runtime Web stellt
WebGPU-Inferenz und GPU-Tensoren bereit. Beides erfordert eigene Integration und
Ressourcenbudgets. Die aktuelle Fluid-Cloudanalyse wird dadurch nicht plötzlich lokal.
[OffscreenCanvas](https://web.dev/articles/offscreen-canvas),
[ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html).

Auch gewöhnliche Weboberflächen können effizient animieren. Die Browserpipeline
kann geeignete `transform`-/`opacity`-Animationen ohne Layout und Paint ausführen.
Der GPU-Renderer wird nach Szenario gewählt und gemessen.
[Offizieller CSS-Animationsleitfaden](https://web.dev/articles/animations-guide).

## Browserstand und Zukunftsperspektive

Die **aktuelle GPUWeb-Matrix**, am 2. November gelesen und zuletzt am 2. Oktober 2026
aktualisiert, ist genauer als ältere pauschale Supporttabellen:

- Chromium: breite Windows-/macOS-/ChromeOS-Unterstützung; Android nach GPU/OS;
  Linux unter anderem Intel Gen12+ und ausgewählte NVIDIA-/Wayland-Konfigurationen.
- Firefox: Windows und Apple-Silicon-macOS; weitere Mac-/Linux-/Android-Pfade
  teilweise noch Nightly, Flags oder laufende Arbeit.
- Safari: WebGPU ab Version 26 auf den dort genannten Apple-Betriebssystemen.

Quelle: [GPUWeb Implementation Status](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status).
Das belegt Beteiligung aller großen Browserfamilien, keine universelle Gerätequote.
Wir übernehmen keine widersprüchliche aggregierte Prozentzahl und machen aus
Anbieter-Roadmaps keine ausgelieferte Funktion.

**Strategische Ableitung:** Mit wachsender Verbreitung und leistungsfähigeren
Geräten kann eine gemeinsame Render-/Compute-Basis zusätzliche Aufgaben übernehmen.
Wir bauen skalierbare Qualität, Budgetierung und Diagnose ein. Unterstützte
Hardware, Treiber und Energiehaushalt werden weiterhin konkret geprüft. Die
heutige Produkt-Entscheidung berücksichtigt Entwicklungsspielraum und reale Nutzer.

## Content-Schutz und AI

Die eng begrenzte Ableitung lautet: Ein einfacher DOM-Scraper erhält aus einer
reinen Pixelansicht keinen vollständigen Darstellungsbaum. Ob dies Kopieren in
einem konkreten Szenario merklich erschwert, wurde nicht gemessen.

**WebGPU ist kein Kopierschutz und keine Vertraulichkeitsgrenze.** Drei unabhängige
Wege bleiben relevant:

1. Browser erhalten API-Antworten, Assets und Code. Die dokumentierte
   [Netzwerkinspektion](https://developer.chrome.com/docs/devtools/network/) zeigt,
   dass ausgelieferte Antworten inspizierbar sind.
2. Sichtbare Pixel können aufgenommen und gelesen werden. Offizielle
   [OCR-Dokumentation](https://docs.cloud.google.com/vision/docs/ocr) beschreibt
   Textextraktion aus Bildern.
3. Eine zugängliche Anwendung braucht Semantik. Der
   [HTML-Standard](https://html.spec.whatwg.org/multipage/canvas.html#the-canvas-element)
   verlangt funktional gleichwertige zugängliche Inhalte; unsere native Brücke
   erschließt Rollen, Labels und Werte absichtlich.

Die Schlussfolgerung ist eine technische Bewertung dieser Quellen und unseres
Modells, kein empirischer Anti-Scraping-Benchmark. Browser-Capture-Sperren für
Studiofunktionen verhindern keine externen Screenshots. Zugangskontrolle,
Datenminimierung und serverseitige Berechtigungen bleiben maßgeblich. Erlaubte
Assistenz-/Automationswerkzeuge sollen die Oberfläche zuverlässig bedienen können.

## Konstruktive Grenzen

- **SEO:** Google verarbeitet HTML und Links. Öffentliche Inhalte und Landingpages
  brauchen eine entsprechende Veröffentlichungsfläche; ein grafischer Workspace
  kann daneben bestehen. Semantik allein garantiert keine Indexierung.
  [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
- **Bedienung:** Textbearbeitung, IME, Clipboard, Fokus, Browser-Suche, Druck und
  Screenreader brauchen explizite Verträge und Prüfungen. Sie werden nicht durch
  stärkere GPUs automatisch richtig. Vorhandene Brücken und offene Gates stehen
  in T07/T13/T30 und der Feature-Matrix.
- **Leistung:** Speicher, Pixelzahl, Datentransfers, Shaderkompilierung, Akku und
  thermisches Verhalten bleiben Szenariobudgets. Bedarfsgesteuerte Frames und
  Virtualisierung sind wichtige Engineeringaufgaben, keine pauschalen Nachweise.
- **Tooling:** Das Ökosystem ist vorhanden und wächst; DOM-Widgetreife und vollständige
  GPU-UI-Abnahme sind unterschiedliche Dinge. Studio/Inspektoren machen die eigene
  Implementierung beobachtbar. Mehr Leistung ersetzt diese Arbeit nicht.

## Messplan im bestehenden Releasevertrag

Für weitere Usability-Nachweise werden dieselben Daten und Aufgaben verglichen:
statischer Wechsel, sinnvoller Übergang und Reduced-Motion-Variante. Varianten
werden in wechselnder Reihenfolge mit repräsentativen Nutzern geprüft; die
Auswertung erfasst erfolgreiche Aufgaben, Objekt-Wiederfinden, Fehler, Zeit,
Orientierungsurteil und Bewegungsverträglichkeit. Keyboard-/Screenreader-Journeys
werden getrennt ausgewertet. Effektgefallen allein ist kein Erfolgskriterium.

Technische Messungen ergänzen Framezeit, lokale Reaktion, selbst verwaltete
Ressourcen und mögliche Energie-/Thermikbeobachtungen pro Geräteprofil. Bestehende
T19/T24/T28/T29/T55 tragen diese Arbeit; dieser Dokumentationsschritt schließt keine
ihrer Produkt-AC. Cloud-/lokale AI und künftige räumliche Cases bleiben separate
Qualifikationen.
