---
type: Acceptance Register
title: Alle Acceptance Criteria und Abweichungen
description: 518 Kriterien mit tatsächlichem Status, Scope, Belegen und Restarbeiten.
audience: engineering
tags:
  - reference
  - generated
status: draft
generated:
  by: process:fluidkit-knowledge-sync
  at: 2026-11-23T10:46:25.000Z
stale_after: 2026-12-02T00:00:00Z
sources:
  - id: implementation
    resource: assets/source-inventory.json
    title: SHA-gebundenes Quellinventar
---

# Sämtliche Acceptance Criteria

Diese Referenz übernimmt jedes Kriterium aus dem kanonischen Register einschließlich Scope und Restarbeiten. Sie wertet nichts als erfüllt auf. SHA-256 bindet Nachweise an den dort geprüften Stand. Die Originalartefakte liegen im Repository; sie werden nicht als unkontrollierte Run-/Bilddaten in den portablen Kontext kopiert.[^implementation]

## T01: Vision und Nachweisregister

### T01-AC01 · partial

Jede Vision besitzt Status, Entscheidung, Task und Abnahme. Leistungsbehauptungen sind als gemessen, Ziel oder Hypothese markiert

**Scope:** Vollständiger Planumfang

**Offen:** laufende Release-Evidenz

Kein Nachweis im Register.

## T02: Workspace und Toolchain

### T02-AC01 · partial

Reproduzierbarer Clean Install

**Scope:** Vollständiger Planumfang

**Offen:** Clean Install/Publishing und Node-26-Gate

Kein Nachweis im Register.

### T02-AC02 · partial

strict Typecheck, ESLint CLI und Paketbuilds funktionieren

**Scope:** Aktueller npm-Workspace mit Node 24.18.1, strict Typecheck/ESLint und Paket-/Next-Build; kein Node-26-/Clean-Install-Gate. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T02-AC03 · partial

keine Peer-Overrides oder produktiven `any`-Ausnahmen ohne Begründung

**Scope:** Aktueller npm-Workspace mit Node 24.18.1, strict Typecheck/ESLint und Paket-/Next-Build; kein Node-26-/Clean-Install-Gate. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T03: Vollständiger Machbarkeits-Proof

### T03-AC01 · partial

WebGPU als Standard und tatsächliches Backend nachgewiesen

**Scope:** Vollständiger Planumfang

**Offen:** IME/Screenreader/Supportmatrix

Kein Nachweis im Register.

### T03-AC02 · partial

IME/Fokus funktionieren auf der Zielmatrix

**Scope:** Vollständiger Planumfang

**Offen:** IME/Screenreader/Supportmatrix

Kein Nachweis im Register.

### T03-AC03 · partial

Mount/Unmount und Device Loss sind geprüft. Keine Freigabe allein anhand eines Screenshots

**Scope:** Vollständiger Planumfang

**Offen:** IME/Screenreader/Supportmatrix

Kein Nachweis im Register.

## T04: Renderer und Backend

### T04-AC01 · partial

WebGPU ist Default

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/backend-policy.test.ts`, SHA-256 `1627413db192d624ae61daca630a8d9f312436a83cf9043cbd72d7647e7b380d`

### T04-AC02 · partial

WebGL2-Fallback wird kenntlich gemacht

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/backend-policy.test.ts`, SHA-256 `1627413db192d624ae61daca630a8d9f312436a83cf9043cbd72d7647e7b380d`

### T04-AC03 · partial

ohne nutzbares Backend folgt ein definierter Fehler

**Scope:** Vollständiger Planumfang

**Offen:** Supportmatrix und automatische Fallback-Fehlerklassen

Kein Nachweis im Register.

### T04-AC04 · partial

aktive Backends werden im Test bestätigt

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/backend-policy.test.ts`, SHA-256 `1627413db192d624ae61daca630a8d9f312436a83cf9043cbd72d7647e7b380d`

## T05: Layout und Scene-Modell

### T05-AC01 · partial

Resize, DPR, Scroll, Clipping, Flex und Grid stimmen überein

**Scope:** Vollständiger Planumfang

**Offen:** Scroll/Clipping/Flex/Grid-Conformance und echte große GPU-Liste

Kein Nachweis im Register.

### T05-AC02 · partial

10.000 Datenzeilen werden virtualisiert statt vollständig gezeichnet

**Scope:** Vollständiger Planumfang

**Offen:** Scroll/Clipping/Flex/Grid-Conformance und echte große GPU-Liste

Kein Nachweis im Register.

## T06: Typografie und Assets

### T06-AC01 · partial

DE/EN, kombinierende Zeichen, RTL und definierte CJK-Fälle getestet

**Scope:** Vollständiger Planumfang

**Offen:** RTL/CJK/Font-Failure-Isolation

Kein Nachweis im Register.

### T06-AC02 · partial

fehlende Glyphen sichtbar diagnostiziert

**Scope:** Vollständiger Planumfang

**Offen:** RTL/CJK/Font-Failure-Isolation

Kein Nachweis im Register.

### T06-AC03 · partial

Asset-/Fontfehler blockieren nicht die gesamte Runtime

**Scope:** Vollständiger Planumfang

**Offen:** RTL/CJK/Font-Failure-Isolation

Kein Nachweis im Register.

## T07: Semantik und Eingabe

### T07-AC01 · partial

Tastatur-only und Screenreader-Journeys bestehen

**Scope:** Vollständiger Planumfang

**Offen:** manuelle Screenreader-/IME-/Mobile-Journeys

Kein Nachweis im Register.

### T07-AC02 · partial

IME, Auswahl, Copy/Paste, Touch und mobile Tastatur geprüft

**Scope:** Vollständiger Planumfang

**Offen:** manuelle Screenreader-/IME-/Mobile-Journeys

Kein Nachweis im Register.

### T07-AC03 · partial

keine doppelten aktiven Controls

**Scope:** Vollständiger Planumfang

**Offen:** manuelle Screenreader-/IME-/Mobile-Journeys

Kein Nachweis im Register.

## T08: Ressourcen und Scheduler

### T08-AC01 · partial

100 Mount/Unmount-Zyklen ohne verbleibende Listener/Jobs

**Scope:** Build fluid-b39ca981fb53ac0f3c6e: 100 echte React-/WebGPU-Zyklen im integrierten Chromium; explizit verwaltete Ressourcen und Idle-Frames. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Geräte, Initialisierungsabbruch und Langzeitsitzungen bleiben separate Gates. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-m6/lifecycle-100.json`, SHA-256 `3a169bf76d60cd31d71e85e7a2357eab2723f49fcecfbfac63e862a337736462`
- Nachweis: `packages/webgpu/src/resources.ts`, SHA-256 `cbb8b658c16e28d5c2ba36154b821ef5cacfb029250ffcb97efb0e732b17ed6c`
- Nachweis: `tests/unit/resources.test.ts`, SHA-256 `7ae8349ca5bd182d9caf9e57965a55d59a6e73aae19ed81ce7a80c8406700678`

### T08-AC02 · partial

keine Frames im ruhenden Zustand außer begründetem Bedarf

**Scope:** Build fluid-b39ca981fb53ac0f3c6e: 100 echte React-/WebGPU-Zyklen im integrierten Chromium; explizit verwaltete Ressourcen und Idle-Frames. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Geräte, Initialisierungsabbruch und Langzeitsitzungen bleiben separate Gates. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-m6/lifecycle-100.json`, SHA-256 `3a169bf76d60cd31d71e85e7a2357eab2723f49fcecfbfac63e862a337736462`
- Nachweis: `packages/webgpu/src/resources.ts`, SHA-256 `cbb8b658c16e28d5c2ba36154b821ef5cacfb029250ffcb97efb0e732b17ed6c`
- Nachweis: `tests/unit/resources.test.ts`, SHA-256 `7ae8349ca5bd182d9caf9e57965a55d59a6e73aae19ed81ce7a80c8406700678`

### T08-AC03 · partial

Geräteverlust erhält Nutzerdaten

**Scope:** Historischer f706-nativer React-Geräteverlust erhält Draft/Revision/Sortierung/Auswahl/URL. M8-Source-Review und aktueller React/Core-Test mit deterministischem Surfaceport bestätigen dieselbe Ownership und unveränderte Felder/Route beim Recovery; keine neue GPU-Verlust- oder allgemeine Hardwarefreigabe. Nachfolgender portabler ReturnType-Export von useFluid ist exakt auf den vorherigen Sourcehash zurückgeführt; transpiliertes Runtime-JS byteidentisch (v3). Der spätere Replay-Modusgetter ist nur lesend; Geräteverlust-/Recoverypfad und Besitzverhältnisse bleiben unverändert (Native-Proof-Addendum). Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Verlust-/Abbrucharten und Supportprofile qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T09: Statecharts und Kontrollmodi

### T09-AC01 · partial

Ungültige Events verändern nichts

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/runtime.test.ts`, SHA-256 `2b1052ea502e431608c33e349686e78d2dd5bfde3c57322a2a81ebe667ecf854`

### T09-AC02 · partial

Manual ruft keine Modelle auf

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/runtime.test.ts`, SHA-256 `2b1052ea502e431608c33e349686e78d2dd5bfde3c57322a2a81ebe667ecf854`

### T09-AC03 · partial

Hybrid benötigt Freigabe

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/runtime.test.ts`, SHA-256 `2b1052ea502e431608c33e349686e78d2dd5bfde3c57322a2a81ebe667ecf854`

### T09-AC04 · partial

Auto überschreitet keine Allowlist

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/runtime.test.ts`, SHA-256 `2b1052ea502e431608c33e349686e78d2dd5bfde3c57322a2a81ebe667ecf854`

### R2-AC04 · partial

Ein wiedereintretender Guard überschreibt kein neueres Event. Disposal durch Beobachter verhindert verspätete Aktionen. Responsive Fokusziele werden pro Surface mit deren Viewport geprüft.

**Scope:** Regressionstests für verschachtelte Events im Guard, Disposal im Beobachter und unterschiedliche Viewports zweier Surfaces. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T10: Morphing und Choreography

### T10-AC01 · partial

Button→Progress→Result, Card→Detail, Grid→List und Form→Summary ohne Inhaltsverlust

**Scope:** Vollständiger Planumfang

**Offen:** weitere Morph-Familien und allgemeine Choreography-Verträge

Kein Nachweis im Register.

### T10-AC02 · partial

Unterbrechungen erzeugen keine Sprünge zu veralteten Zuständen

**Scope:** Vollständiger Planumfang

**Offen:** weitere Morph-Familien und allgemeine Choreography-Verträge

Kein Nachweis im Register.

### R2-AC01 · partial

Zeilen und Karten behalten ihre Modulidentität. Der Atlas entfaltet genau die Mitglieder seiner Gruppe. Zwei bis vier ausgewählte Karten bilden genau einen Vergleich und lassen sich wieder trennen.

**Scope:** Die drei Beziehungen wurden mit realen Workspace-IDs auf Chrome geprüft. Der Kopf einer Gruppe, die Hüllen und ihre Datenfelder werden getrennt projiziert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T11: Physics und Timing

### T11-AC01 · partial

Gleicher Seed erzeugt gleichen logischen Verlauf

**Scope:** Vollständiger Planumfang

**Offen:** Physics-Presets und Fixed-Step-Simulation

Kein Nachweis im Register.

### T11-AC02 · partial

Reduced Motion funktioniert

**Scope:** Vollständiger Planumfang

**Offen:** Physics-Presets und Fixed-Step-Simulation

Kein Nachweis im Register.

### T11-AC03 · partial

gemeinsame Übergänge bleiben zeitlich synchron

**Scope:** Vollständiger Planumfang

**Offen:** Physics-Presets und Fixed-Step-Simulation

Kein Nachweis im Register.

### R2-AC02 · partial

Retargeting übernimmt die aktuelle Geometrie und begrenzte Geschwindigkeiten. Ports und sichtbare Kanten stimmen an Prüfzeitpunkten bis auf einen CSS-Pixel überein.

**Scope:** Begrenzter numerischer Retarget- und Porttest im gemeinsamen Sampler. Browseraufnahmen prüfen Unterbrechungen bei 25, 50 und 75 Prozent. Numerische und sichtbare Abweichungen sind im Lauf separat ausgewiesen. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T12: Content Preservation

### T12-AC01 · partial

Dirty Fields, Auswahl und IDs bleiben erhalten

**Scope:** Vollständiger Planumfang

**Offen:** typisierte Projektionen beliebiger Content-Schemas

Kein Nachweis im Register.

### T12-AC02 · partial

fehlende Mapping-Pflichten scheitern vor Ausführung

**Scope:** Vollständiger Planumfang

**Offen:** typisierte Projektionen beliebiger Content-Schemas

Kein Nachweis im Register.

### T12-AC03 · partial

keine erfundenen Werte

**Scope:** Vollständiger Planumfang

**Offen:** typisierte Projektionen beliebiger Content-Schemas

Kein Nachweis im Register.

## T13: Komponentenbibliothek

### T13-AC01 · partial

Jede Familie besitzt Stategraph, Semantik, Error-/Loading-/Empty-Zustände, Themes und Szenarien. Typwechsel ändert nicht unbemerkt die fachliche Bedeutung

**Scope:** Vollständiger Planumfang

**Offen:** vollständige Familien und Error/Empty/Loading-Conformance

Kein Nachweis im Register.

## T14: URLs und History

### T14-AC01 · partial

Deep Link, Reload, Back/Forward, ungültige Parameter und gelöschte IDs getestet

**Scope:** Vollständiger Planumfang

**Offen:** Next-Routeradapter und allgemeine fachliche Deep Links

Kein Nachweis im Register.

### T14-AC02 · partial

keine Seiteneffekte beim History-Replay

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/workspace.test.ts`, SHA-256 `86201a5657458c584998affbff5192699d8dc1440a4c513ed32c963c65b779bc`
- Nachweis: `docs/milestones/m2.md`, SHA-256 `d8a8ddc527c1b471890569e6fca64b58cf85433493b3c2a0ac93daad03ac5a52`

### R1-AC02 · partial

Ein Besuch des Studios und die Rückkehr stellen die kanonische Workspace-Ansicht samt Auswahl wieder her. Back und Forward erzeugen keine Mutationen.

**Scope:** Lokaler Workspace mit Auswahl, gefilterten Karten, explizitem Vergleich, Back/Forward und Rückkehr aus dem Studio. Core und Routerpfad sind gemeinsam geprüft. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T15: Daten-/Action-Adapter

### T15-AC01 · partial

Abort, Stale Results, Revalidation, Schemafehler und Idempotenz getestet

**Scope:** Eigenständige validierte Data-/Action-Clients und Core-Replay; automatisierte Konkurrenz- und Autoritätsprüfung. Am 13.11.2026 Source-Delta für abbrechbare asynchrone Autorisierung geprüft; aktuelle Data-/Agent-/Core-Regressionssuite bestanden. Keine Erweiterung auf verteilte Persistenz oder produktive Hostfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Dauerhafte produktive Host-Idempotenz sowie konkrete Query-/HTTP-/Provideradapter separat integrieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/data.test.ts`, SHA-256 `babf5880f3de3e81cde16bf149a26094ec948c5a829e9f197a6f90cd18b7e4b7`
- Nachweis: `tests/unit/runtime.test.ts`, SHA-256 `2b1052ea502e431608c33e349686e78d2dd5bfde3c57322a2a81ebe667ecf854`
- Nachweis: `packages/core/src/data.ts`, SHA-256 `783b46c38fc2463f74997d5b4190303c11e0e81c1db6ce52b4378d2158bce662`

### T15-AC02 · partial

keine Mutation durch Prefetch oder Replay

**Scope:** Eigenständige validierte Data-/Action-Clients und Core-Replay; automatisierte Konkurrenz- und Autoritätsprüfung. Am 13.11.2026 Source-Delta für abbrechbare asynchrone Autorisierung geprüft; aktuelle Data-/Agent-/Core-Regressionssuite bestanden. Keine Erweiterung auf verteilte Persistenz oder produktive Hostfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Dauerhafte produktive Host-Idempotenz sowie konkrete Query-/HTTP-/Provideradapter separat integrieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/data.test.ts`, SHA-256 `babf5880f3de3e81cde16bf149a26094ec948c5a829e9f197a6f90cd18b7e4b7`
- Nachweis: `tests/unit/runtime.test.ts`, SHA-256 `2b1052ea502e431608c33e349686e78d2dd5bfde3c57322a2a81ebe667ecf854`
- Nachweis: `packages/core/src/data.ts`, SHA-256 `783b46c38fc2463f74997d5b4190303c11e0e81c1db6ce52b4378d2158bce662`

## T16: Studio-Projekte und Inspector

### T16-AC01 · partial

Reale Projekte öffnen/speichern

**Scope:** Vollständiger Planumfang

**Offen:** Projektöffnen, atomare Speicherung und Konflikte

Kein Nachweis im Register.

### T16-AC02 · partial

Konflikte erkennen

**Scope:** Vollständiger Planumfang

**Offen:** Projektöffnen, atomare Speicherung und Konflikte

Kein Nachweis im Register.

### T16-AC03 · partial

beschädigte Dateien überschreiben keinen gültigen Stand

**Scope:** Vollständiger Planumfang

**Offen:** Projektöffnen, atomare Speicherung und Konflikte

Kein Nachweis im Register.

### T16-AC04 · partial

Events und Snapshots korrelieren

**Scope:** Vollständiger Planumfang

**Offen:** Projektöffnen, atomare Speicherung und Konflikte

Kein Nachweis im Register.

### R1-AC01 · partial

Bei 1280 × 720 und 390 × 844 sind ein echtes Modul und ein bedienbarer Übergang beim Einstieg sichtbar. Bei 320 Pixeln bleiben beide Handbücher erreichbar.

**Scope:** Chrome mit echten Workspace-Modulen. Sichtbarkeit der Hauptaktion und Modulgeometrie bei 1280, 390 und 320 CSS-Pixeln. Die mobile Navigation öffnet das Wissen. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### R4-AC01 · partial

Speichern, Neuladen und gezieltes Laden stellen eine lokale Entwurfsversion wieder her. Eine konkurrierende Revision wird abgewiesen und der geladene Entwurf durchläuft erneut den Preflight.

**Scope:** Lokale SQLite-Versionen, konkurrierende Revisionen und ein Studio-Durchlauf mit Speichern, Wiederöffnen und erneuter Prüfung derselben Datenbasis. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T17: Visueller Builder

### T17-AC01 · partial

Roundtrip ohne Informationsverlust

**Scope:** Vollständiger Planumfang

**Offen:** grafisches Authoring, Monaco, Undo/Redo

Kein Nachweis im Register.

### T17-AC02 · partial

ungültige Kanten werden blockiert

**Scope:** Vollständiger Planumfang

**Offen:** grafisches Authoring, Monaco, Undo/Redo

Kein Nachweis im Register.

### T17-AC03 · partial

Undo/Redo funktioniert

**Scope:** Vollständiger Planumfang

**Offen:** grafisches Authoring, Monaco, Undo/Redo

Kein Nachweis im Register.

### T17-AC04 · partial

Mermaid-Ausgabe ist syntaktisch validiert

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `scripts/check-mermaid.mjs`, SHA-256 `40f55b32624d740f2f414c49037b9ad626cc50510c326dcf447201654a38f56c`

## T18: Simulation und Replay

### T18-AC01 · partial

Replay führt null externe Mutationen aus

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/runtime.test.ts`, SHA-256 `2b1052ea502e431608c33e349686e78d2dd5bfde3c57322a2a81ebe667ecf854`

### T18-AC02 · partial

gleiche Eingaben liefern denselben logischen Trace

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/runtime.test.ts`, SHA-256 `2b1052ea502e431608c33e349686e78d2dd5bfde3c57322a2a81ebe667ecf854`

### T18-AC03 · partial

„Live“, „Aufzeichnung“ und „Simulation“ sind sichtbar getrennt

**Scope:** Vollständiger Planumfang

**Offen:** vollständige Simulation/Fault-Injection und versionierte Projekt-/Datenaufzeichnungen

Kein Nachweis im Register.

### R2-AC03 · partial

Derselbe Clip ist vorwärts und rückwärts abtastbar. Neue Aufzeichnungen enthalten den Bewegungsplan. Vorhandene v2/v3-Formate behalten ihren historischen Sampler.

**Scope:** V4-Clips transportieren den expliziten Plan. Bestandsszenarien verwenden beim Import den historischen Sampler. Seek, Replay und Rückkehr zur Live-Surface wurden im Studio geprüft. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T19: Testsystem

### T19-AC01 · partial

Jeder erlaubte Übergang ist abgedeckt

**Scope:** Vollständiger Planumfang

**Offen:** 85%-Gate, GPU-CI und vollständige Journey-Matrix; manuelle visuelle/AT-Freigaben

Kein Nachweis im Register.

### T19-AC02 · partial

Race-/Abort-Sequenzen getestet

**Scope:** Vollständiger Planumfang

**Offen:** 85%-Gate, GPU-CI und vollständige Journey-Matrix; manuelle visuelle/AT-Freigaben

Kein Nachweis im Register.

### T19-AC03 · partial

visuelle Fehler und semantische Fehler werden unabhängig erkannt

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/design-quality.test.ts`, SHA-256 `0e4ab9cc943fa79771864bef5830ef5e5b3076e4f2e78ddddff56cea93100c5b`
- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`
- Nachweis: `docs/qa/2026-11-02-openai/final-layout-matrix.json`, SHA-256 `cb9ba1593bf54b0cda68e2f8a2f986f0c19782887d1b31ed4cc562666c22a624`

### R6-AC03 · external

Unabhängige Teilnehmende können nach Match, Split und Merge die Identität oder Mitgliedschaft korrekt nennen. Erfahrungen mit Screenreader, echter mobiler Eingabe und Reduced Motion sind je Profil dokumentiert.

**Scope:** Das Erkennungsprotokoll und die lokalen Reduced-Motion-Prüfpunkte sind dokumentiert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Unabhängige Teilnehmende, Screenreader und echte mobile Eingabe auf benannten Geräten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T20: CLI und Integration

### T20-AC01 · partial

Neues React-/Next-Projekt lässt sich ohne Browser-Secrets integrieren

**Scope:** Vollständiger Planumfang

**Offen:** init/add/studio/export und frische Hostintegration

Kein Nachweis im Register.

### T20-AC02 · partial

wiederholtes `add` überschreibt keine Benutzeränderungen

**Scope:** Vollständiger Planumfang

**Offen:** init/add/studio/export und frische Hostintegration

Kein Nachweis im Register.

### T20-AC03 · partial

Exporte bauen reproduzierbar

**Scope:** Vollständiger Planumfang

**Offen:** init/add/studio/export und frische Hostintegration

Kein Nachweis im Register.

## T21: Intent-Runtime

### T21-AC01 · verified

Default Top-3, konfigurierbar bis fünf

**Scope:** Lokaler Workspace-Ranker für konkrete Vergleichspaare. Die Begrenzung zählt Paare innerhalb dieses Ziels.

**Offen:** Im bezeichneten Scope kein Restpunkt eingetragen.

- Nachweis: `packages/intelligence/src/workspace-intent.ts`, SHA-256 `11b53090f3aea74df2ec76c93c662a85194f713ee6b362f809c0592eafb2686d`
- Nachweis: `tests/unit/workspace-intent.test.ts`, SHA-256 `4196c92455723ff94a0d5cad22dc94b9713d9f4962735b29843ac6efd9a9f842`
- Nachweis: `docs/qa/2026-11-23-intent/ranker-tests.json`, SHA-256 `63342c289a6e88a4377768edee910c91630bd8c17a8ff770ea14aca8e64846e6`

### T21-AC02 · verified

Unklarheit wird ausdrücklich dargestellt

**Scope:** Unklarheit im lokalen Workspace-Vergleich: Ranker enthält sich, der Studio-Inspector nennt den Status. Browserprüfung mit englischer Oberfläche und echtem WebGPU; offene Eingabe bleibt bedienbar.

**Offen:** Im bezeichneten Scope kein Restpunkt eingetragen.

- Nachweis: `tests/unit/workspace-intent.test.ts`, SHA-256 `4196c92455723ff94a0d5cad22dc94b9713d9f4962735b29843ac6efd9a9f842`
- Nachweis: `docs/qa/2026-11-23-intent/ranker-tests.json`, SHA-256 `63342c289a6e88a4377768edee910c91630bd8c17a8ff770ea14aca8e64846e6`
- Nachweis: `tests/e2e/workspace-intent.spec.ts`, SHA-256 `ae49c3f5d6b1a5d1b76f097ada1c6e790028af0b7b6faa523e35cb8e3aee94e2`
- Nachweis: `docs/qa/2026-11-23-intent/browser.json`, SHA-256 `4729c1b63863b6dbf7107341f647d7632fd87774f6aca78565b2cd008599ed00`

