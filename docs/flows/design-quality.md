# Kombinierte Designprüfung

Stand: 2026-11-01. Implementierter M4-Flow für T19/T43, lokales Gate für T30 nach
[ADR-0005](../decisions/0005-design-quality.md). QualityReport v1 und die statische Build-Integration sind implementiert.
Manuelle Abnahmen und der externe CI-Betrieb bleiben separat.
[Nachweise und Grenzen](../milestones/m4.md).

```mermaid
flowchart TD
    Source["UI-Verträge, Tokens und Quellcode"] --> Static["Studio: konfigurierte statische Regeln"]
    Source --> Scenario["Case, Viewport, Sprache, Backend und Phase"]
    Scenario --> DOM["Berechnetes DOM-Layout und Texte"]
    Scenario --> GPU["Bestätigter GPU-Frame und Glyphen"]
    Scenario --> Semantics["Native Namen, Parts und Zustände"]
    Static --> Report["QualityReport v1 mit Build, Quelle und Abdeckung"]
    DOM --> Report
    GPU --> Report
    Semantics --> Report
    Report --> Review["Screenshot öffnen und Befunde beurteilen"]
    Review --> Gate{"Offene Abnahme erfüllt?"}
    Gate -->|Nein| Fix["Ursache beheben und betroffene Szenarien erneut prüfen"]
    Fix --> Source
    Gate -->|Ja| Evidence["Nachweise sichern und Freigabe dokumentieren"]
```

```mermaid
flowchart LR
    Finding["Statischer Hinweis"] --> Scope{"Regel passt zu Sprache und Oberfläche?"}
    Scope -->|Nein| Exception["Begründete, präzise Ausnahme oder anderes Prüfverfahren"]
    Scope -->|Ja| Defect{"Nachweisbarer Defekt?"}
    Defect -->|Ja| Fix["Korrigieren und Regression prüfen"]
    Defect -->|Designkonvention| Review["Mit Produktziel und Effektvertrag beurteilen"]
    Exception --> Coverage["Abdeckung ausdrücklich ausweisen"]
    Fix --> Coverage
    Review --> Coverage
    Coverage --> Rule["Nicht geprüft ist kein bestanden"]
```


```mermaid
stateDiagram-v2
    [*] --> StaticOnly
    StaticOnly --> Measuring: UI-Layout prüfen
    Measuring --> Report: Frame und DOM konsistent
    Measuring --> Error: Renderer oder Schema meldet Fehler
    Measuring --> StaticOnly: Revision, Settings oder Größe ändern sich
    Report --> StaticOnly: Resize, Projektzustand oder Studio-Layout ändern sich
    Report --> Exported: JSON exportieren
    Exported --> Report
    Error --> Measuring: Erneut prüfen
    Report --> Measuring: Anderen Checkpoint messen
```

Der statische Bericht und Next.js verwenden dieselbe aus Build-Quellen erzeugte
Build-ID. Der Server übergibt ein validiertes Artefakt als Props; der Client lädt
keinen Node-Prüfer. Der Qualitätsreport selbst wird von der geometrischen
DOM-Prüfung ausgenommen, um keine rekursiven Befunde zu erzeugen; seine Darstellung
gehört zur expliziten Screenshot-Abnahme. Geschlossene Details-Inhalte zählen
nicht als sichtbare DOM-Texte. Replay ohne aktive Brücke lässt Semantik offen.
