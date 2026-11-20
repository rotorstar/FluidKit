# Abgleichsmatrix aller Acceptance Criteria

Stand: 2026-11-20. 518 Kriterien aus dem kanonischen Plan, M1–M9, M11, R1–R6, UI-Prüfliste und Anbieter-/Simulationsvertrag.

**Gesamtplan vollständig erfüllt: Nein.** Ein Proof und ein bestandener Teilcheck sind keine vollständige Produktabnahme. Statuswerte beziehen sich auf den ausdrücklich angegebenen Scope; übergreifende Gates bleiben zusätzlich maßgeblich.

- Nachgewiesen im Scope: 6
- Implementiert, Nachweis offen: 0
- Teilweise: 387
- Offen: 123
- Externer Nachweis nötig: 2

[Maschinenlesbares Register](acceptance/ledger.json) · [Grundlagenplan](milestones/m5-plan.md) · [M6-Rehearsalvertrag](milestones/m6-plan.md) · [M7-Effektvertrag](milestones/m7-plan.md) · [M8-Komponentenvertrag](milestones/m8-plan.md) · [M9-Ansichten und Farbwelten](milestones/m9-plan.md) · [M11-Sprachprofile](milestones/m11-multilingual-plan.md) · [R1–R6](milestones/structural-transitions.md)

## Task-Überblick

Die Zahlen bezeichnen einzelne Kriterien im dokumentierten Scope, keinen pauschalen Fertigstellungsgrad.

