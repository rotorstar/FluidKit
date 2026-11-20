# M10 — vorgeschlagene Audio-Flows

Stand 14. November 2026. **Entwurf, noch nicht implementiert.**
[Plan und AC](../milestones/m10-sound-plan.md) · [Recherche](../research/sound-feedback.md).

## User- und State-Flow

```mermaid
stateDiagram-v2
    [*] --> Off
    Off --> Starting: Ton bewusst aktivieren
    Starting --> Ready: Context läuft und Palette bereit
    Starting --> Blocked: Browser blockiert oder Audiofehler
    Blocked --> Starting: Expliziter Retry
    Ready --> Playing: Zulässiger aktueller Cue
    Playing --> Ready: Ende oder geplanter Abbruch
    Ready --> Idle: Eigener Context ohne Arbeit
    Idle --> Starting: Neue bewusste Aktion in aktivierter Session
    Starting --> Suspended: Dokument verborgen oder Unterbrechung
    Ready --> Suspended: Dokument verborgen oder Unterbrechung
    Playing --> Suspended: Abblenden und Jobs verwerfen
    Idle --> Suspended: Dokument verborgen oder Unterbrechung
    Suspended --> Starting: Sichtbar und ausdrücklich fortsetzen
    Ready --> Off: Mute
    Playing --> Off: Mute mit kurzer Ausblendung
    Suspended --> Off: Mute
    Idle --> Off: Mute
    Blocked --> Off: Stumm fortfahren
    Off --> Disposed: Host wird entfernt
    Ready --> Disposed: Host wird entfernt
    Playing --> Disposed: Host wird entfernt
    Suspended --> Disposed: Host wird entfernt
    Idle --> Disposed: Host wird entfernt
    Starting --> Off: Mute oder Aktivierung abbrechen
    Starting --> Disposed: Host wird entfernt
    Blocked --> Disposed: Host wird entfernt
```

Die Diagrammzustände gehören zur Audio-Session. Browser-Contextzustand,
Nutzereinstellung und Bereitschaft der Assets bleiben getrennte Felder;
`Ready` behauptet nicht, dass ein Lautsprecher tatsächlich hörbar ist.
Nach Mute/Unmount eingetroffene asynchrone Ergebnisse werden über einen
Ownership-Token verworfen. Auch Verbergen während `Starting` invalidiert den
Token. Mute darf nie auf `resume()` warten. `Idle` bezeichnet eigenen Energiespar-
Suspend in einer bereits aktivierten Session; `Suspended` verlangt ausdrücklich
Fortsetzen. Nach jedem Resume wird die Zuordnung beider Uhren erneuert.

## Commit, Präsentation und zwei Uhren

```mermaid
sequenceDiagram
    actor User as Nutzer
    participant Core as Core
    participant Surface as Surface-Timeline
    participant Audio as Audio-Coordinator
    participant Device as Web Audio

    User->>Core: Fachliche Aktion
    Core->>Core: Guards prüfen und committen
    Core-->>User: Zielzustand und Semantik sofort
    Core->>Audio: Eindeutiges bestätigtes Ergebnis
    Core->>Surface: Aufgelöster Transition-Clip
    Surface->>Audio: Playback-ID, Zeitanker, Effektphasen
    Audio->>Audio: Freigabe, Deduplizierung und Priorität prüfen
    Audio->>Device: Begrenzte Cues auf Audio-Uhr planen
    Surface-->>User: GPU-Frames
    Device-->>User: Optionale akustische Ergänzung
    opt Unterbrechung oder Pause
        Surface->>Audio: Neue Generation oder Transportzustand
        Audio->>Device: Alte Cues stoppen und abblenden
    end
    Note over Core,Device: Audiofehler verändern weder Commit noch GPU-Lebenszyklus
```

Die Audio-Uhr wird auf den vorhandenen monotonen Präsentationsanker abgebildet.
Es entsteht keine zweite GPU-Renderloop. Audio-Ausgabeschätzungen und beobachtete
Geräte-Onsets werden im Bericht unterschiedlich benannt.

## Daten, Persistenz und URL

```mermaid
flowchart LR
    Catalog[Versionierte Klangpalette und Asset-Manifest] --> Resolve[Reiner Cue-Resolver]
    Event[Freigegebenes Event oder Playback-Phase] --> Resolve
    Settings[Lokale Klangvorliebe] --> Policy[Sessionfreigabe und Host-Policy]
    Resolve --> Plan[Unveränderlicher AudioPlan mit Seed]
    Plan --> Policy
    Policy --> Adapter[Web-Audio-Adapter]
    Adapter --> Trace[Redigierter Cue- und Abbruchtrace]
    Plan --> Recording[Neuer Recording-Umschlag]
    Visual[Unverändertes VisualScenario mit Digest] --> Recording
    Recording --> Offline[Offline-WAV und Referenzprüfung]
    Recording --> Replay[Bewusst gestartetes Replay]
    Replay --> Policy
    URL[Case-URL und History] --> Core[Vorhandener Fachzustand]
    Core --> Event
```

Soundpalette, Pegel, Seed, Mute und Wiedergabefortschritt schreiben keine
History-Einträge. Deep Link, Reload und Popstate sind standardmäßig stumm.
Projektregeln sind teilbar; lokale Lautstärke und aktive Tonfreigabe sind es nicht.
Ein Recording darf Ton beschreiben, aber niemals die Zustimmung des Betrachters
zur Wiedergabe mitbringen. Alte Aufzeichnungen bleiben stumm.

## Qualitätsflow

```mermaid
flowchart TD
    Recipe[Palette und semantische Cues] --> Offline[Offline-Peaks, Enden und Identität]
    Recipe --> Scenarios[Reale Studio- und Showcase-Cases]
    Scenarios --> Live[Browserlauf mit Audio-Lifecycle-Trace]
    Live --> Load[Zeitlich zugeordnete CPU- und GPU-Fremdlast]
    Live --> Listen[Hörprobe, Mono, Lautsprecher und Kopfhörer]
    Offline --> Review[Getrennte Prüfergebnisse]
    Load --> Review
    Listen --> Review
    Review --> Gate{Passender Scope vollständig belegt?}
    Gate -->|Nein| Fix[Überarbeiten oder Befund offen halten]
    Fix --> Recipe
    Gate -->|Ja| Evidence[Manifest, Dokumentation und Freigabe]
```
