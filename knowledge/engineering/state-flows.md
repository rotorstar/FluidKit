---
type: "State Flow"
title: "State-, Visual- und Interaktionsflüsse"
description: "Getrennte Zustandsbesitzer und erlaubte Übergänge einschließlich Fehlern."
audience: "engineering"
tags: ["fluidkit", "state-flows"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-04T04:22:42.653Z"}
stale_after: "2026-12-04T00:00:00Z"
sources: [{"id": "implementation", "resource": "assets/source-inventory.json", "title": "Geprüfter Implementierungsstand"}]
---

# Zustandsbesitzer

Der RuntimeSnapshot besitzt Flow, fachlichen State, Felder, Modus und Revision.
InteractionState besitzt Fokus/Hover/Press/Composition. VisualState besitzt
Effekteinstellungen, Fähigkeiten, aktuelle/gespeicherte Effektpläne und eine eigene
Revision. Rendererzustand wie Pause oder Replay gehört zur Präsentation.[^implementation]

```mermaid
flowchart TB
    User["Eingabe oder Hostevent"] --> Dispatch["Core-Validierung"]
    Dispatch --> Domain["Fachlicher Snapshot"]
    Dispatch --> Interaction["Interaktionszustand"]
    Dispatch --> Visual["Visuelle Konfiguration"]
    Domain --> Projection["Scene-Projektion"]
    Visual --> Projection
    Interaction --> Bridge["Fokus, Auswahl und Semantik"]
    Projection --> Presentation["Timeline, Quelle und Ziel"]
    Presentation --> Pixels["Sichtbare Pixel"]
    Bridge --> Pixels
```

```mermaid
stateDiagram-v2
    [*] --> Ready
    Ready --> Validating: Event
    Validating --> Ready: abgewiesen
    Validating --> Prepared: Zielscene und Effekt gültig
    Prepared --> Committed: Actor und Snapshot
    Committed --> Presenting: animieren
    Presenting --> Ready: Ziel erreicht
    Presenting --> Validating: neueres Event
    Ready --> Disposed: dispose
    Presenting --> Disposed: dispose
```

Die Animation besitzt keine fachliche Zwischenrevision. Unterbrechungen können von
der aktuell gezeichneten Geometrie zum neu bestätigten Ziel retargeten. Externe
Aktionen werden dadurch nicht rückgängig gemacht. Replay einer Aufnahme ändert
keinen fachlichen Zustand; eine echte neue Bedienung beendet den Importmodus.

Ein gültiges `navigation.restore` übernimmt den fachlichen Historyzustand und
löst den zur aktuellen Effektpolicy passenden Darstellungsplan aus. Das erzeugt
keine fachliche Action. Off/Reduced-Motion stellen das Ziel sofort her und löschen
einen veralteten Live-Replaybezug. Historische Core-Replays ohne gespeicherten
Historyplan behalten ihre ursprüngliche sofortige Bedeutung.

Ein verborgenes Dokument suspendiert die Timeline. Die Rückkehr hebt nur diese
Suspendierung auf; eine vorherige manuelle Pause bleibt bestehen. Ein Wechsel
zu Reduced Motion setzt unmittelbar den gültigen Endpunkt. Das sind getrennte
Präsentationsregeln, keine zusätzlichen fachlichen Revisionen.

```mermaid
stateDiagram-v2
    [*] --> Manual
    Manual --> Hybrid: mode.set
    Hybrid --> Suggested: gültiger DecisionPlan
    Suggested --> Hybrid: verwerfen
    Suggested --> Hybrid: annehmen und erneut validieren
    Hybrid --> Auto: mode.set
    Auto --> Auto: erlaubter reversibler Plan
    Auto --> Manual: mode.set
    Hybrid --> Manual: mode.set
```

Der Diagrammteil „DecisionPlan“ beschreibt implementierte Core-Regeln. Er belegt
keine vorhandene Intent-/Providerpipeline; `intelligence` liefert derzeit nur den
Providervertrag. Die Studio-Designanalyse ist ein separater Advisory-Pfad.

[^implementation]: Implementierung und SHA-256-Dateibindung im Quellinventar.
