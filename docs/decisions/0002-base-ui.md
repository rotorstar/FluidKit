# ADR-0002: Base UI im Studio, eigene Behavior-Verträge in der GPU-Runtime

Datum: 2026-11-01. Status: beschlossen und im M1-Proof umgesetzt.

## Entscheidung

- `@base-ui/react@1.9.0` ist ausschließlich eine Studio-Abhängigkeit.
- Jeder GPU-Part benennt Component-ID, Part und Behavior unabhängig vom Renderrezept.
- Der Core besitzt Fachzustand und kontrollierte Werte. Ein separater Store besitzt
  Fokus/Hover/Pressed/Composition. Renderer besitzen ihre Animationen und Ressourcen.
- Gründe und Cancel werden vor fachlichen Commits verarbeitet. Guards und Rechte
  bleiben maßgeblich. KI darf keine neue Autorität durch UI-Callbacks erhalten.
- M1 zeigt die Anatomy und die getrennten Zustände. Erst danach wächst die Bibliothek.

Alternativen: eigene DOM-Widgets beibehalten; Base UI vollständig in die GPU-Runtime
einbauen; Hybrid. [Reproduzierbare Bewertungen](base-ui-scores.json).

## Konsistenzprüfung vor Codeänderung

| Vorheriger Widerspruch | Auflösung |
|---|---|
| Globaler State enthält jeden Fokuswechsel | Domain- und Interaktionsrevision trennen |
| `kind` bestimmt Form und implizit ARIA | Explizites Behavior pro Part |
| Studio-Tabs sind normale Buttons ohne Tab-Vertrag | Echte Base-UI-Tabs |
| Anatomy ist nur ein zukünftiges Diagramm | Schema + Inspector im ersten Milestone |
| Transition-Dauer im Schema, 420 ms hart im Renderer | Dauer aus dem letzten fachlichen Übergang verwenden |
| Base UI headless wird als rendererunabhängig verstanden | DOM-Verträge nur im Studio direkt verwenden |
| TypeScript 7 steht im Plan, Parser unterstützt <6.1 | Geprüftes TypeScript 6.0.3 fixieren |
| Vollständige Roadmap vor erster visueller Beurteilung | M1 zuerst zeigen und Feedback abwarten |

Die unabhängigen späteren Release-Pakete bleiben erhalten. M1 bedeutet weder
WCAG-Konformität des Frameworks noch bestandene Node-26-/Mobile-/XR-Gates.
