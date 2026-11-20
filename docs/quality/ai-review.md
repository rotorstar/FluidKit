# Studio-AI-Review mit Vercel AI SDK

Stand: **2. November 2026**. Lokaler vertikaler Schnitt für T22/T27/T55/T58;
keine vollständige Produktionsqualifikation. Direkter OpenAI-Live-Aufruf auf
realen WebGPU-Pixeln nachgewiesen: bewerteter Export (internes Archiv),
zugehöriger Lauf (internes Archiv).

## Sicherer Betrieb

`ai@7.0.159` und `@ai-sdk/openai@4.0.106` verwenden `generateText`, `Output.object`
und PNG-Datei-Parts. OpenAI ist der Standardprovider; die Anwendungsruntime bleibt
in Manual. Es gibt keinen Key-Eingabedialog im Browser.

Der bereits vorhandene, ausdrücklich freigegebene Key liegt in **`.env.local`
der Projektwurzel**, Variable **`OPENAI_API_KEY`**. Die Datei ist ignoriert und hat
Dateirechte `0600`. Keine Kopie im App-Verzeichnis oder in Artefakten. Vorhandene
Umgebungsvariablen haben Vorrang. Next lädt die Wurzel ausschließlich beim
Serverstart; nach einer Änderung den Studio-Server neu starten. `.env.example`
enthält ausschließlich leere Secret-Platzhalter und öffentliche Einstellungen.

Öffentliche Einstellungen: `FLUID_AI_REVIEW_PROVIDER=openai` (Default),
`FLUID_AI_REVIEW_MODEL=gpt-6.1-terra` (qualifiziertes Defaultprofil). Andere direkte
Modelle benötigen eine eigene Preis-/Capability-Qualifikation. Optional kann
`FLUID_AI_REVIEW_PROVIDER=vercel-ai-gateway` mit `AI_GATEWAY_API_KEY` und einer
qualifizierten Gateway-Modell-ID verwendet werden. Kein automatischer Wechsel.

`store: false`, Standard-Tier, kein Toolzugriff, keine frühere Conversation,
kein eigener API-Proxy und keine beliebigen Base-URLs. `store: false` deaktiviert
das Speichern des Responses-Anwendungszustands; es ist keine Zusage einer
allgemeinen Zero-Retention-Regel des Anbieters.

## User-, Daten- und Zustandsvertrag

1. Auf `/studio/rehearsal` bewusst eine Story starten oder frei bedienen.
2. „Aktuellen Frame aufnehmen“ pausiert die Präsentation und liest das Canvas im
   Rendercallback. Sensitive Parts einschließlich ausgehender Inhalte verweigern
   die Aufnahme. Allgemeine pixelweise Maskierung steht noch aus.
3. Bis zu drei Bilder auswählen und den sichtbaren Uploadumfang freigeben.
   Provider, Modell und Reservierung werden vor dem Aufruf angezeigt.
4. Der Server prüft Loopback-Host und exakten Browser-Origin, HttpOnly-Session,
   CSRF, tatsächlich gelesene Requestbytes, Schema und PNG-Geometrie. NextURL
   normalisiert Loopback-IP-Adressen; die Prüfung verwendet deshalb die strikt
   validierte tatsächliche Host-Autorität auf demselben Port. Forwarded-Header
   erlauben keine fremden Hosts oder Origins.
5. Pro Session läuft höchstens eine Analyse. Vor allen Modellarbeiten erfolgen
   synchrone Reservierung, 20 s Deadline und null automatische Retries.
6. Der direkte Transport zählt **die tatsächlich vom SDK serialisierten Bilder,
   Texte und das Ausgabeschema** über OpenAIs `responses/input_tokens`. Nur ein
   gültiges Ergebnis bis 24.000 Inputtokens erlaubt die unveränderte Generierung.
   Kein Schätzungsfallback; Fehler/Überschreitung starten keine Generierung.
7. Das Modell erzeugt höchstens 2.000 Tokens. Schema, vorhandene Frame-/Part-IDs
   und Bildregionen werden außerhalb des Modells geprüft. Storyphasen sind Kontext:
   das Fehlen eines späteren Schritts ist kein Defekt des Anfangsbildes.
8. Befunde bleiben Vorschläge. Menschen können sie bestätigen/verwerfen,
   begründen und mit Modell, Policy, Preisversion, Usage und Framebezug exportieren.
   Diese Bewertung führt keine Projektänderung aus und ist keine Releasefreigabe.
   Der Export enthält keine Cookies, CSRF-Tokens, Keys oder Bildpixel.

Kein automatischer Upload, keine Modellautorität über Runtime oder Dateien.
Fachliche URL und History werden nicht durch die Analyse geändert. Bewertungen
liegen bis zum Export im lokalen Panelzustand; persistente Runs folgen in T55.

## Kosten und Abdeckung

0,35 USD und fünf Aufrufe pro Session, 5 USD pro Serverprozess. Direkte OpenAI-
Reservierung: **höchstens 0,07 USD** bei 24.000 Input- und 2.000 Outputtokens.
Das echte Kontextfenster bleibt 1.050.000 Tokens; der Reviewdeckel begrenzt die
Anfrage, er verändert nicht die Modellbeschreibung. Konservative Raten: 2,50 USD
pro Million Inputtokens einschließlich höherer Cache-Schreibpreise und 5 USD pro
Million Outputtokens im Standard-Tier, Preisstand 2. November 2026. Bei Releases
oder Preisänderungen erneut qualifizieren. Gateway reserviert weiterhin den
vollen Kontext zu den höchsten qualifizierten Katalograten.

Usage reduziert die Reservierung nur bei bekannten Zahlen; Timeout, Abbruch oder
fehlende Usage halten die volle Reservierung. Kostenzahlen sind konservative
Schätzungen, keine Anbieterrechnung. Die Autorität ist ein einzelner Prozess.
Neustarts, mehrere Instanzen, dauerhafte Budget-/Usage-Speicherung, Hostauth,
Rechnungsabgleich und ein breiter unabhängiger Evaluationskorpus bleiben offen.

Ausgewählte Standbilder beweisen weder vollständige Bewegung noch Accessibility,
Kontrast aller Effektphasen oder Produktqualität. Der Rehearsal-Run bleibt bei
fehlendem Film-/Pacing-Nachweis ausdrücklich `inconclusive`.

Quellen: [Terra-Modellprofil](https://developers.openai.com/api/docs/models/gpt-6.1-terra),
[exakte Inputzählung](https://developers.openai.com/api/reference/resources/responses/subresources/input_tokens/methods/count),
[AI SDK Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data),
installierte Provider- und Next.js-Dokumentation; [Entscheidungsbewertung](../milestones/openai-review-execution.md).
