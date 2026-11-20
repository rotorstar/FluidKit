# Engineering und Public Knowledge — OKF 0.2

Stand: 2. November 2026. Dokumentierte Ausgangsbasis: Commit `104f9f8`,
Runtime-Build `fluid-b383e3697f017257a779`. Aufgabe betrifft Dokumentation und ihre
Werkzeuge; bestehende Runtime-/Produkt-AC werden nicht als erfüllt umdefiniert.

## Verbindliche Quellen und Profil

Die vom Nutzer verlinkte [OKF-Spezifikation](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
wird mit dem [heutigen kanonischen Repository](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md)
verglichen und per Revision/Hash fixiert. Beide Texte sind am Recherchetag identisch.
Die Google-Artikel zu [OKF](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing?hl=en)
und [Context Enrichment](https://cloud.google.com/blog/products/data-analytics/knowledge-catalog-self-learning-context-enrichment-for-ai-agents?hl=en)
begründen portable Dateien, progressive Erschließung, Quellenbindung und einen
geprüften Korrekturkreislauf. Ihre Produktbenchmarks werden nicht FluidKit zugeschrieben.

Zwei eigenständige Bundle-Wurzeln: `knowledge/engineering` und `knowledge/public`.
Jede hat einen Rootindex mit `okf_version: "0.2"`, datiertes `log.md`, einzelne
Konzepte mit YAML-Frontmatter, Links und eigenen Assets. Keine Engineering-Dateien
oder Verweise auf interne Rechnerpfade im Public-Export. Audience-Metadaten sind
Beschreibungen, keine Zugriffskontrolle. Öffentliche Bereitstellung ist nicht
Teil des Auftrags; Vorschau und Exporte bleiben lokal.

`type` bleibt der einzige allgemein verpflichtende Konzeptschlüssel. Zusätzliche
Anforderungen an Quellen, Titel, Screenshots und Vollständigkeit sind ausdrücklich
FluidKit-Qualitätsregeln. Unbekannte Typen/Metadaten bleiben zulässig. Fehlende
optionale Trustdaten werden nicht als OKF-Verstoß ausgegeben. Generierung und
maschinelle Struktur-/Linkprüfung sind getrennt; keine erfundene menschliche Freigabe.

## Optionen und Entscheidung

Bewertung Ziel/Korrektheit/Testbarkeit/Lieferung/Erweiterbarkeit = 30/25/20/15/10,
Ratings 1–5. Scores sind Planungsbewertungen, keine Produktmessungen.

| Option | Ratings | Score | Ergebnis |
|---|---|---:|---|
| A ein großes Markdown-Dokument | 3/3/2/5/2 | 60 | schwer navigierbar und audienceübergreifend |
| B nur eine neue Dokumentationswebsite | 4/3/4/3/3 | 70 | unnötige Bindung an einen Server |
| H zwei OKF-Bundles mit daraus erzeugten Offline-Handbüchern und Prüfungen | 5/5/5/4/4 | 95 | **Gewinner**: Dateien bleiben die Inhaltsquelle |

Aktuell recherchierte Dokumentationsbausteine: YAML 2.9.1, Markdown-it 15.0.3,
Footnote-Plugin 4.0.0; bestehendes Vite 8.3.5 und Mermaid 12.2.0 bleiben erhalten.
Versionswahl betrifft nur die Knowledge-Werkzeuge, nicht die GPU-/AI-Runtime.

## Aufgaben und überprüfbare Abnahme

| Aufgabe | Umsetzung | Acceptance Criteria |
|---|---|---|
| K01 Format und Quellen | fixiertes OKF-Profil, Herkunft und Pflegevertrag | Beide offiziellen Revisionen/Hash erfasst; reservierte Dateien korrekt; keine erfundene Human-Verifikation. |
| K02 Engineering | Architektur, sämtliche Pakete/APIs/Verträge, User-/Daten-/State-/URL-/Fehler-/Lifecycle-Flows, Sicherheit, Entwicklung, Tests, Betrieb und Roadmap | Jede aktuelle Quelldatei, Paketgrenze, Route und exportierte API hat einen belegten Dokumentationsbezug; Ist und Ziel sind getrennt; Mermaid ist syntaktisch geprüft. |
| K03 Public | aufgabenorientierte Bedienungsanleitung auf Deutsch | Einstieg, Sortierung/Suche, Ansichten, Effekte, Replay, Studio, Vergleich, AI, Qualitätsprüfung, Simulationen, Bedienhilfen und Fehlerfälle mit Voraussetzung, Schritten und Ergebnis erklärt. |
| K04 Screenshots | echte lokale UI-Aufnahmen und Bildregister | Geöffnete Bilder sind lesbar; tatsächliche Route, Build, Viewport und Zweck erfasst; keine Secrets oder persönlichen Pfade; alle Handbuchbilder vorhanden. |
| K05 Prüfung | getrennte OKF-Konformität, FluidKit-Qualität, Link-/Asset-/Quellen-/Coverage-Prüfung | Minimaldokumente und unbekannte Erweiterungen bleiben OKF-konform; Defektkontrollen erkennen fehlende Typen, ungültige Zeiten, tote Links, fehlende Bilder, veraltete Quellen und Public-Grenzverletzungen. |
| K06 Lesbare Ausgabe | lokale, durchsuchbare HTML-Bücher und getrennte ZIP-Exporte | Aus demselben Markdown erzeugt; Mermaid lokal gebündelt; keine CDN-Abhängigkeit; Public enthält kein Engineering; Tastatur/kleine Ansicht im Browser geprüft. |
| K07 Pflege | Source-Fingerprints, Gap-/Reviewflow, Freshness und Aktualisierungsbefehle | Quelländerungen sind sichtbar, Updates erfordern inhaltliche Prüfung; strukturierte Prüfung ist keine Fachfreigabe; Feedback ist nicht automatisch kanonisch. |
| K08 Konsistenz | README, Feature-Matrix und bestehende AC-Verweise | Befehle reproduzierbar; vorhandene AC bleiben im ursprünglichen Scope; bestehende Evidenzänderungen werden geprüft, keine pauschale Releasefreigabe. |

Engineering deckt den vorhandenen Alpha-Stand vollständig ab. Offene Produktfeatures
werden als solche dokumentiert. Public beschreibt ausschließlich vorhandene Bedienwege
und kennzeichnet Simulationen, ausgewählte AI-Bilder und noch offene Produktgates.

## Ergebnis und Abgleich — 2. November 2026

| Task | Technischer Abnahmestand | Nachweis |
|---|---|---|
| K01 | erfüllt | `knowledge/engineering/assets/okf-reference.json`: zwei identische offizielle Revisionen; keine erfundene Human-Verifikation |
| K02 | erfüllt für den dokumentierten Alpha-Stand | 29 Engineering-Konzepte, 188 Quellen, 224 Exportdeklarationen, 65 Schemas; sechs aktuelle Routen explizit zugeordnet; alle 58 Tasks und 408 AC enthalten |
| K03 | erfüllt für vorhandene Bedienwege | 16 Public-Konzepte; keine geplanten Funktionen als bedienbar ausgegeben |
| K04 | erfüllt im beschriebenen Aufnahme-/Prüfscope | 15 registrierte Originalaufnahmen, Formate/Dateien/Herkunft geprüft; geöffnete Stichprobe visuell kontrolliert; Originalgröße über Bilddialog |
| K05 | erfüllt | neun positive/negative Werkzeugtests, aktuelle OKF-/Profil-/Quellen-/Link-/Bildprüfung; erwarteter Driftfehler in `docs/qa/2026-11-02-knowledge/drift-control.json` |
| K06 | erfüllt | zwei lokale HTML-Bücher, lokale Mermaid-/Fontressourcen und Lizenzen; 27/27 Knowledge-Diagramme gerendert; keine doppelten IDs; Desktop und 390-px-Ansicht; getrennte ZIP-Inhaltsprüfung |
| K07 | erfüllt für den manuellen Pflegeprozess | Quellenänderung wird nicht automatisch neu gebunden; unbekannte Paket-/Routengrenzen erzwingen eine Dokumentationsentscheidung; Review-/Gap-Flow in der Engineering-Knowledge |
| K08 | erfüllt im Dokumentationsscope | README, Matrix, AC-Belege und CI-Gate aktualisiert; keine Produkt-AC aufgewertet |

Nachweise: Knowledge-QA (internes Archiv).
Die Gesamtproduktabnahme bleibt **94 verified / 190 partial / 123 open / 1 external**.
Die Knowledge ist maschinell verfasst und geprüft; eine menschliche Fachfreigabe
wird weiterhin nicht behauptet. Vollständige Tutorial-Integrationstests und
veröffentlichbare Hardwarebenchmarks bleiben bei T38 beziehungsweise den jeweiligen
Produkt-Tasks offen.

## K09 — Knowledge-Links im Studio

Auftrag vom 2. November 2026: Engineering und Bedienungsanleitung unten links
in die bestehende Showcase-Navigation integrieren.

| Option | Ratings 30/25/20/15/10 | Score | Bewertung |
|---|---|---:|---|
| A Links auf separate lokale Vorschauports | 3/3/3/5/2 | 64 | zusätzliche laufende Server erforderlich |
| B dynamische Knowledge-Route Handler | 5/4/5/3/5 | 89 | zusätzliche Server-/Pfadlogik für statische Dokumente |
| H vorhandene Offline-Bücher als generierte Studio-Assets | 5/5/5/4/5 | 97 | **Gewinner**, gleiche Herkunft und vorhandener Dateivertrag |

Umsetzung: zwei beschriftete Links im unteren Sidebarbereich, neues Tab mit
`noopener noreferrer`; statische Ziele unter `/knowledge/engineering/handbook.html`
und `/knowledge/public/handbook.html`. Generierte Kopien werden vor Dev/Build
bereitgestellt und bei `knowledge:build` aktualisiert. Markdown bleibt die Quelle.
Fachstate, URL-Vertrag der Arbeitsfläche und GPU-Scheduler werden nicht verändert.

Acceptance Criteria:

- „Engineering“ und „Bedienungsanleitung“ stehen im unteren linken Navigationsbereich.
- Beide öffnen das passende vollständige Handbuch unter derselben Studio-Adresse.
- Bilder, Schrift, Mermaid und Querverweise funktionieren ohne Vorschauports 3050/3051.
- Taböffnung erhält die aktuelle Workspace-Ansicht; Tastaturfokus und Linkzweck sind eindeutig.
- Auf kurzen Desktopfenstern überdecken die Links keine vorhandenen Sidebartexte.
- Typecheck, Lint, Build sowie Knowledge-/AC-Konsistenzprüfungen bestehen im bezeichneten Scope.

Recherche: Next.js 16.4.3, installierte Dokumentation zu `public` und
[offizielle Static-Asset-Empfehlung](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder),
2. November 2026. Keine Dependency-Aktualisierung erforderlich.

K09-Abnahme: beide Links am tatsächlichen Studio-Produktionsbuild
geöffnet; Engineering 29 Kapitel/24 Diagramme, Anleitung 16 Kapitel/3 Diagramme
und geladene Originalbilder. URL und fachlicher Workspacezustand bleiben erhalten.
Beide Links passen bei 1280×720 und 900×600 vollständig in die Sidebar; der
Tastaturfokus läuft vorwärts und rückwärts zwischen ihnen. Die Anleitung enthält
nun 15 Aufnahmen einschließlich des neuen Navigationseinstiegs. Der statische
Mirror ist vom Source-Linting, Quellinventar und Runtime-Fingerabdruck ausgeschlossen.
Eine Regression belegt unveränderte Runtime-Identität bei neuen Knowledge-Dateien
und veränderte Identität bei geänderten echten Font-Assets.

Finaler K09-Build: `fluid-82e1541dee9b5ad0e8b2`.


## K10 — Nutzen und Usability vollständig erschließen

2. November 2026: Beide Bundles erhalten ein eigenes indexiertes Kapitel
„Warum Fluid UI?“. Engineering übernimmt die vollständige Forschungsargumentation
mit technischen Hebeln, Evidenzgrenzen und Messplan; Public erläutert dieselben
Themen mit Bedienbezug und einer konkreten Übung. Primärquellen bleiben erhalten.
Der aktuelle Umfang steigt auf 30 Engineering- und 17 Public-Konzepte.

AC: Kapitel im Index, Querverweise und Readeranker erreichbar; Inhalte auch ohne
README oder externe Projektdateien verständlich; lokale Bilder, Mermaid, OKF,
Quellbindung und ZIP-Isolation geprüft. Produktabnahmen bleiben unverändert.
Die Alternativen und U06 stehen im Nutzen-Umsetzungsplan.
