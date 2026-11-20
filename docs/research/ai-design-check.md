# ai-design-check: Eignung für FluidKit

Recherche und isolierter Probelauf: **1. November 2026**. Ergänzung zur Oktober-
Recherche; die untersuchte Version wurde erst am 1. November veröffentlicht.
[Beschluss mit Optionen und Abnahme](../decisions/0005-design-quality.md).

Diese Bewertung dokumentiert den ursprünglichen isolierten Probelauf.
Die anschließende Integration ist separat in [M4](../milestones/m4.md) nachgewiesen.

## Untersuchte Basis

- npm-Paket `@enmera/ai-design-check` **0.9.0**, veröffentlicht
  `2026-11-01T10:40:40.712Z`; Git-Commit
  `e945bc312d78514b052474a779609622b9aa962f`.
- Node >=20, MIT-Lizenz, keine deklarierten Laufzeitabhängigkeiten. Die lokale
  Node-24-Basis erfüllt die Anforderung. Daraus folgt kein Toolchain-Upgrade.
- 76 katalogisierte Regeln; 50 besitzen eine maschinenlesbare `check`-Beschreibung.
  Das sind keine 76 automatisierten Webprüfungen: Plattform, Syntax und Regeltyp
  schränken die tatsächliche Abdeckung weiter ein.
- Integrität des npm-Archivs vor dem Probelauf per SHA-512 gegen die Registry
  geprüft. Untersucht wurden der statische `check()`-Pfad und seine lokalen
  Imports. Ausführung im Sandbox-Kontext, ohne Netzwerkzugriff des Prüfers.
- Kein Eintrag in package.json/Lockfile, keine globale Skill-Installation, kein
  Auto-Fix. Der separate Chrome-Runner `narrow`, Designsystemgenerator und
  Videoexport wurden gelesen beziehungsweise eingeordnet, nicht ausgeführt.

## Was es leistet und was Fluid ergänzen muss

| Fähigkeit | Befund | Entscheidung für Fluid |
|---|---|---|
| Statische Designregeln | Liest Klassen, ausgewählte CSS-/Code-Muster und JSX-Strukturen; liefert Regel, Datei, Zeile und Schweregrad | Geeignet als zusätzliche Hinweisquelle für Studio-Code |
| Fokus und benannte Controls | Erkennt bestimmte fehlende Namen und entfernte Fokus-Stile | Mit vorhandenen ESLint-/Semantikprüfungen abstimmen; kein vollständiger Accessibility-Nachweis |
| Komponenten-Inventar | Vergleicht Quellcode-/Klassen-Signaturen | Hilfreich gegen Variantenwildwuchs; beweist bei gewöhnlichen CSS-Klassen keine identischen berechneten Styles und erfasst keine GPU-Parts |
| `narrow` | Vergleicht DOM-Geometrie zweier Breiten: Seitenüberbreite, abgeschnittene Texte, kleinere Schriften und verborgenes Desktop-Inhaltselement | Ideen für Studio-Browsermatrix übernehmen; beabsichtigte responsive Navigation und Scrollcontainer gesondert beurteilen |
| Canvas-/GPU-Inhalt | `narrow` untersucht DOM-Elemente und deren Text; keine Glyphen oder Draw-Commands im Canvas | Eigene bestätigte Render-Checkpoints, Glyph-Bounds, Hit-Testing und Backend-Matrix behalten |
| Kollisionen und redundante Labels | Kein allgemeiner paarweiser Textkollisionstest oder Nachweis gegen benachbartes „Ziel Ziel“ | Bestehende Ink-/Transport-Regressionen bleiben maßgeblich |
| Kontrast und Reduced Motion | Im Regelkatalog vorhanden, dort ohne automatischen `check`; der Generator prüft seine erzeugten Farben | Kontrast bestehender DOM-/GPU-Inhalte und tatsächliches Motion-Verhalten separat prüfen |
| Designsystemgenerator | Erzeugt vorgegebene Typografie-/Farb-/Abstandsrollen | Bestehende Richtung erhalten; eigene Token-Verträge als gemeinsame Quelle für DOM und Scene weiterführen |
| Deutsche Beschriftungen | Großschreibungsheuristik ist auf Englisch/Türkisch ausgerichtet | Kein automatisches Sentence-case-Gate für deutsche Substantive |
| Kreative Bewegung und Stil | Regeln gegen Bounce, Überschwingen, dekorative Versalien, bestimmte Farben und Oberflächenformen sind gestalterische Konventionen | Review-Hinweise; kein pauschales Verbot für Fluid Morph, Spring Reflow oder kuratierte Effekte |

