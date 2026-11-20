# ADR-0007: Hybrider Refactor mit eigenen Verhaltensverträgen und qualifizierten UI-SDK-Bausteinen

**Datum: 13. November 2026. Status: vom Nutzer beschlossen, im begrenzten M8-Umfang implementiert und lokal anhand aller 41 Kriterien qualifiziert; keine allgemeine Produktions- oder Performancefreigabe.**

Diese Entscheidung folgt der [Recherche zu Vercel UI SDK](../research/vercel-ui-sdk.md).
Der Nutzer hat den hybriden Refactor und die vollständige Umsetzung freigegeben:
[M8](../milestones/m8-plan.md) liefert zuerst einen sichtbaren qualifizierten Proof
und setzt danach T59–T65 konsistent fort. Ein vollständiger Refactor ist erlaubt;
Erhaltung alter APIs ist kein Auswahlkriterium.

Die Entscheidung ergänzt 41 neue Kriterien, ohne die bestehenden 435 AC zu ändern.
Die 27 lokal qualifizierten M7-Kriterien behalten ihren ursprünglichen Scope,
Build und Nachweis. Ein Beschluss ist noch keine bestandene Implementierungsabnahme.

## Problem und Ziel

Fluid kann bereits echte Workspace-Daten in unterschiedlichen GPU-Ansichten
darstellen und Übergänge reproduzierbar prüfen. Das allein ergibt noch keine
vollständige Komponentenbibliothek. Eine Tabelle, ein Select oder ein Dialog
benötigt neben seiner Form benannte Teile, kontrollierte Werte, Rollen,
Tastaturregeln, Fokusführung, Aktivierung und einen überprüften Lebenszyklus.

Die Frage ist deshalb, welche Teile von UI SDK die Qualität und Lieferbarkeit
dieses Unterbaus verbessern und wo Fluid eigene Verträge benötigt. Das Ziel ist
eine gemeinsame fachliche und interaktive Definition für Studio, GPU-Darstellung,
Semantik, Authoring und begrenzte Agentenaktionen.

## Geprüfte Ausgangslage

Die zugrunde liegende Recherche untersucht **UI SDK 0.1.0-beta.1** und den
Repository-Stand `c53df2f45c7502bebf0f52619dfe75007a309eb6` vom **12. November 2026**.
Das ist eine datierte Beta-Evaluation, keine Zusage einer stabilen API oder ein
Auftrag zum Dependency-Upgrade. Quellen und Abgrenzungen stehen im
[Research](../research/vercel-ui-sdk.md).

Die Paketmetadaten führen `@ui-sdk/core` und `@ui-sdk/react` jeweils als
`0.1.0-beta.1` unter `latest` und `beta`. Die React-Peers verlangen `react >=19`,
`react-dom >=19`, `@types/react >=19.2.10` und `@ui-sdk/core ^0.1.0-beta.1`.
Die vorhandenen React-/React-DOM-Versionen 19.2.9 und React-Types 19.3.0 erfüllen
diesen Versionsvertrag. Ein Upgrade ist dadurch nicht erforderlich; Installation,
Build und tatsächliche Integration sind weiterhin zu prüfen.

| Befund | Konsequenz für die beschlossene Verwendung |
|---|---|
| UI SDK besitzt gemeinsame Komponenten- und Verhaltenskonzepte. | Verhalten und Anatomy als Referenz bewerten; dokumentierte öffentliche DOM-Bausteine im Studio vergleichen. |
| `/renderer` ist ein interner Pfad; `PrimitiveContext.element`, `Part.el` und `Slot.bind` sind DOM-bezogen. | Daraus keine öffentliche GPU-Renderer-Schnittstelle oder ungeprüfte direkte Mesh-Unterstützung ableiten. |
| `Canvas` bezeichnet DOM-Pan/Zoom. | Es ersetzt weder Three.js noch den GPU-Renderer, Text, Hit-Testing oder die Semantikbrücke. |
| Selection und Typeahead besitzen abgrenzbare Verhaltenslogik. | Als kleine Adapterpiloten auf DOM-Unabhängigkeit, Abhängigkeiten und tatsächliche Ergebnisse qualifizieren. |
| Die Upstream-Agentbridge aktiviert standardmäßig unterstützte Aktionen; `act` führt sie sequenziell ohne Rollback aus. | Fluid erhält eine explizite, standardmäßig geschlossene Allowlist mit Revision, Berechtigung und Core-Commit. Die Upstream-Ausführung ist keine Transaktion. |
| Fluid verwendet Vercel AI SDK bereits serverseitig für Designreview. | Modellanbindung weiter über AI SDK; Anwendungs-DecisionPlans und UI-Generierung bleiben eigene, noch offene Abnahmen von T22. |

