---
type: "User Guide"
title: "Farben und Erscheinungsbild"
description: "Acht Paletten, eine eigene Akzentfarbe und unveränderte Workspace-Daten."
audience: "public"
tags: ["fluidkit", "appearance", "colors"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-14T05:54:00Z"}
stale_after: "2026-12-14T00:00:00Z"
sources: [{"id": "product", "resource": "assets/product-facts.json", "title": "Dokumentierter Produktstand"}]
---

# Eine Oberfläche, deine Farben

Fluid startet mit einer blauen Palette. Die Farbsteuerung am oberen Rand gilt für
Studio und die verbundenen Live-Workspaces. Zur Auswahl stehen **Blau, Indigo,
Violett, Cyan, Türkis, Rosé, Bernstein und Graphit**. Auswahl, Sortierung, Eingaben
und URL bleiben beim Farbwechsel erhalten.[^product]

Die [aktuellen Aufnahmen von Flow, Vergleich und Atlas](perspectives.md)
zeigen die blaue Standardpalette auf Desktop und schmaler Fläche. Alle acht
Paletten teilen dieselben Farbrollen; die Bilder sind kein Nachweis jeder
möglichen eigenen Hex-Farbe.

## Eine Palette oder eigene Farbe wählen

1. Öffne die Auswahl **Palette** und wähle eine der acht Varianten.
2. Für eine eigene Farbe verwende **Akzent** oder gib einen vollständigen
   Hex-Wert wie `#2563eb` ein und wähle **Anwenden**.
3. Nach einer eigenen Farbe zeigt die Auswahl **Eigene Farbe**. Eine Palette
   auszuwählen ersetzt diesen individuellen Akzent wieder.

Fluid bewahrt die eingegebene Akzentfarbe. Text, Fokusmarkierung, ausgewählte
Flächen und die dunklen GPU-Flächen werden daraus passend abgeleitet. Deshalb
muss heller Akzenttext auf weißem Hintergrund dunkler erscheinen als die
gewählte Ausgangsfarbe. Das unterstützt auch sehr helle oder dunkle Farben.
Die geprüften Kontrastregeln gelten für diese abgeleiteten Rollen; sie ersetzen
keine vollständige Accessibility-Prüfung aller Oberflächen.

## Was gespeichert wird

Die Farbwahl wird lokal in diesem Browser gespeichert und bei erneutem Öffnen
wiederhergestellt. Andere offene Studio-Tabs können diese Einstellung übernehmen.
Ein ungültiger gespeicherter Wert führt zurück zur blauen Vorgabe. Wenn die lokale
Speicherung gesperrt oder voll ist, bleibt die Auswahl für die Sitzung nutzbar;
die Oberfläche zeigt einen entsprechenden Hinweis. Es werden weder Projektdaten
noch Eingaben in dieser Farbpräferenz gespeichert.

## Live-Ansicht und Aufzeichnung

Ein bewusster Farbwechsel beendet einen laufenden Live-Übergang am fachlich
bereits gültigen Ziel. Er löst keine neue Navigation aus. Eine gespeicherte
Aufzeichnung behält ihre ursprünglichen Farben. Auch eine importierte Vorschau
wird durch die aktuelle Palette nicht umgefärbt; **Live** zeigt anschließend den
aktuellen Workspace in seiner gewählten Palette.

Im Authoring folgt die Standardvariante der globalen Palette. Bestehende
Dokumente behalten dafür intern ihren früheren Schlüssel `forest`. Explizit
gewählte Indigo- und Bernstein-Varianten eines Authoring-Dokuments bleiben
bewusste Dokumententscheidungen.

[^product]: [Dokumentierter Produktstand](assets/product-facts.json)
