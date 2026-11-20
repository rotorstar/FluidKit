# Sprachwechsel auf der GPU

Chrome 157 hat auf dem macOS-Testhost mit Apple Metal 3 (Hardwareadapter) die WebGPU-Surface und den expliziten Three.js-WebGL2-Pfad mit denselben Texten und Workspace-Daten gezeichnet. Die Nachweisdatei enthält Browserversion, Quellenfingerabdruck, tatsächliches Backend, Surfacebreite und PNG-Hashes der isolierten Prüfszene. [GPU-Nachweise](gpu-locales.json)

| Prüfung | Ausführung | Ergebnis |
|---|---|---|
| Sprache während der Bewegung | Alle sechs gerichteten Sprachwechsel zwischen Deutsch, Englisch und Französisch. Vier Breiten von 320 bis 1280 px, beide Backends und Reduced Motion jeweils ein/aus | 16 Profile. Die laufende Präsentation behielt im pausierten Clip den Zeitpunkt. Die ursprüngliche Aufnahme behielt ihre Sprache. |
| Rückwärts-Replay | Alle sechs Sprachpaare, beide Backends, vier Breiten. GPU-Frame bei 50 % sichern, Sprache wechseln, Originalaufnahme importieren, zum Ende und zurück auf 50 % springen. | Alle 48 Paare liefern denselben PNG-SHA-256 vor und nach dem Sprachwechsel. Die Hashes stehen je Profil unter `originalReplayHashes`. |
| Französische Zahlen | Die echte GPU-Textfläche zeigt „Dépendances“ und den mit Intl formatierten EUR-Betrag. Glyph vermisst „1 234“ gegen „1234“ und „1 234“. | U+202F hat eine positive, schmalere Laufweite als U+00A0. Das Eurozeichen und der Gruppenabstand sind im Schriftatlas enthalten. |
| Lange Bezeichnungen | Eine isolierte Pseudofassung verlängert die drei Beschriftungen um mindestens 35 %. | Jede Beschriftung mit messbarer Glyphtinte, ohne Überlappung oder Ellipse. |
| Echte Formübergänge | Tabelle ↔ Karten, ausgewählter Vergleich ↔ Karten, Atlas ↔ Ebene. 21 Prüfpunkte pro Richtung in drei Sprachen, vier Breiten und zwei Backends | 3.024 Prüfpositionen ohne gemeldete Textkollision. Der französische Abhängigkeiten-Spaltenkopf bleibt an den Tabellenendpunkten vollständig. |
| Gemischte Schreibrichtungen | Separater Noto-Sans-Arabic-Test mit arabischem Satz, lateinischer Modul-ID, Zahl und Klammern. Yoga prüft logischen Startabstand und physische Diagrammkoordinaten. | Beide BiDi-Laufrichtungen erkannt. Alle vier Textsegmente liefern Auswahl- und Caret-Geometrie. [Offline-Test](../../../tests/unit/m11-workspace-locales.test.ts) |
| Japanischer Schriftkorpus | Die separat gebackene Noto-Sans-JP-Untermenge prüft freigegebene Zeichen und meldet fehlende Glyphen. | Die Qualifikation mobiler Tastaturen und Betriebssystem-IMEs erfolgt am jeweiligen Gerät. [Korpustest](../../../tests/unit/font-fallback.test.ts) |

Die erste Sequenzprüfung fand bei 10–15 % der Bewegung sichtbare Kollisionen. Beim Übergang vom Vergleich zu Karten folgte die noch ausgeschriebene Zusammenfassung schon der neuen Karte. Bei 1280 px kreuzte kurzzeitig die Auswahlmarkierung den Modultitel. Der Sampler hält den ausgehenden Text bis zur Übergabe an seinem Ursprung und blendet bewegte Auswahlmarken früher aus. Die Werte oben stammen aus der Wiederholung nach diesen Korrekturen.

Das Studio kann aus einem lokalen Originalclip mit bekannten Fach-Snapshots einen eigenständigen übersetzten Run erzeugen. Der Herkunftshash bezieht sich auf die UTF-8-kodierte JSON-Serialisierung des redigierten Originals. Ein importierter Clip ohne rekonstruierbaren Fachkontext behält ausschließlich seine aufgezeichnete Darstellung.

Der Lauf liefert Geometrie- und Bildnachweise auf einem Desktophost. Hardware-Frametimings, Screenreader, Android- und iOS-Eingabe sowie die sprachliche Redaktion der drei Editionen haben eigene Abnahmen.

## Reproduzieren

Aus dem Repository-Stamm mit installiertem Chrome ausführbar.

```sh
FLUID_CAPTURE_DIR=/tmp/fluidkit-gpu-locales node scripts/qa/qualify-gpu-locales.mjs
npm test -- tests/unit/m11-workspace-locales.test.ts tests/unit/font-fallback.test.ts
```

Der Runner startet einen lokalen Vite-Prozess, liest die tatsächlichen Workspace-Paketdateien, führt die Surface-Tests aus und schließt Browser und Server. Der optionale Ausgabeordner erhält die JSON-Ergebnisse. [Qualifikationsrunner](../../../scripts/qa/qualify-gpu-locales.mjs)
