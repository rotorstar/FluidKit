# GitHub-README aus der OKF-Knowledge

Stand: 2. November 2026. Grundlage: Engineering-/Public-Knowledge und überprüfter
Alpha-Stand. Die README ist der kuratierte Einstieg; technische Details und
Bedienverfahren bleiben in den verlinkten OKF-Konzepten.

| Option | Ratings Ziel/Korrektheit/Testbarkeit/Lieferung/Erweiterbarkeit (30/25/20/15/10) | Score |
|---|---|---:|
| A ausführliche technische Textsammlung | 3/4/3/4/3 | 68 |
| B überwiegend illustrative Marketingseite | 4/2/2/4/3 | 60 |
| H Produktgeschichte, Originalaufnahmen, native Mermaid-Flows und präzise Einstiege | 5/5/5/4/5 | 97 |

Gewinner H. Keine erfundenen UI-Screens, CI-Badges, veröffentlichten npm-Pakete,
Leistungs- oder Conversionversprechen. Bilder bleiben lokale Repository-Assets.

## Aufgaben und Akzeptanzkriterien

- R01 Redaktion: Produktidee, heutige Bedienmöglichkeiten, Schnellstart, Architektur,
  optionale AI, Qualität, Reifestand und weiterführende Knowledge erschließen.
- R02 Visuals: echte UI-Aufnahmen mit Herkunft und aussagekräftigen Bildbeschreibungen;
  fokussierte, auf GitHub lesbare Ausschnitte; Diagramme aus tatsächlichen Verträgen.
- R03 Prüfung: relative Links/Bilder und Kapitelanker lösen auf; Mermaid ist gültig;
  GitHub-Markdown und lokale gerenderte Vorschau werden geprüft. Die README gehört
  künftig zum Flow-Check.
- R04 Konsistenz: Task-/AC-Bezüge und Quellinventar aktualisieren; keine Produkt-AC
  durch bessere Dokumentation aufwerten; keine Änderungen am sichtbaren Runtimeverhalten.
- R05 Übergabe: auf `docs/github-readme` committen, in `main` mergen, nach `origin/main`
  pushen und Remote-SHA prüfen. Keine Force-Pushes oder fremden Änderungen verwerfen.

## Quellen

Recherche am 2. November 2026, ausschließlich betroffene Markdown-Konventionen:

- [GitHub: About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [GitHub: Creating diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams)
- `knowledge/engineering/overview.md`, `architecture.md`, `effects.md`,
  `ai-review.md`, `release-roadmap.md` und `development-cli.md`.
- `knowledge/public/index.md`, `screenshots.json` und tatsächliche Studio-Aufnahmen.

Relative Bild-/Dateiverweise bleiben branch- und clone-tauglich. Die README
verwendet einfache Mermaid-Flows, keine versionsabhängigen experimentellen Syntaxen.

## Abgleich und Nachweise

- R01: umgesetzt. README leitet von Produktidee und heutiger Alpha-Bedienung zu
  Schnellstart, Studio, Architektur, Grenzen und beiden OKF-Bundles.
- R02: umgesetzt. Drei neue native WebGPU-Aufnahmen zeigen denselben gefilterten
  Kernelbestand; eine unveränderte Aufnahme belegt die bereits dokumentierte
  OpenAI-Analyse. Herkunft und Capture-Scope stehen in `docs/readme/screenshots.json`.
- R03: geprüft. GitHub-GFM-API rendert die README; 41 lokale Verweise lösen auf,
  vier Bilder haben Alttexte und Herkunft, zwei README-Flows bestehen den
  erweiterten Check mit insgesamt 71 Diagrammen. Lokale Vorschau bei 1280×1050
  und 390×844 ohne Seitenüberlauf; Bilder, Galerie und Kapitelanker funktionieren.
  Die Vorschau verwendet das von GitHub erzeugte HTML, lokale Mermaid-Darstellung
  und angenäherte GitHub-Styles; sie ist kein Screenshot des GitHub-Produktionslayouts.
- R04: Feature-Matrix, AC-Evidenzbindungen und beide Knowledge-Bundles werden mit
  diesem Dokumentationsstand synchronisiert. Produktkriterien bleiben bei
  94 verifiziert / 190 teilweise / 123 offen / 1 extern. Keine neuen GPU-, AI- oder
  Hardwarefreigaben durch diese README.
- R05: Übergabe auf `main` per Fast-forward und normalem Push. Der endgültige
  Nachweis ist die Übereinstimmung von lokalem HEAD und GitHubs `main`-Commit;
  Commit-ID und Remote werden nach dem Push separat kontrolliert.

Prüfartefakte: `docs/qa/2026-11-02-readme/`. Die Screenshot-Vorschau dient der
redaktionellen Prüfung; die vier Produktbilder selbst bleiben unverändert.
