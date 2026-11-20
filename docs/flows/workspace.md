# Workspace: zusammenhängende User-, Daten-, State- und URL-Flows

Stand 2026-11-14. Implementierung: `packages/cases/src/workspace.ts`, Core,
React-Brücke und GPU-Surface. [Vollständiger generierter Stategraph](workspace-state.mmd).

```mermaid
flowchart LR
    Files["Tatsächliche Paketmanifeste und TS-Quellen"] --> Read["Lokaler read-only Import"]
    Read --> Schema["WorkspaceDataSchema"]
    Schema --> Projection["workspaceScene: Datensatz + Snapshot + Viewport"]
    UI["Suche / Header / Perspektive / Mehrfachauswahl"] --> Events["Typisierte Events"]
    Events --> Policy["Guards + Cancel + validierte Assignments"]
    Policy --> Core["Atomarer Core-Snapshot"]
    Core --> Projection
    Theme["Versionierte Theme-Präferenz"] --> Projection
    Projection --> GPU["TSL / Glyph / Yoga / Presentationsphase"]
    Projection --> Semantics["Native unsichtbare Table-, Input- und Button-Semantik"]
    Semantics --> Events
    GPU --> Backend["WebGPU als Standard / WebGL2 mit Grundanzeige"]
```

```mermaid
stateDiagram-v2
    [*] --> Table
    Table --> Cards: view.cards
    Cards --> Map: view.map
    Map --> Table: view.table
    Table --> Compare: view.compare
    Cards --> Compare: view.compare
    Compare --> Cards: view.cards
    Cards --> Atlas: view.atlas
    Atlas --> Compare: view.compare
    Atlas --> Table: view.table
    Atlas --> Atlas: atlas.metric / atlas.group
    Compare --> Compare: compare.differences
    Table --> Detail: select.module + selected ID
    Cards --> Detail: select.module + selected ID
    Map --> Detail: select.module + selected ID
    Detail --> Table: view.table
    Detail --> Cards: view.cards
    Detail --> Map: view.map
    Table --> Table: sort + assign
    Cards --> Cards: filter + assign
    Map --> Map: filter + assign
```

```mermaid
sequenceDiagram
    actor User as Nutzer
    participant Input as GPU-Header / Semantik-Button
    participant Core as Core
    participant Project as Projektion
    participant Render as Renderer
    participant URL as Browser-History
    User->>Input: Quellen sortieren
    Input->>Core: sort.files.asc oder sort.files.desc
    Core->>Core: Guard, Cancel und Assignment prüfen
    Core->>Core: sort + direction atomar committen
    Core->>Project: Neuer Snapshot
    Project->>Render: Dieselben IDs, neue Positionen
    Render->>Render: Vom aktuellen Bild interpolieren
    Core->>URL: Kanonischen Viewstate pushen
    User->>URL: Zurück / Vorwärts
    URL->>Core: navigation.restore mit validierten Feldern
    Core->>Project: Snapshot ohne Action-Ausführung
```

```mermaid
flowchart TD
    Route["URL: view, sort, direction, selected, group, picked, metric, atlasGroup, differences"] --> Parse["Zod + existierende Modul-ID"]
    Parse -->|gültig| Restore["Ein navigation.restore-Commit"]
    Parse -->|ungültig| Error["Korrigierbarer URL-Fehler"]
    Restore --> View["Table / Cards / Map / Detail / Compare / Atlas"]
    Local["Suchtext und native Interaktion"] --> Snapshot["Lokaler State, nicht in URL"]
    Snapshot --> View
    View --> History["Navigation und Ansichtseinstellungen: push"]
    Selection["Nur picked geändert"] --> Replace["replace: kein zusätzlicher History-Schritt"]
    Replace --> Route
    Theme["Theme, Effektfortschritt und Parameter"] --> Visual["Visual Settings: keine URL-Änderung"]
    History --> Route
```

```mermaid
flowchart LR
    Snapshot["Erhaltener Domain-Snapshot"] --> Attempt["WebGPU zuerst anfordern"]
    Attempt -->|bereit| WGPU["WebGPU rendern"]
    Attempt -->|nicht nutzbar| GL["WebGL2 initialisieren und Grund zeigen"]
    WGPU --> Lost["Device Loss"]
    GL --> Lost
    Lost --> Retry["Alte Surface disposen / begrenzt neu starten"]
    Retry --> Attempt
    Snapshot --> Retry
```

Die Tabelle ist eine Datentabelle mit Header-Buttons, kein Spreadsheet mit
Grid-Tastaturnavigation. Sie verwendet eine native, unsichtbare HTML-Tabelle
als Semantikbrücke; sichtbar zeichnet ausschließlich der GPU-Renderer.
[WAI Sortable Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/).
Die manuelle Screenreader-/IME-Matrix bleibt ein eigenes Release-Gate.

Der vereinfachte Stateflow zeigt typische Wege. Der verlinkte generierte
Stategraph enthält alle tatsächlich registrierten Übergänge, einschließlich
Sortier-, Filter-, Auswahl- und Atlasaktionen. `picked` ist eine wiederholbare
Modulkennung; `metric`, `atlasGroup` und `differences` werden nur bei Abweichung
von ihrer Vorgabe serialisiert. Suchtext und Entwürfe bleiben lokal.

Der eigenständige Flow Explorer unter `/studio/flows?module=<id>` verwendet
denselben realen Modulbestand, aber einen eigenen lokalen Review-Core. Die URL
benennt nur den Modulkontext; sie behauptet keine bereits abgeschlossene
Reviewentscheidung. Der [M9-Vertrag](../milestones/m9-plan.md) und die
[Engineering-Beschreibung](../../knowledge/engineering/perspectives.md) zeigen
den separaten User-/State-/Daten- und Exportflow.
