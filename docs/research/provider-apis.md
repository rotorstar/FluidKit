# Anbieter-APIs und Simulationsdaten

Recherche: **1. November 2026**, primäre Herstellerdokumentation. Ergänzung zu
M5 aufgrund der ausdrücklichen Freigabe realistischer Mockdateien durch den Nutzer.
Es wurden keine Anbieterzugänge angelegt, Verträge akzeptiert oder Live-Buchungen
angefordert. Ein dokumentierter Endpunkt ist noch keine getestete Integration.

| Domäne / Anbieter | Eignung und Zugang | Vertrag / Integrationsfolge |
|---|---|---|
| Immobilien: ImmoScout24 | Große deutsche Plattform; Geschäftskonto, freigeschaltetes Produkt und produktive Berechtigung erforderlich. Sandbox ist kein freier Zugriff auf alle Bestände. | OAuth 1.0a; App- und Nutzerautorisierung unterscheiden. Nur freigegebene Bestände/Partner-Suche verwenden. |
| Immobilien: onOffice | Alternative für den eigenen Maklerbestand; Immobilien- und weitere Geschäftsdaten. API-Modul ist kostenpflichtig. | Stabiles API-Gateway, eigenes Normalisierungspaket statt fremdes Datenmodell im Core. |
| Commerce: Shopify | Storefront API für Katalog, Varianten, Warenkorb und Checkout-Übergabe; echter freigegebener Store benötigt. | Aktuell 2026-10. GraphQL-Queries sind ebenfalls POST; lesende Berechtigung wird fachlich definiert. Cart-Mutationen gehören in Action-Adapter. |
| Commerce: commercetools | Geeignet für Host-Kataloge mit Projektrechten; Produkte/Varianten und projizierte Storefront-Daten. | OAuth-Scopes einschränken; Product Projection/Search für Käuferansichten qualifizieren. |
| Reise: Amadeus | Flug-/Hotelangebote; Self-Service hat Inhalts- und Zugangsbeschränkungen. Flugbuchung/Ticketing benötigt zusätzliche Voraussetzungen. | Search → Price → Order; Suchpreis allein beweist weder gültige Quote noch Buchung. |
| Reise: Booking.com Demand | Unterkunftssuche und Buchungsprozesse für freigeschaltete Managed Affiliates mit Vertrag, API-Key und Affiliate-ID. | **3.3 stabil**, 3.2 eingefroren. Auch lesende Endpunkte verwenden POST. Sandbox deckt nicht jedes Produkt ab. |
| Reise: Expedia Rapid | Unterkunftsangebote mit Preis-/Stornierungsdetails; kommerzieller Partnerzugang. | Shopping → Price Check → Booking. Testheader explizit setzen; ein Testkonto allein garantiert keine Testantwort für jede Anfrage. |

