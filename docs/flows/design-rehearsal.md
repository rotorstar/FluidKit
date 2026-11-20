# Studio-Designprüfung und Rehearsal-Flows

Planstand: **2. November 2026**, T50–T58. Diese Flows beschreiben das Ziel und werden durch den unten ausgewiesenen lokalen Umsetzungsschnitt ergänzt. M5-Prozent-Checkpoints und M6-Einzelbilder sind kein Vollscan.

## Userflow im Studio

```mermaid
flowchart TB
    Project["Projekt und Case öffnen"] --> Brief["Ziel, Look, Dichte und Beats festlegen"]
    Brief --> Preview["Echte Fluid-Runtime in der GPU-Vorschau"]
    Preview --> Inspect["Design und Rehearsal prüfen"]
    Inspect --> Fixed["Statische, DOM-, GPU- und Semantikprüfer"]
    Inspect --> Temporal["Framefolge und Echtzeit-Pacing"]
    Inspect --> Consent{"AI-Review konfiguriert und freigegeben?"}
    Consent -->|Ja| AI["Begrenztes multimodales Review"]
    Consent -->|Nein| Local["Lokale Prüfung bleibt verfügbar"]
    Fixed --> Report["Getrennter Befund- und Abdeckungsreport"]
    Temporal --> Report
    AI --> Report
    Local --> Report
    Report --> Select["Befund zu Frame und Part auswählen"]
    Select --> Compare["Referenz und Kandidat vergleichen"]
    Compare --> Fix["Kleinste zuständige Ursache korrigieren"]
    Fix --> Preview
    Compare --> Review["Belegte manuelle Review und offene Gates"]
```

## Ereignis, Ursache und Darstellung

```mermaid
sequenceDiagram
    actor User as Nutzer oder freigegebene Führung
    participant Story as Story-Executor
    participant Core as Core und Guards
    participant View as Präsentation
    participant GPU as Surface
    participant Capture as Rehearsal
    User->>Story: Beat starten
    Story->>View: Aktuelles Part-Ziel messen
    Story->>Core: Deklariertes typisiertes Event
    alt Guard erlaubt
        Core->>Core: Snapshot atomar committen
        Core->>View: Event und ResolvedEffectPlan
        View->>GPU: Quelle, Zusatzeffekt, Ziel darstellen
        GPU->>Capture: Frame, dargestellte Scene und Glyphen
        Capture->>Capture: Bildaufnahme und Framebezug bestätigen
    else Abgewiesen oder Ziel fehlt
        Core-->>Story: Fehler und unveränderter Fachstate
        Story-->>User: Beat als fehlgeschlagen markieren
    end
    Note over Core,GPU: Keine Präsentationspause verzögert den fachlichen Commit
```

## Daten und AI-Grenze

```mermaid
flowchart LR
    Full["Vollständiger Capture und Rohbefunde"] --> Store["Versionierter Run mit lokalen Zugriffsrechten"]
    Store --> Selection["Begrenzte Frameauswahl und Brief"]
    Selection --> Redact["Sensitive Pixel vor Aufnahme redigieren und Metadaten minimieren"]
    Redact --> Preview["Datenumfang, Provider und Budget anzeigen"]
    Preview --> Auth{"Projektfreigabe und Rechte vorhanden?"}
    Auth -->|Ja| Reserve["Qualitätsbudget reservieren"]
    Reserve --> Model["Serverseitiger Review-Provider"]
    Model --> Validate["Schema und Frame-, Part- und Bildreferenzen validieren"]
    Validate --> Findings["Vorschläge mit Begründung und Unsicherheit"]
    Findings --> Diff["Überprüfbare Änderungsvorschau"]
    Diff --> Policy["Projektpolicy oder Reviewfreigabe"]
    Policy --> Apply["Erlaubte Änderung und erneute Prüfung"]
    Auth -->|Nein| Local["Kein Upload, lokale Prüfung verfügbar"]
    Model --> Usage["Tatsächliche Usage und Reservierung abrechnen"]
    Full --> Deterministic["Technische Analyse aller erfassten Frames"]
    Deterministic --> Hard["Unabhängige harte Gates"]
    Findings -. "können keine Gates aufheben" .-> Hard
```

## Capture-State und Abdeckung

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Preparing: Expliziter Prüflauf
    Preparing --> Capturing: Fonts, Assets und Ziele bereit
    Preparing --> Inconclusive: Voraussetzung fehlt
    Capturing --> Analyzing: Erfasste Folge zugeordnet
    Capturing --> Inconclusive: Frame fehlt, Abort oder Device Loss
    Analyzing --> Review: Technische Ergebnisse und Bildbelege
    Analyzing --> Inconclusive: Abdeckung nicht belegt
    Review --> Failed: Belegter harter Fehler
    Review --> Qualified: Geprüfter Scope erfüllt
    Review --> Inconclusive: Manuelle oder technische Abnahme offen
    Failed --> Preparing: Ursache korrigiert
    Inconclusive --> Preparing: Voraussetzung wiederhergestellt
    Qualified --> Preparing: Version oder Scope geändert
