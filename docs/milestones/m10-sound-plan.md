# M10 — Klangpaletten und kausales Soundfeedback

**Planentwurf zur Besprechung · 14. November 2026.** Beauftragt sind Recherche
und Planung. Es wurden noch keine Sounds erstellt, hörend geprüft oder in die
Runtime eingebaut. M10 ersetzt keine offenen Abnahmen der vorherigen Waves.

[Recherche mit Primärquellen](../research/sound-feedback.md) ·
[User-, Daten-, State- und URL-Flows](../flows/sound.md) ·
[Nachrechenbare Optionen](../decisions/m10-sound-scores.json).

## 1. Produktidee und klarer Nutzen

Eine Fluid-Oberfläche kann nicht nur räumlich, sondern auch akustisch zusammenhängen:
eine Aktion wird angenommen, etwas verändert seine Form, das Ziel ist erreicht.
Der Klang erklärt diese Ursache und Wirkung. Er soll das Produkt präziser,
fühlbarer und wiedererkennbar machen, ohne den Arbeitsfluss mit einer dauernden
Geräuschkulisse zu begleiten. Das sind Designziele; ein Usabilityvorteil muss
an denselben Aufgaben gegenüber der stummen Oberfläche geprüft werden.

Wir unterscheiden **semantische Rückmeldung** von **Bewegungsbegleitung**. Ein
angekommenes Panel ist kein erfolgreich gespeichertes Dokument. Ein abgewehrtes
Event ist keine erfolgreiche Auswahl. Diese Trennung verhindert irreführende
„Erfolgssounds“ und bleibt in allen Paletten gleich.

## 2. Vorgeschlagene Klangpalette

Die folgenden acht Familien sind eigene Gestaltungsrichtungen, keine fremden
Soundpakete und keine bereits bewährten oder qualifizierten Assets. **Stumm** ist
ein Betriebsmodus und zählt nicht als neunte Palette.

| Palette | Charakter | Übergang und Feedback | Passender erster Case |
|---|---|---|---|
| **Silk** | weich, elegant, zurückhaltend | kurzer luftiger Ansatz, sanfter Zug, gedämpftes Ankommen | Tabelle → Vergleich mit Silk Cascade |
| **Glass** | klar, leicht, präzise | kleine gläserne Impulse, kurze Resonanz; keine scharfen hohen Spitzen | Karte → Detail mit Liquid Lens |
| **Pulse** | trocken, technisch, rhythmisch | kurzer präziser Puls; Fortschritt und Rückarbeit mit unterscheidbarem Rhythmus | Flow Explorer: Prüfen → Abwägen → Nacharbeiten |
| **Felt** | warm, ruhig, nah | stark gedämpfte perkussive Rückmeldung, sehr kurzer Nachklang | häufige Auswahl und Sortierung in Datentabellen |
| **Ceramic** | taktil, kompakt, materiell | runder Anschlag, zwei klar unterscheidbare kurze Resonanzen | Module auswählen und in den Vergleich übernehmen |
| **Liquid** | organisch, fließend | gefilterte Strömung und weicher Druckwechsel; keine cartoonhaften Blubberfolgen | Detail entfalten und wieder schließen |
| **Air** | offen, leicht, räumlich | feine gefilterte Textur, sanftes Ein- und Ausatmen; mono verständlich | Atlas-Gruppe öffnen und zur Übersicht zurückkehren |
| **Prism** | experimentell, funkelnd | begrenzte tonale Fragmente verbinden sich zu einem kurzen Abschluss | Karten → Map mit Particle Weave |

**Erste Hörprobe: Silk, Glass und Pulse.** Sie unterscheiden sich deutlich in
Timbre und Rhythmus. Die anderen fünf werden nach dem ersten Hörvergleich
ausgearbeitet. Farbe und Klang sind unabhängig wählbar; Blau erzwingt weder
Glass noch Pulse. Die Zuordnungen oben sind Empfehlungen, keine festen Regeln.

### Gemeinsame semantische Sprache