UI SDK, Base UI und Vercel AI SDK sind unterschiedliche Bausteine. UI SDK ist hier
Gegenstand der Komponenten-/Agenten-Evaluation, Base UI die vorhandene
DOM-Verhaltensreferenz des Studios, Vercel AI SDK der serverseitige Modellzugang.

## Alternativen und Bewertung

Bewertung von 1 bis 5 in der Reihenfolge **Zielerfüllung, Korrektheit/Sicherheit/
Accessibility, Testbarkeit, Lieferbarkeit/Wartung, Erweiterbarkeit**. Gewichte:
**30 / 25 / 20 / 15 / 10**. Score = gewichtete Summe geteilt durch 5.
Alle Werte sind begründete Planungsbewertungen, keine gemessenen Produktvorteile.

| Option | Vorgehen | Ratings | Score | Bewertung |
|---|---|---|---:|---|
| A | Einzelne Konzepte übernehmen, den heutigen Aufbau nur punktuell ergänzen | 3 / 4 / 4 / 5 / 3 | 75 | Schnell lieferbar; das unvollständige Komponentenmodell wird nur begrenzt systematisch verbessert. |
| B | SDK-Komplettumstieg einschließlich eigener GPU-Anbindung an interne Rendererstrukturen | 4 / 2 / 2 / 3 / 3 | 57 | Hohe Abhängigkeit von Beta-Interna und DOM-Annahmen; neue Semantik-/GPU-Nachweise trotzdem erforderlich. |
| C | Hybrid: Fluid-Verträge vom Verhalten her erneuern, reine Logik adaptieren und öffentliche DOM-Bausteine im Studio qualifizieren | 5 / 4 / 5 / 4 / 5 | 92 | Eigene überprüfbare Autorität und GPU-Projektion; gezielte Nutzung geeigneter Infrastruktur. |
| D | Gesamten Verhaltenskern einschließlich aller Komponenten selbst entwickeln | 5 / 4 / 4 / 2 / 5 | 82 | Volle Kontrolle, aber erhebliche eigene Implementierungs- und Conformance-Arbeit. |

**Beschlossener Gewinner: C.** Die Entscheidung kann einen umfangreichen Refactor
einschließen. Sie beruht auf überprüfbaren Grenzen und dem Nutzen öffentlicher
Bausteine, nicht auf dem Wunsch, vorhandenen Code zu erhalten. Ein nicht geeigneter
Adapterpilot führt zur eigenen Umsetzung seines kleinen Verhaltensvertrags;
er rechtfertigt keine stille Abhängigkeit von SDK-Interna.

Komponentenverträge, Komposition und gemeinsame Layoutauflösung werden dabei
gründlich auf das Zielmodell ausgerichtet. Bereits qualifizierte Teilsysteme
werden nach ihrer Eignung für dieses Modell bewertet. Der Hybrid ist weder ein
Versprechen minimaler Codeänderungen noch eine bloße Adapterhülle um unveränderte
Architekturprobleme.

## Beschlossene Architekturentscheidung

1. **Verhalten vor Form:** Multipart-Komponenten benennen Root, Control, Trigger,
   Label, Content und weitere tatsächlich benötigte Teile. Jeder interaktive Part
   besitzt definierte Rollen, Namen, Zustände, Fokus-, Tastatur- und Press-Regeln.
   Die konkrete Anatomy hängt vom Komponententyp ab; ein dekorativer Part erhält
   keine Aktivierungsrechte allein durch seine visuelle Form.
2. **Eine Autorität je Zustand:** Core/Host besitzen Fachwerte und Auswahl;
   der Interaktionsstore besitzt Fokus, Hover, Pressed und Composition. Die Surface
   besitzt nur Darstellung, Zeit und Ressourcen. Ein SDK-Adapter erzeugt keinen
   parallelen fachlichen Store.
3. **Gemeinsam aufgelöstes Layout:** Ein versionierter Layoutvertrag
   wird vor der GPU- und Semantikprojektion berechnet. IDs, Bounds, Clipbereiche,
   Layer, Sichtbarkeit und Transformationen kommen aus derselben Quelle. Während
   eines Übergangs verwenden Eingabe und Semantik die qualifizierte dargestellte
   Geometrie; Zielbounds allein reichen dafür nicht aus.
4. **Öffentliche Integration zuerst:** Selection und Typeahead werden als kleine
   isolierte Adapter geprüft. Studio-Primitives werden gegen Base UI verglichen.
   GPU-Basics hängen nicht an `HTMLElement`, React-DOM-Hooks oder einem privaten
   `/renderer`-Import. Der konkrete übernommene Pfad ist nach dem Proof der
   öffentliche `@ui-sdk/core`-Adapter für kontrollierte Selection; die folgende
   Teileentscheidung grenzt weitere Kandidaten ausdrücklich ab.
