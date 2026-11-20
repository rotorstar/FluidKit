# Nutzenargumentation für FluidKit

Recherche und Planung: 2. November 2026. Auftrag: den Sinn einer fließenden,
zustandsabhängigen UI erklären und die technischen Möglichkeiten von WebGPU und
Three.js samt Grenzen in der README einordnen. Keine Runtimeänderung oder Upgrades.
Installierter Renderer-Unterbau: Three.js 0.187.0; dessen Rolle und die aktuelle
offizielle Dokumentation wurden geprüft. Quellen stehen im Forschungsbericht.

| Option | Ratings Ziel/Korrektheit/Testbarkeit/Lieferung/Erweiterbarkeit (30/25/20/15/10) | Score |
|---|---|---:|
| A ausschließlich Grafiktechnik erklären | 3/5/4/5/3 | 80 |
| B überwiegend Zukunfts- und Überlegenheitsversprechen | 5/2/2/4/3 | 66 |
| H Nutzergeschichte, technische Hebel, belegte Grenzen und getrennte Zukunftsoptionen | 5/5/5/4/5 | 97 |

Gewinner H. UX-Prinzipien, verfügbare API-Fähigkeiten, vorhandene Produktfeatures
und zukünftige Möglichkeiten werden ausdrücklich unterschieden.

## Tasks und Acceptance Criteria

- U01 Research: Primärquellen zu Objektkontinuität, dosierter Komplexität,
  GPU-Rendering/Compute, Three.js, Browserstand, SEO, Semantik und Extraktion prüfen.
  AC: jede wichtige externe Behauptung hat eine konkrete Quelle und eine Scopegrenze;
  allgemeine Visualisierungsforschung wird nicht als eigener FluidKit-Erfolg ausgegeben.
- U02 README: Nutzergewinn vor Technologie beschreiben, passende Aufgaben und Beispiele
  nennen; GPU-Freiheiten und Three.js verständlich erklären. AC: lesbare Benefits,
  konstruktive Grenzen, datierter Browserstand und sichtbarer Recherchelink.
- U03 Content/AI/Zukunft: Copy-Hürde von Kopierschutz trennen. AC: API-/Assetzugriff,
  Semantik und OCR berücksichtigt; weder Accessibility noch erlaubte AI-Nutzung
  werden absichtlich behindert. Lokale AI, stärkere Hardware und zusätzliche
  räumliche Darstellung bleiben Möglichkeiten mit eigenen Qualifikationsgates.
- U04 Konsistenz: OKF-Überblick/Rendering und Bedienungseinstieg nachführen.
  AC: Feature-/AC-Zahlen unverändert, README-Evidenz neu gebunden, Quellinventar und
  Offline-Handbücher aktuell; Links und Mermaid bestehen. Bestehende Screenshots
  werden wiederverwendet, keine neuen Hardware- oder Performanceclaims.
- U05 Review und Übergabe: GitHub-Markdown und gerenderte Lesbarkeit prüfen;
  Dokumentationsänderung auf eigenem Branch committen und nach `main` übernehmen.
  AC: sauberer Diff, normaler Push, lokaler und entfernter Commit identisch.
- U06 Vollständige OKF-Erschließung: eigene Kapitel „Warum Fluid UI?“ für Engineering
  und Public. AC: Nutzen/Usability, Grafiktechnik, AI/Zukunft, Content-Schutz und
  konstruktive Grenzen selbstständig im jeweiligen Bundle lesbar; direkte
  Index-/Querverweise, Primärquellen und unveränderte Produktabnahmen; beide
  Offline-Handbücher/Studio-Mirrors/ZIPs enthalten das Kapitel. Reader-Anker,
  Konzeptzahlen, lokale Bilder und Mermaid werden nachgeführt und geprüft.

U06-Optionen, gleiche Gewichte wie oben: A kurze bestehende Absätze belassen
(3/4/3/5/3 → 71), B Forschungsbericht nur extern verlinken (3/4/3/4/3 → 68),
H eigene, zielgruppengerechte portable Konzepte mit gemeinsamen Quellen
(5/5/5/4/5 → 97). Gewinner H: Der Nutzen ist direkt auffindbar und bleibt auch
im exportierten Handbuch vollständig verfügbar.

## Relevante Flows

User: Daten auswählen → aufgabengerechte Ansicht wählen → Objekt wiedererkennen →
Details prüfen. State: gültiges Event → atomarer Snapshot → visuelle Projektion.
Daten und URL behalten die bestehenden Verträge; ein Darstellungseffekt gibt keine
neue Aktion frei. Die vorhandenen Mermaid-Flows bleiben normativ und unverändert.

Nachweise werden unter `docs/qa/2026-11-02-ui-rationale/` abgelegt.

## Abgleich

- U01–U03: Research und README umgesetzt. UX-Nutzen steht vor Grafiktechnik;
  Studien-Scope, Copy-Hürde, Browserplattformen und Zukunftsoptionen sind getrennt.
- U04: Übersicht, Rendering und Bedienungseinstieg in OKF nachgeführt. Die
  Produktabnahmen bleiben unverändert; Quellen und Artefakte werden neu gebaut.
- U05: GitHub-GFM-Renderstruktur, Links und vorhandene Diagramme sind prüfbar.
  Die erneute visuelle Browserkontrolle der zusätzlichen Abschnitte konnte wegen
  nicht verfügbarer Browsersteuerung nicht durchgeführt werden. Dafür wird kein
  neuer visueller Abnahmenachweis behauptet. Vorhandene Produktbilder und
  Darstellungsstyles sind unverändert. Commit-/Remoteabgleich folgt als Übergabe.

U06: eigene Konzepte und Querverweise angelegt; vollständige Engineering- und
Public-Inhalte bleiben im jeweiligen Bundle. Prüfartefakte zur Erweiterung:
`docs/qa/2026-11-02-okf-rationale/`.
