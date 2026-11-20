# Vercel UI SDK: Verhaltensbausteine für FluidKit

**Recherche: 13. November 2026. Status: geprüfte Empfehlung, keine implementierte SDK-Integration.**

## Ergebnis

FluidKit sollte die Idee einer frei komponierbaren Verhaltensbibliothek konsequent übernehmen. Der größte Gewinn liegt in einer besseren Definition von Komponenten, Interaktion und Semantik. Ein Agent kann dann neue Oberflächen aus geprüften Fähigkeiten zusammensetzen, während unsere Runtime Daten, Eingabe, Darstellung und Übergänge konsistent hält.

Empfohlen wird ein **grundlegender Refactor der Component-/Behavior-/Layout-Verträge**, ergänzt um gezielt qualifizierte öffentliche UI-SDK-Bausteine. Eine direkte Nutzung ist im DOM-Studio plausibel; für GPU-Komponenten kommen zuerst weniger DOM-gebundene Selection-/Typeahead-Funktionen infrage. Das gesamte SDK ist kein nachgewiesener WebGPU-Unterbau.

Vollständiger Neuaufbau bleibt erlaubt. Bestehende Teile werden nach ihrer Eignung und ihren Nachweisen bewertet, nicht wegen einer Legacy-Verpflichtung. Der Vergleich und die Entscheidungskriterien stehen in [ADR-0007](../decisions/0007-ui-sdk.md); der ausführbare Evaluationsvorschlag mit Tasks, AC und Flows in [UI-SDK-Evaluation](../milestones/ui-sdk-evaluation.md).

## Quellenstand und Reife

| Prüfung | Ergebnis |
|---|---|
| Offizielle Ankündigung | Im Repository auf **12. November 2026** datiert; zum Recherchezeitpunkt sehr jung [S1] |
| Geprüfter Quellstand | `c53df2f45c7502bebf0f52619dfe75007a309eb6`, Main-Commit vom 12. November 2026 [S2] |
| npm-Metadaten | `@ui-sdk/core` und `@ui-sdk/react`: **0.1.0-beta.1**; `latest` und `beta` zeigen beide darauf. Per `npm view` am 13. November abgefragt [S3] |
| Stabilität | README kennzeichnet das Produkt ausdrücklich als Beta; ein `latest`-Tag ist keine Stable-Zusage [S0] |
| React-Peers | React/React DOM `>=19`, `@types/react >=19.2.10`, Core `^0.1.0-beta.1` [S3] |
| Lokale Kompatibilität | React/React DOM 19.2.9 und React-Types 19.3.0 erfüllen diese Peer-Anforderungen. Installation, Bundle und Laufzeitintegration wurden noch nicht geprüft. Kein Upgrade ergibt sich allein aus den Peers. |
| Lizenzangabe | Repository und Paketmanifeste nennen Apache-2.0. Bei einer tatsächlichen Quellübernahme werden Herkunft und erforderliche Hinweise mitgeführt [S4]. |
| Verifikation | Dokumentation, ausgewählte Implementierungen und Testquellen gelesen; keine SDK-Installation, keine ausgeführte Upstream-Testsuite und kein GPU-Kompatibilitätsnachweis. |

Dieser Nachtrag erweitert bewusst die ursprüngliche Oktober-Recherche: Das UI SDK war nach der datierten Ankündigung noch nicht Bestandteil dieser damaligen Produktbasis. Es wird weder rückdatiert noch stillschweigend zum bereits implementierten Framework erklärt.

## Was sich am Modell verändert

Base UI bietet ungestylte, offen zusammensetzbare React-Komponenten. Seine Parts und kontrollierten Werte waren bereits eine richtige Referenz für Fluid. UI SDK stellt zusätzlich die darunterliegenden Interaktionsbausteine besonders deutlich als wiederverwendbare Funktionen bereit: Auswahl, Fokusbewegung, Tastaturbehandlung, Popups, Dismissal, Drag/Drop und weitere Fähigkeiten. Es bietet zugleich fertige Komponenten und Adapter für React, Vue, Svelte, Solid und Web Components. Komponenten verschwinden dadurch nicht; sie werden zu geprüften Kombinationen kleinerer Fähigkeiten. [S0, S5, S6]