### T21-AC03 · partial

Qualitätsmessung auf getrennten Sessions statt Trainingsdaten

**Scope:** 16 getrennte, vorab beschriftete synthetische Sitzungen, ein Prüfzeitpunkt je Sitzung. Manuell festgelegte Regel ohne Training.

**Offen:** Unabhängig erhobene Nutzersitzungen mit Aufgabenziel, unterbliebene und störende Vorschläge im gesamten Verlauf sowie Aufgabennutzen messen. Schwellen ohne Zugriff auf den finalen Prüfsatz kalibrieren.

- Nachweis: `tests/evaluations/workspace-intent-holdout-v1.json`, SHA-256 `b1b593b46e525c373a880b3e7c6cc7ccef67b20a132b0db07d581b09c36f9162`
- Nachweis: `tests/unit/workspace-intent-eval.test.ts`, SHA-256 `30695294feea0b636c12dec3edcaf284b6f8c5ada230883257385764e28512b1`
- Nachweis: `docs/qa/2026-11-23-intent/evaluation.json`, SHA-256 `c619c38eb9bd94eb53d380e4915ec77c202214d267688faafff3a5e2701507cc`

## T22: KI-Orchestrierung

### T22-AC01 · open

Ungültige, verspätete und unberechtigte Pläne werden verworfen

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T22-AC02 · partial

keine Keys im Client

**Scope:** Historischer Prüflauf bis 14.11.2026. Aktueller M8-Source- und First-party-Clientimportgraph ohne Provider-/Server-/Node-/Environment-Zugriff; Serverroute liefert keine Keywerte. Nach Core-Observer-/Commit-Receipt-Fix volle automatisierte Suite475/475 in54Dateien bestanden. Frühere Build-/Live-Evidenz bleibt historisch; kein neuer Produktionsbundle- oder Providerbeweis. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/secret-boundary.json`, SHA-256 `7ced9b545d96103e90ff3d310ef4ea0da70426362de136132cb5f26ab1e97aa6`

### T22-AC03 · open

Timeouts lassen die WebGPU-Oberfläche bedienbar

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

## T23: Predictive Loading

### T23-AC01 · open

Maximal drei eigene gleichzeitige Preloads

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T23-AC02 · open

kein Kauf/Submit

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T23-AC03 · open

überholte Jobs abbrechen

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T23-AC04 · open

Treffer, verschwendete Bytes und Latenznutzen messen

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

## T24: Ziele und Personalisierung

### T24-AC01 · open

Nutzer kann Anpassungen stoppen und zurücknehmen

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T24-AC02 · open

keine Reorganisation während aktiver Eingabe

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T24-AC03 · open

Präferenzen werden nicht aus sensiblen Vermutungen abgeleitet

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

## T25: Reale Case-Pakete

### T25-AC01 · partial

Jeder Case hat Datenherkunft, vollständige URL-/State-Flows, Fehlerfälle, Manual/Hybrid/Auto-Vergleich und reproduzierbare Tests

**Scope:** Vollständiger Planumfang

**Offen:** übrige freigegebene Praxisfälle mit echten Adaptern

Kein Nachweis im Register.

## T26: Observability

### T26-AC01 · partial

Jede Entscheidung ist einem Snapshot und Ergebnis zuordenbar

**Scope:** Vollständiger Planumfang

**Offen:** OTLP, Persistenz und Exportausfall-Prüfung

Kein Nachweis im Register.

### T26-AC02 · partial

keine erfundenen Dashboardwerte

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T26-AC03 · partial

Exportausfälle sind sichtbar

**Scope:** Vollständiger Planumfang

**Offen:** OTLP, Persistenz und Exportausfall-Prüfung

Kein Nachweis im Register.

## T27: Kosten und Schutzmaßnahmen

### T27-AC01 · partial

Parallele Requests umgehen kein Budget

**Scope:** Lokaler Studio-Review in einem Serverprozess: synchron reservierte Session-/Prozessbudgets, exakte Inputprüfung, konservativer Abort und serverseitige Budgetautorität. Keine verteilte oder dauerhafte Produktabnahme.

**Offen:** Anwendungs-DecisionPlans, persistente Session-/Projektbudgets, Mehrinstanzkonkurrenz und Abrechnungsabgleich separat qualifizieren.

- Nachweis: `tests/unit/ai-review.test.ts`, SHA-256 `e1cfaf5c4cff940fbb63aa158da94eb51e298d5790a002fc62ad47127043f30b`
- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`

### T27-AC02 · partial

abgebrochene Requests werden konservativ verrechnet

**Scope:** Lokaler Studio-Review in einem Serverprozess: synchron reservierte Session-/Prozessbudgets, exakte Inputprüfung, konservativer Abort und serverseitige Budgetautorität. Keine verteilte oder dauerhafte Produktabnahme.

**Offen:** Anwendungs-DecisionPlans, persistente Session-/Projektbudgets, Mehrinstanzkonkurrenz und Abrechnungsabgleich separat qualifizieren.

- Nachweis: `tests/unit/ai-review.test.ts`, SHA-256 `e1cfaf5c4cff940fbb63aa158da94eb51e298d5790a002fc62ad47127043f30b`
- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`

### T27-AC03 · partial

kein Client kann seinen Budgetstand autoritativ setzen

**Scope:** Lokaler Studio-Review in einem Serverprozess: synchron reservierte Session-/Prozessbudgets, exakte Inputprüfung, konservativer Abort und serverseitige Budgetautorität. Keine verteilte oder dauerhafte Produktabnahme.

**Offen:** Anwendungs-DecisionPlans, persistente Session-/Projektbudgets, Mehrinstanzkonkurrenz und Abrechnungsabgleich separat qualifizieren.

- Nachweis: `tests/unit/ai-review.test.ts`, SHA-256 `e1cfaf5c4cff940fbb63aa158da94eb51e298d5790a002fc62ad47127043f30b`
- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`

## T28: Lernen und Experimente

### T28-AC01 · open

Exposure/Outcome korrekt zugeordnet

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T28-AC02 · open

Policy-Zustand über Neustarts erhalten

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T28-AC03 · open

keine Promotion bei Datenqualitätsfehlern

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T28-AC04 · open

Rollback stellt exakt die vorherige Policy her

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

## T29: Performance und Skalierung

### T29-AC01 · partial

Definierte Geräte-/Szenariomatrix besteht

**Scope:** Vollständiger Planumfang

**Offen:** Gerätematrix, P95-Budgets und Langzeittests

Kein Nachweis im Register.

### T29-AC02 · partial

Ressourcenbudget gemessen

**Scope:** Vollständiger Planumfang

**Offen:** Gerätematrix, P95-Budgets und Langzeittests

Kein Nachweis im Register.

### T29-AC03 · partial

lokale Modelle verdrängen nicht unkontrolliert Renderingressourcen

**Scope:** Vollständiger Planumfang

**Offen:** Gerätematrix, P95-Budgets und Langzeittests

Kein Nachweis im Register.

### R6-AC02 · partial

Referenzläufe qualifizieren Timing nur bei dokumentierter hinreichend ruhiger CPU- und GPU-Last. Verunreinigte und unvollständig beobachtete Läufe bleiben als solche sichtbar.

**Scope:** Diagnoseläufe erfassen Frameintervalle und Fremdlast im zugeordneten Messfenster. Grenzen der Prozess- und GPU-Zuordnung sind im Bericht ausgewiesen. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Eine Laufzeitfreigabe erfordert einen ruhigen, zuordenbaren Referenzlauf samt GPU-Lastnachweis. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T30: Release-Härtung

### T30-AC01 · partial

Keine offenen Releaseblocker

**Scope:** Vollständiger Planumfang

**Offen:** externer CI-Betrieb und vollständige Release-/Geräte-/Security-/Upgrade-Gates

Kein Nachweis im Register.

### T30-AC02 · partial

Installations-/Upgrade-Test besteht

**Scope:** Vollständiger Planumfang

**Offen:** externer CI-Betrieb und vollständige Release-/Geräte-/Security-/Upgrade-Gates

Kein Nachweis im Register.

### T30-AC03 · partial

bekannte Einschränkungen dokumentiert

**Scope:** Bekannte Einschränkungen in README und aktuellem65-Taskregister dokumentiert:41 lokale M8-Kriterien nachgewiesen, Leistung weiterhin failed/contaminated/not-qualified; breite Produkt-, Hardware-, AT-/IME- und T29-Gates offen. Dokumentationsnachweis, keine Gesamtfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`
- Nachweis: `docs/qa/2026-11-02-openai/final-layout-matrix.json`, SHA-256 `cb9ba1593bf54b0cda68e2f8a2f986f0c19782887d1b31ed4cc562666c22a624`
- Nachweis: `docs/acceptance/m8-adoption-2026-11-13.json`, SHA-256 `99fc655cfdf68b80079885c2f401f194ea6bca8d935e37f4ff62ec1588d56a1f`

### T30-AC04 · partial

KI- und Policy-Kill-Switch verifiziert

**Scope:** Vollständiger Planumfang

**Offen:** externer CI-Betrieb und vollständige Release-/Geräte-/Security-/Upgrade-Gates

Kein Nachweis im Register.

## T31: Collaboration

### T31-AC01 · open

Parallele Bearbeitung konvergiert

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T31-AC02 · open

ungültige Zwischenstände werden nicht publiziert

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T31-AC03 · open

getrennte Nutzer lösen keine doppelten fachlichen Aktionen aus

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

## T32: Plugins und Headless

### T32-AC01 · open

Plugin-Inkompatibilität wird vor Start erkannt

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T32-AC02 · open

Unload räumt Ressourcen auf

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T32-AC03 · open

kein Zugriff auf Secrets allein durch ein Template

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### R6-AC01 · partial

Ein separater React-Host baut die öffentlichen Pakete ohne Next.js. Modulwechsel und benannte Backenddiagnose werden im Host im Browser geprüft.

**Scope:** Eigenständiger Vite-/React-Host aus öffentlichen Paketen. Der Buildgraph und die sichtbaren Übergänge einschließlich Backendstatus wurden auf WebGPU und WebGL2 geprüft. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T33: Voice und Gesten

### T33-AC01 · open

Mehrdeutige Befehle fragen nach

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T33-AC02 · open

Aufnahme sichtbar

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T33-AC03 · open

bestehende Guards gelten unverändert

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T33-AC04 · open

Tastaturbedienung bleibt vollständig

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

## T34: Enterprise-Integration

### T34-AC01 · open

Rollen auf Server und Studio geprüft

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T34-AC02 · open

Projektisolation getestet

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T34-AC03 · open

Löschung, Retention, Backup und Restore funktionieren

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

## T35: WebXR

### T35-AC01 · open

Konkretes Headset-/Browserprofil samt Backend nachgewiesen

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T35-AC02 · open

kein unbemerkter Backendwechsel

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T35-AC03 · open

Controller/Gesten führen dieselben Events aus

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T35-AC04 · open

Session-Ende räumt Ressourcen auf

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

## T36: Neural Rendering

### T36-AC01 · open

Text, Hit-Testing und fachliche Information bleiben deterministisch

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T36-AC02 · open

Modellherkunft dokumentiert

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T36-AC03 · open

ohne belegten Vorteil wird das Ergebnis archiviert und nicht als Produktionsfeature freigegeben

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

## T37: Marketplace

### T37-AC01 · open

Installation reproduzierbar

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T37-AC02 · open

inkompatible Pakete werden abgewiesen

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T37-AC03 · open

Updates überschreiben keine Nutzerdaten

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

### T37-AC04 · open

unsichere Pakete können gesperrt werden

**Scope:** Vollständiger Planumfang

**Offen:** Acceptance Criteria des Gesamtplans

Kein Nachweis im Register.

## T38: Dokumentation und Adoption

### T38-AC01 · partial

Jedes Tutorial besteht als Integrationstest

**Scope:** Vollständiger Planumfang

**Offen:** getestete Tutorials und veröffentlichbare Benchmarks

Kein Nachweis im Register.

### T38-AC02 · partial

Leistungsangaben nennen Gerät und Szenario

**Scope:** Vollständiger Planumfang

**Offen:** getestete Tutorials und veröffentlichbare Benchmarks

Kein Nachweis im Register.

### T38-AC03 · partial

keine unbelegten Conversion- oder Verbreitungszahlen

**Scope:** Vollständiger Planumfang

**Offen:** getestete Tutorials und veröffentlichbare Benchmarks

Kein Nachweis im Register.

## T39: Anatomy-/Behavior-Verträge

### T39-AC01 · partial

Part-IDs eindeutig

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/base-ui-contracts.test.ts`, SHA-256 `e8a45df243bb4ed53f4788a45b2be2835c8308d412e677c4cce317c8a3e3397a`

### T39-AC02 · partial

Button braucht Aktion

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/base-ui-contracts.test.ts`, SHA-256 `e8a45df243bb4ed53f4788a45b2be2835c8308d412e677c4cce317c8a3e3397a`

### T39-AC03 · partial

Textbox braucht Textfeld

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/base-ui-contracts.test.ts`, SHA-256 `e8a45df243bb4ed53f4788a45b2be2835c8308d412e677c4cce317c8a3e3397a`

### T39-AC04 · partial

kein Rollenableiten aus visueller Form

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/base-ui-contracts.test.ts`, SHA-256 `e8a45df243bb4ed53f4788a45b2be2835c8308d412e677c4cce317c8a3e3397a`

### T39-AC05 · partial

alle Proof-Parts im Inspector

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/base-ui-contracts.test.ts`, SHA-256 `e8a45df243bb4ed53f4788a45b2be2835c8308d412e677c4cce317c8a3e3397a`

## T40: State Ownership und Change Requests

### T40-AC01 · partial

Fokus/Hover ändern Domain-Revision nicht

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/base-ui-contracts.test.ts`, SHA-256 `e8a45df243bb4ed53f4788a45b2be2835c8308d412e677c4cce317c8a3e3397a`

### T40-AC02 · partial

kontrollierte Werte bleiben erhalten

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/base-ui-contracts.test.ts`, SHA-256 `e8a45df243bb4ed53f4788a45b2be2835c8308d412e677c4cce317c8a3e3397a`

### T40-AC03 · partial

Cancel verhindert Commit und Seiteneffekte

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/base-ui-contracts.test.ts`, SHA-256 `e8a45df243bb4ed53f4788a45b2be2835c8308d412e677c4cce317c8a3e3397a`

### T40-AC04 · partial

Gründe sind im Trace

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/base-ui-contracts.test.ts`, SHA-256 `e8a45df243bb4ed53f4788a45b2be2835c8308d412e677c4cce317c8a3e3397a`

## T41: Presence und Animation

### T41-AC01 · partial

Dauer kommt aus dem Transition-Vertrag

**Scope:** Vollständiger Planumfang

**Offen:** komplexe Popup-Presence und vollständige GPU-Tests

Kein Nachweis im Register.

### T41-AC02 · partial

Unterbrechung startet vom aktuellen Bild

**Scope:** Vollständiger Planumfang

**Offen:** komplexe Popup-Presence und vollständige GPU-Tests

Kein Nachweis im Register.

### T41-AC03 · partial

reduzierte Bewegung sofort

**Scope:** Vollständiger Planumfang

**Offen:** komplexe Popup-Presence und vollständige GPU-Tests

Kein Nachweis im Register.

### T41-AC04 · partial

kein aktivierbarer veralteter Part

**Scope:** Vollständiger Planumfang

**Offen:** komplexe Popup-Presence und vollständige GPU-Tests

Kein Nachweis im Register.

## T42: Studio mit Base UI

### T42-AC01 · partial

Tabs per Pfeiltasten

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/milestones/m1.md`, SHA-256 `810844fb5126b7b3da5ecf3b73ee02484cf56c88e08df34c48358532a7a579e5`

### T42-AC02 · partial

Dialog mit Label, Escape und Fokusrückgabe

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/milestones/m1.md`, SHA-256 `810844fb5126b7b3da5ecf3b73ee02484cf56c88e08df34c48358532a7a579e5`

### T42-AC03 · partial

Vorschau rendert mit GPU

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/milestones/m1.md`, SHA-256 `810844fb5126b7b3da5ecf3b73ee02484cf56c88e08df34c48358532a7a579e5`

### T42-AC04 · partial

aktives Backend ist sichtbar

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/milestones/m1.md`, SHA-256 `810844fb5126b7b3da5ecf3b73ee02484cf56c88e08df34c48358532a7a579e5`

## T43: Konsistenz und Conformance

### T43-AC01 · partial

Plan enthält alle Tasks

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/acceptance/m8-adoption-2026-11-13.json`, SHA-256 `99fc655cfdf68b80079885c2f401f194ea6bca8d935e37f4ff62ec1588d56a1f`

### T43-AC02 · partial

Quellen/Versionen belegt

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/acceptance/m8-adoption-2026-11-13.json`, SHA-256 `99fc655cfdf68b80079885c2f401f194ea6bca8d935e37f4ff62ec1588d56a1f`

### T43-AC03 · partial

keine Base-UI-Abhängigkeit im Core

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/acceptance/m8-adoption-2026-11-13.json`, SHA-256 `99fc655cfdf68b80079885c2f401f194ea6bca8d935e37f4ff62ec1588d56a1f`

### T43-AC04 · partial

M1 live demonstriert

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/acceptance/m8-adoption-2026-11-13.json`, SHA-256 `99fc655cfdf68b80079885c2f401f194ea6bca8d935e37f4ff62ec1588d56a1f`

### T43-AC05 · partial

nicht geprüfte Kriterien bleiben offen

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/acceptance/m8-adoption-2026-11-13.json`, SHA-256 `99fc655cfdf68b80079885c2f401f194ea6bca8d935e37f4ff62ec1588d56a1f`

## T44: Adaptive Datenoberfläche

### T44-AC01 · partial

echte Daten

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/workspace.test.ts`, SHA-256 `86201a5657458c584998affbff5192699d8dc1440a4c513ed32c963c65b779bc`

### T44-AC02 · partial

stabile IDs

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/workspace.test.ts`, SHA-256 `86201a5657458c584998affbff5192699d8dc1440a4c513ed32c963c65b779bc`

### T44-AC03 · partial

numerische Sortierung und aria-sort

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/workspace.test.ts`, SHA-256 `86201a5657458c584998affbff5192699d8dc1440a4c513ed32c963c65b779bc`

### T44-AC04 · partial

Filter-/Auswahlerhalt

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/workspace.test.ts`, SHA-256 `86201a5657458c584998affbff5192699d8dc1440a4c513ed32c963c65b779bc`

### T44-AC05 · partial

validierte URL-/History-Flows

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/workspace.test.ts`, SHA-256 `86201a5657458c584998affbff5192699d8dc1440a4c513ed32c963c65b779bc`

### T44-AC06 · partial

Screenshot-Nachweis

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/workspace.test.ts`, SHA-256 `86201a5657458c584998affbff5192699d8dc1440a4c513ed32c963c65b779bc`

## T45: RP1-Fortsetzung

### T45-AC01 · partial

atomare Feldzuweisung

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/base-ui-contracts.test.ts`, SHA-256 `e8a45df243bb4ed53f4788a45b2be2835c8308d412e677c4cce317c8a3e3397a`

### T45-AC02 · partial

validierte Projektionen

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/base-ui-contracts.test.ts`, SHA-256 `e8a45df243bb4ed53f4788a45b2be2835c8308d412e677c4cce317c8a3e3397a`

### T45-AC03 · partial

unterbrechbare Präsentation

**Scope:** Vollständiger Planumfang

**Offen:** übrige vollständige RP1-Gates

Kein Nachweis im Register.

### T45-AC04 · partial

kein aktiver Exit-Part

**Scope:** Vollständiger Planumfang

**Offen:** übrige vollständige RP1-Gates

Kein Nachweis im Register.

### T45-AC05 · partial

GPU-Retry mit erhaltenem Snapshot

**Scope:** Vollständiger Planumfang

**Offen:** übrige vollständige RP1-Gates

Kein Nachweis im Register.

### T45-AC06 · partial

unabhängige Tests

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/base-ui-contracts.test.ts`, SHA-256 `e8a45df243bb4ed53f4788a45b2be2835c8308d412e677c4cce317c8a3e3397a`

## T46: Backend-Transparenz

### T46-AC01 · partial

Default bevorzugt WebGPU

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/backend-policy.test.ts`, SHA-256 `1627413db192d624ae61daca630a8d9f312436a83cf9043cbd72d7647e7b380d`

### T46-AC02 · partial

WebGL2-Diagnose separat

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/backend-policy.test.ts`, SHA-256 `1627413db192d624ae61daca630a8d9f312436a83cf9043cbd72d7647e7b380d`

### T46-AC03 · partial

Badge aus tatsächlich initialisiertem Backend

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/backend-policy.test.ts`, SHA-256 `1627413db192d624ae61daca630a8d9f312436a83cf9043cbd72d7647e7b380d`

### T46-AC04 · partial

fehlgeschlagene Qualifikation wird nicht als Erfolg angezeigt

**Scope:** Vollständiger Planumfang

**Offen:** automatischen Fallback auf weiteren Geräten qualifizieren

Kein Nachweis im Register.

## T47: TypeGPU-Qualifikation

### T47-AC01 · partial

kompatible Pins

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T47-AC02 · partial

isolierter Build

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T47-AC03 · partial

unabhängige CPU/GPU-Invarianten

**Scope:** Vollständiger Planumfang

**Offen:** breite Hardware-/Treiber-/Lifecycle-Matrix und vergleichende Performance-/Speichermessung

Kein Nachweis im Register.

### T47-AC04 · partial

Three/Glyph-/WebGL2-Prüfung

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T47-AC05 · partial

ein Device und Scheduler

**Scope:** Vollständiger Planumfang

**Offen:** breite Hardware-/Treiber-/Lifecycle-Matrix und vergleichende Performance-/Speichermessung

Kein Nachweis im Register.

### T47-AC06 · partial

dokumentierte Ressourcenfreigabe

**Scope:** Vollständiger Planumfang

**Offen:** breite Hardware-/Treiber-/Lifecycle-Matrix und vergleichende Performance-/Speichermessung

Kein Nachweis im Register.

### T47-AC07 · partial

Nutzenvergleich

**Scope:** Vollständiger Planumfang

**Offen:** breite Hardware-/Treiber-/Lifecycle-Matrix und vergleichende Performance-/Speichermessung

Kein Nachweis im Register.

## T48: Effektmodell und Auswahl-Policies

### T48-AC01 · partial

fixed/random/case/aus

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

### T48-AC02 · partial

explizite Priorität

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

### T48-AC03 · partial

kompatible Pools

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

### T48-AC04 · partial

Seed und Rezeptversion im Run

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

### T48-AC05 · partial

Replay würfelt nicht neu

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

### T48-AC06 · partial

Fokus/Inhalt/Actions unverändert

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

### T48-AC07 · partial

Abbruch und Reduced Motion geprüft

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

## T49: Studio- und Showcase-Effekt-Library

### T49-AC01 · partial

visuelle Preset-Vorschauen

**Scope:** Vollständiger Planumfang

**Offen:** grafisches Transition-Regel-Authoring, gespeicherte Projektkonfiguration und automatisierter Run-Vergleich

Kein Nachweis im Register.

### T49-AC02 · partial

Intensität/Dauer/Parameter

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

### T49-AC03 · partial

Projekt-/Case-/Transition-Zuordnung

**Scope:** Vollständiger Planumfang

**Offen:** grafisches Transition-Regel-Authoring, gespeicherte Projektkonfiguration und automatisierter Run-Vergleich

Kein Nachweis im Register.

### T49-AC04 · partial

Seed-/Random-Steuerung

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

### T49-AC05 · partial

Quelle/Zusatz/Ziel scrubben

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

### T49-AC06 · partial

Vergleich und Szenarioexport

**Scope:** Vollständiger Planumfang

**Offen:** grafisches Transition-Regel-Authoring, gespeicherte Projektkonfiguration und automatisierter Run-Vergleich

Kein Nachweis im Register.

### T49-AC07 · partial

gleiche Runtime wie Host

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

### T49-AC08 · partial

GPU-Effektleiste im Showcase synchron zum Studio

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

### T49-AC09 · partial

Policyänderung startet laufende Animation nicht neu

**Scope:** Aktueller deklarierter Runtime-/Studio-Proof; keine allgemeine Produktionsfreigabe Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/effects.test.ts`, SHA-256 `a8f60eb8019663fb07973158579d84adc3a9aff17c455a6c62354cd1bbeca14b`