| Cue-Rolle | Ursache | Vorgabe |
|---|---|---|
| `acknowledge` | eine ausdrücklich ausgelöste, gültige Aktion wurde angenommen | kurzer neutraler Impuls; nicht für jeden Klick oder jeden Tastendruck |
| `selection` | bestätigte Auswahl eines fachlichen Objekts | im dezenten Profil aus; bei Aktivierung zusammenfassen, keine Tonleiter beim Typeahead |
| `transition` | registrierter sichtbarer Übergang beginnt und erreicht sein Ziel | Start, Textur und Ankommen gehören zu einer begrenzten Gestalt; nicht pro Part oder Partikel |
| `return` | bewusstes Zurücknehmen oder Verlassen | erkennbar verwandtes Gegenmotiv; kein Fehlerton |
| `completed` | ein ausdrücklich definierter lokaler oder bestätigter externer Vorgang ist abgeschlossen | nur nach verifiziertem Ergebnis, nicht beim Start des Requests |
| `attention` | relevante Validierung verlangt eine Entscheidung | kurzer weicher Hinweis mit sichtbarer Erklärung, kein Alarm |
| `failed` | tatsächlicher Vorgang ist gescheitert | von Erfolg unterscheidbar, aber ohne erschreckenden Sprung im Pegel |
| `cancelled` | eine Aufgabe wurde bewusst abgebrochen | optional sehr kurze neutrale Rückmeldung; niemals verspätetes `completed` |

Im Flow-Explorer wird **Nacharbeiten** ausdrücklich `attention` zugeordnet:
eine fachliche Korrekturentscheidung, kein technischer `failed`-Zustand.
`return` bezeichnet dagegen die bewusste Rückkehr oder Rücknahme.

Hover, Pointerbewegung, Scroll, Caret, Text-/IME-Eingabe, automatische
Revalidierung, Prefetch und AI-Anpassungen bleiben standardmäßig stumm. Eine
20-teilige Choreografie löst einen Gruppenklang aus, keine 20 Einzelsounds.

## 3. Bewertete Entscheidungen

Gewichte wie im Projekt: Zielerfüllung 30 %, Korrektheit/Accessibility 25 %,
Testbarkeit 20 %, Lieferbarkeit 15 %, Erweiterbarkeit 10 %. Ratings 1–5 stehen
im [Score-Register](../decisions/m10-sound-scores.json). Werte sind
Planungsurteile, keine Messungen. Die hier gewählten Gewinner sind Empfehlungen
für die Diskussion, noch keine Implementierungsfreigabe.

| Entscheidung / Task | A | B | Hybrid — empfohlener Gewinner |
|---|---|---|---|
| Audio-Unterbau · ARCH | Clickhandler und einzelne Audioobjekte **49** | Allgemeine Musik-/Medienengine **76** | Kleiner Web-Audio-Adapter, gleiche Timeline, Synthese und kuratierte Samples **95** |
| Semantische Verträge · M10-01 | Manuelle Triggerkonventionen **64** | Freie generative Cue-Definitionen **50** | Strikte Rollenverträge plus registrierte Gestaltungsrezepte **97** |
| Lifecycle und Clock · M10-02 | Direktes Abspielen pro Click **55** | Eigener allgemeiner Transport **76** | Vorhandene Playback-Timeline plus isolierter Audio-Coordinator **95** |
| Erste Lieferung · M10-03 | Acht vollständige Paletten vor erster Hörprobe **71** | Ein technischer Piepton-Proof **67** | Drei kontrastierende Paletten in echten Cases **95** |
| Bedienung und Ausbau · M10-04 | Soundeinstellungen pro Widget **59** | Vollständiger Audioeditor **70** | Gemeinsame kompakte Steuerung plus vertiefender Studio-Inspector **97** |
| Replay und Aufnahme · M10-05 | Nur eine Audiodatei speichern **61** | Alte visuelle Schemas still erweitern **59** | Versionierter Umschlag mit visuellen Digests und AudioPlan **97** |
| Qualifikation · M10-06 | Kurzes subjektives Anhören **55** | Ausschließlich digitale Signaltests **77** | Signaltests, Lifecycle, Hörreview und lastgeprüfte Live-Messung **92** |
| Dokumentation · M10-07 | README-Ergänzung allein **60** | Separates Audiohandbuch **75** | Gemeinsame Feature-/AC-Matrix und beide OKF mit datierten Nachweisen **97** |