Für Fluid ist die Unterscheidung praktisch:

- **Fertige Komponente:** Eine bestimmte Tabelle mit festgelegten Erweiterungspunkten.
- **Komponierte Fähigkeiten:** sortierbare Collection + Mehrfachauswahl + Tastaturnavigation + kontextueller Inspector + Theme + Fluid-Übergang.
- **Daraus erzeugte Oberfläche:** dieselben ausgewählten Datensätze in Tabelle, Karten oder räumlicher Map; neue Kombinationen müssen nicht jedes Mal Auswahl, Fokus und Abbruch neu implementieren.

Die Aussage „ohne Einschränkungen oder Tradeoffs“ ist damit nicht belegt. Semantik, Bedienbarkeit, Leistung und Datenintegrität setzen weiterhin überprüfbare Bedingungen. Ein gestalterisch freies Ergebnis braucht gerade deshalb präzise Verhaltensverträge. Eine andere Darstellung darf ihre Rollen verändern; identische fachliche Auswahl verlangt nicht dieselbe ARIA-Rolle für Tabelle, Karten und Map.

## Was der Quellcode tatsächlich bereitstellt

| Baustein | Belegter Inhalt | Bedeutung für Fluid |
|---|---|---|
| `definePrimitive` | Verbindet Optionen, State, API, Slots, kontrollierte Werte und optionale Agent-Metadaten [S7] | Gute Vorlage für echte Komponentenverbünde; die TypeScript-Funktionen sind jedoch kein serialisierbares Projekt- oder Statechart-Format. |
| Slots und Parts | Benannte Teile mit Rollen, Attributen, Präsenz, Ereignissen und Lebenszyklus [S8] | Rollen und Beziehungen vor der Darstellung definieren; stabile Part-IDs für Semantik, Effekte und Tests nutzen. |
| Rollenpflichten | Typen verlangen je nach Rolle Fokusstrategie, Aktivierung, Tastaturvertrag und erforderliche ARIA-Zustände [S8] | Fehlende Bedienverträge schon bei Definition ablehnen; entsprechende Laufzeitvalidierung für importierte JSON-Projekte ergänzen. Dies beweist noch keine vollständige Accessibility. |
| Kontrollierte Änderungen | Änderungsantrag, Herkunft/Grund und Abbruch vor Übernahme [S9] | Passt zur vorhandenen Core-Autorität. SDK-State darf keine zweite Quelle fachlicher Wahrheit werden. |
| `createSelection` | Auswahl über Schlüssel, Reihenfolge, Zulässigkeit und Setter; die öffentliche Funktion benötigt Store-/Options-/Destroy-Zugriff, kein Element-Binding [S10] | Konkreter Kandidat für einen schmalen Adapter. Kontrollierte Updates, Range-Anker, Sortierung und Abbruch müssen mit Fluid geprüft werden. Der interne Helfer `createKeySelection` wird nicht als öffentliche Schnittstelle eingeplant. |
| Typeahead | Zeichen-/Label-basierte Suchlogik [S11] | Weiterer Kandidat. Benachbarte Text-Helfer können DOM benötigen; keine pauschale Freigabe des ganzen Moduls. |
| Live-Werte | Häufige Werte können Teile direkt aktualisieren, ohne vollständige Framework-Renderzyklen [S7, S8] | Für Drag/Pan/Resize interessant. Fluid behält eine kontrollierte Uhr und einen Surface-Scheduler; Live-Werte gehören nicht ungeprüft in Fachstate oder URL. |
| Agent-Oberfläche | Snapshot, Query, Aktionen, Beobachtung und optionale Tooldefinitionen [S14] | Ein maschinenlesbarer Bedienvertrag ist wertvoll; siehe eigene Autoritätsprüfung unten. |

