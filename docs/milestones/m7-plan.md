# M7: Drei neue Fluid-Effekte mit unterschiedlichem Charakter

Stand: **3. November 2026**. Status: **implementiert und lokal validiert; 19 Kriterien im ausgewiesenen Scope verifiziert, acht teilweise**.
Dieser freigegebene Milestone ergänzt T10/T11, T47–T49 und T54–T57. Er ersetzt
keine offenen Gesamtplan-, Accessibility- oder Hardwaregates.
[Recherche](../research/effect-extension.md), [Effekt-Flows](../flows/effects.md),
[kanonischer AC-Abgleich](../acceptance-matrix.md).

**Nachprüfung ab 4. November 2026:** Der [ergänzende Ausführungsplan](m7-followup.md)
bearbeitet die acht verbliebenen Teilabnahmen mit sichtbarer Studio-Qualifikation,
begrenzt festgelegter Browsermatrix und eigenen Eingabe-/Lifecycle-/Datenschutzbelegen.
Die folgenden kanonischen Kriterien und die ursprünglichen Nachweise bleiben unverändert.

## Ziel und gestalterische Entscheidung

Die Library wächst von drei auf sechs versionierte Rezepte. Auf Nutzerwunsch
kommt je ein eleganter, ein materialbetonter und ein experimenteller Effekt hinzu.
Alle erscheinen im Showcase und Studio und benutzen denselben Runtime-Kern.
Echte Workspace-Daten, ihre IDs und die bestätigte Inter-/Grün-Gestaltung bleiben
die Grundlage. Keine Demonstration erfindet fachliche Zustände oder Produktwerte.

| Neues Rezept | Charakter und Verlauf | Ursprünglicher Planungsstart | Aktuelles Library-Preset | Erste Vorführung |
|---|---|---|---|---|
| Silk Cascade | Zusammengehörige Flächen heben sich leicht, folgen gestaffelten ruhigen Bahnen und setzen sich mit Schatten/Kantenglanz zusammen. Kein Federimpuls und keine perspektivisch verzerrten Controls. | 650 ms, Intensität 0,35 | 900 ms, Intensität 0,55 | Tabelle → Karten |
| Liquid Lens | Eine lokale organische Linse bricht tatsächlich den dekorativen Hintergrund und öffnet die Zielansicht. Text, Fokus und Eingabe bleiben scharf. | 1.050 ms, Intensität 0,55 | 1.100 ms, Intensität 0,55 | Karte → Detail → zurück |
| Particle Weave | Flächenfragmente folgen reproduzierbaren, geordneten Bahnen zwischen denselben Komponenten-IDs und bilden die neue Ansicht. Schrift wird nicht zerstückelt. | 1.350 ms, Intensität 0,65 | 1.300 ms, Intensität 0,65 | Karten → Map → zurück |

Empfohlene Werte sind Gestaltungsvorgaben, keine gemessenen Optima. Eine begründete
visuelle Iteration darf sie innerhalb der bestehenden Parametergrenzen verbessern.
Die reine Rezeptwahl überschreibt individuelle Werte nicht; „Preset anwenden“
übernimmt sie ausdrücklich. Der dritte Parameter wird passend als Staffelung,
Linsenbreite oder Strangdichte erklärt.
Die aktuellen Werte stammen aus `EFFECT_LIBRARY.recommendedParameters`; sie
wurden während der Umsetzung gestalterisch angepasst. Die vergleichbaren
67-Sample-Standardsequenzen nutzen dagegen ausdrücklich 1.100 ms, Intensität
0,65 und Frequenz 2,5. Sie sind kein stillschweigender Nachweis jedes kuratierten
Presets. Die M7a-Vorführung übernimmt die jeweiligen Library-Presets bewusst.

## Bewertete Umsetzung

Gewichte: Zielerfüllung 30 %, Korrektheit/Accessibility 25 %, Testbarkeit 20 %,
Lieferbarkeit 15 %, Erweiterbarkeit 10 %. Alle Werte sind Planungsbewertungen,
keine Performanceprognosen. Ratings und Rechnung sind in
[m7-scores.json](../decisions/m7-scores.json) maschinenprüfbar.

