# Verbindliche UI-Prüfliste

Stand: 1. November 2026. Gilt vor jeder visuellen Übergabe und jedem Release.
Screenshot-Belege müssen aus dem geprüften Build stammen. Ein grüner Build allein
ist keine visuelle Abnahme. Neue Befunde werden behoben und die betroffenen
Ansichten einschließlich ihrer Nachbarn erneut geprüft.

## Prüfauftrag und Entscheidung

Aktueller Auftrag: überlappender GPU-Titel und redundantes „Ziel“ aus dem
Nutzerscreenshot; anschließend Showcase und Studio systematisch nachprüfen.

| Option | Ziel / Korrektheit / Testbarkeit / Lieferbarkeit / Erweiterbarkeit (1–5) | Score |
|---|---|---|
| A Nur Texte kürzen und Breakpoints verschieben | 3 / 2 / 2 / 5 / 2 | 55 |
| B Vollständiges neues Layoutsystem vorziehen | 5 / 5 / 4 / 2 / 5 | 87 |
| H Explizite Textregionen, viewporttreues Replay, Glyph-Messung, lesbare Transition-Phasen und Regressionstests | 5 / 5 / 5 / 4 / 5 | 97 |

Gewichte: 30/25/20/15/10 %. Gewinner H. Bestehende visuelle Richtung und GPU-
Darstellung bleiben erhalten. Keine Bibliotheksaktualisierung für diese Korrektur.

## Checkliste

- [ ] **UI-01 Textflächen:** Keine sichtbaren Glyphen überschneiden andere Texte,
  Controls oder zugehörige Textregionen. Tatsächliche Font-Messwerte prüfen,
  nicht nur nominale SceneNode-Rechtecke.
- [ ] **UI-02 Inhalt:** Labels sind eindeutig; kein angrenzendes „Ziel Ziel“ oder
  widersprüchliche Zustandsanzeige. Endpunkte und Wiedergabestatus haben eigene Bedeutung.
- [ ] **UI-03 Typografie:** Lesbare Schrift, kontrollierte Zeilenzahl und Line-height;
  kein zufälliger Wortumbruch in kurzen Controls, keine fehlenden Glyphen.
- [ ] **UI-04 Resize und Zoom:** Schmale, mittlere und breite Container sowie
  Verkleinern/Vergrößern während eines Runs prüfen. Keine horizontale Seitenscrollbar
  oder abgeschnittene Timeline. Browser-Zoom und DPR gesondert nachweisen.
- [ ] **UI-05 Ansichten:** Tabelle, Karten, Map, Detail sowie leere Suche und lange
  Inhalte prüfen. Header und Fußzeilen behalten Abstand, Dataset bleibt echt.
- [ ] **UI-06 Übergänge:** Quelle, 25/50/75 % und Ziel pro Rezept prüfen. Bewegte
  Texte dürfen beim Kreuzen von Elementen nicht ineinander laufen. Retargeting,
  Pause/Fortsetzen, Replay und Live-Restore dürfen keine Geistertexte erzeugen.
- [ ] **UI-07 Eingabe:** Pointer und Tastatur, Fokusdarstellung, ausgewählter Zustand,
  Suche, Sortierung und Back/Forward funktionieren nach Layoutänderungen.
- [ ] **UI-08 Studio:** Eingeklapptes/aufgeklapptes Effekt-Studio, vier Auswahlmodi,
  Parameter und Timeline sind ohne Überlagerung bedienbar.
- [ ] **UI-09 Backend:** Tatsächliches WebGPU und gekennzeichnetes WebGL2 prüfen;
  keine neuen Render-/Shaderfehler. Reduced Motion separat prüfen.
- [ ] **UI-10 Abschluss:** Neue Screenshots lokal speichern und öffnen; Befunde mit
  Breite, Ansicht, Rezept und Phase dokumentieren. Offene Checks ausdrücklich benennen.
- [ ] **UI-11 Designkonsistenz:** Typografie-/Farb-/Abstandsrollen, gemeinsame
  Controls, localegerechte Zahlen und eindeutig formulierte Aktionen prüfen.
  Deutsche Substantive und kuratierte Fluid-Effekte nicht durch fremde Stilregeln
  automatisch umschreiben. Kontrast, Schriftgröße und Ziele am sichtbaren Ergebnis messen.
- [ ] **UI-12 Prüfgrenzen:** Statische DOM-Hinweise, berechnetes DOM-Layout,
  GPU-Glyphen, Semantik und Screenshots getrennt nachweisen. Nicht unterstützte
  Prüfungen ausdrücklich offen lassen; Ausnahmen präzise begründen. Null statische
  Befunde bedeuten keine Freigabe der Canvas-Inhalte.

- [ ] **UI-13 Design-Brief:** Medium, Nutzerziel, Datenmodus, Referenz und drei bis fünf
  erklärbare Beats sind vor der Umsetzung benannt; die Oberfläche besitzt einen klaren Fokus.