## T50: Design-Brief und Storyvertrag

### T50-AC01 · partial

Versionierter Brief benennt Nutzerziel, Medium, Modus, Datenherkunft und drei bis fünf Beats

**Scope:** M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T50-AC02 · partial

jeder Beat referenziert gültige Flow-/Szenarioziele und erwartete Invarianten

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Allgemeine Szenarioreferenzen, kompletter Preflight, Illustration und Poster-Authoring vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T50-AC03 · partial

Illustration, Simulation und bedienbare Runtime sind unterscheidbar

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Allgemeine Szenarioreferenzen, kompletter Preflight, Illustration und Poster-Authoring vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T50-AC04 · partial

Anfang und Ergebnis besitzen einen verständlichen Poster ohne zweiten Fachstate

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Allgemeine Szenarioreferenzen, kompletter Preflight, Illustration und Poster-Authoring vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T50-AC05 · partial

fehlende Referenzen und unbelegte Erfolgszustände werden vor dem Lauf abgewiesen

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Allgemeine Szenarioreferenzen, kompletter Preflight, Illustration und Poster-Authoring vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T51: Gemeinsame Theme- und Design-Tokens

### T51-AC01 · partial

Farbe, Typografie, Abstand, Radien und Motion besitzen eine kanonische versionierte Quelle

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Tokenmigration, benannter Importteilumfang, Assetversionierung und Kontrastqualifikation ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T51-AC02 · partial

CSS und GPU-Werte werden einschließlich Einheiten und Farbraum daraus abgeleitet

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Tokenmigration, benannter Importteilumfang, Assetversionierung und Kontrastqualifikation ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T51-AC03 · partial

verwendete Looks, Fonts und Assets werden am tatsächlich dargestellten Ergebnis qualifiziert

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Tokenmigration, benannter Importteilumfang, Assetversionierung und Kontrastqualifikation ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T51-AC04 · open

unterstützte Importtypen und Aliasse sind benannt und ungültige oder zyklische Referenzen scheitern sichtbar

**Scope:** Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme.

**Offen:** Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test.

Kein Nachweis im Register.

### T51-AC05 · partial

Fremd-Defaults unterschreiten keine Produktregeln für Lesbarkeit, Ziele und Kontrast

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Tokenmigration, benannter Importteilumfang, Assetversionierung und Kontrastqualifikation ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T52: Kausale Choreografie und gemessene Ziele

### T52-AC01 · partial

Ein gezeigter Klick führt den im Ziel deklarierten gültigen Eventvertrag aus und ein Guardfehler erzeugt keinen visuellen Erfolg

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Effektplan-/Framebezug und Cursor/Anker sowie Reduced-Motion-/Retargeting-/Supportmatrix qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T52-AC02 · partial

Event, Beat, Revision und aufgelöster Effekt bleiben korrelierbar

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Effektplan-/Framebezug und Cursor/Anker sowie Reduced-Motion-/Retargeting-/Supportmatrix qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T52-AC03 · partial

Cursor, Auswahl und Anker folgen gemessenen dargestellten Parts statt festen Bildschirmkoordinaten

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Effektplan-/Framebezug und Cursor/Anker sowie Reduced-Motion-/Retargeting-/Supportmatrix qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T52-AC04 · partial

Unterbrechungen retargeten vom aktuellen Bild und Lesepausen verzögern keinen Fachcommit

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Effektplan-/Framebezug und Cursor/Anker sowie Reduced-Motion-/Retargeting-/Supportmatrix qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T52-AC05 · partial

Nutzerübernahme, Reduced Motion, Pause, offscreen und Disposal sind ohne zweite Renderloop geprüft

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Effektplan-/Framebezug und Cursor/Anker sowie Reduced-Motion-/Retargeting-/Supportmatrix qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T53: Responsive Komposition und Präsentationsprojektion

### T53-AC01 · partial

Anfang und Ergebnis sind im realen Host sowie in eigenständiger kompakter Komposition lesbar

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Gemeinsame PresentationProjection mit Clip/Inverse, Kamera und vollständiger Eingabe-/Scroll-/DPR-Matrix umsetzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T53-AC02 · partial

operative Controls, Fokus und Pflichtinhalte bleiben vollständig erreichbar

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Gemeinsame PresentationProjection mit Clip/Inverse, Kamera und vollständiger Eingabe-/Scroll-/DPR-Matrix umsetzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T53-AC03 · open

Layout, Clip, Pointer-Hit-Testing und Semantik verwenden dieselbe qualifizierte Transformation und Inverse

**Scope:** Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme.

**Offen:** Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test.

Kein Nachweis im Register.

### T53-AC04 · open

optionale Kamera und illustrative Crops ändern weder Fachstate noch URL oder Datenwahrheit

**Scope:** Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme.

**Offen:** Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test.

Kein Nachweis im Register.

### T53-AC05 · partial

Reduced-Motion-Poster und Interaktion nach Resize, Scroll und Retargeting sind getrennt geprüft

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Gemeinsame PresentationProjection mit Clip/Inverse, Kamera und vollständiger Eingabe-/Scroll-/DPR-Matrix umsetzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T54: Zeitliche GPU-Rehearsal

### T54-AC01 · partial

Jeder erfasste Frame besitzt Run-, Zeit-, Build-, Daten-, Token-, Asset-, Backend-, Viewport-, Event- und Rezeptbezug

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Kontinuierlichen Vollscan mit vollständigem Manifest, Bild-/GPU-Zuordnung, Lücken-, Sprung-, Drift- und Loopanalyse sowie natives Pacing implementieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T54-AC02 · partial

GPU-Arbeitsabschluss und tatsächliche Bildaufnahme werden getrennt bestätigt und der dargestellten Scene zugeordnet

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Kontinuierlichen Vollscan mit vollständigem Manifest, Bild-/GPU-Zuordnung, Lücken-, Sprung-, Drift- und Loopanalyse sowie natives Pacing implementieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T54-AC03 · partial

fehlende, verspätete oder nicht zuordenbare Frames und Geräteverlust ergeben inconclusive statt bestanden

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Kontinuierlichen Vollscan mit vollständigem Manifest, Bild-/GPU-Zuordnung, Lücken-, Sprung-, Drift- und Loopanalyse sowie natives Pacing implementieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T54-AC04 · open

alle erfassten Frames einschließlich Ein-/Ausstieg, Retargeting und optional Loop plus nächstem Anfang werden ursachenbezogen auf Sprung, Drift und Textfehler geprüft

**Scope:** Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme.

**Offen:** Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test.

Kein Nachweis im Register.

### T54-AC05 · partial

deterministische Regression, Echtzeit-Pacing, Kontaktübersicht und manuelle Bildreview sind getrennte Nachweise und bekannte Negativkontrollen schlagen an

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Kontinuierlichen Vollscan mit vollständigem Manifest, Bild-/GPU-Zuordnung, Lücken-, Sprung-, Drift- und Loopanalyse sowie natives Pacing implementieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### R5-AC01 · partial

Capture bindet Bild und Geometrie an denselben Lauf, Modus und Zeitpunkt. Replay sowie zwischenzeitliche Änderungen werden bei Live-Nachweisen abgewiesen. AC-Nachweise sind nach ID auffindbar und ihr Download prüft den Inhaltshash.

**Scope:** Live-Aufnahme mit Originalpixeln und gebundener Geometrie, Ablehnung bei Replay oder Wechsel der Revision sowie nach AC-ID gebundener Download im lokalen Studio. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T55: Studio-Qualitätswerkstatt und Beat-Inspector

### T55-AC01 · partial

Studio zeigt Design-, Layout-/Semantik-, Motion-, Vergleichs- und AI-Reviewbereiche mit getrennten Befundarten und Abdeckungsstatus

**Scope:** M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`

### T55-AC02 · partial

jeder belegte Befund navigiert zu gültigem Run, Frame und Part ohne Fachstateänderung

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Persistente unveränderliche Runs, Run-/Frame-/Part-URLs, Partnavigation, Authoring und vollständige CI-Rehearsal ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`

### T55-AC03 · partial

Story, Timeline, Scriptansicht und Showcase verwenden denselben versionierten Vertrag und importieren keinen beliebigen Code

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Persistente unveränderliche Runs, Run-/Frame-/Part-URLs, Partnavigation, Authoring und vollständige CI-Rehearsal ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`

### T55-AC04 · partial

Baseline und Kandidat sowie gespeicherte Artefakte sind unveränderlich versioniert und UI und CI nutzen dieselben Prüfer

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Persistente unveränderliche Runs, Run-/Frame-/Part-URLs, Partnavigation, Authoring und vollständige CI-Rehearsal ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`

### T55-AC05 · partial

Reviewansichten sind zugänglich bedienbar und ihre validierten URLs enthalten nur Navigationsreferenzen mit definierten Not-found-Zuständen

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Persistente unveränderliche Runs, Run-/Frame-/Part-URLs, Partnavigation, Authoring und vollständige CI-Rehearsal ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`

## T56: Referenzkorpus und kontrollierter Qualitätsvergleich

### T56-AC01 · open

Eigene Referenzfälle decken Tabelle, Karte/Detail und mindestens einen datenabhängigen Workflow mit Daten- und Assetherkunft ab

**Scope:** Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme.

**Offen:** Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test.

Kein Nachweis im Register.

### T56-AC02 · open

Baseline und Kandidat verwenden denselben Brief, Datensatz, Seed, Viewport, Font- und Geräte-/Backendstand mit randomisierter Bewertungsreihenfolge und wiederholten Runs

**Scope:** Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme.

**Offen:** Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test.

Kein Nachweis im Register.

### T56-AC03 · open

Daten-/Rechte-/Accessibility- und Rendererfehler bleiben harte Gates unabhängig vom Stilscore

**Scope:** Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme.

**Offen:** Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test.

Kein Nachweis im Register.

### T56-AC04 · open

Hierarchie, Dichte, Identität, Framing und Motion werden mit versionierter Rubrik und konkreten Bildbelegen bewertet

**Scope:** Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme.

**Offen:** Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test.

Kein Nachweis im Register.

### T56-AC05 · open

Umfang, Streuung, Regressionen und nicht belegte Vorteile werden offengelegt statt Qualitäts- oder Conversion-Lift zu behaupten

**Scope:** Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme.

**Offen:** Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test.

Kein Nachweis im Register.

## T57: Design-Regressions- und Review-Lernschleife

### T57-AC01 · partial

Wiederkehrender Befund besitzt Regel-ID, Ursache und konkreten Frame-/Partbeleg

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Persistentes Issue-/Regressionsregister, unabhängige Review und systematische Nachbarfälle vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T57-AC02 · partial

Änderung erfolgt im zuständigen Token, Rezept, Vertrag oder Prüfer mit gezieltem Fehl- und Gutkontrollfall

**Scope:** M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T57-AC03 · partial

Ausnahmen sind eng auf Regel, Node und Beat begrenzt und verbergen keine realen Fehler durch globale Masken

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Persistentes Issue-/Regressionsregister, unabhängige Review und systematische Nachbarfälle vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T57-AC04 · partial

erneute Prüfung umfasst betroffenen Ablauf und Nachbarn mit versioniertem Vorher/Nachher-Nachweis

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Persistentes Issue-/Regressionsregister, unabhängige Review und systematische Nachbarfälle vervollständigen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T57-AC05 · open

unabhängige Review erhält ein begrenztes Referenz-/Ergebnisbundle und keine automatische globale Agent- oder Policy-Umschreibung findet statt

**Scope:** Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme.

**Offen:** Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test.

Kein Nachweis im Register.

## T58: Multimodale AI-Designanalyse

### T58-AC01 · partial

Ein explizit freigegebenes Review-Bundle enthält ausgewählte pixelredigierte Frames, Brief und begrenzte Metadaten mit sichtbarem Provider- und Datenumfang

**Scope:** Lokaler direkter OpenAI-Review über Vercel AI SDK, reale WebGPU-Frames und unabhängige Referenzvalidierung; kein vollständiges Produktions-/Evaluationsgate. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Allgemeine pixelweise Maskierung, Host-/Projektberechtigungen und alle produktiven Datenpfade fehlen; sensitive Parts verweigern aktuell die Aufnahme. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`

### T58-AC02 · partial

strukturierte Befunde nennen existierende Frame-/Partreferenzen oder gültige Bildregionen, Begründung, Unsicherheit und Herkunft

**Scope:** Lokaler direkter OpenAI-Review über Vercel AI SDK, reale WebGPU-Frames und unabhängige Referenzvalidierung; kein vollständiges Produktions-/Evaluationsgate. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`

### T58-AC03 · partial

Modelltext ist untrusted input und Änderungen erfolgen nur mit überprüfbarer Vorschau und erlaubter Projektpolicy oder Reviewfreigabe ohne harte Gates zu überschreiben

**Scope:** Lokaler direkter OpenAI-Review über Vercel AI SDK, reale WebGPU-Frames und unabhängige Referenzvalidierung; kein vollständiges Produktions-/Evaluationsgate. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Live-Gateway/Modell, Pixelmaskierung, echte Modellevaluation/Prompt-Injection-Korpus, Änderungsdiffs und dauerhafte Projekt-/Budgetautorität qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`

### T58-AC04 · partial

versionierte Evaluationen prüfen Gut-/Fehlfälle, Prompt Injection, erfundene Referenzen und getrennte AI-Frameabdeckung

**Scope:** Lokaler direkter OpenAI-Review über Vercel AI SDK, reale WebGPU-Frames und unabhängige Referenzvalidierung; kein vollständiges Produktions-/Evaluationsgate. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breiter unabhängiger Gut-/Fehlkorpus, visuelle und mehrstufige Injection, Wiederholungen und Human-Grading bleiben offen; ein adversarieller Brief ist live nachgewiesen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`
- Nachweis: `docs/qa/2026-11-02-openai/brief-injection-v1.json`, SHA-256 `7a49a0cb9d2c8ff0c773970d735ec5bf6ed9bbfedcd6f458e6efc6f3ce2ffee5`

### T58-AC05 · partial

serverseitige Rechte, Budgetreservierung, Usage, Limits, Deadlines und Abort sind geprüft und fehlender Provider blockiert weder lokale Prüfer noch die Manual-Anwendungsruntime

**Scope:** Lokaler direkter OpenAI-Review über Vercel AI SDK, reale WebGPU-Frames und unabhängige Referenzvalidierung; kein vollständiges Produktions-/Evaluationsgate. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Mehrinstanz-/Persistenz-/Hostauth- und produktive Berechtigungs-/Budgetgates bleiben offen; lokale Origin-, Session-, Input-, Konkurrenz-, Usage-, Deadline- und Abortgrenzen getestet. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`

## T59: Komponentenverträge und Inventar

### T59-AC01 · partial

Für Tabelle, Auswahlcontrol, Karte, Map-Knoten und Inspector sind Parts, Rollen, Namen, Fokusregeln, Keyboard-/Pressverhalten und kontrollierte Werte benannt. Ein Tabellenlabel oder dekoratives Element wird nicht implizit zum Button

**Scope:** Historischer Prüflauf bis 14.11.2026. Deklarative Anatomy und getrennte Besitzer für fachliche IDs, Interaktion und Selection-Anker sind im Core-/Workspace-Vertrag und gezielten Tests belegt. Dies ist keine Screenreader-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/component-definition.test.ts`, SHA-256 `21d9377682b0d63e5e719ea0534114f515303ed15d3489e53801ed635f855ef5`
- Nachweis: `tests/unit/collection.test.ts`, SHA-256 `372a42e412b93f09027012efdc48f4eb6349bb58bffd2be952317758db6b518d`
- Nachweis: `tests/unit/core-collection.test.ts`, SHA-256 `3959e010829e3e888764f60fe0107e60712064c6e70a27e6ff1109d3ad638c3c`
- Nachweis: `packages/contracts/src/components.ts`, SHA-256 `978f512b9be95e10ff1b61ada0d182201fd872e12aa4f8fe44a61f59e669e9f0`

### T59-AC02 · partial

Fachliche Mehrfachauswahl verwendet stabile Modul-IDs. Fokus, Selection-Anker und sichtbare Reihe besitzen ausdrücklich getrennte Bedeutungen und Besitzer

**Scope:** Historischer Prüflauf bis 14.11.2026. Deklarative Anatomy und getrennte Besitzer für fachliche IDs, Interaktion und Selection-Anker sind im Core-/Workspace-Vertrag und gezielten Tests belegt. Dies ist keine Screenreader-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/component-definition.test.ts`, SHA-256 `21d9377682b0d63e5e719ea0534114f515303ed15d3489e53801ed635f855ef5`
- Nachweis: `tests/unit/collection.test.ts`, SHA-256 `372a42e412b93f09027012efdc48f4eb6349bb58bffd2be952317758db6b518d`
- Nachweis: `tests/unit/core-collection.test.ts`, SHA-256 `3959e010829e3e888764f60fe0107e60712064c6e70a27e6ff1109d3ad638c3c`
- Nachweis: `packages/contracts/src/components.ts`, SHA-256 `978f512b9be95e10ff1b61ada0d182201fd872e12aa4f8fe44a61f59e669e9f0`

### T59-AC03 · partial

Ein ausführbarer Fehlfall weist unbekannte Partreferenzen, fehlende Namen, unzulässige Aktionen und doppelte IDs ab. Ein gültiger Vergleichsfall wird akzeptiert

**Scope:** Historischer Prüflauf bis 14.11.2026. Zod-/Referenzvalidierung weist ungültige Parts, Namen, Actions und IDs ab; serialisierbare Verträge und First-party-Clientgrenze sind geprüft. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/component-definition.test.ts`, SHA-256 `21d9377682b0d63e5e719ea0534114f515303ed15d3489e53801ed635f855ef5`
- Nachweis: `tests/unit/client-import-boundary.test.ts`, SHA-256 `4827dbba0a9acc9626632803040bffac9e23886b40820615f592ff86ab9c19a4`
- Nachweis: `packages/contracts/src/components.ts`, SHA-256 `978f512b9be95e10ff1b61ada0d182201fd872e12aa4f8fe44a61f59e669e9f0`

### T59-AC04 · partial

Für jeden vorgeschlagenen SDK-Import sind öffentliche API, Version, Lizenz, transitive Abhängigkeiten und DOM-/Servergrenzen dokumentiert. Ein interner `/renderer`-Import zählt nicht als bestandene öffentliche Integration

**Scope:** Historischer Prüflauf bis 14.11.2026. Vier tatsächlich verwendete öffentliche SDK-Importpfade, installierte Pins, Lizenzdateien, Lockfile-Transitivität sowie DOM-/Servergrenzen sind konsolidiert und per Exportimport geprüft. Node-headless Selection und initiales SSR sind ausgeführt; keine First-party-Nutzung privater Renderer-/Agentmodule. Interne Supplier-Rendererabhängigkeiten werden ausdrücklich genannt. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/collection.test.ts`, SHA-256 `372a42e412b93f09027012efdc48f4eb6349bb58bffd2be952317758db6b518d`
- Nachweis: `tests/unit/client-import-boundary.test.ts`, SHA-256 `4827dbba0a9acc9626632803040bffac9e23886b40820615f592ff86ab9c19a4`
- Nachweis: `docs/research/vercel-ui-sdk.md`, SHA-256 `196f17f85a37d83a68f95205502865a3570cfd37f84148d76ce1bd4a52d162b6`
- Nachweis: `packages/contracts/src/components.ts`, SHA-256 `978f512b9be95e10ff1b61ada0d182201fd872e12aa4f8fe44a61f59e669e9f0`

### T59-AC05 · partial

Zod-Schemas sind Quelle der serialisierbaren Types. Kein DOM-, GPU- oder Providerobjekt gelangt in gespeicherte Komponenten- oder Fachzustandsdaten

**Scope:** Historischer Prüflauf bis 14.11.2026. Zod-/Referenzvalidierung weist ungültige Parts, Namen, Actions und IDs ab; serialisierbare Verträge und First-party-Clientgrenze sind geprüft. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/component-definition.test.ts`, SHA-256 `21d9377682b0d63e5e719ea0534114f515303ed15d3489e53801ed635f855ef5`
- Nachweis: `tests/unit/client-import-boundary.test.ts`, SHA-256 `4827dbba0a9acc9626632803040bffac9e23886b40820615f592ff86ab9c19a4`
- Nachweis: `packages/contracts/src/components.ts`, SHA-256 `978f512b9be95e10ff1b61ada0d182201fd872e12aa4f8fe44a61f59e669e9f0`

## T60: Gemeinsames Layout und dargestellte Interaktionsgeometrie

### T60-AC01 · partial

Stabile Part-IDs, Bounds, Clipbereich, Z-Reihenfolge, Sichtbarkeit und gültige Transformation/Inverse werden einmalig definiert. GPU und Brücke rechnen keine unabhängigen Platzierungen aus Fensterkoordinaten nach

**Scope:** Historischer Prüflauf bis 14.11.2026. Ein Core-Layout löst Parts, Bounds, Clips, Layer und Transform/Inverse auf; GPU und Semantik projizieren diese Geometrie. Validierung und Regression x900/w240/Viewport1000→84px sind ausgeführt; kein unabhängiger DOM-/GPU-Fachlayoutpfad. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/component-definition.test.ts`, SHA-256 `21d9377682b0d63e5e719ea0534114f515303ed15d3489e53801ed635f855ef5`

### T60-AC02 · partial

In Tabelle, Karten und Map stimmen sichtbare Ziele und native Ziele bei Resize, Clipgrenzen und DPR-Wechsel innerhalb der vorab benannten Messgenauigkeit überein

**Scope:** Historischer Prüflauf bis 14.11.2026. Lokale Achtlaufmatrix: 144 Fälle/720 Phasen, maximale DOMRect-/Präsentationsabweichung 0,007812 CSS-px bei vorab 1px Toleranz. Ergänzende tatsächliche DPR1→DPR2-Läufe beider Backends prüfen 36 Fälle/180 weitere Phasen. Resize und Clipgrenzen sind zusätzlich in Core-/DOM-Brückentests belegt. Browserbreite und Surfacegröße bleiben getrennt; keine zusätzliche Gerätefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/collection-bridge.test.ts`, SHA-256 `e1d1c34fb214225910e58c345351497e2c0a47d9544c4951743e2b62dc7dfdaf`
- Nachweis: `tests/unit/m8-qualification.test.ts`, SHA-256 `fe1bf4346bd4595740065c76cd982bc43b8dcf692aa72484810e51ca0f7dc46b`

### T60-AC03 · partial

Ausgeblendete, austretende oder durch eine höhere Fläche verdeckte Controls besitzen keine unsichtbare aktive Trefferfläche. Ein dekorativer Linsen-/Partikelpart erhält keine Interaktion

**Scope:** Historischer Prüflauf bis 14.11.2026. Ausgeführte Tests der echten Pointer-Hitlogik und React-Semantikbrücke sperren Hidden-/Exiting-/Disabled-/Occlusion- und geclippte Ziele; dekorative Aktionslosigkeit bleibt bestehen. Die reale GPU-Matrix bindet die verwendeten Präsentationsbounds. Negative Occlusion-Eingaben sind Unit/DOM-Evidenz, keine als nativ ausgegebene zusätzliche Browserjourney. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/hit-testing.test.ts`, SHA-256 `fcee6bf3c51cd9bf69017ccee72cf0d6cf6380833c99f584d361ff7e6982076e`
- Nachweis: `tests/unit/selection-visibility.test.ts`, SHA-256 `eda6deb26a91c3037e02cf3b7fb7b5187d5c0fa52eb8fd7fdd0a3c785be74f23`
- Nachweis: `tests/unit/collection-bridge.test.ts`, SHA-256 `e1d1c34fb214225910e58c345351497e2c0a47d9544c4951743e2b62dc7dfdaf`

### T60-AC04 · partial

Bei M7-Übergängen und Unterbrechungen verwendet die Eingabe qualifizierte dargestellte Bounds. Fokus, Textauswahl und aktive Eingabe werden nicht zusätzlich durch Effektmaterialien verzerrt