**Technischer Gewinner:** ein kleines optionales `@fluidkit/audio` über der
Web Audio API. Eigene kontrollierte Syntheserezepte und kuratierte kurze Samples
nutzen denselben Cue-Vertrag. Buffer werden vor ihrer geplanten Nutzung geladen
oder vorbereitet. Kein zusätzlicher musikalischer Transport, kein GPU-Audio-DSP,
kein AudioContext im Core und kein Audioaufruf im reinen Darstellungssampler.

## 4. Einstellungen und Studio

Vorgeschlagene Bedienung in **Showcase und Studio**:

- **Klänge aktivieren / Stumm**, immer gut erreichbar, inklusive Tastatur.
- Palette wählen; **Vorhören** spielt nur nach expliziter Aktion einen einzelnen
  Cue oder eine kurze bewusst gestartete Case-Sequenz. Die reine Auswahl bleibt stumm.
- Eigener Pegel mit konservativem Startwert; kein Zugriff auf Systemlautstärke.
- Profil **Dezent** als Vorgabe nach Aktivierung: ausgewählte Aktionen und
  wichtige Ergebnisse; Bewegungstextur aus. **Expressiv** aktiviert zusätzlich
  begrenzte Übergangstexturen. **Nur Ergebnisse** lässt Aktion-/Bewegungscues aus.
- Erweiterte Regeln: **Fix / Seed-Variation / pro Case**. Variationen bleiben
  innerhalb derselben semantischen Rolle und Palette; kein Zufall zwischen
  Erfolgs- und Fehlerbedeutung. Aufgelöste Variationen werden aufgezeichnet.
- Bestehende Effektmodi bleiben separat. Ein visueller Effektwechsel überschreibt
  weder Klangpalette noch Pegel. Bei reduziertem Bewegungsumfang entfällt der
  bewegungsgebundene Klang; separat aktivierte semantische Rückmeldung bleibt möglich.

Studio ergänzt eine **Klangspur** unter der Transition-Timeline: Rolle, geplante
Zeit, abgespielter/abgebrochener/unterdrückter Cue, Palettenversion und kurze
Begründung. Wellenform und Pegel helfen bei der Prüfung; technische Diagnosen
liegen im Inspector, nicht in jedem normalen Nutzerfluss.

Kein allgemeiner DAW-/Musikeditor in M10. Beliebige Asset-Uploads, AI-Soundgenerierung,
räumliches XR-Audio, Sprachansagen und Haptik sind spätere getrennte Entscheidungen.
Falls später AI eingesetzt wird, gilt unverändert Vercel AI SDK auf dem Server;
Generierung und Lizenz-/Qualitätsfreigabe dürfen nicht im Live-Interaktionspfad liegen.

### Aktivierung und persönliche Vorlieben

Frischer Einstieg bleibt stumm. Palette, Profil und Pegel dürfen lokal persistiert
werden; eine gespeicherte Vorliebe erteilt weder Browserfreigabe noch automatisch
eine neue hörbare Session. Aktivierung erfolgt über eine klar bezeichnete Aktion.
Audiofehler und Browserblockaden werden sichtbar gemeldet; die Oberfläche bleibt
vollständig nutzbar. Ein fehlender Cue wird ausgelassen, statt Minuten später
nachzulaufen. Stumm schaltet ausstehende Cues sofort ab und blendet laufende kurz aus.

Webseiten können System-Stummmodus, Screenreader-Ausgabe und fremde Wiedergabe
nicht zuverlässig als allgemeine Policy erkennen. Wir versprechen kein automatisches
Ducken fremder Apps. Innerhalb unserer eigenen Stimmen wird priorisiert; die
Nutzerkontrolle bleibt maßgeblich. Im Hintergrund und nach Unterbrechung kein Autoresume
alter Klänge. Sichtbare Session erfordert bei Rückkehr ein ausdrückliches Fortsetzen.

## 5. Verträge und Paketgrenzen

Alle neuen serialisierbaren Types werden aus strikten Zod-Schemas abgeleitet.
Die Namen sind Entwurf, kein bereits vorhandenes API-Versprechen.

