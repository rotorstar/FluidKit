---
type: "User Guide"
title: "Warum Fluid UI? Nutzen und Grenzen"
description: "Orientierung, passende Ansichten und verständliche Übergänge; Grafik, Zukunft und Content-Schutz verständlich eingeordnet."
audience: "public"
tags: ["fluidkit", "usability", "rationale", "webgpu"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-23T10:37:01Z"}
stale_after: "2026-12-02T00:00:00Z"
sources: [{"id": "product", "resource": "assets/product-facts.json", "title": "Dokumentierter Alpha-Stand"}, {"id": "transitions", "resource": "https://idl.uw.edu/papers/animated-transitions", "title": "Forschung zu sinnvoll gestalteten Übergängen"}]
---

# Warum Fluid UI?

**FluidKit passt die Oberfläche an das an, was du gerade tun möchtest.** Beim Stöbern helfen einzelne Karten. Sobald du zwei Angebote gegeneinander abwägst, hilft ein Vergleich, in dem jede Eigenschaft in derselben Zeile steht. Die beiden Karten können sich in Vergleichsspalten verwandeln und ihren Inhalt mitnehmen. Den Anstoß kannst du selbst geben. Im Modul-Workspace kann FluidKit ihn auch aus deinem Verhalten ableiten und dir den Wechsel anbieten.

## Den Vergleich aus deinem Verhalten vorschlagen lassen

1. Schalte im Workspace die **Intent-Assistenz** ein. Beim Öffnen der Seite ist sie aus.
2. Öffne das Moduldetail von `core`, gehe zur Tabelle zurück und öffne `webgpu`. Wiederhole die beiden Besuche in derselben Reihenfolge. Die Auswahlkästchen dienen der manuellen Mehrfachauswahl.
3. Öffne die Erklärung beim Vorschlag. Du kannst sehen, aus welchen Detailbesuchen FluidKit auf einen möglichen Vergleich schließt.
4. Wähle **Module vergleichen**. Der Workspace verwandelt sich in den Vergleich mit beiden Modulnamen als Spalten. Wenn du nur etwas nachschlagen möchtest, wähle **Verwerfen**. Die Assistenz pausiert ihre Vorschläge für zwei Minuten.

![Im englischen Workspace bietet die Intent-Assistenz nach wiederholten Besuchen von core und webgpu deren Vergleich an.](assets/workspace-intent-offer-en.png)

Bei uneindeutigem Verlauf oder aktiver Texteingabe bleibt die Ansicht ruhig. Der Verlauf gehört zur laufenden Sitzung. Für diesen Vorschlag brauchst du weder einen Chat noch einen API-Key. Ob solche Angebote auch anderen Menschen bei ihren Aufgaben helfen, muss mit echten Nutzungssitzungen geprüft werden. [Version und Grenzen](version-status.md)

## Welche Usability-Vorteile das bringen kann

| Nutzen | Was du davon merkst |
|---|---|
| Orientierung behalten | Ein ausgewähltes Objekt bleibt beim Sortieren oder Ansichtswechsel wiedererkennbar. Du kannst verfolgen, wo es wieder auftaucht. |
| Änderungen verstehen | Ein passender Übergang zeigt, was sich durch deine Aktion verändert hat und welche Elemente zusammengehören. |
| Komplexität passend entfalten | Du beginnst mit einer Übersicht und öffnest weitere Informationen bei Bedarf. Häufige Aufgaben sollen direkt erreichbar bleiben. |
| Aufgabengerecht arbeiten | Du wählst die Ansicht, die zu deinem nächsten Schritt passt. Filter und Auswahl müssen dafür nicht immer neu aufgebaut werden. |
| Vertraute Gestaltung erleben | Wiederkehrende Formen und Bewegungen können dem Produkt eine eigene, konsistente Sprache geben. |

Die Grundlagen heißen unter anderem
[Objektkontinuität](https://bost.ocks.org/mike/constancy/) und
[Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/).
[Kontrollierte Studien zu Datenvisualisierungen](https://idl.uw.edu/papers/animated-transitions)
zeigen Vorteile sinnvoll gestalteter Übergänge in den untersuchten Aufgaben.
FluidKit nutzt diese Prinzipien als Gestaltungsgrundlage. Ob deine Arbeit dadurch
schneller oder fehlerärmer wird, muss an konkreten Aufgaben geprüft werden.

```mermaid
flowchart LR
    Select["Objekt auswählen"] --> View["Passende Ansicht öffnen"]
    View --> Recognize["Auswahl wiedererkennen"]
    Recognize --> Work["Im gleichen Kontext weiterarbeiten"]
```

## Eine kurze Übung

1. Wähle im Workspace ein Modul in der Tabelle aus.
2. Ändere die Sortierung und suche deine Auswahl wieder.
3. Öffne Karten und anschließend die Map. Prüfe, ob du dasselbe Modul erkennst.
4. Öffne das Detail und kehre zur Übersicht zurück.

**Erwartung:** Datenidentität und Auswahl verbinden die Ansichten. Eine zusätzliche
Bewegung ist optional. Stelle den Effekt auf „Aus“ oder nutze reduzierte Bewegung,
wenn dir das beim Arbeiten hilft. [Ansichten](views.md), [Sortieren](sorting-search.md)
und [Effekte](effects.md) erklären die konkreten Bedienelemente.

![Tatsächliche Workspace-Tabelle als Ausgangspunkt für verbundene Ansichten](assets/workspace-table.jpg)

## Warum dafür GPU-Grafik?

Eine gemeinsame Grafikszene gibt den Entwicklern Spielraum für zusammenhängende
Übergänge, weiche Formen, Masken, Tiefe und besondere Materialien. So können
Bedienelemente, Datenansichten und interaktive Grafiken eine gemeinsame visuelle
Erfahrung bilden. Three.js liefert Bausteine dafür; WebGPU eröffnet außerdem
parallele Berechnungen, etwa für spätere Simulationen.
[WebGPU](https://www.w3.org/TR/webgpu/),
[Three.js](https://threejs.org/manual/pages/webgpurenderer).

Auch normale Webseiten können flüssig animieren. Grafiktechnik allein garantiert
keine bessere Bedienung oder höhere Geschwindigkeit. Für dich zählen eine
verständliche Aufgabe, lesbare Inhalte, direkte Reaktion und Kontrolle über die
Darstellung. [Qualität](quality.md) erklärt, wie diese Aspekte geprüft werden.

## Browser und Zukunft

WebGPU wird inzwischen in Chrome/Edge, Safari und Firefox ausgeliefert.
Betriebssystem, GPU und Treiber bestimmen mit, welche Kombination tatsächlich
funktioniert. Das Studio zeigt deshalb oberhalb der Arbeitsfläche „WebGPU aktiv“
oder einen ausdrücklich gekennzeichneten WebGL2-Fallback an.
[Offizieller Plattformstand, recherchiert am 2. November 2026](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status).

Mit wachsender Geräteabdeckung und leistungsfähigeren GPUs können zusätzliche
Darstellungen und Berechnungen sinnvoll werden. Lokale AI-Modelle sind eine weitere
Perspektive: [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html)
unterstützt WebGPU bereits. Im aktuellen Studio werden freigegebene Analysebilder
jedoch an den angegebenen Cloudanbieter gesendet. Eine lokale Modelloption ist
kein bereits verfügbares Bedienfeature.

## Bleiben Inhalte vor Kopieren geschützt?

**WebGPU ist kein Kopierschutz.** Eine reine Pixelansicht gibt einfachen
DOM-Scrapern weniger direkt kopierbares Darstellungs-Markup. Das schützt aber
keine bereits ausgelieferten Daten: Bilder können aufgenommen, Texte per
[OCR](https://docs.cloud.google.com/vision/docs/ocr) gelesen und
[Netzwerkantworten](https://developer.chrome.com/docs/devtools/network/) untersucht werden.
Eine messbare Schutzwirkung für FluidKit wurde nicht nachgewiesen.

Die Anwendung erschließt Rollen, Labels und Werte absichtlich für assistive
Werkzeuge. Diese Zugänglichkeit soll erhalten bleiben. Zugriffsschutz und die
bewusste Freigabe von Daten sind eigene Aufgaben. Die
[Datenschutzhinweise](privacy.md) erklären insbesondere die AI-Bildfreigabe.

## Bewusste Grenzen

| Thema | Was berücksichtigt wird |
|---|---|
| Accessibility | Tastatur, Fokus, Screenreader, Texteingabe und Zoom benötigen eigene Prüfungen. [Bedienhilfen](accessibility.md) erklärt vorhandene Möglichkeiten und offene Abnahmen. |
| Bewegung | Zusatzeffekte sind optional. Reduzierte Bewegung hilft, wenn Animation ablenkt oder unangenehm ist. |
| Leistung und Akku | Anspruchsvolle Effekte brauchen Gerätebudgets; mehr GPU-Leistung macht sparsame Darstellung weiterhin sinnvoll. Eine pauschale Überlegenheit wird nicht versprochen. |
| Auffindbarkeit im Web | Öffentliche Inhalte brauchen lesbares HTML und echte Links. Die interaktive GPU-Arbeitsfläche kann diese Veröffentlichung ergänzen. |
| Reifegrad | Die Alpha zeigt einen konkreten Ausschnitt. Weitere Widgets, Geräte und Abläufe werden gesondert qualifiziert. |

Der Sinn von Fluid UI ist eine passende, zusammenhängende Arbeitsoberfläche.
Die Effekte helfen dann, wenn sie Orientierung und Verständnis unterstützen.