- [ ] **UI-14 Identität und Dichte:** Tokenrollen und eigene Assets passen zum Produkt;
  Tabellenwerte und Pflichtinformationen werden nicht durch dekorative Balken ersetzt.
- [ ] **UI-15 Komposition:** Anfang, Ergebnis und kompakte Ansicht sind im realen Host
  verständlich; Framing oder optionale Kamera schneiden keine operative Handlung ab.
- [ ] **UI-16 Zeitliche Evidenz:** Vollständige erfasste Folge, Ein-/Ausstiege, Retargeting
  und gegebenenfalls Loopnaht sind zugeordnet; Lücken sind inconclusive und kein Kontaktbogen ersetzt Einzelbildanalyse.
- [ ] **UI-17 Ruhe und Ursache:** Bewegungen referenzieren reale Events oder deklarierte
  Präsentationsaktionen; Poster, Reduced Motion, Nutzerübernahme und Leerlauf sind geprüft.
- [ ] **UI-18 Vergleich und Lernen:** Referenz/Kandidat werden unter gleichen Bedingungen
  mit konkreten Bildbelegen verglichen; wiederkehrende Ursachen besitzen gezielte Regressionen.
- [ ] **UI-19 AI-Kritik:** Freigegebener Datenumfang, Pixelredaktion, Provider, Budget,
  Framebezug und Unsicherheit sind sichtbar; Empfehlungen und unabhängige harte Gates bleiben unterscheidbar.

## Kombinierter Lauf ab M4

1. `npm run check:design` prüft das versionierte Studio-Profil und erzeugt das
   validierte Build-Artefakt. `npm run quality:gate` führt alle lokalen CI-Gates aus.
2. Im Studio „UI-Qualität“ öffnen, Zustand/Backend/Viewport wählen und prüfen.
   Den Report mit Build-ID exportieren. Nach Resize, Settings-, Ansichts- oder
   Studio-Layoutwechsel neu messen; alte Laufzeitbefunde werden verworfen.
3. Report, Screenshot und manuelle Abnahme verbinden. Vier offene Kategorien
   (zusammengesetzter Kontrast, Eingabe/AT-Journeys, Browser-Motion und Screenshot-
   Review) erhalten keine automatische Freigabe. Screenshot-Review erfolgt separat
   im QA-Bericht; der Prüfer bewertet seine eigene Ergebnisoberfläche nicht rekursiv.
4. Proportional verkleinertes Replay ausdrücklich auf Lesbarkeit prüfen. Geometrie
   ohne Kollisionen genügt bei sehr kleinen Schriften nicht zur Designfreigabe.

[M4-Abnahmevertrag](../milestones/m4-plan.md),
[QualityReport und Implementierung](../milestones/m4.md).

## Aktuelle Tasks und Acceptance Criteria

1. Textregionen begrenzen und tatsächliche Glyph-Bounds auslesbar prüfen.
   Header, Unterzeile und Effektleiste sind disjunkt; Schrift bleibt in ihrer Region.
2. Timeline-Status und Endpunkt unterscheiden. „Ziel“ erscheint genau einmal im
   Transport; Anfang, Effektphase, Pause und Ende besitzen nachvollziehbare Labels.
3. Text-Choreografie: Quelltext ausblenden, Geometrie bewegen, Zieltext einblenden.
   Im bewegten Segment sind kreuzende Beschriftungen unsichtbar; statische Controls
   bleiben bedienbar. Logische Events und URL-Commit bleiben unverändert.
4. Breiten-/Ansichts-/Phasenmatrix mit Unit-/Property-Regressionen und tatsächlicher
   GPU-Textmessung prüfen. Bei Befunden erneut korrigieren und nachprüfen.
5. Ergebnis in T19/T43/T45 und dem QA-Bericht verlinken; Gesamtplan, Feature-Matrix
   und relevante Mermaid-Flows konsistent halten.

## Testmatrix für diesen Durchlauf

Viewport: 320, 390, 550, 768, 1024 und 1440 px; Containerbreite separat erfassen.
Ansichten: Table / Cards / Map / Detail; alle echten Module, leere Suche, Auswahl.
Rezepte: Fluid Morph / Spring Reflow / Ripple Reveal / Basisbewegung.
Phasen: Start, 25 %, 50 %, 75 %, Ende; Unterbrechung und Resize.
Automatisierte Geometrieprüfungen ergänzen die Browsermessung. Screenshotprüfungen
sind keine vollständige manuelle Screenreader-, IME- oder Hardwarefreigabe.

## Recherche und Einordnung