**Scope:** Historischer Prüflauf bis 14.11.2026. Aktuelle Matrix und native Effekt-/Interrupt-/Seek-Journey bestätigen dargestellte Eingabebounds. Im neuen WebGPU-Lauf bei Liquid Lens50% bleiben native Suchtextauswahl, scharfer GPU-Selection-/Fokusrahmen und Feldbounds erhalten; natives Ersetzen der Auswahl unterbricht zur gültigen Revision6 ohne Fokus-/Datenverlust. Tests prüfen ergänzend geschützte Eingaben und Auswahl bei Austritt/Unterbrechung. Die native Beobachtung beansprucht weder IME noch alle Betriebssysteme oder ein gespeichertes Screenshotarchiv. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/collection-bridge.test.ts`, SHA-256 `e1d1c34fb214225910e58c345351497e2c0a47d9544c4951743e2b62dc7dfdaf`
- Nachweis: `tests/unit/selection-visibility.test.ts`, SHA-256 `eda6deb26a91c3037e02cf3b7fb7b5187d5c0fa52eb8fd7fdd0a3c785be74f23`
- Nachweis: `tests/unit/m8-qualification.test.ts`, SHA-256 `fe1bf4346bd4595740065c76cd982bc43b8dcf692aa72484810e51ca0f7dc46b`

### T60-AC05 · partial

Der Proof weist sichere Layer-/Clipregeln und sichtbare Fokusringe nach. Der Messbericht nennt Browser- und tatsächliche Surfacegröße getrennt

**Scope:** Historischer Prüflauf bis 14.11.2026. GPU-Fokusrahmen, Layer-/Clipregeln und Eigentümerschaft sind getestet. Native Desktop-/Kompaktjourney hat sichtbaren zweifarbigen Fokus geprüft; archivierte Matrixbilder ergänzen begrenzte Agent-Sichtprüfung. Browser-/Surfacegrößen sind getrennt aufgezeichnet, etwa 390px Browser/353px native Showcase-Surface beziehungsweise 351px Matrix-Surface. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/focus-ring.test.ts`, SHA-256 `997b93fe7bf37cb63630de113282cc1f1361c6203857c22d4fa827f12b110253`
- Nachweis: `tests/unit/m8-qualification.test.ts`, SHA-256 `fe1bf4346bd4595740065c76cd982bc43b8dcf692aa72484810e51ca0f7dc46b`

### R3-AC01 · partial

Der gepinnte UI-SDK-Adapter besteht Collection-Vertragsprüfungen. Im Browser funktionieren kontrollierte Tabs, Dialogrückkehr und ein Bibliothekswechsel mit unverändertem Fachzustand.

**Scope:** Je 40 identische Tests für UI SDK Beta.1 und Beta.13. Im Browser wurden Tab-Auswahl, Escape-Rückkehr und der Wechsel zu Base UI bei erhaltener Auswahl geprüft. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T61: Selection-/Typeahead-Pilot und sichtbarer Multipart-GPU-Proof

### T61-AC01 · partial

Der Pilot verwendet denselben validierten Workspace-Datensatz in allen drei Ansichten. Sortieren und Filtern verändern keine Modulidentitäten oder erfundenen Werte

**Scope:** Ein validierter realer Workspace-Datensatz projiziert stabile Modul-IDs in Tabelle, Karten und Map; Sortierung/Filter erfinden keine Fachwerte. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/core-collection.test.ts`, SHA-256 `3959e010829e3e888764f60fe0107e60712064c6e70a27e6ff1109d3ad638c3c`

### T61-AC02 · partial

Mehrfachauswahl, Range-Anker, Auswahlumschaltung und Tastaturbewegung folgen dokumentierten Regeln für sichtbare, gefilterte und deaktivierte Einträge. Die Semantik bildet die gewählte Tabellen-/Composite-Interaktion korrekt ab. Keine Rollenwahl allein wegen des visuellen Rasters

**Scope:** Sichtbare Reihenfolge, Disabled-Regeln, Range-Anker, Typeahead-Zeit/Reset/Wiederholung/Normalisierung und Schutz von Text-/Composition-Eingaben sind in eigenen Core- und DOM-Brückentests qualifiziert. Die native Vorführung wird zusätzlich über T61-AC06/T65-AC03 gebunden. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/collection.test.ts`, SHA-256 `372a42e412b93f09027012efdc48f4eb6349bb58bffd2be952317758db6b518d`
- Nachweis: `tests/unit/collection-bridge.test.ts`, SHA-256 `e1d1c34fb214225910e58c345351497e2c0a47d9544c4951743e2b62dc7dfdaf`
- Nachweis: `tests/unit/core-collection.test.ts`, SHA-256 `3959e010829e3e888764f60fe0107e60712064c6e70a27e6ff1109d3ad638c3c`

### T61-AC03 · partial

Typeahead besitzt festgelegte Zeit-/Reset-/Wiederholungsregeln und eine bewusste Textnormalisierung. Während Texteingabe oder Composition fängt es keine Zeichen für eine konkurrierende Navigation ab

**Scope:** Sichtbare Reihenfolge, Disabled-Regeln, Range-Anker, Typeahead-Zeit/Reset/Wiederholung/Normalisierung und Schutz von Text-/Composition-Eingaben sind in eigenen Core- und DOM-Brückentests qualifiziert. Die native Vorführung wird zusätzlich über T61-AC06/T65-AC03 gebunden. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/collection.test.ts`, SHA-256 `372a42e412b93f09027012efdc48f4eb6349bb58bffd2be952317758db6b518d`
- Nachweis: `tests/unit/collection-bridge.test.ts`, SHA-256 `e1d1c34fb214225910e58c345351497e2c0a47d9544c4951743e2b62dc7dfdaf`
- Nachweis: `tests/unit/core-collection.test.ts`, SHA-256 `3959e010829e3e888764f60fe0107e60712064c6e70a27e6ff1109d3ad638c3c`

### T61-AC04 · partial

Auswahl, Sortierung und zugehöriger Inspectorinhalt stimmen nach Tabelle → Karten → Map → Tabelle überein. Fokus behält seine logische Identität oder folgt der dokumentierten Fallback-Regel, ohne auf entfernte Controls zu zeigen

**Scope:** Aktueller nativer Tabelle→Karten→Map→Tabelle-Zyklus erhält core/effects, numerische Sortierung und Inspector; Filter behält versteckte Auswahl. Echte DOM-Brückentests prüfen Fokusreparenting, Fallback und Schutz eines neu gewählten Studiofokus. Native Typeahead-Fokussierung wurde separat beobachtet, kein Screenreaderclaim. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/collection-bridge.test.ts`, SHA-256 `e1d1c34fb214225910e58c345351497e2c0a47d9544c4951743e2b62dc7dfdaf`

### T61-AC05 · partial

Alle drei neuen M7-Rezepte sind einzeln auslösbar. Gleicher Seed/Zeitpunkt ist reproduzierbar. Unterbrechung, Rückwärts-Seek und Reduced Motion erhalten den gültigen Fachzustand. Alte Buildnachweise werden nicht als neue Regression ausgegeben

**Scope:** Alle drei Rezepte sind nativ einzeln ausgelöst und während laufender Präsentation ersetzt; Rückwärts-Seek und Reduced Motion erhalten Auswahl und Fachrevision. Aktuelle echte GPU-Matrix liefert fünf Phasen pro Richtung; reine Samplertests belegen gleiche Seed-/Zeitpunkte und Rückwärtsauswertung. Die Matrix ist keine durchgehende Filmabnahme und kein cross-backend-pixelidentischer Seedvergleich. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/m8-qualification.test.ts`, SHA-256 `fe1bf4346bd4595740065c76cd982bc43b8dcf692aa72484810e51ca0f7dc46b`

### T61-AC06 · partial

Der sichtbare Proof wird bei Desktop- und kompakter Breite mit Pointer und Tastatur vorgeführt. Screenshots, Trace und Geometrie besitzen denselben Build-/Runbezug

**Scope:** Echte native Pointer-/Tastaturvorführung bei1280px und390px im selben Build3cf und Datensatz: tatsächlich heruntergeladene Originalbilder,17/22 Traceeinträge, Snapshot und je45 native Ziele desselben Capture-Runs; null Zielabweichung. Gzip-/Download-/PNG-Digests und CRC unabhängig geprüft, beide Originale visuell gelesen. Der Export selbst behauptet keine Eingabeherkunft; diese ist gesondert beobachtet. Einzelbildnachweis, keine Film-/AT-/Hardwarefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/collection-bridge.test.ts`, SHA-256 `e1d1c34fb214225910e58c345351497e2c0a47d9544c4951743e2b62dc7dfdaf`
- Nachweis: `tests/unit/m8-qualification.test.ts`, SHA-256 `fe1bf4346bd4595740065c76cd982bc43b8dcf692aa72484810e51ca0f7dc46b`

## T62: UI SDK und Base UI im Studio vergleichen

### T62-AC01 · partial

Ein kleiner Vergleichsflow umfasst Tabs, eine Auswahlliste und einen Dialog mit Fokusübergabe/-rückgabe. Nur öffentlich verfügbare Kandidaten werden verwendet. Eine fehlende Komponente wird als Lücke dokumentiert

**Scope:** Öffentliche Tabs-, Select- und Dialog-Primitives beider gepinnten Bibliotheken steuern denselben kleinen Studioflow. Native Prüfung bestätigt Dialog-Fokusübergabe und -rückgabe; Import-/SSR-Inventar nennt öffentliche Pfade und Grenzen. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/behavior-comparison.test.ts`, SHA-256 `5d3de71ec66f638a998a1831eb9880a0c2bbf3cfb31ea115cdcc33efa5809f15`

### T62-AC02 · partial

Namen, Tastaturbedienung, Escape, Disabled-Zustand und kontrollierte Änderungen werden auf beiden Pfaden anhand derselben Ereignisfolgen geprüft

**Scope:** Identische native Tabs-/Select-/Dialogfolgen prüfen Namen, Tastatur, Escape, deaktiviertes Detail und kontrollierte Werte beider Adapter. Der reale Base-UI-Attributionsbefund wurde korrigiert, mit acht DOM-Regressionen sowie nativ erneut geprüft. Keine automatische AT-/Mobilfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/behavior-comparison.test.ts`, SHA-256 `5d3de71ec66f638a998a1831eb9880a0c2bbf3cfb31ea115cdcc33efa5809f15`

### T62-AC03 · partial

Beide Kandidaten steuern dieselbe Fluid-Vorschau. Keiner besitzt eine separate Kopie von Fachwerten oder umgeht Guards durch UI-Callbacks

**Scope:** Beide DOM-Kandidaten besitzen dieselbe fortbestehende Fluid-Runtime, denselben Datensatz und eine GPU-Surface. Bibliothekswechsel erhält Domainwerte; kontrollierte Änderungen und Guardablehnungen sind in echten Core-/DOM-Tests geprüft. Dialogzustand bleibt lokal ohne Fachcommit. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/behavior-comparison.test.ts`, SHA-256 `5d3de71ec66f638a998a1831eb9880a0c2bbf3cfb31ea115cdcc33efa5809f15`

### T62-AC04 · partial

Vergleich nennt Importumfang, benötigte eigene Adapter, offene Fehler und wartbare API-Grenzen. Weder Herkunft noch Beta-/Stable-Bezeichnung ersetzen gemessene Bedienbarkeit oder eigene Accessibility-Nachweise

**Scope:** Tatsächliche öffentliche Imports/Transitivität, eigene kontrollierte Callback-/Modalitätsadapter und Wartungsgrenzen sind inventarisiert. Gleich konfigurierte Bundlecases sind reproduziert; native Bedienbefunde ergänzen den Vergleich. Beta-/Stable- oder Anbieterherkunft wird nicht als Qualitätsnachweis verwendet. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/behavior-comparison.test.ts`, SHA-256 `5d3de71ec66f638a998a1831eb9880a0c2bbf3cfb31ea115cdcc33efa5809f15`

### T62-AC05 · partial

Ergebnis ist pro Baustein Übernehmen, Beibehalten oder Vertagen mit Begründung. Kein vollständiger Studioaustausch allein wegen eines erfolgreichen Einzelimports

**Scope:** ADR-0007 entscheidet pro Baustein: öffentliche controlled Selection übernehmen; timerfreies Typeahead und Multipart/Layout/Policy selbst besitzen; Base-UI-Tabs/Select/Dialog beibehalten; öffentliche SDK-DOM-Bausteine im Vergleichslabor belassen. Entscheidung beruht auf lokalen Fähigkeiten, Import-/Wartungsbedarf und reproduziertem isoliertem Bundleumfang. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/behavior-comparison.test.ts`, SHA-256 `5d3de71ec66f638a998a1831eb9880a0c2bbf3cfb31ea115cdcc33efa5809f15`

## T63: Begrenzte Fluid-Agentbridge

### T63-AC01 · partial

Ohne Konfiguration ist keine Aktion freigeschaltet. Komponenten, Aktionen und Parameter werden gegen die registrierte Allowlist geprüft. Unbekannte Ziele erzeugen einen nachvollziehbaren Fehler ohne Zustandsänderung

**Scope:** Default-deny, registrierte Ziele/Parameter/Scopes, redigierte read-only Snapshots/Queries sowie fehlende Domain-/Fokus-/History-Schreibaktionen sind negativ getestet. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/agent-bridge.test.ts`, SHA-256 `096e558a19ca63942def962973e3c7632b666d738e83f7c958f8e8aba7f5f90c`
- Nachweis: `tests/unit/agent-callback-boundaries.test.ts`, SHA-256 `2d47880137b296b678364794c05e2529685b5595f9240f5884625d735d86c5fe`
- Nachweis: `packages/contracts/src/agent.ts`, SHA-256 `0950118a66fb9c8bf2e2c1958c1d80c0c97471dfcd749086ba410534b95df25e`
- Nachweis: `packages/core/src/agent.ts`, SHA-256 `85c9ebd8fcfeb93ff0ac70ed4a0fc0ae1983babc54090e12fc140bf85cd44faa`
- Nachweis: `packages/core/src/data.ts`, SHA-256 `783b46c38fc2463f74997d5b4190303c11e0e81c1db6ce52b4378d2158bce662`

### T63-AC02 · partial

Snapshot- und Query-Aufrufe sind strikt lesend: kein Fokuswechsel, Popupöffnen, History-Eintrag oder fachlicher Commit. Ergebnisse sind an den berechtigten Scope und die gelesene Revision gebunden und vor Ausgabe redigiert. Ein Snapshot darf keine zusätzliche Aktion zur vermeintlichen Vorbereitung auslösen

**Scope:** Default-deny, registrierte Ziele/Parameter/Scopes, redigierte read-only Snapshots/Queries sowie fehlende Domain-/Fokus-/History-Schreibaktionen sind negativ getestet. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/agent-bridge.test.ts`, SHA-256 `096e558a19ca63942def962973e3c7632b666d738e83f7c958f8e8aba7f5f90c`
- Nachweis: `tests/unit/agent-callback-boundaries.test.ts`, SHA-256 `2d47880137b296b678364794c05e2529685b5595f9240f5884625d735d86c5fe`
- Nachweis: `packages/contracts/src/agent.ts`, SHA-256 `0950118a66fb9c8bf2e2c1958c1d80c0c97471dfcd749086ba410534b95df25e`
- Nachweis: `packages/core/src/agent.ts`, SHA-256 `85c9ebd8fcfeb93ff0ac70ed4a0fc0ae1983babc54090e12fc140bf85cd44faa`
- Nachweis: `packages/core/src/data.ts`, SHA-256 `783b46c38fc2463f74997d5b4190303c11e0e81c1db6ce52b4378d2158bce662`

### T63-AC03 · partial

Jeder Änderungsrequest enthält gültige Versions-/Revisionsbezüge. Veraltete Requests und währenddessen veränderte Berechtigungen können keinen Commit erzwingen

**Scope:** Revisions-/Policy-/Expiry-/Abort-/Interaktionsprüfungen werden über Await und reentrante Hostcallbacks erneut geprüft. Derselbe Core führt den validierten Commit aus; der bestätigte authorize-Reentry-Fehler ist regressionsgeprüft behoben. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/agent-bridge.test.ts`, SHA-256 `096e558a19ca63942def962973e3c7632b666d738e83f7c958f8e8aba7f5f90c`
- Nachweis: `tests/unit/agent-callback-boundaries.test.ts`, SHA-256 `2d47880137b296b678364794c05e2529685b5595f9240f5884625d735d86c5fe`
- Nachweis: `tests/unit/runtime-transactions.test.ts`, SHA-256 `20dc880e8e18d6a47c2c72fe1f932846cdfdd64dd22c18b73cdca9a5cea064ad`
- Nachweis: `packages/contracts/src/agent.ts`, SHA-256 `0950118a66fb9c8bf2e2c1958c1d80c0c97471dfcd749086ba410534b95df25e`
- Nachweis: `packages/core/src/agent.ts`, SHA-256 `85c9ebd8fcfeb93ff0ac70ed4a0fc0ae1983babc54090e12fc140bf85cd44faa`
- Nachweis: `packages/core/src/data.ts`, SHA-256 `783b46c38fc2463f74997d5b4190303c11e0e81c1db6ce52b4378d2158bce662`

### T63-AC04 · partial

Ein berechtigter Request verwendet denselben Core-/Guard-/Interaktionsschutz wie eine Nutzeraktion. Es gibt keinen direkten SDK-Schreibpfad auf Scene oder Fachstore

**Scope:** Revisions-/Policy-/Expiry-/Abort-/Interaktionsprüfungen werden über Await und reentrante Hostcallbacks erneut geprüft. Derselbe Core führt den validierten Commit aus; der bestätigte authorize-Reentry-Fehler ist regressionsgeprüft behoben. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/agent-bridge.test.ts`, SHA-256 `096e558a19ca63942def962973e3c7632b666d738e83f7c958f8e8aba7f5f90c`
- Nachweis: `tests/unit/agent-callback-boundaries.test.ts`, SHA-256 `2d47880137b296b678364794c05e2529685b5595f9240f5884625d735d86c5fe`
- Nachweis: `tests/unit/runtime-transactions.test.ts`, SHA-256 `20dc880e8e18d6a47c2c72fe1f932846cdfdd64dd22c18b73cdca9a5cea064ad`
- Nachweis: `packages/contracts/src/agent.ts`, SHA-256 `0950118a66fb9c8bf2e2c1958c1d80c0c97471dfcd749086ba410534b95df25e`
- Nachweis: `packages/core/src/agent.ts`, SHA-256 `85c9ebd8fcfeb93ff0ac70ed4a0fc0ae1983babc54090e12fc140bf85cd44faa`
- Nachweis: `packages/core/src/data.ts`, SHA-256 `783b46c38fc2463f74997d5b4190303c11e0e81c1db6ce52b4378d2158bce662`

### T63-AC05 · partial

Sequenzen unterscheiden atomare lokale Zustandsänderung und externe Aktionen. Teilfehler werden ausdrücklich berichtet. Bereits ausgeführte Hosttransaktionen werden nicht als automatisch zurückgerollt dargestellt

**Scope:** Atomare lokale Batches, geordnete externe Resultate, ehrliche Teil-/Unbekannt-Ausgänge, Autoritätsmodi, read-only Export und Redaktion sind gezielt qualifiziert. Commit-Receipts bleiben nach Observerfehlern/reentranten Events wahrheitsgetreu. Prozesslokale Idempotenz ist keine dauerhafte Hosttransaktionsgarantie. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/agent-bridge.test.ts`, SHA-256 `096e558a19ca63942def962973e3c7632b666d738e83f7c958f8e8aba7f5f90c`
- Nachweis: `tests/unit/agent-callback-boundaries.test.ts`, SHA-256 `2d47880137b296b678364794c05e2529685b5595f9240f5884625d735d86c5fe`
- Nachweis: `tests/unit/runtime-transactions.test.ts`, SHA-256 `20dc880e8e18d6a47c2c72fe1f932846cdfdd64dd22c18b73cdca9a5cea064ad`
- Nachweis: `packages/contracts/src/agent.ts`, SHA-256 `0950118a66fb9c8bf2e2c1958c1d80c0c97471dfcd749086ba410534b95df25e`
- Nachweis: `packages/core/src/agent.ts`, SHA-256 `85c9ebd8fcfeb93ff0ac70ed4a0fc0ae1983babc54090e12fc140bf85cd44faa`
- Nachweis: `packages/core/src/data.ts`, SHA-256 `783b46c38fc2463f74997d5b4190303c11e0e81c1db6ce52b4378d2158bce662`

### T63-AC06 · partial

Manual, Hybrid und Auto folgen den bestehenden Autoritätsregeln. Käufe, Veröffentlichungen und andere nicht erlaubte Side Effects werden in Auto abgewiesen

**Scope:** Atomare lokale Batches, geordnete externe Resultate, ehrliche Teil-/Unbekannt-Ausgänge, Autoritätsmodi, read-only Export und Redaktion sind gezielt qualifiziert. Commit-Receipts bleiben nach Observerfehlern/reentranten Events wahrheitsgetreu. Prozesslokale Idempotenz ist keine dauerhafte Hosttransaktionsgarantie. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/agent-bridge.test.ts`, SHA-256 `096e558a19ca63942def962973e3c7632b666d738e83f7c958f8e8aba7f5f90c`
- Nachweis: `tests/unit/agent-callback-boundaries.test.ts`, SHA-256 `2d47880137b296b678364794c05e2529685b5595f9240f5884625d735d86c5fe`
- Nachweis: `tests/unit/runtime-transactions.test.ts`, SHA-256 `20dc880e8e18d6a47c2c72fe1f932846cdfdd64dd22c18b73cdca9a5cea064ad`
- Nachweis: `packages/contracts/src/agent.ts`, SHA-256 `0950118a66fb9c8bf2e2c1958c1d80c0c97471dfcd749086ba410534b95df25e`
- Nachweis: `packages/core/src/agent.ts`, SHA-256 `85c9ebd8fcfeb93ff0ac70ed4a0fc0ae1983babc54090e12fc140bf85cd44faa`
- Nachweis: `packages/core/src/data.ts`, SHA-256 `783b46c38fc2463f74997d5b4190303c11e0e81c1db6ce52b4378d2158bce662`

### T63-AC07 · partial

Export/Replay erzeugt keine externe Mutation. Nicht autorisierte Inhalte und sensitive Felder gelangen nicht über die Bridge in Modellkontext oder Diagnose

**Scope:** Atomare lokale Batches, geordnete externe Resultate, ehrliche Teil-/Unbekannt-Ausgänge, Autoritätsmodi, read-only Export und Redaktion sind gezielt qualifiziert. Commit-Receipts bleiben nach Observerfehlern/reentranten Events wahrheitsgetreu. Prozesslokale Idempotenz ist keine dauerhafte Hosttransaktionsgarantie. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/agent-bridge.test.ts`, SHA-256 `096e558a19ca63942def962973e3c7632b666d738e83f7c958f8e8aba7f5f90c`
- Nachweis: `tests/unit/agent-callback-boundaries.test.ts`, SHA-256 `2d47880137b296b678364794c05e2529685b5595f9240f5884625d735d86c5fe`
- Nachweis: `tests/unit/runtime-transactions.test.ts`, SHA-256 `20dc880e8e18d6a47c2c72fe1f932846cdfdd64dd22c18b73cdca9a5cea064ad`
- Nachweis: `packages/contracts/src/agent.ts`, SHA-256 `0950118a66fb9c8bf2e2c1958c1d80c0c97471dfcd749086ba410534b95df25e`
- Nachweis: `packages/core/src/agent.ts`, SHA-256 `85c9ebd8fcfeb93ff0ac70ed4a0fc0ae1983babc54090e12fc140bf85cd44faa`
- Nachweis: `packages/core/src/data.ts`, SHA-256 `783b46c38fc2463f74997d5b4190303c11e0e81c1db6ce52b4378d2158bce662`

## T64: Entwicklungsagent und deklarativer Studioentwurf

### T64-AC01 · partial

Entwicklungsoutput ist ein Diff mit Herkunft und betroffenen Verträgen. Vor Übernahme werden Typecheck, Referenzprüfung und relevante Conformancefälle ausgeführt. Der Agent erhält durch Generierung keine automatischen Deployrechte

**Scope:** Historischer Prüflauf bis 14.11.2026. Deterministischer Diff/Quellhash mit Herkunft, tatsächlicher TypeScript-Compiler, Registry-/Identitätsprüfung und begrenzte Conformance mit realen Workspace-Daten sind geprüft. Ein nativer Diffdownload liegt vor; keine automatische Dateianwendung oder Deployrechte. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/development-proposal.test.ts`, SHA-256 `1740ea824a0090bafcb04f99469b049741c4fa55ae019428495e1d76804312d0`

### T64-AC02 · partial

Laufzeitoutput enthält nur den vereinbarten deklarativen Teilumfang. Freies JavaScript, Shader, Imports, Eventhandlercode und unbekannte URLs werden abgewiesen

**Scope:** Historischer Prüflauf bis 14.11.2026. Der begrenzte deklarative Registry-Vertrag lehnt unbekannte Komponenten, Bindings, Code-/URL-/Handlerfelder und frei erfundene Commands ab. Source-artige Titel bleiben Datenliterale. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/development-proposal.test.ts`, SHA-256 `1740ea824a0090bafcb04f99469b049741c4fa55ae019428495e1d76804312d0`
- Nachweis: `tests/unit/ai-authoring.test.ts`, SHA-256 `aa1243f33713347a12008de02dceaec61de86390ab75e67da1d3aec5286b569c`

