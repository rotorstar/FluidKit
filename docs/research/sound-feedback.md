# Soundfeedback für Fluid — Recherche

Recherche: **14. November 2026**. Status: Entscheidungsgrundlage für die nächste
Version, keine implementierte oder hörend qualifizierte Funktion.
[Planentwurf](../milestones/m10-sound-plan.md) · [Flows](../flows/sound.md).

## Ergebnis

Sound kann eine angenommene Aktion bestätigen, den Zusammenhang einer Bewegung
verstärken und den Abschluss einer Aufgabe zusätzlich erkennbar machen. Das ist
eine plausible Produktchance, kein bereits gemessener Fluid-Usabilitygewinn.
Empfohlen wird eine kleine semantische Klangsprache mit wählbaren Paletten,
bewusster Aktivierung und vollständiger Bedienbarkeit ohne Ton.

| Primärquelle | Beleg und Konsequenz |
|---|---|
| [Google Design: Good Vibrations](https://design.google/library/ux-sound-haptic-material-design) | Zusammengehörige visuelle, akustische und haptische Gestaltung; das Beispiel des Kameraauslösers zeigt die Entwicklung zu knapper, verständlicher Rückmeldung. Vorlieben sind subjektiv. Fluid erprobt eine gemeinsame Klangsprache und unterschiedliche Charaktere, statt jede Aktion möglichst auffällig zu vertonen. |
| [Microsoft: Sound in Windows apps](https://learn.microsoft.com/en-us/windows/apps/develop/ui/sound) | Sounds sind Ereignissen wie Invoke, Show/Hide und Navigation zugeordnet. Globale und lokale Steuerung sind vorgesehen. Übernommen wird diese semantische Organisation, nicht XAML oder die automatischen Plattformvorgaben. |
| [Apple HIG: Playing audio](https://developer.apple.com/design/human-interface-guidelines/playing-audio) | Nutzer erwarten Kontrolle über Audio und Unterbrechungen. Wichtige Informationen benötigen weitere Darstellungswege. Empfehlungen für native Audio-Sessions beziehungsweise visionOS sind keine Browsergarantien. |
| [W3C WCAG 2.2: Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html) | Automatisch gestartetes Audio über drei Sekunden braucht eine unabhängige Steuerung. Ton kann Screenreader und Konzentration beeinträchtigen. Fluid geht bewusst weiter: standardmäßig aus, erreichbarer Mute und eigener Pegel auch für kurze Sounds. Das ist eine Produktentscheidung, kein pauschales WCAG-Gebot für jeden kurzen Ton. |
| [W3C: Sensory Characteristics](https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html) | Bedienanweisungen dürfen nicht allein von sensorischen Eigenschaften abhängen. Klang ergänzt sichtbare Zustände, Labels und Semantik; niemals „nach dem hohen Ton weiter“ als einziger Hinweis. |
| [W3C: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Statusinformationen müssen geeigneter assistiver Technologie zugänglich sein. Ein Erfolgston ersetzt keine passende Statusmeldung; nicht jede Klangphase erzeugt zusätzlich eine Live-Region-Ansage. |
| [Glasgow: Earcon Construction Guidelines](https://www.dcs.gla.ac.uk/~stephen/earcon_guidelines.shtml) | Forschungsbasierte, historische Hinweise für unterscheidbare Klangfamilien: Rhythmus und Timbre gemeinsam verwenden; nicht ausschließlich Tonhöhe. Fluid übernimmt Familienbildung und prüft Erlernbarkeit/Verwechslungen selbst. Alte konkrete Frequenzempfehlungen sind keine universelle Hörbarkeitsgarantie. |
| [WAI: Involving Users in Evaluating Web Accessibility](https://www.w3.org/WAI/test-evaluate/involving-users/) | Nutzertests ergänzen die Standardsprüfung; einzelne Teilnehmende repräsentieren nicht alle Behinderungen. Hörkomfort, Erkennbarkeit und Screenreader-Verträglichkeit benötigen menschliche Tests. |

## Webplattform und Versionsstand

| Baustein | Geprüfter Stand und Entscheidung |
|---|---|
| Web Audio | [Recommendation vom 17. Juni 2021](https://www.w3.org/TR/2021/REC-webaudio-20210617/) als stabile Grundbasis. Die aktuell veröffentlichte [Web Audio API 1.1 vom 22. September 2026](https://www.w3.org/TR/2026/WD-webaudio-1.1-20260922/) ist ausdrücklich **Working Draft**. Kein Versprechen, dass alle neuen APIs überall verfügbar sind. |
| AudioContext | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) dokumentiert breite Basisunterstützung sowie einen wiederverwendeten Context für mehrere Quellen. Ein optionales, pro Host kontrolliertes Audio-Modul genügt. |
| Autoplay | [Chrome](https://developer.chrome.com/blog/autoplay/) und [MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) beschreiben Aktivierungsregeln und suspendierte Contexts. Browserfreigabe, gespeicherte Vorliebe und aktuell aktivierte Wiedergabe sind drei verschiedene Zustände. Kein stummer Autoplay-Trick. |
| Policy-Abfrage | [Autoplay Policy Detection, Working Draft vom 9. November 2026](https://www.w3.org/TR/2026/WD-autoplay-detection-20261109/) ist keine notwendige Voraussetzung. Die Runtime prüft Fähigkeiten und das tatsächliche Ergebnis von `resume()`. |
| Timing | [AudioBufferSourceNode.start](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start) erlaubt geplante Startzeit und Offset. [getOutputTimestamp](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp) verbindet Audio- und Performance-Zeit; [outputLatency](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/outputLatency) liefert eine Schätzung. Softwarezeitpunkte beweisen weder Lautsprecher-Onset noch Bluetooth-Synchronität. |
| Offline-Prüfung | [OfflineAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext) rendert in einen Buffer ohne Geräteausgabe. Gut für Hüllkurven, Peaks, Enden und Referenz-WAV; kein Beleg, dass Live-Audio hörbar oder synchron war. |
| Hintergrund | [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) erlaubt bewusstes Pausieren bei verborgenem Dokument. Nach Rückkehr wird kein Stapel alter Sounds abgespielt. |
| Eigene DSP | [AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet) ist für eigene Audioverarbeitung vorgesehen. Zunächst reichen Buffer, Gain und Filter. Worklet nur nach belegtem Bedarf; kein deprecated ScriptProcessorNode. |
| Three.js | Installiert `0.187.0`. [Three Audio](https://threejs.org/docs/pages/Audio.html) verwendet ebenfalls Web Audio und AudioListener. Für die flache Fluid-UI wählen wir eine rendererunabhängige Schicht; ein späterer räumlicher Adapter bleibt möglich. |
| Tone.js | Offizielles GitHub-`latest` verweist auf [15.1.22](https://github.com/Tonejs/Tone.js/releases/tag/15.1.22). [Tone](https://tonejs.github.io/) bringt Musik-/Synthese- und Transportabstraktionen. Für kurze UI-Cues derzeit unnötiger zusätzlicher Transport. Nicht installiert oder gepinnt. |
| Howler.js | Offizielles GitHub-`latest` verweist auf [2.2.4](https://github.com/goldfire/howler.js/releases/tag/v2.2.4). [Howler](https://github.com/goldfire/howler.js) bietet Wiedergabe, Sprites und Browserabstraktionen. Für den ersten Fluid-Adapter überwiegt die direkte Kontrolle über Clock und Unterbrechung. Nicht installiert oder gepinnt. |

Die zwei Library-Versionen sind beobachtete GitHub-Release-Tags, keine erfolgreich
abgefragten npm-Dist-Tags: der Registryabruf war im Recherchewerkzeug nicht
verfügbar. Vor einer späteren Paketadoption müssten Registry, Lizenz und
Kompatibilität erneut geprüft werden. Dieser Plan benötigt kein Dependency-Upgrade.

## Konkreter Integrationsbefund

- `packages/webgpu/src/timeline.ts` besitzt bereits Start, Pause, Play, Seek,
  Suspend und Resume. Die Präsentationszeit ist nicht der fachliche Commit.
- `packages/webgpu/src/index.ts`: `onMetrics` ist gedrosselt und keine Audio-Clock.
  `onPresentation` läuft im Renderfehlerpfad; dort darf kein fallibler Audioaufruf
  die Surface stoppen. Benötigt wird ein isolierter Playback-Lifecycle-Vertrag.
- `packages/react/src/index.tsx` setzt Szenen auch bei Resize oder Einstellungen
  erneut. `setScene` allein ist daher kein Beweis für ein neues hörbares Ereignis.
- `packages/contracts/src/effects.ts` und `packages/effects/src/presentation.ts`
  liefern aufgelöste Effekte und deterministische Darstellungsphasen. Der reine
  Sampler muss ohne akustische Seiteneffekte bleiben.
- `packages/contracts/src/sequence.ts` beschreibt Bilder und Geometrien. Ein
  Screenshot oder die vorhandene 60-Hz-Bildfolge ist kein Audio-Nachweis.
- `apps/studio/components/effect-lab.tsx`, `sequence-review.tsx` und
  `appearance-provider.tsx` bieten passende Bedien- und Ownership-Grenzen.
  Klangwahl bleibt unabhängig von Farbauswahl und visuellem Effektmodus.

## Nicht aus der Recherche ableiten

Kein zugesicherter Produktivitätsgewinn, keine Hörgesundheitsgarantie aus einem
digitalen Pegelwert, keine sichere Erkennung von Screenreadern, System-Stummmodus
oder fremder Medienwiedergabe durch Browsercode. Die GPU berechnet keinen Ton;
Audio darf einen erfolgreichen GPU- oder State-Start nicht voraussetzen oder
blockieren. WCAG-Minima ersetzen nicht die geplanten Hör- und Komforttests.
