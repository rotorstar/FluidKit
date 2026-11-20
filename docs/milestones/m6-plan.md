# M6: gestaltete, kausale und vollständig geprobte Fluid-Story

Stand: **2. November 2026**. Status: **vertikaler Schnitt implementiert und begrenzt geprüft**. [Ausführung und Scope](m6-execution.md), [Ergebnisse und offene Gates](m6.md); vollständige M6-Abnahme bleibt offen.
[Recherche](../research/stageshow.md), [ADR-0006](../decisions/0006-stageshow.md),
[Designprozess](../quality/fluid-design-workflow.md).

## Ziel und Grenze

Die neue Qualität soll zuerst an einem begrenzten vertikalen Showcase sichtbar
werden. Er nutzt vorhandene WebGPU-Ansichten und tatsächliche Workspace-Metadaten.
M6 ist keine Freigabe aller RP1-Gates und kein Vorziehen sämtlicher Studio-,
Kamera- oder Cinematic-Editorfunktionen. T16–T18 und die offenen Eingabe-/Layout-
Arbeiten behalten ihre Abhängigkeiten.

## Bewertete erste Story

Gewichte 30/25/20/15/10, Ratings und Rechnung im Score-Register.

| Entscheidung | A | B | Hybrid H2 | Hybrid H / Gewinner |
|---|---|---|---|---|
| M6-STORY | isolierter Button-Morph 68 | kompletter Commerce-Edit-/Checkout-Flow 82 | vorhandener Commerce-Variantenflow neu inszeniert 89 | **H: echter Workspace mit Tabelle, Karten und verbundenem Detail 97** |

H erklärt das Framework mit realen Daten und vorhandenen Ereignisverträgen.
B benötigt zusätzliche Widgets und fachliche Aktionen, bevor sich die
Gestaltungsverbesserung überhaupt beurteilen ließe. H2 folgt als zweiter Case.

## Design-Brief für die erste Umsetzung

- **Aufgabe:** Einen Modulbestand anders ordnen und darstellen, ohne Datenidentität
  oder fachlichen Kontext zu verlieren.
- **Medium:** Bedienbarer GPU-Showcase mit bewusst gestartetem geführtem Ablauf.
  Ein eigenständiges, als Illustration markiertes Exportformat ist später möglich.
- **Look:** bestätigtes Inter-/Grün-System, helle Studio-Shell und dunkle GPU-Surface.
  Ein Leitobjekt statt gleich gewichteter Kästen; Diagnosewerte im Inspector.
- **Dichte:** echte Datenwerte bleiben in der Tabelle. Auswahl, Sortierung und
  Ergebnis tragen die visuelle Priorität; redundante Erklärungen werden reduziert.
- **Referenzmuster:** Stageshow Table Edit für Zelle und abhängige Wirkung,
  Choreography für zusammengehörige Tracks, Phone Touch für erhaltene Objektidentität.
  Es werden keine fremden Marken oder Beispielwerte übernommen.
- **Größen:** 320/390/768/1280 px Browserbreite plus gemessene Surfacebreite.
  Die kompakte Variante darf Tracks und Komposition ändern, nicht Schrift und
  Aktivierungsflächen unter die Produktrollen skalieren.
- **Timing:** drei bis fünf sichtbare Beats; zunächst fünf. Ein Präsentationsziel
  von ungefähr 12–16 Sekunden wird erprobt, nicht als Funktions-/Netzwerklatenz
  versprochen. Kernfeedback bleibt sofort, Lesepausen gehören nur zur Führung.

## Die fünf Beats

| Beat | Echte Wirkung | Präsentation und Nachweis |
|---|---|---|
| Kontext | initiale Tabelle mit `sort=name`, `direction=asc`, `group=all`, leerer eigener Suche/Auswahl | Übersicht und ein klarer Startpunkt, keine erfundenen Daten |
| Ordnen | `sort.dependencies.asc` über den aktuell dafür gültigen Tabellen-Header `column-dependencies` | Numerische Reihenfolge bewegt sich, nicht die Werte selbst; Cursor nur am gemessenen Ziel |
| Perspektive | `view.cards` über `view-cards` | Dieselben Modul-IDs behalten Sortierung und Daten; ein Objekt führt den Blick |
| Verstehen | `select.webgpu` über `module-webgpu` | Karte und Detail bleiben nachvollziehbar verbunden; die echten Abhängigkeiten sind das Ergebnis |
| Zurücksetzen | ausdrückliches `reset` über den Studio-Button „Ansicht zurücksetzen“ | Sichtbare Ursache führt zur eigenen Ausgangsansicht zurück, kein heimliches Datenrewind |