| Entscheidung | Option A | Option B | Hybrid H / Gewinner |
|---|---|---|---|
| M7-01 | Weitere Sonderfälle im Renderer 68 | Neue allgemeine Effektengine 75 | **Begrenzte Effektadapter und gemeinsamer Darstellungssampler 94** |
| M7-02 | Sechs Buttons unverändert anhängen 48 | Eigener Effekteditor 74 | **Responsive Library in vorhandenem Showcase und Studio 97** |
| M7-03 | Einzelne Nodes verzögert verschieben 70 | Vollständige 3D-Faltmechanik 76 | **Komponentengruppen, gestaffelte Bahnen und Materialakzente 94** |
| M7-04 | Glasähnlicher Farbverlauf 65 | Physikalische Transmission der gesamten Szene 71 | **Lokale Brechung mit separater scharfer Inhaltsebene 93** |
| M7-05 | Zufälliger Partikelausbruch 58 | Zustandsabhängige Compute-Simulation 73 | **Instancing und analytische identitätserhaltende Bahnen 92** |
| M7-06 | Einzelbilder 55 | Nur numerische Tests 70 | **Sequenzprüfung, Eingabeprüfung und visuelle Review 97** |
| M7-07 | Nur README ergänzen 61 | Separate Effektdokumentation 78 | **AC-Register, Flows, Feature-Matrix und beide OKF-Bundles 97** |

## Tasks und Abhängigkeiten

| Task | Lieferumfang | Zugeordnete Abnahme |
|---|---|---|
| M7-01 Grundlagen | Unveränderlicher Transition-Clip, gemeinsamer Sampler, explizite Rezeptzuordnung, begrenzter Darstellungssnapshot, rückwärts gerichtetes Scrubbing und v2-Import/v3-Export | M7-AC01–03, M7-AC10–13 |
| M7-02 Responsive Library | Gemeinsame Layoutberechnung für GPU-Dock und Surfacehöhe, Studio-Metadaten, explizite Presets und unveränderte laufende Pläne | M7-AC04–05 |
| M7-03 Silk Cascade | Gruppenreihenfolge, ruhige Bahnen, dezente Schatten und Kantenglanz | M7-AC06 |
| M7-04 Liquid Lens | Eigene Render Targets, lokale Brechung, organische Maske, geschützte Inhaltsebenen | M7-AC07–08 |
| M7-05 Particle Weave | Instanzierte Fragmente, stabile Zuordnung und analytische Bahnen | M7-AC09 |
| M7-06 Qualität | Sequenzmanifest, Geometrie-/Glyph-/Bewegungsprüfung, Backend-/Eingaberegressionen, Pacing und Lifecycle | M7-AC14–23 |
| M7-07 Dokumentation | Milestone und frühe Vorführung, Feature-/AC-Matrix, Mermaid, README, Engineering-/Public-Knowledge und Nachweisregister | M7-AC24–27 |

M7-01 und M7-02 sind Voraussetzungen für die frühe visuelle Lieferung. Die drei
Rezepte werden danach gemeinsam mit ihren jeweiligen Tests implementiert. M7-06
begleitet jeden Schritt. M7-07 führt den Ist-Stand fortlaufend nach; ein neuer
Eintrag ist bis zu seiner tatsächlichen Prüfung offen.

## Gemeinsame Darstellung und Verträge

Ein Transition-Clip enthält Quelle, Ziel, eingefrorenen Effektplan, Viewport und
optional einen Darstellungssnapshot. `sampleTransitionClip(clip, progress)` liefert
Positionen, Sichtbarkeit, Textphasen, Material-/Linsenparameter und Partikel.
Rendering, Scrubbing und Inspektion verwenden dieselbe Berechnung. Der bestehende
Surface-Scheduler bleibt alleiniger Taktgeber; der fachliche Commit erfolgt sofort.

