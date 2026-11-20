# Fluid Japanese fallback font

Original: Noto Sans JP Regular, release **Sans2.004**, Copyright © 2014–2021 Adobe. Distributed under [SIL OFL 1.1](OFL.txt). Original and generated font remain under that license.

[Official original source](https://raw.githubusercontent.com/notofonts/noto-cjk/Sans2.004/Sans/SubsetOTF/JP/NotoSansJP-Regular.otf) · [Official license](https://raw.githubusercontent.com/notofonts/noto-cjk/Sans2.004/LICENSE).

`NotoSansJP-Regular.otf` is the unmodified 4,533,028-byte official static Japanese OTF. `fluid-japanese-subset.otf` is a 121,680-byte offline subset preserving its native outlines and shaping features. Original and prepared input hashes are pinned in `font-bake.config.json`. The application serves only `apps/studio/public/fonts/noto-sans-jp-subset.font.glb` (4,114,264 bytes) and its license, not the original font.

The declared coverage is 512 mapped codepoints: Japanese punctuation, hiragana, katakana, fullwidth/halfwidth forms, and the explicit Han corpus in the config. Shaping closure retains 783 glyphs. This is not complete Japanese, Chinese or Korean coverage and does not promise emoji/vertical text. The current scene text audit reports unsupported glyphs; input content is never rewritten. Japanese regional Han forms are intentional.

## Reproduction

Normal builds use the prepared, hash-verified input:

```sh
npm run build:font
npm run check:font
```

To regenerate the prepared input, use Python 3.11+ and exactly FontTools 4.68.0 (the pinned tooling is build-time only). One isolated invocation:

```sh
uv run --python 3.14 --with fonttools==4.68.0 python scripts/prepare-japanese-font.py
```

The script checks the original hash, subsets the configured Unicode set and prints the new prepared hash. The checked-in hash must match before the next bake; a coverage or tooling change requires explicit review. Glyph 0.1's built-in `--unicodes` preparation drops this source's CFF outlines; the external preparation avoids that unsupported path. The prepared static OTF is baked without a second Unicode subset.

The Japanese MSDF uses `em-size=32,pixel-range=6`; the matching runtime fallback request must use those same options. Inter remains primary with its original raster and metrics. Fallback Text owners in the runtime are empty and unattached, solely holding public Glyph Font leases for `createFontStack` until all rendered text has been disposed.
