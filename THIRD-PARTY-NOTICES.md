# Third-party notices

FluidKit Pro's original source code and accompanying project documentation use the [MIT License](LICENSE). The following materials retain their own licenses and copyright notices.

| Material | Distribution and notice |
|---|---|
| Inter | The source in `apps/studio/public/fonts/inter.ttf`, its GPU font atlas and the offline readers' Inter fonts use SIL Open Font License 1.1. The font copyright belongs to the Inter Project Authors. [Included license](apps/studio/public/fonts/OFL.txt) · [Inter project](https://rsms.me/inter/) |
| Noto Sans JP | The original font is from Noto CJK Sans 2.004, copyright Adobe. The prepared subset and GPU atlas retain SIL Open Font License 1.1. The preparation recipe records the upstream URL, input hashes and coverage. [Font provenance](assets/fonts/noto-sans-jp/README.md) · [Included license](assets/fonts/noto-sans-jp/OFL.txt) |
| Noto Sans Arabic | The Noto Project Authors license this font under SIL Open Font License 1.1. FluidKit uses it for the bidirectional-text pilot. The [font configuration](font-bake.config.json) records the source revision, SHA-256 and character range. [Included license](assets/fonts/noto-sans-arabic/OFL.txt) · [Upstream project](https://github.com/notofonts/noto-fonts/tree/6cfca385c8757fadf537923d59a671116a865d48/hinted/ttf/NotoSansArabic) |
| Offline handbook reader | Building a reader writes the dependency license texts beside its JavaScript in `assets/THIRD-PARTY-NOTICES.txt` and the font license in `assets/FONT-LICENSE.txt`. Keep these files alongside any redistributed reader. [Engineering reader notices](knowledge/engineering/assets/THIRD-PARTY-NOTICES.txt) · [User guide reader notices](knowledge/public/assets/THIRD-PARTY-NOTICES.txt) |

The public source snapshot contains npm manifests and a lockfile. Installing dependencies retrieves the individual packages under their published terms. For example, Three.js, TypeGPU and Glyph use MIT, the Vercel AI SDK uses Apache-2.0, and `intl-messageformat` 12.2.0 uses BSD-3-Clause. Its FormatJS ICU parsers and memoization helper in this lockfile use MIT. Builds redistributed as application bundles or native binaries need the notices for the packages they actually contain. Some optional image-processing distributions include libvips under LGPL-3.0-or-later.

The supplied real-estate, commerce and travel datasets identify themselves as synthetic simulations. Data, fonts, artwork and provider outputs supplied by a host keep their own provenance and permissions. Project screenshots selected for the public snapshot show FluidKit's own interface.
