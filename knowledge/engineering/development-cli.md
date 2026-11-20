---
type: "Development Guide"
title: "Entwicklung, Toolchain und CLI"
description: "Reproduzierbare Befehle, Buildgrenzen und tatsächlich verfügbare CLI-Funktionen."
audience: "engineering"
tags: ["fluidkit", "development-cli"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-02T09:42:16.028412Z"}
stale_after: "2026-12-02T00:00:00Z"
sources: [{"id": "implementation", "resource": "assets/source-inventory.json", "title": "Geprüfter Implementierungsstand"}]
---

# Lokaler Start

```sh
npm ci
npm run dev -w @fluidkit/studio -- --port 3010
```

Die dokumentierte lokale Basis ist Node 24.18.1, TypeScript 6.0.3, Next.js 16.4.6,
React 19.2.9, Three 0.187.0, XState 5.33.3 und Zod 4.6.7. Der Zielplan nennt teils
neuere Versionen; diese sind nicht automatisch die installierte Grundlage.
`package-lock.json` ist für den Clean Install maßgeblich.[^implementation]

```sh
npm run check
npm run docs:update
npm run check:acceptance
npm run check:plan
npm run check:flows
npm run build
npm run start -w @fluidkit/studio -- --port 3010
```

`check` führt Typecheck, ESLint und Tests aus. Der Typecheck baut vorher die GPU-
Kernels und erzeugt die statischen Designartefakte. `build` baut Pakete und Studio;
eine laufende Produktionsinstanz benötigt nach einem neuen Build einen Neustart.
`quality:gate` bündelt lokale Gates, ersetzt aber nicht `check:release` oder eine
Hardware-/Accessibility-Freigabe.

## Aktuelle CLI

```sh
npm run fluid -- validate project.json
npm run fluid -- test project.json
```

Die JSON-Datei muss `ProjectSchema` erfüllen. `validate` prüft das Projekt und
meldet die Flowzahl. `test` führt deklarierte Szenarien auf passendem Flow aus und
liefert Snapshot, Trace und Fehler. Keine Szenarien oder ein Fehlschlag ergeben
einen Fehlerexit. Die geplanten Kommandos `init`, `add`, `studio` und `export`
sind noch nicht implementiert.

## Knowledge-Werkzeuge

`knowledge:sync` erzeugt Inventare, API-/Schema-Referenzen und Indexe nach bewusster
Quellenreview. `knowledge:check` liest und prüft ohne stilles Rebinding.
`knowledge:build` erzeugt lokale HTML-Handbücher aus denselben Markdown-Dateien.
`knowledge:export` erstellt getrennte portable Archive. `knowledge:serve` dient
nur einer read-only Loopbackvorschau einer ausdrücklich ausgewählten Audience.
[Knowledgepflege](knowledge-maintenance.md) beschreibt den Änderungsprozess.

[^implementation]: Implementierung und SHA-256-Dateibindung im Quellinventar.
