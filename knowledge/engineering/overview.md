---
type: "Product Model"
title: "Produktmodell und dokumentierter Stand"
description: "Vision, Alpha-Implementierung und nachgewiesener Umfang des Frameworks."
audience: "engineering"
tags: ["fluidkit", "overview"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-03T22:51:43.750Z"}
stale_after: "2026-12-03T00:00:00Z"
sources: [{"id": "implementation", "resource": "assets/source-inventory.json", "title": "Geprüfter Implementierungsstand"}]
---

# Produktmodell

FluidKit ist ein Entwickler-Framework für zustandsabhängige GPU-Oberflächen. Ein
fachlicher Zustand wird als Szene projiziert. Dieselben Modulidentitäten können
als Tabelle, Karten, Dependency Map oder Detail erscheinen. Eine atomare Änderung
legt das fachliche Ergebnis fest; eine anschließende Animation stellt den Weg dar.
Studio-Bedienung und Dokumentation verwenden DOM. Sichtbare Runtime-Elemente werden
mit Three.js/TSL, GPU-Text und einem bevorzugten WebGPU-Backend gezeichnet.[^implementation]

Die gültige Nutzerentscheidung erlaubt einen transparent angezeigten WebGL2-Fallback.
Ältere Aussagen „WebGPU ausschließlich“ im archivierten Plan sind damit überholt.
Der Renderer entscheidet anhand tatsächlicher Fähigkeiten, nicht anhand des Browsernamens.

## Warum dieses UI-Modell?

Die Arbeitsansicht folgt der Aufgabe: Tabelle für Wertevergleich, Karten für
visuelle Auswahl, Graph für Beziehungen, Detail für weiterführende Arbeit. Stabile
Objektidentitäten verbinden diese Perspektiven. Passende Übergänge sollen den
Wechsel nachvollziehbar machen; zusätzliche Werkzeuge werden bei Bedarf entfaltet.
[Objektkontinuität](https://bost.ocks.org/mike/constancy/) und
[Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
liefern dafür Grundlagen. Studien zu
[animierten Datenvisualisierungen](https://idl.uw.edu/papers/animated-transitions)
stützen geeignete Übergänge in ihrem untersuchten Scope. FluidKit-eigene
Zeit-/Fehler-/Lernvorteile bleiben zu messen.

Das Modell bietet kontrollierter Assistenz einen gemeinsamen Zustandsvertrag:
Vorschläge werden gegen dieselben IDs, Events und Guards geprüft. Dieses
Architekturargument ist keine produktive Intent-Implementierung. Eine eigene
GPU-Szene erweitert die grafischen Möglichkeiten; Identität, Kontrolle und
Informationsarchitektur erzeugen den eigentlichen Nutzungszusammenhang.

Die vollständige Einordnung steht in [Warum Fluid UI?](why-fluid.md): Nutzen,
Usability, Grafiktechnik, Zukunftsperspektive und bewusste Grenzen.

## Drei getrennte Ebenen

| Ebene | Zuständigkeit | Aktueller Nachweis |
|---|---|---|
| Fachlichkeit | Core, Flow, Felder, Revision, Guards, Aktionen | validierte lokale Runtime |
| Präsentation | Scene, Visual-State, Effektplan, Timeline, GPU-Ressourcen | animierter Workspace und Rehearsal |
| Assistenz | validierter DecisionPlan oder separate AI-Designkritik | Core-Grenzen vorhanden; echte OpenAI-Review im Studio |

Ein Live-Review ist keine autonome Anwendungs-KI. `DecisionProvider` ist derzeit
nur ein Interface; Intent-Ranking, Predictive Loading und Online-Lernen sind offene
Produktarbeit. Alle Praxisangebote in den drei Simulationen sind synthetisch.
Die Workspace-Ansicht verwendet dagegen tatsächliche lokale Paket- und Quellstatistiken.

```mermaid
flowchart LR
    Code["Workspace und Verträge"] --> Core["Ein fachlicher Snapshot"]
    Core --> Scene["Aktuelle Scene"]
    Scene --> GPU["WebGPU bevorzugt"]
    Core --> Bridge["Native Semantik und Eingabe"]
    GPU --> User["Sichtbare Oberfläche"]
    User --> Bridge
    Bridge --> Core
    Scene --> Review["Studio und ausgewählte AI-Bilder"]
```

Die Roadmap umfasst 58 ursprüngliche Tasks und seit M7 insgesamt 435 kanonische
Einzelkriterien. Der historische Ausgangsstand mit 408 Kriterien hatte 94 im
angegebenen Scope belegte Kriterien, 190 teilweise,
123 offene und einen externen Nachweis. Diese Zahlen sind eine datierte Baseline,
kein Fertigstellungsversprechen. [Release und Roadmap](release-roadmap.md) beschreibt
Grenzen; [Quellabdeckung](source-map.md) bindet diese Knowledge an tatsächliche Dateien.

[^implementation]: Implementierung und SHA-256-Dateibindung im Quellinventar.
