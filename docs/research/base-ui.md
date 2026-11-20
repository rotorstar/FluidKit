# Base UI als Referenz für Fluid

Recherche: 1. November 2026. Produktbasis: Veröffentlichungen bis 31. Oktober 2026.
Gemeint ist laut Nutzer **base-ui.com / @base-ui/react**, nicht Ubers `baseui`.

## Was Base UI definiert

Base UI verbindet Verhalten und zugängliche DOM-Semantik mit offenen, benannten
Komponententeilen. Es liefert keine visuelle Designsprache und keine universelle
rendererunabhängige Zustandsmaschine. Ein Root organisiert einen Komponentenverbund;
Trigger, Control, Label, Popup, Indicator und andere Teile haben explizite Aufgaben.
Die konkrete Anatomy ist komponentenspezifisch. Eine Oberfläche entsteht durch
Zusammensetzen dieser Teile und eigene Gestaltung.
[Überblick](https://base-ui.com/react/overview/about),
[Dialog-Anatomy](https://base-ui.com/react/components/dialog).

Das `render`-Prop kann Elemente und Verhalten auf demselben DOM-Knoten zusammensetzen.
Refs und empfangene Props müssen zum DOM-Element weitergereicht werden. Dies ist
keine Schnittstelle, um DOM durch Three.js-Meshes zu ersetzen. Für Fluid folgt daraus:
Kompositionsidee übernehmen, einen eigenen Part-Vertrag definieren und für die
GPU-Runtime weder HTMLElement-Refs noch React-DOM-Hooks in den Core importieren.
[Komposition](https://base-ui.com/react/handbook/composition),
[useRender](https://base-ui.com/react/utils/use-render).

Kontrollierte Werte werden von außen geliefert. Change-Callbacks liefern zusätzlich
den Grund und erlauben synchrones Abbrechen. Ein programmatischer Zustandwechsel
ist nicht automatisch ein Click oder ein Auftrag zu einer fachlichen Mutation.
Fluid übernimmt kontrollierte Werte, explizite Änderungsgründe und ein Cancel vor
dem Commit; serialisierbare Runtime-Events enthalten keine nativen DOM-Eventobjekte.
[Customization](https://base-ui.com/react/handbook/customization).

States werden für Gestaltung zugänglich gemacht, etwa über Zustandsattribute und
State-Funktionen. Diese sind keine zweite fachliche Wahrheit. Fluid stellt dieselben
Behavior-Zustände als typisierte GPU-Projektionsdaten bereit; das DOM-Studio nutzt
die echten Base-UI-Zustandsattribute.
[Styling](https://base-ui.com/react/handbook/styling).

Öffnen/Schließen und Mount/Unmount sind unterschiedliche Lebenszyklen. Exit-Animationen
können eine präsentative Instanz länger behalten; ein abgebrochener Übergang muss
vom aktuellen Bild fortlaufen. Fluid trennt fachlichen Commit von Präsentation und
Ressourcenfreigabe. Die erste Surface weist Übergangsphase und -dauer aus;
komplexe Popup-Presence bleibt ein separates späteres Gate.
[Animation](https://base-ui.com/react/handbook/animation).

Fokus, Tastatur, Naming und Formbeziehungen gehören zum Komponentenverhalten.
Gestaltung muss Fokus und Kontrast zusätzlich sichtbar machen. Fluid kann nicht
die Testabdeckung einer DOM-Bibliothek für seinen GPU-Adapter beanspruchen.
Die unsichtbare Brücke muss einzeln mit GPU-Bounds und realen Eingaben geprüft werden.
[Accessibility](https://base-ui.com/react/overview/accessibility),
[Fields](https://base-ui.com/react/components/field),
[Forms](https://base-ui.com/react/handbook/forms).

## Übernahmematrix

| Konzept | Studio | GPU-Runtime | Gate |
|---|---|---|---|
| Button, Tabs, Dialog | Direkt verwenden | Explizite Behavior-/Part-Verträge | Keyboard + Fokus + Pointer |
| Kontrollierte Werte | Base-UI-Props | Core-Wert + Änderungsrequest | Kein geteilter Value-State |
| Reason und Cancel | Native Base-UI-Callbacks | Eigener serialisierbarer Vertrag | Cancel vor Commit |
| State Styling | Zustandsattribute | Typisierte Projektionsflags | Kein Ableiten von Fachstate aus Farbe |
| Popup Positioning | Base UI/Floating UI | Eigene GPU-Layer und Bounds | Spätere Popup-Conformance |
| Presence | Base-UI-Lifecycle | Eigene Transition-/Resource-Phasen | Interruption + Reduced Motion |
| Input/IME | Native DOM-Controls | Native transparente Eingabebrücke | Manuelle IME-Prüfung offen |
| `render`, `useRender` | Direkt bei Bedarf | Keine direkte Übernahme | Keine DOM-Abhängigkeit im Core |

## Version und Auswahl

`@base-ui/react@1.9.0`, veröffentlicht am 9. Oktober 2026, MIT, unterstützt React
17/18/19. Die vorhandene React-19.2.9-Linie erfüllt den Vertrag. Die Recherche ist
kein Anlass, React/Glyph nochmals zu aktualisieren.
[Release](https://base-ui.com/react/overview/releases/v1-9-0),
[offizielle Paketmetadaten](https://registry.npmjs.org/@base-ui%2freact/1.9.0).

Die Scored-Optionen stehen reproduzierbar in
[base-ui-scores.json](../decisions/base-ui-scores.json). Gewinner: direkte Nutzung
im DOM-Studio, Übernahme der Verhaltens-/Anatomy-Konzepte für eigene GPU-Controls.

## Grenzen der Recherche

Dokumentierte Zugänglichkeit ist kein Ersatz für den eigenen Browsernachweis.
Base-UI-interne Hooks werden nicht als stabile Headless-API kopiert. Preview-Features
aus 1.9.0 werden für M1 nicht benötigt. Komplexe Controls erhalten erst nach ihrem
eigenen Conformance-Nachweis einen produktiven Status.