Dekorative Flächen, Effekte, scharfe GPU-Inhalte und geschützte Controls bilden
getrennte Darstellungsschritte mit korrekter Überdeckung und Clipping. Scharfe
Texte werden nicht pauschal über alle anderen Komponenten gelegt. Zusammengehörige
Parts erhalten dieselbe Gruppenphase. Verdeckte Controls bleiben keine Pointerziele.

Unterbrechungen erfassen tatsächliche Panel-/Textwerte, verbleibende Materialdaten,
höchstens eine rekonstruierbare Linsendarstellung und eine begrenzte Partikelmenge.
Diese Kanäle werden in höchstens 120 ms beziehungsweise 20 % der neuen Dauer
abgebaut, bevor ein widersprüchlicher neuer Effekt beginnt. Wiederholte
Unterbrechungen erfassen dieselben Kanäle; sie hängen keine rekursiven Clips oder
Overlay-Stapel an. Reduced Motion überspringt diese Phase.

Der neue aufgelöste Plan hält Qualitätsprofil, Anker und Gruppenreihenfolge fest.
VisualScenario v3 ergänzt den flachen Darstellungssnapshot; v2 bleibt über einen
expliziten Importadapter lesbar. Rezeptversionen, alte Seed-Berechnung und Pools
werden nicht stillschweigend verändert. Alle Types stammen aus Zod-Schemas.
Exports enthalten keine GPU-Objekte, ausführbaren Shader oder rekursiven Pläne.

### Korrekturen aus der ersten echten GPU-Prüfung

Der erste Lauf auf Build `fluid-902aad3c08fc2098e23d` bestand die numerischen
Bildrasterprüfungen, zeigte bei der visuellen Prüfung aber ausgehende Tabellenlabels
über Karten und eine Linse abseits des bewegten ausgewählten Inhalts. Zusätzlich
enthielt ein natürlicher Wiedergabelauf ein einzelnes Intervall von 491,6 ms.
Diese Ergebnisse sind Ursachenbefunde, keine abschließende Freigabe. Die
archivierte Sequenzreview (internes Archiv)
und die Timingreview (internes Archiv)
bleiben ihrem ursprünglichen Build zugeordnet.

Die Umsetzung wird deshalb präzisiert:

- Parts behalten die tatsächliche Komponentenidentität. Ausgehende Labels dürfen
  nicht durch den Schutz einer zu großen Workspace-Gruppe sichtbar bleiben.
- Liquid Lens folgt der stabilen ausgewählten Komponente von der Quellposition
  zum Ziel. Ein ursprünglicher Bildschirmanker allein genügt nicht, wenn der
  relevante Inhalt seine Position ändert.
- Replay verwendet die begrenzte Menge von Quell- und Zielobjekten des aktuellen
  Clips erneut. Am Ziel nicht sichtbare Quellobjekte bleiben unsichtbar im Cache,
  damit Rückwärts-Scrubbing keinen vollständigen Neuaufbau auslöst. Beim Wechsel
  zu einem neuen Clip werden unbenutzte IDs freigegeben; die Menge wächst nicht
  über die aktuell benötigten Darstellungskanäle hinaus. Effekt-Targets und
  Partikel bleiben am vollständigen Endpunkt trotzdem leer.
- Ressourcenprüfung trennt wiederholtes Replay von 100 Unterbrechungen/Clips,
  zusätzlichen Folgen mit wechselnden IDs und von Mount/Unmount. Die isolierte
  Retargeting-Diagnose ersetzt keine echten Pointer-/Keyboard-/History-Journeys.
- Timingberichte nennen zusätzlich Maximum und Intervalle über 50 ms. P95 darf
  einen einzelnen sichtbaren Stillstand nicht verdecken. Jeder Bericht zeigt das
  tatsächlich geprüfte Rezept samt Version, Revision, Viewport und Backend.

Alle betroffenen Frames, Endpunkte und Echtzeitläufe werden nach den Korrekturen
erneut geprüft. Frühere grüne Teilchecks werden nicht auf den korrigierten Build
übertragen.

