# Effektmodell und Studio-Flow

Stand: 2026-11-03. Historischer M3-Proof für T48/T49; [Nachweise und offene Gates](../milestones/m3.md).
[M7](../milestones/m7-plan.md) ergänzt die folgenden Verträge für drei neue Rezepte.
Die [Nachqualifikation vom 4. November](m7-qualification.md) trennt Workspace-
Events, native Browserjourneys und isolierte Lifecycle-/Privacy-Prüfungen.
Neue Flows sind ein Architekturvertrag; ihr ausgeführter Nachweis steht einzeln im AC-Register.
[Entscheidung](../decisions/0004-typegpu-effects.md).

## Visuelle Sequenz und Fachzustand

```mermaid
sequenceDiagram
    actor User as Nutzer
    participant Core as Core
    participant Resolve as Effect Resolver
    participant Surface as GPU-Surface
    participant Trace as Run / Replay
    User->>Core: Berechtigtes Transition-Event
    Core->>Core: Guards, Inhalt und Ziel prüfen
    Core->>Resolve: Quellbild, Zielprojektion und Policy
    Resolve->>Resolve: Transition vor Case vor Projektstandard
    Resolve->>Resolve: Kompatiblen Pool und Capabilities prüfen
    Resolve-->>Core: Gültiger Plan für die vorbereitete Revision
    Core->>Core: Ziel-Snapshot und Plan atomar committen
    Core->>Trace: Rezeptversion, Policy-Version, Parameter, Seed und Fallback
    Resolve->>Surface: ResolvedEffectPlan
    Surface->>Surface: Aktuelles Bild → Zusatzeffekt → Zielbild
    opt Neueres berechtigtes Event
        User->>Core: Folgeaktion
        Surface->>Surface: Vom aktuellen Bild retargeten, alte Jobs abbrechen
    end
    Trace-->>Surface: Replay verwendet aufgelöste Auswahl
```

```mermaid
flowchart LR
    Policy{"Auswahlmodus"} -->|Aus| Base["Basismotion / Reduced Motion"]
    Policy -->|Fest| Fixed["Effekt-ID und Version"]
    Policy -->|Random| Pool["Kompatible Allowlist"]
    Policy -->|Je Case| Case["Case-Regel oder Projektstandard"]
    Pool --> Seed["Run-Seed + Case-ID + Event-ID + Policy-Version"]
    Fixed --> Resolved["ResolvedEffectPlan"]
    Seed --> Resolved
    Case --> Resolved
    Base --> Visual["Aktuelles Bild → Zielbild"]
    Resolved --> Effect["Aktuelles Bild → Effekt-Rezept → Zielbild"]
```

```mermaid
flowchart TD
    Showcase["Showcase: GPU-Effektleiste"] --> Policy["Gemeinsamer VisualState.settings"]
    Studio["Effekt-Studio: DOM-Werkzeuge"] --> Policy
    Policy --> Library["Kuratierte versionierte Effekt-Library"]
    Library --> Preview["Vorschau im aktuellen Case"]
    Preview --> Configure["Dauer, Intensität, Parameter und Seed"]
    Configure --> Scope["Projektstandard / Case / Transition zuordnen"]
    Scope --> Validate["Schema, Inhalt, Capabilities und Reduced Motion prüfen"]
    Validate --> Runtime["Identische Runtime und Effect Resolver"]
    Runtime --> Compare["Quelle / Effekt / Ziel scrubben und vergleichen"]
    Compare --> Export["Rezeptreferenz, Regel und Szenario exportieren"]
    Export --> Replay["Reproduzierbare Tests und Replay"]
```

## Verbindliche Details

- Random wählt einmal pro Transition oder Choreografiegruppe. Ein Run-Seed wird
  aufgezeichnet; abgeleitete Transition-Seeds erlauben Variation innerhalb des Runs.
  Der M3-Proof verwendet eine Surface als Gruppe. Separate Choreografiegruppen
  und ihr Gruppenschlüssel bleiben T10/T11.
  „Seed +“ ändert den Ausgangsseed für den nächsten Übergang. Eine bereits
  aufgelöste Auswahl bleibt auch beim Ändern der Einstellungen unverändert.
- Der Pool wird vor Auswahl nach Inhalt, Part-Fähigkeiten, Backend, Motion-Präferenz
  und Ressourcenbudget gefiltert. Für einen leeren Pool ist der Basisübergang definiert.
- Gespeicherte Runs referenzieren Rezept- und Policy-Versionen. Bibliotheksupdates
  ändern alte Aufzeichnungen nicht. Fehlende Versionen erzeugen eine Diagnose.
