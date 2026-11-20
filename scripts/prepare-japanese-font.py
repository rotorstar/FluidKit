"""Rebuild licensed static subset; run with uv run --python 3.14 --with fonttools==4.68.0 python scripts/prepare-japanese-font.py."""
import hashlib
import json
from pathlib import Path
import fontTools
from fontTools import subset
from fontTools.ttLib import TTFont

if fontTools.version != '4.68.0':
    raise RuntimeError('Use pinned fontTools==4.68.0')
config = json.loads(Path('font-bake.config.json').read_text())
entry = next(font for font in config['fonts'] if font['id'] == 'noto-sans-jp-subset')
source = Path(entry['originalInput'])
if hashlib.sha256(source.read_bytes()).hexdigest() != entry['originalSha256']:
    raise RuntimeError('Original font hash mismatch')
points = set()
for token in entry['unicodes'].split(','):
    parts = token.removeprefix('U+').split('-')
    start, end = int(parts[0], 16), int(parts[-1], 16)
    points.update(range(start, end + 1))
font = TTFont(source, recalcTimestamp=False)
options = subset.Options()
options.recalc_timestamp = False
options.name_IDs = ['*']
options.name_legacy = True
options.name_languages = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=points)
subsetter.subset(font)
font.save(entry['input'], reorderTables=True)
print(json.dumps({'input': entry['input'], 'sha256': hashlib.sha256(Path(entry['input']).read_bytes()).hexdigest(),
                  'bytes': Path(entry['input']).stat().st_size, 'mappedCodepoints': len(font.getBestCmap()),
                  'requestedCodepoints': len(points)}, indent=2))