| Task | Im Scope belegt | Teilweise | Offen / unverifiziert / extern |
|---|---:|---:|---:|
| [T01](#t01) | 0/1 | 1 | 0 |
| [T02](#t02) | 0/3 | 3 | 0 |
| [T03](#t03) | 0/3 | 3 | 0 |
| [T04](#t04) | 0/4 | 4 | 0 |
| [T05](#t05) | 0/2 | 2 | 0 |
| [T06](#t06) | 0/3 | 3 | 0 |
| [T07](#t07) | 0/3 | 3 | 0 |
| [T08](#t08) | 0/3 | 3 | 0 |
| [T09](#t09) | 0/5 | 5 | 0 |
| [T10](#t10) | 0/3 | 3 | 0 |
| [T11](#t11) | 0/4 | 4 | 0 |
| [T12](#t12) | 0/3 | 3 | 0 |
| [T13](#t13) | 0/1 | 1 | 0 |
| [T14](#t14) | 0/3 | 3 | 0 |
| [T15](#t15) | 0/2 | 2 | 0 |
| [T16](#t16) | 0/6 | 6 | 0 |
| [T17](#t17) | 0/4 | 4 | 0 |
| [T18](#t18) | 0/4 | 4 | 0 |
| [T19](#t19) | 0/4 | 3 | 1 |
| [T20](#t20) | 0/3 | 3 | 0 |
| [T21](#t21) | 0/3 | 0 | 3 |
| [T22](#t22) | 0/3 | 1 | 2 |
| [T23](#t23) | 0/4 | 0 | 4 |
| [T24](#t24) | 0/3 | 0 | 3 |
| [T25](#t25) | 0/1 | 1 | 0 |
| [T26](#t26) | 0/3 | 3 | 0 |
| [T27](#t27) | 0/3 | 3 | 0 |
| [T28](#t28) | 0/4 | 0 | 4 |
| [T29](#t29) | 0/4 | 4 | 0 |
| [T30](#t30) | 0/4 | 4 | 0 |
| [T31](#t31) | 0/3 | 0 | 3 |
| [T32](#t32) | 0/4 | 1 | 3 |
| [T33](#t33) | 0/4 | 0 | 4 |
| [T34](#t34) | 0/3 | 0 | 3 |
| [T35](#t35) | 0/4 | 0 | 4 |
| [T36](#t36) | 0/3 | 0 | 3 |
| [T37](#t37) | 0/4 | 0 | 4 |
| [T38](#t38) | 0/3 | 3 | 0 |
| [T39](#t39) | 0/5 | 5 | 0 |
| [T40](#t40) | 0/4 | 4 | 0 |
| [T41](#t41) | 0/4 | 4 | 0 |
| [T42](#t42) | 0/4 | 4 | 0 |
| [T43](#t43) | 0/5 | 5 | 0 |
| [T44](#t44) | 0/6 | 6 | 0 |
| [T45](#t45) | 0/6 | 6 | 0 |
| [T46](#t46) | 0/4 | 4 | 0 |
| [T47](#t47) | 0/7 | 7 | 0 |
| [T48](#t48) | 0/7 | 7 | 0 |
| [T49](#t49) | 0/9 | 9 | 0 |
| [T50](#t50) | 0/5 | 5 | 0 |
| [T51](#t51) | 0/5 | 4 | 1 |
| [T52](#t52) | 0/5 | 5 | 0 |
| [T53](#t53) | 0/5 | 3 | 2 |
| [T54](#t54) | 0/6 | 5 | 1 |
| [T55](#t55) | 0/5 | 5 | 0 |
| [T56](#t56) | 0/5 | 0 | 5 |
| [T57](#t57) | 0/5 | 4 | 1 |
| [T58](#t58) | 0/5 | 5 | 0 |
| [T59](#t59) | 0/5 | 5 | 0 |
| [T60](#t60) | 0/6 | 6 | 0 |
| [T61](#t61) | 0/6 | 6 | 0 |
| [T62](#t62) | 0/5 | 5 | 0 |
| [T63](#t63) | 0/7 | 7 | 0 |
| [T64](#t64) | 0/6 | 6 | 0 |
| [T65](#t65) | 0/8 | 8 | 0 |
| [T66](#t66) | 0/5 | 5 | 0 |
| [T67](#t67) | 0/5 | 5 | 0 |
| [T68](#t68) | 0/5 | 5 | 0 |
| [T69](#t69) | 0/6 | 6 | 0 |

## T01

Nachgewiesen im Scope: 0/1.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T01-AC01 | Jede Vision besitzt Status, Entscheidung, Task und Abnahme. Leistungsbehauptungen sind als gemessen, Ziel oder Hypothese markiert | Teilweise · Vollständiger Planumfang | — | laufende Release-Evidenz |

## T02

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T02-AC01 | Reproduzierbarer Clean Install | Teilweise · Vollständiger Planumfang | — | Clean Install/Publishing und Node-26-Gate |
| T02-AC02 | strict Typecheck, ESLint CLI und Paketbuilds funktionieren | Teilweise · Aktueller npm-Workspace mit Node 24.18.1, strict Typecheck/ESLint und Paket-/Next-Build; kein Node-26-/Clean-Install-Gate. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T02-AC03 | keine Peer-Overrides oder produktiven `any`-Ausnahmen ohne Begründung | Teilweise · Aktueller npm-Workspace mit Node 24.18.1, strict Typecheck/ESLint und Paket-/Next-Build; kein Node-26-/Clean-Install-Gate. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T03

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T03-AC01 | WebGPU als Standard und tatsächliches Backend nachgewiesen | Teilweise · Vollständiger Planumfang | — | IME/Screenreader/Supportmatrix |
| T03-AC02 | IME/Fokus funktionieren auf der Zielmatrix | Teilweise · Vollständiger Planumfang | — | IME/Screenreader/Supportmatrix |
| T03-AC03 | Mount/Unmount und Device Loss sind geprüft. Keine Freigabe allein anhand eines Screenshots | Teilweise · Vollständiger Planumfang | — | IME/Screenreader/Supportmatrix |

## T39

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T39-AC01 | Part-IDs eindeutig | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/base-ui-contracts.test.ts](../tests/unit/base-ui-contracts.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T39-AC02 | Button braucht Aktion | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/base-ui-contracts.test.ts](../tests/unit/base-ui-contracts.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T39-AC03 | Textbox braucht Textfeld | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/base-ui-contracts.test.ts](../tests/unit/base-ui-contracts.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T39-AC04 | kein Rollenableiten aus visueller Form | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/base-ui-contracts.test.ts](../tests/unit/base-ui-contracts.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T39-AC05 | alle Proof-Parts im Inspector | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/base-ui-contracts.test.ts](../tests/unit/base-ui-contracts.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T40

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T40-AC01 | Fokus/Hover ändern Domain-Revision nicht | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/base-ui-contracts.test.ts](../tests/unit/base-ui-contracts.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T40-AC02 | kontrollierte Werte bleiben erhalten | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/base-ui-contracts.test.ts](../tests/unit/base-ui-contracts.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T40-AC03 | Cancel verhindert Commit und Seiteneffekte | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/base-ui-contracts.test.ts](../tests/unit/base-ui-contracts.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T40-AC04 | Gründe sind im Trace | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/base-ui-contracts.test.ts](../tests/unit/base-ui-contracts.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T41

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T41-AC01 | Dauer kommt aus dem Transition-Vertrag | Teilweise · Vollständiger Planumfang | — | komplexe Popup-Presence und vollständige GPU-Tests |
| T41-AC02 | Unterbrechung startet vom aktuellen Bild | Teilweise · Vollständiger Planumfang | — | komplexe Popup-Presence und vollständige GPU-Tests |
| T41-AC03 | reduzierte Bewegung sofort | Teilweise · Vollständiger Planumfang | — | komplexe Popup-Presence und vollständige GPU-Tests |
| T41-AC04 | kein aktivierbarer veralteter Part | Teilweise · Vollständiger Planumfang | — | komplexe Popup-Presence und vollständige GPU-Tests |

## T42

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T42-AC01 | Tabs per Pfeiltasten | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [document: docs/milestones/m1.md](milestones/m1.md) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T42-AC02 | Dialog mit Label, Escape und Fokusrückgabe | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [document: docs/milestones/m1.md](milestones/m1.md) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T42-AC03 | Vorschau rendert mit GPU | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [document: docs/milestones/m1.md](milestones/m1.md) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T42-AC04 | aktives Backend ist sichtbar | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [document: docs/milestones/m1.md](milestones/m1.md) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T43

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T43-AC01 | Plan enthält alle Tasks | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/acceptance/m8-adoption-2026-11-13.json](acceptance/m8-adoption-2026-11-13.json) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T43-AC02 | Quellen/Versionen belegt | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/acceptance/m8-adoption-2026-11-13.json](acceptance/m8-adoption-2026-11-13.json) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T43-AC03 | keine Base-UI-Abhängigkeit im Core | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/acceptance/m8-adoption-2026-11-13.json](acceptance/m8-adoption-2026-11-13.json) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T43-AC04 | M1 live demonstriert | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/acceptance/m8-adoption-2026-11-13.json](acceptance/m8-adoption-2026-11-13.json) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T43-AC05 | nicht geprüfte Kriterien bleiben offen | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/acceptance/m8-adoption-2026-11-13.json](acceptance/m8-adoption-2026-11-13.json) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T44

Nachgewiesen im Scope: 0/6.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T44-AC01 | echte Daten | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/workspace.test.ts](../tests/unit/workspace.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T44-AC02 | stabile IDs | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/workspace.test.ts](../tests/unit/workspace.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T44-AC03 | numerische Sortierung und aria-sort | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/workspace.test.ts](../tests/unit/workspace.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T44-AC04 | Filter-/Auswahlerhalt | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/workspace.test.ts](../tests/unit/workspace.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T44-AC05 | validierte URL-/History-Flows | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/workspace.test.ts](../tests/unit/workspace.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T44-AC06 | Screenshot-Nachweis | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/workspace.test.ts](../tests/unit/workspace.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T45

Nachgewiesen im Scope: 0/6.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T45-AC01 | atomare Feldzuweisung | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/base-ui-contracts.test.ts](../tests/unit/base-ui-contracts.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T45-AC02 | validierte Projektionen | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/base-ui-contracts.test.ts](../tests/unit/base-ui-contracts.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T45-AC03 | unterbrechbare Präsentation | Teilweise · Vollständiger Planumfang | — | übrige vollständige RP1-Gates |
| T45-AC04 | kein aktiver Exit-Part | Teilweise · Vollständiger Planumfang | — | übrige vollständige RP1-Gates |
| T45-AC05 | GPU-Retry mit erhaltenem Snapshot | Teilweise · Vollständiger Planumfang | — | übrige vollständige RP1-Gates |
| T45-AC06 | unabhängige Tests | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/base-ui-contracts.test.ts](../tests/unit/base-ui-contracts.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T46

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T46-AC01 | Default bevorzugt WebGPU | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/backend-policy.test.ts](../tests/unit/backend-policy.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T46-AC02 | WebGL2-Diagnose separat | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/backend-policy.test.ts](../tests/unit/backend-policy.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T46-AC03 | Badge aus tatsächlich initialisiertem Backend | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/backend-policy.test.ts](../tests/unit/backend-policy.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T46-AC04 | fehlgeschlagene Qualifikation wird nicht als Erfolg angezeigt | Teilweise · Vollständiger Planumfang | — | automatischen Fallback auf weiteren Geräten qualifizieren |

## T47

Nachgewiesen im Scope: 0/7.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T47-AC01 | kompatible Pins | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T47-AC02 | isolierter Build | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T47-AC03 | unabhängige CPU/GPU-Invarianten | Teilweise · Vollständiger Planumfang | — | breite Hardware-/Treiber-/Lifecycle-Matrix und vergleichende Performance-/Speichermessung |
| T47-AC04 | Three/Glyph-/WebGL2-Prüfung | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T47-AC05 | ein Device und Scheduler | Teilweise · Vollständiger Planumfang | — | breite Hardware-/Treiber-/Lifecycle-Matrix und vergleichende Performance-/Speichermessung |
| T47-AC06 | dokumentierte Ressourcenfreigabe | Teilweise · Vollständiger Planumfang | — | breite Hardware-/Treiber-/Lifecycle-Matrix und vergleichende Performance-/Speichermessung |
| T47-AC07 | Nutzenvergleich | Teilweise · Vollständiger Planumfang | — | breite Hardware-/Treiber-/Lifecycle-Matrix und vergleichende Performance-/Speichermessung |

## T48

Nachgewiesen im Scope: 0/7.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T48-AC01 | fixed/random/case/aus | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T48-AC02 | explizite Priorität | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T48-AC03 | kompatible Pools | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T48-AC04 | Seed und Rezeptversion im Run | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T48-AC05 | Replay würfelt nicht neu | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T48-AC06 | Fokus/Inhalt/Actions unverändert | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T48-AC07 | Abbruch und Reduced Motion geprüft | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T49

Nachgewiesen im Scope: 0/9.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T49-AC01 | visuelle Preset-Vorschauen | Teilweise · Vollständiger Planumfang | — | grafisches Transition-Regel-Authoring, gespeicherte Projektkonfiguration und automatisierter Run-Vergleich |
| T49-AC02 | Intensität/Dauer/Parameter | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T49-AC03 | Projekt-/Case-/Transition-Zuordnung | Teilweise · Vollständiger Planumfang | — | grafisches Transition-Regel-Authoring, gespeicherte Projektkonfiguration und automatisierter Run-Vergleich |
| T49-AC04 | Seed-/Random-Steuerung | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T49-AC05 | Quelle/Zusatz/Ziel scrubben | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T49-AC06 | Vergleich und Szenarioexport | Teilweise · Vollständiger Planumfang | — | grafisches Transition-Regel-Authoring, gespeicherte Projektkonfiguration und automatisierter Run-Vergleich |
| T49-AC07 | gleiche Runtime wie Host | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T49-AC08 | GPU-Effektleiste im Showcase synchron zum Studio | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T49-AC09 | Policyänderung startet laufende Animation nicht neu | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/effects.test.ts](../tests/unit/effects.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T50

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T50-AC01 | Versionierter Brief benennt Nutzerziel, Medium, Modus, Datenherkunft und drei bis fünf Beats | Teilweise · M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T50-AC02 | jeder Beat referenziert gültige Flow-/Szenarioziele und erwartete Invarianten | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Allgemeine Szenarioreferenzen, kompletter Preflight, Illustration und Poster-Authoring vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T50-AC03 | Illustration, Simulation und bedienbare Runtime sind unterscheidbar | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Allgemeine Szenarioreferenzen, kompletter Preflight, Illustration und Poster-Authoring vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T50-AC04 | Anfang und Ergebnis besitzen einen verständlichen Poster ohne zweiten Fachstate | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Allgemeine Szenarioreferenzen, kompletter Preflight, Illustration und Poster-Authoring vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T50-AC05 | fehlende Referenzen und unbelegte Erfolgszustände werden vor dem Lauf abgewiesen | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Allgemeine Szenarioreferenzen, kompletter Preflight, Illustration und Poster-Authoring vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T51

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T51-AC01 | Farbe, Typografie, Abstand, Radien und Motion besitzen eine kanonische versionierte Quelle | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Tokenmigration, benannter Importteilumfang, Assetversionierung und Kontrastqualifikation ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T51-AC02 | CSS und GPU-Werte werden einschließlich Einheiten und Farbraum daraus abgeleitet | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Tokenmigration, benannter Importteilumfang, Assetversionierung und Kontrastqualifikation ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T51-AC03 | verwendete Looks, Fonts und Assets werden am tatsächlich dargestellten Ergebnis qualifiziert | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Tokenmigration, benannter Importteilumfang, Assetversionierung und Kontrastqualifikation ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T51-AC04 | unterstützte Importtypen und Aliasse sind benannt und ungültige oder zyklische Referenzen scheitern sichtbar | Offen · Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme. | — | Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test. |
| T51-AC05 | Fremd-Defaults unterschreiten keine Produktregeln für Lesbarkeit, Ziele und Kontrast | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Tokenmigration, benannter Importteilumfang, Assetversionierung und Kontrastqualifikation ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T52

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T52-AC01 | Ein gezeigter Klick führt den im Ziel deklarierten gültigen Eventvertrag aus und ein Guardfehler erzeugt keinen visuellen Erfolg | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Effektplan-/Framebezug und Cursor/Anker sowie Reduced-Motion-/Retargeting-/Supportmatrix qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T52-AC02 | Event, Beat, Revision und aufgelöster Effekt bleiben korrelierbar | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Effektplan-/Framebezug und Cursor/Anker sowie Reduced-Motion-/Retargeting-/Supportmatrix qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T52-AC03 | Cursor, Auswahl und Anker folgen gemessenen dargestellten Parts statt festen Bildschirmkoordinaten | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Effektplan-/Framebezug und Cursor/Anker sowie Reduced-Motion-/Retargeting-/Supportmatrix qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T52-AC04 | Unterbrechungen retargeten vom aktuellen Bild und Lesepausen verzögern keinen Fachcommit | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Effektplan-/Framebezug und Cursor/Anker sowie Reduced-Motion-/Retargeting-/Supportmatrix qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T52-AC05 | Nutzerübernahme, Reduced Motion, Pause, offscreen und Disposal sind ohne zweite Renderloop geprüft | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Effektplan-/Framebezug und Cursor/Anker sowie Reduced-Motion-/Retargeting-/Supportmatrix qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T53

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T53-AC01 | Anfang und Ergebnis sind im realen Host sowie in eigenständiger kompakter Komposition lesbar | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Gemeinsame PresentationProjection mit Clip/Inverse, Kamera und vollständiger Eingabe-/Scroll-/DPR-Matrix umsetzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T53-AC02 | operative Controls, Fokus und Pflichtinhalte bleiben vollständig erreichbar | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Gemeinsame PresentationProjection mit Clip/Inverse, Kamera und vollständiger Eingabe-/Scroll-/DPR-Matrix umsetzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T53-AC03 | Layout, Clip, Pointer-Hit-Testing und Semantik verwenden dieselbe qualifizierte Transformation und Inverse | Offen · Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme. | — | Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test. |
| T53-AC04 | optionale Kamera und illustrative Crops ändern weder Fachstate noch URL oder Datenwahrheit | Offen · Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme. | — | Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test. |
| T53-AC05 | Reduced-Motion-Poster und Interaktion nach Resize, Scroll und Retargeting sind getrennt geprüft | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Gemeinsame PresentationProjection mit Clip/Inverse, Kamera und vollständiger Eingabe-/Scroll-/DPR-Matrix umsetzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T54

Nachgewiesen im Scope: 0/6.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T54-AC01 | Jeder erfasste Frame besitzt Run-, Zeit-, Build-, Daten-, Token-, Asset-, Backend-, Viewport-, Event- und Rezeptbezug | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Kontinuierlichen Vollscan mit vollständigem Manifest, Bild-/GPU-Zuordnung, Lücken-, Sprung-, Drift- und Loopanalyse sowie natives Pacing implementieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T54-AC02 | GPU-Arbeitsabschluss und tatsächliche Bildaufnahme werden getrennt bestätigt und der dargestellten Scene zugeordnet | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Kontinuierlichen Vollscan mit vollständigem Manifest, Bild-/GPU-Zuordnung, Lücken-, Sprung-, Drift- und Loopanalyse sowie natives Pacing implementieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T54-AC03 | fehlende, verspätete oder nicht zuordenbare Frames und Geräteverlust ergeben inconclusive statt bestanden | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Kontinuierlichen Vollscan mit vollständigem Manifest, Bild-/GPU-Zuordnung, Lücken-, Sprung-, Drift- und Loopanalyse sowie natives Pacing implementieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T54-AC04 | alle erfassten Frames einschließlich Ein-/Ausstieg, Retargeting und optional Loop plus nächstem Anfang werden ursachenbezogen auf Sprung, Drift und Textfehler geprüft | Offen · Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme. | — | Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test. |
| T54-AC05 | deterministische Regression, Echtzeit-Pacing, Kontaktübersicht und manuelle Bildreview sind getrennte Nachweise und bekannte Negativkontrollen schlagen an | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Kontinuierlichen Vollscan mit vollständigem Manifest, Bild-/GPU-Zuordnung, Lücken-, Sprung-, Drift- und Loopanalyse sowie natives Pacing implementieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| R5-AC01 | Capture bindet Bild und Geometrie an denselben Lauf, Modus und Zeitpunkt. Replay sowie zwischenzeitliche Änderungen werden bei Live-Nachweisen abgewiesen. AC-Nachweise sind nach ID auffindbar und ihr Download prüft den Inhaltshash. | Teilweise · Live-Aufnahme mit Originalpixeln und gebundener Geometrie, Ablehnung bei Replay oder Wechsel der Revision sowie nach AC-ID gebundener Download im lokalen Studio. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T55

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T55-AC01 | Studio zeigt Design-, Layout-/Semantik-, Motion-, Vergleichs- und AI-Reviewbereiche mit getrennten Befundarten und Abdeckungsstatus | Teilweise · M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json) | Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T55-AC02 | jeder belegte Befund navigiert zu gültigem Run, Frame und Part ohne Fachstateänderung | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json) | Persistente unveränderliche Runs, Run-/Frame-/Part-URLs, Partnavigation, Authoring und vollständige CI-Rehearsal ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T55-AC03 | Story, Timeline, Scriptansicht und Showcase verwenden denselben versionierten Vertrag und importieren keinen beliebigen Code | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json) | Persistente unveränderliche Runs, Run-/Frame-/Part-URLs, Partnavigation, Authoring und vollständige CI-Rehearsal ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T55-AC04 | Baseline und Kandidat sowie gespeicherte Artefakte sind unveränderlich versioniert und UI und CI nutzen dieselben Prüfer | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json) | Persistente unveränderliche Runs, Run-/Frame-/Part-URLs, Partnavigation, Authoring und vollständige CI-Rehearsal ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T55-AC05 | Reviewansichten sind zugänglich bedienbar und ihre validierten URLs enthalten nur Navigationsreferenzen mit definierten Not-found-Zuständen | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json) | Persistente unveränderliche Runs, Run-/Frame-/Part-URLs, Partnavigation, Authoring und vollständige CI-Rehearsal ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T56

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T56-AC01 | Eigene Referenzfälle decken Tabelle, Karte/Detail und mindestens einen datenabhängigen Workflow mit Daten- und Assetherkunft ab | Offen · Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme. | — | Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test. |
| T56-AC02 | Baseline und Kandidat verwenden denselben Brief, Datensatz, Seed, Viewport, Font- und Geräte-/Backendstand mit randomisierter Bewertungsreihenfolge und wiederholten Runs | Offen · Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme. | — | Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test. |
| T56-AC03 | Daten-/Rechte-/Accessibility- und Rendererfehler bleiben harte Gates unabhängig vom Stilscore | Offen · Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme. | — | Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test. |
| T56-AC04 | Hierarchie, Dichte, Identität, Framing und Motion werden mit versionierter Rubrik und konkreten Bildbelegen bewertet | Offen · Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme. | — | Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test. |
| T56-AC05 | Umfang, Streuung, Regressionen und nicht belegte Vorteile werden offengelegt statt Qualitäts- oder Conversion-Lift zu behaupten | Offen · Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme. | — | Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test. |

## T57

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T57-AC01 | Wiederkehrender Befund besitzt Regel-ID, Ursache und konkreten Frame-/Partbeleg | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Persistentes Issue-/Regressionsregister, unabhängige Review und systematische Nachbarfälle vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T57-AC02 | Änderung erfolgt im zuständigen Token, Rezept, Vertrag oder Prüfer mit gezieltem Fehl- und Gutkontrollfall | Teilweise · M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T57-AC03 | Ausnahmen sind eng auf Regel, Node und Beat begrenzt und verbergen keine realen Fehler durch globale Masken | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Persistentes Issue-/Regressionsregister, unabhängige Review und systematische Nachbarfälle vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T57-AC04 | erneute Prüfung umfasst betroffenen Ablauf und Nachbarn mit versioniertem Vorher/Nachher-Nachweis | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Persistentes Issue-/Regressionsregister, unabhängige Review und systematische Nachbarfälle vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T57-AC05 | unabhängige Review erhält ein begrenztes Referenz-/Ergebnisbundle und keine automatische globale Agent- oder Policy-Umschreibung findet statt | Offen · Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme. | — | Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test. |

## T58

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T58-AC01 | Ein explizit freigegebenes Review-Bundle enthält ausgewählte pixelredigierte Frames, Brief und begrenzte Metadaten mit sichtbarem Provider- und Datenumfang | Teilweise · Lokaler direkter OpenAI-Review über Vercel AI SDK, reale WebGPU-Frames und unabhängige Referenzvalidierung; kein vollständiges Produktions-/Evaluationsgate. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json) | Allgemeine pixelweise Maskierung, Host-/Projektberechtigungen und alle produktiven Datenpfade fehlen; sensitive Parts verweigern aktuell die Aufnahme. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T58-AC02 | strukturierte Befunde nennen existierende Frame-/Partreferenzen oder gültige Bildregionen, Begründung, Unsicherheit und Herkunft | Teilweise · Lokaler direkter OpenAI-Review über Vercel AI SDK, reale WebGPU-Frames und unabhängige Referenzvalidierung; kein vollständiges Produktions-/Evaluationsgate. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json) | Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T58-AC03 | Modelltext ist untrusted input und Änderungen erfolgen nur mit überprüfbarer Vorschau und erlaubter Projektpolicy oder Reviewfreigabe ohne harte Gates zu überschreiben | Teilweise · Lokaler direkter OpenAI-Review über Vercel AI SDK, reale WebGPU-Frames und unabhängige Referenzvalidierung; kein vollständiges Produktions-/Evaluationsgate. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json) | Live-Gateway/Modell, Pixelmaskierung, echte Modellevaluation/Prompt-Injection-Korpus, Änderungsdiffs und dauerhafte Projekt-/Budgetautorität qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T58-AC04 | versionierte Evaluationen prüfen Gut-/Fehlfälle, Prompt Injection, erfundene Referenzen und getrennte AI-Frameabdeckung | Teilweise · Lokaler direkter OpenAI-Review über Vercel AI SDK, reale WebGPU-Frames und unabhängige Referenzvalidierung; kein vollständiges Produktions-/Evaluationsgate. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json), [artifact: docs/qa/2026-11-02-openai/brief-injection-v1.json](qa/2026-11-02-openai/brief-injection-v1.json) | Breiter unabhängiger Gut-/Fehlkorpus, visuelle und mehrstufige Injection, Wiederholungen und Human-Grading bleiben offen; ein adversarieller Brief ist live nachgewiesen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T58-AC05 | serverseitige Rechte, Budgetreservierung, Usage, Limits, Deadlines und Abort sind geprüft und fehlender Provider blockiert weder lokale Prüfer noch die Manual-Anwendungsruntime | Teilweise · Lokaler direkter OpenAI-Review über Vercel AI SDK, reale WebGPU-Frames und unabhängige Referenzvalidierung; kein vollständiges Produktions-/Evaluationsgate. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json) | Mehrinstanz-/Persistenz-/Hostauth- und produktive Berechtigungs-/Budgetgates bleiben offen; lokale Origin-, Session-, Input-, Konkurrenz-, Usage-, Deadline- und Abortgrenzen getestet. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T04

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T04-AC01 | WebGPU ist Default | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/backend-policy.test.ts](../tests/unit/backend-policy.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T04-AC02 | WebGL2-Fallback wird kenntlich gemacht | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/backend-policy.test.ts](../tests/unit/backend-policy.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T04-AC03 | ohne nutzbares Backend folgt ein definierter Fehler | Teilweise · Vollständiger Planumfang | — | Supportmatrix und automatische Fallback-Fehlerklassen |
| T04-AC04 | aktive Backends werden im Test bestätigt | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/backend-policy.test.ts](../tests/unit/backend-policy.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T05

Nachgewiesen im Scope: 0/2.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T05-AC01 | Resize, DPR, Scroll, Clipping, Flex und Grid stimmen überein | Teilweise · Vollständiger Planumfang | — | Scroll/Clipping/Flex/Grid-Conformance und echte große GPU-Liste |
| T05-AC02 | 10.000 Datenzeilen werden virtualisiert statt vollständig gezeichnet | Teilweise · Vollständiger Planumfang | — | Scroll/Clipping/Flex/Grid-Conformance und echte große GPU-Liste |

## T06

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T06-AC01 | DE/EN, kombinierende Zeichen, RTL und definierte CJK-Fälle getestet | Teilweise · Vollständiger Planumfang | — | RTL/CJK/Font-Failure-Isolation |
| T06-AC02 | fehlende Glyphen sichtbar diagnostiziert | Teilweise · Vollständiger Planumfang | — | RTL/CJK/Font-Failure-Isolation |
| T06-AC03 | Asset-/Fontfehler blockieren nicht die gesamte Runtime | Teilweise · Vollständiger Planumfang | — | RTL/CJK/Font-Failure-Isolation |

## T07

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T07-AC01 | Tastatur-only und Screenreader-Journeys bestehen | Teilweise · Vollständiger Planumfang | — | manuelle Screenreader-/IME-/Mobile-Journeys |
| T07-AC02 | IME, Auswahl, Copy/Paste, Touch und mobile Tastatur geprüft | Teilweise · Vollständiger Planumfang | — | manuelle Screenreader-/IME-/Mobile-Journeys |
| T07-AC03 | keine doppelten aktiven Controls | Teilweise · Vollständiger Planumfang | — | manuelle Screenreader-/IME-/Mobile-Journeys |

## T08

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T08-AC01 | 100 Mount/Unmount-Zyklen ohne verbleibende Listener/Jobs | Teilweise · Build fluid-b39ca981fb53ac0f3c6e: 100 echte React-/WebGPU-Zyklen im integrierten Chromium; explizit verwaltete Ressourcen und Idle-Frames. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-m6/lifecycle-100.json](qa/2026-11-02-m6/lifecycle-100.json), [source: packages/webgpu/src/resources.ts](../packages/webgpu/src/resources.ts), [test: tests/unit/resources.test.ts](../tests/unit/resources.test.ts) | Weitere Geräte, Initialisierungsabbruch und Langzeitsitzungen bleiben separate Gates. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T08-AC02 | keine Frames im ruhenden Zustand außer begründetem Bedarf | Teilweise · Build fluid-b39ca981fb53ac0f3c6e: 100 echte React-/WebGPU-Zyklen im integrierten Chromium; explizit verwaltete Ressourcen und Idle-Frames. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-m6/lifecycle-100.json](qa/2026-11-02-m6/lifecycle-100.json), [source: packages/webgpu/src/resources.ts](../packages/webgpu/src/resources.ts), [test: tests/unit/resources.test.ts](../tests/unit/resources.test.ts) | Weitere Geräte, Initialisierungsabbruch und Langzeitsitzungen bleiben separate Gates. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T08-AC03 | Geräteverlust erhält Nutzerdaten | Teilweise · Historischer f706-nativer React-Geräteverlust erhält Draft/Revision/Sortierung/Auswahl/URL. M8-Source-Review und aktueller React/Core-Test mit deterministischem Surfaceport bestätigen dieselbe Ownership und unveränderte Felder/Route beim Recovery; keine neue GPU-Verlust- oder allgemeine Hardwarefreigabe. Nachfolgender portabler ReturnType-Export von useFluid ist exakt auf den vorherigen Sourcehash zurückgeführt; transpiliertes Runtime-JS byteidentisch (v3). Der spätere Replay-Modusgetter ist nur lesend; Geräteverlust-/Recoverypfad und Besitzverhältnisse bleiben unverändert (Native-Proof-Addendum). Einzelne Belege des historischen Laufs sind separat archiviert. | — | Weitere Verlust-/Abbrucharten und Supportprofile qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T09

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T09-AC01 | Ungültige Events verändern nichts | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/runtime.test.ts](../tests/unit/runtime.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T09-AC02 | Manual ruft keine Modelle auf | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/runtime.test.ts](../tests/unit/runtime.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T09-AC03 | Hybrid benötigt Freigabe | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/runtime.test.ts](../tests/unit/runtime.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T09-AC04 | Auto überschreitet keine Allowlist | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/runtime.test.ts](../tests/unit/runtime.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| R2-AC04 | Ein wiedereintretender Guard überschreibt kein neueres Event. Disposal durch Beobachter verhindert verspätete Aktionen. Responsive Fokusziele werden pro Surface mit deren Viewport geprüft. | Teilweise · Regressionstests für verschachtelte Events im Guard, Disposal im Beobachter und unterschiedliche Viewports zweier Surfaces. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T10

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T10-AC01 | Button→Progress→Result, Card→Detail, Grid→List und Form→Summary ohne Inhaltsverlust | Teilweise · Vollständiger Planumfang | — | weitere Morph-Familien und allgemeine Choreography-Verträge |
| T10-AC02 | Unterbrechungen erzeugen keine Sprünge zu veralteten Zuständen | Teilweise · Vollständiger Planumfang | — | weitere Morph-Familien und allgemeine Choreography-Verträge |
| R2-AC01 | Zeilen und Karten behalten ihre Modulidentität. Der Atlas entfaltet genau die Mitglieder seiner Gruppe. Zwei bis vier ausgewählte Karten bilden genau einen Vergleich und lassen sich wieder trennen. | Teilweise · Die drei Beziehungen wurden mit realen Workspace-IDs auf Chrome geprüft. Der Kopf einer Gruppe, die Hüllen und ihre Datenfelder werden getrennt projiziert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T11

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T11-AC01 | Gleicher Seed erzeugt gleichen logischen Verlauf | Teilweise · Vollständiger Planumfang | — | Physics-Presets und Fixed-Step-Simulation |
| T11-AC02 | Reduced Motion funktioniert | Teilweise · Vollständiger Planumfang | — | Physics-Presets und Fixed-Step-Simulation |
| T11-AC03 | gemeinsame Übergänge bleiben zeitlich synchron | Teilweise · Vollständiger Planumfang | — | Physics-Presets und Fixed-Step-Simulation |
| R2-AC02 | Retargeting übernimmt die aktuelle Geometrie und begrenzte Geschwindigkeiten. Ports und sichtbare Kanten stimmen an Prüfzeitpunkten bis auf einen CSS-Pixel überein. | Teilweise · Begrenzter numerischer Retarget- und Porttest im gemeinsamen Sampler. Browseraufnahmen prüfen Unterbrechungen bei 25, 50 und 75 Prozent. Numerische und sichtbare Abweichungen sind im Lauf separat ausgewiesen. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T12

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T12-AC01 | Dirty Fields, Auswahl und IDs bleiben erhalten | Teilweise · Vollständiger Planumfang | — | typisierte Projektionen beliebiger Content-Schemas |
| T12-AC02 | fehlende Mapping-Pflichten scheitern vor Ausführung | Teilweise · Vollständiger Planumfang | — | typisierte Projektionen beliebiger Content-Schemas |
| T12-AC03 | keine erfundenen Werte | Teilweise · Vollständiger Planumfang | — | typisierte Projektionen beliebiger Content-Schemas |

## T13

Nachgewiesen im Scope: 0/1.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T13-AC01 | Jede Familie besitzt Stategraph, Semantik, Error-/Loading-/Empty-Zustände, Themes und Szenarien. Typwechsel ändert nicht unbemerkt die fachliche Bedeutung | Teilweise · Vollständiger Planumfang | — | vollständige Familien und Error/Empty/Loading-Conformance |

## T14

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T14-AC01 | Deep Link, Reload, Back/Forward, ungültige Parameter und gelöschte IDs getestet | Teilweise · Vollständiger Planumfang | — | Next-Routeradapter und allgemeine fachliche Deep Links |
| T14-AC02 | keine Seiteneffekte beim History-Replay | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/workspace.test.ts](../tests/unit/workspace.test.ts), [document: docs/milestones/m2.md](milestones/m2.md) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| R1-AC02 | Ein Besuch des Studios und die Rückkehr stellen die kanonische Workspace-Ansicht samt Auswahl wieder her. Back und Forward erzeugen keine Mutationen. | Teilweise · Lokaler Workspace mit Auswahl, gefilterten Karten, explizitem Vergleich, Back/Forward und Rückkehr aus dem Studio. Core und Routerpfad sind gemeinsam geprüft. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T15

Nachgewiesen im Scope: 0/2.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T15-AC01 | Abort, Stale Results, Revalidation, Schemafehler und Idempotenz getestet | Teilweise · Eigenständige validierte Data-/Action-Clients und Core-Replay; automatisierte Konkurrenz- und Autoritätsprüfung. Am 13.11.2026 Source-Delta für abbrechbare asynchrone Autorisierung geprüft; aktuelle Data-/Agent-/Core-Regressionssuite bestanden. Keine Erweiterung auf verteilte Persistenz oder produktive Hostfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/data.test.ts](../tests/unit/data.test.ts), [test: tests/unit/runtime.test.ts](../tests/unit/runtime.test.ts), [source: packages/core/src/data.ts](../packages/core/src/data.ts) | Dauerhafte produktive Host-Idempotenz sowie konkrete Query-/HTTP-/Provideradapter separat integrieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T15-AC02 | keine Mutation durch Prefetch oder Replay | Teilweise · Eigenständige validierte Data-/Action-Clients und Core-Replay; automatisierte Konkurrenz- und Autoritätsprüfung. Am 13.11.2026 Source-Delta für abbrechbare asynchrone Autorisierung geprüft; aktuelle Data-/Agent-/Core-Regressionssuite bestanden. Keine Erweiterung auf verteilte Persistenz oder produktive Hostfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/data.test.ts](../tests/unit/data.test.ts), [test: tests/unit/runtime.test.ts](../tests/unit/runtime.test.ts), [source: packages/core/src/data.ts](../packages/core/src/data.ts) | Dauerhafte produktive Host-Idempotenz sowie konkrete Query-/HTTP-/Provideradapter separat integrieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T16

Nachgewiesen im Scope: 0/6.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T16-AC01 | Reale Projekte öffnen/speichern | Teilweise · Vollständiger Planumfang | — | Projektöffnen, atomare Speicherung und Konflikte |
| T16-AC02 | Konflikte erkennen | Teilweise · Vollständiger Planumfang | — | Projektöffnen, atomare Speicherung und Konflikte |
| T16-AC03 | beschädigte Dateien überschreiben keinen gültigen Stand | Teilweise · Vollständiger Planumfang | — | Projektöffnen, atomare Speicherung und Konflikte |
| T16-AC04 | Events und Snapshots korrelieren | Teilweise · Vollständiger Planumfang | — | Projektöffnen, atomare Speicherung und Konflikte |
| R1-AC01 | Bei 1280 × 720 und 390 × 844 sind ein echtes Modul und ein bedienbarer Übergang beim Einstieg sichtbar. Bei 320 Pixeln bleiben beide Handbücher erreichbar. | Teilweise · Chrome mit echten Workspace-Modulen. Sichtbarkeit der Hauptaktion und Modulgeometrie bei 1280, 390 und 320 CSS-Pixeln. Die mobile Navigation öffnet das Wissen. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| R4-AC01 | Speichern, Neuladen und gezieltes Laden stellen eine lokale Entwurfsversion wieder her. Eine konkurrierende Revision wird abgewiesen und der geladene Entwurf durchläuft erneut den Preflight. | Teilweise · Lokale SQLite-Versionen, konkurrierende Revisionen und ein Studio-Durchlauf mit Speichern, Wiederöffnen und erneuter Prüfung derselben Datenbasis. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T17

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T17-AC01 | Roundtrip ohne Informationsverlust | Teilweise · Vollständiger Planumfang | — | grafisches Authoring, Monaco, Undo/Redo |
| T17-AC02 | ungültige Kanten werden blockiert | Teilweise · Vollständiger Planumfang | — | grafisches Authoring, Monaco, Undo/Redo |
| T17-AC03 | Undo/Redo funktioniert | Teilweise · Vollständiger Planumfang | — | grafisches Authoring, Monaco, Undo/Redo |
| T17-AC04 | Mermaid-Ausgabe ist syntaktisch validiert | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [source: scripts/check-mermaid.mjs](../scripts/check-mermaid.mjs) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T18

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T18-AC01 | Replay führt null externe Mutationen aus | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/runtime.test.ts](../tests/unit/runtime.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T18-AC02 | gleiche Eingaben liefern denselben logischen Trace | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/runtime.test.ts](../tests/unit/runtime.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T18-AC03 | „Live“, „Aufzeichnung“ und „Simulation“ sind sichtbar getrennt | Teilweise · Vollständiger Planumfang | — | vollständige Simulation/Fault-Injection und versionierte Projekt-/Datenaufzeichnungen |
| R2-AC03 | Derselbe Clip ist vorwärts und rückwärts abtastbar. Neue Aufzeichnungen enthalten den Bewegungsplan. Vorhandene v2/v3-Formate behalten ihren historischen Sampler. | Teilweise · V4-Clips transportieren den expliziten Plan. Bestandsszenarien verwenden beim Import den historischen Sampler. Seek, Replay und Rückkehr zur Live-Surface wurden im Studio geprüft. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T19

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T19-AC01 | Jeder erlaubte Übergang ist abgedeckt | Teilweise · Vollständiger Planumfang | — | 85%-Gate, GPU-CI und vollständige Journey-Matrix; manuelle visuelle/AT-Freigaben |
| T19-AC02 | Race-/Abort-Sequenzen getestet | Teilweise · Vollständiger Planumfang | — | 85%-Gate, GPU-CI und vollständige Journey-Matrix; manuelle visuelle/AT-Freigaben |
| T19-AC03 | visuelle Fehler und semantische Fehler werden unabhängig erkannt | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/design-quality.test.ts](../tests/unit/design-quality.test.ts), [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json), [artifact: docs/qa/2026-11-02-openai/final-layout-matrix.json](qa/2026-11-02-openai/final-layout-matrix.json) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| R6-AC03 | Unabhängige Teilnehmende können nach Match, Split und Merge die Identität oder Mitgliedschaft korrekt nennen. Erfahrungen mit Screenreader, echter mobiler Eingabe und Reduced Motion sind je Profil dokumentiert. | Externer Nachweis nötig · Das Erkennungsprotokoll und die lokalen Reduced-Motion-Prüfpunkte sind dokumentiert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Unabhängige Teilnehmende, Screenreader und echte mobile Eingabe auf benannten Geräten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T20

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T20-AC01 | Neues React-/Next-Projekt lässt sich ohne Browser-Secrets integrieren | Teilweise · Vollständiger Planumfang | — | init/add/studio/export und frische Hostintegration |
| T20-AC02 | wiederholtes `add` überschreibt keine Benutzeränderungen | Teilweise · Vollständiger Planumfang | — | init/add/studio/export und frische Hostintegration |
| T20-AC03 | Exporte bauen reproduzierbar | Teilweise · Vollständiger Planumfang | — | init/add/studio/export und frische Hostintegration |

## T21

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T21-AC01 | Default Top-3, konfigurierbar bis fünf | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T21-AC02 | Unklarheit wird ausdrücklich dargestellt | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T21-AC03 | Qualitätsmessung auf getrennten Sessions statt Trainingsdaten | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |

## T22

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T22-AC01 | Ungültige, verspätete und unberechtigte Pläne werden verworfen | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T22-AC02 | keine Keys im Client | Teilweise · Historischer Prüflauf bis 14.11.2026. Aktueller M8-Source- und First-party-Clientimportgraph ohne Provider-/Server-/Node-/Environment-Zugriff; Serverroute liefert keine Keywerte. Nach Core-Observer-/Commit-Receipt-Fix volle automatisierte Suite475/475 in54Dateien bestanden. Frühere Build-/Live-Evidenz bleibt historisch; kein neuer Produktionsbundle- oder Providerbeweis. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/secret-boundary.json](qa/2026-11-02-openai/secret-boundary.json) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T22-AC03 | Timeouts lassen die WebGPU-Oberfläche bedienbar | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |

## T23

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T23-AC01 | Maximal drei eigene gleichzeitige Preloads | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T23-AC02 | kein Kauf/Submit | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T23-AC03 | überholte Jobs abbrechen | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T23-AC04 | Treffer, verschwendete Bytes und Latenznutzen messen | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |

## T24

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T24-AC01 | Nutzer kann Anpassungen stoppen und zurücknehmen | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T24-AC02 | keine Reorganisation während aktiver Eingabe | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T24-AC03 | Präferenzen werden nicht aus sensiblen Vermutungen abgeleitet | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |

## T25

Nachgewiesen im Scope: 0/1.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T25-AC01 | Jeder Case hat Datenherkunft, vollständige URL-/State-Flows, Fehlerfälle, Manual/Hybrid/Auto-Vergleich und reproduzierbare Tests | Teilweise · Vollständiger Planumfang | — | übrige freigegebene Praxisfälle mit echten Adaptern |

## T26

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T26-AC01 | Jede Entscheidung ist einem Snapshot und Ergebnis zuordenbar | Teilweise · Vollständiger Planumfang | — | OTLP, Persistenz und Exportausfall-Prüfung |
| T26-AC02 | keine erfundenen Dashboardwerte | Teilweise · Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T26-AC03 | Exportausfälle sind sichtbar | Teilweise · Vollständiger Planumfang | — | OTLP, Persistenz und Exportausfall-Prüfung |

## T27

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T27-AC01 | Parallele Requests umgehen kein Budget | Teilweise · Lokaler Studio-Review in einem Serverprozess: synchron reservierte Session-/Prozessbudgets, exakte Inputprüfung, konservativer Abort und serverseitige Budgetautorität. Keine verteilte oder dauerhafte Produktabnahme. | [test: tests/unit/ai-review.test.ts](../tests/unit/ai-review.test.ts), [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json) | Anwendungs-DecisionPlans, persistente Session-/Projektbudgets, Mehrinstanzkonkurrenz und Abrechnungsabgleich separat qualifizieren. |
| T27-AC02 | abgebrochene Requests werden konservativ verrechnet | Teilweise · Lokaler Studio-Review in einem Serverprozess: synchron reservierte Session-/Prozessbudgets, exakte Inputprüfung, konservativer Abort und serverseitige Budgetautorität. Keine verteilte oder dauerhafte Produktabnahme. | [test: tests/unit/ai-review.test.ts](../tests/unit/ai-review.test.ts), [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json) | Anwendungs-DecisionPlans, persistente Session-/Projektbudgets, Mehrinstanzkonkurrenz und Abrechnungsabgleich separat qualifizieren. |
| T27-AC03 | kein Client kann seinen Budgetstand autoritativ setzen | Teilweise · Lokaler Studio-Review in einem Serverprozess: synchron reservierte Session-/Prozessbudgets, exakte Inputprüfung, konservativer Abort und serverseitige Budgetautorität. Keine verteilte oder dauerhafte Produktabnahme. | [test: tests/unit/ai-review.test.ts](../tests/unit/ai-review.test.ts), [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json) | Anwendungs-DecisionPlans, persistente Session-/Projektbudgets, Mehrinstanzkonkurrenz und Abrechnungsabgleich separat qualifizieren. |

## T28

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T28-AC01 | Exposure/Outcome korrekt zugeordnet | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T28-AC02 | Policy-Zustand über Neustarts erhalten | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T28-AC03 | keine Promotion bei Datenqualitätsfehlern | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T28-AC04 | Rollback stellt exakt die vorherige Policy her | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |

## T29

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T29-AC01 | Definierte Geräte-/Szenariomatrix besteht | Teilweise · Vollständiger Planumfang | — | Gerätematrix, P95-Budgets und Langzeittests |
| T29-AC02 | Ressourcenbudget gemessen | Teilweise · Vollständiger Planumfang | — | Gerätematrix, P95-Budgets und Langzeittests |
| T29-AC03 | lokale Modelle verdrängen nicht unkontrolliert Renderingressourcen | Teilweise · Vollständiger Planumfang | — | Gerätematrix, P95-Budgets und Langzeittests |
| R6-AC02 | Referenzläufe qualifizieren Timing nur bei dokumentierter hinreichend ruhiger CPU- und GPU-Last. Verunreinigte und unvollständig beobachtete Läufe bleiben als solche sichtbar. | Teilweise · Diagnoseläufe erfassen Frameintervalle und Fremdlast im zugeordneten Messfenster. Grenzen der Prozess- und GPU-Zuordnung sind im Bericht ausgewiesen. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Eine Laufzeitfreigabe erfordert einen ruhigen, zuordenbaren Referenzlauf samt GPU-Lastnachweis. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T30

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T30-AC01 | Keine offenen Releaseblocker | Teilweise · Vollständiger Planumfang | — | externer CI-Betrieb und vollständige Release-/Geräte-/Security-/Upgrade-Gates |
| T30-AC02 | Installations-/Upgrade-Test besteht | Teilweise · Vollständiger Planumfang | — | externer CI-Betrieb und vollständige Release-/Geräte-/Security-/Upgrade-Gates |
| T30-AC03 | bekannte Einschränkungen dokumentiert | Teilweise · Bekannte Einschränkungen in README und aktuellem65-Taskregister dokumentiert:41 lokale M8-Kriterien nachgewiesen, Leistung weiterhin failed/contaminated/not-qualified; breite Produkt-, Hardware-, AT-/IME- und T29-Gates offen. Dokumentationsnachweis, keine Gesamtfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json), [artifact: docs/qa/2026-11-02-openai/final-layout-matrix.json](qa/2026-11-02-openai/final-layout-matrix.json), [artifact: docs/acceptance/m8-adoption-2026-11-13.json](acceptance/m8-adoption-2026-11-13.json) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T30-AC04 | KI- und Policy-Kill-Switch verifiziert | Teilweise · Vollständiger Planumfang | — | externer CI-Betrieb und vollständige Release-/Geräte-/Security-/Upgrade-Gates |

## T31

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T31-AC01 | Parallele Bearbeitung konvergiert | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T31-AC02 | ungültige Zwischenstände werden nicht publiziert | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T31-AC03 | getrennte Nutzer lösen keine doppelten fachlichen Aktionen aus | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |

## T32

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T32-AC01 | Plugin-Inkompatibilität wird vor Start erkannt | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T32-AC02 | Unload räumt Ressourcen auf | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T32-AC03 | kein Zugriff auf Secrets allein durch ein Template | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| R6-AC01 | Ein separater React-Host baut die öffentlichen Pakete ohne Next.js. Modulwechsel und benannte Backenddiagnose werden im Host im Browser geprüft. | Teilweise · Eigenständiger Vite-/React-Host aus öffentlichen Paketen. Der Buildgraph und die sichtbaren Übergänge einschließlich Backendstatus wurden auf WebGPU und WebGL2 geprüft. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T33

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T33-AC01 | Mehrdeutige Befehle fragen nach | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T33-AC02 | Aufnahme sichtbar | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T33-AC03 | bestehende Guards gelten unverändert | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T33-AC04 | Tastaturbedienung bleibt vollständig | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |

## T34

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T34-AC01 | Rollen auf Server und Studio geprüft | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T34-AC02 | Projektisolation getestet | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T34-AC03 | Löschung, Retention, Backup und Restore funktionieren | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |

## T35

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T35-AC01 | Konkretes Headset-/Browserprofil samt Backend nachgewiesen | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T35-AC02 | kein unbemerkter Backendwechsel | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T35-AC03 | Controller/Gesten führen dieselben Events aus | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T35-AC04 | Session-Ende räumt Ressourcen auf | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |

## T36

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T36-AC01 | Text, Hit-Testing und fachliche Information bleiben deterministisch | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T36-AC02 | Modellherkunft dokumentiert | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T36-AC03 | ohne belegten Vorteil wird das Ergebnis archiviert und nicht als Produktionsfeature freigegeben | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |

## T37

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T37-AC01 | Installation reproduzierbar | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T37-AC02 | inkompatible Pakete werden abgewiesen | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T37-AC03 | Updates überschreiben keine Nutzerdaten | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |
| T37-AC04 | unsichere Pakete können gesperrt werden | Offen · Vollständiger Planumfang | — | Acceptance Criteria des Gesamtplans |

## T38

Nachgewiesen im Scope: 0/3.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T38-AC01 | Jedes Tutorial besteht als Integrationstest | Teilweise · Vollständiger Planumfang | — | getestete Tutorials und veröffentlichbare Benchmarks |
| T38-AC02 | Leistungsangaben nennen Gerät und Szenario | Teilweise · Vollständiger Planumfang | — | getestete Tutorials und veröffentlichbare Benchmarks |
| T38-AC03 | keine unbelegten Conversion- oder Verbreitungszahlen | Teilweise · Vollständiger Planumfang | — | getestete Tutorials und veröffentlichbare Benchmarks |

## GLOBAL

Nachgewiesen im Scope: 0/36.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| GLOBAL-TEST-01 | Zustände: Jeder deklarierte Übergang und seine Ablehnung getestet; zufällige Ereignisfolgen verletzen keine Invarianten | Teilweise · Vollständige Test-/Supportmatrix | — | Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen. |
| GLOBAL-TEST-02 | Konkurrenz: Doppelklick, schnelle Navigation, parallele Requests, verspätete KI und Unmount während Initialisierung | Teilweise · Vollständige Test-/Supportmatrix | — | Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen. |
| GLOBAL-TEST-03 | Daten: Leere Ergebnisse, beschädigte Antworten, Teilfehler, veraltete Preise/Angebote, Abbruch und Retry | Teilweise · Vollständige Test-/Supportmatrix | — | Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen. |
| GLOBAL-TEST-04 | Eingabe: Tastatur, Touch, Pointer Capture, IME, RTL, Auswahl, Clipboard und mobile Tastatur | Teilweise · Vollständige Test-/Supportmatrix | — | Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen. |
| GLOBAL-TEST-05 | Accessibility: Automatisierte Semantikprüfung plus manuelle Screenreader-Journeys; GPU-Kontrast, Fokus und Zoom separat prüfen | Teilweise · Vollständige Test-/Supportmatrix | — | Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen. |
| GLOBAL-TEST-06 | URLs: Direkteinstieg, Reload, Back/Forward, ungültige Parameter und nicht mehr vorhandene Ressourcen | Teilweise · Vollständige Test-/Supportmatrix | — | Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen. |
| GLOBAL-TEST-07 | GPU: Adapter fehlt, Limits fehlen, Geräteverlust, Resize/DPR-Wechsel, lange Sitzung und Ressourcenfreigabe | Teilweise · Vollständige Test-/Supportmatrix | — | Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen. |
| GLOBAL-TEST-08 | KI: Schemafehler, Prompt Injection, falsche Component-ID, veraltete Revision, Budgetüberschreitung und Anbieterfehler | Teilweise · Vollständige Test-/Supportmatrix | — | Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen. |
| GLOBAL-TEST-09 | Simulation: Kein produktiver Schreibzugriff; reproduzierbare logische Ergebnisse; kontrollierte visuelle Toleranzen | Teilweise · Vollständige Test-/Supportmatrix | — | Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen. |
| GLOBAL-TEST-10 | Collaboration: Konkurrenz, Verbindungsabbruch, Wiederverbindung, Rechteentzug und ungültige Entwürfe | Offen · Collaboration-Paket nicht implementiert. | — | Dokumente, Presence und serverautorisierte Aktionen implementieren; Konkurrenz, Reconnect und Rechteentzug prüfen. |
| GLOBAL-TEST-11 | Packaging: Clean Install, Tree-Shaking, Serverimport ohne Browserglobals und Integration in ein frisches Hostprojekt | Teilweise · Vollständige Test-/Supportmatrix | — | Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen. |
| GLOBAL-COVERAGE-01 | Coverage dient als zusätzlicher Indikator: mindestens 85 % Branch Coverage für Core, Policy, Routing und Budgetlogik; alle sicherheits- und datenrelevanten Invarianten müssen unabhängig davon explizit getestet sein. | Teilweise · V8: Core-Paket 85,75 Prozent Branch; gesamter gemessener Scope 77,93 Prozent. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Routing-, Policy- und Budgetabnahme getrennt belegen; fehlende Produktionslogik implementieren. Leere Module mit 100 Prozent sind kein Funktionsnachweis. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| GLOBAL-BUDGET-01 | Lokaler Event→Snapshot-Pfad: P95 ≤10 ms im Referenzszenario. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-BUDGET-02 | Wahrnehmbare lokale Aktionsrückmeldung: P95 ≤100 ms. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-BUDGET-03 | Desktop-Referenz: P95 Framezeit ≤16,7 ms bei 1080p, 200 sichtbaren Elementen und 20 parallelen Morphs. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-BUDGET-04 | Mobile Referenz: dieselben funktionalen Szenarien; Framebudget und maximaler Szenenumfang werden getrennt veröffentlicht. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-BUDGET-05 | Leckprüfung: nach Aufwärmen und 100 Wiederholungen kein dauerhaft wachsender Ressourcenbestand; maximal 5 % Abweichung vom stabilen Plateau. | Teilweise · 100 aktuelle Chromium-Zyklen; null verbleibende eigene Ressourcen und konstante Glyph-Puffer. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Langzeit-/Warmup-/weitere Gerätematrix; Treiber- und Prozessspeicher werden nicht durch eigene Tokens gemessen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| GLOBAL-BUDGET-06 | GPU-Speicherangaben beziehen sich auf selbst verwaltete Allokationen und werden als solche bezeichnet. | Teilweise · Angegeben sind ausdrücklich Glyph-Puffer und selbst verwaltete Allokationen; keine GPU-Gesamtspeicherbehauptung. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Weitere Benchmarks benötigen dieselbe klare Messgrenze. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| GLOBAL-BUDGET-07 | KI: eine laufende Entscheidung pro Session; überholte Requests abbrechen; standardmäßig 3 s Soft- und 6 s Hard-Deadline. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-BUDGET-08 | Initiales Cloud-Kostenlimit: maximal 0,35 USD pro aktiver Session, serverseitig konfigurierbar und durch Reservierung abgesichert. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-BUDGET-09 | Prefetch: maximal drei eigene parallele Jobs; Bytebudgets nur dort hart versprechen, wo Größe und Abbruch tatsächlich kontrollierbar sind. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-BUDGET-10 | Keine garantierte Conversion-Steigerung. Wirkung wird gegenüber dem statischen beziehungsweise manuellen Kontrollpfad gemessen. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-DOD-01 | Jede Vision ist implementiert, ausdrücklich begrenzt oder durch ein dokumentiertes Forschungsergebnis entschieden. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-DOD-02 | Jede produktive Komponente besitzt Anatomy-, Behavior-, Daten-, State-, Eingabe-, Semantik- und Renderingvertrag mit unabhängigen Zustandsbesitzern. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-DOD-03 | User-, Daten-, State- und URL-Flows sind durchgängig verbunden und als Mermaid nachvollziehbar. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-DOD-04 | Studio und Produktionsintegration verwenden denselben Runtime-Kern. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-DOD-05 | Praxisfälle funktionieren mit realen Daten; Simulation ist jederzeit erkennbar. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-DOD-06 | Architekturentscheidungen, Tests und tatsächliche Messergebnisse sind miteinander verknüpft. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-DOD-07 | Kein Release hängt von den bestehenden Prototyp-APIs oder unbelegten Leistungsversprechen ab. | Offen · Produkt-/Releasegate | — | Messung beziehungsweise vollständige Produktabnahme erforderlich. |
| GLOBAL-RELEASE-01 | **Contract Preview:** Schemas und APIs, noch keine Produktionszusage. | Offen · Gesamtprodukt; noch kein vollständiger Nachweis für dieses Kriterium. | — | Implementierung und Abnahme gemäß kanonischem Kriterium ausführen; spätere Wave bleibt abhängig von den vorgelagerten Gates. |
| GLOBAL-RELEASE-02 | **GPU Alpha:** qualifizierter Rendering-/Eingabekern. | Offen · Gesamtprodukt; noch kein vollständiger Nachweis für dieses Kriterium. | — | Implementierung und Abnahme gemäß kanonischem Kriterium ausführen; spätere Wave bleibt abhängig von den vorgelagerten Gates. |
| GLOBAL-RELEASE-03 | **Studio Beta:** vollständige Szenarien und reproduzierbare Tests. | Offen · Gesamtprodukt; noch kein vollständiger Nachweis für dieses Kriterium. | — | Implementierung und Abnahme gemäß kanonischem Kriterium ausführen; spätere Wave bleibt abhängig von den vorgelagerten Gates. |
| GLOBAL-RELEASE-04 | **Integration Beta:** reale Case-Adapter und Hostintegration. | Offen · Gesamtprodukt; noch kein vollständiger Nachweis für dieses Kriterium. | — | Implementierung und Abnahme gemäß kanonischem Kriterium ausführen; spätere Wave bleibt abhängig von den vorgelagerten Gates. |
| GLOBAL-RELEASE-05 | **Core 1.0:** alle RP5-Gates bestanden. | Offen · Gesamtprodukt; noch kein vollständiger Nachweis für dieses Kriterium. | — | Implementierung und Abnahme gemäß kanonischem Kriterium ausführen; spätere Wave bleibt abhängig von den vorgelagerten Gates. |
| GLOBAL-RELEASE-06 | **Optionale Erweiterungen:** jeweils eigene Supportmatrix und Versionsfreigabe. | Offen · Gesamtprodukt; noch kein vollständiger Nachweis für dieses Kriterium. | — | Implementierung und Abnahme gemäß kanonischem Kriterium ausführen; spätere Wave bleibt abhängig von den vorgelagerten Gates. |
| GLOBAL-ROLLOUT-01 | KI-Policies werden getrennt von Bibliotheksversionen ausgerollt: Shadow Mode → begrenzter Canary → größere Kohorte. Jede Stufe benötigt bestandene Qualitäts-, Kosten- und UX-Gates. Bei Fehlern wird eine bekannte Policy-Version wieder aktiviert; die Rendering-Policy bleibt WebGPU-first mit sichtbarem Backend. | Offen · Noch keine produktive KI-Policy-/Kohortenpipeline. | — | Shadow-/Canary-/Holdout-, Kosten-/UX-Gates und exaktes Policy-Rollback implementieren und prüfen. |

## ARCH

Nachgewiesen im Scope: 0/67.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| ARCH-AUTH-01 | **Eine Autorität pro Zustandsbereich:** Core/Host besitzen Fachzustand und kontrollierte Werte; der Interaktionsstore besitzt Fokus/Hover/Pressed/Composition; die Surface besitzt Animation und Ressourcen. React und Semantik lesen diese Stores, ohne Werte zu duplizieren. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-AUTH-02 | **Autorität:** Invarianten und Berechtigungen → ausdrückliche Nutzeraktion → deklarierter Host-Workflow → KI-Vorschlag. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-AUTH-03 | **Manual (Anwendungsruntime):** Keine Modellaufrufe aus der Anwendungssteuerung; der Host steuert gültige Events. Eine bewusst angeforderte Studio-AI-Review ist eine getrennt berechtigte Toolaktion ohne Autorität über diese Runtime. | Teilweise · Bestehende Manual-Runtime und geplante getrennte Studio-AI-Review. | — | T58 als separate berechtigte und budgetierte Toolaktion implementieren und die Trennung durch Integrationsfälle nachweisen. |
| ARCH-AUTH-04 | **Hybrid:** KI erstellt Vorschläge; Freigabe erfolgt durch Nutzer oder ausdrücklich konfigurierte Host-Policy. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-AUTH-05 | **Auto:** Nur freigegebene, reversible Anpassungen; keine Käufe, Buchungen, Veröffentlichungen oder Rechteänderungen. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-AUTH-06 | **Standard:** Runtime startet in Manual. KI-Modi werden bewusst konfiguriert. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-AUTH-07 | **Kein State-Sprung durch Animation:** Logische Änderungen werden atomar committed; Animationen visualisieren den Übergang. Quelle → Zusatzeffekt → Ziel sind visuelle Phasen, keine zusätzlichen Fachzustände. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-AUTH-08 | **Überholte Antworten:** Alte Request-/Snapshot-Versionen dürfen den aktuellen Zustand nicht überschreiben. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-AUTH-09 | **Unterbrechung:** Neue berechtigte Aktionen dürfen eine visuelle Animation ersetzen. Externe Transaktionen werden dadurch nicht rückgängig gemacht. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-AUTH-10 | **Stabile Eingabe:** Fokus, Auswahl und bearbeitete Felder dürfen nicht durch spontane KI-Anpassungen verloren gehen. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-RENDER-01 | Ein Renderer und ein zentraler Frame-Scheduler pro Surface. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-RENDER-02 | WebGPU zuerst prüfen; WebGL2-Fallback ist erlaubt. Nur öffentliche Three.js-APIs verwenden. Backend, Grund und Diagnosemodus sind beobachtbar. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-RENDER-03 | Orthografisches UI-Koordinatensystem mit Containergröße statt globaler Fensterannahmen. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-RENDER-04 | Yoga-Boxlayout; Grid, Scrollbereiche und Virtualisierung als definierte Fluid-Abstraktionen. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-RENDER-05 | GPU-Text über einen Textadapter; Schriftdateien und Glyphenressourcen werden kontrolliert geladen. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-RENDER-06 | Morphing kombiniert parametrische Flächen/SDFs, Layoutinterpolation und GPU-gezeichnete Content-Übergänge. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-RENDER-07 | Beliebige Mesh-Topologien benötigen registrierte Morph-Adapter. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-RENDER-08 | Jeder interaktive Part besitzt einen expliziten Behavior-Vertrag; ein Renderrezept legt keine Rolle fest. Die Semantikbrücke verwendet echte zugängliche Elemente; sie wird nicht mit `display:none` oder `aria-hidden` unbrauchbar gemacht. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-RENDER-09 | Native Texteingabe wird mit GPU-Text, Caret und Auswahl synchronisiert. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-RENDER-10 | Reduced Motion verändert die Animation, nicht die Funktion. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-RENDER-11 | Ressourcen besitzen eindeutige Eigentümer und ein überprüfbares Lebensende. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-RENDER-12 | Geräteverlust pausiert Rendering, erhält den fachlichen Snapshot und versucht begrenzte WebGPU-Wiederherstellung. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-RENDER-13 | Ohne nutzbares WebGPU wird das freigegebene WebGL2-Backend versucht. Wenn auch dieses nicht verfügbar oder nicht für die verwendeten Primitives qualifiziert ist, folgt ein nachvollziehbarer Startfehler. Es gibt keinen stillen HTML-Ersatz. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-STORAGE-01 | API-Keys ausschließlich serverseitig; Projektdateien enthalten nur Secret-Referenzen. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-STORAGE-02 | Lokales Studio bindet standardmäßig an Loopback und schützt Schreiboperationen durch Origin-/Sessionprüfung. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-STORAGE-03 | Importpfade dürfen das freigegebene Projektverzeichnis nicht verlassen. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-STORAGE-04 | Server-Proxy-Ziele werden konfiguriert; kein frei nutzbarer URL-Proxy. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-STORAGE-05 | Modellantworten werden auf Schema, Rechte, Zustand, erlaubte Aktionen und Ablaufzeit geprüft. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-STORAGE-06 | Persönliche Eingaben und Rohprompts werden standardmäßig nicht in Telemetrie übernommen. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-STORAGE-07 | Replay darf keine produktiven Seiteneffekte ausführen. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-STORAGE-08 | Community-Templates sind zunächst deklarativ. Ausführbare Plugins werden bewusst als vertrauenswürdige Build-Abhängigkeiten eingebunden. | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-URL-01 | Explizite Navigation erzeugt History-Einträge. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-URL-02 | Reine Editoransichtsänderungen verwenden `replace`. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-URL-03 | Suchfilter werden erst bei bestätigter Suche kanonisch übernommen. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-URL-04 | Formulardaten, Secrets, Prompts, Hoverzustände und Animationsfortschritt gehören nicht in URLs. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-URL-05 | Zurück/Vorwärts stellt den referenzierten fachlichen Zustand wieder her und bricht überholte Ladevorgänge ab. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-URL-06 | Nicht mehr vorhandene IDs erzeugen einen definierten Not-found-Zustand. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-URL-07 | KI darf aus freigegebenen Navigationszielen wählen, aber keine freien URLs erfinden. | Teilweise · Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert. | — | Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen. |
| ARCH-API-01 | `ComponentDefinition`: Stabile Komponenten-ID, benannte Parts, kontrollierte Werte, Behavior-/Semantik-Verträge, erlaubte Events und getrennte Renderrezepte | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-02 | `FlowDefinition`: Zustandsgraph, Guards, referenzierte Aktionen, URL-Projektion und Invarianten | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-03 | `defineComponent` / `defineFlow`: Typisierte Definition und Validierung dieser Verträge | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-04 | `createFluidRuntime`: Erzeugt eine isolierte Runtime; nimmt Renderer-, Daten-, Router-, Clock-, Policy- und Trace-Adapter entgegen | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-05 | `FluidProvider` / `useFluid`: React-Integration ohne parallelen fachlichen State | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-06 | `RuntimeSnapshot`: Fachzustand, Datenreferenzen, Entwürfe, fachliche Auswahl, Modus und Domain-Revision; keine GPU-Objekte und keine Hover-/Fokus-Kopie | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-07 | `InteractionSnapshot`: Transienter Fokus, Hover, Pressed und IME-Composition; eigene Benachrichtigung ohne Änderung der Domain-Revision | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-08 | `PartDefinition`: Component-ID, Partname, Behavior, zugänglicher Name/Beziehungen und Renderrezept; Rollen werden nicht aus der Form geraten | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-09 | `ChangeDetails`: Serialisierbare Quelle/Reason plus synchrone Cancel-Möglichkeit für den Host; kein DOM-Event im Core | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-10 | `PresentationState`: Vorherige/aktuelle visuelle Projektion, Übergangsphase, Dauer und Fortschritt; keine fachliche Wahrheit | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-11 | `RuntimeEvent`: Event-ID, Quelle, Typ, Zeit, Payload und Bezug auf die erwartete Revision | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-12 | `DecisionPlan`: Vorschlags-ID, Snapshot-/Policy-Version, Ablaufzeit, erlaubte Zielaktionen und kurze Erklärung | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-13 | `DataAdapter`: Validierte lesende Abfragen, AbortSignal, Quellenmetadaten, Version und Aktualität | Teilweise · Neue öffentliche Adapterfabriken mit Zod-Verträgen und geprüften Ausführungsgrenzen. Am 13.11.2026 Source-Delta für abbrechbare asynchrone Autorisierung geprüft; aktuelle Data-/Agent-/Core-Regressionssuite bestanden. Keine Erweiterung auf verteilte Persistenz oder produktive Hostfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [source: packages/core/src/data.ts](../packages/core/src/data.ts), [source: packages/contracts/src/data.ts](../packages/contracts/src/data.ts) | Vollständige Runtime-/Hostintegration, Providertransport und dauerhafte Idempotenz ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| ARCH-API-14 | `ActionAdapter`: Explizite fachliche Aktionen mit Berechtigung, Idempotenz und überprüfbarem Ergebnis | Teilweise · Neue öffentliche Adapterfabriken mit Zod-Verträgen und geprüften Ausführungsgrenzen. Am 13.11.2026 Source-Delta für abbrechbare asynchrone Autorisierung geprüft; aktuelle Data-/Agent-/Core-Regressionssuite bestanden. Keine Erweiterung auf verteilte Persistenz oder produktive Hostfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [source: packages/core/src/data.ts](../packages/core/src/data.ts), [source: packages/contracts/src/data.ts](../packages/contracts/src/data.ts) | Vollständige Runtime-/Hostintegration, Providertransport und dauerhafte Idempotenz ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| ARCH-API-15 | `RouterAdapter`: Parse, Serialize, Navigate, Prefetch und History-Abonnement | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-16 | `ScenarioDefinition`: Ausgangszustand, Datenreferenzen, Ereignisse, Fehlereinspielungen und erwartete Invarianten | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-17 | `CaseManifest`: Daten-/Action-Schemas, Flows, Komponenten, Szenarien und unterstützte Betriebsarten | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-18 | `VisualTransitionDefinition`: Quelle/Ziel-Projektion, Basismotion, optionale Effekt-Policy, Timing und Interruption-Regel; keine fachlichen Zwischenzustände | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-19 | `EffectDefinition`: Versioniertes Rezept, Parameter-Schema, kompatible Inhalte/Parts, Backend-/Feature-Anforderungen, Budget und Reduced-Motion-/Fallback-Rezept | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-20 | `EffectPolicy`: Aus, fest, seeded-random oder Case-Mapping; explizite Projekt-/Case-/Transition-Priorität | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-21 | `ResolvedEffectPlan`: Aufgelöste Rezept-ID/Version, Seed, Parameter, Quellen-/Zielrevision, Policy-Version und tatsächliche Capability-Entscheidung | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-22 | `TraceSink`: Versionierte Events mit Korrelation; Datenredaktion erfolgt vor Export und Persistenz | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| ARCH-API-23 | `StoryDefinition`: Versionierter Design-Brief, Medium/Modus, Daten-/Flow-/Szenarioreferenzen, Beats und erwartete Ergebnisse ohne parallelen Fachstate | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| ARCH-API-24 | `ThemeDefinition`: Kanonische versionierte Gestaltungsrollen, abgeleitete CSS-/GPU-Werte und ausdrücklich unterstützte Importtypen | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| ARCH-API-25 | `PresentationProjection`: Gemeinsame dargestellte Layout-/Clip-/Kameratransformation und inverse Zuordnung für Eingabe, Ziele und Semantik | Offen · Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme. | — | Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test. |
| ARCH-API-26 | `FrameCaptureManifest`: Framefolge mit Versions-/Zeit-/Backend-/DPR-/Event-/Scene-/Rezeptbezug, tatsächlicher Aufnahmeabdeckung und Artefaktreferenzen | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| ARCH-API-27 | `RehearsalReport`: Getrennte geometrische, visuelle, semantische und zeitliche Ergebnisse plus Review als versionierter Companion des bestehenden QualityReport | Offen · Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme. | — | Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test. |
| ARCH-API-28 | `AIReviewBundle`: Freigegebene ausgewählte pixelredigierte Bilder, Brief, begrenzte Metadaten und nachvollziehbarer Provider-/Budget-/Abdeckungsbezug | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| ARCH-API-29 | `AIReviewFinding`: Validierter Frame-/Part- oder Bildregionbezug, Kategorie, Begründung, Unsicherheit, Empfehlung und Herkunft ohne eigene Ausführungsrechte | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## CASES

Nachgewiesen im Scope: 0/7.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| CASE-01 | **Studio-Projektworkflow** / Tatsächliche Projektdateien, Szenarien und Runs / Öffnen → bearbeiten → validieren → ausführen → vergleichen → exportieren / Lokale Projektänderungen mit Revisionsprüfung | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| CASE-02 | **Immobilien** / Importierter realer Bestand oder Host-API / Suchen → filtern → vergleichen → Detail → Anfrage vorbereiten / Anfrage über Hostadapter; kein erfundener Versandstatus | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| CASE-03 | **E-Commerce** / Reeller Katalog mit Varianten, Preisen und Bestand / Suchen → Detail → Variante → Warenkorb → Checkout-Übergabe / Preis/Bestand erneut prüfen; Checkout im Testsystem oder Host | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| CASE-04 | **Reisebuchung** / Reale Angebote beziehungsweise gekennzeichnete Provideraufzeichnungen / Ziel/Datum → Angebote → Vergleich → Reisende → Quote → Buchungsübergabe / Ablaufende Angebote erneut validieren; keine behauptete Buchung ohne Anbieterbestätigung | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| CASE-05 | **SaaS-Dashboard** / Echte Run-/Produktmetriken / Übersicht → Drilldown → Widget anpassen → speichern → zurücknehmen / Nur freigegebene Layoutänderungen | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| CASE-06 | **Content/CMS und Landingpage** / Importierte Inhalte und reale Ressourcen / Lesen → Varianten vergleichen → Vorschlag prüfen → Vorschau → Hostübergabe / Original erhalten; keine automatische Veröffentlichung | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |
| CASE-07 | **Analyse-/Designworkflow** / Reale importierte Datensätze und Projektszenen / Import → validieren → analysieren/layouten → Ergebnis → exportieren / Typisierte Handler; kein universeller Grafikeditor als versteckte Zusatzanforderung | Offen · Vollständiger Planumfang | — | Implementierung und vollständiger Nachweis fehlen. |

## M2

Nachgewiesen im Scope: 0/9.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M2-AC01 | Nur Paketmanifeste und TypeScript-Quellen des aktuellen Workspace lesen; Herkunft und Zeitpunkt anzeigen; keine erfundenen Leistungszahlen | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M2-AC02 | Name, Quelldateien und Dependencies auf-/absteigend; stabile IDs und deterministischer Tie-Break; aria-sort nur auf aktiver Spalte | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M2-AC03 | Kontrollierter Suchwert; leere Ergebnisse mit Reset; Filter-/Sortierzustand bleibt beim Viewwechsel erhalten | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M2-AC04 | Dieselben Module bewegen sich zwischen Tabelle, Karten und Dependency-Map; ausgewähltes Modul entfaltet sich zum Detail; Unterbrechung vom aktuellen Bild | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M2-AC05 | Table → Row → Header/Cell als echte unsichtbare Semantik; Header-Buttons per Tastatur; keine implizite Rolle aus Renderform | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M2-AC06 | Deklarative Feldzuweisungen gemeinsam mit Transition committen; Projektionen validieren Events, Bindings, IDs und Semantikreferenzen | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M2-AC07 | View, Sortierung und Modul-ID validiert; Reload/Back/Forward; Suchtext bleibt lokal; keine Action beim Restore | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M2-AC08 | Responsive Scene- und Brücken-Bounds; deterministische Interpolation; getrennte Presence; WebGPU-Retry aus erhaltenem Domain-Snapshot | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M2-AC09 | Typecheck/Lint/Unit-/Property-Tests/Build; Browserprüfung von Sortierung, Suche, drei Views, Detail und History; Screenshots nach Verbesserung | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |

## M3

Nachgewiesen im Scope: 0/9.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M3-AC01 | Keine Peer-Overrides, keine TypeScript-Operator-Erweiterung, reproduzierbarer Build. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M3-AC02 | Reale Shape-Referenzwerte und GPU-/CPU-Vergleich mit dokumentierter f32-Toleranz. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M3-AC03 | Fixed/Random/Case/Off, Priorität, Seed-Variation, Inkompatibilität und Version geprüft. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M3-AC04 | Ein aufgezeichneter Run verwendet dieselbe Rezeptauswahl bei Replay. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M3-AC05 | Domainzustand, Daten und Fokus werden nicht zu Effektphasen umdefiniert. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M3-AC06 | Tatsächliches Backend und aktiver Shaderpfad sind im Studio sichtbar. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M3-AC07 | Showcase und Studio bleiben bei Rezept, Modus und Seed synchron; die GPU-Leiste funktioniert mit Pointer und Tastatur auch bei 320 px Surface-Breite. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M3-AC08 | Resource- und Device-Lifecycle bleiben beim Surface-Owner. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M3-AC09 | Keine pauschale Behauptung von Performance-, Accessibility- oder Produktionsreife. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |

## M4

Nachgewiesen im Scope: 0/6.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M4-AC01 | **T43 – statische Integration:** 0.9.0 exakt als Dev-Abhängigkeit, geprüfte Integrität im Lockfile; deutsches/Headless-Profil mit begründeten Grenzen. `check:design` erzeugt einen schema-validierten Bericht ohne Count-Baseline. Qualifizierte Fehler blockieren, ungeprüfte Designkonventionen bleiben Hinweise. Kontrollfälle decken neue Fehler, deutsche Labels und zulässiges Styling ab. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M4-AC02 | **T19 – gemeinsamer Vertrag:** Zod definiert QualityReport und Teilprüfungen. Statische Regeln, DOM, GPU, Semantik und Screenshot haben eigene Abdeckung und Befunde. Nicht geprüft/unsupported ist nie bestanden. Quelle, Build, Backend, Breite, Phase sowie Node-/Dateibezug bleiben exportierbar. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M4-AC03 | **T19/T43 – Studio:** „UI-Qualität“ führt die Laufzeitprüfungen aus und zeigt statische Ergebnisse desselben Builds getrennt. Kein Node-Prüfer im Client, kein initiales Client-Fetching. Fehler/fehlende Artefakte werden sichtbar. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M4-AC04 | **T42 – anschließende Planfortsetzung:** native Studio-Controls gezielt konsolidieren und Frequenz localegerecht formatieren; technische View-IDs erhalten eigene lokalisierte Labels. Verhalten, Keyboard und URLs bleiben erhalten. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M4-AC05 | **T05/T06/T07 – belastbare Grenzen:** Laufzeitbefunde zu Textlesbarkeit, DOM-Überbreite/Clipping und Namen/Zuständen der Semantik ergänzen. Bei nicht belegbarem Kontrast, IME, Screenreader oder Motion wird das offen ausgewiesen. Proportional verkleinertes Replay erhält einen Lesbarkeitshinweis statt eines uneingeschränkten grünen Ergebnisses. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |
| M4-AC06 | **Abnahme:** unabhängige Negativ-/Regressionstests, strict Check, Build, Plan-/Mermaidprüfung; echter Browserlauf in schmaler/breiter Ansicht und beiden Backends. Neue Screenshots öffnen, Export prüfen, Browser offen lassen. | Teilweise · Milestone-Vertrag | — | Nachweise dieses Milestones mit jedem Teilkriterium abgleichen. |

## M1

Nachgewiesen im Scope: 0/8.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M1-AC01 | Echte WebGPU-Surface mit Text, kontrollierter Eingabe und Morphing. | Teilweise · Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [document: docs/milestones/m1.md](milestones/m1.md), [artifact: docs/milestones/m1-base-ui.jpg](milestones/m1-base-ui.jpg) | Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M1-AC02 | Reale Projektidentität aus dem Workspace-Manifest; echte Flow-Schemavalidierung. | Teilweise · Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [document: docs/milestones/m1.md](milestones/m1.md), [artifact: docs/milestones/m1-base-ui.jpg](milestones/m1-base-ui.jpg) | Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M1-AC03 | Abspielen, Pause, Schritt, Reset, Ergebnis und Detailansicht. | Teilweise · Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [document: docs/milestones/m1.md](milestones/m1.md), [artifact: docs/milestones/m1-base-ui.jpg](milestones/m1-base-ui.jpg) | Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M1-AC04 | Explizite Component-/Part-/Behavior-Verträge im Anatomy-Inspector. | Teilweise · Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [document: docs/milestones/m1.md](milestones/m1.md), [artifact: docs/milestones/m1-base-ui.jpg](milestones/m1-base-ui.jpg) | Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M1-AC05 | Fachwerte im Core, Fokus/Hover/Pressed/IME in einem separaten Interaktionsstore, Präsentationsphase und Transition-Dauer im Renderer. | Teilweise · Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [document: docs/milestones/m1.md](milestones/m1.md), [artifact: docs/milestones/m1-base-ui.jpg](milestones/m1-base-ui.jpg) | Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M1-AC06 | Base UI 1.9.0 für Studio-Buttons, Tabs und Info-Dialog. Keine Base-UI-Abhängigkeit in Contracts, Core oder WebGPU. | Teilweise · Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [document: docs/milestones/m1.md](milestones/m1.md), [artifact: docs/milestones/m1-base-ui.jpg](milestones/m1-base-ui.jpg) | Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M1-AC07 | Synchron abbrechbare Change Requests; Reason im Trace; Guards bleiben vorrangig. | Teilweise · Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [document: docs/milestones/m1.md](milestones/m1.md), [artifact: docs/milestones/m1-base-ui.jpg](milestones/m1-base-ui.jpg) | Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M1-AC08 | Logisches Replay und CLI-Vertragsprüfung als erste Testbausteine. | Teilweise · Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [document: docs/milestones/m1.md](milestones/m1.md), [artifact: docs/milestones/m1-base-ui.jpg](milestones/m1-base-ui.jpg) | Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## M5

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M5-AC01 | Alle T01–T49, zusätzliche Milestone-Verträge und übergreifende Releasegates erhalten stabile AC-IDs, unveränderten Quelltext, Status, Scope und Nachweis. | Teilweise · Historischer Prüflauf bis 14.11.2026. Am 13.11.2026 auf 476 kanonische Kriterien geprüft. Matrixheader/-links auf M1–M8 aktualisiert; Parser-/Registertests prüfen fehlende/duplizierte AC, veränderten Normtext, fehlende/beeinträchtigte Evidenz. Reine Register-/Quellenqualifikation, keine neue Produktabnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/acceptance.test.ts](../tests/unit/acceptance.test.ts), [source: scripts/acceptance-validation.ts](../scripts/acceptance-validation.ts) | Offene Produktkriterien werden dadurch nicht automatisch abgenommen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M5-AC02 | Status: verifiziert, implementiert/unverifiziert, teilweise, offen oder externer Nachweis erforderlich. Ein Testdateipfad allein ist keine Messung auf Zielhardware. | Teilweise · Historischer Prüflauf bis 14.11.2026. Am 13.11.2026 auf 476 kanonische Kriterien geprüft. Matrixheader/-links auf M1–M8 aktualisiert; Parser-/Registertests prüfen fehlende/duplizierte AC, veränderten Normtext, fehlende/beeinträchtigte Evidenz. Reine Register-/Quellenqualifikation, keine neue Produktabnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/acceptance.test.ts](../tests/unit/acceptance.test.ts), [source: scripts/acceptance-validation.ts](../scripts/acceptance-validation.ts) | Offene Produktkriterien werden dadurch nicht automatisch abgenommen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M5-AC03 | Änderungen am kanonischen AC-Text werden erkannt. Fehlende Einträge, tote Nachweise und verifizierte Kriterien ohne Evidenz lassen den Checker fehlschlagen. | Teilweise · Historischer Prüflauf bis 14.11.2026. Am 13.11.2026 auf 476 kanonische Kriterien geprüft. Matrixheader/-links auf M1–M8 aktualisiert; Parser-/Registertests prüfen fehlende/duplizierte AC, veränderten Normtext, fehlende/beeinträchtigte Evidenz. Reine Register-/Quellenqualifikation, keine neue Produktabnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/acceptance.test.ts](../tests/unit/acceptance.test.ts), [source: scripts/acceptance-validation.ts](../scripts/acceptance-validation.ts) | Offene Produktkriterien werden dadurch nicht automatisch abgenommen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M5-AC04 | Die Feature-Matrix verlinkt auf den AC-Abgleich. Ein Proof bleibt ein Proof; nur eine vollständig belegte AC-Menge erlaubt die entsprechende Abnahme. | Teilweise · Historischer Prüflauf bis 14.11.2026. Am 13.11.2026 auf 476 kanonische Kriterien geprüft. Matrixheader/-links auf M1–M8 aktualisiert; Parser-/Registertests prüfen fehlende/duplizierte AC, veränderten Normtext, fehlende/beeinträchtigte Evidenz. Reine Register-/Quellenqualifikation, keine neue Produktabnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/acceptance.test.ts](../tests/unit/acceptance.test.ts), [source: scripts/acceptance-validation.ts](../scripts/acceptance-validation.ts) | Offene Produktkriterien werden dadurch nicht automatisch abgenommen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## M6

Nachgewiesen im Scope: 0/9.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M6-AC01 | Die fünf Beats führen gültige Runtime-Events auf tatsächlich gelesenen Workspace-Daten aus und besitzen sichtbare Ursachen. | Teilweise · M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M6-AC02 | Modul-IDs, fachliche Daten und Sortierung bleiben bis zum ausdrücklich gezeigten Reset konsistent, ohne externe Mutation oder parallelen Demo-Fachstate. | Teilweise · M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M6-AC03 | Anfang, Ergebnis und kompakte Komposition bestehen die Prüfung bei 320/390/768/1280 px, mit separat erfasster Surfacebreite und lesbaren Produktrollen. | Teilweise · M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert. | [artifact: docs/qa/2026-11-02-openai/verification.json](qa/2026-11-02-openai/verification.json), [artifact: docs/qa/2026-11-02-openai/final-layout-matrix.json](qa/2026-11-02-openai/final-layout-matrix.json) | Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M6-AC04 | Die verwendeten DOM- und GPU-Rollen stammen aus derselben Tokenversion und behalten die bestätigte Fluid-Identität. | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M6-AC05 | Eine vollständige erfasste Bildfolge einschließlich Unterbrechung, Pause/Replay und optional Loop plus nächstem Anfang ist mit Frame-/Event-/Rezeptbezug prüfbar, Lücken bleiben inconclusive. | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M6-AC06 | Tatsächliche Glyphen, Pixel, native Semantik und Echtzeit-Pacing werden getrennt geprüft, fehlende Abdeckung oder ein sauberer Kontaktbogen allein erzeugen kein bestandenes Gesamtgate. | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M6-AC07 | WebGPU ist Standard und das tatsächliche Backend sichtbar, WebGL2-Capture und nicht unterstützte Fähigkeiten besitzen einen eigenen qualifizierten oder offenen Status. | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M6-AC08 | Der fertige M6-Lauf wird in Echtzeit und an kritischen Einzelbildern visuell geprüft und mit Brief, Vergleich, Befunden, Ausnahmen und offenen Gates übergeben. | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M6-AC09 | Das Studio bietet Design-, Layout-/Semantik-, Motion-, Vergleichs- und AI-Reviewansichten mit Frame-/Partbezug, ein fehlender Modellzugang bleibt ausdrücklich nicht konfiguriert und erfüllt nicht die produktive T58-Abnahme. | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## PROVIDER

Nachgewiesen im Scope: 0/4.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| PROVIDER-AC01 | Alle Dateien bestehen dieselben Zod-Verträge wie Adapterergebnisse; doppelte IDs, falsche Provenienz und ungültige Datumsbereiche werden abgewiesen. | Teilweise · Drei ausdrücklich synthetische Dateien und ausgeführte Case-/Adaptertests; 54 Endzustände und 60 Phasen im aktuellen Chromium. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/data.test.ts](../tests/unit/data.test.ts), [test: tests/unit/simulation.test.ts](../tests/unit/simulation.test.ts) | Keine produktive Daten-/Anbieter-/Transaktionsfreigabe. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| PROVIDER-AC02 | Suche, Sortierung, Verfügbarkeit, Abbruch, überholte Ergebnisse und Revalidation werden unabhängig von einem Anbieter getestet. | Teilweise · Drei ausdrücklich synthetische Dateien und ausgeführte Case-/Adaptertests; 54 Endzustände und 60 Phasen im aktuellen Chromium. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/data.test.ts](../tests/unit/data.test.ts), [test: tests/unit/simulation.test.ts](../tests/unit/simulation.test.ts) | Keine produktive Daten-/Anbieter-/Transaktionsfreigabe. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| PROVIDER-AC03 | Eine gekennzeichnete Simulation beweist die UI-/State-/Adapterverträge. Sie erfüllt kein AC für einen produktiven Anbieterzugang, aktuelle Marktpreise oder echte Buchungen. | Teilweise · Drei ausdrücklich synthetische Dateien und ausgeführte Case-/Adaptertests; 54 Endzustände und 60 Phasen im aktuellen Chromium. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/data.test.ts](../tests/unit/data.test.ts), [test: tests/unit/simulation.test.ts](../tests/unit/simulation.test.ts) | Keine produktive Daten-/Anbieter-/Transaktionsfreigabe. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| PROVIDER-AC04 | Jeder Live-Adapter benötigt separat Zugang, Mapping, Nutzungsrechte, Fehler-/Limit- Tests, Quote-/Bestandsprüfung und einen überprüfbaren Übergabe- oder Transaktionsnachweis. | Externer Nachweis nötig · Offizielle APIs recherchiert; kein produktiver Anbieterzugang konfiguriert. | [document: docs/research/provider-apis.md](research/provider-apis.md) | Freigegebenen Bestand/Store und Anbieterzugang bereitstellen; danach Mapping, Limits, Bestands-/Quoteprüfung und Transaktionsgrenze qualifizieren. |

## UI

Nachgewiesen im Scope: 0/29.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| UI-CHECK-01 | **UI-01 Textflächen:** Keine sichtbaren Glyphen überschneiden andere Texte, Controls oder zugehörige Textregionen. Tatsächliche Font-Messwerte prüfen, nicht nur nominale SceneNode-Rechtecke. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-02 | **UI-02 Inhalt:** Labels sind eindeutig; kein angrenzendes „Ziel Ziel“ oder widersprüchliche Zustandsanzeige. Endpunkte und Wiedergabestatus haben eigene Bedeutung. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-03 | **UI-03 Typografie:** Lesbare Schrift, kontrollierte Zeilenzahl und Line-height; kein zufälliger Wortumbruch in kurzen Controls, keine fehlenden Glyphen. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-04 | **UI-04 Resize und Zoom:** Schmale, mittlere und breite Container sowie Verkleinern/Vergrößern während eines Runs prüfen. Keine horizontale Seitenscrollbar oder abgeschnittene Timeline. Browser-Zoom und DPR gesondert nachweisen. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-05 | **UI-05 Ansichten:** Tabelle, Karten, Map, Detail sowie leere Suche und lange Inhalte prüfen. Header und Fußzeilen behalten Abstand, Dataset bleibt echt. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-06 | **UI-06 Übergänge:** Quelle, 25/50/75 % und Ziel pro Rezept prüfen. Bewegte Texte dürfen beim Kreuzen von Elementen nicht ineinander laufen. Retargeting, Pause/Fortsetzen, Replay und Live-Restore dürfen keine Geistertexte erzeugen. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-07 | **UI-07 Eingabe:** Pointer und Tastatur, Fokusdarstellung, ausgewählter Zustand, Suche, Sortierung und Back/Forward funktionieren nach Layoutänderungen. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-08 | **UI-08 Studio:** Eingeklapptes/aufgeklapptes Effekt-Studio, vier Auswahlmodi, Parameter und Timeline sind ohne Überlagerung bedienbar. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-09 | **UI-09 Backend:** Tatsächliches WebGPU und gekennzeichnetes WebGL2 prüfen; keine neuen Render-/Shaderfehler. Reduced Motion separat prüfen. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-10 | **UI-10 Abschluss:** Neue Screenshots lokal speichern und öffnen; Befunde mit Breite, Ansicht, Rezept und Phase dokumentieren. Offene Checks ausdrücklich benennen. | Teilweise · Aktueller M5-Übergabeumfang; Bilder geöffnet und geprüft, statische/DOM-/GPU-/Semantiknachweise und offene Prüfungen getrennt ausgewiesen. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Weitere Produkt-Supportprofile bleiben eigenständige Abnahmen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-11 | **UI-11 Designkonsistenz:** Typografie-/Farb-/Abstandsrollen, gemeinsame Controls, localegerechte Zahlen und eindeutig formulierte Aktionen prüfen. Deutsche Substantive und kuratierte Fluid-Effekte nicht durch fremde Stilregeln automatisch umschreiben. Kontrast, Schriftgröße und Ziele am sichtbaren Ergebnis messen. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-12 | **UI-12 Prüfgrenzen:** Statische DOM-Hinweise, berechnetes DOM-Layout, GPU-Glyphen, Semantik und Screenshots getrennt nachweisen. Nicht unterstützte Prüfungen ausdrücklich offen lassen; Ausnahmen präzise begründen. Null statische Befunde bedeuten keine Freigabe der Canvas-Inhalte. | Teilweise · Aktueller M5-Übergabeumfang; Bilder geöffnet und geprüft, statische/DOM-/GPU-/Semantiknachweise und offene Prüfungen getrennt ausgewiesen. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Weitere Produkt-Supportprofile bleiben eigenständige Abnahmen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-13 | **UI-13 Design-Brief:** Medium, Nutzerziel, Datenmodus, Referenz und drei bis fünf erklärbare Beats sind vor der Umsetzung benannt; die Oberfläche besitzt einen klaren Fokus. | Teilweise · M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-14 | **UI-14 Identität und Dichte:** Tokenrollen und eigene Assets passen zum Produkt; Tabellenwerte und Pflichtinformationen werden nicht durch dekorative Balken ersetzt. | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-15 | **UI-15 Komposition:** Anfang, Ergebnis und kompakte Ansicht sind im realen Host verständlich; Framing oder optionale Kamera schneiden keine operative Handlung ab. | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-16 | **UI-16 Zeitliche Evidenz:** Vollständige erfasste Folge, Ein-/Ausstiege, Retargeting und gegebenenfalls Loopnaht sind zugeordnet; Lücken sind inconclusive und kein Kontaktbogen ersetzt Einzelbildanalyse. | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-17 | **UI-17 Ruhe und Ursache:** Bewegungen referenzieren reale Events oder deklarierte Präsentationsaktionen; Poster, Reduced Motion, Nutzerübernahme und Leerlauf sind geprüft. | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-18 | **UI-18 Vergleich und Lernen:** Referenz/Kandidat werden unter gleichen Bedingungen mit konkreten Bildbelegen verglichen; wiederkehrende Ursachen besitzen gezielte Regressionen. | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-CHECK-19 | **UI-19 AI-Kritik:** Freigegebener Datenumfang, Pixelredaktion, Provider, Budget, Framebezug und Unsicherheit sind sichtbar; Empfehlungen und unabhängige harte Gates bleiben unterscheidbar. | Teilweise · Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-TASK-01 | Textregionen begrenzen und tatsächliche Glyph-Bounds auslesbar prüfen. Header, Unterzeile und Effektleiste sind disjunkt; Schrift bleibt in ihrer Region. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-TASK-02 | Timeline-Status und Endpunkt unterscheiden. „Ziel“ erscheint genau einmal im Transport; Anfang, Effektphase, Pause und Ende besitzen nachvollziehbare Labels. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-TASK-03 | Text-Choreografie: Quelltext ausblenden, Geometrie bewegen, Zieltext einblenden. Im bewegten Segment sind kreuzende Beschriftungen unsichtbar; statische Controls bleiben bedienbar. Logische Events und URL-Commit bleiben unverändert. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-TASK-04 | Breiten-/Ansichts-/Phasenmatrix mit Unit-/Property-Regressionen und tatsächlicher GPU-Textmessung prüfen. Bei Befunden erneut korrigieren und nachprüfen. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-TASK-05 | Ergebnis in T19/T43/T45 und dem QA-Bericht verlinken; Gesamtplan, Feature-Matrix und relevante Mermaid-Flows konsistent halten. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-RUN-01 | `npm run check:design` prüft das versionierte Studio-Profil und erzeugt das validierte Build-Artefakt. `npm run quality:gate` führt alle lokalen CI-Gates aus. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-RUN-02 | Im Studio „UI-Qualität“ öffnen, Zustand/Backend/Viewport wählen und prüfen. Den Report mit Build-ID exportieren. Nach Resize, Settings-, Ansichts- oder Studio-Layoutwechsel neu messen; alte Laufzeitbefunde werden verworfen. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-RUN-03 | Report, Screenshot und manuelle Abnahme verbinden. Vier offene Kategorien (zusammengesetzter Kontrast, Eingabe/AT-Journeys, Browser-Motion und Screenshot- Review) erhalten keine automatische Freigabe. Screenshot-Review erfolgt separat im QA-Bericht; der Prüfer bewertet seine eigene Ergebnisoberfläche nicht rekursiv. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-RUN-04 | Proportional verkleinertes Replay ausdrücklich auf Lesbarkeit prüfen. Geometrie ohne Kollisionen genügt bei sehr kleinen Schriften nicht zur Designfreigabe. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| UI-MATRIX-01 | Viewport: 320, 390, 550, 768, 1024 und 1440 px; Containerbreite separat erfassen. Ansichten: Table / Cards / Map / Detail; alle echten Module, leere Suche, Auswahl. Rezepte: Fluid Morph / Spring Reflow / Ripple Reveal / Basisbewegung. Phasen: Start, 25 %, 50 %, 75 %, Ende; Unterbrechung und Resize. Automatisierte Geometrieprüfungen ergänzen die Browsermessung. Screenshotprüfungen sind keine vollständige manuelle Screenreader-, IME- oder Hardwarefreigabe. | Teilweise · Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## M7

Nachgewiesen im Scope: 0/27.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M7-AC01 | Sechs eindeutig versionierte Rezepte besitzen gemeinsame Metadaten für Titel, Stil, Parameter, empfohlenes Preset und Ressourcenanforderungen. | Teilweise · Sechs versionierte Rezeptmetadaten mit Stil, Parametern, Ressourcenprofilen und empfohlenen Werten durch Resolver-/Schema- und Dokumentationstests geprüft; tatsächlich bedienbar in WebGPU und WebGL2. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC02 | Bestehende Rezeptversionen, Seed-Berechnung und gespeicherte Random-Pools bleiben unverändert interpretierbar; neue Rezepte werden bewusst in Pools aufgenommen. | Teilweise · Bestehende Versionen, Seeds und gespeicherte Random-Pools bleiben im Import-/Resolvertest erhalten; neue Rezepte werden bewusst aufgenommen. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC03 | Rezept-, Modus-, Seed- und Parameteränderungen verändern weder die fachliche Snapshotrevision noch den bereits laufenden aufgelösten Effektplan. | Teilweise · Domainrevision und laufender Plan bleiben bei Präsentationsänderungen in Runtime-/Komponententests unverändert; Browser-Effektwahl erzeugte keine neue URL. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC04 | Alle sechs Rezepte und Auswahlmodi sind bei 320/390/768/1280 px Browserbreite lesbar und erreichbar; tatsächliche Surfacebreite, Dockhöhe und Folgeinhalte benutzen eine konsistente Layoutberechnung ohne horizontale Überläufe. | Teilweise · Sechs Rezepte und Modi bei Browserbreiten 320/390/768/1280 lokal geprüft; tatsächliche Surfacebreiten 298/368/461/868. Metadaten aller Samples und originale Phasen zeigen lesbaren Dock ohne Überlauf. Responsive Desktopemulation, keine physische Mobilgerätefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC05 | Studio und Showcase benutzen dieselben Einstellungen; reine Rezeptwahl erhält individuelle Parameter und „Preset anwenden“ setzt die empfohlenen Werte ausdrücklich. | Teilweise · Studio und Showcase verwenden denselben VisualState. Tests prüfen Parametererhalt und ausdrückliche Presetübernahme; Dokumentationstabelle ist gegen Rezeptmetadaten geprüft. Vergleichssequenzen mit 1100 ms/65 % sind keine individuelle Presetqualifikation. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC06 | Silk Cascade bewegt zusammengehörige Parts mit gemeinsamer Phase auf ruhigen gestaffelten Bahnen, bewahrt ausgewählte Identität und ist visuell von Spring Reflow unterscheidbar. | Teilweise · Silk-Gruppen, gemeinsame Phase und Auswahlbezug rein geprüft; tatsächliche GPU-/GL2-Bildfolgen und getrennte Originalphasen-Review zeigen ruhige Staffelung statt Spring-Impuls. Lokaler Geräteumfang. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC07 | Liquid Lens erzeugt nachweisbare lokale Hintergrundbrechung mit organischer Kontur; sie liest nie aus einer gleichzeitig als Schreibziel gebundenen Textur. | Teilweise · Lokale Linsenbrechung in GPU-/GL2-Originalframes nachgewiesen; unabhängiges Capture-Target vermeidet Rückkopplung. 8-Punkt-GPU-Linsenkernelreadback und reale GLSL-Graphregression bestanden; Y-Inversionsfehler aus339 bleibt im Archiv. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC08 | Text, Fokus, Caret, aktive Eingabe und Effektsteuerung bleiben außerhalb der Linsenverzerrung und erhalten korrekte Überdeckung, Clipping und Lesbarkeit. | Teilweise · Lokaler Eingabe-/Lens-Proof: geschütztes Suchfeld, scharfe Labels, Auswahl/Caret und gemeinsames Clipping in tatsächlichen WebGPU-/WebGL2-Originalen geprüft; deklarierte JP-Probe sichtbar, Langtext am Anfang/Ende editierbar. Final81 ergänzt native100-Zeichen-Grenze aus Field-Vertrag. Schrift-/IME-/AT-Gesamtmatrix wird dadurch nicht freigegeben. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC09 | Particle Weave ordnet begrenzte instanzierte Fragmente stabilen Komponenten-IDs zu, übernimmt Themefarben, verwendet keine Schriftfragmente und hinterlässt am Ziel keine sichtbaren Partikel. | Teilweise · Particle-Instancing, deterministische IDs, Themefarben und Grenzen rein geprüft; GPU/GL2/kompakte Originalphasen zeigen ausschließlich Flächenfragmente und leere Ziel-Effektkanäle. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC10 | Jeder Sampler besitzt exakte Quell-/Zielendpunkte und liefert bei gültigen Parameterrändern ausschließlich endliche Werte und gültige Geometrie. | Teilweise · Exakte Endpunkte und finite Parameterränder durch Sampler-/Property-Tests; alle archivierten Sequenzen bestätigen Quell-/Zielgeometrie und leere Endeffekte. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC11 | Direkte und zufällige Seek-Reihenfolgen einschließlich 0 → 1 → 0,5 → 0 reproduzieren dieselbe Darstellung wie reguläre Wiedergabe am jeweiligen Zeitpunkt; entfernte Quellobjekte sind rekonstruierbar. | Teilweise · Sampler prüft beliebige Seekfolgen; tatsächliche Browserfolge 0→1→0,5→0 stellte den Quellzustand wieder her. Originale Anfangs-/Rückkehrbilder sind identisch. Bounded Clipcache hält Quellobjekte rekonstruierbar. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC12 | Unterbrechungen bei 25/50/75 % sowie wiederholte Unterbrechungen während des Abbaus erhalten den aktuellen sichtbaren Zustand ohne Geistertexte, veraltete Endpunkte oder wachsende Effektschichten. | Teilweise · 25 tatsächliche native Pointer-/Keyboard-/Historypaare des f706-Builds decken drei neue Effekte, beide Backends,25/50/75% und erneute Unterbrechung im Abbau ab. Struktur/C0/Revisionen bestanden;23 Quellenpaare rastergleich. Zwei aktuelle warme Wiederholungen behalten C0; vier aktuelle Originalbilder zeigen gleiche relative Panel-/Textanordnung ohne sichtbaren Quellenreset. Rasterdifferenzen bleiben ungeklärt und werden nicht als Byte- oder Materialgleichheit ausgegeben. Core/Sampler bleiben im finalen Build unverändert. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC13 | Bestehende VisualScenario-v2-Aufzeichnungen importieren unverändert; v3 exportiert/importiert auch unterbrochene Linsen-/Partikeldarstellung mit validierten Grenzen, Versionen und Referenzen ohne ausführbaren Code. | Teilweise · v2-Normalisierung, v3-Roundtrip unterbrochener Darstellungen, Versions-/Referenzgrenzen und geschützte IDs rein geprüft; Studio-Diagnosen verwenden denselben validierten Importvertrag ohne ausführbaren Code. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC14 | Dekorative Effekte erzeugen keine Pointer-/Tastaturziele; ausgeblendete oder verdeckte Controls sind keine unsichtbaren Pointerziele und Fokus-, Auswahl-, Texteingabe- und IME-Verhalten bestehen im vorhandenen Eingabe-Proof. | Teilweise · Im vorhandenen lokalen Proof: occlusion-aware Hit-Test, Fokus/Selection, scharfer Langtext, Clipboard und deklarierte JP-Glyphen geprüft. Derselbe manuelle OS-Dead-Key-Lauf liefert â statt ^a, trusted Kompositionsbeginn/Input mit aktivem Core-Schutz und korrektes funktionales Commit/Fokus. Ende beobachtet untrusted; Zähler vollständig trusted Zyklen bleibt0. Keine japanische Kandidaten-, andere IME-, AT-,Touch- oder Mobile-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC15 | Sortierung, Suche, Auswahl, Daten-IDs, Navigation und Back/Forward bleiben konsistent; Effektparameter erzeugen keine History-Einträge und Replay führt keine fachlichen oder externen Mutationen aus. | Teilweise · Reale Workspace-Journey mit tatsächlichen Manifestabhängigkeiten: Auf/Ab-Sortierung, stabile IDs, Suche, Auswahl/Views, native History, Deep-Link/Reload konsistent. Effektwahl erhält URL/Domainrevision; Replay ist readonly mit0 editierbaren Textboxes, Live stellt Entwurf wieder her. Der f0-History-Stale-Clipfehler ist korrigiert und native f706-Paare bestanden. Finaler Core bleibt hashgleich; produktive Anbietertransaktionen sind nicht Teil dieser lokalen Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC16 | Reduced Motion erzeugt unmittelbar das vollständige gültige Ziel ohne Zusatzeffekt; Nutzerübernahme, Pause und verborgenes Dokument führen nicht zu unkontrollierter Bewegung. | Teilweise · Final81 in lokalem Chrome/WebGPU: echte DevTools-Mediawechsel setzen laufende Lens sowie neue Silk-/Lens-/Particle-Ziele unmittelbar auf100%/idle ohne FX.21 exportierte Beobachtungen belegen Pause bei Hidden(4,122s) und angehaltene laufende Uhr bei Hidden(9,146s) mit identischem Frame/Fortschritt; nach Visible regulärer Abschluss. Native Tour-Sortübernahme stoppt die Führung. Präferenz zuletzt zurückgesetzt; kein OS-/Allbrowsernachweis. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC17 | Die neuen Effekte verwenden das vorhandene Device und den zentralen Surface-Scheduler; Endzustände rendern ohne begründeten Bedarf keine zusätzlichen Frames. | Teilweise · Sequenz- und Diagnosezähler bestätigen eine Surface/ein Backenddevice, keine zusätzlichen Jobs, keine ausstehenden Frames im ruhenden Endzustand. Effekte verwenden den bestehenden Scheduler. Lokaler Scope. Im finalen d9-Build blieb ein gesetzter WebGPU-Cards-Endzustand über 43 Sekunden bei 16 Frames; kein Hintergrundtab-/Alle-Modi-Nachweis. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC18 | Das pro Run eingefrorene Standardprofil begrenzt Partikel auf 2.048 und zwei Render Targets auf jeweils maximal 2.048 Pixel je Kante; das Kompaktprofil begrenzt sie auf 512 beziehungsweise 1.024 Pixel und reduziert nicht die normale GPU-Textauflösung. | Teilweise · Standard/Kompaktbudgets sowie eingefrorene Profile rein und anhand tatsächlicher Sequenzen geprüft; maximal 2048/512 Partikel und Targets mit 2048/1024 Kanten. Geschützter Text bleibt in voller Surfaceauflösung. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC19 | Nach 100 Wiederholungen mit Replay, Unterbrechungen und Disposal wächst der Ressourcenbestand nach Aufwärmen nicht dauerhaft; neue Targets, Buffer und Jobs haben überprüfbare Besitzer und werden auch bei Fehlern freigegeben. | Teilweise · Final81: je tatsächlichem Backend100 neue imperative Surfaces, alle drei Rezepte je Zyklus und Disposal im laufenden Effekt; je fünf reale Sonderfälle einschließlich Init-Abort, Fontfehler, kontrolliertem Device-/Contextverlust und Wiederherstellung. Verwaltete Ressourcen/Jobs ohne Rest; historische Replay-/100-Retarget-Plateaus bleiben separat Build2006 zugeordnet. Kein Prozess-/Treiberspeicher oder allgemeiner React-Mountclaim. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC20 | WebGPU und erzwungenes WebGL2 werden separat geprüft; das tatsächliche Backend, ausgewähltes und verwendetes Rezept sowie begründete Reduktionen sind sichtbar, nicht unterstützte Kombinationen werden nicht als bestanden ausgegeben. | Teilweise · WebGPU und erzwungenes WebGL2 separat erfolgreich aufgenommen und Originalphasen geprüft; Backend/Rezept/Version/Profil sichtbar zugeordnet. Shader-/Devicefehler brechen Prüfung ab.Build-339-GLSL-Fehler bleibt ausdrücklich negativer historischer Nachweis. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC21 | Tabelle ↔ Karten, Karten ↔ Map und Karten ↔ Detail bestehen Start-/25-/50-/75-/Endprüfungen sowie Resize und die Größenmatrix ohne Textüberschneidungen, Geistertexte, redundante Statuslabels oder abgeschnittene Controls; die drei ursprünglichen Rezepte bleiben Regressionen. | Teilweise · Final81:144 Fälle(3 Rezepte×6 Richtungen×4 tatsächliche Browserbreiten×2 Backends),720 Kontrollbilder/288 Endpunkte validiert. Originalbildreview über nachgewiesene Bildidentität und neue Textänderungsprüfung. Sechs native Resize-Journeys1280→390→768 erhalten Cards/IDs und anschließendes Table-Hit-Target;50%-Seek ist CUA-Handlungsbeobachtung, nicht gespeicherte JSON-Progressmessung. Sechs alte Rezept/Backendregressionen mit12 Originalbildern bestanden; keine physische Mobil-/Hardwarefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC22 | Vollständige deterministische Bildfolgen der drei Vorführungen besitzen Frame-/Zeit-/Build-/Backend-/Seed-/Rezeptbezug und eine Vollständigkeitsprüfung; fehlende Frames bleiben inconclusive und einzelne CapturedFrames werden nicht als Vollsequenz umgedeutet. | Teilweise · Build 2006 enthält 12 vollständige verlustfreie Bildfolgen mit 67 Frames, Zeit/Build/Backend/Seed/Rezept und Vollständigkeitscheck. Sekundäre und Patchläufe mit nur Metadaten+fünf Originalbildern sind ausdrücklich keine Vollarchive; Tests erkennen fehlende Frames. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC23 | Ein separater Echtzeitlauf dokumentiert Gerät, Browser, Viewport und P95-Framezeit gegen das Desktopziel 16,7 ms; langsames Screenshot-Sampling ist kein FPS-Nachweis und nicht bestandene Profile bleiben offen. | Teilweise · Historischer Build2006 vom3.November: Separater warmer Echtzeitlauf je drei Effekte×zwei Backends auf Apple M5 Max/macOS 27.2/Codex-IAB: P95 8,4–8,9 ms, Maximum 9,1–16,7 ms, null Intervalle >50 ms bei 868×1136. Browserversionsnummer nicht offengelegt; Startabstand ausgelassen, keine GPU-Timestamps oder allgemeine FPS-Zusage. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC24 | M7a zeigt die vier beschriebenen Stationen mit tatsächlichen Workspace-Daten auf Desktop und schmaler Ansicht, erlaubt jederzeit Übernahme und separate Wiederholung und wird im geöffneten Codex-Browser als Zwischenstand übergeben. | Teilweise · M7a mit tatsächlichen gefilterten Workspace-Daten auf Desktop und 390 px durchgelaufen, endete in Map und stellte vorherige Einstellungen wieder her. Nutzerübernahme und einzelne Wiederholung bedienbar; Browser bleibt geöffnet. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC25 | Feature-Matrix, Tasks, AC-Register, Mermaid-Flows, README und beide OKF-Bundles beschreiben denselben nachgewiesenen Umfang; M7-Kriterien werden vom kanonischen Parser erfasst und bestehende offene Gesamtplangates nicht pauschal hochgestuft. | Teilweise · 435 kanonische Kriterien einschließlich 27 M7, Feature-/Taskmatrix, Flows und beide OKF-Bundles werden aus denselben Quellen erzeugt. Historische Nachweise und offene Gesamtplangates bleiben getrennt. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC26 | Neue Aufzeichnungen und Qualitätsartefakte übernehmen die bestehenden Redaktions-/Sensitivitätsgrenzen; vertrauliche Inhalte werden nicht durch den Darstellungssnapshot oder Sequenzexport zusätzlich offengelegt. | Teilweise · Final81:26 tatsächliche Captureproben auf beiden Backends über sensible Quelle/Ziel/Unterbrechung; private Bilder blockiert und V3-Text/Label redigiert, öffentlicher Endpunkt danach capturierbar. Unabhängige Originalberichtprüfung findet keine synthetischen Rohmarker oder sensiblen Textexporte. Produktive Capture-/Downloadgrenzen qualifiziert; kein Schutz vor OS-Screenshots und keine zusätzliche Server-/Rollenfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| M7-AC27 | ai-design-check bleibt auf seine unterstützten Prüfungen begrenzt und optionale AI-Kritik läuft über Vercel AI SDK; Empfehlungen ersetzen keine deterministischen, manuellen oder Hardwaregates und ihre Abdeckung bleibt sichtbar. | Teilweise · Final81: ai-design-check prüft28 unterstützte DOM-Quelldateien ohne Fehler/Warnungen. Optionale AI-Analyse verwendet unverändert Vercel AI SDK;267 Tests enthalten Provider-/Revisions-/Freigabegrenzen. Kein neuer Live-AI-Aufruf, menschliches Review oder erweiterter Hardwareclaim. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T59

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T59-AC01 | Für Tabelle, Auswahlcontrol, Karte, Map-Knoten und Inspector sind Parts, Rollen, Namen, Fokusregeln, Keyboard-/Pressverhalten und kontrollierte Werte benannt. Ein Tabellenlabel oder dekoratives Element wird nicht implizit zum Button | Teilweise · Historischer Prüflauf bis 14.11.2026. Deklarative Anatomy und getrennte Besitzer für fachliche IDs, Interaktion und Selection-Anker sind im Core-/Workspace-Vertrag und gezielten Tests belegt. Dies ist keine Screenreader-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/component-definition.test.ts](../tests/unit/component-definition.test.ts), [test: tests/unit/collection.test.ts](../tests/unit/collection.test.ts), [test: tests/unit/core-collection.test.ts](../tests/unit/core-collection.test.ts), [source: packages/contracts/src/components.ts](../packages/contracts/src/components.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T59-AC02 | Fachliche Mehrfachauswahl verwendet stabile Modul-IDs. Fokus, Selection-Anker und sichtbare Reihe besitzen ausdrücklich getrennte Bedeutungen und Besitzer | Teilweise · Historischer Prüflauf bis 14.11.2026. Deklarative Anatomy und getrennte Besitzer für fachliche IDs, Interaktion und Selection-Anker sind im Core-/Workspace-Vertrag und gezielten Tests belegt. Dies ist keine Screenreader-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/component-definition.test.ts](../tests/unit/component-definition.test.ts), [test: tests/unit/collection.test.ts](../tests/unit/collection.test.ts), [test: tests/unit/core-collection.test.ts](../tests/unit/core-collection.test.ts), [source: packages/contracts/src/components.ts](../packages/contracts/src/components.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T59-AC03 | Ein ausführbarer Fehlfall weist unbekannte Partreferenzen, fehlende Namen, unzulässige Aktionen und doppelte IDs ab. Ein gültiger Vergleichsfall wird akzeptiert | Teilweise · Historischer Prüflauf bis 14.11.2026. Zod-/Referenzvalidierung weist ungültige Parts, Namen, Actions und IDs ab; serialisierbare Verträge und First-party-Clientgrenze sind geprüft. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/component-definition.test.ts](../tests/unit/component-definition.test.ts), [test: tests/unit/client-import-boundary.test.ts](../tests/unit/client-import-boundary.test.ts), [source: packages/contracts/src/components.ts](../packages/contracts/src/components.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T59-AC04 | Für jeden vorgeschlagenen SDK-Import sind öffentliche API, Version, Lizenz, transitive Abhängigkeiten und DOM-/Servergrenzen dokumentiert. Ein interner `/renderer`-Import zählt nicht als bestandene öffentliche Integration | Teilweise · Historischer Prüflauf bis 14.11.2026. Vier tatsächlich verwendete öffentliche SDK-Importpfade, installierte Pins, Lizenzdateien, Lockfile-Transitivität sowie DOM-/Servergrenzen sind konsolidiert und per Exportimport geprüft. Node-headless Selection und initiales SSR sind ausgeführt; keine First-party-Nutzung privater Renderer-/Agentmodule. Interne Supplier-Rendererabhängigkeiten werden ausdrücklich genannt. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/collection.test.ts](../tests/unit/collection.test.ts), [test: tests/unit/client-import-boundary.test.ts](../tests/unit/client-import-boundary.test.ts), [document: docs/research/vercel-ui-sdk.md](research/vercel-ui-sdk.md), [source: packages/contracts/src/components.ts](../packages/contracts/src/components.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T59-AC05 | Zod-Schemas sind Quelle der serialisierbaren Types. Kein DOM-, GPU- oder Providerobjekt gelangt in gespeicherte Komponenten- oder Fachzustandsdaten | Teilweise · Historischer Prüflauf bis 14.11.2026. Zod-/Referenzvalidierung weist ungültige Parts, Namen, Actions und IDs ab; serialisierbare Verträge und First-party-Clientgrenze sind geprüft. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/component-definition.test.ts](../tests/unit/component-definition.test.ts), [test: tests/unit/client-import-boundary.test.ts](../tests/unit/client-import-boundary.test.ts), [source: packages/contracts/src/components.ts](../packages/contracts/src/components.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T60

Nachgewiesen im Scope: 0/6.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T60-AC01 | Stabile Part-IDs, Bounds, Clipbereich, Z-Reihenfolge, Sichtbarkeit und gültige Transformation/Inverse werden einmalig definiert. GPU und Brücke rechnen keine unabhängigen Platzierungen aus Fensterkoordinaten nach | Teilweise · Historischer Prüflauf bis 14.11.2026. Ein Core-Layout löst Parts, Bounds, Clips, Layer und Transform/Inverse auf; GPU und Semantik projizieren diese Geometrie. Validierung und Regression x900/w240/Viewport1000→84px sind ausgeführt; kein unabhängiger DOM-/GPU-Fachlayoutpfad. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/component-definition.test.ts](../tests/unit/component-definition.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T60-AC02 | In Tabelle, Karten und Map stimmen sichtbare Ziele und native Ziele bei Resize, Clipgrenzen und DPR-Wechsel innerhalb der vorab benannten Messgenauigkeit überein | Teilweise · Historischer Prüflauf bis 14.11.2026. Lokale Achtlaufmatrix: 144 Fälle/720 Phasen, maximale DOMRect-/Präsentationsabweichung 0,007812 CSS-px bei vorab 1px Toleranz. Ergänzende tatsächliche DPR1→DPR2-Läufe beider Backends prüfen 36 Fälle/180 weitere Phasen. Resize und Clipgrenzen sind zusätzlich in Core-/DOM-Brückentests belegt. Browserbreite und Surfacegröße bleiben getrennt; keine zusätzliche Gerätefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/collection-bridge.test.ts](../tests/unit/collection-bridge.test.ts), [test: tests/unit/m8-qualification.test.ts](../tests/unit/m8-qualification.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T60-AC03 | Ausgeblendete, austretende oder durch eine höhere Fläche verdeckte Controls besitzen keine unsichtbare aktive Trefferfläche. Ein dekorativer Linsen-/Partikelpart erhält keine Interaktion | Teilweise · Historischer Prüflauf bis 14.11.2026. Ausgeführte Tests der echten Pointer-Hitlogik und React-Semantikbrücke sperren Hidden-/Exiting-/Disabled-/Occlusion- und geclippte Ziele; dekorative Aktionslosigkeit bleibt bestehen. Die reale GPU-Matrix bindet die verwendeten Präsentationsbounds. Negative Occlusion-Eingaben sind Unit/DOM-Evidenz, keine als nativ ausgegebene zusätzliche Browserjourney. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/hit-testing.test.ts](../tests/unit/hit-testing.test.ts), [test: tests/unit/selection-visibility.test.ts](../tests/unit/selection-visibility.test.ts), [test: tests/unit/collection-bridge.test.ts](../tests/unit/collection-bridge.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T60-AC04 | Bei M7-Übergängen und Unterbrechungen verwendet die Eingabe qualifizierte dargestellte Bounds. Fokus, Textauswahl und aktive Eingabe werden nicht zusätzlich durch Effektmaterialien verzerrt | Teilweise · Historischer Prüflauf bis 14.11.2026. Aktuelle Matrix und native Effekt-/Interrupt-/Seek-Journey bestätigen dargestellte Eingabebounds. Im neuen WebGPU-Lauf bei Liquid Lens50% bleiben native Suchtextauswahl, scharfer GPU-Selection-/Fokusrahmen und Feldbounds erhalten; natives Ersetzen der Auswahl unterbricht zur gültigen Revision6 ohne Fokus-/Datenverlust. Tests prüfen ergänzend geschützte Eingaben und Auswahl bei Austritt/Unterbrechung. Die native Beobachtung beansprucht weder IME noch alle Betriebssysteme oder ein gespeichertes Screenshotarchiv. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/collection-bridge.test.ts](../tests/unit/collection-bridge.test.ts), [test: tests/unit/selection-visibility.test.ts](../tests/unit/selection-visibility.test.ts), [test: tests/unit/m8-qualification.test.ts](../tests/unit/m8-qualification.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T60-AC05 | Der Proof weist sichere Layer-/Clipregeln und sichtbare Fokusringe nach. Der Messbericht nennt Browser- und tatsächliche Surfacegröße getrennt | Teilweise · Historischer Prüflauf bis 14.11.2026. GPU-Fokusrahmen, Layer-/Clipregeln und Eigentümerschaft sind getestet. Native Desktop-/Kompaktjourney hat sichtbaren zweifarbigen Fokus geprüft; archivierte Matrixbilder ergänzen begrenzte Agent-Sichtprüfung. Browser-/Surfacegrößen sind getrennt aufgezeichnet, etwa 390px Browser/353px native Showcase-Surface beziehungsweise 351px Matrix-Surface. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/focus-ring.test.ts](../tests/unit/focus-ring.test.ts), [test: tests/unit/m8-qualification.test.ts](../tests/unit/m8-qualification.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| R3-AC01 | Der gepinnte UI-SDK-Adapter besteht Collection-Vertragsprüfungen. Im Browser funktionieren kontrollierte Tabs, Dialogrückkehr und ein Bibliothekswechsel mit unverändertem Fachzustand. | Teilweise · Je 40 identische Tests für UI SDK Beta.1 und Beta.13. Im Browser wurden Tab-Auswahl, Escape-Rückkehr und der Wechsel zu Base UI bei erhaltener Auswahl geprüft. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T61

Nachgewiesen im Scope: 0/6.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T61-AC01 | Der Pilot verwendet denselben validierten Workspace-Datensatz in allen drei Ansichten. Sortieren und Filtern verändern keine Modulidentitäten oder erfundenen Werte | Teilweise · Ein validierter realer Workspace-Datensatz projiziert stabile Modul-IDs in Tabelle, Karten und Map; Sortierung/Filter erfinden keine Fachwerte. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/core-collection.test.ts](../tests/unit/core-collection.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T61-AC02 | Mehrfachauswahl, Range-Anker, Auswahlumschaltung und Tastaturbewegung folgen dokumentierten Regeln für sichtbare, gefilterte und deaktivierte Einträge. Die Semantik bildet die gewählte Tabellen-/Composite-Interaktion korrekt ab. Keine Rollenwahl allein wegen des visuellen Rasters | Teilweise · Sichtbare Reihenfolge, Disabled-Regeln, Range-Anker, Typeahead-Zeit/Reset/Wiederholung/Normalisierung und Schutz von Text-/Composition-Eingaben sind in eigenen Core- und DOM-Brückentests qualifiziert. Die native Vorführung wird zusätzlich über T61-AC06/T65-AC03 gebunden. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/collection.test.ts](../tests/unit/collection.test.ts), [test: tests/unit/collection-bridge.test.ts](../tests/unit/collection-bridge.test.ts), [test: tests/unit/core-collection.test.ts](../tests/unit/core-collection.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T61-AC03 | Typeahead besitzt festgelegte Zeit-/Reset-/Wiederholungsregeln und eine bewusste Textnormalisierung. Während Texteingabe oder Composition fängt es keine Zeichen für eine konkurrierende Navigation ab | Teilweise · Sichtbare Reihenfolge, Disabled-Regeln, Range-Anker, Typeahead-Zeit/Reset/Wiederholung/Normalisierung und Schutz von Text-/Composition-Eingaben sind in eigenen Core- und DOM-Brückentests qualifiziert. Die native Vorführung wird zusätzlich über T61-AC06/T65-AC03 gebunden. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/collection.test.ts](../tests/unit/collection.test.ts), [test: tests/unit/collection-bridge.test.ts](../tests/unit/collection-bridge.test.ts), [test: tests/unit/core-collection.test.ts](../tests/unit/core-collection.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T61-AC04 | Auswahl, Sortierung und zugehöriger Inspectorinhalt stimmen nach Tabelle → Karten → Map → Tabelle überein. Fokus behält seine logische Identität oder folgt der dokumentierten Fallback-Regel, ohne auf entfernte Controls zu zeigen | Teilweise · Aktueller nativer Tabelle→Karten→Map→Tabelle-Zyklus erhält core/effects, numerische Sortierung und Inspector; Filter behält versteckte Auswahl. Echte DOM-Brückentests prüfen Fokusreparenting, Fallback und Schutz eines neu gewählten Studiofokus. Native Typeahead-Fokussierung wurde separat beobachtet, kein Screenreaderclaim. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/collection-bridge.test.ts](../tests/unit/collection-bridge.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T61-AC05 | Alle drei neuen M7-Rezepte sind einzeln auslösbar. Gleicher Seed/Zeitpunkt ist reproduzierbar. Unterbrechung, Rückwärts-Seek und Reduced Motion erhalten den gültigen Fachzustand. Alte Buildnachweise werden nicht als neue Regression ausgegeben | Teilweise · Alle drei Rezepte sind nativ einzeln ausgelöst und während laufender Präsentation ersetzt; Rückwärts-Seek und Reduced Motion erhalten Auswahl und Fachrevision. Aktuelle echte GPU-Matrix liefert fünf Phasen pro Richtung; reine Samplertests belegen gleiche Seed-/Zeitpunkte und Rückwärtsauswertung. Die Matrix ist keine durchgehende Filmabnahme und kein cross-backend-pixelidentischer Seedvergleich. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/m8-qualification.test.ts](../tests/unit/m8-qualification.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T61-AC06 | Der sichtbare Proof wird bei Desktop- und kompakter Breite mit Pointer und Tastatur vorgeführt. Screenshots, Trace und Geometrie besitzen denselben Build-/Runbezug | Teilweise · Echte native Pointer-/Tastaturvorführung bei1280px und390px im selben Build3cf und Datensatz: tatsächlich heruntergeladene Originalbilder,17/22 Traceeinträge, Snapshot und je45 native Ziele desselben Capture-Runs; null Zielabweichung. Gzip-/Download-/PNG-Digests und CRC unabhängig geprüft, beide Originale visuell gelesen. Der Export selbst behauptet keine Eingabeherkunft; diese ist gesondert beobachtet. Einzelbildnachweis, keine Film-/AT-/Hardwarefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/collection-bridge.test.ts](../tests/unit/collection-bridge.test.ts), [test: tests/unit/m8-qualification.test.ts](../tests/unit/m8-qualification.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T62

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T62-AC01 | Ein kleiner Vergleichsflow umfasst Tabs, eine Auswahlliste und einen Dialog mit Fokusübergabe/-rückgabe. Nur öffentlich verfügbare Kandidaten werden verwendet. Eine fehlende Komponente wird als Lücke dokumentiert | Teilweise · Öffentliche Tabs-, Select- und Dialog-Primitives beider gepinnten Bibliotheken steuern denselben kleinen Studioflow. Native Prüfung bestätigt Dialog-Fokusübergabe und -rückgabe; Import-/SSR-Inventar nennt öffentliche Pfade und Grenzen. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/behavior-comparison.test.ts](../tests/unit/behavior-comparison.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T62-AC02 | Namen, Tastaturbedienung, Escape, Disabled-Zustand und kontrollierte Änderungen werden auf beiden Pfaden anhand derselben Ereignisfolgen geprüft | Teilweise · Identische native Tabs-/Select-/Dialogfolgen prüfen Namen, Tastatur, Escape, deaktiviertes Detail und kontrollierte Werte beider Adapter. Der reale Base-UI-Attributionsbefund wurde korrigiert, mit acht DOM-Regressionen sowie nativ erneut geprüft. Keine automatische AT-/Mobilfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/behavior-comparison.test.ts](../tests/unit/behavior-comparison.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T62-AC03 | Beide Kandidaten steuern dieselbe Fluid-Vorschau. Keiner besitzt eine separate Kopie von Fachwerten oder umgeht Guards durch UI-Callbacks | Teilweise · Beide DOM-Kandidaten besitzen dieselbe fortbestehende Fluid-Runtime, denselben Datensatz und eine GPU-Surface. Bibliothekswechsel erhält Domainwerte; kontrollierte Änderungen und Guardablehnungen sind in echten Core-/DOM-Tests geprüft. Dialogzustand bleibt lokal ohne Fachcommit. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/behavior-comparison.test.ts](../tests/unit/behavior-comparison.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T62-AC04 | Vergleich nennt Importumfang, benötigte eigene Adapter, offene Fehler und wartbare API-Grenzen. Weder Herkunft noch Beta-/Stable-Bezeichnung ersetzen gemessene Bedienbarkeit oder eigene Accessibility-Nachweise | Teilweise · Tatsächliche öffentliche Imports/Transitivität, eigene kontrollierte Callback-/Modalitätsadapter und Wartungsgrenzen sind inventarisiert. Gleich konfigurierte Bundlecases sind reproduziert; native Bedienbefunde ergänzen den Vergleich. Beta-/Stable- oder Anbieterherkunft wird nicht als Qualitätsnachweis verwendet. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/behavior-comparison.test.ts](../tests/unit/behavior-comparison.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T62-AC05 | Ergebnis ist pro Baustein Übernehmen, Beibehalten oder Vertagen mit Begründung. Kein vollständiger Studioaustausch allein wegen eines erfolgreichen Einzelimports | Teilweise · ADR-0007 entscheidet pro Baustein: öffentliche controlled Selection übernehmen; timerfreies Typeahead und Multipart/Layout/Policy selbst besitzen; Base-UI-Tabs/Select/Dialog beibehalten; öffentliche SDK-DOM-Bausteine im Vergleichslabor belassen. Entscheidung beruht auf lokalen Fähigkeiten, Import-/Wartungsbedarf und reproduziertem isoliertem Bundleumfang. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/behavior-comparison.test.ts](../tests/unit/behavior-comparison.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T63

Nachgewiesen im Scope: 0/7.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T63-AC01 | Ohne Konfiguration ist keine Aktion freigeschaltet. Komponenten, Aktionen und Parameter werden gegen die registrierte Allowlist geprüft. Unbekannte Ziele erzeugen einen nachvollziehbaren Fehler ohne Zustandsänderung | Teilweise · Default-deny, registrierte Ziele/Parameter/Scopes, redigierte read-only Snapshots/Queries sowie fehlende Domain-/Fokus-/History-Schreibaktionen sind negativ getestet. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/agent-bridge.test.ts](../tests/unit/agent-bridge.test.ts), [test: tests/unit/agent-callback-boundaries.test.ts](../tests/unit/agent-callback-boundaries.test.ts), [source: packages/contracts/src/agent.ts](../packages/contracts/src/agent.ts), [source: packages/core/src/agent.ts](../packages/core/src/agent.ts), [source: packages/core/src/data.ts](../packages/core/src/data.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T63-AC02 | Snapshot- und Query-Aufrufe sind strikt lesend: kein Fokuswechsel, Popupöffnen, History-Eintrag oder fachlicher Commit. Ergebnisse sind an den berechtigten Scope und die gelesene Revision gebunden und vor Ausgabe redigiert. Ein Snapshot darf keine zusätzliche Aktion zur vermeintlichen Vorbereitung auslösen | Teilweise · Default-deny, registrierte Ziele/Parameter/Scopes, redigierte read-only Snapshots/Queries sowie fehlende Domain-/Fokus-/History-Schreibaktionen sind negativ getestet. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/agent-bridge.test.ts](../tests/unit/agent-bridge.test.ts), [test: tests/unit/agent-callback-boundaries.test.ts](../tests/unit/agent-callback-boundaries.test.ts), [source: packages/contracts/src/agent.ts](../packages/contracts/src/agent.ts), [source: packages/core/src/agent.ts](../packages/core/src/agent.ts), [source: packages/core/src/data.ts](../packages/core/src/data.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T63-AC03 | Jeder Änderungsrequest enthält gültige Versions-/Revisionsbezüge. Veraltete Requests und währenddessen veränderte Berechtigungen können keinen Commit erzwingen | Teilweise · Revisions-/Policy-/Expiry-/Abort-/Interaktionsprüfungen werden über Await und reentrante Hostcallbacks erneut geprüft. Derselbe Core führt den validierten Commit aus; der bestätigte authorize-Reentry-Fehler ist regressionsgeprüft behoben. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/agent-bridge.test.ts](../tests/unit/agent-bridge.test.ts), [test: tests/unit/agent-callback-boundaries.test.ts](../tests/unit/agent-callback-boundaries.test.ts), [test: tests/unit/runtime-transactions.test.ts](../tests/unit/runtime-transactions.test.ts), [source: packages/contracts/src/agent.ts](../packages/contracts/src/agent.ts), [source: packages/core/src/agent.ts](../packages/core/src/agent.ts), [source: packages/core/src/data.ts](../packages/core/src/data.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T63-AC04 | Ein berechtigter Request verwendet denselben Core-/Guard-/Interaktionsschutz wie eine Nutzeraktion. Es gibt keinen direkten SDK-Schreibpfad auf Scene oder Fachstore | Teilweise · Revisions-/Policy-/Expiry-/Abort-/Interaktionsprüfungen werden über Await und reentrante Hostcallbacks erneut geprüft. Derselbe Core führt den validierten Commit aus; der bestätigte authorize-Reentry-Fehler ist regressionsgeprüft behoben. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/agent-bridge.test.ts](../tests/unit/agent-bridge.test.ts), [test: tests/unit/agent-callback-boundaries.test.ts](../tests/unit/agent-callback-boundaries.test.ts), [test: tests/unit/runtime-transactions.test.ts](../tests/unit/runtime-transactions.test.ts), [source: packages/contracts/src/agent.ts](../packages/contracts/src/agent.ts), [source: packages/core/src/agent.ts](../packages/core/src/agent.ts), [source: packages/core/src/data.ts](../packages/core/src/data.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T63-AC05 | Sequenzen unterscheiden atomare lokale Zustandsänderung und externe Aktionen. Teilfehler werden ausdrücklich berichtet. Bereits ausgeführte Hosttransaktionen werden nicht als automatisch zurückgerollt dargestellt | Teilweise · Atomare lokale Batches, geordnete externe Resultate, ehrliche Teil-/Unbekannt-Ausgänge, Autoritätsmodi, read-only Export und Redaktion sind gezielt qualifiziert. Commit-Receipts bleiben nach Observerfehlern/reentranten Events wahrheitsgetreu. Prozesslokale Idempotenz ist keine dauerhafte Hosttransaktionsgarantie. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/agent-bridge.test.ts](../tests/unit/agent-bridge.test.ts), [test: tests/unit/agent-callback-boundaries.test.ts](../tests/unit/agent-callback-boundaries.test.ts), [test: tests/unit/runtime-transactions.test.ts](../tests/unit/runtime-transactions.test.ts), [source: packages/contracts/src/agent.ts](../packages/contracts/src/agent.ts), [source: packages/core/src/agent.ts](../packages/core/src/agent.ts), [source: packages/core/src/data.ts](../packages/core/src/data.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T63-AC06 | Manual, Hybrid und Auto folgen den bestehenden Autoritätsregeln. Käufe, Veröffentlichungen und andere nicht erlaubte Side Effects werden in Auto abgewiesen | Teilweise · Atomare lokale Batches, geordnete externe Resultate, ehrliche Teil-/Unbekannt-Ausgänge, Autoritätsmodi, read-only Export und Redaktion sind gezielt qualifiziert. Commit-Receipts bleiben nach Observerfehlern/reentranten Events wahrheitsgetreu. Prozesslokale Idempotenz ist keine dauerhafte Hosttransaktionsgarantie. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/agent-bridge.test.ts](../tests/unit/agent-bridge.test.ts), [test: tests/unit/agent-callback-boundaries.test.ts](../tests/unit/agent-callback-boundaries.test.ts), [test: tests/unit/runtime-transactions.test.ts](../tests/unit/runtime-transactions.test.ts), [source: packages/contracts/src/agent.ts](../packages/contracts/src/agent.ts), [source: packages/core/src/agent.ts](../packages/core/src/agent.ts), [source: packages/core/src/data.ts](../packages/core/src/data.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T63-AC07 | Export/Replay erzeugt keine externe Mutation. Nicht autorisierte Inhalte und sensitive Felder gelangen nicht über die Bridge in Modellkontext oder Diagnose | Teilweise · Atomare lokale Batches, geordnete externe Resultate, ehrliche Teil-/Unbekannt-Ausgänge, Autoritätsmodi, read-only Export und Redaktion sind gezielt qualifiziert. Commit-Receipts bleiben nach Observerfehlern/reentranten Events wahrheitsgetreu. Prozesslokale Idempotenz ist keine dauerhafte Hosttransaktionsgarantie. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/agent-bridge.test.ts](../tests/unit/agent-bridge.test.ts), [test: tests/unit/agent-callback-boundaries.test.ts](../tests/unit/agent-callback-boundaries.test.ts), [test: tests/unit/runtime-transactions.test.ts](../tests/unit/runtime-transactions.test.ts), [source: packages/contracts/src/agent.ts](../packages/contracts/src/agent.ts), [source: packages/core/src/agent.ts](../packages/core/src/agent.ts), [source: packages/core/src/data.ts](../packages/core/src/data.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T64

Nachgewiesen im Scope: 0/6.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T64-AC01 | Entwicklungsoutput ist ein Diff mit Herkunft und betroffenen Verträgen. Vor Übernahme werden Typecheck, Referenzprüfung und relevante Conformancefälle ausgeführt. Der Agent erhält durch Generierung keine automatischen Deployrechte | Teilweise · Historischer Prüflauf bis 14.11.2026. Deterministischer Diff/Quellhash mit Herkunft, tatsächlicher TypeScript-Compiler, Registry-/Identitätsprüfung und begrenzte Conformance mit realen Workspace-Daten sind geprüft. Ein nativer Diffdownload liegt vor; keine automatische Dateianwendung oder Deployrechte. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/development-proposal.test.ts](../tests/unit/development-proposal.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T64-AC02 | Laufzeitoutput enthält nur den vereinbarten deklarativen Teilumfang. Freies JavaScript, Shader, Imports, Eventhandlercode und unbekannte URLs werden abgewiesen | Teilweise · Historischer Prüflauf bis 14.11.2026. Der begrenzte deklarative Registry-Vertrag lehnt unbekannte Komponenten, Bindings, Code-/URL-/Handlerfelder und frei erfundene Commands ab. Source-artige Titel bleiben Datenliterale. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/development-proposal.test.ts](../tests/unit/development-proposal.test.ts), [test: tests/unit/ai-authoring.test.ts](../tests/unit/ai-authoring.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T64-AC03 | Streamingoutput bleibt ein isolierter Entwurf. Erst ein vollständig validierter, berechtigter Vorschlag kann atomar übernommen werden. Veraltete oder abgebrochene Generierung überschreibt keine neuere Nutzereingabe | Teilweise · Historischer Prüflauf bis 14.11.2026. Teilstream und aktiver Zustand sind getrennt; Abbruch, Prompt-/Dokumentänderung und verspätete Complete-/Preflight-Antworten können keinen neueren Zustand übernehmen. Vorschau und Apply wurden zusätzlich live beobachtet. Aktuelle UI-/Route-Hashes werden separat zur historischen Live-Evidenz gebunden. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/ai-authoring.test.ts](../tests/unit/ai-authoring.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T64-AC04 | Studio zeigt Daten-/Providerumfang, Entwurf, Änderungsdiff und Übernehmen/Verwerfen. Fokus und Dirty Fields sind gegen unbeabsichtigten Austausch geschützt | Teilweise · Historischer Prüflauf bis 14.11.2026. Studio zeigt Scope, isolierten Entwurf, Diff, Apply/Discard und GPU-Vorschau. Historischer direkter AI-/GPU-Lauf belegt Auswahl-/Notizerhalt. Aktuelle native 390px-Prüfung zeigt echten Compiler-Preflight, verständliche Ablehnung unbekannter Komponenten sowie erhaltene Dirty-Note/Revision bei Ablehnung. Controller-/UI-Tests sperren Fokus-/Composition-/Stale-Wechsel. Nativer Dirty-Note-Test vor HMR und Fehlerretetst danach bleiben getrennt; keine HMR-Persistenzbehauptung. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T64-AC05 | Modellzugriffe verwenden serverseitiges Vercel AI SDK mit Berechtigung, Budget, Deadline und Abort. Ohne Provider bleiben manuelle Gestaltung und Runtime bedienbar. Die vorhandene AI-Designreview gilt nicht als Nachweis dieses neuen Pfads | Teilweise · Historischer Prüflauf bis 14.11.2026. Eigener serverseitiger Vercel-AI-SDK-/OpenAI-Livepfad mit sichtbarer Usage liegt vor. Separate lokale Autorisierung, Budgetreservierung, Deadline, Abort, Providerfehlerredaktion und manueller Pfad ohne Provider sind regressionsgeprüft. Kein Archiv einer Response-ID; UI-Usage ist keine rohe Providerabrechnung. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/ai-authoring.test.ts](../tests/unit/ai-authoring.test.ts), [test: tests/unit/client-import-boundary.test.ts](../tests/unit/client-import-boundary.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T64-AC06 | Negative Evaluation umfasst unbekannte Komponenten/Aktionen, falsche Referenzen, Prompt Injection, widersprüchliche Bindings, Teilantworten und verspätete Antworten. Ein generierter Erfolgstext gilt nicht als ausgeführte fachliche Aktion | Teilweise · Historischer Prüflauf bis 14.11.2026. Negative Ausgabenprüfung umfasst unbekannte Registry-/Command-/Binding-/Identitätswerte, executable Extra-Felder, source-artige/injizierte Textliterale, Teilstream und verspätete Antworten. Der Testumfang validiert begrenzten untrusted Output; er behauptet keine universelle Prompt-Injection-Resistenz des Modells. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/development-proposal.test.ts](../tests/unit/development-proposal.test.ts), [test: tests/unit/ai-authoring.test.ts](../tests/unit/ai-authoring.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T65

Nachgewiesen im Scope: 0/8.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T65-AC01 | Der sichtbare Runtime-Proof wird auf den vorhandenen Breiten 320/390/768/1280 px und auf tatsächlichem WebGPU beziehungsweise separat gewähltem WebGL2 geprüft. Browser-/Surfacegröße, Hardware, Build, Daten- und Rezeptstand werden aufgezeichnet | Teilweise · Acht archivierte tatsächliche GPU-Läufe mit Browserbreiten 320/390/768/1280 und jeweils WebGPU/WebGL2: 144 Fälle, 720 Samples. Surfacegrößen, DPR, Browser, Build dfc, Datenquellen/-versionen/Modul-IDs und Rezeptversionen sind enthalten. Das vorhandene lokale Mac17,6/M5-Max/64-GiB/macOS27.2.1-Profil ergänzt die Provenienz; keine neue Hardware-Supportmatrix. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/m8-qualification.test.ts](../tests/unit/m8-qualification.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T65-AC02 | Die endliche Matrix umfasst Tabelle ↔ Karten, Karten ↔ Map und Map ↔ Tabelle, mit denselben drei neuen M7-Effekten: **6 Richtungen × 4 Breiten × 2 Backends × 3 Effekte = 144 Übergangsfälle**. Endpunkte und 25/50/75-Prozent-Kontrollpunkte ergeben **720 Kontrollbilder/-samples**. Sie sind keine vollständige zeitliche Filmabnahme. Die frühe sichtbare Lieferung darf vor Abschluss dieser gesamten Freigabematrix erfolgen und zeigt ihre noch offene Prüfdeckung ausdrücklich an | Teilweise · Die vollständige endliche Matrix umfasst sechs Richtungen × vier Browserbreiten × zwei tatsächliche Backends × drei Rezepte =144 Fälle, jeweils0/25/50/75/100%=720 Kontrollbilder/-samples. Originalarchive, PNG-Hashes, Geometrie und Counts sind geprüft. Sieben Bilder wurden zusätzlich visuell durch einen Agenten gelesen; weder alle Bilder noch jeder Animationsframe sind damit manuell beurteilt. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/m8-qualification.test.ts](../tests/unit/m8-qualification.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T65-AC03 | Eigene Journeys prüfen Mehrfachauswahl, Range-Anker, Keyboard/Typeahead, Sortierung/Filter, Fokusfallback, Unterbrechung, Resize, URL-History und read-only Replay. Ein programmgesteuerter Test wird nicht als native Eingabe ausgegeben | Teilweise · Eigene native Showcase-Journeys prüfen Mehrfach-/Rangeauswahl, Typeahead, numerische Sortierung, Filter, Effektunterbrechung, Rückwärts-Seek, Resize und Browser-History. Echte Core-/DOM-Integration ergänzt Fokusfallback und importiertes read-only Replay. Programmatische Matrix-/Unitereignisse sind ausdrücklich keine native Eingabe; keine allgemeine IME-/AT-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/collection-bridge.test.ts](../tests/unit/collection-bridge.test.ts), [test: tests/unit/m8-qualification.test.ts](../tests/unit/m8-qualification.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T65-AC04 | Vergleichskandidaten verwenden identischen Datensatz, Seed, Viewport, Theme und Backend. Kriterien sind Verhalten, Erreichbarkeit, visuelle Kontinuität, benötigter Adapterumfang und nachgewiesene Wartungsrisiken. Es gibt keine unbelegte Performance- oder Qualitätssteigerungsbehauptung | Teilweise · Beide DOM-Adapter teilen denselben lebenden Datensatz/Runtime, konfigurierten Seed42, Viewport1280×900/DPR1, Theme und WebGPU. Native gleiche Bedienfolgen und getrennte Adapter-/Importbefunde bilden die Vergleichsbasis. Eventabhängig aufgelöste Effektseeds wurden nicht als identisch nachgewiesen; kein Pixel- oder Geschwindigkeitsvergleich zwischen Kandidaten wird daraus behauptet. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/behavior-comparison.test.ts](../tests/unit/behavior-comparison.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T65-AC05 | Ein separater Echtzeitlauf misst auf dem dokumentierten Referenzgerät Frametiming, Ausreißer und das vorab definierte Budget bei identischem Ablauf. Kontrollierte Einzelbildaufnahme gilt nicht als Echtzeitmessung. Das Bundle- Delta wird mit identischer Buildkonfiguration und denselben Einstiegspunkten bestimmt. Ein Surface-Scheduler bleibt der einzige Taktgeber. Im stabilen Leerlauf entstehen keine zusätzlichen Frames. Upstream-Angaben begründen keine eigene Performancegarantie | Teilweise · Abgegrenzter Mess-/Vergleichsauftrag ausgeführt und unabhängig bewertet:18 gepaarte echte Live-Core-Abläufe jeBackend, Warmup, Rohintervalle/Ausreißer, unverändertes Budget, null Idle-Zusatzframes und identische Bundle-Buildkonfiguration; anschließende WebGPU-Nachmessung mit CPU-/GPU-/Collectorlast. Negatives Resultat bleibt P95max17,6ms, RAF-Max66,7ms,5 Intervalle>50ms, Budgetfailed, Lastcontaminated und Performancevaliditätnot-qualified. Abschluss der ehrlichen Messung, ausdrücklich kein positiver T29-Leistungs-/Backend-/Produktionspass. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/m8-timing.test.ts](../tests/unit/m8-timing.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T65-AC06 | Neue Quellen und Nachweise werden unter eigener datierter Provenienz archiviert. M7-AC und historische Builds bleiben unverändert. Breite AT-/IME-/Mobile-/Hardware- und Produktionsgates werden weder automatisch geschlossen noch als unendliche Voraussetzung für den begrenzten Vergleich erfunden | Teilweise · Neue M8-Nachweise werden datiert und nach Quelle/Build/Prüfart getrennt gebunden. Diese Ledger-Qualifikation erhält alle435 bisherigen Kriterienobjekte einschließlich Status/Evidenz unverändert und verändert keinen kanonischen AC-Text. Historische M7-/Live-AI-Artefakte behalten ihre Bytes/Provenienz; globale AT-/IME-/Mobile-/Hardware-/Produktionsgates bleiben getrennt offen. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/m8-qualification.test.ts](../tests/unit/m8-qualification.test.ts), [test: tests/unit/m8-timing.test.ts](../tests/unit/m8-timing.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T65-AC07 | Entscheidung benennt übernommene, selbst implementierte und abgelehnte Teile. Erst bei Übernahme werden kanonische Tasks/AC, Feature-Matrix und Engineering-OKF konsistent erweitert. Public erklärt ausschließlich tatsächlich bedienbare Funktionen | Teilweise · Per-Baustein-Entscheidung, 65 Tasks/476 Kriterien und beide OKF-v0.2-Handbücher mit bedienbaren M8-Funktionen, nativer Export-/Downloadanleitung und Originalbildern konsistent erzeugt und geprüft. Alle 41 M8-Kriterien sind im jeweiligen lokalen Funktions-/Messscope nachgewiesen. Das negative Leistungsresultat bleibt failed/contaminated/not-qualified; T29 und breite Produktionsgates bleiben offen. Historische Editionen und AC-Texte unverändert. Einzelne Belege des historischen Laufs sind separat archiviert. | [test: tests/unit/behavior-comparison.test.ts](../tests/unit/behavior-comparison.test.ts) | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| R4-AC02 | Authoring verwendet den sichtbaren Entwurf. Vorschläge, Preflight und Übernahme bleiben an Dataset und Revision gebunden. Review und Authoring reservieren ihr lokales Budget atomar und dauerhaft. | Teilweise · Lokales Studio. Datasetbindung, sichtbarer Entwurf und explizite Übernahme sowie dauerhafte gemeinsame Budgetreservierung wurden mit kontrolliertem Provider und zwei SQLite-Verbindungen geprüft. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T66

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T66-AC01 | Der Flow Explorer verwendet einen validierten Flow für GPU-Graph, erlaubte Aktionen und Mermaid-Export | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T66-AC02 | Der lokale Architektur-Review enthält einen erreichbaren Rückarbeitspfad und zeigt aktive Zustände sowie tatsächlich beobachtete Ereignisse | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T66-AC03 | Modulkontext stammt aus dem Workspace und lokale Ergebnisse behaupten keine externe Prüfung oder Veröffentlichung | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T66-AC04 | Knoten, Aktionen und Details sind mit Pointer und Tastatur bedienbar und passen in Desktop- und schmale Ansichten | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T66-AC05 | Direkteinstieg, ungültige Modulreferenzen, Rückkehr und Runtime-Disposal sind definiert und geprüft | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T67

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T67-AC01 | Die Vergleichsansicht verwendet zwei bis vier ausdrücklich ausgewählte reale Module und erhält deren stabile Identitäten | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T67-AC02 | Gemeinsame und unterschiedliche Abhängigkeiten sowie Kennzahlen werden aus den Quelldaten korrekt berechnet | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T67-AC03 | Leere, einzelne und übergroße Auswahl sowie gefilterte ausgewählte Elemente werden verständlich behandelt, ohne Auswahlverlust | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T67-AC04 | Desktop und kompakte Darstellung besitzen vollständige lesbare Werte und passende Semantik ohne überlappende Controls | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T67-AC05 | Deep Link, History und Ansichtswechsel erhalten Auswahl und Vergleichseinstellungen und führen keine externe Aktion aus | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T68

Nachgewiesen im Scope: 0/5.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T68-AC01 | Der Atlas stellt reale Dateien oder Codezeilen proportional dar und benennt Metrik und Einheit ausdrücklich | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T68-AC02 | Gruppeneinstieg und Rückkehr sind deterministisch und erhalten Auswahl und Modulidentität | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T68-AC03 | Kleine Flächen, Nullwerte und leere Filterergebnisse bleiben ohne erfundene Größen oder unbedienbare Trefferflächen zugänglich | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T68-AC04 | Flächen bleiben endlich, innerhalb der verfügbaren Bounds und überschneiden sich nicht | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T68-AC05 | Metrik, Gruppenfokus und gültige URL-Zustände werden bei Reload und History wiederhergestellt | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## T69

Nachgewiesen im Scope: 0/6.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| T69-AC01 | Blau ist Standard und acht benannte Paletten sowie eine validierte eigene Akzentfarbe sind auswählbar | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T69-AC02 | Studio und GPU verwenden gemeinsame abgeleitete Farbrollen mit geprüfter Text- und Fokuslesbarkeit auch für sehr helle und dunkle Eingaben | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T69-AC03 | Farbwechsel verändern weder Fachrevision, Auswahl noch Navigation und werden lokal gespeichert, wobei Speicherfehler sichtbar bleiben | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T69-AC04 | Alle drei neuen Ansichten sind über konkrete Cases erreichbar und mit den bestehenden Effekten sowie Reduced Motion bedienbar | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T69-AC05 | Aktuelle Browserbilder, funktionale Tests, Feature-Matrix, Tasks, Mermaid-Flows und beide OKF-Handbücher werden gemeinsam aktualisiert | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-/Geräteabnahme bleibt separat; endgültige generierte Editionshashes sind im separaten Dokumentationsnachweis gebunden. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |
| T69-AC06 | Frühere Renderer- und Performance-Nachweise behalten ihre Herkunft und geänderte Quellen werden nicht still als erneut geprüft markiert | Teilweise · Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert. | — | Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden. |

## M11-01

Nachgewiesen im Scope: 1/1.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M11-01-AC | Tabelle → Karten → Vergleich in DE, EN und FR bei 390 und 1280 px. Jede der sechs gerichteten Sprachkombinationen wird bei 50 % geprüft. IDs, Werte, Auswahl und Fokus bleiben erhalten. Der französische Text „Dépendances“ und der mit `Intl.NumberFormat` formatierte Testwert „1 234“ erscheinen vollständig und mit korrektem geschütztem Gruppenabstand auf der GPU. Der Testwert wird isoliert geprüft, die Vorführung verwendet echte Modulwerte. Kein unübersetzter Schlüssel, keine kollidierenden sichtbaren Texte und keine verwaisten Pointer-Ziele an den Prüfpositionen. Nutzer können die Bewegung anhalten. | Nachgewiesen im Scope · Sechs Sprachrichtungen im pausierten Workspace, Tabellen-/Karten-/Vergleichsjourney und französischer Zahlentest. | [artifact: docs/qa/2026-11-20-m11/verification.json](qa/2026-11-20-m11/verification.json), [artifact: docs/qa/2026-11-20-m11/gpu-locales.json](qa/2026-11-20-m11/gpu-locales.json), [artifact: docs/readme/assets/m11-workspace-screenshots.json](readme/assets/m11-workspace-screenshots.json) | Im genannten Scope belegt |

## M11-02

Nachgewiesen im Scope: 1/1.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M11-02-AC | Plural 0/1/2, Parameterreihenfolge, Apostroph, fehlender Schlüssel und kaputtes Paket getestet. SSR, Browser und eigenständiger Host liefern bei identischem Kontext dieselben Beispieltexte. Bundlevergleich nennt gzip-Delta, Importgraph und Buildplattform. Der Testhost kann die Nachrichten ohne Next.js oder DOM initialisieren. | Nachgewiesen im Scope · Host-Bundle, drei Kataloge, ICU-Fehler, Pluralformen und Sprachprojektionen für SSR und Browser. | [artifact: docs/qa/2026-11-20-m11/adapter-comparison.json](qa/2026-11-20-m11/adapter-comparison.json), [artifact: docs/qa/2026-11-20-m11/verification.json](qa/2026-11-20-m11/verification.json) | Im genannten Scope belegt |

## M11-03

Nachgewiesen im Scope: 1/1.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M11-03-AC | Erste Serverantwort hat korrekte Sprache/Richtung und passende Metadaten. Einstieg über `/de/`, `/en/` und `/fr/`, Reload, Back/Forward, Rückkehr aus Studio, Altlink mit Query/Fragment, ungültiger Tag, zwei parallele Hosts und fehlgeschlagener Download geprüft. Ein ungespeicherter Entwurf, mehrfache Auswahl und IME-Inhalt bleiben erhalten. Beim schnellen Wechsel DE → EN → FR bleibt Französisch aktiv, auch wenn der englische Katalog zuletzt eintrifft. | Nachgewiesen im Scope · Studio-Pfad und Präferenz, Hydrierung, Verlauf, Fokus, Entwurf, Hostisolation und verspätete Kataloge. | [artifact: docs/qa/2026-11-20-m11/verification.json](qa/2026-11-20-m11/verification.json) | Im genannten Scope belegt |

## M11-04

Nachgewiesen im Scope: 0/1.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M11-04-AC | 320/390/768/1280 px, beide Backends und Reduced Motion. Die drei Formübergänge vorwärts und rückwärts an 5-%-Punkten auf Textkollisionen prüfen, einschließlich echter Glyphenmaße, Fokus-/Hit-Regionen und Cursor. Pseudosprache mit mindestens 30 % Verlängerung. RTL-Pilot mit arabischem Text, lateinischer Modul-ID, Klammern, Zahl und bidirektionaler Auswahl. CJK separat mit Fontkorpus, mobiler IME und dokumentierter Lückendiagnose. | Teilweise · GPU-Profile und erweiterte Schriftkorpora auf Desktop-Chrome. | [artifact: docs/qa/2026-11-20-m11/gpu-locales.json](qa/2026-11-20-m11/gpu-locales.json), [artifact: docs/qa/2026-11-20-m11/verification.json](qa/2026-11-20-m11/verification.json) | Echte mobile japanische IME und bidirektionale Auswahl mit einem RTL-Nutzer sowie Screenreader-Journeys auf benannten Geräten durchführen. |

## M11-05

Nachgewiesen im Scope: 1/1.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M11-05-AC | Numerische Sortierung, Umlaute, gleiche Anzeigenamen mit stabiler ID, Suche und Tastaturreihenfolge getestet. Gleicher EUR-Betrag in allen drei Formatprofilen. Für `fr-FR` prüfen, dass „1 234,56 €“ in diesem Referenzprofil U+202F als Gruppentrenner und U+00A0 vor dem Eurozeichen enthält. Testdatum um Mitternacht in expliziter Zeitzone. Sprachneutrale Daten laden beim Wechsel kein zweites Mal. Zwei unterschiedlich lokalisierte Anbieterantworten überschreiben einander nicht. | Nachgewiesen im Scope · Original-IDs und EUR-Minorwerte, localegebundene Reihenfolge, native Intl-Profile, zeit- und sprachgebundene Abfragen. | [artifact: docs/qa/2026-11-20-m11/verification.json](qa/2026-11-20-m11/verification.json) | Im genannten Scope belegt |

## M11-06

Nachgewiesen im Scope: 1/1.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M11-06-AC | Neue Aufnahme bindet aufgelöste Texte, Tag, Richtung, Katalog-/Font-Fingerprints, Zeitkontext und Build. Für v2/v3/v4 werden ursprüngliche Knoten und Hashes beibehalten, eine fehlende Sprache erscheint als „unbekannt“. DE-Clip im FR-Studio und FR-Clip im EN-Studio rückwärts abspielen und Originalpixel-/Zustandsbezug prüfen. Aktuelle Übersetzung als eigener neuer Run mit Herkunft. | Nachgewiesen im Scope · Version 5 bindet die Sprachprojektion an Katalog, Fonts und Build. Import erhält Originaldaten, lokales Restaging verknüpft den zweiten Clip über SHA-256. | [artifact: docs/qa/2026-11-20-m11/gpu-locales.json](qa/2026-11-20-m11/gpu-locales.json), [artifact: docs/qa/2026-11-20-m11/verification.json](qa/2026-11-20-m11/verification.json) | Im genannten Scope belegt |

## M11-07

Nachgewiesen im Scope: 1/1.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M11-07-AC | Antwortsprache per Allowlist an den einzelnen Auftrag binden. Umschalten erzeugt null Modellaufrufe und null neue Budgetreservierungen. Späte Antwort, Ablehnung, Entwurf und Preflight behalten Sprache, Revision und Datensatzbezug. Originaltext/Quellbild bleibt erhalten. Providerfehler wird über stabilen Fehlercode in der UI-Sprache angezeigt. Releaseprobe pro freigegebener Antwortsprache fachlich und sprachlich prüfen. | Nachgewiesen im Scope · Allowlist und Fehlerstatus mit isolierten SDK-/Browserprüfungen. Drei ausdrückliche Live-Reviews desselben redigierten Frames lieferten fachlich plausible Hinweise in der angeforderten Sprache. | [artifact: docs/qa/2026-11-20-m11/live-review.json](qa/2026-11-20-m11/live-review.json), [artifact: docs/qa/2026-11-20-m11/verification.json](qa/2026-11-20-m11/verification.json) | Im genannten Scope belegt |

## M11-08

Nachgewiesen im Scope: 0/1.

| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |
|---|---|---|---|---|
| M11-08-AC | Je freigegebener Sprache sind beide Bücher offline öffnbar. Kapitelanker, Suche, Sprache, Alttexte und lokale Querverweise prüfen. Sprachumschalter hält das gelesene Kapitel. Bestehende URLs bleiben gültig. Neue Bedienbilder stammen aus der betreffenden UI-Sprache mit Buildbezug. Historische Originalbelege tragen Herkunft und Sprache. Sprachkundige Personen prüfen Glossar und die Kernjourney je Sprache, AT-/Geräteprüfung bleibt je Profil einzeln sichtbar. | Teilweise · Sechs lokale Reader, Kapitelwechsel, lokalisierte Screenshots und reproduzierbare Offline-Ausgaben. | [artifact: docs/qa/2026-11-20-m11/verification.json](qa/2026-11-20-m11/verification.json), [artifact: docs/readme/assets/m11-workspace-screenshots.json](readme/assets/m11-workspace-screenshots.json) | Unabhängige sprachkundige Personen prüfen je Sprache Glossar und Kernjourney. Manuelle AT-/Geräteergebnisse je Profil ergänzen. |
