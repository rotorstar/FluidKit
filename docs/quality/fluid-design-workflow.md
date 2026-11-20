# Fluid: Design und Rehearsal vor der Übergabe

Normativer Projektprozess ab 2. November 2026, inspiriert von
[Stageshow](../research/stageshow.md). Eigene Übertragung auf die echte
Fluid-Runtime; kein automatisch installierter Fremd-Skill.

## Vor einer neuen oder wesentlich veränderten Oberfläche

1. **Aufgabe und Medium:** Welcher Nutzer soll was erkennen oder erreichen?
   Bedienbare Anwendung, geführte Simulation und Illustration ausdrücklich
   benennen. Zielcontainer, Einbettung und Eingabemethoden festlegen.
2. **Look aus dem Produkt:** Vorhandene Theme-/Typografie-/Abstands-/Radiusrollen
   lesen. Einen Akzent führen lassen; funktionale Statusfarben bleiben zulässig.
   Light-Studio und Dark-GPU-Surface sind bewusste Kontexte derselben Identität.
3. **Geschichte und Informationshierarchie:** Drei bis fünf Beats für eine geführte
   Demo, mit sichtbarem Ergebnis und sinnvoller Lesepause. Primärinhalt, unterstützende
   Information und entbehrliche Wiederholung benennen. Dichte Tabellen dürfen dicht
   sein; keine Daten oder Pflichtinformationen nur für einen ruhigeren Screenshot entfernen.
4. **Referenz und Optionen:** Passendes eigenes Fluid-Beispiel oder geprüftes
   Referenzmuster wählen. Mindestens A, B und Hybrid mit denselben Projektgewichten
   bewerten. Markenidentität, Accessibility und echte Zustandswirkung sind harte Gates.
5. **Komposition vor Bewegung:** Anfang, Ergebnis und kompaktes Layout in tatsächlicher
   Darstellungsgröße prüfen. Was führt den Blick? Was gehört zusammen? Warum gibt es
   diesen Rand, diese Fläche, diesen Titel? Ein Container ist erlaubt, wenn er der
   Aufgabe dient; nicht jede UI braucht einen zusätzlichen Kasten oder einen Crop.
6. **Verursachte Choreografie:** Jeder Beat referenziert ein gültiges Event oder eine
   ausdrücklich reine Präsentationsaktion. Ziel anhand aktueller Part-Geometrie messen.
   Fachstate sofort committen; Lesepausen und Effekte verzögern keine Bedienrückmeldung.
   Abhängige Elemente bewegen sich zusammen, Text wird nicht als Gummi skaliert.
   Nutzerinteraktion unterbricht die Führung; keine stillen Resets produktiver Eingaben.
7. **Rehearsal und Lernen:** Anfang/Ergebnis, tatsächlichen Ablauf, Unterbrechung,
   Pause/Replay, Reduced Motion und gegebenenfalls Loop plus nächsten Anfang prüfen.
   Zeitliche Abdeckung, Pixel, Glyphen, Semantik und Performance getrennt dokumentieren.
   Größten belegten Fehler beheben, betroffene Nachbarn erneut prüfen und wiederkehrende
   Ursachen in Rezept, Vertrag oder gezielter Regression schließen.

## Eine Review beantwortet diese Fragen