Auch der Folgelauf `fluid-339a0c4d705d1a307729` ist kein pauschaler Abschluss:
ausgewählte Silk-/Particle-Phasen waren visuell stimmig, die Lens-Review fand trotz
numerisch vollständiger Folge einen vertikal falsch abgetasteten Hintergrund
mit duplizierten fremden Controls. Die Texturkoordinaten-/Backendkorrektur braucht
deshalb wiederum neue Lens-Bilder. Diese Befunde werden mit ihrem ursprünglichen
Build erhalten und nicht durch einen späteren grünen Zähler überschrieben.
Die tatsächliche WebGL2-Kompilation desselben Builds fand außerdem fehlerhafte
GLSL-Übersetzungen neuer Effektfunktionen. Sichtbare Glyphen bei fehlenden Panels
dürfen nicht als gültiger Renderframe zählen. Shaderkompilierungs- und
Device-Validierungsfehler brechen die Prüfung ab; der korrigierte Pfad erhält
eigene Backend- und Bildnachweise.

### Nachgeprüfter lokaler Stand

Build `fluid-2006dfa3f94ae832a214` korrigiert die Linsenorientierung und die
WebGL2-Shaderübersetzung. Die vollständigen deterministischen Raster und
ausgewählte originale Phasen der drei neuen Effekte werden getrennt für WebGPU,
WebGL2 und schmale Ansichten archiviert. Die sechs Desktop-Diagnosen umfassen
je 100 Wiederholungen und 100 isolierte visuelle Retargets; natürliche warme
Schedulerintervalle liegen bei P95 8,4–8,9 ms und Maximum 9,1–16,7 ms, ohne
Intervalle über 50 ms. Diese Werte sind keine GPU-Timestamps und lassen den
Startabstand bis zum ersten Frame aus.

Die buildgebundenen Nachweise (internes Archiv)
benennen jede Geräte-, Backend-, Frame- und Reviewgrenze. Die Bildprüfung erfolgte
durch einen getrennten AI-Agenten; sie wird nicht als menschliche oder
geräteübergreifende Freigabe bezeichnet. Direkte Navigation und der Eingabe-Proof
werden separat dokumentiert. Bestehende AT-/Mobile-/IME-/CJK-Gates bleiben offen;
im lokalen Eingabeversuch blieb CJK-Text im Core erhalten, wurde vom vorhandenen
Font aber nicht vollständig sichtbar gezeichnet.

Die abschließende Eingabeprüfung fand zusätzlich zwei getrennte Ursachen: Ein
ausgehendes, für Replay gecachtes Eingabefeld behielt seine Auswahlmarker; danach
lieferte Glyph nach Layoutänderungen vor `shape()` noch keine Auswahlgeometrie.
Eine gemeinsame Sichtbarkeitsprüfung und genau ein Layoutcommit vor Auswahl/Caret
beheben diese Ursachen. Reale Glyph-/Projektfont-Regressionen und die getrennten
Patchbuilds `fluid-47ea533eb1602bbecd0e` und `fluid-d9f34d61a94c9d556b63`
belegen den engeren Korrekturumfang. Die breite Viewport-/Ressourcenmatrix bleibt
korrekt Build 2006 zugeordnet; sie wird nicht als erneuter Patch-Stresstest ausgegeben.

Der geprüfte Runtime-Stand umfasst **215 erfolgreiche Tests in 24 Dateien**;
die anschließende reine Doku-Generator-Korrektur ergänzt einen Regressionstest
für Buch-/Kapiteldaten zu **216 Tests**. Der laufende GPU-Build wird dabei nicht
umetikettiert. Strict TypeScript, ESLint und der unterstützte ai-design-check sind
grün. Die [aktuelle AC-Matrix](../acceptance-matrix.md) nennt die acht verbleibenden
M7-Grenzen ausdrücklich. Das ist kein Abschluss der gesamten Release-Roadmap.

## Frühe visuelle Lieferung M7a

Eine bewusst gestartete Vorführung verwendet diese Stationen:

1. Echte Tabelle als Ausgangspunkt.
2. Silk Cascade führt zu Karten mit erhaltener Sortierung und Auswahl.
3. Liquid Lens öffnet das ausgewählte Detail und führt zurück.
4. Particle Weave ordnet die Karten als Dependency Map an.