```

AI-Review hat eine eigene Abdeckung ausgewählter Bilder. Es ersetzt weder den
technischen Vollscan noch fehlende manuelle Prüfungen. `Qualified` benennt einen
expliziten Scope, keine automatische Gesamtreleasefreigabe.

## URL- und Reviewzustand

```mermaid
flowchart LR
    Open["Projekt und unveränderlichen Run öffnen"] --> Parse["Run-, Panel-, Frame- und Partreferenzen validieren"]
    Parse --> Valid{"Referenzen vorhanden?"}
    Valid -->|Nein| Missing["Not-found oder korrigierbare Diagnose"]
    Valid -->|Ja| Review["Reviewansicht projizieren"]
    Review --> Navigate["Anderen Run öffnen"]
    Navigate --> Push["History Push"]
    Review --> Select["Panel, Frame oder Part wählen"]
    Select --> Replace["History Replace"]
    Back["Back oder Forward"] --> Parse
    Review --> Artifact["Artefakt unter Projektberechtigung laden"]
    Secret["Notizen, Prompts, Tokens und Pixel"] -. "kein URL-Inhalt" .-> Review
```

Runpfad: `/studio/projects/:projectId/runs/:runId`.
Reviewquery: `panel`, `frame`, `part`. Datenzugriff ist separat berechtigt;
ein URL-Bezug erteilt keine Rechte. Scene-/Kamerafortschritt bleibt Präsentation,
Frameauswahl ändert keinen fachlichen Snapshot.

## Abhängigkeiten und nächster visueller Milestone

```mermaid
flowchart TB
    Base["Offene RP1-Grundlagen und vorhandene Primitives"] --> Brief["T50 Brief und Story"]
    Base --> Tokens["T51 eigene Tokenrollen"]
    Brief --> Causal["T52 kausale Choreografie"]
    Tokens --> Compose["T53 kompakte Komposition"]
    Causal --> Capture["T54 zeitliche GPU-Rehearsal"]
    Compose --> Capture
    Capture --> M6["M6: begrenzter sichtbarer Workspace-Proof"]
    Capture --> Studio["T55 Studio-Qualitätswerkstatt"]
    Persist["T16 bis T18: Authoring und persistente Runs"] --> Studio
    Providers["T22 und T27: Provider, Rechte und Budgets"] --> AI["T58 AI-Designanalyse"]
    Studio --> AI
    M6 --> Corpus["T56 kontrollierter Qualitätsvergleich"]
    AI --> Corpus
    Corpus --> Learn["T57 gezielte Regression und unabhängige Review"]
    Learn --> Release["T19 und T30: vollständige Produktgates"]
    Release --> Later["Weitere qualifizierte Erweiterungen, Marketplace zuletzt"]
```

Der M6-Proof nutzt die minimalen Teilumfänge; ein konfigurierter Live-AI-Provider
ist kein Voraussetzungstrick, um die frühe visuelle Richtungsprüfung zu verzögern.
Die vollständige T58-Abnahme bleibt eine eigenständige Aufgabe.

## Ausgeführter lokaler Schnitt M6

```mermaid
flowchart LR
    User["Expliziter Start in /studio/rehearsal"] --> Runner["StoryRunner: aktueller Part und Eventvertrag"]
    Runner --> Core["Isolierter Core: Guards und Revision"]
    Core --> GPU["WebGPU bevorzugt / tatsächliches Backend sichtbar"]
    GPU --> Sensitive{"Sensitive Parts vorhanden?"}
    Sensitive -->|Ja| Deny["Keine Pixelaufnahme"]
    Sensitive -->|Nein| Capture["Ausgewähltes Canvasbild direkt im Rendercallback"]
    Capture --> Local["Lokaler Vergleich und offener Abdeckungsreport"]
    Capture --> Approval["Bis zu drei Bilder bewusst freigeben"]
    Approval --> Auth["Loopback-Origin / HttpOnly-Session / CSRF"]
    Auth --> Limit["Bodylimit / Reservierung / ein laufender Aufruf"]
    Limit --> SDK["Vercel AI SDK 7: generateText + Output.object"]
    SDK --> Count["Direktes OpenAI: tatsächlichen SDK-Input zählen"]
    Count --> Cap{"Höchstens 24.000 Tokens?"}
    Cap -->|Nein oder unbekannt| Block["Keine Generierung; sichere Diagnose"]
    Cap -->|Ja| OpenAI["Unveränderte Anfrage / Standard-Tier / store false"]
    SDK --> Optional["Optional: separat qualifiziertes Gateway"]
    OpenAI --> Refs["Schema und bestehende Bild-/Partreferenzen"]
    Optional --> Refs
    Refs --> Findings["Nur Vorschläge; kein Gate und keine Mutation"]
    Findings --> Assess["Menschlich bestätigen oder verwerfen und begründen"]
    Assess --> Export["Lokaler Reviewexport mit Herkunft und Usage"]
    SDK --> Accounting["Usage oder konservativ gehaltene Reservierung"]
    Missing["Kein Provider konfiguriert"] --> Local
```

Die Sensitive-Prüfung findet **vor** dem Lesen der Pixel statt, auch wenn die
Darstellung noch ausgehende Parts enthält. Ein allgemeiner Maskierungsrenderer ist noch
nicht implementiert. Kontinuierliche Filmaufnahme, natives Pacing, Runpersistenz
und verteilte Budgetierung folgen; sie sind durch diesen Schnitt nicht abgenommen.