## Die entscheidende Grenze: DOM und GPU

**Frameworkunabhängig bedeutet im geprüften SDK nicht vollständig rendererunabhängig.** `Part.el`, `PrimitiveContext.element` und `Slot.bind` sind an `HTMLElement` gebunden; Slot-Ereignisse stammen aus `HTMLElementEventMap`. Die Frameworkadapter machen daraus echte HTML-Elemente. Fokus, Elementreihenfolge, Popups und native Formfunktionen hängen teilweise an diesen Elementen. [S8, S12]

Auch der vorhandene Canvas-Guide ändert das nicht: Er beschreibt eine räumliche Arbeitsfläche mit DOM-Inhalten, CSS-Transformationen, Scrollpane, Pan/Zoom und Element-geometrischen Verbindungsports. Das ist für unsere Map-Interaktionen eine gute Referenz, aber kein WebGPU-Renderer. Die dortige Browser-Suche funktioniert über reale DOM-Texte; daraus folgt keine automatische Suche in GPU-Pixeln. [S13]

Besonders relevant: Der exportierte Entry `@ui-sdk/core/renderer` bezeichnet sich im Quellcode ausdrücklich als intern, undokumentiert und ohne öffentliche API-Stabilität. Einen produktiven Fluid-GPU-Adapter darauf aufzubauen wäre derzeit eine Abhängigkeit von Interna. [S12]

Ein SDK-Behavior könnte prinzipiell unsere native Semantikbrücke benutzen. Dies ist pro Behavior zu prüfen: Es darf keine zweite Fokusverwaltung, doppelte Aktivierung, abweichende Geometrie oder zusätzliche sichtbare DOM-Darstellung entstehen. Die bestehende Produktregel bleibt **WebGPU standardmäßig, Three.js-WebGL2-Fallback erlaubt und sichtbar gekennzeichnet**. Dieser Forschungsnachtrag ändert die Rendererentscheidung nicht.

## Agenten: Erstellen und Bedienen sind zwei verschiedene Aufgaben

**Entwicklungsagent:** Er darf neue TypeScript-Komponenten, Behavior-Implementierungen und GPU-Rezepte erstellen. Diese werden als Codeänderungen geprüft, gebaut und getestet. Ein Fluid-spezifischer Authoring-Skill sollte dafür die tatsächlich installierten APIs, Tokens, Beispiele, Invarianten und Testbefehle bereitstellen. Der upstream Skill ist auf UI-SDK-Komponenten zugeschnitten; seine Installationsanweisung wurde bei dieser Recherche nicht ausgeführt. [S18]

**Agent zur Laufzeit:** Er kann eine neue Kombination registrierter Fähigkeiten vorschlagen oder eine erlaubte Aktion anfordern. Der Vorschlag benötigt Schema, Datenbindung, Rechte, Revision, erlaubte Ziele und eine klare Freigaberegel. Unvollständige Streams bleiben Entwürfe. Freies Modell-JavaScript, beliebige Shader oder aus Modelltext erfundene URLs werden nicht als UI-Konfiguration ausgeführt.

Das UI SDK liefert dafür interessante Bausteine, aber keine fertige Fluid-Autorisierung:

- Ohne `allow` erlaubt die SDK-Bridge grundsätzlich die unterstützten Aktionen. Fehlen explizite `agent.actions`, können geeignete API-Methoden anhand ihrer Namen erkannt werden. Für Fluid werden exponierte Aktionen ausdrücklich registriert. [S14, S15]
- `act` arbeitet Schritte nacheinander ab. Scheitert ein späterer Schritt, bleiben frühere Änderungen bestehen. Eine atomare Fluid-Transaktion muss deshalb ausdrücklich im Core stattfinden; externe Mutationen erhalten keine erfundene Rollback-Garantie. [S14]
- Die Bridge erkennt SDK-Instanzen und gebundene Elemente. Vorhandene Fluid-GPU-Parts werden dadurch nicht automatisch erreichbar. Ein eigener Adapter muss den semantischen Komponentenvertrag lesen. [S15]
- `agentTools` ist keine Modellverbindung und kein Agent-Loop. **Das Vercel AI SDK bleibt die serverseitige AI-Anbindung.** Die bestehende Live-Designanalyse belegt noch keine produktive UI-Generierung oder Anwendungsorchestrierung. [S14]
- WebMCP ist eine optionale Transportanbindung über `document.modelContext`, mit zusätzlichem `allow` bei der Registrierung. Verfügbarkeit wird geprüft; es wird keine allgemeine Browserunterstützung zugesagt. [S15]

Eine konkrete Dokumentationsabweichung unterstreicht die notwendige Quellprüfung: Die Permissions-Seite sagt noch, `query()` könne Popups kurz öffnen. Aktueller Query-Code und Regressionstest im geprüften Commit beschreiben und prüfen dagegen lesendes Verhalten ohne Popupöffnung. Für unseren Entwurf sind Reads immer seiteneffektfrei. [S16]

## Abgleich mit dem eigenen Repository

Dies sind Befunde aus dem aktuellen Arbeitsbaum, keine Rückschlüsse allein aus Dateinamen:

| Ist-Zustand | Beleg | Empfohlene Konsequenz |
|---|---|---|
| Anatomy mit `componentId`, `part`, `behavior` vorhanden; nur fünf Behavior-Kategorien | [Contracts](../../packages/contracts/src/index.ts), [Vertragstests](../../tests/unit/base-ui-contracts.test.ts) | Gute Grundlage durch Rollenpflichten, Beziehungen und komponierbare Fähigkeiten erweitern. |
| `ComponentDefinition` bildet je State einen SceneNode ab und wird derzeit nicht für echte Komponenteninstanzen verwendet | [Contracts](../../packages/contracts/src/index.ts), [Workspace](../../packages/cases/src/workspace.ts) | Komponentenmodell grundlegend als Verbund benannter Parts neu definieren. Einen weiteren Widget-Namen hinzuzufügen implementiert kein Verhalten. |
| Fachstate, Interaktion und visuelle Effekte sind bereits getrennt; Änderungen besitzen Gründe und Cancel | [Core](../../packages/core/src/index.ts) | Diese Verantwortungstrennung als Invariante erhalten; konkrete APIs dürfen refaktoriert werden. |
| Button-/Textbox-Fälle wiederholen sich in Contracts, Core, DOM-Brücke, Hit-Testing und QA | [React](../../packages/react/src/index.tsx), [Hit-Testing](../../packages/webgpu/src/hit-testing.ts), [DOM-QA](../../packages/testing/src/dom-quality.ts) | Normalisierte Commands und eine gemeinsame Behavior-Auswertung für Pointer, Tastatur und Agenten. |
| `layoutScene` begrenzt Breiten erst im GPU-Paket; die React-Brücke positioniert anhand der rohen Scene | [GPU-Layout](../../packages/webgpu/src/index.ts), [Semantikbrücke](../../packages/react/src/index.tsx) | Gemeinsame aufgelöste Layoutgeometrie vor beiden Projektionen. Konkretes Gegenbeispiel: `x=900`, `width=240`, Viewport 1000 ergibt GPU-Breite 84, aber DOM-Breite 240. Dies ist eine statisch belegte Vertragslücke, kein neu durchgeführter Browserfehlernachweis. |
| Semantikbeziehungen sind bislang besonders auf Tabellen ausgerichtet | [Scene-Schema](../../packages/contracts/src/index.ts) | Collection-, Label-, Popup-, Auswahl- und Fokusbeziehungen allgemein modellieren; Rollen nicht aus Grafikformen erraten. |
| Fokus/Hover/Pressed beeinflussen Farben direkt im Renderer | [Renderer](../../packages/webgpu/src/index.ts) | Typisierte Behavior-Zustände als Eingabe für Theme-/Part-Rezepte; Gestaltung und Bedeutung getrennt testbar machen. |
| Deterministische Clips, Interruption, Replay, effektbezogene Geometrie und Ressourcen sind bereits gesonderte Infrastruktur | [Präsentation](../../packages/effects/src/presentation.ts), [Effektlayer](../../packages/webgpu/src/effect-layers.ts) | Über dieselben stabilen Parts anschließen; SDK-DOM-Animationen nicht als Ersatz für den M7-Sampler annehmen. |