Der Nutzer kann übernehmen, stoppen und jeden Effekt separat wiederholen. Desktop
und schmale Ansicht werden gezeigt; der Codex-Browser bleibt geöffnet. M7a ist
ein visuell prüfbarer Zwischenstand und wird nicht als vollständige M7-Abnahme
ausgegeben. Befunde werden vor der nächsten Abnahme korrigiert.

## Abnahme

- Sechs eindeutig versionierte Rezepte besitzen gemeinsame Metadaten für Titel, Stil, Parameter, empfohlenes Preset und Ressourcenanforderungen.
- Bestehende Rezeptversionen, Seed-Berechnung und gespeicherte Random-Pools bleiben unverändert interpretierbar; neue Rezepte werden bewusst in Pools aufgenommen.
- Rezept-, Modus-, Seed- und Parameteränderungen verändern weder die fachliche Snapshotrevision noch den bereits laufenden aufgelösten Effektplan.
- Alle sechs Rezepte und Auswahlmodi sind bei 320/390/768/1280 px Browserbreite lesbar und erreichbar; tatsächliche Surfacebreite, Dockhöhe und Folgeinhalte benutzen eine konsistente Layoutberechnung ohne horizontale Überläufe.
- Studio und Showcase benutzen dieselben Einstellungen; reine Rezeptwahl erhält individuelle Parameter und „Preset anwenden“ setzt die empfohlenen Werte ausdrücklich.
- Silk Cascade bewegt zusammengehörige Parts mit gemeinsamer Phase auf ruhigen gestaffelten Bahnen, bewahrt ausgewählte Identität und ist visuell von Spring Reflow unterscheidbar.
- Liquid Lens erzeugt nachweisbare lokale Hintergrundbrechung mit organischer Kontur; sie liest nie aus einer gleichzeitig als Schreibziel gebundenen Textur.
- Text, Fokus, Caret, aktive Eingabe und Effektsteuerung bleiben außerhalb der Linsenverzerrung und erhalten korrekte Überdeckung, Clipping und Lesbarkeit.
- Particle Weave ordnet begrenzte instanzierte Fragmente stabilen Komponenten-IDs zu, übernimmt Themefarben, verwendet keine Schriftfragmente und hinterlässt am Ziel keine sichtbaren Partikel.
- Jeder Sampler besitzt exakte Quell-/Zielendpunkte und liefert bei gültigen Parameterrändern ausschließlich endliche Werte und gültige Geometrie.
- Direkte und zufällige Seek-Reihenfolgen einschließlich 0 → 1 → 0,5 → 0 reproduzieren dieselbe Darstellung wie reguläre Wiedergabe am jeweiligen Zeitpunkt; entfernte Quellobjekte sind rekonstruierbar.
- Unterbrechungen bei 25/50/75 % sowie wiederholte Unterbrechungen während des Abbaus erhalten den aktuellen sichtbaren Zustand ohne Geistertexte, veraltete Endpunkte oder wachsende Effektschichten.
- Bestehende VisualScenario-v2-Aufzeichnungen importieren unverändert; v3 exportiert/importiert auch unterbrochene Linsen-/Partikeldarstellung mit validierten Grenzen, Versionen und Referenzen ohne ausführbaren Code.
- Dekorative Effekte erzeugen keine Pointer-/Tastaturziele; ausgeblendete oder verdeckte Controls sind keine unsichtbaren Pointerziele und Fokus-, Auswahl-, Texteingabe- und IME-Verhalten bestehen im vorhandenen Eingabe-Proof.
- Sortierung, Suche, Auswahl, Daten-IDs, Navigation und Back/Forward bleiben konsistent; Effektparameter erzeugen keine History-Einträge und Replay führt keine fachlichen oder externen Mutationen aus.
- Reduced Motion erzeugt unmittelbar das vollständige gültige Ziel ohne Zusatzeffekt; Nutzerübernahme, Pause und verborgenes Dokument führen nicht zu unkontrollierter Bewegung.
- Die neuen Effekte verwenden das vorhandene Device und den zentralen Surface-Scheduler; Endzustände rendern ohne begründeten Bedarf keine zusätzlichen Frames.
- Das pro Run eingefrorene Standardprofil begrenzt Partikel auf 2.048 und zwei Render Targets auf jeweils maximal 2.048 Pixel je Kante; das Kompaktprofil begrenzt sie auf 512 beziehungsweise 1.024 Pixel und reduziert nicht die normale GPU-Textauflösung.
- Nach 100 Wiederholungen mit Replay, Unterbrechungen und Disposal wächst der Ressourcenbestand nach Aufwärmen nicht dauerhaft; neue Targets, Buffer und Jobs haben überprüfbare Besitzer und werden auch bei Fehlern freigegeben.
- WebGPU und erzwungenes WebGL2 werden separat geprüft; das tatsächliche Backend, ausgewähltes und verwendetes Rezept sowie begründete Reduktionen sind sichtbar, nicht unterstützte Kombinationen werden nicht als bestanden ausgegeben.
- Tabelle ↔ Karten, Karten ↔ Map und Karten ↔ Detail bestehen Start-/25-/50-/75-/Endprüfungen sowie Resize und die Größenmatrix ohne Textüberschneidungen, Geistertexte, redundante Statuslabels oder abgeschnittene Controls; die drei ursprünglichen Rezepte bleiben Regressionen.
- Vollständige deterministische Bildfolgen der drei Vorführungen besitzen Frame-/Zeit-/Build-/Backend-/Seed-/Rezeptbezug und eine Vollständigkeitsprüfung; fehlende Frames bleiben inconclusive und einzelne CapturedFrames werden nicht als Vollsequenz umgedeutet.
- Ein separater Echtzeitlauf dokumentiert Gerät, Browser, Viewport und P95-Framezeit gegen das Desktopziel 16,7 ms; langsames Screenshot-Sampling ist kein FPS-Nachweis und nicht bestandene Profile bleiben offen.
- M7a zeigt die vier beschriebenen Stationen mit tatsächlichen Workspace-Daten auf Desktop und schmaler Ansicht, erlaubt jederzeit Übernahme und separate Wiederholung und wird im geöffneten Codex-Browser als Zwischenstand übergeben.
- Feature-Matrix, Tasks, AC-Register, Mermaid-Flows, README und beide OKF-Bundles beschreiben denselben nachgewiesenen Umfang; M7-Kriterien werden vom kanonischen Parser erfasst und bestehende offene Gesamtplangates nicht pauschal hochgestuft.
- Neue Aufzeichnungen und Qualitätsartefakte übernehmen die bestehenden Redaktions-/Sensitivitätsgrenzen; vertrauliche Inhalte werden nicht durch den Darstellungssnapshot oder Sequenzexport zusätzlich offengelegt.
- ai-design-check bleibt auf seine unterstützten Prüfungen begrenzt und optionale AI-Kritik läuft über Vercel AI SDK; Empfehlungen ersetzen keine deterministischen, manuellen oder Hardwaregates und ihre Abdeckung bleibt sichtbar.

## Prüfablauf und Nachweise

Unit-/Property-Tests prüfen unabhängige Endpunkt-, Identitäts-, Begrenzungs- und
Policy-Invarianten. Die tatsächliche Surface ergänzt Shader-Kompilation,
Glyphengeometrie, Bildfolge, Eingabe und Backendvergleich. Kontaktbögen dienen der
Orientierung; kritische Einzelbilder und der Echtzeitlauf werden separat angesehen.
Die bestehende SDF-Prüfung wird nicht als Abnahme neuer Effektfunktionen verwendet.

Ein Befund führt zu einer Ursachenbehebung und zur Wiederholung der betroffenen
Sequenz einschließlich ihrer Nachbarn. QA-Artefakte nennen den geprüften Build,
Ressourcen-/Geräteprofil, Abdeckung und verbleibende Einschränkungen. Historische
M1–M6-Nachweise bleiben unverändert und behalten ihren ursprünglichen Scope.