- Ein Effekt verändert weder Formulardaten noch fachliche Autorität und führt keine
  Käufe, Veröffentlichungen oder anderen externen Aktionen aus.
- Eingabe, Fokus und Content Preservation bleiben an stabilen Komponenten-Parts.
  Effekt-Overlays erhalten keine eigene fachliche Interaktion.
- WebGPU ist Standard. WebGL2 verwendet qualifizierte Renderrezepte; Compute-
  Varianten besitzen einen CPU-/TSL-Pfad oder eine aufgezeichnete Darstellungskürzung.
- CPU/GPU-Tests verwenden begründete numerische Toleranzen. Seeds garantieren
  reproduzierbare Auswahl, keine pauschal bitgleichen Pixel auf jeder Hardware.

## Showcase-Steuerung ohne fachlichen Commit

```mermaid
sequenceDiagram
    actor User as Nutzer
    participant Dock as GPU-Effektleiste
    participant Core as Core
    participant Studio as Effekt-Studio
    participant Surface as Surface-Timeline
    User->>Dock: Rezept, Modus oder Seed wählen
    Dock->>Core: Typisiertes visual.command
    Core->>Core: Policy und Projektion validieren
    Core-->>Dock: Neue Settings-Projektion
    Core-->>Studio: Identische Settings
    Dock->>Surface: Nur Präsentations-Controls aktualisieren
    Note over Core,Surface: Fachrevision und laufender Effektplan bleiben erhalten
    User->>Core: Nächster Ansichtswechsel
    Core->>Surface: Neuer Snapshot und neu aufgelöster Effektplan
```

## Finale UI-Abnahme und Aufzeichnungsgröße

```mermaid
flowchart LR
    Case["Case und UI-Verträge"] --> Render["Bestätigter Render-Frame"]
    Render --> Ink["Gezeichnete Glyphen und Metadaten messen"]
    DOM["DOM-Labels und Container prüfen"] --> Check
    Ink --> Check["Überlappung, Überlauf, Glyphen, Redundanz"]
    Check --> Result{Befund?}
    Result -->|Ja| Fix["Ursache korrigieren und Nachbarn erneut prüfen"]
    Fix --> Case
    Result -->|Nein| Evidence["Screenshot öffnen und Messmatrix sichern"]
    Evidence --> Release["Visuelle Übergabe"]
```

```mermaid
flowchart TD
    Resize["Fenstergröße ändert sich"] --> Mode{Darstellungsmodus}
    Mode -->|Live| Projection["Responsive Case-Projektion"]
    Mode -->|Replay| Viewport["Original-Viewport aus v2-Import oder v3"]
    Viewport --> Scale["Gleichmäßig skalieren ohne Text-Reflow"]
    Scale --> Readonly["Schreibgeschützte Aufzeichnung"]
    Readonly --> Live["Live-Ansicht wiederherstellen"]
    Live --> Projection
    Legacy["v1 ohne Viewport"] --> Diagnostic["Neuaufzeichnung anfordern"]
```

Bewegte Beschriftungen blenden in der Quellphase aus. Die Geometrie bewegt sich
bei unsichtbaren kreuzenden Labels; Zielbeschriftungen erscheinen nach dem
Positionswechsel. Statische Controls und der fachliche Ziel-Snapshot bleiben
sofort verfügbar. Die Ink-Prüfung unterscheidet auch mehrere Zeilen desselben
Texts und wartet auf den zentralen Surface-Scheduler.

## M7: gemeinsame Darstellung und begrenzte Unterbrechung

```mermaid
flowchart TD
    Event["Berechtigtes fachliches Event"] --> Commit["Ziel und Route atomar committen"]
    Source["Aktuelle sichtbare Darstellung"] --> Clip["Unveränderlicher Transition-Clip"]
    Commit --> Clip
    Policy["Rezeptversion, Seed, Anker, Gruppen und Profil"] --> Clip
    Clip --> Sample["sampleTransitionClip: normalisierte Zeit"]
    Sample --> Geometry["Komponentengruppen und Textphasen"]
    Sample --> Decoration["Schatten, Linse und begrenzte Partikel"]
    Geometry --> Surface["Vorhandener Surface-Scheduler"]
    Decoration --> Surface
    Surface --> QA["Frame- und Geometrieprüfung"]
    Surface --> Interrupt{"Neues Event?"}
    Interrupt -->|Ja| Checkpoint["Flacher Darstellungssnapshot"]
    Checkpoint --> Retire["Effektreste höchstens 120 ms bzw. 20 Prozent abbauen"]
    Retire --> Clip
    Interrupt -->|Nein| End["Exaktes Ziel; keine Restpartikel oder Leerlaufframes"]
```