| Vertrag | Inhalt |
|---|---|
| `AudioPreferences` | Version, Palette/Version, Profil, Pegel, Cue-Gruppen, Variation; aktive Sessionfreigabe separat und nicht exportierbar |
| `SoundPaletteDefinition` | ID, Version, Gestaltungsbeschreibung und Rollen; fixe Syntheserezepte oder interne Asset-IDs, keine freien ausführbaren Programme |
| `SoundAssetManifest` | Digest, Urheber, Lizenz/Attribution, Ursprung, Dauer, Format, Kanalzahl und erwartete Decodierungsgröße |
| `ResolvedAudioPlan` | Plan-/Event-/Playback-Bezug, Revision, Case, visueller Effektbezug, Palettenversion, Seed und endgültige Cue-Liste |
| `AudioCue` | stabile ID, semantische Rolle, relativer Zeitanker, Dauer, Gain-Hüllkurve, Asset-/Rezeptreferenz und Priorität |
| `PlaybackObservation` | Surface-/Session-/Generations-ID, Modus Live/Replay/Diagnose, Aktion, Zeitanker, Position, Dauer; keine Feldinhalte |
| `PresentationRecording` | neuer versionierter Umschlag um unverändertes VisualScenario v2/v3 samt Digest und optionalem AudioPlan |
| `AudioReviewReport` | Browser/OS/Outputklasse, Build, Assets/Hashes, Cue-Trace, digitale Prüfung, getrennte Hör- und Lastnachweise, offene Grenzen |

`packages/contracts/src/audio.ts` beschreibt die Daten. `packages/audio` enthält
reinen Resolver, injizierten Coordinator und austauschbaren Web-Audio-Adapter.
Ein Host teilt einen Context zwischen seinen Surfaces; Hostbesitz und geliehener
Context werden unterschieden. Keine globale Instanz beim Import, SSR bleibt möglich.
Der Core liefert bestätigte Ereignisse, ruft aber keine Browser-Audio-API auf.

Die Surface erhält einen kleinen isolierten Playback-Lifecycle-Observer.
**Nicht** `onMetrics` als Clock verwenden (aktuell bis 80 ms gedrosselt),
**nicht** fallible Audioaufrufe an den Render-Fehlerpfad hängen. Resize, Themewechsel
und RestoreLive dürfen denselben Plan nicht neu hörbar auslösen.

### Timing, Abbruch und Wiederholung

1. Fachzustand wird ohne Warten auf Audio committed. Ein einmal aufgelöster Plan
   bindet Sound an Event-/Clip-Identität, nicht an eine beliebige Renderausführung.
2. Audio wird auf `AudioContext.currentTime` geplant. Ein Clock-Adapter verbindet
   ihn mit der vorhandenen monotonen Präsentationszeit. `getOutputTimestamp`
  und Latenzwerte sind optionale Diagnosen, keine zwingenden Voraussetzungen.
  Nach jedem Resume wird der Anker erneuert: Audiozeit kann stehen geblieben
  sein, während Performancezeit fortgeschritten ist. Nullwerte oder fehlende
  Zeitstempel bleiben unbekannt; kein erfundener fixer Bluetooth-Offset.
3. Kurze Cues erhalten eine Gain-Hüllkurve; Daueränderungen verwenden definierte
   Phasen beziehungsweise Varianten, nicht willkürliche Tonhöhenänderung durch Stretching.
4. Neue Generation, Pause, Unmount, GPU-Verlust oder Mute verwerfen alte Starts.
   Laufende Stimmen werden kontrolliert ausgeblendet. Ein überholter Abschluss
   darf nicht mehr ertönen, auch wenn ein Decode-Promise später auflöst.
5. Seek bleibt in beide Richtungen stumm. Resume startet nur zukünftige Impulse;
   eine noch gültige Bewegungstextur darf mit Offset und kurzer Einblendung weiterlaufen.
6. Replay braucht eine bewusste Tonaktivierung und eine neue Playback-ID. Neue
   Palettenversionen verändern aufgezeichnete Pläne nicht. Alte VisualScenarios
   bleiben unverändert lesbar und stumm; fehlende Assets melden einen Teilfehler.
7. Im Studio besitzt genau eine bewusst aktive Surface den hörbaren Kanal.
   Vorhören ersetzt diesen temporär: alten Owner sperren und vollständig ausblenden,
   erst danach Preview starten. Rückgabe erlaubt nur zukünftige Cues, niemals
   Wiederaufnahme alter Impulse oder Texturen. Pause einer Surface suspendiert
   nicht blind einen von anderen Besitzern verwendeten Context.
