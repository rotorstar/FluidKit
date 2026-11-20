# M3 — TypeGPU und die erste ausführbare Effekt-Library

Datum: 2026-11-01. Umsetzung von T47–T49 gemäß Plan v2.1 und ADR-0004.
Die freigegebenen Architektur-/Alternativbewertungen bleiben verbindlich.

## Lieferreihenfolge

1. Separates GPU-Kernel-Paket, exakt fixierte Kandidaten, Vite-Transformation.
   Shape-Invarianten und GPU-Readback qualifizieren den Kernel; die produktive
   Materialintegration verwendet weiterhin ein Device und den vorhandenen Scheduler.
2. Zod-Verträge für Effekt-Rezepte, Einstellungen und aufgelöste Pläne. Resolver
   priorisiert Transition, Case und Projekt, filtert Fähigkeiten, zeichnet Seed und
   Version auf und behandelt leere Pools / Reduced Motion / fehlende Versionen.
3. Surface verwendet den Plan für Fluid Morph, Spring Reflow und Ripple Reveal.
   Eingabefelder bleiben von optischer Verzerrung ausgenommen. Unterbrechung startet
   vom aktuellen Bild, auslaufende Controls werden nicht reaktiviert.
4. Studio bietet Library, Auswahlmodi, Case-Regeln, Intensität, Dauer, Seed, Timeline,
   Pause/Scrub und Replay/Export. Änderungen werden als eigene Präsentations-
   Konfiguration geführt und verändern keine Fachrevision. Eine mit WebGPU gezeichnete
   Effektleiste im Showcase verwendet denselben Zustand und dieselben Befehle.
   Rezept-/Modusänderungen gelten für den nächsten Wechsel und starten laufende
   Animationen nicht neu.
5. Browserprüfung beider Backends, echte GPU-Konformanz, Replay-/Cancel-/Inputtests;
   danach RP1-Gates weiter schließen und Matrix/Flows aktualisieren.

## Abnahme

- Keine Peer-Overrides, keine TypeScript-Operator-Erweiterung, reproduzierbarer Build.
- Reale Shape-Referenzwerte und GPU-/CPU-Vergleich mit dokumentierter f32-Toleranz.
- Fixed/Random/Case/Off, Priorität, Seed-Variation, Inkompatibilität und Version geprüft.
- Ein aufgezeichneter Run verwendet dieselbe Rezeptauswahl bei Replay.
- Domainzustand, Daten und Fokus werden nicht zu Effektphasen umdefiniert.
- Tatsächliches Backend und aktiver Shaderpfad sind im Studio sichtbar.
- Showcase und Studio bleiben bei Rezept, Modus und Seed synchron; die GPU-Leiste
  funktioniert mit Pointer und Tastatur auch bei 320 px Surface-Breite.
- Resource- und Device-Lifecycle bleiben beim Surface-Owner.
- Keine pauschale Behauptung von Performance-, Accessibility- oder Produktionsreife.