- [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), abgerufen 2026-11-01: Textüberlauf, flexible Layouts, Fokus und unterbrechbare Animationen.
- [Glyph](https://github.com/pmndrs/glyph): aktuelle Dokumentation nennt `measure()`
  für Font- und Ink-Metriken. Die konkrete API wird gegen die installierten
  öffentlichen Deklarationen von Glyph 0.1.0 geprüft; kein Upgrade auf 0.2 vorausgesetzt.
- [ai-design-check: Recherche und isolierter Probelauf](../research/ai-design-check.md),
  2026-11-01: konfigurierbare statische Designregeln ergänzen die tatsächliche
  Renderprüfung. [Entscheidung und Folgeabnahmen](../decisions/0005-design-quality.md).

Die Kästchen oben sind die wiederverwendbare Vorlage. Der ausgeführte Durchlauf
mit Befunden, Ergebnissen und Einschränkungen steht im QA-Bericht (internes Archiv).


## M6-Nachprüfung vom 2. November 2026

[Ausgeführte Abnahme](../milestones/m6.md): Tabelle, Karten und Detail in vier
Browserbreiten mit separat gemessener GPU-Surface. Native Steuerung, Bildaufnahme,
Vergleich und fehlender Providerzugang wurden im Studio geprüft.

Zusätzlich geprüft: Die Führung übernimmt keinen Tastaturfokus; Play/Pause/Schritt
bleiben beim Scrollen erreichbar. DOM-Überschneidungen werden bei fester/sticky
Bedienleiste anhand opaker Hintergründe und tatsächlicher Paint-/Hit-Test-Reihenfolge
beurteilt. Transparente Overlays und Kollisionen im normalen Flow bleiben
Negativkontrollen. Die Stichprobe an fünf Überlappungspunkten ist keine allgemeine
Pixel- oder Kontrastprüfung. Grundlage: [CSSOM View, elementsFromPoint](https://drafts.csswg.org/cssom-view/#dom-document-elementsfrompoint), geprüft 2. November 2026.

Bewegungsvollscan, Browser-Zoom/DPR-Matrix, zusätzliche Browser/Geräte,
Screenreader/IME, zusammengesetzter Kontrast und Live-AI-Evaluation bleiben offen.


## Direkte OpenAI-Review und kompakte Nachprüfung

Der [Live-Nachtrag](../milestones/openai-review-execution.md) ergänzt die ursprüngliche
M6-Prüfung: echtes Modell, menschlich bewertete Befunde, Referenz-/Usageexport und
ein versionierter adversarieller Brief. Das ist keine vollständige Modellevaluation.

Bei der erneuten Matrix werden Endpunkte nur gewertet, wenn Phase 1 und tatsächlich
geprüfte GPU-Textknoten vorliegen. Animationsphasen ohne sichtbare Schrift sind keine
Bestätigung lesbarer Endzustände. 320 px Browserbreite wird auch mit Platzverlust
durch native Scrollbalken geprüft; die tatsächlich gemessene Surfacebreite gehört
in den Report. Kürzere Overlines und kompakte Innenabstände dürfen die Caption-/
Body-Tokens nicht unterschreiten. Neue AI-Bewertungsfelder werden auf schmale
Ansichten, Tabwechsel, Referenzverlust im begrenzten Bildpuffer und Export geprüft.


## M7-Erweiterung vom 3. November 2026

Die ursprünglichen Matrix- und M6-Nachweise bleiben historisch erhalten. Für die
sechs Rezepte gilt zusätzlich die [M7-Abnahme](../milestones/m7-plan.md):

- Responsive GPU-Auswahl mit sechs Rezepten, passenden Parameterlabels und einem
  ausdrücklich ausgelösten Preset-Reset prüfen; Dockhöhe und Folgeinhalte müssen
  aus derselben Layoutberechnung entstehen.
- Silk Cascade, Liquid Lens und Particle Weave jeweils an Quelle, 25/50/75 % und
  Ziel sowie in vollständigen erfassten Vorführungsfolgen prüfen. Texte, aktive
  Eingabe und Effektsteuerung dürfen weder gebrochen noch als Fragmente dargestellt werden.
- Vorwärts und rückwärts scrubben, nach Abschluss erneut zurückgehen und bei
  25/50/75 % sowie mehrfach in der Abbauphase unterbrechen. Keine Geistertexte,
  unsichtbaren Pointerziele oder Restpartikel akzeptieren.
- Die separate M7-Vorführung über „Neue Effekte erleben“ und „Stoppen“ prüfen;
  eigene Eingabe, Historynavigation oder unsichtbare Surface beendet kommende
  Schritte und erhält den erreichten Zustand.
- Backend, tatsächlich verwendetes Rezept und Qualitätsprofil erfassen. Eine
  reduzierte oder nicht qualifizierte Darstellung nicht als vollen Effekt ausweisen.
- Framevollständigkeit, Bildqualität, Echtzeit-Pacing und Ressourcenbestand getrennt
  belegen. Ein fehlender Frame bleibt inconclusive; AI-Kritik ersetzt kein hartes Gate.

Die Kriterien M7-AC01–M7-AC27 im kanonischen Register führen diese zusätzliche
Abnahme. Dieser Nachtrag behauptet noch keinen bestandenen GPU-Durchlauf.
