# Direkte OpenAI-Review — Ausführung vom 2. November 2026

Ergänzung zu M6, T22/T27/T55/T58. Der Nutzer hat die Wiederverwendung des bereits
in der lokalen Projektwurzel vorhandenen `OPENAI_API_KEY` ausdrücklich bestätigt.
Es wird kein Secret kopiert oder in Artefakte/Browsercode geschrieben. Die
vorhandene `.env.local` ist der Speicherort; Umgebungswerte des Serverprozesses
haben Vorrang. Next lädt die Projektwurzel nur für den Serverbetrieb.

## Recherche und Entscheidung

`ai@7.0.159` bleibt erhalten. Der aktuelle kompatible OpenAI-Provider ist
`@ai-sdk/openai@4.0.106` (Node >=22, Zod 4 kompatibel). Die lokale SDK-Dokumentation
bestätigt Responses, `Output.object`, Datei-Parts, `store: false`, `serviceTier`
und die modellspezifischen Reasoning-Optionen.

[GPT-6.1 Terra](https://developers.openai.com/api/docs/models/gpt-6.1-terra)
unterstützt Bildinput und Structured Outputs; es ist für visuelles Reasoning
ausgelegt. Das freigegebene Profil verwendet die Standardverarbeitung, begrenzte
Ausgabe und einen überprüfbaren Inputdeckel. Preise werden mit Datum/Quelle
versioniert, Modellzugang wird direkt bei OpenAI geprüft.

Der [Tokenzähl-Endpunkt](https://developers.openai.com/api/docs/guides/token-counting)
zählt die tatsächlich vom Vercel-Provider serialisierte Anfrage einschließlich
Bildinput und Ausgabeschema vor der Generierung. Die Anfrage wird bei unbekanntem
Ergebnis oder Überschreitung abgewiesen. Nur die Generierung nutzt den SDK-Provider;
Modell-/Tokenmetadaten sind begrenzte OpenAI-Kontrollanfragen.

Bewertung 30/25/20/15/10 (Ziel, Korrektheit, Testbarkeit, Lieferung, Erweiterbarkeit),
Ratings 1–5; Planungswerte, keine gemessenen Qualitätswerte:

| Option | Ratings | Score | Entscheidung |
|---|---|---:|---|
| A kleineres Modell mit Reservierung des vollen Kontextes | 3/5/4/5/3 | 80 | lieferbar, unnötige Modellbegrenzung |
| B starkes Modell mit pauschaler Zeichenschätzung | 5/2/2/4/3 | 66 | unzureichend belegte Bild-/Schemaobergrenze |
| H2 lokale Texttokenizer plus eigene Bildformel | 4/3/4/3/4 | 72 | zusätzliche modellspezifische Wartung |
| H direkter SDK-Provider plus exakte OpenAI-Inputprüfung | 5/5/5/4/4 | 95 | **Gewinner**, bestehende Policy-/Budgetgrenzen bleiben zuständig |

## Arbeit und Abnahme im bestehenden Plan

1. T22/T58: direkter Provider als Standard, korrekte Herkunft im Ergebnis und
   tatsächlicher Provider im Studio; Gateway bleibt ausdrücklich optional.
2. T27: Reservierung vor allen Modellarbeiten, tatsächlicher Inputdeckel im
   Transport, Standard-Tier, Outputlimit, Deadline/Abort und konservative
   Abrechnung bei unbekannter Usage; konkurrierende Sessions umgehen keine Limits.
3. T58: Live-Aufruf mit freigegebenen echten GPU-Bildern, Schema-/Referenzprüfung,
   reale Usage/Latenz und offene Qualitätsabdeckung als Artefakt dokumentieren.
4. T55: Befunde bleiben beim Framewechsel erhalten; Review/Export unterstützen
   nachvollziehbare menschliche Bewertung. Keine automatische Projektänderung.
5. T19/T43: negative Transport-/Budget-/Providerfälle, Build und Browserprüfung;
   Feature-Matrix, AC-Nachweise und Mermaid aktualisieren. Ein erfolgreicher
   Live-Aufruf ist keine vollständige Modellevaluation oder Releasefreigabe.

## Live-Review und zurückgeführte Verbesserungen

Der erste Browseraufruf auf einem echten WebGPU-Bild benötigte 13,2 s,
6.818 Input- und 712 Outputtokens; konservative Usage-Schätzung 0,020605 USD.
Bewerteter Export (internes Archiv). Zwei der vier
Befunde verwechselten Anfangszustand und späteres Storyziel. Sie wurden begründet
verworfen; Policy `review-3` berücksichtigt die jeweilige Phase ausdrücklich.
Zwei nachvollziehbare Hinweise werden in der gemeinsamen GPU-Projektion korrigiert.

| Verbesserung | A | B | Hybrid | Gewinner |
|---|---|---|---|---|
| Gewichtung der Effektsteuerung | ausblenden 64, verletzt Showcasewunsch | nur Farben abschwächen 76 | Ansichtswechsel vor sichtbaren Effekten, restliche Datenpositionen stabil 94 | H |
| Abhängigkeitsbeschriftung | überall ausschreiben 64, schmale Spalten zu eng | überall abkürzen 80 | breite Spalten ausschreiben, kompakt abkürzen und vollständigen zugänglichen Namen verwenden 96 | H |

Die acht Effektaktionen bleiben im Studio und Showcase vorhanden. Semantik- und
Zeichenreihenfolge folgen der sichtbaren Anordnung. Grenzen und fachliche
Identitäten werden weiterhin von derselben Projektion abgeleitet.

Der [versionierte adversarielle Textfall](../../tests/evaluations/ai-review-v1.json)
wurde ebenfalls live geprüft: 6.906 Input-/436 Outputtokens, konservativ 0,019446
USD. Modellresistenz gegen diese Brief-Anweisung und externe Referenzprüfung
bestanden im angegebenen Scope. [Ergebnis](../qa/2026-11-02-openai/brief-injection-v1.json).
Der opt-in Runner `scripts/evaluate-ai-review.ts --live` ist kein regulärer
CI-Test und benötigt einen expliziten Live-Aufruf. Ein Fall qualifiziert weder
visuelle Prompt Injection noch einen breiten unabhängigen Evaluationskorpus.

## Abschluss dieses Schnitts

Übergabebuild: **`fluid-b383e3697f017257a779`**. Der zweite Browseraufruf prüft
zwei echte Bilder (Detail r3, Tabelle r4): **12,838 s, 12.228 Input-/707 Outputtokens,
konservativ 0,034105 USD**. Ergebnis und menschliche Bewertung (internes Archiv).
Die drei erfolgreichen Live-Generierungen dieses Schnitts ergeben zusammen eine
konservative Usage-Schätzung von **0,074156 USD**, keine Anbieterrechnung.

127 Tests in 16 Dateien, strict Typecheck, ESLint und Paket-/Next-Build bestanden.
Die [finale Endpunktmatrix](../qa/2026-11-02-openai/final-layout-matrix.json) enthält
Tabelle/Karten/Detail bei 320/390/768/1280 px Browserbreite, mit tatsächlichen
Surfacebreiten 268/338/431/838 px. Alle zwölf Endpunkte haben Phase 1, überprüfte
Glyphen und null Befunde. Dazwischen aufgenommene Frames ohne Textabdeckung liegen
als ausdrücklich unvollständige Zwischenprüfungen im `interim`-Ordner.

Kompakte Korrekturen: kurze Overline, kleinere Innenabstände bei unveränderten
Mindestschriftrollen sowie 14-px-Body für die schmalsten Karten. Der lange Titel
`gpu-kernels` bleibt vollständig lesbar. Die AI-Reviewform wurde zusätzlich bei
320 px geprüft; kein Control verlässt seinen Panelbereich. Referenznavigation
verändert den Fachstate nicht, Review und Bewertungen bleiben beim Tabwechsel
bestehen. Verlorene Bilder im begrenzten Puffer deaktivieren ihren Navigationsknopf.

Der [Client-Secret-Check](../qa/2026-11-02-openai/secret-boundary.json) prüft 77
statische Clientdateien ohne Keytreffer. Der tatsächliche Key ist weder Nachweis
noch Exportinhalt; nur Konfigurationsstatus und Speicherort werden dokumentiert.
Ein manueller Ansichtswechsel war möglich; eine zeitliche Überlappung mit der
Inferenz wurde nicht belastbar erfasst und wird nicht als Concurrency-Proof gezählt.

### Weitergeführte Reviewpunkte in bestehenden Tasks

Keine automatischen Änderungen aus subjektiven Modellhinweisen. Die drei offenen
Bewertungen bleiben im exportierten Review erhalten; sie erweitern bestehende
Task-Unterarbeit, nicht die Definition abgeschlossener AC.

| Task / Reviewpunkt | A / B / Hybrid, Planungsscores | Gewählter nächster Ansatz | Überprüfbare Abnahme, noch offen |
|---|---|---|---|
| T47/T55: Dichte der Effektsteuerung | A ausblenden 58, verletzt Showcasewunsch / B nur Farben 76 / H sichtbare Schnellwahl plus aufklappbare Detailregeln 94 | H, als nächste Designvariante qualifizieren | Alle acht Aktionen bleiben per Tastatur und Pointer erreichbar; derselbe Visual-State; keine Überlagerung; Vergleich auf 268 px Surface und Desktop. |
| T13/T14: Detail-Herkunft und Rückweg | A nur Browser-Back 68 / B klar beschriftete bestehende Rückwege 90 / H deklarierte Herkunft plus explizite Rückwege 94 | H, im Navigationsvertrag qualifizieren | Herkunft aus fachlichem Zustand ableiten; Sortierung/Filter/IDs erhalten; Deep Link ohne Herkunft definiert; Back/Forward ohne externe Mutation. |
| T13: interne/externe Paketbezüge | A Paketpräfix erraten 56 / B Abgleich mit echtem Workspace-Manifest 94 / H zusätzlicher externer Metadatenabruf 78 | B | Jede tatsächlich vorhandene Abhängigkeit genau einmal; keine erfundene Gruppe; Gruppenzählung stimmt; schmale Ansicht und fehlende Metadaten geprüft. |

Die Gesamtvision bleibt offen. Dauerhafte Runs und Budgetautorität, breite
Modellevaluation, visuelle Prompt Injection, Pixelmaskierung, Änderungsdiffs,
kompletter Film und manuelle Accessibility sind weiterhin eigene Produktgates.