Belege: [ImmoScout Zugang](https://api.immobilienscout24.de/api-docs/get-started/get-your-client-credentials/),
[Autorisierung](https://api.immobilienscout24.de/api-docs/authentication/introduction/),
[Suchrechte](https://api.immobilienscout24.de/api-docs/faq/),
[onOffice API](https://apidoc.onoffice.de/),
[Shopify Storefront](https://shopify.dev/docs/api/storefront/latest),
[Cart-Vertrag](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage),
[commercetools Produkte](https://docs.commercetools.com/api/projects/products),
[Amadeus Grenzen](https://admin.developers.amadeus.com/self-service/apis-docs/guides/developer-guides/faq/),
[Booking Voraussetzungen](https://developers.booking.com/demand/docs/getting-started/prerequisites),
[Booking Versionen](https://developers.booking.com/demand/docs/open-api/about-api-references),
[Booking 3.3](https://developers.booking.com/demand/docs/open-api/3.3/demand-api),
[Booking Sandbox](https://developers.booking.com/demand/docs/getting-started/sandbox),
[Expedia Shopping](https://developers.expediagroup.com/rapid/lodging/shopping/about-shopping-api),
[Expedia Testverhalten](https://developers.expediagroup.com/rapid/lodging/shopping/rapid-shopping-test-request?locale=en_US).

## Bewertete Umsetzung

Gewichte 30/25/20/15/10, Ratings 1–5 wie im Gesamtplan. Planungsbewertung,
keine Messung der Anbieterqualität oder Zusage einer Partnerschaft.

| Option | Ratings | Score | Folge |
|---|---|---:|---|
| A: Nur Live-Anbieter bis zur Demo integrieren | 4,4,4,2,3 | 72 | Abhängigkeit von Freischaltung; Fehlerfälle schwer reproduzierbar |
| B: Ausschließlich Mock-Cases bauen | 3,4,5,5,2 | 77 | Gut simulierbar; produktive Datenintegration bleibt unbewiesen |
| H: Gemeinsame validierte Verträge, synthetische Szenarien und gesondert qualifizierte Anbieteradapter | 5,5,5,4,5 | **97** | **Gewinner:** Simulation sofort prüfbar, produktive Gates bleiben sichtbar |

Für den ersten produktiven Anschluss werden ImmoScout24 **oder** der freigegebene
onOffice-Bestand, ein Shopify-Teststore und ein freigeschalteter Amadeus-/Booking-
Zugang empfohlen. Diese Auswahl ist eine fachliche Ableitung aus den dokumentierten
Funktionen und Zugangshürden; sie ist kein Ergebnis eines Live-Vergleichs. Der
konkrete Vertrag und verfügbare Datenbestand entscheiden über die endgültige Wahl.

## Datenherkunft, Zeit und Seiteneffekte

- `packages/cases/src/fixtures/` enthält drei handverfasste synthetische Datensätze
  mit je acht Einträgen. Alle IDs beginnen mit `sim-`; keine Adresse, Verfügbarkeit,
  Bewertung oder Preisangabe wird als echtes Angebot behauptet.
- Immobilien: plausible Mieten, Flächen, Nebenkosten und Kautionen. Commerce:
  Varianten, Bestand einschließlich ausverkaufter Produkte, Steuer und Versand.
  Reise: erfundene Unterkünfte, Reisedaten, Quote und Ablaufzeit.
- Der Szenariozeitpunkt ist `2026-11-01T12:00:00Z`. Replay verwendet diese Uhr;
  Live-Zeit wird nicht benutzt, um historische Simulationsangebote gültig zu machen.
- UI und Exporte zeigen **Simulation · synthetische Daten**. Kein stiller Wechsel
  eines fehlgeschlagenen Live-Adapters auf Mockdaten.
- Produktions-Caches beachten Anbieterbedingungen: insbesondere dynamische
  Reiseangebote erneut prüfen; allgemeine Cache-Optionen sind keine Speichererlaubnis.
  [Booking Produktionshinweise](https://developers.booking.com/demand/docs/development-guide/production-readiness)
- Lesen und fachliche Aktionen sind unterschiedliche Adapter. HTTP-Methode allein
  reicht für diese Entscheidung nicht. Prefetch und Replay führen keine Aktionen aus.
- In-Prozess-Idempotenz ist für Simulation und einen Hostprozess geeignet. Dauerhafte
  produktive Mutationen benötigen den serverseitigen Host-Idempotenzspeicher.

## Abnahme

1. Alle Dateien bestehen dieselben Zod-Verträge wie Adapterergebnisse; doppelte IDs,
   falsche Provenienz und ungültige Datumsbereiche werden abgewiesen.
2. Suche, Sortierung, Verfügbarkeit, Abbruch, überholte Ergebnisse und Revalidation
   werden unabhängig von einem Anbieter getestet.
3. Eine gekennzeichnete Simulation beweist die UI-/State-/Adapterverträge. Sie erfüllt
   kein AC für einen produktiven Anbieterzugang, aktuelle Marktpreise oder echte Buchungen.
4. Jeder Live-Adapter benötigt separat Zugang, Mapping, Nutzungsrechte, Fehler-/Limit-
   Tests, Quote-/Bestandsprüfung und einen überprüfbaren Übergabe- oder Transaktionsnachweis.

## Im UI-Proof gefundene Typografielücke

Der erste Browserlauf zeigte fehlende Euro-Zeichen: `Intl.NumberFormat` erzeugt
korrekte lokalisierte Preise, aber der bisherige gebackene Font enthielt U+20AC
nicht. Der Font wurde aus derselben lizenzierten Inter-Quelldatei mit erweitertem
Unicode-Set neu gebaut. `font-bake.config.json`, `npm run build:font` und
`npm run check:font` machen die Auswahl reproduzierbar. Öffentliche Font-/GPU-
Assets sind nun Teil des Buildhashs, damit ein Assetwechsel keine alten
Qualitätsberichte weiterverwenden kann. Navigationsflächen wurden ebenfalls
nach dem ersten messbaren Befund korrigiert.

API-Basis: installierte Glyph-**0.1.0**-CLI und deren öffentliche Bake-Verträge;
[Glyph Font Baking](https://github.com/pmndrs/glyph#bake-fonts). Die aktuelle
Upstream-Dokumentation enthält bereits neuere APIs; diese Aufgabe löst kein
ungeprüftes Bibliotheksupgrade aus.