5. **Agentenrechte sind Fluid-Rechte:** Die Fluid-Bridge beschreibt nur ausdrücklich
   freigegebene Aktionen. Jeder Request trägt erwartete Revision und überprüfte
   Parameter. Guards, Rechte und Schutz aktiver Eingaben gelten vor dem Core-Commit.
   Externe Aktionen bleiben im Action-Adapter; eine Reihe von SDK-`act`-Aufrufen
   erhält keine erfundene Atomarität oder Rücknahmegarantie.
6. **Entwicklungs- und Laufzeitagent unterscheiden:** Ein Entwicklungsagent darf
   überprüfbaren Code als Diff und Tests vorschlagen. Ein Laufzeitagent darf nur
   registrierte, schema- und referenzgeprüfte Kompositionen und Aktionen vorschlagen.
   Freies JavaScript, dynamische Imports, Shader und frei erfundene URLs werden
   nicht aus Modellantworten ausgeführt.
7. **AI SDK bleibt Servergrenze:** Generierung und Modellanalyse verwenden Vercel AI
   SDK mit eigener Autorisierung, Budgetierung, Deadline und Abort. Manual bleibt
   unabhängig von einem Modell. Designreview und Anwendungsgenerierung erhalten
   getrennte Nachweise.

## Frühe Entscheidungsschwelle

Der erste sichtbare Proof verwendet dieselben realen Workspace-Daten für
**Tabelle, Karten und Map**, ergänzt Mehrfachauswahl, eindeutige Tastaturnavigation,
numerische Sortierung und einen kontextbezogenen Inspector. Dieselben IDs,
fachlichen Auswahlwerte und Fokusbezüge bleiben über Ansichtswechsel erhalten.
M7-Effekte bleiben deterministische Präsentation; ihre bisherigen Nachweise werden
nicht automatisch auf den neuen Aufbau übertragen.

Nach bestandenem sichtbarem Proof folgt die bereits freigegebene vollständige
Umsetzung. Der dokumentierte Vergleich entscheidet weiterhin über die Eignung
konkreter SDK-Teile. Ein Screenshot oder ein erfolgreicher SDK-Import reicht als
Funktionsnachweis nicht.

## Qualifizierte Teileentscheidung vom 13. November

Der native Vergleich (internes Archiv) prüft beide
DOM-Kandidaten mit demselben gemounteten Core, elf echten Modulen, gemeinsamem
Theme, konfiguriertem Seed 42, einer WebGPU-Surface und 1280 × 900 Browserpixeln.
Beide Pfade bestehen Tabelle → Karten → Map, die Tastaturauswahl Kernel,
Dialog-Fokusübergabe, Tab-Begrenzung und Escape mit Rückkehr zum Auslöser.
Dialog und Bibliothekswechsel verändern die Fachrevision nicht. Der deaktivierte
Detail-Tab ist in beiden Bibliotheken fokussierbar, aber nicht aktivierbar.
Dieser lokale Funktionsnachweis ist keine Screenreader-/Mobile-/Plattformfreigabe.

| Baustein | Entscheidung | Begründung und verbleibende Grenze |
|---|---|---|
| Kontrollierte Selection | **Öffentlichen SDK-Adapter übernehmen** | `createSelection` und `definePrimitive` aus `@ui-sdk/core` sind im Fluid-Collection-Adapter integriert und headless sowie mit tatsächlichen Core-Commits geprüft. Fluid besitzt weiterhin die fachlichen Schlüssel, Reihenfolge und Autorität. |
| Typeahead | **Eigene zeitpunktgesteuerte Implementierung** | Das geprüfte SDK-`createTypeahead` verwendet einen globalen Timeout ohne injizierbare Uhr. Fluid benötigt explizite Zeit für Replay und Tests und besitzt deshalb einen begrenzten timerfreien Adapter mit Eingabe-/Composition-Schutz. Das ist eine konkrete Vertragsabweichung, keine allgemeine SDK-Abwertung. |
| Studio-Tabs | **Base UI beibehalten** | Beide erfüllen den qualifizierten lokalen Ablauf. Das isolierte öffentliche SDK-Tabs-Entry ist um 5.235 gzip Bytes größer; im geprüften Flow wurde keine zusätzliche benötigte Fähigkeit nachgewiesen, die den Wechsel rechtfertigt. |
| Studio-Select | **Base UI beibehalten** | Kontrollierter Wert, Tastaturauswahl und Core-Übernahme funktionieren auf beiden Pfaden. Das isolierte SDK-Entry ist um 14.135 gzip Bytes größer. Es gibt keinen nachgewiesenen Funktionsvorteil für den benötigten Vergleichsflow. |
| Studio-Dialog | **Base UI beibehalten** | Fokusübergabe, Tab-Begrenzung, Escape und Rückkehr bestehen lokal auf beiden Pfaden. Das isolierte SDK-Entry ist um 19.995 gzip Bytes größer. Eine breitere Accessibility-Freigabe wird keiner Bibliothek automatisch zugeschrieben. |
| Öffentliche UI-SDK-DOM-Bausteine | **Im Vergleichslabor verfügbar halten** | `/studio/behaviors` bleibt reproduzierbarer Vergleich mit gepinntem `0.1.0-beta.1`. Neue SDK-Versionen oder konkret benötigte Fähigkeiten können die Entscheidung nach erneuter Prüfung ändern; keine automatische Übernahme aus einem Versionslabel. |
| Multipart-/Layout-/Policy-Kern | **Fluid-Verträge selbst besitzen** | Gemeinsame Parts, aufgelöste Geometrie, Eingabeprojektion und Agentenrechte gehören zur Produktarchitektur. Private SDK-Renderer- oder Agentmodule werden dafür nicht eingebunden. |

