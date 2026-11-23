---
type: "Release Reference"
title: "Release-, Feature- und AC-Stand"
description: "Umgesetzter Alpha-Schnitt, offene Produktarbeit und verbindliche Nachweisregeln."
audience: "engineering"
tags: ["fluidkit", "release-roadmap"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-23T10:37:01Z"}
stale_after: "2026-12-14T00:00:00Z"
sources: [{"id": "implementation", "resource": "assets/source-inventory.json", "title": "Geprüfter Implementierungsstand"}]
---

# Datierte Baseline

Der Grundlagenplan bleibt `docs/implementation-plan.md`, das Taskregister
`docs/feature-status.json`, das Einzelregister `docs/acceptance/ledger.json`.
Die Knowledge beschreibt die Implementierung und verweist auf diese ursprünglichen
Verträge; sie ersetzt sie nicht.[^implementation]

| Reifestufe | Vorhandener Stand |
|---|---|
| M1 | grundlegender State-/Input-/GPU-Proof |
| M2 | adaptive echte Workspace-Ansichten und URL-Vertrag |
| M3 | Effektmodell, Library, Studioeditor und Readback-Proof |
| M4 | kombinierte statische/DOM-/GPU-/Semantikqualität |
| M5 | Einzel-AC, Nachweisbindung und synthetische Praxis-Cases |
| M6 | kausale Story, ausgewählte Bilder, Vergleich und echte OpenAI-Review |
| M7 | sechs Effekte, responsive Library, vollständige lokale Bildfolgen und getrennte Ressourcen-/Pacingdiagnosen |
| M8 | Multipart-/Layout-/Collection-Funktionen, Studiovergleich und begrenztes Authoring;41 Kriterien im lokalen Scope nachgewiesen |
| M9 | Flow Explorer, Vergleich, Atlas und acht Farbpaletten plus eigener Akzent;21 Kriterien im lokalen Scope nachgewiesen |

Die datierte Baseline vom 4. November umfasst 58 Tasks und 435 kanonische Kriterien.
Die historische Ausgangsversion hatte 408 Kriterien mit 94 im Scope belegten,
190 teilweise belegten, 123 offenen und einem externen Nachweis. Der damalige
Abgleich führt 121 verifizierte, 190 teilweise geprüfte, 123 offene und einen
externen Nachweis; alle 27 M7-Kriterien sind im dokumentierten lokalen Scope
qualifiziert. Die Nov4-Nachprüfung umfasst 267 Tests/33 Dateien, 144 kontrollierte
Ansichtswechsel/720 Kontrollbilder, native Journeys und getrennte tatsächliche
Surface-/Privacy-/Media-/Visibility-Prüfungen. Der manuelle OS-Dead-Key-Pfad ist
funktional korrekt; sein beobachtetes Ende bleibt untrusted, der Zähler vollständig
trusted Zyklen bleibt null. Keine allgemeine IME-/AT-/Hardwarefreigabe.
Ein Teilcheck kann erfolgreich sein, während das Gesamtrelease weiterhin blockiert.
Die portable [vollständige Feature-Matrix](feature-matrix.md) und
[alle Einzelkriterien](acceptance-reference.md) werden aus denselben Registern erzeugt.

## Formübergänge und lokales Studio

R1–R6 ergänzt 13 Kriterien. Der Stand vom 20. November 2026 umfasst damit 510 Kriterien in 69 Tasks. Zeile–Karte, Atlas–Mitglieder und Auswahl–Vergleich sind die drei Referenzübergänge. Das Register bindet jedes Ergebnis an seinen eigenen Lauf. [Aktueller Abgleich](acceptance-reference.md) · [Bewegungsverträge](effects.md)

## M11 · Mehrsprachigkeit in Planung

Der Vorschlag in `docs/milestones/m11-multilingual-plan.md` beginnt mit einer
Modulwerkstatt mit Deutsch, Englisch und Französisch. Die Referenzprofile sind
`de-DE`, `en-GB` und `fr-FR`. Der erste Proof prüft alle sechs Wechselrichtungen,
für Französisch auch den geschützten Gruppenabstand U+202F auf der GPU.
Studio, GPU und Semantik verwenden einen gemeinsamen
Nachrichtenkatalog. Sprache erhält eine eigene Darstellungsrevision, während
fachliche IDs, Auswahl und Entwürfe erhalten bleiben. Alte Aufnahmen behalten
ihren Originaltext. Die acht geplanten Tasks umfassen auch Sprachpfade,
Anbieterinhalte, KI-Antworten und sprachgebundene Offline-Handbücher.

## M10: Soundfeedback — Entwurf, noch nicht implementiert

Die Recherche vom 14. November bereitet Klangpaletten für eine nächste Version
vor. `docs/milestones/m10-sound-plan.md` enthält sieben vorgeschlagene Tasks mit
30 offenen Entwurfs-AC; `docs/research/sound-feedback.md` dokumentiert die
Primärquellen, `docs/flows/sound.md` die User-/Daten-/State-/URL-Verträge und
`docs/decisions/m10-sound-scores.json` die nachrechenbare Optionsbewertung.
Diese Arbeit ist zur Besprechung vorbereitet und erweitert noch nicht das
zum damaligen Zeitpunkt geführte M9-Register mit 69 Tasks und 497 Kriterien.

Empfohlen wird eine optionale Web-Audio-Schicht: bestätigte semantische Events
und die bestehende Playback-Timeline lösen versionierte Cue-Pläne aus. Audio
erhält eigene Fehler- und Ownership-Grenzen; weder Core noch reiner GPU-Sampler
führen Audio-APIs aus. Stummer Start, ausdrückliche Aktivierung, kontrollierter
Abbruch, stummes Scrubbing und unveränderte ältere VisualScenarios sind zentral.
Farb- und Klangpaletten sind unabhängig.

Die erste geplante Hörprobe vergleicht Silk, Glass und Pulse in drei echten
Workspace-Cases mit dem stummen Kontrollpfad. Die Zielbibliothek umfasst acht
Gestaltungsrichtungen. Digitale Signaltests, menschliche Hörprüfung und mit
CPU-/GPU-Fremdlast dokumentiertes Live-Timing bleiben getrennte Nachweise.
Eine Offline-WAV-Datei beweist keine tatsächlich hörbare Synchronität. Es gibt
noch keine erzeugten Klangassets, Audiobenchmarks oder M10-Freigabe.

## M9: neue Perspektiven und Farbwelten

Seit dem 14. November sind [Flow Explorer, Vergleich und Atlas](perspectives.md)
sowie die gemeinsame [Farbsteuerung](appearance.md) implementiert. Der lokale
Review behauptet keine externe Freigabe. Der Atlas zeigt echten Codeumfang,
keine Qualitätswertung. Blau ist die Vorgabe; acht Paletten und eigene Akzente
ändern weder fachliche Daten noch URL oder gespeicherte Replayfarben.

M9 ergänzt T66 bis T69 mit 21 Kriterien, die im dokumentierten lokalen Scope
nachgewiesen sind. Das M9-Register umfasste am 14. November 69 Tasks und 497 Kriterien: 183 im Scope
belegt, 190 teilweise, 123 offen und ein externer Nachweis. 608 Tests in 67 Dateien,
TypeScript, ESLint, Paket- und Produktionsbuild bestehen. Sechs aktuelle
Original-GPU-Aufnahmen zeigen Desktop und schmale Ansichten; vier Workspace-
Qualitätsberichte enthalten null Fehler und null Warnungen. Die Flow-Aufnahmen
melden null Text- und Zielgeometrie-Befunde. Ein eigener Produktionslauf prüft
zusätzlich die explizit reduzierte Bewegung.

Die Nachweise sind unter `docs/qa/2026-11-14-m9/final-verification.json` und dem
separaten Dokumentationsnachweis gebunden. Das ist eine lokale M9-Abnahme,
keine Freigabe sämtlicher Geräte, Screenreader oder Performancebudgets. Die
folgenden M7-/M8-Werte bezeichnen unverändert erhaltene historische Nachweise.

## M8: angenommener Plan und aktuelle Lieferung

Am 13. November wurde ADR-0007 mit dem Hybridansatz angenommen: Komponenten und
Verhalten zuerst, gemeinsames Layout und gezielte öffentliche SDK-Adapter. Der
Gesamtplan ergänzt T59 bis T65 um 41 Kriterien; damit umfasst er 65 Tasks und
476 Kriterien. Die vorherigen 435 Kriterien, darunter 27 M7-Kriterien, behalten
Text, Identität und historische Nachweise. Die zusätzlichen Kriterien werden
anhand eigener Nachweise qualifiziert, nicht aus dem alten Status hochgestuft.

Der Abschlussabgleich führt alle 41 M8-Kriterien als im bezeichneten lokalen
Scope nachgewiesen. Native Desktop-/Kompaktarchive binden Bild, Trace und
Geometrie desselben Runs. Der eigene Messauftrag ist mit negativem Ergebnis
und beobachteten Lastgrenzen abgeschlossen; das Budget bleibt failed und die
Performancevalidität not-qualified. T29 und globale Produktionsgates bleiben offen.

| Task | Gegenstand | Stand dieses Kapitels |
|---|---|---|
| T59 | kanonische Multipart-Verträge | fünf Kriterien im dokumentierten lokalen Scope qualifiziert |
| T60 | gemeinsame aufgelöste Geometrie | Core-/Yoga-Pfad und Bridge implementiert; aktuelle 144/720-Geometriecoverage bestanden |
| T61 | Auswahl, Typeahead und Workspace | sechs Kriterien qualifiziert; native Desktop-/Kompaktarchive mit gemeinsamen Bild-/Trace-/Geometriebezügen |
| T62 | Studiovergleich UI SDK / Base UI | native Vergleichswege inklusive korrigierter Attribution bestanden; pro Baustein entschieden |
| T63 | begrenzte Fluid-Agent-Bridge | sieben Kriterien im lokalen API-/Policy-Scope qualifiziert |
| T64 | Entwicklungsagent und AI-Authoring | sechs Kriterien lokal qualifiziert; historischer Live-Workflow und spätere Korrekturen getrennt belegt |
| T65 | Conformance, Messung und Dokumentation | sieben Kriterien einschließlich negativer Messbewertung qualifiziert; kein T29-Leistungs- oder allgemeiner Produktionspass |

Die Lieferung enthält reale Tabelle/Karten/Map, Mehrfachauswahl, Tastatur,
Kontextinspector und deterministische M7-Effekte. Die aktuelle Matrix deckt
sechs Richtungen × vier Breiten × zwei Backends × drei neue Effekte ab:
144 Fälle und 720 Kontrollpunkte, mit höchstens 0,007812 CSS-px Abweichung
nativer Ziele. Die Seeds unterscheiden sich zwischen Läufen; Coverage ist
kein Same-Seed-Pixelvergleich. Sieben Originalbilder wurden separat visuell
geprüft, nicht alle 720 einzeln. Native Journeys behalten eigene Belege.

Der abschließende M8-Regressionsstand umfasst 544 erfolgreiche Tests in 59 Dateien,
strikten Typecheck und ESLint. Nach dem gebundenen Capture-Export bestanden alle Prüfungen sowie der gesamte
Paket-/Studio-Produktionsbuild erneut. Die getrennten Logs und Quellhashes stehen
im Abschlussnachweis vom 13. November. Ältere Sourcebezüge erhalten konkrete Requalifikationen
statt einer pauschalen Hochstufung ihrer GPU-/Providerbelege.

Der isolierte Bundlevergleich misst für die kombinierten UI-SDK-Adapter
16.779 zusätzliche gzip Bytes gegenüber Base UI unter identischen Bedingungen.
Das gesamte Next.js-Anwendungsdelta ist damit nicht bestimmt. Die separate
Echtzeitdiagnose überschreitet P95 ≤16,7 ms: höchster Fall-P95 34,1 ms mit
WebGPU und 17,7 ms mit WebGL2, jeweils ohne zusätzliche Idle-Frames. Da die
CPU-/GPU-Fremdlast nicht ausreichend belegt ist, bleibt die Benchmarkgültigkeit
unqualifiziert. Das ursprüngliche Budgetresultat bleibt failed; T65-AC05
bewertet den ausgeführten Messauftrag einschließlich dieser Grenzen. T29 bleibt offen.

Eine weitere WebGPU-Messung mit paralleler Lastaufzeichnung erfasste 18 Fälle: höchster
Fall-P95 17,6 ms, Maximum 66,7 ms, fünf Intervalle über 50 ms, keine Idle-Zusatzframes.
Das Budget bleibt verfehlt. Die gemessene CPU-/Collectorlast führte zu
`contaminated`; unbekannte GPU-Einheiten und Tab-Zuordnung erlauben keine
Benchmarkfreigabe. Die aktuelle [Performance-Methodik](performance-lifecycle.md)
trennt diese Grenzen von den numerischen Ergebnissen.

Der aktuelle Einzelstatus steht im generierten [AC-Abgleich](acceptance-reference.md).
Screenshots und Zahlen der M7-Baseline belegen ihre jeweiligen damaligen Builds;
eine neue M8-Geometrie wird damit nicht rückwirkend freigegeben.

T63 bleibt von der Modellanbindung getrennt. T64 verwendet ein begrenztes
Dokument als Entwicklungsdiff und Laufzeitkomposition; es ist kein universeller
Agent, der neue Komponenten oder Projektdateien autonom installiert. Die
isolierte Kandidatenvorschau und der neue Studio-/Live-AI-Pfad sind in einem
eigenen lokalen WebGPU-Lauf geprüft. Dieser Erfolg ergänzt Unit- und Negativtests,
belegt aber keine vollständige Plattformfreigabe. Alte Reviewaufrufe werden
nicht als Authoring-Nachweise übernommen.

## Weiter offene Themen

Vollständige Widgets und Form-/Wizard-/Nav-/Modal-Semantik; breite IME-/Screenreader-/
RTL-/CJK-/Mobile-Matrix; geräteübergreifende Bewegungserfassung und Pacing; persistentes
Studio-Authoring/Runs/URLs; reale Anbieteradapter und Hosttransaktionen; zusätzliche
Intents und Messung der Vorschlagsqualität mit echten Nutzern, Preload und Personalisierung; durable Budget-/Projektrollen; breite AI-Evaluation;
Collaboration, Plugins, Enterprise, Voice, XR, Forschung und Marketplace.

Marketplace bleibt die letzte Distributionsstufe. Negative Forschungsergebnisse
können eine Vision fachlich entscheiden, sind aber kein implementiertes Feature.
Conversion-/Performanceversprechen ohne Messung bleiben Hypothesen/Ziele.

## Aktuelle UI-Reviewpunkte

Die Hauptnavigation steht vor den Effekten; breite Tabellen schreiben
„Abhängigkeiten“ aus. Kleine Surfaces kürzen Overlines und verwenden angemessene
Innenabstände. Weitere Effektdichte, explizite Detail-Herkunft/Rückweg und optionale
Gruppierung von Paketbezügen bleiben begründet als Designarbeit in T13/T14/T47/T55.
Eine AI-Empfehlung ist dabei Eingangsmaterial, kein automatisches Feature-Gate.

Die neue Knowledge führt T38 weiter. Strukturelle Dokuprüfung ist keine pauschale
Erfüllung aller Tutorial-, Integrations-, Community- oder Produktionskriterien.

[^implementation]: Implementierung und SHA-256-Dateibindung im Quellinventar.

## M11 und MIT-Quellausgabe

Acht zusätzliche Kriterien verfolgen die Sprachprofile für Deutsch, Englisch und Französisch. Der quelloffene Kandidat enthält einen reproduzierbaren Build, MIT-Lizenz und separate Drittanbieterhinweise. Die Vorführung verwendet echte Moduldaten aus dem jeweiligen Checkout. Die Messungen zu Schrift, Layout und Semantik werden von der externen Geräte- und Sprachabnahme getrennt erfasst.