## Übernahmematrix

| Thema | Direkt benutzen | Für Fluid adaptieren | Empfehlung |
|---|---|---|---|
| Selection/Typeahead | Öffentliche Funktionen nach isoliertem Kompatibilitätsproof | Store, kontrollierte Werte, Destroy und Ereignisse | **Früher Pilot** |
| DOM-Studio-Controls | Öffentliche React-Primitives/Behaviors in vergleichbarem Pilot | Tokens, kontrollierter Projektstate, lokale Rollen | **Mit Base UI anhand derselben Aufgabe vergleichen**; keine doppelte Overlay-/Fokusautorität |
| Rollen/Slots/Behavior-Komposition | Nicht das HTMLElement-Modell als Core übernehmen | Schema-basierte Multipart-/Semantikverträge und Compile-/Runtime-Checks | **Architekturpriorität** |
| Spatial Canvas | Kein direkter GPU-Renderer vorhanden | Pan/Zoom, Portbeziehungen, Tastaturpfade und Koordinatenverträge | **Konzept übernehmen** |
| Agent-Snapshot/Commands | SDK-Bridge nur für qualifizierte SDK-DOM-Instanzen | Aus Fluid-Semantik und freigegebenen Commands eigene Bridge ableiten | **Architekturpriorität** |
| WebMCP | Optionaler Adapter bei tatsächlicher Verfügbarkeit | Gleiche Core-Rechte und Commands | **Später, kein Kernzwang** |
| Authoring-Skill/Beispiele | Upstream als Referenz | Versionsgebundene Fluid-Dokumentation, Tokens, Rezepte und Conformance | **Übernehmen** |
| Testkit | Nur auf tatsächlich SDK-basierte Teile anwenden | Gemeinsame Behavior-Szenarien für DOM, GPU und Agenten | **Übernehmen und erweitern** |
| Interner Renderer/DOM-Motion | Keine Produktionsabhängigkeit | Kein notwendiger Nutzen gegenüber öffentlicher Fluid-Präsentationsschnittstelle belegt | **Nicht verwenden** |

## Zielbild und erster sichtbarer Nachweis

Der Aufbau sollte **Fähigkeiten → Komponentenverbünde → Semantik und aufgelöstes Layout → Darstellung** ausdrücken. Eine Agent-Schnittstelle wird aus denselben erlaubten Commands abgeleitet. Datenzugriff, Fachtransaktionen und URL-History behalten eigene Verträge; weder Drag-Koordinaten noch Streamingfragmente werden Navigationseinträge.

Der erste Proof sollte unseren echten Workspace erweitern: mehrere Module auswählen, per Tastatur einen Bereich markieren, sortieren, von Tabelle zu Karten und Map wechseln und einen kontextuellen Inspector öffnen. Identitäten und Auswahl bleiben erhalten; Escape und Fokus-Rückgabe sind sichtbar überprüfbar. Die M7-Effekte zeigen den Übergang. Ein Agent kann denselben freigegebenen Auswahl-/Ansichtswechsel über strukturierte Commands anfordern. So wird der Nutzen der neuen Architektur an einer echten Interaktion sichtbar.

