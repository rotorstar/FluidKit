# M5: vollständiger AC-Abgleich und Schließen der Grundlagenlücken

Stand: 2026-11-01. Der Auftrag betrifft den gesamten Plan, nicht nur M4.
Die Umsetzung wird anhand einer einzelnen AC-Matrix verfolgt; offene Kriterien
werden weder durch Feature-Namen noch durch einen grünen Build geschlossen.

## Entscheidung vor Implementierung

Gewichte 30/25/20/15/10 wie im Gesamtplan, Ratings 1–5.

| Entscheidung | A | B | Hybrid | Gewinner |
|---|---|---|---|---|
| AC-Abgleich | weitere manuelle Statusliste [3,3,2,5,2] = 60 | alles aus Testnamen ableiten [3,2,4,4,3] = 62 | kanonische AC-Texte plus explizite Evidenz und Drift-Prüfung [5,5,5,4,5] = 97 | H |
| Lifecycle-Abnahme | Mock-Counts [2,2,3,5,2] = 53 | nur manuelles Profiling [4,4,2,2,3] = 64 | echte Mount-Zyklen plus explizite Resource Ownership [5,5,5,4,5] = 97 | H |
| Daten-/Action-Vertrag | universelle Datenplattform [4,3,3,1,5] = 64 | ausschließlich Host-Code [3,4,3,5,3] = 71 | kleine validierte Adapter mit Abort, Revision und Idempotenz [5,5,5,4,5] = 97 | H |
| Projektdateien | direkt überschreiben [3,1,2,5,2] = 50 | Datenbankpflicht [4,4,4,2,4] = 74 | lokale atomare Revisionen und Export mit Konfliktprüfung [5,5,5,4,5] = 97 | H |

## Abgleich

- Alle T01–T49, zusätzliche Milestone-Verträge und übergreifende Releasegates
  erhalten stabile AC-IDs, unveränderten Quelltext, Status, Scope und Nachweis.
- Status: verifiziert, implementiert/unverifiziert, teilweise, offen oder externer
  Nachweis erforderlich. Ein Testdateipfad allein ist keine Messung auf Zielhardware.
- Änderungen am kanonischen AC-Text werden erkannt. Fehlende Einträge, tote
  Nachweise und verifizierte Kriterien ohne Evidenz lassen den Checker fehlschlagen.
- Die Feature-Matrix verlinkt auf den AC-Abgleich. Ein Proof bleibt ein Proof;
  nur eine vollständig belegte AC-Menge erlaubt die entsprechende Abnahme.

## Ergänzung vom 2. November 2026

[M6](m6-plan.md) und T50–T58 ergänzen einen begrenzten visuellen Design-/Rehearsal-Proof sowie den zentralen Studio-Qualitätsbereich mit AI-Kritik. Der minimale vertikale Schnitt wird vor weiterer Komponentenbreite sichtbar. Die folgende Grundlagenreihenfolge, Persistenz-, Provider- und AT-/Hardware-Gates bleiben bestehen. Bestehende M5-Nachweise werden nicht als zeitlicher Vollscan umgedeutet.

## Umsetzungsreihenfolge

1. T01/T19/T43: Abgleichsmatrix und maschinenprüfbares Nachweisregister erstellen.
2. T04/T08/T45: Lifecycle und Fehlerzustände schließen; echte 100 Mount/Unmount-
   Zyklen, On-demand-Frames und Geräteverlust messen. Verwaltete Ressourcen und
   nicht messbarer Treiberspeicher bleiben getrennt.
3. T05/T06/T07: Scroll-/Clipping-/Layout- und Typografie-/Eingabelücken abhängig
   vom Renderer schließen; reale große Datensätze statt erzeugter Produktdaten.
4. T15: wiederverwendbare Query-/Action-Adapter mit Runtime-Validierung, Abbruch,
   Revisionsschutz, Revalidation, Berechtigungen und Idempotenz implementieren.
5. T16/T17/T20: lokale Projektversionen, explizite Schreibgrenzen, Authoring und CLI
   auf denselben Verträgen aufbauen; Konflikte und beschädigte Dateien nachprüfen.
6. Weitere Waves folgen den ursprünglichen Abhängigkeiten. Fehlende reale
   Anbieter-/Hostdaten, Zugangsdaten, Headsets und manuelle AT-/Geräteprüfungen
   werden als konkrete Voraussetzungen in der Matrix geführt, nicht simuliert bestanden. Nach Nutzerfreigabe werden Immobilien-, Commerce- und Reise-Mockdateien mit realistischer Struktur zusätzlich im markierten Simulationsmodus gebaut; die Anbieterrecherche und deren eigene Abnahme stehen in [provider-apis.md](../research/provider-apis.md).

## Relevante Flows

User: AC wählen → Nachweis öffnen → Ursache schließen → erneut prüfen → Status
mit Scope aktualisieren. Daten: kanonischer Plan → AC-Vertrag → Evidenz → Matrix.
State: offen → implementiert → verifiziert; Text-/Codeänderungen können Evidenz
veralten lassen. URL: bestehende Case-URLs bleiben gültig; Prüfläufe und Projekte
verwenden eigene explizite Referenzen statt laufende Animationen zu navigieren.

## Recherchebasis

1. November 2026: installierte Three/Glyph-/Node-APIs gegen öffentliche Deklarationen
geprüft. Keine sachfremden Upgrades.
[WebGPU-Lebenszyklus](https://www.w3.org/TR/webgpu/),
[Three Renderer](https://threejs.org/docs/#Renderer),
[Fetch und Abbruch](https://fetch.spec.whatwg.org/),
[Node-Filesystem und Dateihandles](https://nodejs.org/docs/latest-v24.x/api/fs.html).