Der Szenario-Runner muss den tatsächlich im Part deklarierten Eventvertrag prüfen.
Er darf keinen abweichenden Event unter einen gezeichneten Klick legen. Ziele
werden nach Layout/Scroll gemessen. Ist `webgpu` im geöffneten Projekt nicht
vorhanden oder ein Ziel nicht bedienbar, folgt ein erklärter Fehler statt einer
Ersatz-Erfolgsszene. Der geführte Lauf arbeitet in einer isolierten Runtime;
produktive Hostdaten und fremde Entwürfe werden durch seinen Reset nicht verändert.
Manuelle Nutzerinteraktion pausiert oder beendet die Führung.

## Minimaler Umsetzungsschnitt

| Schritt | Tasks | Lieferumfang | Voraussetzung |
|---|---|---|---|
| Brief und Rollen | T50, minimaler T51 | versionierter Brief, echte Datenreferenz, eigene Theme-Rollen für diesen Case | aktuelle Contracts und Workspace-Daten |
| Kausale Vorführung | T52, minimaler T53 | gültige Events, gemessene Ziele, kompakte Komposition, bestehende Effekt-Policy | erste stabile Rollen und vorhandene Primitives |
| Sichtbare Abnahme | minimaler T54 und T56 | Bildfolge, Scene-/Ink-/Eventkorrelation, manuell gelesene Referenz-/Ergebnisbilder | synchronisierter Surface-Captureadapter |
| Bedienbare Probe | minimaler T55 | zugängliche Read-only-Bereiche für Design, Layout/Semantik, Motion, Vergleich und AI-Status sowie Play/Pause/Replay und Beat-/Framebezug | vorhandene Controls plus Rehearsalvertrag |
| Ursache schließen | T57 | konkrete Fehler als Fall/Regel/Regression zurückführen | belegter Befund |

Der vollständige T51-Importer, optionale Kamerafahrten, grafisches Beat-Authoring
und persistente Rehearsal-Vergleiche folgen in ihren Waves. Ein Teilumfang erfüllt
nicht automatisch alle AC des jeweiligen T50–T58-Tasks.

## Abnahme

- Die fünf Beats führen gültige Runtime-Events auf tatsächlich gelesenen Workspace-Daten aus und besitzen sichtbare Ursachen.
- Modul-IDs, fachliche Daten und Sortierung bleiben bis zum ausdrücklich gezeigten Reset konsistent, ohne externe Mutation oder parallelen Demo-Fachstate.
- Anfang, Ergebnis und kompakte Komposition bestehen die Prüfung bei 320/390/768/1280 px, mit separat erfasster Surfacebreite und lesbaren Produktrollen.
- Die verwendeten DOM- und GPU-Rollen stammen aus derselben Tokenversion und behalten die bestätigte Fluid-Identität.
- Eine vollständige erfasste Bildfolge einschließlich Unterbrechung, Pause/Replay und optional Loop plus nächstem Anfang ist mit Frame-/Event-/Rezeptbezug prüfbar, Lücken bleiben inconclusive.
- Tatsächliche Glyphen, Pixel, native Semantik und Echtzeit-Pacing werden getrennt geprüft, fehlende Abdeckung oder ein sauberer Kontaktbogen allein erzeugen kein bestandenes Gesamtgate.
- WebGPU ist Standard und das tatsächliche Backend sichtbar, WebGL2-Capture und nicht unterstützte Fähigkeiten besitzen einen eigenen qualifizierten oder offenen Status.
- Der fertige M6-Lauf wird in Echtzeit und an kritischen Einzelbildern visuell geprüft und mit Brief, Vergleich, Befunden, Ausnahmen und offenen Gates übergeben.
- Das Studio bietet Design-, Layout-/Semantik-, Motion-, Vergleichs- und AI-Reviewansichten mit Frame-/Partbezug, ein fehlender Modellzugang bleibt ausdrücklich nicht konfiguriert und erfüllt nicht die produktive T58-Abnahme.

