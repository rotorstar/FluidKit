# M6 — Ausführung, 2. November 2026

Der nächste vertikale Schnitt verbindet eine isolierte Workspace-Story mit einer
Studio-Werkstatt und einer optionalen AI-Review. Die verbleibenden AC des Gesamtplans
bleiben offen, solange ihre jeweiligen Nachweise fehlen.

Verbindliche Technologieentscheidung: AI-Funktionen verwenden **Vercel AI SDK**.
`ai@7.0.159` ist am Recherchedatum stabil und mit Node >=22 sowie dem installierten
Zod 4.6.7 kompatibel. Für die Review wird `generateText` mit `Output.object` benutzt.
Der aktuelle lokale Adapter verwendet auf ausdrücklichen Nutzerwunsch OpenAI direkt
über `@ai-sdk/openai@4.0.106`. Das qualifizierte Terra-Profil und die exakte
Inputprüfung sind in der [bewerteten Ergänzung](openai-review-execution.md) und dem
[aktuellen Betriebsvertrag](../quality/ai-review.md) dokumentiert. Gateway bleibt
optional. Es gibt keine Browser-Keys. Der erste reale Aufruf ist im
Live-Export (internes Archiv) nachgewiesen.

Quellen: [Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data),
[OpenAI-Modellprofil](https://developers.openai.com/api/docs/models/gpt-6.1-terra),
[Inputzählung](https://developers.openai.com/api/docs/guides/token-counting), installierte SDK-Dokumentation.

## Ausführungsumfang und überprüfbare Abnahme

1. Story-Vertrag und Runner: fünf echte Beats, aktuelle Parts/Events prüfen,
   Guards respektieren, Revision und erwartete Felder vergleichen. Nutzerübernahme,
   Abbruch und Unmount stoppen weitere Events. Kein zweiter fachlicher State.
2. GPU-Aufnahme: Pixel unmittelbar dem gerenderten Frame zuordnen; Frame, Backend,
   Größe, Part-IDs, Snapshot und Build erfassen. Sensitive Parts verweigern die
   Aufnahme. Einzelbilder ausdrücklich als Stichprobe ausweisen; fehlender
   Vollscan und Echtzeitnachweis dürfen dadurch nicht bestanden sein.
3. Studio: fünf zugängliche Prüfansichten, echte Story-Steuerung, Vorschau,
   lokale Messung und ausgewählte Bilder; Baseline/Kandidat vergleichen ohne
   fachliche Navigation. Kein automatisches Hochladen.
4. AI: serverseitiger SDK-Adapter mit Schema und unabhängiger Referenzprüfung,
   expliziter Bildfreigabe, Same-Origin-/Sessionprüfung, begrenztem Body,
   Request-/Sessionlimits, Deadline, Abort und nachvollziehbarer Reservierung.
   Unbekannte Frame-/Partreferenzen und ungültige Antworten werden abgewiesen.
   Keine Modellautorität über Runtime, Dateien oder harte Qualitätsgates.
5. Nachweise: negative SDK-Tests ohne Netz/Secrets, echte Browserprüfung der
   Story und GPU-Aufnahmen, responsive Prüfung, Bericht und aktualisierte Matrix.
   Ein nicht konfigurierter Provider bleibt offen; ein SDK-Test ist kein Live-Test.

Budget und Sessionpersistenz werden für diesen lokalen Einprozess-Studio-Schnitt
qualifiziert. Verteilte, dauerhafte Budgetautorität und breite unabhängige Live-Modellevaluation
bleiben eigenständige offene T27-/T58-Produktionsgates.
