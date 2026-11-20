"""Regression checks for source distribution boundaries and evidence projection."""
import hashlib
import importlib.util
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

ROOT = Path(__file__).resolve().parents[2]


def load_module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts/release' / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


release = load_module('public_source', 'public-source.py')
audit = load_module('audit_history', 'audit-history.py')


class PublicSourceTests(unittest.TestCase):
    def test_examples_and_local_credentials(self):
        self.assertFalse(audit.is_sensitive_filename(b'.env.example'))
        for name in [b'app/.env.production', b'cache.sqlite-wal', b'id_ed25519', b'.npmrc']:
            self.assertTrue(audit.is_sensitive_filename(name))
        with self.assertRaisesRegex(ValueError, 'empty credential values'):
            release.protect_text('.env.example', b'OPENAI_API_KEY=example', {}, audit.PATTERNS)
        with self.assertRaisesRegex(ValueError, 'authenticated-url'):
            release.protect_text('README.md', b'postgres://' + b'account:example@host', {}, audit.PATTERNS)
        for data in [b'/Users/' + b'alice/project', b'C:' + bytes([92]) + b'Users' + bytes([92]) + b'Alice']:
            with self.assertRaisesRegex(ValueError, 'workstation-path'):
                release.protect_text('README.md', data, {}, audit.PATTERNS)

    def test_evidence_tracks_only_matching_exported_bytes(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            ledger_file = root / 'docs/acceptance/ledger.json'
            ledger_file.parent.mkdir(parents=True)
            (root / 'fixture.json').write_bytes(b'{}')
            correct = hashlib.sha256(b'{}').hexdigest()
            evidence = [
                {'path': 'fixture.json', 'sha256': correct},
                {'path': 'fixture.json', 'sha256': '0' * 64},
                {'path': 'missing.json', 'sha256': correct},
            ]
            release.write_json(ledger_file, {'criteria': [
                {'status': 'verified', 'evidence': evidence},
                {'status': 'verified', 'evidence': evidence[:1]},
            ]})
            self.assertEqual(release.project_ledger(root), 1)
            limited, retained = json.loads(ledger_file.read_bytes())['criteria']
            self.assertEqual(limited['status'], 'partial')
            self.assertEqual(limited['evidence'], evidence[:1])
            self.assertEqual(retained['status'], 'verified')

    def test_links_and_archive_are_reproducible(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            tree = root / 'source'
            tree.mkdir()
            for missing in ['[Missing](missing.png)', '<img src="missing.png" alt="Screenshot">']:
                (tree / 'README.md').write_text(missing, encoding='utf-8')
                with self.assertRaisesRegex(ValueError, 'Broken public README link'):
                    release.check_readme(tree)
            (tree / 'README.md').write_text('[Guide](guide.md) [Site](https://example.org)', encoding='utf-8')
            (tree / 'guide.md').write_text('Guide', encoding='utf-8')
            release.check_readme(tree)
            first, second = root / 'first.zip', root / 'second.zip'
            release.write_archive(first, tree, 1700000000)
            release.write_archive(second, tree, 1700000000)
            self.assertEqual(first.read_bytes(), second.read_bytes())
