---
type: "Troubleshooting"
title: "Probleme beheben"
description: "GPU-, URL-, Aufnahme-, Replay- und AI-Meldungen nachvollziehbar bearbeiten."
audience: "public"
tags: ["fluidkit", "troubleshooting"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-02T09:48:11.651994Z"}
stale_after: "2026-12-02T00:00:00Z"
sources: [{"id": "product", "resource": "assets/product-facts.json", "title": "Dokumentierter Produktstand und Screenshotnachweise"}]
---

# Häufige Probleme

| Meldung oder Symptom | Nächster sinnvoller Schritt |
|---|---|
| GPU wird initialisiert | kurz auf Backend und Schrift warten |
| WebGPU nicht verfügbar | Diagnose lesen; erlaubten Fallback beziehungsweise unterstützte Umgebung prüfen |
| Nur WebGPU verweigert Start | dieser Modus erlaubt absichtlich keinen WebGL2-Ersatz |
| Keine Module gefunden | Suchtext und Gruppenfilter prüfen, Filter zurücksetzen |
| Modul im Link existiert nicht | aktuelle Übersicht öffnen oder Ansicht zurücksetzen |
| Größe geändert | UI-Layoutprüfung erneut ausführen |
| Aufnahme verworfen | Zustand stabilisieren und neu aufnehmen |
| Sensible Parts verhindern Aufnahme | keine vermeintlich bereinigte Aufnahme erzwingen; Datenumfang prüfen |
| Replay ist klein oder schreibgeschützt | „Live-Ansicht“ wählen |
| Rezeptversion fehlt | passende aktuelle Aufzeichnung verwenden oder neu aufzeichnen |
| AI nicht konfiguriert | Administration prüft die serverseitige Konfiguration |
| Inputbudget überschritten | weniger beziehungsweise kleinere Bilder auswählen |
| Review-Limit erreicht | laufende Analyse beenden oder den begründeten Limitstatus mit der Administration klären |
| Deadline oder Abbruch | lokale Anwendung weiterverwenden; unbekannte Usage kann reserviert bleiben |

Diese Schritte beschreiben die aktuelle Alpha und ersetzen keine pauschale
Browser-/Gerätefreigabe.[^product]

## Eine gute Fehlermeldung erstellen

Notiere die genaue Abfolge, tatsächliches und erwartetes Ergebnis, Browser/OS,
Ansicht, Größe und Backend. Ergänze einen geeigneten Screenshot und den passenden
Prüfbericht. Prüfe vor Weitergabe, ob Bilder oder Exporte sensible Inhalte enthalten.
API-Keys, Cookies oder Sessiontokens gehören nicht in den Bericht.

Nutze keinen Serverneustart als vermeintliche Kostenabrechnung. Lokale
Budgetregister sind noch keine dauerhafte Anbieterrechnung. Für Daten-/Dateikonflikte
oder echte Anbietertransaktionen sind die jeweiligen Betreiber zuständig.

[^product]: Produktstand, tatsächliche Aufnahmerouten und Einschränkungen im Fakten-/Bildregister.