`RESEARCH.md` beschreibt eine qualitative Betrachtung von 16 Dashboard-Designs.
Die Autoren bezeichnen die Häufigkeiten selbst als einmalige Sichtung, nicht als
gemessene Studie. Wir behandeln diese Ergebnisse als Gestaltungshinweise, nicht
als Nachweis für bessere Task Completion oder als Accessibility-Standard.

## Isolierter Probelauf an unserem Code

Geprüft: `apps/studio/app`, `apps/studio/components`, `packages/react/src` und
`packages/cases/src`; generierte Dateien und installierte Abhängigkeiten ausgenommen.
Die Regeln liefen zunächst unverändert, damit Konflikte sichtbar bleiben.
[Maschinenlesbare Ergebnisse und Provenienz](ai-design-check-evaluation.json).

**Ergebnis: 25 Warnungen, keine Errors.** Das ist keine Designfreigabe.

| Regel | Anzahl | Einordnung im Projekt |
|---|---:|---|
| `use-shared-components` | 14 | Darunter Studio-Controls mit Potenzial zur Vereinheitlichung; native Semantik-/IME-Brücke benötigt ausdrücklich native Elemente |
| `no-style-overrides` | 9 | `outline-button` an ungestylten Base-UI-Primitives wird als externer Stil erkannt. Das Styling ist dort beabsichtigt; die Regel erst für eigene gestylte Wrapper qualifizieren |
| `locale-number-format` | 1 | Anzeige der Effektfrequenz über `.toFixed(1)`; localegerechte Darstellung als konkreten Folgepunkt in T42 aufnehmen |
| `locale-aware-case` | 1 | Uppercase des technischen View-Labels; lokalisierbare Beschriftung und technische Identität künftig trennen |

Zusätzliche synthetische Kontrollfälle im temporären Verzeichnis:

1. `text-[7px]` und `outline-none` wurden erwartungsgemäß als Fehler erkannt.
2. Das korrekte deutsche `aria-label="Neue Datei"` wurde fälschlich als
   Sentence-case-Fehler erkannt.
3. `font-size:7px` und identische Vorder-/Hintergrundfarben in gewöhnlichem CSS
   lieferten in diesem Kontrollfall keinen Befund.
4. Zwei überlagerte textuelle Scene-Nodes in TypeScript lieferten keinen Befund.

Diese Fälle zeigen konkrete Abdeckungsgrenzen, keine allgemeine Fehlerrate des
Werkzeugs. Fehlende Meldungen dürfen weder für CSS-Kontrast noch für GPU-Layout
als bestanden gewertet werden. Der Probelauf hat keinen Produktcode verändert.

## Primärquellen

- [Repository und Nutzung](https://github.com/enmerasoftware/ai-design-check)
- [Versionierte Paketmetadaten](https://registry.npmjs.org/@enmera%2fai-design-check/0.9.0)
- [Statischer Prüfer am untersuchten Commit](https://github.com/enmerasoftware/ai-design-check/blob/e945bc312d78514b052474a779609622b9aa962f/src/check.js)
- [DOM-Prüfung für schmale Ansichten](https://github.com/enmerasoftware/ai-design-check/blob/e945bc312d78514b052474a779609622b9aa962f/src/narrow.js)
- [Regelkatalog](https://github.com/enmerasoftware/ai-design-check/blob/e945bc312d78514b052474a779609622b9aa962f/rules.json)
- [Methodik und Grenzen der eigenen Recherche](https://github.com/enmerasoftware/ai-design-check/blob/e945bc312d78514b052474a779609622b9aa962f/RESEARCH.md)
- [MIT-Lizenz](https://github.com/enmerasoftware/ai-design-check/blob/e945bc312d78514b052474a779609622b9aa962f/LICENSE)