Ein freier UI-Generator ist ein nachfolgender Schritt. Seine erste Aufgabe wäre eine im Studio prüfbare Komposition aus dem registrierten Katalog mit Vorschau und Diff. Neue beliebige Behavior-Implementierungen entstehen weiterhin im Entwicklungsprozess. Damit bleibt die gestalterische Erweiterbarkeit groß, ohne Daten- und Bedienverträge zur Laufzeit aufzugeben.

Für den Vergleich zählen: korrekte Rollen und Fokuspfade, keine doppelten Aktionen, konsistente Bounds, Erhalt von Auswahl/Entwürfen, keine unberechtigten Agent-Aktionen, reproduzierbare M7-Übergänge sowie gemessener Integrationsaufwand, Bundlekosten und Interaktionsleistung. Weniger Tokens, weniger Fehler und höhere Performance sind **zu messende Hypothesen**, keine aus der Ankündigung übernommenen Garantien. Die Upstream-Testarchitektur ist ein Vorbild; virtuelle Screenreader-Tests ersetzen keine native VoiceOver-/NVDA-Prüfung. [S17]

## Primärquellen

- **S0:** [README und Beta-Hinweis](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/README.md).
- **S1:** [Ankündigung vom 12. November](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/apps/docs/content/docs/core/changelog/introducing-ui-sdk.mdx).
- **S2:** [Geprüfter Commit](https://github.com/vercel-labs/ui/commit/c53df2f45c7502bebf0f52619dfe75007a309eb6).
- **S3:** [npm Core 0.1.0-beta.1](https://registry.npmjs.org/@ui-sdk%2fcore/0.1.0-beta.1), [npm React 0.1.0-beta.1](https://registry.npmjs.org/@ui-sdk%2freact/0.1.0-beta.1), [React-Paketmanifest](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/react/package.json).
- **S4:** [Repository-Lizenz](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/LICENSE).
- **S5:** [Base UI: About und offene Komposition](https://base-ui.com/react/overview/about).
- **S6:** [Compose behaviors](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/apps/docs/content/docs/core/compose-behaviors.mdx).
- **S7:** [Primitive-Implementierung](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/core/src/foundation/kernel/primitive.ts).
- **S8:** [Slot-, Rollen- und Elementverträge](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/core/src/foundation/kernel/primitive-types.ts).
- **S9:** [Handle changes](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/apps/docs/content/docs/core/kernel/handle-changes.mdx).
- **S10:** [Selection-Modell](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/core/src/foundation/selection/selection-model.ts), [öffentlicher Core-Export](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/core/src/index.ts#L90).
- **S11:** [Typeahead](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/core/src/foundation/text/typeahead.ts).
- **S12:** [Interner Renderer-Entry](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/core/src/renderer.ts), [Render a primitive](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/apps/docs/content/docs/core/kernel/render-a-primitive.mdx).
- **S13:** [Canvas-Guide](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/apps/docs/content/docs/core/behaviors/canvas.mdx), [Viewport](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/core/src/foundation/canvas/viewport.ts), [Connections](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/core/src/foundation/canvas/connect.ts).
- **S14:** [Agent-Referenz](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/apps/docs/content/docs/agents/connect-an-agent/reference.mdx).
- **S15:** [Agent- und WebMCP-Implementierung](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/core/src/page/agent/agent.ts).
- **S16:** [Permissions-Dokumentation](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/apps/docs/content/docs/agents/connect-an-agent/permissions.mdx), [Query-Implementierung](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/core/src/page/agent/agent.ts#L1716), [Query-Regressionstest](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/core/test/agent.test.ts#L2380).
- **S17:** [Testmethodik](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/tests/README.md), [Browsermatrix](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/tests/playwright.config.ts), [Testkit](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/apps/docs/content/docs/core/testing.mdx).
- **S18:** [Upstream Authoring-Skill als Recherchequelle](https://github.com/vercel-labs/ui/blob/c53df2f45c7502bebf0f52619dfe75007a309eb6/packages/core/skills/ui-sdk/SKILL.md).