### T64-AC03 · partial

Streamingoutput bleibt ein isolierter Entwurf. Erst ein vollständig validierter, berechtigter Vorschlag kann atomar übernommen werden. Veraltete oder abgebrochene Generierung überschreibt keine neuere Nutzereingabe

**Scope:** Historischer Prüflauf bis 14.11.2026. Teilstream und aktiver Zustand sind getrennt; Abbruch, Prompt-/Dokumentänderung und verspätete Complete-/Preflight-Antworten können keinen neueren Zustand übernehmen. Vorschau und Apply wurden zusätzlich live beobachtet. Aktuelle UI-/Route-Hashes werden separat zur historischen Live-Evidenz gebunden. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/ai-authoring.test.ts`, SHA-256 `aa1243f33713347a12008de02dceaec61de86390ab75e67da1d3aec5286b569c`

### T64-AC04 · partial

Studio zeigt Daten-/Providerumfang, Entwurf, Änderungsdiff und Übernehmen/Verwerfen. Fokus und Dirty Fields sind gegen unbeabsichtigten Austausch geschützt

**Scope:** Historischer Prüflauf bis 14.11.2026. Studio zeigt Scope, isolierten Entwurf, Diff, Apply/Discard und GPU-Vorschau. Historischer direkter AI-/GPU-Lauf belegt Auswahl-/Notizerhalt. Aktuelle native 390px-Prüfung zeigt echten Compiler-Preflight, verständliche Ablehnung unbekannter Komponenten sowie erhaltene Dirty-Note/Revision bei Ablehnung. Controller-/UI-Tests sperren Fokus-/Composition-/Stale-Wechsel. Nativer Dirty-Note-Test vor HMR und Fehlerretetst danach bleiben getrennt; keine HMR-Persistenzbehauptung. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T64-AC05 · partial

Modellzugriffe verwenden serverseitiges Vercel AI SDK mit Berechtigung, Budget, Deadline und Abort. Ohne Provider bleiben manuelle Gestaltung und Runtime bedienbar. Die vorhandene AI-Designreview gilt nicht als Nachweis dieses neuen Pfads

**Scope:** Historischer Prüflauf bis 14.11.2026. Eigener serverseitiger Vercel-AI-SDK-/OpenAI-Livepfad mit sichtbarer Usage liegt vor. Separate lokale Autorisierung, Budgetreservierung, Deadline, Abort, Providerfehlerredaktion und manueller Pfad ohne Provider sind regressionsgeprüft. Kein Archiv einer Response-ID; UI-Usage ist keine rohe Providerabrechnung. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/ai-authoring.test.ts`, SHA-256 `aa1243f33713347a12008de02dceaec61de86390ab75e67da1d3aec5286b569c`
- Nachweis: `tests/unit/client-import-boundary.test.ts`, SHA-256 `4827dbba0a9acc9626632803040bffac9e23886b40820615f592ff86ab9c19a4`

### T64-AC06 · partial

Negative Evaluation umfasst unbekannte Komponenten/Aktionen, falsche Referenzen, Prompt Injection, widersprüchliche Bindings, Teilantworten und verspätete Antworten. Ein generierter Erfolgstext gilt nicht als ausgeführte fachliche Aktion

**Scope:** Historischer Prüflauf bis 14.11.2026. Negative Ausgabenprüfung umfasst unbekannte Registry-/Command-/Binding-/Identitätswerte, executable Extra-Felder, source-artige/injizierte Textliterale, Teilstream und verspätete Antworten. Der Testumfang validiert begrenzten untrusted Output; er behauptet keine universelle Prompt-Injection-Resistenz des Modells. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/development-proposal.test.ts`, SHA-256 `1740ea824a0090bafcb04f99469b049741c4fa55ae019428495e1d76804312d0`
- Nachweis: `tests/unit/ai-authoring.test.ts`, SHA-256 `aa1243f33713347a12008de02dceaec61de86390ab75e67da1d3aec5286b569c`

## T65: Conformance, Vergleich und Entscheidung dokumentieren

### T65-AC01 · partial

Der sichtbare Runtime-Proof wird auf den vorhandenen Breiten 320/390/768/1280 px und auf tatsächlichem WebGPU beziehungsweise separat gewähltem WebGL2 geprüft. Browser-/Surfacegröße, Hardware, Build, Daten- und Rezeptstand werden aufgezeichnet

**Scope:** Acht archivierte tatsächliche GPU-Läufe mit Browserbreiten 320/390/768/1280 und jeweils WebGPU/WebGL2: 144 Fälle, 720 Samples. Surfacegrößen, DPR, Browser, Build dfc, Datenquellen/-versionen/Modul-IDs und Rezeptversionen sind enthalten. Das vorhandene lokale Mac17,6/M5-Max/64-GiB/macOS27.2.1-Profil ergänzt die Provenienz; keine neue Hardware-Supportmatrix. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/m8-qualification.test.ts`, SHA-256 `fe1bf4346bd4595740065c76cd982bc43b8dcf692aa72484810e51ca0f7dc46b`

### T65-AC02 · partial

Die endliche Matrix umfasst Tabelle ↔ Karten, Karten ↔ Map und Map ↔ Tabelle, mit denselben drei neuen M7-Effekten: **6 Richtungen × 4 Breiten × 2 Backends × 3 Effekte = 144 Übergangsfälle**. Endpunkte und 25/50/75-Prozent-Kontrollpunkte ergeben **720 Kontrollbilder/-samples**. Sie sind keine vollständige zeitliche Filmabnahme. Die frühe sichtbare Lieferung darf vor Abschluss dieser gesamten Freigabematrix erfolgen und zeigt ihre noch offene Prüfdeckung ausdrücklich an

**Scope:** Die vollständige endliche Matrix umfasst sechs Richtungen × vier Browserbreiten × zwei tatsächliche Backends × drei Rezepte =144 Fälle, jeweils0/25/50/75/100%=720 Kontrollbilder/-samples. Originalarchive, PNG-Hashes, Geometrie und Counts sind geprüft. Sieben Bilder wurden zusätzlich visuell durch einen Agenten gelesen; weder alle Bilder noch jeder Animationsframe sind damit manuell beurteilt. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/m8-qualification.test.ts`, SHA-256 `fe1bf4346bd4595740065c76cd982bc43b8dcf692aa72484810e51ca0f7dc46b`

### T65-AC03 · partial

Eigene Journeys prüfen Mehrfachauswahl, Range-Anker, Keyboard/Typeahead, Sortierung/Filter, Fokusfallback, Unterbrechung, Resize, URL-History und read-only Replay. Ein programmgesteuerter Test wird nicht als native Eingabe ausgegeben

**Scope:** Eigene native Showcase-Journeys prüfen Mehrfach-/Rangeauswahl, Typeahead, numerische Sortierung, Filter, Effektunterbrechung, Rückwärts-Seek, Resize und Browser-History. Echte Core-/DOM-Integration ergänzt Fokusfallback und importiertes read-only Replay. Programmatische Matrix-/Unitereignisse sind ausdrücklich keine native Eingabe; keine allgemeine IME-/AT-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/collection-bridge.test.ts`, SHA-256 `e1d1c34fb214225910e58c345351497e2c0a47d9544c4951743e2b62dc7dfdaf`
- Nachweis: `tests/unit/m8-qualification.test.ts`, SHA-256 `fe1bf4346bd4595740065c76cd982bc43b8dcf692aa72484810e51ca0f7dc46b`

### T65-AC04 · partial

Vergleichskandidaten verwenden identischen Datensatz, Seed, Viewport, Theme und Backend. Kriterien sind Verhalten, Erreichbarkeit, visuelle Kontinuität, benötigter Adapterumfang und nachgewiesene Wartungsrisiken. Es gibt keine unbelegte Performance- oder Qualitätssteigerungsbehauptung

**Scope:** Beide DOM-Adapter teilen denselben lebenden Datensatz/Runtime, konfigurierten Seed42, Viewport1280×900/DPR1, Theme und WebGPU. Native gleiche Bedienfolgen und getrennte Adapter-/Importbefunde bilden die Vergleichsbasis. Eventabhängig aufgelöste Effektseeds wurden nicht als identisch nachgewiesen; kein Pixel- oder Geschwindigkeitsvergleich zwischen Kandidaten wird daraus behauptet. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/behavior-comparison.test.ts`, SHA-256 `5d3de71ec66f638a998a1831eb9880a0c2bbf3cfb31ea115cdcc33efa5809f15`

### T65-AC05 · partial

Ein separater Echtzeitlauf misst auf dem dokumentierten Referenzgerät Frametiming, Ausreißer und das vorab definierte Budget bei identischem Ablauf. Kontrollierte Einzelbildaufnahme gilt nicht als Echtzeitmessung. Das Bundle- Delta wird mit identischer Buildkonfiguration und denselben Einstiegspunkten bestimmt. Ein Surface-Scheduler bleibt der einzige Taktgeber. Im stabilen Leerlauf entstehen keine zusätzlichen Frames. Upstream-Angaben begründen keine eigene Performancegarantie

**Scope:** Abgegrenzter Mess-/Vergleichsauftrag ausgeführt und unabhängig bewertet:18 gepaarte echte Live-Core-Abläufe jeBackend, Warmup, Rohintervalle/Ausreißer, unverändertes Budget, null Idle-Zusatzframes und identische Bundle-Buildkonfiguration; anschließende WebGPU-Nachmessung mit CPU-/GPU-/Collectorlast. Negatives Resultat bleibt P95max17,6ms, RAF-Max66,7ms,5 Intervalle>50ms, Budgetfailed, Lastcontaminated und Performancevaliditätnot-qualified. Abschluss der ehrlichen Messung, ausdrücklich kein positiver T29-Leistungs-/Backend-/Produktionspass. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/m8-timing.test.ts`, SHA-256 `d1c5ed41871931aa20f4e1ba44ae7bdec8c3af98b3465aae12ac3e8711668683`

### T65-AC06 · partial

Neue Quellen und Nachweise werden unter eigener datierter Provenienz archiviert. M7-AC und historische Builds bleiben unverändert. Breite AT-/IME-/Mobile-/Hardware- und Produktionsgates werden weder automatisch geschlossen noch als unendliche Voraussetzung für den begrenzten Vergleich erfunden

**Scope:** Neue M8-Nachweise werden datiert und nach Quelle/Build/Prüfart getrennt gebunden. Diese Ledger-Qualifikation erhält alle435 bisherigen Kriterienobjekte einschließlich Status/Evidenz unverändert und verändert keinen kanonischen AC-Text. Historische M7-/Live-AI-Artefakte behalten ihre Bytes/Provenienz; globale AT-/IME-/Mobile-/Hardware-/Produktionsgates bleiben getrennt offen. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/m8-qualification.test.ts`, SHA-256 `fe1bf4346bd4595740065c76cd982bc43b8dcf692aa72484810e51ca0f7dc46b`
- Nachweis: `tests/unit/m8-timing.test.ts`, SHA-256 `d1c5ed41871931aa20f4e1ba44ae7bdec8c3af98b3465aae12ac3e8711668683`

### T65-AC07 · partial

Entscheidung benennt übernommene, selbst implementierte und abgelehnte Teile. Erst bei Übernahme werden kanonische Tasks/AC, Feature-Matrix und Engineering-OKF konsistent erweitert. Public erklärt ausschließlich tatsächlich bedienbare Funktionen

**Scope:** Per-Baustein-Entscheidung, 65 Tasks/476 Kriterien und beide OKF-v0.2-Handbücher mit bedienbaren M8-Funktionen, nativer Export-/Downloadanleitung und Originalbildern konsistent erzeugt und geprüft. Alle 41 M8-Kriterien sind im jeweiligen lokalen Funktions-/Messscope nachgewiesen. Das negative Leistungsresultat bleibt failed/contaminated/not-qualified; T29 und breite Produktionsgates bleiben offen. Historische Editionen und AC-Texte unverändert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/behavior-comparison.test.ts`, SHA-256 `5d3de71ec66f638a998a1831eb9880a0c2bbf3cfb31ea115cdcc33efa5809f15`

### R4-AC02 · partial

Authoring verwendet den sichtbaren Entwurf. Vorschläge, Preflight und Übernahme bleiben an Dataset und Revision gebunden. Review und Authoring reservieren ihr lokales Budget atomar und dauerhaft.

**Scope:** Lokales Studio. Datasetbindung, sichtbarer Entwurf und explizite Übernahme sowie dauerhafte gemeinsame Budgetreservierung wurden mit kontrolliertem Provider und zwei SQLite-Verbindungen geprüft. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T66: Flow Explorer und lokaler Architektur-Review

### T66-AC01 · partial

Der Flow Explorer verwendet einen validierten Flow für GPU-Graph, erlaubte Aktionen und Mermaid-Export

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T66-AC02 · partial

Der lokale Architektur-Review enthält einen erreichbaren Rückarbeitspfad und zeigt aktive Zustände sowie tatsächlich beobachtete Ereignisse

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T66-AC03 · partial

Modulkontext stammt aus dem Workspace und lokale Ergebnisse behaupten keine externe Prüfung oder Veröffentlichung

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T66-AC04 · partial

Knoten, Aktionen und Details sind mit Pointer und Tastatur bedienbar und passen in Desktop- und schmale Ansichten

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T66-AC05 · partial

Direkteinstieg, ungültige Modulreferenzen, Rückkehr und Runtime-Disposal sind definiert und geprüft

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T67: Vergleichsarbeitsfläche mit realen Moduldaten

### T67-AC01 · partial

Die Vergleichsansicht verwendet zwei bis vier ausdrücklich ausgewählte reale Module und erhält deren stabile Identitäten

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T67-AC02 · partial

Gemeinsame und unterschiedliche Abhängigkeiten sowie Kennzahlen werden aus den Quelldaten korrekt berechnet

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T67-AC03 · partial

Leere, einzelne und übergroße Auswahl sowie gefilterte ausgewählte Elemente werden verständlich behandelt, ohne Auswahlverlust

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T67-AC04 · partial

Desktop und kompakte Darstellung besitzen vollständige lesbare Werte und passende Semantik ohne überlappende Controls

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T67-AC05 · partial

Deep Link, History und Ansichtswechsel erhalten Auswahl und Vergleichseinstellungen und führen keine externe Aktion aus

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T68: Proportionaler Workspace-Atlas

### T68-AC01 · partial

Der Atlas stellt reale Dateien oder Codezeilen proportional dar und benennt Metrik und Einheit ausdrücklich

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T68-AC02 · partial

Gruppeneinstieg und Rückkehr sind deterministisch und erhalten Auswahl und Modulidentität

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T68-AC03 · partial

Kleine Flächen, Nullwerte und leere Filterergebnisse bleiben ohne erfundene Größen oder unbedienbare Trefferflächen zugänglich

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T68-AC04 · partial

Flächen bleiben endlich, innerhalb der verfügbaren Bounds und überschneiden sich nicht

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T68-AC05 · partial

Metrik, Gruppenfokus und gültige URL-Zustände werden bei Reload und History wiederhergestellt

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## T69: Wählbare Farbwelten und M9-Qualifikation

### T69-AC01 · partial

Blau ist Standard und acht benannte Paletten sowie eine validierte eigene Akzentfarbe sind auswählbar

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T69-AC02 · partial

Studio und GPU verwenden gemeinsame abgeleitete Farbrollen mit geprüfter Text- und Fokuslesbarkeit auch für sehr helle und dunkle Eingaben

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T69-AC03 · partial

Farbwechsel verändern weder Fachrevision, Auswahl noch Navigation und werden lokal gespeichert, wobei Speicherfehler sichtbar bleiben

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T69-AC04 · partial

Alle drei neuen Ansichten sind über konkrete Cases erreichbar und mit den bestehenden Effekten sowie Reduced Motion bedienbar

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T69-AC05 · partial

Aktuelle Browserbilder, funktionale Tests, Feature-Matrix, Tasks, Mermaid-Flows und beide OKF-Handbücher werden gemeinsam aktualisiert

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-/Geräteabnahme bleibt separat; endgültige generierte Editionshashes sind im separaten Dokumentationsnachweis gebunden. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### T69-AC06 · partial

Frühere Renderer- und Performance-Nachweise behalten ihre Herkunft und geänderte Quellen werden nicht still als erneut geprüft markiert

**Scope:** Lokaler M9-Proof mit tatsächlichen Workspace-Daten, WebGPU-Browser bei1280/390px und dokumentierten Unit-/Layout-/Policytests. Keine allgemeine Produkt-/Geräte-/Accessibility-/Performancefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Breite Produkt-, AT-/IME-, Mobilgeräte- und lastqualifizierte Performance-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## GLOBAL: GLOBAL

### GLOBAL-TEST-01 · partial

Zustände: Jeder deklarierte Übergang und seine Ablehnung getestet; zufällige Ereignisfolgen verletzen keine Invarianten

**Scope:** Vollständige Test-/Supportmatrix

**Offen:** Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen.

Kein Nachweis im Register.

### GLOBAL-TEST-02 · partial

Konkurrenz: Doppelklick, schnelle Navigation, parallele Requests, verspätete KI und Unmount während Initialisierung

**Scope:** Vollständige Test-/Supportmatrix

**Offen:** Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen.

Kein Nachweis im Register.

### GLOBAL-TEST-03 · partial

Daten: Leere Ergebnisse, beschädigte Antworten, Teilfehler, veraltete Preise/Angebote, Abbruch und Retry

**Scope:** Vollständige Test-/Supportmatrix

**Offen:** Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen.

Kein Nachweis im Register.

### GLOBAL-TEST-04 · partial

Eingabe: Tastatur, Touch, Pointer Capture, IME, RTL, Auswahl, Clipboard und mobile Tastatur

**Scope:** Vollständige Test-/Supportmatrix

**Offen:** Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen.

Kein Nachweis im Register.

### GLOBAL-TEST-05 · partial

Accessibility: Automatisierte Semantikprüfung plus manuelle Screenreader-Journeys; GPU-Kontrast, Fokus und Zoom separat prüfen

**Scope:** Vollständige Test-/Supportmatrix

**Offen:** Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen.

Kein Nachweis im Register.

### GLOBAL-TEST-06 · partial

URLs: Direkteinstieg, Reload, Back/Forward, ungültige Parameter und nicht mehr vorhandene Ressourcen

**Scope:** Vollständige Test-/Supportmatrix

**Offen:** Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen.

Kein Nachweis im Register.

### GLOBAL-TEST-07 · partial

GPU: Adapter fehlt, Limits fehlen, Geräteverlust, Resize/DPR-Wechsel, lange Sitzung und Ressourcenfreigabe

**Scope:** Vollständige Test-/Supportmatrix

**Offen:** Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen.

Kein Nachweis im Register.

### GLOBAL-TEST-08 · partial

KI: Schemafehler, Prompt Injection, falsche Component-ID, veraltete Revision, Budgetüberschreitung und Anbieterfehler

**Scope:** Vollständige Test-/Supportmatrix

**Offen:** Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen.

Kein Nachweis im Register.

### GLOBAL-TEST-09 · partial

Simulation: Kein produktiver Schreibzugriff; reproduzierbare logische Ergebnisse; kontrollierte visuelle Toleranzen

**Scope:** Vollständige Test-/Supportmatrix

**Offen:** Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen.

Kein Nachweis im Register.

### GLOBAL-TEST-10 · open

Collaboration: Konkurrenz, Verbindungsabbruch, Wiederverbindung, Rechteentzug und ungültige Entwürfe

**Scope:** Collaboration-Paket nicht implementiert.

**Offen:** Dokumente, Presence und serverautorisierte Aktionen implementieren; Konkurrenz, Reconnect und Rechteentzug prüfen.

Kein Nachweis im Register.

### GLOBAL-TEST-11 · partial

Packaging: Clean Install, Tree-Shaking, Serverimport ohne Browserglobals und Integration in ein frisches Hostprojekt

**Scope:** Vollständige Test-/Supportmatrix

**Offen:** Alle Teilfälle und Zielprofile mit realen Nachweisen abnehmen.

Kein Nachweis im Register.

### GLOBAL-COVERAGE-01 · partial

Coverage dient als zusätzlicher Indikator: mindestens 85 % Branch Coverage für Core, Policy, Routing und Budgetlogik; alle sicherheits- und datenrelevanten Invarianten müssen unabhängig davon explizit getestet sein.

**Scope:** V8: Core-Paket 85,75 Prozent Branch; gesamter gemessener Scope 77,93 Prozent. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Routing-, Policy- und Budgetabnahme getrennt belegen; fehlende Produktionslogik implementieren. Leere Module mit 100 Prozent sind kein Funktionsnachweis. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### GLOBAL-BUDGET-01 · open

Lokaler Event→Snapshot-Pfad: P95 ≤10 ms im Referenzszenario.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-BUDGET-02 · open

Wahrnehmbare lokale Aktionsrückmeldung: P95 ≤100 ms.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-BUDGET-03 · open

Desktop-Referenz: P95 Framezeit ≤16,7 ms bei 1080p, 200 sichtbaren Elementen und 20 parallelen Morphs.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-BUDGET-04 · open

Mobile Referenz: dieselben funktionalen Szenarien; Framebudget und maximaler Szenenumfang werden getrennt veröffentlicht.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-BUDGET-05 · partial

Leckprüfung: nach Aufwärmen und 100 Wiederholungen kein dauerhaft wachsender Ressourcenbestand; maximal 5 % Abweichung vom stabilen Plateau.

**Scope:** 100 aktuelle Chromium-Zyklen; null verbleibende eigene Ressourcen und konstante Glyph-Puffer. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Langzeit-/Warmup-/weitere Gerätematrix; Treiber- und Prozessspeicher werden nicht durch eigene Tokens gemessen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### GLOBAL-BUDGET-06 · partial

GPU-Speicherangaben beziehen sich auf selbst verwaltete Allokationen und werden als solche bezeichnet.

**Scope:** Angegeben sind ausdrücklich Glyph-Puffer und selbst verwaltete Allokationen; keine GPU-Gesamtspeicherbehauptung. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Benchmarks benötigen dieselbe klare Messgrenze. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### GLOBAL-BUDGET-07 · open

KI: eine laufende Entscheidung pro Session; überholte Requests abbrechen; standardmäßig 3 s Soft- und 6 s Hard-Deadline.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-BUDGET-08 · open

Initiales Cloud-Kostenlimit: maximal 0,35 USD pro aktiver Session, serverseitig konfigurierbar und durch Reservierung abgesichert.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-BUDGET-09 · open

Prefetch: maximal drei eigene parallele Jobs; Bytebudgets nur dort hart versprechen, wo Größe und Abbruch tatsächlich kontrollierbar sind.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-BUDGET-10 · open

Keine garantierte Conversion-Steigerung. Wirkung wird gegenüber dem statischen beziehungsweise manuellen Kontrollpfad gemessen.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-DOD-01 · open

Jede Vision ist implementiert, ausdrücklich begrenzt oder durch ein dokumentiertes Forschungsergebnis entschieden.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-DOD-02 · open

Jede produktive Komponente besitzt Anatomy-, Behavior-, Daten-, State-, Eingabe-, Semantik- und Renderingvertrag mit unabhängigen Zustandsbesitzern.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-DOD-03 · open

User-, Daten-, State- und URL-Flows sind durchgängig verbunden und als Mermaid nachvollziehbar.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-DOD-04 · open

Studio und Produktionsintegration verwenden denselben Runtime-Kern.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-DOD-05 · open

Praxisfälle funktionieren mit realen Daten; Simulation ist jederzeit erkennbar.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-DOD-06 · open

Architekturentscheidungen, Tests und tatsächliche Messergebnisse sind miteinander verknüpft.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-DOD-07 · open

Kein Release hängt von den bestehenden Prototyp-APIs oder unbelegten Leistungsversprechen ab.

**Scope:** Produkt-/Releasegate

**Offen:** Messung beziehungsweise vollständige Produktabnahme erforderlich.

Kein Nachweis im Register.

### GLOBAL-RELEASE-01 · open

**Contract Preview:** Schemas und APIs, noch keine Produktionszusage.

**Scope:** Gesamtprodukt; noch kein vollständiger Nachweis für dieses Kriterium.

**Offen:** Implementierung und Abnahme gemäß kanonischem Kriterium ausführen; spätere Wave bleibt abhängig von den vorgelagerten Gates.

Kein Nachweis im Register.

### GLOBAL-RELEASE-02 · open

**GPU Alpha:** qualifizierter Rendering-/Eingabekern.

**Scope:** Gesamtprodukt; noch kein vollständiger Nachweis für dieses Kriterium.