8. Keine zweite rAF-Schleife. Etwaige Audio-Planungsjobs laufen nur während
   aktiver Wiedergabe, enden mit ihr und sind im Ressourcenregister sichtbar.

### Daten- und URL-Regeln

Sound nutzt die realen Modul-IDs und vorhandenen Ereignisse. Audioadapter schicken
keine fachlichen Events zurück und führen keine externen Actions aus. Trace-Daten
enthalten Rollen, Zeitpunkte und Versionen, keine Texteingaben, Prompts oder
Gerätekennungen. Kein Mikrofon und keine personenbezogene Audioaufnahme erforderlich.

Palette, Mute, Pegel und Seek verändern weder Fachrevision noch URL/History.
Projektdateien enthalten teilbare Cue-/Case-Regeln und Secret-freie Assetreferenzen;
lokaler Pegel und Sessionaktivierung bleiben persönliche Einstellungen. Importierte
Dateien können die Aktivierung nicht einschalten. Deep Links und Popstate sind stumm.

## 6. Früher hörbarer Milestone M10a

Nach Vertrags-/Lifecycle-Proof folgt zuerst eine kleine echte **Listening Lab**-
Erweiterung im Studio und dieselbe Klangsteuerung im Showcase:

1. **Ordnen und Vergleichen:** echte Workspace-Module auswählen; Tabelle → Vergleich.
   Akzeptierte Auswahl, ruhiger Silk-Übergang, ein Ankommen; alle Identitäten bleiben erhalten.
2. **Öffnen und Entdecken:** Karte → Detail mit Liquid Lens und Glass; zurück mit
   verwandtem Gegenmotiv. Ansichtsabschluss wird nicht als Datenaktion bezeichnet.
3. **Entscheiden und Korrigieren:** Flow Explorer mit Pulse; Prüfen → Abwägen →
   Nacharbeiten → erneut Prüfen → lokaler Abschluss. Rückarbeit klingt anders als Fehler.

Jeder Case ist explizit startbar, jederzeit stoppbar und zwischen **Stumm / Silk /
Glass / Pulse** vergleichbar. Gleiche Ereignisse, gleiche visuellen Einstellungen,
hörend abgeglichene wahrgenommene Lautheit; gleiche digitale Peaks allein genügen
nicht. Dezent und Expressiv werden getrennt verglichen, sodass Bewegungstexturen
bewusst hörbar werden. Keine automatische Dauerschleife und kein Klang beim
Seitenaufruf. Eine semantische Legende erläutert, was zu hören sein soll.

**Diskussionspunkt nach M10a:** Hilft der Ton, wirkt er hochwertig und wäre er nach
20 Wiederholungen noch angenehm? Erst daraus ergibt sich die stilistische Richtung
der weiteren fünf Paletten. Ein negatives Ergebnis kann zu weniger Sound führen.

## 7. Feature-Matrix und ausführbare Tasks

Diese Vorschläge sind bewusst **nicht** in die 497 kanonischen Kriterien der
freigegebenen Waves eingerechnet. Alle M10-AC beginnen offen. Bei Freigabe werden
sie mit stabilen IDs durch Parser, Ledger und Feature-Matrix integriert; keine
manuelle „erfüllt“-Markierung aufgrund der Planung.

| Task | Feature / Abhängigkeit | Lieferstufe | Status |
|---|---|---|---|
| M10-01 | Semantische Cue-Verträge und Policy; Grundlage aller weiteren Tasks | Vorbereitung | geplant |
| M10-02 | Audio-Adapter, Lifecycle, Timing und Ownership; nach 01 | Vorbereitung | geplant |
| M10-03 | Silk/Glass/Pulse und drei echte Cases; nach 01–02 | **M10a: erste Hörprobe** | geplant |
| M10-04 | Acht Paletten, Showcase-/Studio-Steuerung und Case-/Seed-Regeln; nach Hörreview | M10b | geplant |
| M10-05 | Recording, Replay, Offline-Audio und gekoppelte Berichte; nach 02–03 | M10b | geplant |
| M10-06 | Hörprüfung, Accessibility, Ressourcen und Lastqualifikation; durchgehend, final nach 04–05 | M10c | geplant |
| M10-07 | Dokumentation, nachvollziehbare Evidenz und begrenzte Freigabe; nach jeweiligem Prüfschritt | M10c | geplant |

