# Arabic bidirectional text pilot

The mixed paragraph `مرحبا (webgpu 123) بالعالم` exercises two writing directions, paired punctuation and digit clusters in one editable line. The test shapes it with Glyph using the bundled Inter face and the static Noto Sans Arabic Regular fallback. It checks glyph coverage, selection rectangles and caret geometry. The studio’s three interface languages use the regular production font stack.

The checked-in source is the upstream Regular font. The font bake configuration pins its revision, SHA-256, test corpus and MSDF parameters. Run `npm run build:font` to rebuild the pilot atlas or `npm run check:font` to verify it. [Upstream font](https://github.com/notofonts/noto-fonts/tree/6cfca385c8757fadf537923d59a671116a865d48/hinted/ttf/NotoSansArabic) · [SIL Open Font License](OFL.txt)