**Offen:** Implementierung und Abnahme gemäß kanonischem Kriterium ausführen; spätere Wave bleibt abhängig von den vorgelagerten Gates.

Kein Nachweis im Register.

### GLOBAL-RELEASE-03 · open

**Studio Beta:** vollständige Szenarien und reproduzierbare Tests.

**Scope:** Gesamtprodukt; noch kein vollständiger Nachweis für dieses Kriterium.

**Offen:** Implementierung und Abnahme gemäß kanonischem Kriterium ausführen; spätere Wave bleibt abhängig von den vorgelagerten Gates.

Kein Nachweis im Register.

### GLOBAL-RELEASE-04 · open

**Integration Beta:** reale Case-Adapter und Hostintegration.

**Scope:** Gesamtprodukt; noch kein vollständiger Nachweis für dieses Kriterium.

**Offen:** Implementierung und Abnahme gemäß kanonischem Kriterium ausführen; spätere Wave bleibt abhängig von den vorgelagerten Gates.

Kein Nachweis im Register.

### GLOBAL-RELEASE-05 · open

**Core 1.0:** alle RP5-Gates bestanden.

**Scope:** Gesamtprodukt; noch kein vollständiger Nachweis für dieses Kriterium.

**Offen:** Implementierung und Abnahme gemäß kanonischem Kriterium ausführen; spätere Wave bleibt abhängig von den vorgelagerten Gates.

Kein Nachweis im Register.

### GLOBAL-RELEASE-06 · open

**Optionale Erweiterungen:** jeweils eigene Supportmatrix und Versionsfreigabe.

**Scope:** Gesamtprodukt; noch kein vollständiger Nachweis für dieses Kriterium.

**Offen:** Implementierung und Abnahme gemäß kanonischem Kriterium ausführen; spätere Wave bleibt abhängig von den vorgelagerten Gates.

Kein Nachweis im Register.

### GLOBAL-ROLLOUT-01 · open

KI-Policies werden getrennt von Bibliotheksversionen ausgerollt: Shadow Mode → begrenzter Canary → größere Kohorte. Jede Stufe benötigt bestandene Qualitäts-, Kosten- und UX-Gates. Bei Fehlern wird eine bekannte Policy-Version wieder aktiviert; die Rendering-Policy bleibt WebGPU-first mit sichtbarem Backend.

**Scope:** Noch keine produktive KI-Policy-/Kohortenpipeline.

**Offen:** Shadow-/Canary-/Holdout-, Kosten-/UX-Gates und exaktes Policy-Rollback implementieren und prüfen.

Kein Nachweis im Register.

## ARCH: ARCH

### ARCH-AUTH-01 · partial

**Eine Autorität pro Zustandsbereich:** Core/Host besitzen Fachzustand und kontrollierte Werte; der Interaktionsstore besitzt Fokus/Hover/Pressed/Composition; die Surface besitzt Animation und Ressourcen. React und Semantik lesen diese Stores, ohne Werte zu duplizieren.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-AUTH-02 · partial

**Autorität:** Invarianten und Berechtigungen → ausdrückliche Nutzeraktion → deklarierter Host-Workflow → KI-Vorschlag.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-AUTH-03 · partial

**Manual (Anwendungsruntime):** Keine Modellaufrufe aus der Anwendungssteuerung; der Host steuert gültige Events. Eine bewusst angeforderte Studio-AI-Review ist eine getrennt berechtigte Toolaktion ohne Autorität über diese Runtime.

**Scope:** Bestehende Manual-Runtime und geplante getrennte Studio-AI-Review.

**Offen:** T58 als separate berechtigte und budgetierte Toolaktion implementieren und die Trennung durch Integrationsfälle nachweisen.

Kein Nachweis im Register.

### ARCH-AUTH-04 · partial

**Hybrid:** KI erstellt Vorschläge; Freigabe erfolgt durch Nutzer oder ausdrücklich konfigurierte Host-Policy.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-AUTH-05 · partial

**Auto:** Nur freigegebene, reversible Anpassungen; keine Käufe, Buchungen, Veröffentlichungen oder Rechteänderungen.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-AUTH-06 · partial

**Standard:** Runtime startet in Manual. KI-Modi werden bewusst konfiguriert.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-AUTH-07 · partial

**Kein State-Sprung durch Animation:** Logische Änderungen werden atomar committed; Animationen visualisieren den Übergang. Quelle → Zusatzeffekt → Ziel sind visuelle Phasen, keine zusätzlichen Fachzustände.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-AUTH-08 · partial

**Überholte Antworten:** Alte Request-/Snapshot-Versionen dürfen den aktuellen Zustand nicht überschreiben.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-AUTH-09 · partial

**Unterbrechung:** Neue berechtigte Aktionen dürfen eine visuelle Animation ersetzen. Externe Transaktionen werden dadurch nicht rückgängig gemacht.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-AUTH-10 · partial

**Stabile Eingabe:** Fokus, Auswahl und bearbeitete Felder dürfen nicht durch spontane KI-Anpassungen verloren gehen.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-RENDER-01 · open

Ein Renderer und ein zentraler Frame-Scheduler pro Surface.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-RENDER-02 · open

WebGPU zuerst prüfen; WebGL2-Fallback ist erlaubt. Nur öffentliche Three.js-APIs verwenden. Backend, Grund und Diagnosemodus sind beobachtbar.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-RENDER-03 · open

Orthografisches UI-Koordinatensystem mit Containergröße statt globaler Fensterannahmen.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-RENDER-04 · open

Yoga-Boxlayout; Grid, Scrollbereiche und Virtualisierung als definierte Fluid-Abstraktionen.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-RENDER-05 · open

GPU-Text über einen Textadapter; Schriftdateien und Glyphenressourcen werden kontrolliert geladen.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-RENDER-06 · open

Morphing kombiniert parametrische Flächen/SDFs, Layoutinterpolation und GPU-gezeichnete Content-Übergänge.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-RENDER-07 · open

Beliebige Mesh-Topologien benötigen registrierte Morph-Adapter.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-RENDER-08 · open

Jeder interaktive Part besitzt einen expliziten Behavior-Vertrag; ein Renderrezept legt keine Rolle fest. Die Semantikbrücke verwendet echte zugängliche Elemente; sie wird nicht mit `display:none` oder `aria-hidden` unbrauchbar gemacht.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-RENDER-09 · open

Native Texteingabe wird mit GPU-Text, Caret und Auswahl synchronisiert.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-RENDER-10 · open

Reduced Motion verändert die Animation, nicht die Funktion.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-RENDER-11 · open

Ressourcen besitzen eindeutige Eigentümer und ein überprüfbares Lebensende.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-RENDER-12 · open

Geräteverlust pausiert Rendering, erhält den fachlichen Snapshot und versucht begrenzte WebGPU-Wiederherstellung.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-RENDER-13 · open

Ohne nutzbares WebGPU wird das freigegebene WebGL2-Backend versucht. Wenn auch dieses nicht verfügbar oder nicht für die verwendeten Primitives qualifiziert ist, folgt ein nachvollziehbarer Startfehler. Es gibt keinen stillen HTML-Ersatz.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-STORAGE-01 · open

API-Keys ausschließlich serverseitig; Projektdateien enthalten nur Secret-Referenzen.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-STORAGE-02 · open

Lokales Studio bindet standardmäßig an Loopback und schützt Schreiboperationen durch Origin-/Sessionprüfung.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-STORAGE-03 · open

Importpfade dürfen das freigegebene Projektverzeichnis nicht verlassen.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-STORAGE-04 · open

Server-Proxy-Ziele werden konfiguriert; kein frei nutzbarer URL-Proxy.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-STORAGE-05 · open

Modellantworten werden auf Schema, Rechte, Zustand, erlaubte Aktionen und Ablaufzeit geprüft.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-STORAGE-06 · open

Persönliche Eingaben und Rohprompts werden standardmäßig nicht in Telemetrie übernommen.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-STORAGE-07 · open

Replay darf keine produktiven Seiteneffekte ausführen.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-STORAGE-08 · open

Community-Templates sind zunächst deklarativ. Ausführbare Plugins werden bewusst als vertrauenswürdige Build-Abhängigkeiten eingebunden.

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-URL-01 · partial

Explizite Navigation erzeugt History-Einträge.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-URL-02 · partial

Reine Editoransichtsänderungen verwenden `replace`.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-URL-03 · partial

Suchfilter werden erst bei bestätigter Suche kanonisch übernommen.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-URL-04 · partial

Formulardaten, Secrets, Prompts, Hoverzustände und Animationsfortschritt gehören nicht in URLs.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-URL-05 · partial

Zurück/Vorwärts stellt den referenzierten fachlichen Zustand wieder her und bricht überholte Ladevorgänge ab.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-URL-06 · partial

Nicht mehr vorhandene IDs erzeugen einen definierten Not-found-Zustand.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-URL-07 · partial

KI darf aus freigegebenen Navigationszielen wählen, aber keine freien URLs erfinden.

**Scope:** Core-/Workspace-/Case-Proofs vorhanden; vollständiger Architekturvertrag noch nicht produktiv qualifiziert.

**Offen:** Konkreten Scope mit den unabhängigen Invarianten und vollständigen Integrations-/Supporttests schließen.

Kein Nachweis im Register.

### ARCH-API-01 · open

`ComponentDefinition`: Stabile Komponenten-ID, benannte Parts, kontrollierte Werte, Behavior-/Semantik-Verträge, erlaubte Events und getrennte Renderrezepte

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-02 · open

`FlowDefinition`: Zustandsgraph, Guards, referenzierte Aktionen, URL-Projektion und Invarianten

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-03 · open

`defineComponent` / `defineFlow`: Typisierte Definition und Validierung dieser Verträge

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-04 · open

`createFluidRuntime`: Erzeugt eine isolierte Runtime; nimmt Renderer-, Daten-, Router-, Clock-, Policy- und Trace-Adapter entgegen

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-05 · open

`FluidProvider` / `useFluid`: React-Integration ohne parallelen fachlichen State

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-06 · open

`RuntimeSnapshot`: Fachzustand, Datenreferenzen, Entwürfe, fachliche Auswahl, Modus und Domain-Revision; keine GPU-Objekte und keine Hover-/Fokus-Kopie

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-07 · open

`InteractionSnapshot`: Transienter Fokus, Hover, Pressed und IME-Composition; eigene Benachrichtigung ohne Änderung der Domain-Revision

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-08 · open

`PartDefinition`: Component-ID, Partname, Behavior, zugänglicher Name/Beziehungen und Renderrezept; Rollen werden nicht aus der Form geraten

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-09 · open

`ChangeDetails`: Serialisierbare Quelle/Reason plus synchrone Cancel-Möglichkeit für den Host; kein DOM-Event im Core

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-10 · open

`PresentationState`: Vorherige/aktuelle visuelle Projektion, Übergangsphase, Dauer und Fortschritt; keine fachliche Wahrheit

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-11 · open

`RuntimeEvent`: Event-ID, Quelle, Typ, Zeit, Payload und Bezug auf die erwartete Revision

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-12 · open

`DecisionPlan`: Vorschlags-ID, Snapshot-/Policy-Version, Ablaufzeit, erlaubte Zielaktionen und kurze Erklärung

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-13 · partial

`DataAdapter`: Validierte lesende Abfragen, AbortSignal, Quellenmetadaten, Version und Aktualität

**Scope:** Neue öffentliche Adapterfabriken mit Zod-Verträgen und geprüften Ausführungsgrenzen. Am 13.11.2026 Source-Delta für abbrechbare asynchrone Autorisierung geprüft; aktuelle Data-/Agent-/Core-Regressionssuite bestanden. Keine Erweiterung auf verteilte Persistenz oder produktive Hostfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Runtime-/Hostintegration, Providertransport und dauerhafte Idempotenz ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `packages/core/src/data.ts`, SHA-256 `783b46c38fc2463f74997d5b4190303c11e0e81c1db6ce52b4378d2158bce662`
- Nachweis: `packages/contracts/src/data.ts`, SHA-256 `f9582829ef9102b36bf0d2ce0ac3be550c2e5e1f7484f585d654e6540b9f6532`

### ARCH-API-14 · partial

`ActionAdapter`: Explizite fachliche Aktionen mit Berechtigung, Idempotenz und überprüfbarem Ergebnis

**Scope:** Neue öffentliche Adapterfabriken mit Zod-Verträgen und geprüften Ausführungsgrenzen. Am 13.11.2026 Source-Delta für abbrechbare asynchrone Autorisierung geprüft; aktuelle Data-/Agent-/Core-Regressionssuite bestanden. Keine Erweiterung auf verteilte Persistenz oder produktive Hostfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Runtime-/Hostintegration, Providertransport und dauerhafte Idempotenz ergänzen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `packages/core/src/data.ts`, SHA-256 `783b46c38fc2463f74997d5b4190303c11e0e81c1db6ce52b4378d2158bce662`
- Nachweis: `packages/contracts/src/data.ts`, SHA-256 `f9582829ef9102b36bf0d2ce0ac3be550c2e5e1f7484f585d654e6540b9f6532`

### ARCH-API-15 · open

`RouterAdapter`: Parse, Serialize, Navigate, Prefetch und History-Abonnement

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-16 · open

`ScenarioDefinition`: Ausgangszustand, Datenreferenzen, Ereignisse, Fehlereinspielungen und erwartete Invarianten

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-17 · open

`CaseManifest`: Daten-/Action-Schemas, Flows, Komponenten, Szenarien und unterstützte Betriebsarten

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-18 · open

`VisualTransitionDefinition`: Quelle/Ziel-Projektion, Basismotion, optionale Effekt-Policy, Timing und Interruption-Regel; keine fachlichen Zwischenzustände

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-19 · open

`EffectDefinition`: Versioniertes Rezept, Parameter-Schema, kompatible Inhalte/Parts, Backend-/Feature-Anforderungen, Budget und Reduced-Motion-/Fallback-Rezept

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-20 · open

`EffectPolicy`: Aus, fest, seeded-random oder Case-Mapping; explizite Projekt-/Case-/Transition-Priorität

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-21 · open

`ResolvedEffectPlan`: Aufgelöste Rezept-ID/Version, Seed, Parameter, Quellen-/Zielrevision, Policy-Version und tatsächliche Capability-Entscheidung

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-22 · open

`TraceSink`: Versionierte Events mit Korrelation; Datenredaktion erfolgt vor Export und Persistenz

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### ARCH-API-23 · partial

`StoryDefinition`: Versionierter Design-Brief, Medium/Modus, Daten-/Flow-/Szenarioreferenzen, Beats und erwartete Ergebnisse ohne parallelen Fachstate

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### ARCH-API-24 · partial

`ThemeDefinition`: Kanonische versionierte Gestaltungsrollen, abgeleitete CSS-/GPU-Werte und ausdrücklich unterstützte Importtypen

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### ARCH-API-25 · open

`PresentationProjection`: Gemeinsame dargestellte Layout-/Clip-/Kameratransformation und inverse Zuordnung für Eingabe, Ziele und Semantik

**Scope:** Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme.

**Offen:** Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test.

Kein Nachweis im Register.

### ARCH-API-26 · partial

`FrameCaptureManifest`: Framefolge mit Versions-/Zeit-/Backend-/DPR-/Event-/Scene-/Rezeptbezug, tatsächlicher Aufnahmeabdeckung und Artefaktreferenzen

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### ARCH-API-27 · open

`RehearsalReport`: Getrennte geometrische, visuelle, semantische und zeitliche Ergebnisse plus Review als versionierter Companion des bestehenden QualityReport

**Scope:** Geplante Design-/Studio-/Rehearsal-/AI-Erweiterung ab 2026-11-02; keine Implementierungs- oder visuelle Abnahme.

**Offen:** Vertrag, Implementierung und Einzelabnahme gemäß Plan v2.3 und M6 durchführen; Forschung und Plan sind kein bestandener Runtime- oder AI-Test.

Kein Nachweis im Register.

### ARCH-API-28 · partial

`AIReviewBundle`: Freigegebene ausgewählte pixelredigierte Bilder, Brief, begrenzte Metadaten und nachvollziehbarer Provider-/Budget-/Abdeckungsbezug

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### ARCH-API-29 · partial

`AIReviewFinding`: Validierter Frame-/Part- oder Bildregionbezug, Kategorie, Begründung, Unsicherheit, Empfehlung und Herkunft ohne eigene Ausführungsrechte

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## CASES: CASES

### CASE-01 · open

**Studio-Projektworkflow** / Tatsächliche Projektdateien, Szenarien und Runs / Öffnen → bearbeiten → validieren → ausführen → vergleichen → exportieren / Lokale Projektänderungen mit Revisionsprüfung

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### CASE-02 · open

**Immobilien** / Importierter realer Bestand oder Host-API / Suchen → filtern → vergleichen → Detail → Anfrage vorbereiten / Anfrage über Hostadapter; kein erfundener Versandstatus

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### CASE-03 · open

**E-Commerce** / Reeller Katalog mit Varianten, Preisen und Bestand / Suchen → Detail → Variante → Warenkorb → Checkout-Übergabe / Preis/Bestand erneut prüfen; Checkout im Testsystem oder Host

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### CASE-04 · open

**Reisebuchung** / Reale Angebote beziehungsweise gekennzeichnete Provideraufzeichnungen / Ziel/Datum → Angebote → Vergleich → Reisende → Quote → Buchungsübergabe / Ablaufende Angebote erneut validieren; keine behauptete Buchung ohne Anbieterbestätigung

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### CASE-05 · open

**SaaS-Dashboard** / Echte Run-/Produktmetriken / Übersicht → Drilldown → Widget anpassen → speichern → zurücknehmen / Nur freigegebene Layoutänderungen

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### CASE-06 · open

**Content/CMS und Landingpage** / Importierte Inhalte und reale Ressourcen / Lesen → Varianten vergleichen → Vorschlag prüfen → Vorschau → Hostübergabe / Original erhalten; keine automatische Veröffentlichung

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

### CASE-07 · open

**Analyse-/Designworkflow** / Reale importierte Datensätze und Projektszenen / Import → validieren → analysieren/layouten → Ergebnis → exportieren / Typisierte Handler; kein universeller Grafikeditor als versteckte Zusatzanforderung

**Scope:** Vollständiger Planumfang

**Offen:** Implementierung und vollständiger Nachweis fehlen.

Kein Nachweis im Register.

## M2: M2

### M2-AC01 · partial

Nur Paketmanifeste und TypeScript-Quellen des aktuellen Workspace lesen; Herkunft und Zeitpunkt anzeigen; keine erfundenen Leistungszahlen

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M2-AC02 · partial

Name, Quelldateien und Dependencies auf-/absteigend; stabile IDs und deterministischer Tie-Break; aria-sort nur auf aktiver Spalte

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M2-AC03 · partial

Kontrollierter Suchwert; leere Ergebnisse mit Reset; Filter-/Sortierzustand bleibt beim Viewwechsel erhalten

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M2-AC04 · partial

Dieselben Module bewegen sich zwischen Tabelle, Karten und Dependency-Map; ausgewähltes Modul entfaltet sich zum Detail; Unterbrechung vom aktuellen Bild

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M2-AC05 · partial

Table → Row → Header/Cell als echte unsichtbare Semantik; Header-Buttons per Tastatur; keine implizite Rolle aus Renderform

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M2-AC06 · partial

Deklarative Feldzuweisungen gemeinsam mit Transition committen; Projektionen validieren Events, Bindings, IDs und Semantikreferenzen

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M2-AC07 · partial

View, Sortierung und Modul-ID validiert; Reload/Back/Forward; Suchtext bleibt lokal; keine Action beim Restore

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M2-AC08 · partial

Responsive Scene- und Brücken-Bounds; deterministische Interpolation; getrennte Presence; WebGPU-Retry aus erhaltenem Domain-Snapshot

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M2-AC09 · partial

Typecheck/Lint/Unit-/Property-Tests/Build; Browserprüfung von Sortierung, Suche, drei Views, Detail und History; Screenshots nach Verbesserung

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

## M3: M3

### M3-AC01 · partial

Keine Peer-Overrides, keine TypeScript-Operator-Erweiterung, reproduzierbarer Build.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M3-AC02 · partial

Reale Shape-Referenzwerte und GPU-/CPU-Vergleich mit dokumentierter f32-Toleranz.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M3-AC03 · partial

Fixed/Random/Case/Off, Priorität, Seed-Variation, Inkompatibilität und Version geprüft.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M3-AC04 · partial

Ein aufgezeichneter Run verwendet dieselbe Rezeptauswahl bei Replay.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M3-AC05 · partial

Domainzustand, Daten und Fokus werden nicht zu Effektphasen umdefiniert.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M3-AC06 · partial

Tatsächliches Backend und aktiver Shaderpfad sind im Studio sichtbar.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M3-AC07 · partial

Showcase und Studio bleiben bei Rezept, Modus und Seed synchron; die GPU-Leiste funktioniert mit Pointer und Tastatur auch bei 320 px Surface-Breite.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M3-AC08 · partial

Resource- und Device-Lifecycle bleiben beim Surface-Owner.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M3-AC09 · partial

Keine pauschale Behauptung von Performance-, Accessibility- oder Produktionsreife.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

## M4: M4

### M4-AC01 · partial

**T43 – statische Integration:** 0.9.0 exakt als Dev-Abhängigkeit, geprüfte Integrität im Lockfile; deutsches/Headless-Profil mit begründeten Grenzen. `check:design` erzeugt einen schema-validierten Bericht ohne Count-Baseline. Qualifizierte Fehler blockieren, ungeprüfte Designkonventionen bleiben Hinweise. Kontrollfälle decken neue Fehler, deutsche Labels und zulässiges Styling ab.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M4-AC02 · partial

**T19 – gemeinsamer Vertrag:** Zod definiert QualityReport und Teilprüfungen. Statische Regeln, DOM, GPU, Semantik und Screenshot haben eigene Abdeckung und Befunde. Nicht geprüft/unsupported ist nie bestanden. Quelle, Build, Backend, Breite, Phase sowie Node-/Dateibezug bleiben exportierbar.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M4-AC03 · partial

**T19/T43 – Studio:** „UI-Qualität“ führt die Laufzeitprüfungen aus und zeigt statische Ergebnisse desselben Builds getrennt. Kein Node-Prüfer im Client, kein initiales Client-Fetching. Fehler/fehlende Artefakte werden sichtbar.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M4-AC04 · partial

**T42 – anschließende Planfortsetzung:** native Studio-Controls gezielt konsolidieren und Frequenz localegerecht formatieren; technische View-IDs erhalten eigene lokalisierte Labels. Verhalten, Keyboard und URLs bleiben erhalten.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M4-AC05 · partial

**T05/T06/T07 – belastbare Grenzen:** Laufzeitbefunde zu Textlesbarkeit, DOM-Überbreite/Clipping und Namen/Zuständen der Semantik ergänzen. Bei nicht belegbarem Kontrast, IME, Screenreader oder Motion wird das offen ausgewiesen. Proportional verkleinertes Replay erhält einen Lesbarkeitshinweis statt eines uneingeschränkten grünen Ergebnisses.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

### M4-AC06 · partial

**Abnahme:** unabhängige Negativ-/Regressionstests, strict Check, Build, Plan-/Mermaidprüfung; echter Browserlauf in schmaler/breiter Ansicht und beiden Backends. Neue Screenshots öffnen, Export prüfen, Browser offen lassen.

**Scope:** Milestone-Vertrag

**Offen:** Nachweise dieses Milestones mit jedem Teilkriterium abgleichen.

Kein Nachweis im Register.

## M1: M1

### M1-AC01 · partial

Echte WebGPU-Surface mit Text, kontrollierter Eingabe und Morphing.

**Scope:** Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/milestones/m1.md`, SHA-256 `810844fb5126b7b3da5ecf3b73ee02484cf56c88e08df34c48358532a7a579e5`
- Nachweis: `docs/milestones/m1-base-ui.jpg`, SHA-256 `851f985a0208da1e3c85da3696bda269d400c1f871cdf4467bdd97128f1765da`

### M1-AC02 · partial

Reale Projektidentität aus dem Workspace-Manifest; echte Flow-Schemavalidierung.

**Scope:** Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/milestones/m1.md`, SHA-256 `810844fb5126b7b3da5ecf3b73ee02484cf56c88e08df34c48358532a7a579e5`
- Nachweis: `docs/milestones/m1-base-ui.jpg`, SHA-256 `851f985a0208da1e3c85da3696bda269d400c1f871cdf4467bdd97128f1765da`

### M1-AC03 · partial

Abspielen, Pause, Schritt, Reset, Ergebnis und Detailansicht.

