---
type: "Data Architecture"
title: "Daten- und Action-Adapter"
description: "Herkunft, Abbruch, konkurrierende Abfragen, Cache und Idempotenz."
audience: "engineering"
tags: ["fluidkit", "data-actions"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-02T09:42:16.031656Z"}
stale_after: "2026-12-02T00:00:00Z"
sources: [{"id": "implementation", "resource": "assets/source-inventory.json", "title": "Geprüfter Implementierungsstand"}]
---

# Daten lesen

`defineDataAdapter` validiert Query, JSON-Kompatibilität, Datenschema und
DataSource. Die Quelle deklariert Modus, Anbieter, Beobachtungszeit, Version und
gegebenenfalls Ablauf. Synthetische Daten und Provider-Sandboxes müssen als
Simulation gekennzeichnet sein.[^implementation]

`createDataClient` gehört zu einem Host-/Sessionkontext. Ein Scope ersetzt seine
vorherige Anfrage durch Abbruch. Cachekeys sind kanonisch aus Adapter-ID, Version
und validierter Query gebildet. Der Standardcache ist auf 100 Einträge begrenzt;
TTL und Quellenablauf begrenzen die Wiederverwendung.

```mermaid
sequenceDiagram
    participant H as Host
    participant C as DataClient
    participant A as DataAdapter
    participant S as Quelle
    H->>C: Query, Scope, Revision, AbortSignal
    C->>C: alte Scope-Anfrage abbrechen
    C->>A: validierte Query
    A->>S: lesende Anfrage
    S-->>A: Daten und Quellenmetadaten
    A-->>C: validiertes Ergebnis
    alt Revision und Scope noch aktuell
        C-->>H: geklonte Daten
    else überholt, abgebrochen oder abgelaufen
        C-->>H: definierter Fehler
    end
```

Der aktuelle Client macht keine universelle laufende Request-Deduplizierung und
ist kein TanStack-Query-Adapter. Er bietet begrenzten Cache, Scope-Supersession und
Stale-Result-Schutz. Das vollständige Query-/HTTP-/Import-Ökosystem bleibt offen.

# Fachliche Aktionen

`defineActionAdapter` trennt Autorisierung und Ausführung. `createActionClient`
erlaubt nur ausdrückliche User-/Host-Ursprünge, niemals AI, Prefetch oder Replay.
Nach gültigem Input und Autorisierung bindet Idempotenz Principal, Projekt,
Adapter/Version und Key an genau dieselbe Payload. Eine abweichende Payload mit
demselben Key wird verweigert.

Das In-Memory-Register hält bis zu 1.000 Ergebnisse, einschließlich laufender
Promises. Caller-Abbruch beendet das Warten; eine gestartete externe Aktion kann
weiterlaufen. Ein Retry beobachtet dasselbe Ergebnis. Dauerhafte Idempotenz,
mehrere Serverinstanzen und echte Käufe/Buchungen benötigen einen Hoststore und
eigene Transaktionsabnahme. Die derzeitigen Simulationen führen diese Aktionen nicht aus.

[^implementation]: Implementierung und SHA-256-Dateibindung im Quellinventar.
