# M7: lokale Nachqualifikation und Nachweisgrenzen

Stand: **4. November 2026**. Diese Flows gehören zum
[Nachprüfplan](../milestones/m7-followup.md). Sie beschreiben die geplanten
Prüfpfade; ausgeführte Ergebnisse werden erst im kanonischen AC-Register gebunden.

## Nutzer und Zuständigkeiten

```mermaid
flowchart TB
    User["Nutzer öffnet /studio/m7"] --> Backend["Tatsächliches Backend wählen und anzeigen"]
    Backend --> Matrix["Workspace-Matrix: echte Daten und Runtime-Events"]
    Backend --> Lifecycle["Surface-Qualifikation: isolierte Allokation und Fehlerpfade"]
    Backend --> Native["Native Browserjourney: Pointer, Tastatur, History"]
    Matrix --> Pixels["Fünf numerische Phasen; deklarierte Originalbilder"]
    Lifecycle --> Ownership["100 frische Surfaces, Retarget, Disposal und Privacy"]
    Native --> Observation["Tatsächlicher Input, Media-Query und Visibility-State"]
    Pixels --> Report["Getrennte Berichte mit Build und Scope"]
    Ownership --> Report
    Observation --> Report
    Report --> AC["Unveränderte Kriterien einzeln abgleichen"]
```

Programmgesteuerte Anwendungsereignisse sind echte Core-Ereignisse, aber keine
native Pointer- oder IME-Sitzung. Die Surface-Qualifikation hat eigene Instanzen;
ihre 100 Zyklen sind keine neue Behauptung über React-Mounts oder Treiberspeicher.

## Daten und fachlicher Zustand

```mermaid
sequenceDiagram
    participant Runner as Workspace-Runner
    participant Data as Validierte WorkspaceData
    participant Core as Fluid Runtime
    participant GPU as Surface
    participant Report as Nachweis
    Data-->>Runner: Tatsächliche Module und stabile IDs
    Runner->>Runner: Erwarteten Ausgangs-/Zielzustand festlegen
    Runner->>Core: Deklariertes Workspace-Event
    Core->>Core: Berechtigten Zielzustand committen
    Core->>GPU: Quellbild, Ziel, Rezept und Revision
    Runner->>GPU: 0 / 25 / 50 / 75 / 100 Prozent beobachten
    GPU-->>Report: Glyphen, Bounds, Effektzustand und ausgewählte Originalframes
    Core-->>Report: Fachrevision, Daten-IDs und Ereignisbezug
    opt Unterbrechung vor Abschluss
        Runner->>Core: Neueres Event mit sichtbarer Herkunft
        GPU->>GPU: Aktuelle Darstellung übernehmen
        Core-->>Report: Neues gültiges Ziel ohne alten Endpunkt
    end
```

## Route, History und Replay

```mermaid
flowchart LR
    Open["/studio/m7: Werkzeug öffnen"] --> Tool["Lokale Prüfwerkstatt"]
    Tool --> Report["Bericht / Download"]
    Report -. "keine sensiblen Daten oder Framepayloads" .-> URL["Browser-URL"]
    Native["Nutzeraktion im Workspace"] --> Event["Berechtigtes Core-Event"]
    Event --> State["Revision, Auswahl, Filter, Sortierung und Ansicht"]
    State --> Route["Kanonische deklarierte Route"]
    Route --> History["Push oder Replace nach bestehendem Routervertrag"]
    History --> Pop["Back / Forward"]
    Pop --> Restore["navigation.restore ohne fachliche Aktionen"]
    Restore --> State
    Restore --> Clip["Neuer Präsentationsplan oder explizit sofortiger Wechsel"]
    Clip --> Clear["Keinen veralteten Replayclip exportieren"]
    Visual["Effektregler / Pause / Replay"] --> Presentation["Nur Präsentation"]
    Presentation -. "keine Fachmutation oder zusätzliche History" .-> State
```

Die Route des Werkzeugs erweitert die Produktnavigation. Sie verändert nicht
die bestehenden Workspace-URLs. Fachliche Action-Adapter werden von der visuellen
Prüfung nicht ausgelöst. Ein API-/Provider- oder Checkoutnachweis wird nicht aus
diesem lokalen Workspacefall abgeleitet.

## Ablauf, Abbruch und Fehler

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Preflight: Bewusster Start
    Preflight --> Initializing: Vertrag und Backend gültig
    Preflight --> Inconclusive: Voraussetzung fehlt
    Initializing --> Running: Ressourcen bereit
    Initializing --> Cleaning: Abbruch oder Initialisierungsfehler
    Running --> Running: Nächster begrenzter Fall
    Running --> Cleaning: Ende, Abbruch oder kontrollierter Verlust
    Cleaning --> Passed: Alle erwarteten Fälle und Abschlüsse belegt
    Cleaning --> Failed: Invariante oder Aufräumprüfung verletzt
    Cleaning --> Inconclusive: Beobachtung fehlt oder Run unterbrochen
    Passed --> Idle: Bericht sichern
    Failed --> Idle: Befund sichern
    Inconclusive --> Idle: Fehlenden Nachweis benennen
```

Ein abgebrochener Fall verkleinert nicht nachträglich die Sollmenge. Native
Präferenz-/Visibility-Fälle werden nur bestanden, wenn der tatsächliche Zustand
beobachtet wurde. Kontrollierter Deviceverlust und echte Fehlerbehandlung werden
von einem unkontrollierten Hardware-/Treiberfehler unterschieden.

## Sensitivität vor Capture und Export

```mermaid
flowchart TD
    Source["Quelle mit Sensitivität"] --> Clip["Clip und unterbrochene Darstellung"]
    Target["Ziel mit Sensitivität"] --> Clip
    Clip --> Gate{"Aktueller Capture-/Exportpfad enthält sensiblen Inhalt?"}
    Gate -->|Ja: Pixel| Block["Capture vor Bildexport blockieren"]
    Gate -->|Ja: strukturierter Export| Redact["Payload nach bestehendem Redaktionsvertrag bereinigen"]
    Gate -->|Nein| Public["Öffentlichen Frame oder Run freigeben"]
    Block --> Result["Bericht mit Grund; kein privater Payload"]
    Redact --> Result
    Public --> Result
    Interrupt["Neuer Interrupt"] --> Clip
    End["Sauberes öffentliches Ziel erreicht"] --> Gate
```

Die Prüfung nutzt einen synthetischen Marker, keine realen persönlichen Daten.
Sie untersucht zusätzlich, ob alte Darstellungsreste nach einer Unterbrechung die
Sensitivität korrekt erhalten. Eine spätere öffentliche Positivkontrolle schützt
vor einer Implementierung, die lediglich jeden Export dauerhaft abschaltet.
