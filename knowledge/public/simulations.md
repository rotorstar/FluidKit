---
type: "Procedure"
title: "Praxisfälle simulieren"
description: "Immobilien, Commerce und Reise mit klar gekennzeichneten Beispieldaten ausprobieren."
audience: "public"
tags: ["fluidkit", "simulations"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-02T09:48:11.657433Z"}
stale_after: "2026-12-02T00:00:00Z"
sources: [{"id": "product", "resource": "assets/product-facts.json", "title": "Dokumentierter Produktstand und Screenshotnachweise"}]
---

# Drei Praxisfälle

Öffne „Case-Simulationen“ und wähle Immobilien, Commerce oder Reise. Alle Angebote,
Preise, Bestände, Unterkünfte und Bewertungen in diesen Bereichen sind erfunden.
Die Bedienung, Zustandswechsel und GPU-Darstellung werden tatsächlich ausgeführt.[^product]

![Immobilienfall mit sichtbarer Simulationskennzeichnung](assets/simulation-real-estate.jpg)

## Ein Angebot vergleichen

1. Suche nach einem passenden Begriff oder wechsle die Sortierung.
2. Öffne „Angebot entdecken“ bei einem Angebot.
3. Wähle einen angebotenen Vergleichspartner.
4. Lies die beiden angebotenen Datensätze.
5. Kehre über Karten oder Tabelle zur Übersicht zurück.

![Commerce-Fall mit Varianten und Preisen](assets/simulation-commerce.jpg)

Im Commerce-Fall können Varianten und Bestand die Vorbereitung begrenzen. Bei
Immobilien hängt sie unter anderem von der Verfügbarkeit des ausgewählten
Datensatzes ab. Ein deaktivierter oder abgewiesener Vorgang bedeutet nicht, dass
die Daten verschwunden sind.

## Reise und ablaufende Quotes

Wähle im Reisefall „Quote ablaufen lassen“, um eine abgelaufene Szenariozeit zu
simulieren. Vorbereitung beziehungsweise Übergabe darf danach nicht einfach
fortfahren. „Szenariozeit zurücksetzen“ stellt die definierte Ausgangszeit wieder her.
Es handelt sich um eine kontrollierte Szenariozeit, nicht um ein live aktualisiertes
Anbieterangebot.

![Reisefall mit kontrollierter Angebotszeit](assets/simulation-travel.jpg)

```mermaid
flowchart LR
    Search["Suchen und sortieren"] --> Detail["Details"]
    Detail --> Compare["Vergleichen"]
    Compare --> Prepare["Verfügbarkeit und Zeit prüfen"]
    Prepare -->|"gültig"| Handoff["Simulierte Vorbereitung und Übergabe"]
    Prepare -->|"ungültig"| Explain["Angezeigten Grund bearbeiten"]
```

**Es wird nichts gekauft, gebucht oder versendet.** „Vorbereitet“ und „Übergabe“
sind Simulationsergebnisse. Für echte Vorgänge muss ein Betreiber einen geprüften
Anbieter- und Transaktionsadapter bereitstellen. Entwürfe gehören nicht in die URL.

[^product]: Produktstand, tatsächliche Aufnahmerouten und Einschränkungen im Fakten-/Bildregister.
