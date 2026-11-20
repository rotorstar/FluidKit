---
type: "Procedure"
title: "Replay, Pause und Aufzeichnungsdateien"
description: "Eine Darstellung erneut ansehen und unterschiedliche Exportarten unterscheiden."
audience: "public"
tags: ["fluidkit", "replay"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-20T10:36:00Z"}
stale_after: "2026-12-03T00:00:00Z"
sources: [{"id": "product", "resource": "assets/product-facts.json", "title": "Dokumentierter Produktstand und Screenshotnachweise"}]
---

# Eine Bewegung untersuchen

Nach einem Übergang kannst du „Replay“ wählen, die Wiedergabe mit „Pause“ stoppen
und mit dem Regler „Animationsposition“ zwischen Quelle und Ziel wechseln.
„Live“ beziehungsweise „Live-Ansicht“ zeigt wieder den aktuellen bedienbaren
Anwendungszustand.[^product]

**Wichtig:** Replay spielt die Darstellung ab. Es führt den fachlichen Vorgang
nicht erneut aus und löst keine Kauf-/Buchungsaktion aus. Ein bereits bestätigter
Zielzustand wird durch das Zurückschieben des Reglers nicht zurückgenommen.

## Dateien unterscheiden

| Export | Enthält | Verwendung |
|---|---|---|
| Effekt-Run | Einstellungen, aufgelöste Rezeptwahl und Aufzeichnung | Darstellung reproduzieren |
| Rehearsal-Run | Story, Schritte, ausgewählte Bilder und Audit | Prüfnachweis weitergeben |
| Qualitätsbericht | getrennte Prüfer, Befunde, offene Abnahmen | Fehler nachvollziehen |
| AI-Review | Modellbefunde, Herkunft, Usage und eigene Bewertungen | Kritik fachlich bearbeiten |

## Effektdatei importieren

1. Öffne das Effekt-Studio.
2. Wähle „Run importieren“.
3. Wähle eine gültige zuvor erzeugte Datei.
4. Prüfe angezeigte Rezeptversion und Fähigkeiten.
5. Nutze „Live-Ansicht“, um wieder selbst zu bedienen.

Das Dateifeld heißt für assistive Technologien „Effekt-Szenario importieren“.

Eine fehlende Rezeptversion wird nicht still durch ein neues Zufallsergebnis ersetzt.
Aufzeichnungen v2 enthalten die ursprüngliche Viewportgröße und bleiben lesbar.
v3-Aufzeichnungen halten zusätzlich die Darstellung einer unterbrochenen
Animation fest, damit etwa eine Linse oder Partikel beim Replay nicht springen.
Aktuelle v4-Aufzeichnungen speichern die Beziehungen zwischen den Ausgangs- und Zielobjekten. v2- und v3-Dateien verwenden beim Abspielen weiterhin ihre ursprüngliche Bewegung.
Eine ältere v1-Datei
muss erneut aufgezeichnet werden. Beim Verkleinern kann eine Originalaufzeichnung
proportional skaliert werden; sie ist dann kein Nachweis eines neuen Live-Layouts.

Bewahre Exporte bewusst auf. Viele Studioinformationen existieren derzeit nur in
der lokalen Sitzung und können beim Reload verloren gehen. Ein JSON-Export ist
noch kein dauerhaft gespeicherter Studio-Run mit eigenem Link.

[^product]: Produktstand, tatsächliche Aufnahmerouten und Einschränkungen im Fakten-/Bildregister.
