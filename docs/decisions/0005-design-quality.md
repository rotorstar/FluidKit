# ADR-0005: Designregeln mit DOM- und GPU-Nachweisen verbinden

Datum: 2026-11-01. Status: **angenommen als Qualitätsstrategie**.
M4 integriert den exakt versionierten Prüfer in Entwicklungs-, Check- und Build-
Kommandos sowie QualityReport v1 im Studio. Ein externer CI-Dienst ist nicht
konfiguriert; `npm run quality:gate` ist der reproduzierbare CI-Einstieg.
[Implementierung und Abnahme](../milestones/m4.md).
[Quellen und tatsächliche Befunde](../research/ai-design-check.md).

## Optionen

Gewichte wie im Gesamtplan: Zielerfüllung 30 %, Korrektheit/Accessibility 25 %,
Testbarkeit 20 %, Lieferbarkeit 15 %, Erweiterbarkeit 10 %; Bewertungen 1–5.
Planungswerte, keine gemessene Toolqualität.

| Option | Bewertungen in dieser Reihenfolge | Score |
|---|---|---:|
| A Unveränderten ai-design-check als alleiniges Designgate einsetzen | 3 / 2 / 2 / 4 / 2 | 52 |
| B Nur passende Regeln manuell in die Prüfliste übernehmen | 4 / 4 / 3 / 5 / 3 | 77 |
| H Konfigurierte statische DOM-Prüfung plus eigene Render-/Semantik-/Screenshot-Prüfungen | 5 / 5 / 5 / 4 / 5 | 97 |

**Gewinner H.** Statische Hinweise verhindern wiederkehrende Quellcodeprobleme;
die sichtbare GPU-Oberfläche benötigt ihre eigene Abnahme. Die Nutzungsoberfläche,
Daten-, State- und URL-Verträge ändern sich durch diese Entscheidung nicht.

## Verbindliche Konsequenzen

1. Statische Regeln, DOM-Messung, GPU-Messung, Semantikprüfung und visuelle Review
   bleiben unterscheidbare Nachweisquellen. „Nicht geprüft“ und „nicht unterstützt“
   gelten niemals als bestanden. Befundanzahl ist keine Designnote.
2. Das Studio-Regelprofil verwendet exakt 0.9.0 mit reproduzierbarer Integrität
   und eigener Konfiguration; keine Installation über unversioniertes `npx` im Gate.
   Drei durch Negativkontrollen qualifizierte Regeln blockieren: Schriftgrößen-
   Klassen, entfernte Fokusdarstellung und unbenannte Icon-Buttons. Weitere
   Designregeln bleiben beratend; Profilgrenzen sind begründet.
3. Deutsche Großschreibung, ungestylte Base-UI-Primitives und native Eingabebrücken
   erhalten passende Regelgrenzen. Eigene gestylte Wrapper sollen konsistent sein.
4. Lesbarkeit, Fokus, ausreichend große Ziele, tatsächlicher Kontrast und Reduced
   Motion sind Produktanforderungen. Versalien, Akzentfarben, Radien und Feder-
   Effekte sind kontextabhängige Designentscheidungen und werden geprüft statt
   global verboten. Das bestätigte Erscheinungsbild wird nicht neu generiert.
5. Ausnahmen benötigen Regel, präzisen Scope und Begründung. Keine pauschale
   Count-Baseline: eine neue Verletzung darf keine alte unter gleicher Anzahl
   ersetzen und dadurch unsichtbar werden.
6. Kein fremder Agent-Skill wird automatisch installiert oder als Projektvertrag
   übernommen. Übernommene substanzielle Code-/Textteile behalten MIT-Hinweise.

## Einordnung in bestehende Tasks und Acceptance Criteria

| Bestehender Task | Nächster Schritt | Überprüfbare Abnahme | Status |
|---|---|---|---|
| T43 Konsistenz und Conformance | Regelprofil mit Code-/Sprach-/Renderer-Scope dokumentieren | Jeder Pilotbefund klassifiziert; deutscher Label-Kontrollfall, Base-UI-Styling und native Brücke lösen keine falschen Releaseblocker aus; Fokus-/Font-Positivkontrollen schlagen an | Profil und Gate implementiert; breitere Regel-Conformance offen |
| T19 Testsystem | Versionierten QualityReport aus den getrennten Prüfern ableiten | Enthält Quelle, Regel, Schweregrad, Komponenten-/Part- oder Dateibezug, Build, Backend, Viewport, Phase und Abdeckungsstatus; importiert bestehende Ink-Befunde ohne zweite Layoutwahrheit | QualityReport v1, Studio und Export implementiert |
| T05/T06/T07 | Token-, Kontrast-, Zielgrößen- und Lesbarkeitsprüfung ergänzen | DOM und Scene verwenden dieselben Rollen; sichtbare CSS-Pixel einschließlich Replay-Skalierung werden bewertet; reale Hintergründe/Opacity und getrennte Semantik geprüft | Caption-Rolle DOM/GPU, Schriftgrößen- und Semantikprüfung ergänzt; Kontrast und vollständige Tokens offen |
| T42 Studio mit Base UI | Controls und lokalisierte Anzeigen prüfen | Bewusste native Controls dokumentiert; gemeinsame Styles konsistent; Effektfrequenz verwendet localegerechte Anzeige, technische IDs bleiben unverändert | Native Studio-Controls konsolidiert, explizite Label-Zuordnung und deutsche Zahlen/Ansichtslabels umgesetzt |
| T30 Release-Härtung | Kombinierte Abnahme als Freigabegate führen | Kein grünes Ergebnis allein aus null statischen Befunden; Screenshots, schmale/lange Inhalte, Motion-Phasen und offen gebliebene Prüfungen nachvollziehbar | Lokales Gate implementiert; vollständige Release-/Geräte-/AT-Abnahme offen |

T01–T49 und ihre Abhängigkeiten bleiben erhalten; es entsteht keine neue Wave und
keine automatische Vollständigkeitsbehauptung für bestehende Tasks.
[Qualitätsflow](../flows/design-quality.md), [Prüfliste](../qa/ui-checklist.md).
