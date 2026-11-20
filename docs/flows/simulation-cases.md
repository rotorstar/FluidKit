# Simulations-Cases: User, Daten, State und URL

Stand: 1. November 2026. Alle Angebote sind synthetisch. Die fachliche Vorbereitung
ist lokal, ohne Versand, Checkout oder Buchung. Die WebGPU-Runtime und ihre
Semantikbrücke sind dieselben wie im Workspace-Showcase.

```mermaid
flowchart TB
    File[Versionierte synthetische Datei] --> Schema[Dataset- und Provenienzschema]
    Schema --> Adapter[Lesender Simulationsadapter]
    Adapter --> Core[Core mit kontrolliertem Szenariozeitpunkt]
    Core --> Cards[Karten oder sortierbare Tabelle]
    Cards --> Search[Suche und stabile IDs]
    Search --> Detail[Detail und gegebenenfalls Variante]
    Detail --> Compare[Angebotsvergleich]
    Compare --> Detail
    Detail --> Guard{Bestand und Quote gültig?}
    Guard -->|Nein| Block[Vorbereitung blockieren]
    Guard -->|Ja| Draft[Entwurf vorbereiten]
    Draft --> Handoff[Übergabe simulieren]
    Handoff --> Local[Lokaler Abschluss ohne externen Seiteneffekt]
    Core --> GPU[WebGPU zuerst und sichtbare Backend-Diagnose]
    Core --> Semantics[Native Eingabe- und Semantikbrücke]
```

```mermaid
flowchart LR
    URL[Case-Route und validierte Query] --> Parse[Ansicht, Sortierung, Auswahl, Vergleich, Variante]
    Parse --> Restore[Host-Navigation ohne Action]
    Restore --> Core[Fachlicher Snapshot]
    Core --> Serialize[Öffentliche Felder serialisieren]
    Serialize --> History[History push oder Back/Forward]
    History --> URL
    Draft[Notiz und Suchentwurf] --> Core
    Core --> Memory[Entwürfe bleiben im Speicher]
```

```mermaid
stateDiagram-v2
    [*] --> cards
    cards --> table: Tabellenansicht
    table --> cards: Kartenansicht
    cards --> detail: Auswahl
    table --> detail: Auswahl
    detail --> comparison: Vergleichen
    comparison --> detail: Zurück
    detail --> prepared: Gültige Auswahl vorbereiten
    prepared --> handoff: Übergabe simulieren
    prepared --> detail: Weiter bearbeiten
    handoff --> detail: Zur Auswahl zurück
    detail --> detail: Variante oder Quote ändern
```

URL: `/studio/simulations/:caseId?view=…&selected=…&comparison=…&sort=…&variant=…`.
Notizen, Uhränderungen und laufende Animationen werden nicht in die URL geschrieben.
Ein abgelaufener Quote bleibt blockiert, bis die kontrollierte Szenariozeit
zurückgesetzt wird. Das ist eine Fehlersimulation, keine Live-Preiserneuerung.
Ein Live-Anbieterfehler aktiviert keine synthetischen Daten.
