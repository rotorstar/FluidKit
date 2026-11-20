# M4: Kombinierte Qualitätsprüfung und konsistente RP1-Fortsetzung

Stand: 2026-11-01. Umsetzung von ADR-0005 innerhalb T19/T43, danach T42 und
ausgewählte Lesbarkeits-/Semantikabnahmen aus T05/T06/T07. Kein Abschluss aller Waves.

## Entscheidung

Gewichte 30/25/20/15/10 wie im Gesamtplan. A: nur CLI (3/3/3/5/3 = **66**),
B: eigenen Design-Linter neu bauen (4/4/4/2/4 = **74**), Hybrid: versionierter
Fremdprüfer plus eigene Render-/DOM-/Semantikadapter (5/5/5/4/5 = **97**).
Gewinner Hybrid; bestehende visuelle Richtung und öffentliche Fach-/URL-Flows gelten.

## Tasks und Acceptance Criteria

1. **T43 – statische Integration:** 0.9.0 exakt als Dev-Abhängigkeit, geprüfte
   Integrität im Lockfile; deutsches/Headless-Profil mit begründeten Grenzen.
   `check:design` erzeugt einen schema-validierten Bericht ohne Count-Baseline.
   Qualifizierte Fehler blockieren, ungeprüfte Designkonventionen bleiben Hinweise.
   Kontrollfälle decken neue Fehler, deutsche Labels und zulässiges Styling ab.
2. **T19 – gemeinsamer Vertrag:** Zod definiert QualityReport und Teilprüfungen.
   Statische Regeln, DOM, GPU, Semantik und Screenshot haben eigene Abdeckung und
   Befunde. Nicht geprüft/unsupported ist nie bestanden. Quelle, Build, Backend,
   Breite, Phase sowie Node-/Dateibezug bleiben exportierbar.
3. **T19/T43 – Studio:** „UI-Qualität“ führt die Laufzeitprüfungen aus und zeigt
   statische Ergebnisse desselben Builds getrennt. Kein Node-Prüfer im Client,
   kein initiales Client-Fetching. Fehler/fehlende Artefakte werden sichtbar.
4. **T42 – anschließende Planfortsetzung:** native Studio-Controls gezielt
   konsolidieren und Frequenz localegerecht formatieren; technische View-IDs
   erhalten eigene lokalisierte Labels. Verhalten, Keyboard und URLs bleiben erhalten.
5. **T05/T06/T07 – belastbare Grenzen:** Laufzeitbefunde zu Textlesbarkeit,
   DOM-Überbreite/Clipping und Namen/Zuständen der Semantik ergänzen. Bei nicht
   belegbarem Kontrast, IME, Screenreader oder Motion wird das offen ausgewiesen.
   Proportional verkleinertes Replay erhält einen Lesbarkeitshinweis statt eines
   uneingeschränkten grünen Ergebnisses.
6. **Abnahme:** unabhängige Negativ-/Regressionstests, strict Check, Build,
   Plan-/Mermaidprüfung; echter Browserlauf in schmaler/breiter Ansicht und beiden
   Backends. Neue Screenshots öffnen, Export prüfen, Browser offen lassen.

## Flows

User: Qualitäts-Tab → Prüfen → Teilbefunde/Abdeckung → JSON exportieren → Ursache
korrigieren → betroffene Szenarien erneut prüfen.

Daten: Build-Quellen → ai-design-check-Profil → validiertes Artefakt → Server-
Component → serialisierte Props; Render-Checkpoint + DOM/Brücke → gemeinsamer Report.

State: Prüfung ruht → läuft → Ergebnis oder Fehler. Revision, Backend, Surface-
Lebenszyklus oder Resize machen einen älteren Laufzeitbericht ungültig.

URL: unveränderte Case-/Ansichts-/Sortier-/Auswahl-URLs; Qualitätsprüfung selbst
erzeugt weder fachlichen Commit noch History-Eintrag.