Die drei Einzelgrößen sind wegen gemeinsam genutzten Codes **nicht addierbar**.
Der identisch gebaute kombinierte Adapter ergibt **73.165 gzip Bytes für UI SDK**
und **56.386 für Base UI**, also **+16.779 Bytes**. Das
Messprotokoll (internes Archiv) trennt diesen Fixtureumfang
von der nicht gemessenen kompletten Next.js-Anwendung. Die gepinnte Beta-API und
der größere gemessene Importumfang sind Wartungs-/Integrationsabwägungen; sie
beweisen keine schlechtere Bedienqualität. Alte APIs zu erhalten war kein
Entscheidungsargument. Es gibt aus dieser Auswahl keine globale Aussage zur
Überlegenheit von Base UI oder UI SDK.

Das Importinventar (internes Archiv) bindet die vier
tatsächlichen öffentlichen Pfade, Paketversionen, Lizenzen, Transitivität und
Server-/DOM-Grenzen. Die Eingabeherkunft im Vergleich wurde nach einem echten
Browserbefund korrigiert und nativ erneut geprüft; ein reiner jsdom-Erfolg wurde
dabei ausdrücklich nicht als ausreichend behandelt.

## Verhältnis zu bisherigen Entscheidungen und Nachweisen

- [ADR-0002](0002-base-ui.md) bleibt als historische Entscheidung erhalten. Seine
  Grenzen für eigene GPU-Verhaltensverträge und getrennte State-Besitzer werden
  bestätigt. Die direkte Studio-Bausteinauswahl wird durch den qualifizierten
  UI-SDK-/Base-UI-Vergleich T62 ergänzt; eine vollständige Entfernung von Base UI
  ist damit nicht beschlossen.
- WebGPU bleibt Standard mit sichtbarem WebGL2-Fallback. Für Runtime-Komponenten
  wird kein sichtbarer HTML-Ersatzrenderer eingeführt.
- M7-Dateien, aufgezeichnete Builds, AC-Texte und Evidenzhashes bleiben unverändert.
  Der Refactor benötigt eigene Regressionen auf dem neuen Build.
- Vollständige Screenreader-, IME-, Mobil- und Hardwarequalifikation bleibt eine
  explizite Produktaufgabe; SDK-Konformität wird nicht pauschal geerbt.
- T22 bleibt teilweise umgesetzt. Live-Designreview wird nicht als Nachweis für
  Intent, generative Benutzeroberflächen oder autonome Aktionen umgedeutet.

## Umsetzungsauftrag und Traceability

[M8 und T59–T65](../milestones/m8-plan.md) führen die verbindlichen Aufgaben mit
41 neuen AC. Zuerst gilt das sichtbare M8a-Gate. Danach werden Studiovergleich,
Agentbridge, Authoring und Conformance ohne erneute Grundsatzfreigabe umgesetzt.
Noch ungeprüfte Funktionen bleiben offen; T22 ist durch diesen Beschluss nicht abgeschlossen.

Die folgende kompakte Entscheidungszeile wird zusammen mit den sieben Taskwertungen
gegen [ui-sdk-scores.json](ui-sdk-scores.json) rechnerisch geprüft.

| Entscheidung | A | B | C | D | Gewinner |
|---|---:|---:|---:|---:|---|
| UI-SDK-STRATEGY | 75 | 57 | 92 | 82 | C |
