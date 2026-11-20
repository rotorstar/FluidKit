---
type: "User Flow"
title: "Userflows und Autoritätswechsel"
description: "Nachvollziehbare Nutzerwege durch Workspace, Studio und Review."
audience: "engineering"
tags: ["fluidkit", "user-flows"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-02T10:36:38.364339Z"}
stale_after: "2026-12-02T00:00:00Z"
sources: [{"id": "implementation", "resource": "assets/source-inventory.json", "title": "Geprüfter Implementierungsstand"}]
---

# Nutzerwege

Die UI verbindet Exploration, nachvollziehbare Übergänge und getrennte Prüfung.
Der freie Showcase verändert den tatsächlichen lokalen Core; die geführte
Rehearsal-Story besitzt eine eigene isolierte Manual-Runtime.[^implementation]

```mermaid
flowchart TD
    Start["Showcase öffnen"] --> Explore["Sortieren, suchen, Gruppe wählen"]
    Explore --> Views["Tabelle, Karten oder Map"]
    Views --> Detail["Modul-ID öffnen"]
    Detail --> Views
    Views --> Effects["Effekt für nächsten Wechsel wählen"]
    Effects --> Views
    Start --> Knowledge["Knowledge unten links"]
    Knowledge --> Engineering["Engineering im eigenen Tab"]
    Knowledge --> Manual["Bedienungsanleitung im eigenen Tab"]
    Start --> Studio["Design und Rehearsal öffnen"]
    Studio --> Story["Story bewusst starten"]
    Story --> Pause["Pause oder einzelner nächster Schritt"]
    Story --> Takeover["Nutzer übernimmt GPU-Steuerung"]
    Takeover --> Free["Freie Bedienung in isolierter Runtime"]
    Studio --> Capture["Aktuellen Frame aufnehmen"]
    Capture --> Compare["Bilder vergleichen"]
    Compare --> Consent["Ausgewählte Bilder für AI freigeben"]
    Consent --> Findings["Vorschläge prüfen und exportieren"]
```

## Autorität

Der Core prüft fachliche Invarianten, Guards und explizite Events. Eine Führung
aktiviert nur den im Storyvertrag benannten Part mit dem erwarteten Event. Ein
Pointer-/Tastatureingriff in die GPU-Vorschau stoppt weitere Führungsschritte.
Die Führung darf nicht heimlich Tastaturfokus übernehmen.

AI-Review besitzt keinen Event-Ausführungsweg in die Anwendung. „Bild öffnen“
wechselt die Prüfpanel-Auswahl, nicht die Fachansicht. Bestätigen/Verwerfen ist
lokale Bewertung; eine bestätigte Beobachtung ist nicht automatisch eine Änderung.

## Fehlerwege

Ungültige URLparameter zeigen einen korrigierbaren Fehler; Reset setzt definierte
Defaults. Ein fehlendes GPU-Backend zeigt eine Diagnose. Fehlerhafte Aufnahme,
veralteter Snapshot, fehlende Pixelabdeckung oder nicht konfigurierter AI-Zugang
bleiben ausdrücklich sichtbar. Ein Fehler darf nicht als erfolgreicher Run oder
Anbietertransaktion erscheinen.

[^implementation]: Implementierung und SHA-256-Dateibindung im Quellinventar.