## Neue geplante Verträge

| Modell | Inhalt und Grenze |
|---|---|
| `StoryDefinition` | Version, Brief, Medium/Modus, Referenzen, drei bis fünf Beats, erwartete Ergebnisse und Daten-/Flow-/Szenariobezug. Kein zweiter Fachstate. |
| `ThemeDefinition` | Versionierte Rollen für Farbe, Typografie, Abstände, Form und Bewegung, abgeleitete CSS-/GPU-Werte und benannter Importteilumfang. |
| `PresentationProjection` | Logisches Layout, Sicht-/Kameratransform, Clip und inverse Ziel-/Semantikzuordnung. Keine neue URL- oder Fachrevision. |
| `FrameCaptureManifest` | Run/Frame, logische und tatsächliche Zeiten, Daten-/Build-/Asset-/Tokenversionen, Backend/DPR/Viewport, Event-/Snapshot-/Rezeptbezug, Abdeckung und Artefaktreferenzen. Keine GPU-Objekte in JSON. |
| `RehearsalReport` | Getrennte geometrische, visuelle, semantische und zeitliche Ergebnisse plus Review. Companion zu QualityReport v1, kein Umdeuten alter Reports. |

Präsentationsmodus und Datenquelle sind getrennte Achsen: Eine geführte Story kann echte Workspace-Daten verwenden, und eine bedienbare Case-UI kann ausdrücklich synthetische Daten nutzen. `DataSource` bleibt die Herkunftsquelle, `StoryDefinition` beschreibt die Führung beziehungsweise Illustration. Backend und Anwendungs-Control-Mode sind weitere getrennte Verträge.

Der Capture-Status kann `inconclusive` sein. Beim Bezug auf den bestehenden
QualityReport v1 wird das als offene Prüfung mit Grund abgebildet, bis ein
versionierter gemeinsamer Vertrag qualifiziert ist. Keine stille Union-Erweiterung.

## Verbindliche Regressionen und harte Gates

- Fehlendes Ziel, abgewiesener Guard, verspätetes Ergebnis und fehlende Glyphen.
- Frameausfall, Geräteverlust, veralteter Capture-/Token-/Fontstand und nicht
  zuordenbares Screenshotbild; kein Ersatz durch ein früheres gutes Bild.
- Einstieg, Retargeting, Ausstieg und Storygrenze einschließlich nächstem Anfang.
- Gleichbleibender Textslot mit verändertem Inhalt: reine Boxgeometrie reicht nicht.
- Fokus/IME, Pointer und Semantik nach Layout-/Scroll-/optionaler Kameratransformation.
- Reduced Motion, verborgenes Tab, offscreen, Nutzerübernahme und Replay ohne
  produktive Seiteneffekte. Bei Reduced Motion bleibt der Ergebnis-Poster vollständig.

## Abhängigkeiten und Fortsetzung

T50/T51 ergänzen RP1/RP2. T52/T53 hängen von T05–T12 und den qualifizierten
T47–T49 ab. T54 ergänzt T18/T19/T29. T55 benötigt für vollständiges Speichern und
Authoring T16/T17/T18, der erste Read-only-/Transport-Proof nutzt vorhandene
Controls. T56/T57 begleiten jede relevante Wave und T30/T38; sie warten nicht auf
Marketplace. Die übrigen offenen M5-Arbeiten bleiben in der Feature-/AC-Matrix
sichtbar. Kein XR-, KI-, Persistenz- oder Accessibility-Gate wird durch M6 geschlossen.

[User-/Daten-/State-/URL- und Rehearsal-Flows](../flows/design-rehearsal.md).

## Verbindlicher Studio-Bereich „Design & Rehearsal“

Diese Prüfungen sind Bestandteil des Studios, keine ausschließlich externen
Entwicklerscripts. T55 baut auf dem vorhandenen UI-Qualitätsbereich auf:

| Ansicht | Aufgabe | Befundbezug |
|---|---|---|
| Design | Hierarchie, Dichte, Tokens, Abstand, Typografie und Markenwirkung | Referenz/Ergebnis nebeneinander, Rolle und konkreter Bildbereich |
| Layout & Semantik | DOM-/GPU-Textregionen, Kontrast, Zielgröße, Rollen, Namen und Fokus | Part/Node, Scene-/Glyphgeometrie und native Brücke |
| Motion | Ein-/Ausstieg, Retargeting, Sprung/Drift, Loopnaht und Capturelücken | Beat, Event, Frame und vorher/nachher |
| Vergleich | Baseline/Kandidat bei gleichem Case, Seed, Daten- und Geräteprofil | Zwei unveränderliche Runs mit klaren Versionsangaben |
| AI-Kritik | begründete multimodale Hinweise zu Komposition und Bewegung | ausgewählte freigegebene Frames, Unsicherheit und überprüfbare Empfehlung |

Die Vorschau zeigt die tatsächliche Surface. Debug-Geometrie dieser Surface bleibt
an ihre Projektion gebunden; Studio-Reports und Controls dürfen DOM verwenden.
Ein Befund kann den betroffenen Frame und Part auswählen, ohne den Fachstate zu
verändern. Unveränderliche Runs sind die Quelle, lokale Review-Ansichten nur Projektionen.

Geplante URL-Projektion auf dem bereits vorgesehenen Runpfad:
`/studio/projects/:projectId/runs/:runId?panel=motion&frame=:frameId&part=:partId`.
Run-Navigation verwendet History-Push, reine Panel-/Frame-/Part-Auswahl Replace.
IDs werden validiert, gelöschte Runs/Frames erzeugen eine Diagnose. Tokens,
Prompts, Notizen, Pixel und vertrauliche Werte stehen nicht in der URL.

## AI-Analyse als eigenständiger Task T58

AI-Analyse ist ausdrücklich gewünscht. Sie ergänzt die deterministischen Prüfer
und menschliche Review. Sie darf gestalterische Fragen beantworten, die ein
Bounding-Box-Test nicht beurteilt: Blickführung, unnötige Gleichgewichtung,
redundante Signale, austauschbare Gestaltung und unverständliche Bewegungen.

Ein serverseitiger Review-Provider erhält ein freigegebenes `AIReviewBundle`:
ausgewählte redigierte Bilder/Framefolgen, Brief, Tokenrollen, begrenzte Part-
Metadaten und vorhandene Messergebnisse. Die UI zeigt vor dem Aufruf dessen
Umfang, Provider und Budget. Freitext und Nutzerinhalte werden nicht pauschal
exportiert; sensitive GPU-Inhalte müssen vor der Bildaufnahme redigiert sein.
Eine Redaktion nur des JSON-Traces genügt bei sichtbaren Pixeln nicht.

`AIReviewFinding` ist strukturiert und verweist auf existierende Run-/Frame-/
Part-IDs oder einen normalisierten Bildbereich. Es enthält Kategorie, Begründung,
Unsicherheit, Vorschlag und Herkunft. Schema- und Referenzprüfung erfolgen außerhalb
des Modells. Dargestellter Text ist untrusted input, keine Agent-Anweisung.

Der Standard ist ein bewusst gestarteter Review-Aufruf. Eine automatische Prüfung
nach Änderungen ist später pro Projekt mit Freigabe und Budget konfigurierbar.
Ohne Provider bleibt „AI-Analyse nicht konfiguriert“ sichtbar; alle lokalen Prüfer
funktionieren. Eine optionale Analyse ändert weder Control Mode noch Policy der
Anwendungsruntime. Manual löst weiterhin keine Anwendungs-Modellaufrufe aus.

AI-Funde werden als Vorschläge mit Annahme/Ablehnung und Reviewstatus geführt.
Eine erlaubte Änderung benötigt eine überprüfbare Vorschau und die entsprechende
Projektpolicy beziehungsweise Reviewfreigabe. Das Modell kann kein hartes Gate
aufheben und keinen unvollständigen Lauf grün setzen. Die Abdeckung ausgewählter
AI-Bilder ist getrennt von der vollständigen technischen Frameanalyse ausgewiesen.
Qualitätscalls erhalten eigene serverseitige Berechtigungen, Limits, Deadlines,
Verbrauchsnachweise und Abbruchregeln über T22/T27.