### M10-01 — Verträge und Semantik

- **M10-01-AC01:** Alle serialisierbaren Audiomodelle besitzen strikte Schema-Versionen; falsche Rollen, nicht endliche Zeiten, übergroße Pläne und unbekannte Rezepte werden vor Wiedergabe abgewiesen.
- **M10-01-AC02:** Gleiche Eingabe, Palettenversion und Seed erzeugen identische aufgelöste Cue-Listen. Erfolgs-, Fehler- und Rückarbeitrollen bleiben bei Variation unverändert.
- **M10-01-AC03:** Audioeinstellungen, Vorhören und Audiofehler ändern weder Fachrevision noch Daten, Auswahl oder URL; der Adapter besitzt keine Action-Ausführungsbefugnis.
- **M10-01-AC04:** Ein Triggerregister unterscheidet angenommenes Event, Präsentationsabschluss und tatsächliches fachliches Ergebnis. Tests schließen Erfolg bei abgelehnten/überholten Events und fehlgeschlagenen Actions aus.

### M10-02 — Engine und Lebenszyklus

- **M10-02-AC01:** Cold Start, Reload, Deep Link, Import und Diagnoseläufe erzeugen null Audio-Starts. Explizite Aktivierung und blockiertes/fehlgeschlagenes `resume()` sind sichtbar; die UI bleibt funktional.
- **M10-02-AC02:** Mindestens 100 generierte Pause-/Seek-/Interrupt-/Decode-Race-Sequenzen erzeugen keine doppelten oder überholten Cues. Seek startet null Stimmen; Resize, Theme und RestoreLive duplizieren keinen Commit.
- **M10-02-AC03:** Mute/Cancel löschen geplante Starts. Offline-Nachweis: spätestens 20 ms nach akzeptiertem Abbruch ist der eigene digitale Ausgang stumm. Tatsächlich hörbare Geräte-Nachlaufzeit wird davon getrennt ausgewiesen.
- **M10-02-AC04:** Maximal ein eigener Context je Host; maximal vier Stimmen insgesamt, davon höchstens eine Bewegungstextur. Nach 100 Owner-Mount-/Unmount-Zyklen null verbliebene eigene Jobs, Listener und Stimmen; geliehener Context wird ohne Hostbefugnis weder suspendiert noch geschlossen.
- **M10-02-AC05:** Idle, Visibility, Audio-Unterbrechung, GPU-Verlust und Mute während Aktivierung sind getestet. `activate → hidden → resolve → visible` erzeugt null Starts bis zur bewussten Fortsetzung; jede Wiederaufnahme verankert die Clock neu. Kein Nachholen alter Cues; Audioobserverfehler stoppen keinen GPU-Scheduler.

### M10-03 — Hörbarer Zwischenstand

- **M10-03-AC01:** Silk, Glass und Pulse besitzen je alle acht Cue-Rollen mit gemeinsamer Semantik und Asset-/Rezeptversion; Originalherkunft und Nutzungsrechte sind dokumentiert.
- **M10-03-AC02:** Alle drei beschriebenen Cases laufen mit echten Workspace-Daten. Eine explizite Aktion startet die Vorführung; Stop und Übernahme durch den Nutzer funktionieren jederzeit.
- **M10-03-AC03:** Jede Palette lässt sich bei gleichen Cases/Effekten mit Stumm vergleichen; wahrgenommene Lautheit ist hörend abgeglichen und dokumentiert. Das Ergebnis enthält tatsächlich angehörte Hinweise zu Klarheit, Komfort und Wiederholungen, keine automatische Hörfreigabe.
- **M10-03-AC04:** Desktop und 390-px-Ansicht zeigen klare Steuerung ohne Überlappungen. Bild und Ton werden getrennt belegt: Originalscreenshots plus eigener Cue-/Audio-Nachweis, keine behauptete Audioprüfung aus Screenshots.

### M10-04 — Palette und Authoring

