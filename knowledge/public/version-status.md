---
type: "Release Note"
title: "Version, Umfang und Grenzen"
description: "Den aktuellen Alpha-Stand von der langfristigen Produktvision unterscheiden."
audience: "public"
tags: ["fluidkit", "version-status"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-14T06:46:48.647536Z"}
stale_after: "2026-12-14T00:00:00Z"
sources: [{"id": "product", "resource": "assets/product-facts.json", "title": "Dokumentierter Produktstand und Screenshotnachweise"}]
---

# Dokumentierter Stand

Dieses Handbuch beschreibt FluidKit `0.2.0-alpha.0`, die lokal geprüfte
M7-Erweiterung vom 4. November, den lokal qualifizierten M8-Umfang vom 13. November und die lokal qualifizierte M9-Erweiterung vom 14. November 2026. Die Abbildungen sind echte Aufnahmen mit dokumentiertem
Datum und Build: die ursprünglichen Bedienbilder stammen vom 2. November,
die Effektgalerie vom 3. November und die neue Prüfwerkstatt vom 4. November. Ältere Bilder belegen nicht nachträglich
neue Funktionen. Einzelne Werte können sich mit neueren Projektständen ändern.[^product]

## Aktueller Stand vom 20. November 2026

Die Modulwerkstatt führt drei strukturelle Übergänge vor. Im Studio lassen sich beide Bewegungsvarianten am selben Zeitpunkt betrachten. Entwurfsversionen und bewusst gespeicherte Bildnachweise sind lokal wieder aufrufbar. Das Register umfasst jetzt 510 Kriterien. Von den 13 neuen sind elf lokal belegt. Für die beiden übrigen stehen eine qualifizierte Geschwindigkeitsmessung und die Erprobung mit Personen aus. Die Erkennungsprobe mit unabhängigen Personen sowie die breitere Geräte- und Hilfsmittelprüfung sind offen. [Formübergänge bedienen](effects.md)

## Ausblick auf weitere Sprachen

Im ersten geplanten Sprachwähler stehen **Deutsch**, **English** und **Français**
zur Wahl. Beschriftungen, Zahlen und vorgelesene Namen wechseln gemeinsam. Als erste Vorführung ist ein Wechsel in der Modulwerkstatt
vorgesehen, während eine Tabellenzeile zur Karte wird. Auswahl und eigene
Eingaben sollen dabei erhalten bleiben. Der Sprachwähler ist in dieser Ausgabe
noch in Planung.

## Ausblick: wählbare Klangwelten

Für eine nächste Version wird optionales Soundfeedback vorbereitet. Geplant sind
acht Klangrichtungen und eine erste Hörprobe mit **Silk, Glass und Pulse**:
weich und elegant, klar und gläsern oder trocken und präzise. Dieselben Aktionen
sollen sich stumm und mit unterschiedlichen Klängen vergleichen lassen.

Der Vorschlag sieht bewusstes Einschalten, leicht erreichbares Stummschalten,
einen eigenen Pegel und vom Farbschema unabhängige Klangwahl vor. Alle Aufgaben
sollen weiterhin vollständig ohne Ton funktionieren. Übergangsgeräusche und
fachliche Rückmeldungen erhalten getrennte Bedeutungen.

**Dies ist ein Planentwurf vom 14. November 2026.** Die beschriebenen Audio-
Controls und Klangpaletten sind noch nicht verfügbar; es wurden noch keine
Klangdateien oder Hörtests als fertige Produktleistung freigegeben.

## Bereits bedienbar

Echter Workspace-Import, sortierbare Tabelle, Suche und Ebenenfilter, Karten,
Dependency Map, Moduldetail, Effektwahl und Parameter, Replay und Dateien,
geführte Rehearsal-Story, ausgewählte GPU-Aufnahmen, lokaler Bildvergleich,
kombinierte Qualitätsprüfer, optionale echte AI-Designanalyse und drei deutlich
gekennzeichnete Praxis-Simulationen.

M7 ergänzt Silk Cascade, Liquid Lens und Particle Weave zu sechs auswählbaren
Effekten, eine eigene Vorführung und die begrenzte Bildfolgeprüfung im Studio.
Die neuen Effekte wurden lokal mit WebGPU und WebGL2 geprüft; Ressourcen- und
Zeitmessungen behalten ihren konkreten Geräte- und Buildbezug.
Der datierte Abgleich vom 4. November führt 435 Kriterien, davon 27 zusätzliche M7-Abnahmen. Ihre
Umsetzung und reinen Funktionstests werden getrennt von visueller, manueller
Eingabe- und Gerätequalifikation geführt. Alle 27 M7-Kriterien sind im ausdrücklich
dokumentierten lokalen Umfang verifiziert. Dieser damalige Gesamtplanstand hat 121 belegte,
190 teilweise geprüfte, 123 offene Kriterien und einen externen Nachweis. Die
damalige Vollsuite umfasst 267 erfolgreiche Tests in 33 Dateien.

Die neue Werkstatt prüft feste Ansichtswechsel, Ressourcen und Capturegrenzen.
Eine manuelle OS-Dead-Key-Probe funktioniert im vorhandenen Proof; das
beobachtete Ende ist nicht vollständig als vertrauenswürdig qualifiziert. Daraus
folgt keine allgemeine IME-, Screenreader-, Mobil- oder Hardwarefreigabe.

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

## Neu im lokal qualifizierten M8-Umfang

Mehrere Module lassen sich gemeinsam auswählen und mit der Tastatur durchgehen.
Die Auswahl bleibt in Tabelle, Karten und Map erhalten; ein nichtmodaler
Kontextbereich zeigt die gewählten Module. Ein eigener Bibliotheksvergleich
unter `/studio/behaviors` verwendet wahlweise UI SDK oder Base UI für dieselbe
Arbeitsfläche. [Workspace](workspace.md), [Ansichten](views.md) und
[Tastaturbedienung](accessibility.md) erklären die neuen Wege.

Der angenommene M8-Plan ergänzt sieben Tasks und 41 Kriterien. Der Gesamtumfang
beträgt damit 65 Tasks und 476 Kriterien.

Der Abschlussabgleich führt alle 41 M8-Kriterien als im bezeichneten lokalen
Scope nachgewiesen. Native Desktop-/Kompaktarchive binden Bild, Trace und
Geometrie desselben Runs. Der eigene Messauftrag ist mit negativem Ergebnis
und beobachteten Lastgrenzen abgeschlossen; das Budget bleibt failed und die
Performancevalidität not-qualified. T29 und globale Produktionsgates bleiben offen. Die neuen Kriterien sind nicht allein
aufgrund der Implementierung erfüllt. Die neue Geometriematrix deckt 144 Fälle
mit 720 Kontrollpunkten ab; sieben Originalbilder wurden separat betrachtet.
Die Seeds unterscheiden sich zwischen Läufen, daher ist damit kein identischer
Pixelvergleich qualifiziert. Native Bedienung und globale Plattformfreigaben
sind eigene Abnahmen. Der abschließende M8-Regressionslauf enthält 544 erfolgreiche
Tests in 59 Dateien. Der gebundene Capture-Export wurde mit eigenem nativem Nachweis ergänzt;
alle Prüfungen und der vollständige Produktionsbuild bestanden danach erneut.

Der isolierte Bundlevergleich ergibt für die kombinierten öffentlichen
UI-SDK-Adapter 16.779 gzip Bytes mehr als für Base UI. Er beschreibt weder die
Gesamtgröße der Studioanwendung noch ihre Bedienqualität. Die Echtzeitdiagnose
überschreitet das 16,7-ms-Ziel; ihr höchster Fall-P95 beträgt 34,1 ms mit
WebGPU und 17,7 ms mit WebGL2. Beide behalten das Ergebnis failed. Weil
CPU-/GPU-Fremdlast dabei nicht ausreichend dokumentiert wurde, ist die
Benchmarkaussage noch nicht qualifiziert. Der Auftrag, sie zu messen und
ehrlich zu bewerten, ist abgeschlossen; eine positive Leistungsfreigabe
steht aus. Frühere M7-Nachweise behalten ihren
ursprünglichen Buildbezug.

Eine weitere WebGPU-Messung mit paralleler Lastaufzeichnung erfasste 18 Fälle: höchster
Fall-P95 17,6 ms, Maximum 66,7 ms, fünf Intervalle über 50 ms, keine Idle-Zusatzframes.
Das Budget bleibt verfehlt. Die gemessene CPU-/Collectorlast führte zu
`contaminated`; unbekannte GPU-Einheiten und Tab-Zuordnung erlauben keine
Benchmarkfreigabe. Die aktuelle [Qualitätsprüfung](quality.md)
trennt diese Grenzen von den numerischen Ergebnissen.

Die begrenzte Fluid-Agent-Bridge und der neue Authoring-Pfad sind inzwischen
implementiert. `/studio/authoring` bietet registrierte Bausteine, manuelle
Dokumentbearbeitung, optionalen AI-Stream, Preflight und Entwicklungsdiff.
Ein eigener lokaler OpenAI-/WebGPU-Lauf hat Entwurf, Preflight, isolierte Vorschau
und Übernahme mit erhaltener Auswahl und Notiz geprüft. Breite Plattformabnahme und Produktionsfreigabe bleiben offen. Die vorhandene AI-Designanalyse
ist eine eigene Funktion; der neue Nachweis wird getrennt geführt.
Neue M8-Aufnahmen tragen einen eigenen Buildbezug; ältere Bilder sind keine
Belege für die neue Mehrfachauswahl. Der Live-Authoring-Lauf bleibt an seine
damaligen Quellen gebunden. Spätere UI-/API-Änderungen werden eigens geprüft.

## Noch keine pauschale Produktzusage

Vollständiges visuelles Projekt-Authoring, dauerhaft gespeicherte gemeinsame Runs,
alle Widgetfamilien, sämtliche Accessibility-/Mobile-/Sprach-/Gerätekombinationen,
produktive Anbieterbuchungen, selbstlernende autonome Anpassungen, Collaboration,
Marketplace und die vollständigen Performance-/Releasegates sind noch offen.

Weder ein grüner Screenshot noch ein hilfreicher AI-Befund beweist, dass jede
Vision bereits umgesetzt ist. „AC-Abgleich“ zeigt Einzelkriterien und ihren Scope.
Die Oberfläche bleibt deshalb ausdrücklich eine Alpha.

## Diese Knowledge verwenden

Das Inhaltsverzeichnis führt zu den Aufgaben. Die HTML-Ausgabe bietet lokale
Suche, Querverweise und Mermaid-Flows. Bilder können in Originalgröße geöffnet
werden. Die Markdown-Dateien und Bilder lassen sich als eigenständiges OKF-Bundle
weitergeben. Eine neue Version benötigt überprüfte Quellen und aktualisierte
Aufnahmen; maschinelle Strukturprüfung ist keine erfundene menschliche Freigabe.

[^product]: Produktstand, tatsächliche Aufnahmerouten und Einschränkungen im Fakten-/Bildregister.