**Scope:** Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/milestones/m1.md`, SHA-256 `810844fb5126b7b3da5ecf3b73ee02484cf56c88e08df34c48358532a7a579e5`
- Nachweis: `docs/milestones/m1-base-ui.jpg`, SHA-256 `851f985a0208da1e3c85da3696bda269d400c1f871cdf4467bdd97128f1765da`

### M1-AC04 · partial

Explizite Component-/Part-/Behavior-Verträge im Anatomy-Inspector.

**Scope:** Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/milestones/m1.md`, SHA-256 `810844fb5126b7b3da5ecf3b73ee02484cf56c88e08df34c48358532a7a579e5`
- Nachweis: `docs/milestones/m1-base-ui.jpg`, SHA-256 `851f985a0208da1e3c85da3696bda269d400c1f871cdf4467bdd97128f1765da`

### M1-AC05 · partial

Fachwerte im Core, Fokus/Hover/Pressed/IME in einem separaten Interaktionsstore, Präsentationsphase und Transition-Dauer im Renderer.

**Scope:** Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/milestones/m1.md`, SHA-256 `810844fb5126b7b3da5ecf3b73ee02484cf56c88e08df34c48358532a7a579e5`
- Nachweis: `docs/milestones/m1-base-ui.jpg`, SHA-256 `851f985a0208da1e3c85da3696bda269d400c1f871cdf4467bdd97128f1765da`

### M1-AC06 · partial

Base UI 1.9.0 für Studio-Buttons, Tabs und Info-Dialog. Keine Base-UI-Abhängigkeit in Contracts, Core oder WebGPU.

**Scope:** Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/milestones/m1.md`, SHA-256 `810844fb5126b7b3da5ecf3b73ee02484cf56c88e08df34c48358532a7a579e5`
- Nachweis: `docs/milestones/m1-base-ui.jpg`, SHA-256 `851f985a0208da1e3c85da3696bda269d400c1f871cdf4467bdd97128f1765da`

### M1-AC07 · partial

Synchron abbrechbare Change Requests; Reason im Trace; Guards bleiben vorrangig.

**Scope:** Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/milestones/m1.md`, SHA-256 `810844fb5126b7b3da5ecf3b73ee02484cf56c88e08df34c48358532a7a579e5`
- Nachweis: `docs/milestones/m1-base-ui.jpg`, SHA-256 `851f985a0208da1e3c85da3696bda269d400c1f871cdf4467bdd97128f1765da`

### M1-AC08 · partial

Logisches Replay und CLI-Vertragsprüfung als erste Testbausteine.

**Scope:** Historischer, vom Nutzer visuell bestätigter M1-Proof; keine Produktions- oder allgemeine AT-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Spätere Komponenten-/Supportmatrix bleibt offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/milestones/m1.md`, SHA-256 `810844fb5126b7b3da5ecf3b73ee02484cf56c88e08df34c48358532a7a579e5`
- Nachweis: `docs/milestones/m1-base-ui.jpg`, SHA-256 `851f985a0208da1e3c85da3696bda269d400c1f871cdf4467bdd97128f1765da`

## M5: M5

### M5-AC01 · partial

Alle T01–T49, zusätzliche Milestone-Verträge und übergreifende Releasegates erhalten stabile AC-IDs, unveränderten Quelltext, Status, Scope und Nachweis.

**Scope:** Historischer Prüflauf bis 14.11.2026. Am 13.11.2026 auf 476 kanonische Kriterien geprüft. Matrixheader/-links auf M1–M8 aktualisiert; Parser-/Registertests prüfen fehlende/duplizierte AC, veränderten Normtext, fehlende/beeinträchtigte Evidenz. Reine Register-/Quellenqualifikation, keine neue Produktabnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Offene Produktkriterien werden dadurch nicht automatisch abgenommen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/acceptance.test.ts`, SHA-256 `a6316d8e204d88723f0fa1e742424f11cb622ae63c250fc8ea4ac5bce72a4e5f`
- Nachweis: `scripts/acceptance-validation.ts`, SHA-256 `daa323ad7ebe91325e00b820567c90675952a0060e44994b87da597e840950c7`

### M5-AC02 · partial

Status: verifiziert, implementiert/unverifiziert, teilweise, offen oder externer Nachweis erforderlich. Ein Testdateipfad allein ist keine Messung auf Zielhardware.

**Scope:** Historischer Prüflauf bis 14.11.2026. Am 13.11.2026 auf 476 kanonische Kriterien geprüft. Matrixheader/-links auf M1–M8 aktualisiert; Parser-/Registertests prüfen fehlende/duplizierte AC, veränderten Normtext, fehlende/beeinträchtigte Evidenz. Reine Register-/Quellenqualifikation, keine neue Produktabnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Offene Produktkriterien werden dadurch nicht automatisch abgenommen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/acceptance.test.ts`, SHA-256 `a6316d8e204d88723f0fa1e742424f11cb622ae63c250fc8ea4ac5bce72a4e5f`
- Nachweis: `scripts/acceptance-validation.ts`, SHA-256 `daa323ad7ebe91325e00b820567c90675952a0060e44994b87da597e840950c7`

### M5-AC03 · partial

Änderungen am kanonischen AC-Text werden erkannt. Fehlende Einträge, tote Nachweise und verifizierte Kriterien ohne Evidenz lassen den Checker fehlschlagen.

**Scope:** Historischer Prüflauf bis 14.11.2026. Am 13.11.2026 auf 476 kanonische Kriterien geprüft. Matrixheader/-links auf M1–M8 aktualisiert; Parser-/Registertests prüfen fehlende/duplizierte AC, veränderten Normtext, fehlende/beeinträchtigte Evidenz. Reine Register-/Quellenqualifikation, keine neue Produktabnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Offene Produktkriterien werden dadurch nicht automatisch abgenommen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/acceptance.test.ts`, SHA-256 `a6316d8e204d88723f0fa1e742424f11cb622ae63c250fc8ea4ac5bce72a4e5f`
- Nachweis: `scripts/acceptance-validation.ts`, SHA-256 `daa323ad7ebe91325e00b820567c90675952a0060e44994b87da597e840950c7`

### M5-AC04 · partial

Die Feature-Matrix verlinkt auf den AC-Abgleich. Ein Proof bleibt ein Proof; nur eine vollständig belegte AC-Menge erlaubt die entsprechende Abnahme.

**Scope:** Historischer Prüflauf bis 14.11.2026. Am 13.11.2026 auf 476 kanonische Kriterien geprüft. Matrixheader/-links auf M1–M8 aktualisiert; Parser-/Registertests prüfen fehlende/duplizierte AC, veränderten Normtext, fehlende/beeinträchtigte Evidenz. Reine Register-/Quellenqualifikation, keine neue Produktabnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Offene Produktkriterien werden dadurch nicht automatisch abgenommen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/acceptance.test.ts`, SHA-256 `a6316d8e204d88723f0fa1e742424f11cb622ae63c250fc8ea4ac5bce72a4e5f`
- Nachweis: `scripts/acceptance-validation.ts`, SHA-256 `daa323ad7ebe91325e00b820567c90675952a0060e44994b87da597e840950c7`

## M6: M6

### M6-AC01 · partial

Die fünf Beats führen gültige Runtime-Events auf tatsächlich gelesenen Workspace-Daten aus und besitzen sichtbare Ursachen.

**Scope:** M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M6-AC02 · partial

Modul-IDs, fachliche Daten und Sortierung bleiben bis zum ausdrücklich gezeigten Reset konsistent, ohne externe Mutation oder parallelen Demo-Fachstate.

**Scope:** M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M6-AC03 · partial

Anfang, Ergebnis und kompakte Komposition bestehen die Prüfung bei 320/390/768/1280 px, mit separat erfasster Surfacebreite und lesbaren Produktrollen.

**Scope:** M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `docs/qa/2026-11-02-openai/verification.json`, SHA-256 `14f48528e74c7979ad6a234cb8fe88108ce43222f3048648a8d28f7ade121c25`
- Nachweis: `docs/qa/2026-11-02-openai/final-layout-matrix.json`, SHA-256 `cb9ba1593bf54b0cda68e2f8a2f986f0c19782887d1b31ed4cc562666c22a624`

### M6-AC04 · partial

Die verwendeten DOM- und GPU-Rollen stammen aus derselben Tokenversion und behalten die bestätigte Fluid-Identität.

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M6-AC05 · partial

Eine vollständige erfasste Bildfolge einschließlich Unterbrechung, Pause/Replay und optional Loop plus nächstem Anfang ist mit Frame-/Event-/Rezeptbezug prüfbar, Lücken bleiben inconclusive.

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M6-AC06 · partial

Tatsächliche Glyphen, Pixel, native Semantik und Echtzeit-Pacing werden getrennt geprüft, fehlende Abdeckung oder ein sauberer Kontaktbogen allein erzeugen kein bestandenes Gesamtgate.

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M6-AC07 · partial

WebGPU ist Standard und das tatsächliche Backend sichtbar, WebGL2-Capture und nicht unterstützte Fähigkeiten besitzen einen eigenen qualifizierten oder offenen Status.

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M6-AC08 · partial

Der fertige M6-Lauf wird in Echtzeit und an kritischen Einzelbildern visuell geprüft und mit Brief, Vergleich, Befunden, Ausnahmen und offenen Gates übergeben.

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M6-AC09 · partial

Das Studio bietet Design-, Layout-/Semantik-, Motion-, Vergleichs- und AI-Reviewansichten mit Frame-/Partbezug, ein fehlender Modellzugang bleibt ausdrücklich nicht konfiguriert und erfüllt nicht die produktive T58-Abnahme.

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## PROVIDER: PROVIDER

### PROVIDER-AC01 · partial

Alle Dateien bestehen dieselben Zod-Verträge wie Adapterergebnisse; doppelte IDs, falsche Provenienz und ungültige Datumsbereiche werden abgewiesen.

**Scope:** Drei ausdrücklich synthetische Dateien und ausgeführte Case-/Adaptertests; 54 Endzustände und 60 Phasen im aktuellen Chromium. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Keine produktive Daten-/Anbieter-/Transaktionsfreigabe. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/data.test.ts`, SHA-256 `babf5880f3de3e81cde16bf149a26094ec948c5a829e9f197a6f90cd18b7e4b7`
- Nachweis: `tests/unit/simulation.test.ts`, SHA-256 `ce23bd6bf11a1ca36d118c40dd7c3c5b1b183cae1a6db69387391bff8ec02800`

### PROVIDER-AC02 · partial

Suche, Sortierung, Verfügbarkeit, Abbruch, überholte Ergebnisse und Revalidation werden unabhängig von einem Anbieter getestet.

**Scope:** Drei ausdrücklich synthetische Dateien und ausgeführte Case-/Adaptertests; 54 Endzustände und 60 Phasen im aktuellen Chromium. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Keine produktive Daten-/Anbieter-/Transaktionsfreigabe. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/data.test.ts`, SHA-256 `babf5880f3de3e81cde16bf149a26094ec948c5a829e9f197a6f90cd18b7e4b7`
- Nachweis: `tests/unit/simulation.test.ts`, SHA-256 `ce23bd6bf11a1ca36d118c40dd7c3c5b1b183cae1a6db69387391bff8ec02800`

### PROVIDER-AC03 · partial

Eine gekennzeichnete Simulation beweist die UI-/State-/Adapterverträge. Sie erfüllt kein AC für einen produktiven Anbieterzugang, aktuelle Marktpreise oder echte Buchungen.

**Scope:** Drei ausdrücklich synthetische Dateien und ausgeführte Case-/Adaptertests; 54 Endzustände und 60 Phasen im aktuellen Chromium. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Keine produktive Daten-/Anbieter-/Transaktionsfreigabe. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

- Nachweis: `tests/unit/data.test.ts`, SHA-256 `babf5880f3de3e81cde16bf149a26094ec948c5a829e9f197a6f90cd18b7e4b7`
- Nachweis: `tests/unit/simulation.test.ts`, SHA-256 `ce23bd6bf11a1ca36d118c40dd7c3c5b1b183cae1a6db69387391bff8ec02800`

### PROVIDER-AC04 · external

Jeder Live-Adapter benötigt separat Zugang, Mapping, Nutzungsrechte, Fehler-/Limit- Tests, Quote-/Bestandsprüfung und einen überprüfbaren Übergabe- oder Transaktionsnachweis.

**Scope:** Offizielle APIs recherchiert; kein produktiver Anbieterzugang konfiguriert.

**Offen:** Freigegebenen Bestand/Store und Anbieterzugang bereitstellen; danach Mapping, Limits, Bestands-/Quoteprüfung und Transaktionsgrenze qualifizieren.

- Nachweis: `docs/research/provider-apis.md`, SHA-256 `828841441283f748f2b82860e2fc382bafdb26ac939cd10bb6c7d30716ee0c92`

## UI: UI

### UI-CHECK-01 · partial

**UI-01 Textflächen:** Keine sichtbaren Glyphen überschneiden andere Texte, Controls oder zugehörige Textregionen. Tatsächliche Font-Messwerte prüfen, nicht nur nominale SceneNode-Rechtecke.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-02 · partial

**UI-02 Inhalt:** Labels sind eindeutig; kein angrenzendes „Ziel Ziel“ oder widersprüchliche Zustandsanzeige. Endpunkte und Wiedergabestatus haben eigene Bedeutung.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-03 · partial

**UI-03 Typografie:** Lesbare Schrift, kontrollierte Zeilenzahl und Line-height; kein zufälliger Wortumbruch in kurzen Controls, keine fehlenden Glyphen.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-04 · partial

**UI-04 Resize und Zoom:** Schmale, mittlere und breite Container sowie Verkleinern/Vergrößern während eines Runs prüfen. Keine horizontale Seitenscrollbar oder abgeschnittene Timeline. Browser-Zoom und DPR gesondert nachweisen.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-05 · partial

**UI-05 Ansichten:** Tabelle, Karten, Map, Detail sowie leere Suche und lange Inhalte prüfen. Header und Fußzeilen behalten Abstand, Dataset bleibt echt.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-06 · partial

**UI-06 Übergänge:** Quelle, 25/50/75 % und Ziel pro Rezept prüfen. Bewegte Texte dürfen beim Kreuzen von Elementen nicht ineinander laufen. Retargeting, Pause/Fortsetzen, Replay und Live-Restore dürfen keine Geistertexte erzeugen.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-07 · partial

**UI-07 Eingabe:** Pointer und Tastatur, Fokusdarstellung, ausgewählter Zustand, Suche, Sortierung und Back/Forward funktionieren nach Layoutänderungen.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-08 · partial

**UI-08 Studio:** Eingeklapptes/aufgeklapptes Effekt-Studio, vier Auswahlmodi, Parameter und Timeline sind ohne Überlagerung bedienbar.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-09 · partial

**UI-09 Backend:** Tatsächliches WebGPU und gekennzeichnetes WebGL2 prüfen; keine neuen Render-/Shaderfehler. Reduced Motion separat prüfen.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-10 · partial

**UI-10 Abschluss:** Neue Screenshots lokal speichern und öffnen; Befunde mit Breite, Ansicht, Rezept und Phase dokumentieren. Offene Checks ausdrücklich benennen.

**Scope:** Aktueller M5-Übergabeumfang; Bilder geöffnet und geprüft, statische/DOM-/GPU-/Semantiknachweise und offene Prüfungen getrennt ausgewiesen. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Produkt-Supportprofile bleiben eigenständige Abnahmen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-11 · partial

**UI-11 Designkonsistenz:** Typografie-/Farb-/Abstandsrollen, gemeinsame Controls, localegerechte Zahlen und eindeutig formulierte Aktionen prüfen. Deutsche Substantive und kuratierte Fluid-Effekte nicht durch fremde Stilregeln automatisch umschreiben. Kontrast, Schriftgröße und Ziele am sichtbaren Ergebnis messen.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-12 · partial

**UI-12 Prüfgrenzen:** Statische DOM-Hinweise, berechnetes DOM-Layout, GPU-Glyphen, Semantik und Screenshots getrennt nachweisen. Nicht unterstützte Prüfungen ausdrücklich offen lassen; Ausnahmen präzise begründen. Null statische Befunde bedeuten keine Freigabe der Canvas-Inhalte.

**Scope:** Aktueller M5-Übergabeumfang; Bilder geöffnet und geprüft, statische/DOM-/GPU-/Semantiknachweise und offene Prüfungen getrennt ausgewiesen. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Produkt-Supportprofile bleiben eigenständige Abnahmen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-13 · partial

**UI-13 Design-Brief:** Medium, Nutzerziel, Datenmodus, Referenz und drei bis fünf erklärbare Beats sind vor der Umsetzung benannt; die Oberfläche besitzt einen klaren Fokus.

**Scope:** M6 auf tatsächlichen elf Workspace-Modulen im integrierten Chromium; 12 Endpunkte, lokale Studioansichten und ausgeführte Vertrags-/Negativtests. AI-Tests verwenden ausdrücklich SDK-Testmodelle. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Weitere Produkt-, Hardware-, Accessibility- und Live-AI-Gates bleiben separat offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-14 · partial

**UI-14 Identität und Dichte:** Tokenrollen und eigene Assets passen zum Produkt; Tabellenwerte und Pflichtinformationen werden nicht durch dekorative Balken ersetzt.

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-15 · partial

**UI-15 Komposition:** Anfang, Ergebnis und kompakte Ansicht sind im realen Host verständlich; Framing oder optionale Kamera schneiden keine operative Handlung ab.

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-16 · partial

**UI-16 Zeitliche Evidenz:** Vollständige erfasste Folge, Ein-/Ausstiege, Retargeting und gegebenenfalls Loopnaht sind zugeordnet; Lücken sind inconclusive und kein Kontaktbogen ersetzt Einzelbildanalyse.

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-17 · partial

**UI-17 Ruhe und Ursache:** Bewegungen referenzieren reale Events oder deklarierte Präsentationsaktionen; Poster, Reduced Motion, Nutzerübernahme und Leerlauf sind geprüft.

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-18 · partial

**UI-18 Vergleich und Lernen:** Referenz/Kandidat werden unter gleichen Bedingungen mit konkreten Bildbelegen verglichen; wiederkehrende Ursachen besitzen gezielte Regressionen.

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-CHECK-19 · partial

**UI-19 AI-Kritik:** Freigegebener Datenumfang, Pixelredaktion, Provider, Budget, Framebezug und Unsicherheit sind sichtbar; Empfehlungen und unabhängige harte Gates bleiben unterscheidbar.

**Scope:** Implementierter lokaler M6-Schnitt, begrenzte SDK-Vertrags-/Negativtests und WebGPU-Endpunkte; keine vollständige Produkt-/Live-AI-Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständigen Studio-/Rehearsal-/AI-Vertrag mit Persistenz, Bildfolge, Live-Evaluation und Supportprofilen qualifizieren. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-TASK-01 · partial

Textregionen begrenzen und tatsächliche Glyph-Bounds auslesbar prüfen. Header, Unterzeile und Effektleiste sind disjunkt; Schrift bleibt in ihrer Region.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-TASK-02 · partial

Timeline-Status und Endpunkt unterscheiden. „Ziel“ erscheint genau einmal im Transport; Anfang, Effektphase, Pause und Ende besitzen nachvollziehbare Labels.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-TASK-03 · partial

Text-Choreografie: Quelltext ausblenden, Geometrie bewegen, Zieltext einblenden. Im bewegten Segment sind kreuzende Beschriftungen unsichtbar; statische Controls bleiben bedienbar. Logische Events und URL-Commit bleiben unverändert.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-TASK-04 · partial

Breiten-/Ansichts-/Phasenmatrix mit Unit-/Property-Regressionen und tatsächlicher GPU-Textmessung prüfen. Bei Befunden erneut korrigieren und nachprüfen.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-TASK-05 · partial

Ergebnis in T19/T43/T45 und dem QA-Bericht verlinken; Gesamtplan, Feature-Matrix und relevante Mermaid-Flows konsistent halten.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-RUN-01 · partial

`npm run check:design` prüft das versionierte Studio-Profil und erzeugt das validierte Build-Artefakt. `npm run quality:gate` führt alle lokalen CI-Gates aus.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-RUN-02 · partial

Im Studio „UI-Qualität“ öffnen, Zustand/Backend/Viewport wählen und prüfen. Den Report mit Build-ID exportieren. Nach Resize, Settings-, Ansichts- oder Studio-Layoutwechsel neu messen; alte Laufzeitbefunde werden verworfen.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-RUN-03 · partial

Report, Screenshot und manuelle Abnahme verbinden. Vier offene Kategorien (zusammengesetzter Kontrast, Eingabe/AT-Journeys, Browser-Motion und Screenshot- Review) erhalten keine automatische Freigabe. Screenshot-Review erfolgt separat im QA-Bericht; der Prüfer bewertet seine eigene Ergebnisoberfläche nicht rekursiv.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-RUN-04 · partial

Proportional verkleinertes Replay ausdrücklich auf Lesbarkeit prüfen. Geometrie ohne Kollisionen genügt bei sehr kleinen Schriften nicht zur Designfreigabe.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### UI-MATRIX-01 · partial

Viewport: 320, 390, 550, 768, 1024 und 1440 px; Containerbreite separat erfassen. Ansichten: Table / Cards / Map / Detail; alle echten Module, leere Suche, Auswahl. Rezepte: Fluid Morph / Spring Reflow / Ripple Reveal / Basisbewegung. Phasen: Start, 25 %, 50 %, 75 %, Ende; Unterbrechung und Resize. Automatisierte Geometrieprüfungen ergänzen die Browsermessung. Screenshotprüfungen sind keine vollständige manuelle Screenreader-, IME- oder Hardwarefreigabe.

**Scope:** Aktuelle Cases: 54 Endzustände und 60 Cards→Table-Prüfpunkte; Workspace-Detail/Recovery/WebGL2 erneut geprüft. Historische M4-Matrix bleibt gesondert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Vollständige Workspace-/Komponenten-/Zoom-/DPR-/AT-/Motion-Matrix und alle Übergangsarten prüfen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## M7: M7

### M7-AC01 · partial

Sechs eindeutig versionierte Rezepte besitzen gemeinsame Metadaten für Titel, Stil, Parameter, empfohlenes Preset und Ressourcenanforderungen.

**Scope:** Sechs versionierte Rezeptmetadaten mit Stil, Parametern, Ressourcenprofilen und empfohlenen Werten durch Resolver-/Schema- und Dokumentationstests geprüft; tatsächlich bedienbar in WebGPU und WebGL2. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC02 · partial

Bestehende Rezeptversionen, Seed-Berechnung und gespeicherte Random-Pools bleiben unverändert interpretierbar; neue Rezepte werden bewusst in Pools aufgenommen.

**Scope:** Bestehende Versionen, Seeds und gespeicherte Random-Pools bleiben im Import-/Resolvertest erhalten; neue Rezepte werden bewusst aufgenommen. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC03 · partial

Rezept-, Modus-, Seed- und Parameteränderungen verändern weder die fachliche Snapshotrevision noch den bereits laufenden aufgelösten Effektplan.

**Scope:** Domainrevision und laufender Plan bleiben bei Präsentationsänderungen in Runtime-/Komponententests unverändert; Browser-Effektwahl erzeugte keine neue URL. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC04 · partial

Alle sechs Rezepte und Auswahlmodi sind bei 320/390/768/1280 px Browserbreite lesbar und erreichbar; tatsächliche Surfacebreite, Dockhöhe und Folgeinhalte benutzen eine konsistente Layoutberechnung ohne horizontale Überläufe.

**Scope:** Sechs Rezepte und Modi bei Browserbreiten 320/390/768/1280 lokal geprüft; tatsächliche Surfacebreiten 298/368/461/868. Metadaten aller Samples und originale Phasen zeigen lesbaren Dock ohne Überlauf. Responsive Desktopemulation, keine physische Mobilgerätefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC05 · partial

Studio und Showcase benutzen dieselben Einstellungen; reine Rezeptwahl erhält individuelle Parameter und „Preset anwenden“ setzt die empfohlenen Werte ausdrücklich.

**Scope:** Studio und Showcase verwenden denselben VisualState. Tests prüfen Parametererhalt und ausdrückliche Presetübernahme; Dokumentationstabelle ist gegen Rezeptmetadaten geprüft. Vergleichssequenzen mit 1100 ms/65 % sind keine individuelle Presetqualifikation. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC06 · partial

Silk Cascade bewegt zusammengehörige Parts mit gemeinsamer Phase auf ruhigen gestaffelten Bahnen, bewahrt ausgewählte Identität und ist visuell von Spring Reflow unterscheidbar.