- **M10-04-AC01:** Acht benannte Klangpaletten sind nach ihrer Hörreview auswählbar; jedes Rezept besitzt dieselben semantischen Rollen. Reine Palette-/Farbwahl spielt keinen Ton und überschreibt keine individuelle Lautstärke.
- **M10-04-AC02:** Showcase und Studio verwenden denselben Adapter und dieselben Einstellungen für Stumm, Pegel, Profil, Palette und Vorhören; alle Controls sind per Tastatur bedienbar und klar beschriftet.
- **M10-04-AC03:** Fix, Seed-Variation und Case-Regeln sind validiert, deterministisch auflösbar und im Inspector erklärt. Bei Surface-/Preview-Übergabe wird der alte Owner zuerst stumm; danach startet der neue. Rückgabe spielt keine alten Impulse/Texturen nach; nie zwei hörbare Owner gleichzeitig.
- **M10-04-AC04:** Lokale Speicherung enthält keine aktive Sessionfreigabe. Speicherfehler bleiben sichtbar; fremde oder beschädigte Projekt-/Importwerte können Audio nicht einschalten.

### M10-05 — Replay und Prüfartefakte

- **M10-05-AC01:** VisualScenario v2/v3 bleiben unverändert gültig und stumm. Der neue Recording-Umschlag bindet visuellen Digest, AudioPlan und Assets; Manipulation, fehlende Assets und unbekannte Versionen werden diagnostiziert.
- **M10-05-AC02:** Replay erfordert ausdrückliche Aktivierung; alte Impulse werden nach Seek/Resume nicht wiederholt. Beliebige Testreihenfolge `0 → 1 → 0,5 → 0` bleibt beim Scrubbing stumm und führt keine fachliche Aktion aus.
- **M10-05-AC03:** Offline-WAV und Cue-Trace sind reproduzierbar im fixierten Browser-/Sample-Rate-Profil; plattformübergreifend werden deklarierte Signal-Toleranzen statt pauschaler Bytegleichheit verwendet.
- **M10-05-AC04:** Jeder freigegebene Audiolauf bindet Build, Seed, Palette, Asset-Hashes, Visual-Run und Vollständigkeit. Geplante, tatsächlich gestartete, unterdrückte und abgebrochene Cues bleiben unterscheidbar; Render-WAV ist kein Live-Mitschnitt.

### M10-06 — Hörqualität, Accessibility und Leistung

- **M10-06-AC01:** Jede Palette besteht Mono-, Lautsprecher- und Kopfhörer-Hörreview für alle Rollen und 20 Wiederholungen der häufigsten Aktion; Verwechslungen und als störend bewertete Wiederholungen führen zur Überarbeitung oder zu dokumentierter Einschränkung.
- **M10-06-AC02:** Alle Journeys bleiben stumm vollständig lösbar. Manuelle Tastatur-/Screenreader-Prüfung bestätigt Mute, Statussemantik und fehlende Maskierung wesentlicher Hinweise; Reduced Motion unterdrückt Bewegungscues ohne Audiooptionen gleichzusetzen.
- **M10-06-AC03:** Offline-Signale besitzen endliche Samples und definierte Stille vor/nach dem Cue; maximaler digitaler Sample-Peak des erlaubten Worst-Case-Mix bleibt bei höchstem Produktpegel ≤ −1 dBFS. Kurzklänge werden zusätzlich hörend abgeglichen; dieser Messwert ist keine Aussage über Lautstärke am Ohr.
- **M10-06-AC04:** Audio-aus/Audio-an-Leistungsläufe verwenden gleiche Daten, Build, Gerät und visuelle Effekte. CPU-/GPU-Fremdlast wird vor und während jedem Lauf erfasst; ungeklärte Attribution oder konkurrierende Builds führen zu `inconclusive`, nicht zur Performancefreigabe.
- **M10-06-AC05:** Aktueller Chromium-, Firefox- und Safari-Pfad sowie iOS/Android werden als konkrete Browser-/OS-/Outputprofile geprüft. Fehlende Geräte bleiben offen. Software-Startzeiten, ausgegebene Latenzschätzung und tatsächlich gemessener Audio-/Bild-Onset erhalten getrennte Resultate.

### M10-07 — Dokumentation und Freigabe