| Dimension | Prüffrage | Technischer Bezug |
|---|---|---|
| Produktkontext | Versteht man Zweck und Wirkung ohne technische Erklärung? | Reale beziehungsweise gekennzeichnete Daten, sichtbarer fachlicher Zustand |
| Hierarchie | Erkennt man zuerst Auswahl, Handlung oder Ergebnis? | Rollen für Typografie, Kontrast, Oberfläche und Abstand |
| Dichte | Ist alles zum Entscheiden vorhanden, ohne redundante Signale? | Lange/leere Inhalte, Tabellen, Ladesemantik, sensible Felder |
| Identität | Könnte das Bild unverändert zu irgendeinem anderen Produkt gehören? | Tokenversion, eigene Assets und konsistente Komponentenfamilie |
| Framing | Bleiben Handlung, Ziel und bedeutungstragender Text vollständig sichtbar? | Container, Clip, Overlay-Anker und kompakte Komposition |
| Motion | Hat jede Bewegung eine Ursache und bleibt das Objekt nachvollziehbar? | Event-ID, Revision, Part-ID und ResolvedEffectPlan |
| Bedienung | Funktioniert derselbe Ablauf ohne geführten Cursor? | Pointer, Tastatur, Fokus/IME und getrennte Semantikprüfung |
| Evidenz | Welche Bilder/Frames wurden wirklich aufgenommen und geprüft? | Capturemanifest, Abdeckung und ausdrücklich offene Prüfungen |

Stilbewertungen sind begründete Review-Urteile. Harte Fehler wie fehlende Glyphen,
Datenverlust, falsche Rollen oder unberechtigte Aktionen werden nicht mit einem
hohen ästhetischen Score verrechnet. Eine Regel gegen Redundanz darf insbesondere
keine nötige Accessible Description oder eine kontextuell sinnvolle Bestätigung entfernen.

## Vorschau und Produktion

Eine Illustration darf nicht benötigte Dekoration reduzieren oder unbedeutenden
Kontext beschneiden. Sie trägt ihren Modus und ihre Datenherkunft im Manifest.
Eine funktionale Oberfläche erhält bedienbare Inhalte, Scrollzugang und korrekte
Semantik. Die Semantik darf weder dekorative Balken als echte Werte noch
unsichtbare, abgeschnittene Controls als erreichbar ausgeben.

Der Demo-Poster ist ein vollständig gesetztes Bild mit verständlichem Ergebnis.
Reduced Motion in der Anwendung reduziert die Präsentation; es überspringt keine
Datenprüfung, reale Wartezeit, Guard-Entscheidung oder fachliche Nutzeraktion.

## Nachweisformat der geplanten Rehearsal

`REHEARSAL` bezeichnet einen exportierbaren, versionierten Bericht, keine Behauptung,
dass diese Pipeline bereits implementiert ist. Er enthält Brief/Referenz, Daten- und
Buildbezug, Token-/Font-/Rezeptversionen, Backend-/Geräteprofil, Größen/DPR, geprüfte
Beats/Interaktionen, Frameabdeckung, Befunde/Ausnahmen und manuelle Review.
Kontakttafeln zeigen eine Auswahl; Einzelbildanalyse und Echtzeitverlauf sind
zusätzliche Nachweise. Fehlende Frames sind **inconclusive**.

Offene Runtime-/Studio-Verträge stehen in T50–T58 und im [M6-Vertrag](../milestones/m6-plan.md).

## Ort der Prüfung und AI-Unterstützung

Das Studio ist die zentrale Bedienoberfläche dieses Prozesses. Design, Layout/
Semantik, Motion, Vergleich und AI-Kritik teilen Run-, Frame- und Partreferenzen.
Die ausführbaren Prüfer bleiben aus UI und CI über dieselben Verträge nutzbar.
Eine Stil-Empfehlung, ein messbarer Fehler und eine offene Prüfung sind im Report
unterschiedliche Befundarten.

T58 ergänzt ausdrücklich AI-Analyse: ausgewählte freigegebene und pixelredigierte
Frames plus Brief/Tokenkontext werden strukturiert bewertet. Das Studio zeigt
Quelle, Bildbezug, Begründung und Unsicherheit sowie eine überprüfbare Vorschau
zulässiger Änderungen. Ein Review-Aufruf besitzt eigenen Provider-/Budgetstatus.
Das Modell ist kein Autorisierungs- oder Freigabegate. Der technische Vollscan
und die begrenzte AI-Sichtung behalten getrennte Abdeckungsangaben.