**Scope:** Silk-Gruppen, gemeinsame Phase und Auswahlbezug rein geprüft; tatsächliche GPU-/GL2-Bildfolgen und getrennte Originalphasen-Review zeigen ruhige Staffelung statt Spring-Impuls. Lokaler Geräteumfang. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC07 · partial

Liquid Lens erzeugt nachweisbare lokale Hintergrundbrechung mit organischer Kontur; sie liest nie aus einer gleichzeitig als Schreibziel gebundenen Textur.

**Scope:** Lokale Linsenbrechung in GPU-/GL2-Originalframes nachgewiesen; unabhängiges Capture-Target vermeidet Rückkopplung. 8-Punkt-GPU-Linsenkernelreadback und reale GLSL-Graphregression bestanden; Y-Inversionsfehler aus339 bleibt im Archiv. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC08 · partial

Text, Fokus, Caret, aktive Eingabe und Effektsteuerung bleiben außerhalb der Linsenverzerrung und erhalten korrekte Überdeckung, Clipping und Lesbarkeit.

**Scope:** Lokaler Eingabe-/Lens-Proof: geschütztes Suchfeld, scharfe Labels, Auswahl/Caret und gemeinsames Clipping in tatsächlichen WebGPU-/WebGL2-Originalen geprüft; deklarierte JP-Probe sichtbar, Langtext am Anfang/Ende editierbar. Final81 ergänzt native100-Zeichen-Grenze aus Field-Vertrag. Schrift-/IME-/AT-Gesamtmatrix wird dadurch nicht freigegeben. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC09 · partial

Particle Weave ordnet begrenzte instanzierte Fragmente stabilen Komponenten-IDs zu, übernimmt Themefarben, verwendet keine Schriftfragmente und hinterlässt am Ziel keine sichtbaren Partikel.

**Scope:** Particle-Instancing, deterministische IDs, Themefarben und Grenzen rein geprüft; GPU/GL2/kompakte Originalphasen zeigen ausschließlich Flächenfragmente und leere Ziel-Effektkanäle. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC10 · partial

Jeder Sampler besitzt exakte Quell-/Zielendpunkte und liefert bei gültigen Parameterrändern ausschließlich endliche Werte und gültige Geometrie.

**Scope:** Exakte Endpunkte und finite Parameterränder durch Sampler-/Property-Tests; alle archivierten Sequenzen bestätigen Quell-/Zielgeometrie und leere Endeffekte. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC11 · partial

Direkte und zufällige Seek-Reihenfolgen einschließlich 0 → 1 → 0,5 → 0 reproduzieren dieselbe Darstellung wie reguläre Wiedergabe am jeweiligen Zeitpunkt; entfernte Quellobjekte sind rekonstruierbar.

**Scope:** Sampler prüft beliebige Seekfolgen; tatsächliche Browserfolge 0→1→0,5→0 stellte den Quellzustand wieder her. Originale Anfangs-/Rückkehrbilder sind identisch. Bounded Clipcache hält Quellobjekte rekonstruierbar. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC12 · partial

Unterbrechungen bei 25/50/75 % sowie wiederholte Unterbrechungen während des Abbaus erhalten den aktuellen sichtbaren Zustand ohne Geistertexte, veraltete Endpunkte oder wachsende Effektschichten.

**Scope:** 25 tatsächliche native Pointer-/Keyboard-/Historypaare des f706-Builds decken drei neue Effekte, beide Backends,25/50/75% und erneute Unterbrechung im Abbau ab. Struktur/C0/Revisionen bestanden;23 Quellenpaare rastergleich. Zwei aktuelle warme Wiederholungen behalten C0; vier aktuelle Originalbilder zeigen gleiche relative Panel-/Textanordnung ohne sichtbaren Quellenreset. Rasterdifferenzen bleiben ungeklärt und werden nicht als Byte- oder Materialgleichheit ausgegeben. Core/Sampler bleiben im finalen Build unverändert. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC13 · partial

Bestehende VisualScenario-v2-Aufzeichnungen importieren unverändert; v3 exportiert/importiert auch unterbrochene Linsen-/Partikeldarstellung mit validierten Grenzen, Versionen und Referenzen ohne ausführbaren Code.

**Scope:** v2-Normalisierung, v3-Roundtrip unterbrochener Darstellungen, Versions-/Referenzgrenzen und geschützte IDs rein geprüft; Studio-Diagnosen verwenden denselben validierten Importvertrag ohne ausführbaren Code. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC14 · partial

Dekorative Effekte erzeugen keine Pointer-/Tastaturziele; ausgeblendete oder verdeckte Controls sind keine unsichtbaren Pointerziele und Fokus-, Auswahl-, Texteingabe- und IME-Verhalten bestehen im vorhandenen Eingabe-Proof.

**Scope:** Im vorhandenen lokalen Proof: occlusion-aware Hit-Test, Fokus/Selection, scharfer Langtext, Clipboard und deklarierte JP-Glyphen geprüft. Derselbe manuelle OS-Dead-Key-Lauf liefert â statt ^a, trusted Kompositionsbeginn/Input mit aktivem Core-Schutz und korrektes funktionales Commit/Fokus. Ende beobachtet untrusted; Zähler vollständig trusted Zyklen bleibt0. Keine japanische Kandidaten-, andere IME-, AT-,Touch- oder Mobile-Freigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC15 · partial

Sortierung, Suche, Auswahl, Daten-IDs, Navigation und Back/Forward bleiben konsistent; Effektparameter erzeugen keine History-Einträge und Replay führt keine fachlichen oder externen Mutationen aus.

**Scope:** Reale Workspace-Journey mit tatsächlichen Manifestabhängigkeiten: Auf/Ab-Sortierung, stabile IDs, Suche, Auswahl/Views, native History, Deep-Link/Reload konsistent. Effektwahl erhält URL/Domainrevision; Replay ist readonly mit0 editierbaren Textboxes, Live stellt Entwurf wieder her. Der f0-History-Stale-Clipfehler ist korrigiert und native f706-Paare bestanden. Finaler Core bleibt hashgleich; produktive Anbietertransaktionen sind nicht Teil dieser lokalen Abnahme. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC16 · partial

Reduced Motion erzeugt unmittelbar das vollständige gültige Ziel ohne Zusatzeffekt; Nutzerübernahme, Pause und verborgenes Dokument führen nicht zu unkontrollierter Bewegung.

**Scope:** Final81 in lokalem Chrome/WebGPU: echte DevTools-Mediawechsel setzen laufende Lens sowie neue Silk-/Lens-/Particle-Ziele unmittelbar auf100%/idle ohne FX.21 exportierte Beobachtungen belegen Pause bei Hidden(4,122s) und angehaltene laufende Uhr bei Hidden(9,146s) mit identischem Frame/Fortschritt; nach Visible regulärer Abschluss. Native Tour-Sortübernahme stoppt die Führung. Präferenz zuletzt zurückgesetzt; kein OS-/Allbrowsernachweis. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC17 · partial

Die neuen Effekte verwenden das vorhandene Device und den zentralen Surface-Scheduler; Endzustände rendern ohne begründeten Bedarf keine zusätzlichen Frames.

**Scope:** Sequenz- und Diagnosezähler bestätigen eine Surface/ein Backenddevice, keine zusätzlichen Jobs, keine ausstehenden Frames im ruhenden Endzustand. Effekte verwenden den bestehenden Scheduler. Lokaler Scope. Im finalen d9-Build blieb ein gesetzter WebGPU-Cards-Endzustand über 43 Sekunden bei 16 Frames; kein Hintergrundtab-/Alle-Modi-Nachweis. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC18 · partial

Das pro Run eingefrorene Standardprofil begrenzt Partikel auf 2.048 und zwei Render Targets auf jeweils maximal 2.048 Pixel je Kante; das Kompaktprofil begrenzt sie auf 512 beziehungsweise 1.024 Pixel und reduziert nicht die normale GPU-Textauflösung.

**Scope:** Standard/Kompaktbudgets sowie eingefrorene Profile rein und anhand tatsächlicher Sequenzen geprüft; maximal 2048/512 Partikel und Targets mit 2048/1024 Kanten. Geschützter Text bleibt in voller Surfaceauflösung. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC19 · partial

Nach 100 Wiederholungen mit Replay, Unterbrechungen und Disposal wächst der Ressourcenbestand nach Aufwärmen nicht dauerhaft; neue Targets, Buffer und Jobs haben überprüfbare Besitzer und werden auch bei Fehlern freigegeben.

**Scope:** Final81: je tatsächlichem Backend100 neue imperative Surfaces, alle drei Rezepte je Zyklus und Disposal im laufenden Effekt; je fünf reale Sonderfälle einschließlich Init-Abort, Fontfehler, kontrolliertem Device-/Contextverlust und Wiederherstellung. Verwaltete Ressourcen/Jobs ohne Rest; historische Replay-/100-Retarget-Plateaus bleiben separat Build2006 zugeordnet. Kein Prozess-/Treiberspeicher oder allgemeiner React-Mountclaim. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC20 · partial

WebGPU und erzwungenes WebGL2 werden separat geprüft; das tatsächliche Backend, ausgewähltes und verwendetes Rezept sowie begründete Reduktionen sind sichtbar, nicht unterstützte Kombinationen werden nicht als bestanden ausgegeben.

**Scope:** WebGPU und erzwungenes WebGL2 separat erfolgreich aufgenommen und Originalphasen geprüft; Backend/Rezept/Version/Profil sichtbar zugeordnet. Shader-/Devicefehler brechen Prüfung ab.Build-339-GLSL-Fehler bleibt ausdrücklich negativer historischer Nachweis. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC21 · partial

Tabelle ↔ Karten, Karten ↔ Map und Karten ↔ Detail bestehen Start-/25-/50-/75-/Endprüfungen sowie Resize und die Größenmatrix ohne Textüberschneidungen, Geistertexte, redundante Statuslabels oder abgeschnittene Controls; die drei ursprünglichen Rezepte bleiben Regressionen.

**Scope:** Final81:144 Fälle(3 Rezepte×6 Richtungen×4 tatsächliche Browserbreiten×2 Backends),720 Kontrollbilder/288 Endpunkte validiert. Originalbildreview über nachgewiesene Bildidentität und neue Textänderungsprüfung. Sechs native Resize-Journeys1280→390→768 erhalten Cards/IDs und anschließendes Table-Hit-Target;50%-Seek ist CUA-Handlungsbeobachtung, nicht gespeicherte JSON-Progressmessung. Sechs alte Rezept/Backendregressionen mit12 Originalbildern bestanden; keine physische Mobil-/Hardwarefreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC22 · partial

Vollständige deterministische Bildfolgen der drei Vorführungen besitzen Frame-/Zeit-/Build-/Backend-/Seed-/Rezeptbezug und eine Vollständigkeitsprüfung; fehlende Frames bleiben inconclusive und einzelne CapturedFrames werden nicht als Vollsequenz umgedeutet.

**Scope:** Build 2006 enthält 12 vollständige verlustfreie Bildfolgen mit 67 Frames, Zeit/Build/Backend/Seed/Rezept und Vollständigkeitscheck. Sekundäre und Patchläufe mit nur Metadaten+fünf Originalbildern sind ausdrücklich keine Vollarchive; Tests erkennen fehlende Frames. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC23 · partial

Ein separater Echtzeitlauf dokumentiert Gerät, Browser, Viewport und P95-Framezeit gegen das Desktopziel 16,7 ms; langsames Screenshot-Sampling ist kein FPS-Nachweis und nicht bestandene Profile bleiben offen.

**Scope:** Historischer Build2006 vom3.November: Separater warmer Echtzeitlauf je drei Effekte×zwei Backends auf Apple M5 Max/macOS 27.2/Codex-IAB: P95 8,4–8,9 ms, Maximum 9,1–16,7 ms, null Intervalle >50 ms bei 868×1136. Browserversionsnummer nicht offengelegt; Startabstand ausgelassen, keine GPU-Timestamps oder allgemeine FPS-Zusage. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC24 · partial

M7a zeigt die vier beschriebenen Stationen mit tatsächlichen Workspace-Daten auf Desktop und schmaler Ansicht, erlaubt jederzeit Übernahme und separate Wiederholung und wird im geöffneten Codex-Browser als Zwischenstand übergeben.

**Scope:** M7a mit tatsächlichen gefilterten Workspace-Daten auf Desktop und 390 px durchgelaufen, endete in Map und stellte vorherige Einstellungen wieder her. Nutzerübernahme und einzelne Wiederholung bedienbar; Browser bleibt geöffnet. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC25 · partial

Feature-Matrix, Tasks, AC-Register, Mermaid-Flows, README und beide OKF-Bundles beschreiben denselben nachgewiesenen Umfang; M7-Kriterien werden vom kanonischen Parser erfasst und bestehende offene Gesamtplangates nicht pauschal hochgestuft.

**Scope:** 435 kanonische Kriterien einschließlich 27 M7, Feature-/Taskmatrix, Flows und beide OKF-Bundles werden aus denselben Quellen erzeugt. Historische Nachweise und offene Gesamtplangates bleiben getrennt. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC26 · partial

Neue Aufzeichnungen und Qualitätsartefakte übernehmen die bestehenden Redaktions-/Sensitivitätsgrenzen; vertrauliche Inhalte werden nicht durch den Darstellungssnapshot oder Sequenzexport zusätzlich offengelegt.

**Scope:** Final81:26 tatsächliche Captureproben auf beiden Backends über sensible Quelle/Ziel/Unterbrechung; private Bilder blockiert und V3-Text/Label redigiert, öffentlicher Endpunkt danach capturierbar. Unabhängige Originalberichtprüfung findet keine synthetischen Rohmarker oder sensiblen Textexporte. Produktive Capture-/Downloadgrenzen qualifiziert; kein Schutz vor OS-Screenshots und keine zusätzliche Server-/Rollenfreigabe. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im angegebenen lokalen M7-Scope belegt; weitergehende T06/T07/T29-/GLOBAL-Gates bleiben eigenständig offen. Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

### M7-AC27 · partial

ai-design-check bleibt auf seine unterstützten Prüfungen begrenzt und optionale AI-Kritik läuft über Vercel AI SDK; Empfehlungen ersetzen keine deterministischen, manuellen oder Hardwaregates und ihre Abdeckung bleibt sichtbar.

**Scope:** Final81: ai-design-check prüft28 unterstützte DOM-Quelldateien ohne Fehler/Warnungen. Optionale AI-Analyse verwendet unverändert Vercel AI SDK;267 Tests enthalten Provider-/Revisions-/Freigabegrenzen. Kein neuer Live-AI-Aufruf, menschliches Review oder erweiterter Hardwareclaim. Einzelne Belege des historischen Laufs sind separat archiviert.

**Offen:** Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.

Kein Nachweis im Register.

## M11-01: M11-01

### M11-01-AC · verified

Tabelle → Karten → Vergleich in DE, EN und FR bei 390 und 1280 px. Jede der sechs gerichteten Sprachkombinationen wird bei 50 % geprüft. IDs, Werte, Auswahl und Fokus bleiben erhalten. Der französische Text „Dépendances“ und der mit `Intl.NumberFormat` formatierte Testwert „1 234“ erscheinen vollständig und mit korrektem geschütztem Gruppenabstand auf der GPU. Der Testwert wird isoliert geprüft, die Vorführung verwendet echte Modulwerte. Kein unübersetzter Schlüssel, keine kollidierenden sichtbaren Texte und keine verwaisten Pointer-Ziele an den Prüfpositionen. Nutzer können die Bewegung anhalten.

**Scope:** Sechs Sprachrichtungen im pausierten Workspace, Tabellen-/Karten-/Vergleichsjourney und französischer Zahlentest.

**Offen:** Im bezeichneten Scope kein Restpunkt eingetragen.

- Nachweis: `docs/qa/2026-11-20-m11/verification.json`, SHA-256 `cc11b1a9492fdfbb5f557c4a7b3e2ebb83b6954e7eebe95a3b3513b874bd5cec`
- Nachweis: `docs/qa/2026-11-20-m11/gpu-locales.json`, SHA-256 `d4cb2cbce49fa8df84de44540e40f5dd41679171198ab35669d3857678f0632e`
- Nachweis: `docs/readme/assets/m11-workspace-screenshots.json`, SHA-256 `4ba47adb83205cd480dd64428380acb4d2cc97bb3e00ccb190af2c82b78ae2cd`

## M11-02: M11-02

### M11-02-AC · verified

Plural 0/1/2, Parameterreihenfolge, Apostroph, fehlender Schlüssel und kaputtes Paket getestet. SSR, Browser und eigenständiger Host liefern bei identischem Kontext dieselben Beispieltexte. Bundlevergleich nennt gzip-Delta, Importgraph und Buildplattform. Der Testhost kann die Nachrichten ohne Next.js oder DOM initialisieren.

**Scope:** Host-Bundle, drei Kataloge, ICU-Fehler, Pluralformen und Sprachprojektionen für SSR und Browser.

**Offen:** Im bezeichneten Scope kein Restpunkt eingetragen.

- Nachweis: `docs/qa/2026-11-20-m11/adapter-comparison.json`, SHA-256 `f2c87b40ac2804e6036e2f7f11b37e3efa1c4064daf1b5398291c1530b498119`
- Nachweis: `docs/qa/2026-11-20-m11/verification.json`, SHA-256 `cc11b1a9492fdfbb5f557c4a7b3e2ebb83b6954e7eebe95a3b3513b874bd5cec`

## M11-03: M11-03

### M11-03-AC · verified

Erste Serverantwort hat korrekte Sprache/Richtung und passende Metadaten. Einstieg über `/de/`, `/en/` und `/fr/`, Reload, Back/Forward, Rückkehr aus Studio, Altlink mit Query/Fragment, ungültiger Tag, zwei parallele Hosts und fehlgeschlagener Download geprüft. Ein ungespeicherter Entwurf, mehrfache Auswahl und IME-Inhalt bleiben erhalten. Beim schnellen Wechsel DE → EN → FR bleibt Französisch aktiv, auch wenn der englische Katalog zuletzt eintrifft.

**Scope:** Studio-Pfad und Präferenz, Hydrierung, Verlauf, Fokus, Entwurf, Hostisolation und verspätete Kataloge.

**Offen:** Im bezeichneten Scope kein Restpunkt eingetragen.

- Nachweis: `docs/qa/2026-11-20-m11/verification.json`, SHA-256 `cc11b1a9492fdfbb5f557c4a7b3e2ebb83b6954e7eebe95a3b3513b874bd5cec`

## M11-04: M11-04

### M11-04-AC · partial

320/390/768/1280 px, beide Backends und Reduced Motion. Die drei Formübergänge vorwärts und rückwärts an 5-%-Punkten auf Textkollisionen prüfen, einschließlich echter Glyphenmaße, Fokus-/Hit-Regionen und Cursor. Pseudosprache mit mindestens 30 % Verlängerung. RTL-Pilot mit arabischem Text, lateinischer Modul-ID, Klammern, Zahl und bidirektionaler Auswahl. CJK separat mit Fontkorpus, mobiler IME und dokumentierter Lückendiagnose.

**Scope:** GPU-Profile und erweiterte Schriftkorpora auf Desktop-Chrome.

**Offen:** Echte mobile japanische IME und bidirektionale Auswahl mit einem RTL-Nutzer sowie Screenreader-Journeys auf benannten Geräten durchführen.

- Nachweis: `docs/qa/2026-11-20-m11/gpu-locales.json`, SHA-256 `d4cb2cbce49fa8df84de44540e40f5dd41679171198ab35669d3857678f0632e`
- Nachweis: `docs/qa/2026-11-20-m11/verification.json`, SHA-256 `cc11b1a9492fdfbb5f557c4a7b3e2ebb83b6954e7eebe95a3b3513b874bd5cec`

## M11-05: M11-05

### M11-05-AC · verified

Numerische Sortierung, Umlaute, gleiche Anzeigenamen mit stabiler ID, Suche und Tastaturreihenfolge getestet. Gleicher EUR-Betrag in allen drei Formatprofilen. Für `fr-FR` prüfen, dass „1 234,56 €“ in diesem Referenzprofil U+202F als Gruppentrenner und U+00A0 vor dem Eurozeichen enthält. Testdatum um Mitternacht in expliziter Zeitzone. Sprachneutrale Daten laden beim Wechsel kein zweites Mal. Zwei unterschiedlich lokalisierte Anbieterantworten überschreiben einander nicht.

**Scope:** Original-IDs und EUR-Minorwerte, localegebundene Reihenfolge, native Intl-Profile, zeit- und sprachgebundene Abfragen.

**Offen:** Im bezeichneten Scope kein Restpunkt eingetragen.

- Nachweis: `docs/qa/2026-11-20-m11/verification.json`, SHA-256 `cc11b1a9492fdfbb5f557c4a7b3e2ebb83b6954e7eebe95a3b3513b874bd5cec`

## M11-06: M11-06

### M11-06-AC · verified

Neue Aufnahme bindet aufgelöste Texte, Tag, Richtung, Katalog-/Font-Fingerprints, Zeitkontext und Build. Für v2/v3/v4 werden ursprüngliche Knoten und Hashes beibehalten, eine fehlende Sprache erscheint als „unbekannt“. DE-Clip im FR-Studio und FR-Clip im EN-Studio rückwärts abspielen und Originalpixel-/Zustandsbezug prüfen. Aktuelle Übersetzung als eigener neuer Run mit Herkunft.

**Scope:** Version 5 bindet die Sprachprojektion an Katalog, Fonts und Build. Import erhält Originaldaten, lokales Restaging verknüpft den zweiten Clip über SHA-256.

**Offen:** Im bezeichneten Scope kein Restpunkt eingetragen.

- Nachweis: `docs/qa/2026-11-20-m11/gpu-locales.json`, SHA-256 `d4cb2cbce49fa8df84de44540e40f5dd41679171198ab35669d3857678f0632e`
- Nachweis: `docs/qa/2026-11-20-m11/verification.json`, SHA-256 `cc11b1a9492fdfbb5f557c4a7b3e2ebb83b6954e7eebe95a3b3513b874bd5cec`

## M11-07: M11-07

### M11-07-AC · verified

Antwortsprache per Allowlist an den einzelnen Auftrag binden. Umschalten erzeugt null Modellaufrufe und null neue Budgetreservierungen. Späte Antwort, Ablehnung, Entwurf und Preflight behalten Sprache, Revision und Datensatzbezug. Originaltext/Quellbild bleibt erhalten. Providerfehler wird über stabilen Fehlercode in der UI-Sprache angezeigt. Releaseprobe pro freigegebener Antwortsprache fachlich und sprachlich prüfen.

**Scope:** Allowlist und Fehlerstatus mit isolierten SDK-/Browserprüfungen. Drei ausdrückliche Live-Reviews desselben redigierten Frames lieferten fachlich plausible Hinweise in der angeforderten Sprache.

**Offen:** Im bezeichneten Scope kein Restpunkt eingetragen.

- Nachweis: `docs/qa/2026-11-20-m11/live-review.json`, SHA-256 `13f25a40412b310403865ced049e4296347712a518fce1fe8e44a2e2f8dc6b96`
- Nachweis: `docs/qa/2026-11-20-m11/verification.json`, SHA-256 `cc11b1a9492fdfbb5f557c4a7b3e2ebb83b6954e7eebe95a3b3513b874bd5cec`

## M11-08: M11-08

### M11-08-AC · partial

Je freigegebener Sprache sind beide Bücher offline öffnbar. Kapitelanker, Suche, Sprache, Alttexte und lokale Querverweise prüfen. Sprachumschalter hält das gelesene Kapitel. Bestehende URLs bleiben gültig. Neue Bedienbilder stammen aus der betreffenden UI-Sprache mit Buildbezug. Historische Originalbelege tragen Herkunft und Sprache. Sprachkundige Personen prüfen Glossar und die Kernjourney je Sprache, AT-/Geräteprüfung bleibt je Profil einzeln sichtbar.

**Scope:** Sechs lokale Reader, Kapitelwechsel, lokalisierte Screenshots und reproduzierbare Offline-Ausgaben.

**Offen:** Unabhängige sprachkundige Personen prüfen je Sprache Glossar und Kernjourney. Manuelle AT-/Geräteergebnisse je Profil ergänzen.

- Nachweis: `docs/qa/2026-11-20-m11/verification.json`, SHA-256 `cc11b1a9492fdfbb5f557c4a7b3e2ebb83b6954e7eebe95a3b3513b874bd5cec`
- Nachweis: `docs/readme/assets/m11-workspace-screenshots.json`, SHA-256 `4ba47adb83205cd480dd64428380acb4d2cc97bb3e00ccb190af2c82b78ae2cd`

[^implementation]: Kanonisches AC-Register und gebundene Nachweise im Quellinventar.