- **M10-07-AC01:** Erst bei Planannahme werden M10-Tasks und alle 30 Einzel-AC kanonisch eingelesen. Bisherige Texte, Status und historische Evidenz bleiben unverändert nachvollziehbar.
- **M10-07-AC02:** Feature-Matrix, Mermaid-Flows, Engineering- und Public-OKF erklären Palette, Aktivierung, Lautstärke, Replay, Fehler sowie genaue Prüfgrenzen; Screenshots und Hörartefakte sind ihrem tatsächlichen Build zugeordnet.
- **M10-07-AC03:** Menschliche Hörentscheidung, technische Tests und gemessene Leistung sind getrennte Gates. Kein grüner Screenshot-/AI-Designcheck ersetzt Audio-, Geräte- oder Accessibility-Nachweise.
- **M10-07-AC04:** Freigabe enthält Supportmatrix, bestätigte Rechte und Größenbudgets; bei Problemen deaktiviert der Host Audio, ohne Fachfunktion oder WebGPU-Darstellung zu verlieren.

## 8. Gewählte Anfangsbudgets und Evaluation

Diese Werte sind **Vorschläge für den Proof**, keine Messergebnisse oder
allgemeingültigen Hörgrenzen:

- Aktionsimpulse ungefähr 40–140 ms, Ergebnis-Cues 120–350 ms. Bewegungstexturen
  höchstens 800 ms und nie länger als ihre tatsächlich verbleibende Transition.
- Dezent: höchstens vier kurze Cues pro Sekunde; Auswahl/Sortierung innerhalb
  120 ms zusammenfassen. Ergebnis-/Fehlerrollen haben Vorrang vor Dekoration.
- Höchstens vier aktive Stimmen, 16 MiB eigener decodierter Cache, zunächst
  höchstens 1 MiB Download pro gewählter Palette. Nur aktive Palette vorladen;
  Überschreitungen erfordern dokumentierte Neubewertung statt stiller Aufweichung.
- Eigenen Context ohne Arbeit nach höchstens zwei Sekunden als **Idle** suspendieren;
  keine Daueroszillatoren mit Gain null. Eine bereits aktivierte Session darf bei
  einer neuen bewussten Nutzeraktion aufwachen. Vom Browser blockierte Wiederaufnahme
  verlangt Retry; nur ein noch aktueller Cue innerhalb 100 ms darf dann starten.
  Längere Aktivierung verwirft den Cue. Visibility/System-Unterbrechung erfordert
  dagegen ausdrücklich Fortsetzen. Geliehene Contexts nur mit Hostbefugnis
  suspendieren/schließen. Wiederaufnahmeverzögerung separat messen; nach vollständigem
  Dispose eigenen Context schließen, nicht pro Cue neu erzeugen.
- Software-Ziel: P95 des zusätzlichen Event→Audio-Scheduling-Anteils ≤10 ms
  auf dem benannten Referenzgerät. Für einen hörbaren Onset unter 100 ms ist
  ein eigener Ende-zu-Ende-Nachweis nötig; Bluetooth erhält keine ungeprüfte Zusage.
- Stichprobe für formative Evaluation: 6–8 Personen mit unterschiedlichen
  Soundvorlieben, darunter nach Möglichkeit Screenreader-Nutzende. Gegengewichtete
  Reihenfolge stumm/Dezent/Expressiv; gleiche Aufgaben. Messen: Fehler, Dauer,
  Interpretation von Abschluss/Rückarbeit, wahrgenommene Synchronität, Komfort
  nach Wiederholung. Das ist Richtungsfeedback, kein statistischer Produktivitätsbeweis.

Die Aussage „es klingt gut“ braucht eine reale Hörprobe. Die Aussage „es ist
synchron“ braucht einen sauber bezeichneten Timingnachweis. Automatische Prüfung
und spätere AI-Kritik können diese Arbeit ergänzen, aber nicht ersetzen.

## 9. Vorschlag für unsere nächste Besprechung

1. **Grundcharakter:** Silk als zurückhaltender Standard nach Aktivierung;
   Glass/Pulse als Kontrast im ersten Proof.
2. **Umfang:** semantische Rückmeldung zuerst; expressive Bewegungsbegleitung
   als bewusste zusätzliche Wahl.
3. **Richtung nach der Hörprobe:** weitere fünf Familien ausarbeiten, reduzieren
   oder einzelne Familien neu gestalten. Die technische Trennung erlaubt das,
   ohne Daten-, State- oder Renderer-Modell erneut aufzubauen.