```mermaid
flowchart LR
    Layout["Komponentenmodell und Layerordnung"] --> Decorative["Dekorative Flächen"]
    Decorative --> Target["Eigenes Render Target"]
    Target --> Lens["Lokale Brechung; getrennte Lese- und Schreibziele"]
    Layout --> Sharp["Scharfer GPU-Text und funktionale Inhalte"]
    Layout --> Protected["Fokus, Caret, Eingabe und Effektsteuerung"]
    Lens --> Composite["Komposition mit korrekter Überdeckung und Clipping"]
    Sharp --> Composite
    Protected --> Composite
    Composite --> Canvas["WebGPU oder qualifiziertes WebGL2"]
```

Der Snapshot enthält rekonstruierbare Daten und keine GPU-Objekte oder rekursiv
eingebetteten Vorgängerpläne. Wiederholte Unterbrechungen erfassen dieselben
begrenzten Kanäle. Quell- und Zielbeschreibungen bleiben nach Ende verfügbar,
damit rückwärts gerichtetes Scrubbing denselben Clip wiederherstellen kann.
Die GPU-Surface behält die begrenzte Quell-/Zielobjektmenge des aktuellen Clips;
ausgehende Objekte sind am Ziel unsichtbar. Ein neuer Clip gibt nicht mehr
benötigte IDs frei. Render-Targets und sichtbare Partikel bleiben am Endpunkt
nicht erhalten.

```mermaid
flowchart LR
    Clip["Aktueller Clip: begrenzte Quelle und Ziel"] --> Cache["GPU-Objekte wiederverwenden"]
    Cache --> Seek["Replay oder Rückwärts-Seek"]
    Seek --> Cache
    Cache --> End["Ziel: Quellreste unsichtbar; Effektressourcen leer"]
    Next["Neuer berechtigter Clip"] --> Prune["Unsichtbare Alt-IDs entfernen; aktuelle Darstellung übernehmen"]
    Prune --> Clip
    Selection["Stabile ausgewählte Komponenten-ID"] --> Anchor["Linse folgt Quell- zu Zielgeometrie"]
    Anchor --> Cache
```

## M7: User-, Daten-, State- und URL-Grenzen

```mermaid
sequenceDiagram
    actor User as Nutzer
    participant Tools as Showcase / Studio
    participant Visual as Visual Settings
    participant Core as Core / Datenidentitäten
    participant Router as Router
    participant Render as Präsentation
    User->>Tools: Rezept oder Preset wählen
    Tools->>Visual: Einstellungen für nächsten Wechsel
    Note over Visual,Core: Keine Fachrevision oder Historyänderung
    User->>Core: Sortieren, Ansicht wechseln oder auswählen
    Core->>Core: Guard und fachlichen Zielzustand prüfen
    Core->>Router: Deklarierte URL-Projektion
    Core->>Render: Dieselben Daten-IDs und aufgelöster Effekt
    Router->>Core: Back/Forward als Navigationsevent
    Core->>Render: Neuer gültiger Zustand und kontinuierliche Übernahme
    Note over Render: Replay verändert weder Core noch URL oder externe Daten
```

## M7: Abnahme statt bloßer Einzelbilder

```mermaid
flowchart LR
    Scenario["Case, Rezept, Seed und eingefrorenes Profil"] --> Frames["Deterministische Bildfolge"]
    Scenario --> Native["Separater Echtzeitlauf"]
    Frames --> Manifest["Frame-/Zeit-/Build-/Backendbezug und Vollständigkeit"]
    Manifest --> Checks["Glyphen, Endpunkte, Übergänge und Kontinuität"]
    Manifest --> Review["Visuelle Review; optionale AI-Kritik"]
    Native --> Timing["Geräteprofil und P95-Framezeit"]
    Checks --> Gate{"Alle erforderlichen Gates erfüllt?"}
    Review --> Gate
    Timing --> Gate
    Gate -->|Nein| Fix["Ursache beheben und betroffene Fälle erneut prüfen"]
    Fix --> Scenario
    Gate -->|Ja| Evidence["Nachweise binden; Matrix und OKF aktualisieren"]
```

Ein fehlender Frame bleibt `inconclusive`. Ein Kontaktbogen ersetzt keine Prüfung
der erfassten Einzelbilder; langsame Einzelbildaufnahme belegt keine Framerate.
Die vorhandene ausgewählte Frameaufnahme behält ihren eigenen Abdeckungsstatus.
