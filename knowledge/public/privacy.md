---
type: "Privacy Guide"
title: "Daten, Freigabe und Datenschutz"
description: "Lokale Daten von bewusst gesendeten AI-Bildern und Exporten unterscheiden."
audience: "public"
tags: ["fluidkit", "privacy"]
status: "draft"
generated: {"by": "codex/fluidkit-knowledge-v1", "at": "2026-11-20T10:36:00Z"}
stale_after: "2026-12-04T00:00:00Z"
sources: [{"id": "product", "resource": "assets/product-facts.json", "title": "Dokumentierter Produktstand und Screenshotnachweise"}]
---

# Was lokal bleibt

Normale Workspace-Suche, Sortierung, Ansichtswahl und Effektbedienung benötigen
keinen Cloud-Modellaufruf. Der Workspace verwendet den bereitgestellten lokalen
Modulbestand. Die Praxisfälle sind als Simulation gekennzeichnet.[^product]

Suchtext und Entwürfe werden nicht in den beschriebenen URLs gespeichert.
URLs können Ansicht, Modul-/Angebotsauswahl, Vergleich und Sortierung enthalten.
Teile solche Links nur im passenden Projektkontext.

## Wann Bilder gesendet werden

Die AI-Analyse sendet erst nach deiner ausdrücklichen Auswahl und Freigabe die
gewählten sichtbaren Pixel, den Story-Brief und begrenzte Metadaten. Kontrolliere
vorher Provider, Bildauswahl und Inhalt. Ein Screenshot kann Informationen zeigen,
die als Pixel nicht von einer Textfilterregel erkannt werden.

Sensible Scene-Parts verhindern die Aufnahme im aktuellen Produkt. Eine allgemeine
pixelgenaue Maskierung ist noch nicht vollständig qualifiziert. Die Provideroption
`store:false` darf nicht als allgemeine Zusage interpretiert werden, dass der
Anbieter unter allen Bedingungen keinerlei Daten verarbeitet oder aufbewahrt.

Die M7-Prüfwerkstatt untersucht diese Grenze mit einem ausdrücklich synthetischen
vertraulichen Text. Sie prüft auch Übergänge zu öffentlichen Inhalten und erneute
Unterbrechungen: Noch sichtbare oder aufgezeichnete private Quellreste dürfen
nicht durch einen neuen öffentlichen Zielzustand freigegeben werden. Der Bericht
benennt, ob die Aufnahme blockiert und der strukturierte Export redigiert wurde.
Die Testinhalte sind keine persönlichen Daten und werden nicht zur AI-Analyse gesendet.

## Exporte weitergeben

Ein Rehearsal-Run kann vollständige ausgewählte Bildpixel enthalten. Ein AI-Review
enthält Beobachtungen, Herkunft, Usage und eigene Begründungen. Kontrolliere diese
Dateien vor der Weitergabe. Keys, Cookies und CSRF-Tokens sind keine Exportinhalte.
Die Verwaltung des API-Keys erfolgt ausschließlich auf dem Server.

Explizit gespeicherte Entwurfsversionen, freigegebene Reviewbilder und das gemeinsame AI-Budget liegen in der lokalen Studio-Datenbank. Auch nach einem Neustart lassen sich gespeicherte Versionen wieder öffnen. Der Betreiber legt Aufbewahrung und Zugriff auf diesen Projektordner fest. Dieses Handbuch selbst führt
keine Telemetrie, Anmeldung oder automatische AI-Analyse aus.

[^product]: Produktstand, tatsächliche Aufnahmerouten und Einschränkungen im Fakten-/Bildregister.
