# ADR-0006: Gestaltungsdisziplin und zeitliche Prüfung für die Fluid-Runtime

Datum: **2. November 2026**. Status: **als Planungs- und Qualitätsstrategie angenommen**.
Umsetzung der neuen Verträge T50–T58 ist geplant. Es wird keine fertige
Rehearsal-Engine, Kamera oder Qualitätsverbesserung behauptet.
[Research](../research/stageshow.md) · [Arbeitsprozess](../quality/fluid-design-workflow.md).

## Problem

M5 belegt nutzbare Datenansichten und ausgewählte Text-/Motion-/Lifecycle-Prüfungen.
Es fehlen ein gemeinsamer Design-Brief, vollständige Theme-Rollen, kausale
Storyboards, Messung jeder erfassten Transition-Phase und ein kontrollierter
Vergleich der Gesamtkomposition. Einzelne saubere Screenshots lösen diese Lücken nicht.

## Optionen

Gewichte 30/25/20/15/10, Skala 1–5. Scores sind Planungsurteile, keine gemessene
Produktqualität. Ratings und Rechnung stehen in [stageshow-scores.json](stageshow-scores.json).

| Entscheidung | A | B | Hybrid H2 | Hybrid H / Gewinner |
|---|---|---|---|---|
| STAGESHOW | Kit unverändert als UI-Renderer 57, ausgeschlossen | nur Gestaltungsregeln dokumentieren 77 | separates DOM-Demo-Kit neben Fluid 77 | **H: Design-Brief, echte Runtime und GPU-taugliche Rehearsal 97** |

A verletzt die sichtbare Rendering-Grenze des Frameworks. Ein optionales DOM-
Marketingbild wäre als Illustration denkbar, dient aber keinem GPU-/Funktionsnachweis.
H2 erzeugt zusätzliche Pflege und könnte den eigentlichen Fluid-Showcase vom Produkt
entfernen. H übernimmt die nachweislich beschriebenen Methoden und übersetzt sie
auf unsere bestehenden Zustands- und Renderergrenzen.

## Entscheidung

1. Der [siebenstufige Fluid-Prozess](../quality/fluid-design-workflow.md) wird Teil
   der UI-Abnahme. Komposition wird vor Effektdichte bewertet. Die bestätigte
   Produktidentität bleibt Ausgangspunkt.
2. `StoryDefinition`, `ThemeDefinition`, `RehearsalManifest` und die späteren
   Präsentations-/Frameverträge sind rendererneutral und schema-versioniert geplant.
   Sie referenzieren `FlowDefinition`, `ScenarioDefinition` und `ResolvedEffectPlan`.
   Fachliche Werte werden nicht im Storyboard dupliziert.
3. Story, Flow und visuelle Transition sind verschiedene Ebenen. Ein Beat hat ein
   Ziel und eine Ursache. Eine abgewiesene Aktion kann keine Erfolgsszene erzeugen.
   Die Basissequenz Quelle → optionaler Zusatzeffekt → Ziel bleibt erhalten.
4. Studio bleibt DOM mit Base UI; sichtbare Framework-Komponenten bleiben
   WebGPU-first mit dem freigegebenen, sichtbaren Three-WebGL2-Fallback. Keine neue
   parallele Renderloop und keine Stageshow-DOM-Primitives in der Surface.
5. Die Rehearsal ergänzt ai-design-check, Ink-Messung, Semantik und bestehende Tests.
   DOM-Boxen beweisen keine GPU-Textqualität. Kontaktübersichten beweisen keine
   Einzelbild-Sprungfreiheit. Unvollständige Messungen werden nicht grün.
6. Layout-/Glyph-/Clip-/Opacity-/Cursorwerte stammen aus der dargestellten Scene;
   Pixel- und Echtzeitmessung ergänzen sie. Capture-Synchronisation und Performance-
   Profiling sind unterschiedliche Betriebsarten.
7. Fokus, aktive Eingabe, Rechte, Datenwahrheit und Reduced Motion sind harte Gates.
   Illustrationsregeln wie Texte reduzieren, stark croppen oder versteckt zurücksetzen
   gelten nicht pauschal für produktive UI.
8. Eigene Fluid-Referenzen und ein kontrollierter Vergleich qualifizieren den Nutzen.
   Wiederkehrende Fehler werden im kleinsten zuständigen Vertrag/Rezept mit einer
   gezielten Regression geschlossen. Kein automatisches globales Umschreiben von
   Agent-Anweisungen, keine automatische Modell-/Policy-Promotion.
9. Es wird kein fremder Skill installiert. Spätere Codeübernahmen prüfen MIT-Hinweise
   und Dritt-Assets separat. Der aktuelle Auftrag übernimmt Methoden und eigene
   Planungsartefakte, keine fremde Runtime.

## Lieferfolge

M6 ist der nächste begrenzte **visuelle** Milestone auf realen Workspace-Daten,
vor weiterer Komponentenbreite. Er ergänzt die M5-Grundlagenarbeit; verbleibende
RP1-, Persistenz-, KI-, Provider-, AT-/Hardware- und spätere Releasegates behalten
ihren Status. Nur der minimale vertikale Story-/Theme-/Capture-Schnitt wird
vorgezogen; der vollständige Studio-Editor benötigt weiterhin T16–T18.

Details, Abhängigkeiten und überprüfbare AC: [M6-Plan](../milestones/m6-plan.md)
und T50–T58 im [Gesamtplan](../implementation-plan.md).

## Verbindliche Nutzerpräzisierung: Studio mit AI-Kritik

Der Qualitätsbereich ist ein Studio-Feature und erhält dieselben Prüfer für CI.
T55 deckt Design/Layout, Motion, Semantik, Vergleich und Befundnavigation ab.
T58 ist ein eigener Task für AI-Analyse mit begrenztem Review-Bundle, strukturierten
belegten Befunden, Datenfreigabe/Pixelredaktion, eigenem Kosten-/Providerstatus und
überprüfbaren Änderungen. AI-Empfehlungen und harte Prüfer behalten getrennte
Ergebnis- und Abdeckungsstatus. Eine optionale AI-Nutzung ist kein Modellaufruf der
Manual-Anwendungsruntime und verleiht keine Rechte auf deren Fachzustand.
