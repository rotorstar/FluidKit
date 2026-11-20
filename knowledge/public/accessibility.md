---
type: "User Guide"
title: "Tastatur, Eingabe und Bewegung"
description: "Bedienhilfen nutzen und Grenzen der aktuellen Alpha erkennen."
audience: "public"
tags: ["fluidkit", "accessibility"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-13T10:46:12Z"}
stale_after: "2026-12-13T00:00:00Z"
sources: [{"id": "product", "resource": "assets/product-facts.json", "title": "Dokumentierter Produktstand und Screenshotnachweise"}]
---

# Mit der Tastatur arbeiten

Die sichtbare GPU-Oberfläche besitzt native Eingabe- und Semantikelemente.
Verwende Tab beziehungsweise Umschalt+Tab für den Fokusweg und Enter oder
Leertaste für fokussierte Schalter. Im Suchfeld kannst du wie in einem nativen
Eingabefeld schreiben, auswählen, kopieren und einfügen.[^product]

## Mehrfachauswahl mit der Tastatur

Tab führt in die Auswahlmarkierungen der sichtbaren Module. Innerhalb dieser
Gruppe gelten folgende Tasten:

| Taste | Aktion |
|---|---|
| Pfeile | Fokus zum vorherigen oder nächsten sichtbaren Modul |
| Home / End | Fokus zum ersten oder letzten sichtbaren Modul |
| Leertaste | fokussiertes Modul markieren oder abwählen |
| Umschalt + Pfeil beziehungsweise Home/End | zusammenhängenden Bereich auswählen |
| Ctrl+A / Cmd+A | sichtbare Module auswählen |
| Buchstaben | zum passenden Modulnamen springen, ohne ihn auszuwählen |

Die Bereichsauswahl folgt der aktuellen Sortierung und dem Filter. Kurze
aufeinanderfolgende Buchstaben bilden einen Namenanfang; nach einer Pause beginnt
eine neue Suche. Erneutes Drücken desselben Buchstabens kann passende Namen
durchlaufen. Ein Fokuswechsel allein öffnet kein Moduldetail.

Der „Details“-Bereich der Auswahl ist nichtmodal. Escape beziehungsweise sein
Schließen-Control schließt ihn und führt zu „Details“ zurück. Bei einer bewusst
gewählten anderen Studio-Eingabe hat dein neuer Fokus Vorrang. Diese M8-Bedienwege
werden im aktuellen Build geprüft; sie sind keine allgemeine Freigabe für alle
Screenreader oder Eingabegeräte.

## Während der Eingabe

Ein aktives Eingabefeld oder eine laufende Zeichenzusammensetzung darf nicht durch
eine spontane KI-Anpassung umorganisiert werden. Die Anwendung startet im manuellen
Modus. Im Suchfeld bleiben Pfeile, Buchstaben und Ctrl/Cmd+A native Textbedienung.
Während einer laufenden Zeichenzusammensetzung werden die Collection-Kürzel nicht
übernommen. Die Storyführung soll deinen Tastaturfokus nicht übernehmen; eigene
Bedienung in der GPU-Vorschau übernimmt die Führung.

## Eine native Eingabe gezielt protokollieren

Im **„Input & State proof“** gibt es die optionale Beobachtung **„Native Eingabe
beobachten“**. Wähle zuerst den tatsächlich verwendeten **„Eingabe-Prüfkontext“**,
etwa eine native Dead-Key-Komposition oder eine native japanische IME. Ein
ausgewählter Kontext allein bestätigt noch keinen erfolgreichen Test.

Mit **„Eingabe beobachten“** beginnst du die Aufzeichnung. Führe die Eingabe im
Projektfeld aus, wähle **„Beobachtung stoppen“** und danach
**„Eingabeprotokoll exportieren“**. **„Protokoll leeren“** verwirft die erfassten
Metadaten vor einem neuen Versuch. Bestätigung und Abbruch einer Komposition
werden getrennt beurteilt; normale Tastatureingabe ist noch kein IME-Nachweis.

Das Protokoll enthält Längen, Auswahlpositionen und Ereignis-/Schutzzustände,
keine eingegebenen Texte, Tastennamen oder Clipboard-Inhalte. Es wird nicht
automatisch an einen AI-Anbieter gesendet. Prüfe zusätzlich die sichtbare
GPU-Ausgabe und den Fokus: Ein Ereignisprotokoll ersetzt diese Beobachtung nicht.

## Weniger Bewegung

Eine Browser-/Systempräferenz für reduzierte Bewegung wird in der Effektpolicy
berücksichtigt. Sie betrifft die Darstellung, nicht die Funktion. Nutze zusätzlich
Pause und einzelne Schritte, um eine Story in deinem Tempo zu untersuchen.

## Darstellung und Lesbarkeit

Vergrößere bei Bedarf den Browser. Nach einer Größenänderung führe eine alte
Layoutprüfung erneut aus. Bei Replay kann die Originaldarstellung proportional
verkleinert sein; wähle „Live-Ansicht“ für ein neues responsives Layout.

Die aktuelle Alpha hat noch keine vollständige manuelle Freigabe für sämtliche
Screenreader, mobilen Tastaturen, IMEs, Rechts-nach-links-Schriften und CJK-Fälle.

Die am 3. November beobachteten fehlenden japanischen Glyphen wurden mit einem
begrenzten lokalen Fontfallback korrigiert. Die konkrete Probe
„M7 — Grüße 東京“ und überlanger Text sind in den dokumentierten Aufnahmen vom
4. November sichtbar; Auswahl und Caret bleiben im Eingabebereich. Der
Fontumfang ist ausdrücklich begrenzt und deckt nicht alle CJK-Zeichen oder Emojis
ab. Fehlende Zeichen werden diagnostiziert; der vollständige Feldwert bleibt
erhalten. Sichtbare Glyphen und native IME-Bedienung sind verschiedene Nachweise.
Ein vorhandenes natives Element oder ein grüner Semantikcheck allein ist keine
solche Freigabe. Melde konkrete Bedienhindernisse mit Browser, Betriebssystem,
Ansicht und reproduzierbaren Schritten über den vereinbarten Projektkanal.

[^product]: Produktstand, tatsächliche Aufnahmerouten und Einschränkungen im Fakten-/Bildregister.
