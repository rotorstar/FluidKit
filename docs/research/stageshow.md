# Stageshow: Recherche und Übertragung auf Fluid

Recherche: **2. November 2026**. Geprüfte Originalquelle: Benji Taylor,
`benjitaylor/skills`, Commit
[`802057409787133703c56001080169e347305572`](https://github.com/benjitaylor/skills/commit/802057409787133703c56001080169e347305572)
vom 31. Oktober 2026. Die bereitgestellten Fotos waren der Rechercheanstoß;
maßgeblich sind Skill, Referenzen und ausgewählte Implementierungen dieses Commits.
Das [Quellenregister](stageshow-sources.json) bezeichnet die gelesenen Dateien.

## Ergebnis

**Ja: Die Methoden passen sehr gut zu unserer Qualitätslücke zwischen einer
technisch funktionierenden Surface und einem überzeugend gestalteten Produkt.**
Unsere Übernahme ist eine Architektur- und Prozessableitung. Ein Qualitätsgewinn
für Fluid wurde damit noch nicht gemessen; dieser wird in T56 kontrolliert geprüft.

Stageshow ist laut Autor ein Werkzeug für inszenierte Produktillustrationen und
animierte Demos. Seine Beispiele verwenden React/CSS und einen eigenen Szenenzustand.
Der Cursor stellt eine Handlung dar; er führt sie nicht in einer produktiven
Anwendung aus. Auch das Tabellenbeispiel ändert seine Beispielwerte ausdrücklich
im Script. Für Fluid müssen dagegen fachliche Events, Guards, Daten, URL und
Semantik die gezeigte Wirkung tatsächlich tragen.
[Skill](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/SKILL.md),
[README](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/README.md),
[Table Edit](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/examples/table-edit/index.tsx).

## Was die Originalquelle tatsächlich belegt

| Aussage | Befund | Bedeutung für Fluid |
|---|---|---|
| Gestaltung vor Code | Medium, Look, Story, Referenz, Screen, Choreografie und Probe sind explizite Schritte. | Vor größeren UI-Änderungen einen kurzen Design-Brief mit Ziel, Informationshierarchie, drei bis fünf Beats und erwarteter Wirkung schreiben. |
| Fünf typische Schwächen | Überladung, fehlender Produktkontext, eingequetschte Gesamtansicht, flache Hierarchie und austauschbare Gestaltung. | Als Review-Dimensionen aufnehmen, nicht als pauschale Regeln gegen Tabellen, Text oder Karten. |
| Textreduktion | Standard-Illustrationen verwenden wenige bedeutungstragende Texte. Der Skill kennt ausdrücklich realistische Dichte; sein Tabellenbeispiel beschriftet alle Zeilen. | Reale Werte in funktionaler UI erhalten. Platzhalter ausschließlich in gekennzeichneten Illustrationen oder tatsächlichen Ladezuständen. |
| Eigene Identität | Farben, Typografie, Radien und Dichte sollen aus dem Produkt kommen. | Bestehendes Inter-/Grün-System und die Light-Studio-/Dark-Surface-Richtung bewahren, rollenbasierte Tokens vervollständigen. |
| Bewegungsursachen | Objektidentität, abhängige Bewegungen, lesbare Endzustände und begründete Resets sind ausdrücklich beschrieben. | Fachlicher Commit bleibt atomar; die Präsentation visualisiert seine Ursache und abhängige Elemente auf derselben Timeline. |
| Mobile Komposition | Eine kompakte Variante ist eine eigene Komposition und keine verkleinerte Desktopansicht. | Dichte, Tracks und Fokusbereich am tatsächlichen Container ausrichten; Text und Hit-Testing nicht durch bloße Canvas-Skalierung verkleinern. |
| Filmen und Frameprüfung | Film erzeugt Bildreihen; ein separater Motion-Scan prüft DOM-Geometrie pro Animationsframe. Die Dokumentation warnt selbst, dass eine Kontaktübersicht Einzelbilder übersehen kann. | Vollständige zeitliche Evidenz ergänzen; fünf Prozent-Checkpoints bleiben hilfreich, beweisen aber keine fehlerfreie gesamte Transition. |
| Vergleichsverfahren | Der Autor beschreibt wiederholte Vergleiche mit und ohne Skill und anschließende Regelverbesserung. | Als Lernschleife übernehmen; das ist kein unabhängiger Wirksamkeitsnachweis oder garantierter Produktivitäts-/Conversion-Lift. |

Belege: [Craft](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/references/craft.md),
[Motion](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/references/motion.md),
[Looks](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/references/looks.md),
[Framing](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/references/framing.md),
[Rehearse](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/references/rehearse.md),
[Entstehungsbericht des Autors](https://benji.org/stageshow).

## Direkt übernehmen, transformieren, abgrenzen

| Muster | Übernahme | Konkreter Fluid-Vertrag / Task |
|---|---|---|
| Drei bis fünf Beats und ein klares Ergebnis | übernehmen | `StoryDefinition` mit Referenzen auf Flow, Szenario, Ziel und erwartete Invarianten, T50 |
| Bewusste Dichte und visuelle Gewichtung | transformieren | Primäraktion und ausgewähltes Objekt führen; technische Badges und Hilfstexte sind nachgeordnet, T50/T53 |
| Token-Mapping | transformieren | Eine versionierte Quelle erzeugt DOM-CSS und GPU-Werte; keine parallele Stageshow-Palette, T51 |
| Beibehaltene Identität und überlappende abhängige Bewegungen | transformieren | Stabile Part-IDs, gemeinsame Zeit, Retargeting vom dargestellten Bild; Textgröße bleibt lesbar, T52 |
| Gemessene Cursorziele | transformieren | Ziele aus Scene-/Part-Geometrie und gegebenenfalls Studio-Control-Adapter, nach Layout-/Kameratransformation, T52/T53 |
| Fokus, Crop und Kamera | transformieren | Inszenierungsgrenze deklarieren; keine abgeschnittenen operativen Controls, inverse Pointer- und Semantiktransformation, T53 |
| Poster / Reduced Motion | übernehmen und trennen | Aussagekräftiges vollständig gesetztes Standbild für die Demo; interaktive UI bleibt in allen fachlichen Zuständen bedienbar, T53 |
| Bildfolge, Drift- und Sprungprüfung | neu für Canvas ausführen | Pixel plus tatsächliche Scene-/Glyph-/Clip-/Opacity-Daten und Eventkorrelation, T54 |
| Eigene gute/schlechte Beispiele | übernehmen | Fluid-Korpus mit nachvollziehbaren Regeln, gleichen Testbedingungen und Rechte-/Datenherkunft, T56/T57 |
| Illustrierter Klick plus freies `set()` | nicht als Funktionsnachweis übernehmen | Scripts dispatchen gültige Events; ein abgewiesener Guard führt zu einem abgebrochenen Beat, keinem visuellen Erfolg, T52 |
| Sichtbare DOM-Kit-Primitives als Framework-Renderer | nicht übernehmen | Fluid rendert seine sichtbaren Komponenten weiterhin über Three/WebGPU-first; Studio-Authoring bleibt DOM. |
| Dekorative Zahlen, Erfolgsanzeigen und fremde Marken | nicht als Produktdaten übernehmen | Echte Workspace-Daten beziehungsweise ausdrücklich synthetische Szenarien; keine erfundenen Versand-/Buchungszustände. |

Die Referenzmuster [Table Edit](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/examples/table-edit/index.tsx),
[Choreography](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/examples/choreography/index.tsx)
und [Phone Touch](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/examples/phone-touch/index.tsx)
zeigen passende Beziehungen: Zelle → bestätigte Summe, Einstellung → abhängige
Felder und Karte → Detail mit erhaltener Identität. Wir übernehmen die Beziehungen,
keine fremden Produktidentitäten oder einen zweiten fachlichen Zustand.

## Warum die Film-Scripts nicht unverändert genügen

`film.mjs` nimmt echte Browserbilder auf. Die begleitenden Geometrie- und
Bewegungsprüfungen verwenden jedoch DOM-Selektoren, CSS und
`getBoundingClientRect()`. Eine WebGPU-Surface erscheint dort grundsätzlich als
Canvas-Rechteck. Ihre einzelnen Meshes, gezeichneten Glyphen, Clipregionen und
GPU-Effekte werden dadurch nicht automatisch geprüft. Das ist eine Ableitung aus
den gelesenen Implementierungen, kein ausgeführter Toolvergleich.
[Film-Einstieg](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/scripts/film.mjs),
[Motion-Scan](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/scripts/motion-watch.mjs).

Fluid ergänzt deshalb einen Capture-Adapter an der bestehenden Surface:

- Ein Frame besitzt Run-/Frame-ID, logische Zeit, rAF-/Capturezeit, Event- und
  Snapshotrevision, Rezept/Seed, Tokenversion, Backend, Viewport, DPR und Font-/Assethash.
- Rendererzustand und Glyphenmessung stammen aus der tatsächlich dargestellten
  Projektion, nicht aus einer zweiten Layoutberechnung oder nur dem Ziel-Snapshot.
- GPU-Arbeit und Bildaufnahme werden getrennt synchronisiert. Die Erfüllung von
  `GPUQueue.onSubmittedWorkDone()` beweist GPU-Abschluss, allein aber noch kein
  präsentiertes Compositorbild. Keine privaten Three-Felder verwenden.
- Deterministische Offline-Frames dienen Regressionen. Echtzeit-rAF-Verläufe
  prüfen zusätzlich Stottern, ausgefallene Frames, Visibility und Laufzeitkosten.
- Eine Kontaktübersicht enthält ausgewählte Bilder und gekennzeichnete dichte
  Grenzsequenzen. Die Analyse deckt die gesamte erfasste Folge ab; Lücken,
  Geräteverlust und fehlende Zuordnung führen zu **inconclusive**, nicht zu grün.
- Kontinuitätskandidaten erhalten Node, Frame, Ursache und eng begrenzte begründete
  Ausnahmen. Keine pauschale Pixel-Schwelle für alle kreativen Effekte und keine
  globalen Masken, die fehlerhafte Texte unsichtbar machen.

API-Grundlage: [WebGPU Queue und Zeitachsen](https://www.w3.org/TR/webgpu/#dom-gpuqueue-onsubmittedworkdone).
Ein versionsgebundenes Austauschformat für Tokens kann sich am stabilen
[DTCG Format 2025.10](https://www.designtokens.org/tr/2025.10/format/) orientieren;
dies ist ein Community-Group-Bericht, kein W3C-Standard. Ein unterstützter Teilumfang
wird ausdrücklich benannt, unbekannte Typen/Aliasse werden nicht stillschweigend verworfen.

## Kompatibilität und Nutzungsumfang

| Quelle / Bestand | Geprüfter Stand | Entscheidung |
|---|---|---|
| Stageshow | Privates Workspace-Paket 0.1.0 im genannten Commit; React 18.3-Linie, Vite 6, playwright-core 1.48-Linie in seinem Playground | Referenz lesen; weder dessen Lockfile noch Toolchain in Fluid übernehmen. |
| Fluid | React 19.2.9, Three 0.187.0, Glyph 0.1.0, bestehende TypeGPU-/Playwright-Pins | Bestehende kompatible Pins bleiben; diese Recherche benötigt kein Upgrade. |
| Source-Lizenz | MIT in `stageshow/LICENSE` | Substanzielle spätere Codeübernahmen müssen den Lizenzhinweis erhalten. |
| Drittmaterial | `NOTICE.md` nennt gesonderte Marken-/Icon-/Assetrechte | Eigene oder freigegebene Assets verwenden; MIT des Kits deckt nicht sämtliche Beispielgrafiken ab. |

Belege: [Paket](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/package.json),
[Lizenz](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/LICENSE),
[Notices](https://github.com/benjitaylor/skills/blob/802057409787133703c56001080169e347305572/stageshow/NOTICE.md).
Es wurde kein fremder Skill installiert, kein Script aus der Quelle ausgeführt,
kein Beispielcode in die Runtime kopiert und kein Browser außerhalb des bisherigen
Prüfwegs gestartet. Der aktuelle Auftrag liefert die angepasste Planung und ihre
prüfbare Traceability; der visuelle M6-Nachweis folgt als geplanter Milestone.

## Einordnung der bisherigen Nachweise

M5 hat 54 Endzustände, 60 ausgewählte Prozent-Checkpoints und 100 Lifecycle-Zyklen
im angegebenen Scope nachgewiesen. Das bleibt gültige historische Evidenz.
Es beweist keine lückenlose Bildfolge, keine Einzelbild-Sprungfreiheit und keinen
Stageshow-Qualitätsgewinn. Diese offenen Nachweise werden T54/T56 zugeordnet.
Accessibility bleibt zusätzlich eigenständig: [Pause/Stop/Hide, Level A](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
und [Animation from Interactions, Level AAA](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
werden korrekt eingeordnet; eine bestandene Filmprüfung ersetzt keine WCAG-Abnahme.

## Ergänzung: Studio und AI-Analyse

Auf ausdrücklichen Nutzerwunsch werden die Prüfungen im Studio zusammengeführt.
T55 stellt Design/Layout, Motion, Semantik und Runvergleich mit Frame-/Partbezug
dar; T58 ergänzt eine eigene multimodale AI-Analyse. Der Vorteil ist eine gemeinsame
Evidenzbasis: Statt eines losgelösten Screenshottipps erhält die Kritik Brief,
Tokenrollen, ausgewählte redigierte Frames und vorhandene Messergebnisse.

AI SDK 7 dokumentiert strukturierte Ausgaben und multimodale Prompts. Die konkrete
Bild-/Modellfähigkeit bleibt providerabhängig und wird bei Anschluss qualifiziert.
Die Ausgabe wird mit eigenen Schemata und existierenden Frame-/Partreferenzen
validiert. Modelltext und sichtbarer UI-Text sind keine Autorität zum Ausführen
von Änderungen. Pixelredaktion, Berechtigungen und eigene Qualitätsbudgets gehören
zum Review-Vertrag. Ein konfigurierter Provider oder ein bestandenes Modell-Eval
wird in diesem Planungsschritt nicht behauptet.
[Strukturierte Daten](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data),
[Prompt-/Bildnachrichten](https://ai-sdk.dev/docs/foundations/prompts),
[OWASP Prompt Injection](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html).
