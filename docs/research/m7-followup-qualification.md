# M7-Nachqualifikation: gezielte Quellenprüfung

Recherchiert am **4. November 2026**. Gegenstand sind die acht verbleibenden
M7-Kriterien und die dafür notwendigen Prüfmethoden. Keine neuen Library- oder
Versionsentscheidungen; kein Dependency-Upgrade aus dieser Recherche.

| Primärquelle / Stand der gelesenen Fassung | Aussage und Folgerung für FluidKit |
|---|---|
| [W3C UI Events: Composition Events](https://www.w3.org/TR/uievents/#events-compositionevents), Working Draft vom 21. Februar 2026 | Komposition hat eigene Start-/Update-/Endereignisse und steht mit nativer Texteingabe in Verbindung. Manche Eingabesysteme geben Zwischenstände unterschiedlich frei. Eine direkt gesetzte Eingabe oder synthetische Eventfolge prüft den Bridge-Vertrag, aber nicht automatisch einen tatsächlichen IME-Kandidatenprozess. Native Bestätigung/Abbruch separat erfassen. |
| [WHATWG HTML: Page visibility](https://html.spec.whatwg.org/multipage/interaction.html#page-visibility), Living Standard, aktualisiert 3. November 2026 | Die Dokument-Sichtbarkeit wird vom User Agent bestimmt und mit `visibilitychange` gemeldet. Testberichte müssen den beobachteten Visibility-State enthalten; ein injiziertes Event allein beweist keinen echten Hidden-Zustand. |
| [WCAG 2.2, 2.3.3 Animation from Interactions](https://www.w3.org/TR/WCAG22/#animation-from-interactions), W3C Recommendation vom 12. Dezember 2024 | Interaktionsbedingte Bewegungsanimation soll abschaltbar sein, sofern sie nicht wesentlich ist. FluidKit behandelt Reduced Motion als funktional vollständigen direkten Zielzustand und prüft zusätzliche Stop-/Pausepfade. Dies ist keine pauschale WCAG-Konformitätserklärung. |
| [WebGPU: Device loss](https://www.w3.org/TR/webgpu/#dom-gpudevice-lost), Candidate Recommendation Draft vom 15. September 2026 | Deviceverlust und die Lebensdauer expliziter Ressourcen sind Teil des API-Vertrags. Ein kontrollierter Verlusttest soll die echte Fehler-/Aufräumbehandlung auslösen und den fachlichen Snapshot erhalten. Verwaltete Zähler sind als eigene Allokationen auszuweisen; daraus folgt keine Aussage über gesamten Treiberspeicher. |

Die Unterscheidung zwischen nativer Browser-/OS-Beobachtung, kontrollierter
Runtime-Prüfung und reiner Simulation ist eine **methodische Ableitung** aus den
Quellen und den bestehenden FluidKit-Verträgen. Sie verhindert, dass ein leicht
automatisierbarer Teilpfad einen fehlenden Eingabe- oder Lifecyclebeleg verdeckt.

Weitere Geräte und Assistenztechnologien bleiben in T06/T07/T29 und
GLOBAL-TEST-04/05/07 erfasst. M7 erweitert deren Abnahme nicht stillschweigend,
behält aber jede in M7 selbst ausdrücklich genannte Voraussetzung bei.

Siehe [Nachprüfplan mit Tasks und Belegmatrix](../milestones/m7-followup.md).

## Präzisierung nach der tatsächlichen manuellen Dead-Key-Probe

[UI Events §4.3.2](https://www.w3.org/TR/uievents/#keys-dead) beschreibt Dead Keys
unter macOS/Linux als Input Methods und fordert CompositionEvents für die dem
Browser exponierte Sequenz. §4.3.3 warnt davor, den IME-Zustand allein aus
Keyboardevents abzuleiten. Die Nutzerprobe `^` gefolgt von `a` lieferte im
bestehenden Proof tatsächlich `â`. Der maßgebliche Export enthält 30 Ereignisse,
darunter vertrauenswürdigen Kompositionsbeginn und komponierende Eingabe mit
aktivem Core-Schutz. Das beobachtete Ende ist jedoch `isTrusted: false`; danach
ist der Core-Schutz aufgehoben. Die zuvor abgelesene UI-Zählung war unvollständig.

**Prüfschluss:** Die native OS-Eingabe und Übernahme des zusammengesetzten
Zeichens sind funktional beobachtet. Ein vollständig vertrauenswürdiger browserseitiger
Start-/Schutz-/Endzyklus oder japanische Kandidatenwahl ist daraus nicht
abzuleiten. Ein Start aus einem Automationslauf und ein Endwert aus einer anderen
Benutzersitzung dürfen nicht zu einer angeblich vollständigen nativen Sitzung
zusammengefügt werden. Diese Aussage beschreibt die Nachweisgrenze, keinen
nachgewiesenen Produktfehler.
