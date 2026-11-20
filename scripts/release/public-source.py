"""Export a fresh FluidKit source tree without the maintainer's Git database or raw captures."""
import argparse
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import importlib.util
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import tempfile
import sys
from urllib.parse import unquote, urlsplit
import zipfile

ROOT = Path(__file__).resolve().parents[2]
POLICY = ROOT / 'scripts/release/public-assets.json'
REQUIRED_FILES = {
    'LICENSE', 'README.md', 'SECURITY.md', 'THIRD-PARTY-NOTICES.md', '.gitattributes', '.gitignore', '.env.example',
    'design-quality.config.json', 'eslint.config.mjs', 'font-bake.config.json',
    'package.json', 'package-lock.json', 'playwright.config.ts', 'tsconfig.json', 'vitest.config.ts',
    'tests/browser/locale-surface/index.html',
}
TEXT = {'.ts','.tsx','.mjs','.js','.css','.json','.md','.txt','.py','.mmd','.svg'}
SOURCE_TREES = {'apps','assets','docs','knowledge','packages','scripts','tests'}
BINARY = {'.png','.jpg','.jpeg','.glb','.ttf','.otf'}
WORKSTATION_LINK = re.compile(r'\[([^\]\n]+)\]\(</(?:Users|home)/[^>\n]+>\)')
MARKDOWN_LINK = re.compile(r'(!?)\[([^\]\n]+)\]\(([^)\s]+)\)')


def digest(data):
    return hashlib.sha256(data).hexdigest()


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')


def git(*args):
    return subprocess.check_output(['git','-C',str(ROOT),*args])


def files_for_export(approved, worktree):
    if not worktree and git('status','--porcelain=v1','--untracked-files=normal'):
        raise ValueError('Working tree has changes. Commit the candidate or use --worktree to build a local preview.')
    options = ['--cached','--others','--exclude-standard'] if worktree else ['--cached']
    members = {}
    for raw in git('ls-files','-z',*options).split(b'\0'):
        if not raw:
            continue
        name = raw.decode('utf-8')
        path = PurePosixPath(name)
        if path.is_absolute() or '..' in path.parts or '\\' in name:
            raise ValueError('Unsupported path in candidate file list')
        if name not in REQUIRED_FILES:
            if path.parts[0] not in SOURCE_TREES or any(part.startswith('.') for part in path.parts):
                continue
            if any(part in ('dist','generated','node_modules','__pycache__') for part in path.parts):
                continue
            if name.startswith(('apps/studio/public/knowledge/','knowledge/exports/')):
                continue
            if path.parts[0] == 'knowledge' and path.name in {'book-build.json','quality-report.json'}:
                # These describe generated readers and the time of a previous local test.
                continue
            if name.startswith('docs/qa/') and name not in approved:
                continue
            if path.suffix not in TEXT:
                if name not in approved:
                    if path.suffix in BINARY:
                        raise ValueError(f'Review this new binary and register its digest: {name}')
                    continue
        source = ROOT/name
        if source.resolve() != source or not source.is_file():
            raise ValueError(f'Only regular source files may be exported: {name}')
        data = source.read_bytes()
        if name in approved and digest(data) != approved[name]:
            raise ValueError(f'Reviewed asset changed: {name}')
        members[name] = data
    absent = (REQUIRED_FILES | set(approved)) - members.keys()
    if absent:
        raise ValueError('Missing required release sources: ' + ', '.join(sorted(absent)))
    return members


def protect_text(name, data, members, patterns):
    text = data.decode('utf-8')
    if name in {'docs/implementation-plan.md','docs/implementation-plan-v1.md'}:
        # Preserve the historical audit, publishing the label in place of a private backup link.
        text = WORKSTATION_LINK.sub(lambda match: match[1], text)
    if name == 'README.md' or (name.endswith('.md') and name.startswith('docs/')):
        def link(match):
            target = match[3].split('#',1)[0]
            if not target or '://' in target:
                return match[0]
            resolved = (ROOT / name).parent.joinpath(target).resolve()
            if not resolved.is_relative_to(ROOT):
                return match[0]
            relative = resolved.relative_to(ROOT).as_posix()
            if relative.startswith(('docs/qa/','archive/')) and relative not in members:
                return match[2] + ' (internes Archiv)'
            return match[0]
        text = MARKDOWN_LINK.sub(link,text)
    data = text.encode('utf-8')
    for key, pattern in patterns.items():
        if pattern.search(data):
            raise ValueError(f'Public boundary check failed ({key}): {name}')
    if name == '.env.example' and re.search(rb'(?m)^[ \t]*(?:\w*KEY|\w*TOKEN|\w*PASSWORD)[ \t]*=[ \t]*[^\r\n\s]', data):
        raise ValueError('Example environment must contain empty credential values')
    return data


def project_ledger(target):
    target = target.resolve()
    ledger_file = target / 'docs/acceptance/ledger.json'
    ledger = json.loads(ledger_file.read_bytes())
    omitted = 0
    for criterion in ledger['criteria']:
        present = []
        for evidence in criterion['evidence']:
            path = (target / evidence['path']).resolve()
            if not path.is_relative_to(target) or not path.is_file() or digest(path.read_bytes()) != evidence['sha256']:
                continue
            present.append(evidence)
        if len(present) != len(criterion['evidence']):
            # An unavailable or changed input cannot certify a clean public checkout.
            omitted += 1
            public_scope = 'Einzelne Belege des historischen Laufs sind separat archiviert.'
            public_check = 'Im öffentlichen Checkout erneut ausführen und den Nachweis an diese Version binden.'
            criterion['scope'] = ' '.join(filter(None, [criterion.get('scope'), public_scope]))
            if criterion['status'] == 'verified':
                criterion['status'] = 'partial'
            criterion['remaining'] = ' '.join(filter(None, [criterion.get('remaining'), public_check]))
        criterion['evidence'] = present
    write_json(ledger_file, ledger)
    return omitted


def check_git_paths(paths):
    names = b'\0'.join(name.encode('utf-8') for name in paths) + b'\0'
    result = subprocess.run(
        ['git', '-C', str(ROOT), '-c', 'core.excludesFile=' + os.devnull,
         'check-ignore', '--no-index', '-z', '--stdin'],
        input=names, stdout=subprocess.PIPE, check=False,
    )
    if result.returncode not in (0, 1):
        raise ValueError('Could not verify Git ignore rules for public files')
    ignored = [name.decode() for name in result.stdout.split(b'\0') if name]
    if ignored:
        raise ValueError('A new Git checkout would omit these public files: ' + ', '.join(ignored))


class ReadmeLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.targets = []

    def handle_starttag(self, tag, attrs):
        attribute = {'img':'src', 'a':'href'}.get(tag)
        target = dict(attrs).get(attribute)
        if target:
            self.targets.append(target)


def check_readme(tree):
    tree = tree.resolve()
    markdown = (tree/'README.md').read_text(encoding='utf-8')
    links = ReadmeLinks()
    links.feed(markdown)
    links.targets.extend(match[3].strip('<>') for match in MARKDOWN_LINK.finditer(markdown))
    for target in links.targets:
        link = urlsplit(target)
        if link.scheme or link.netloc or not link.path:
            continue
        path = (tree/unquote(link.path)).resolve()
        if not path.is_relative_to(tree) or not path.exists():
            raise ValueError(f'Broken public README link: {link.path}')


def write_archive(path, tree, epoch):
    instant = datetime.fromtimestamp(max(int(epoch), 315532800), timezone.utc)
    stamp = (instant.year, instant.month, instant.day, instant.hour, instant.minute, instant.second)
    with zipfile.ZipFile(path, 'x', compression=zipfile.ZIP_DEFLATED) as archive:
        for member in sorted(tree.rglob('*')):
            if member.is_file():
                entry = zipfile.ZipInfo('FluidKit-Pro/' + member.relative_to(tree).as_posix(), stamp)
                entry.create_system = 3
                entry.external_attr = 0o100644 << 16
                archive.writestr(entry,member.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=6)


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('destination',type=Path,help='New directory outside the maintainer checkout')
    cli.add_argument('--worktree',action='store_true',help='Preview scoped worktree changes before a release commit')
    cli.add_argument('--zip',action='store_true',help='Also write a reproducible ZIP beside the new directory')
    args=cli.parse_args()
    target = args.destination.resolve()
    if target.exists() or target.is_relative_to(ROOT) or not target.parent.is_dir():
        raise ValueError('Destination must be new, outside the checkout, and have an existing parent.')
    zip_target = target.with_name(target.name + '.zip')
    if args.zip and zip_target.exists():
        raise ValueError('Destination archive already exists.')
    if not (ROOT/'node_modules/tsx').is_dir():
        raise ValueError('Install maintainer workspace dependencies with npm ci before exporting.')
    audit = importlib.util.spec_from_file_location('audit_history',ROOT/'scripts/release/audit-history.py')
    module = importlib.util.module_from_spec(audit)
    sys.dont_write_bytecode = True
    audit.loader.exec_module(module)
    approved = json.loads(POLICY.read_bytes())
    members = files_for_export(approved,args.worktree)
    source_epoch = os.environ.get('SOURCE_DATE_EPOCH') or git('log','-1','--format=%ct').decode('ascii').strip()
    environment = {**os.environ, 'SOURCE_DATE_EPOCH':source_epoch}
    # Write atomically inside a temporary sibling. Never initialize, copy or push a repository.
    with tempfile.TemporaryDirectory(prefix='.fluid-public-',dir=target.parent) as scratch:
        tree = Path(scratch)/'source'
        tree.mkdir()
        for name, data in members.items():
            p = tree / name
            p.parent.mkdir(parents=True,exist_ok=True)
            if p.suffix not in BINARY:
                data = protect_text(name,data,members,module.PATTERNS)
            p.write_bytes(data)
        # A reviewed Markdown record can lose a private archive link during projection.
        # The public maintainer must be able to verify these exact bytes on a later release.
        write_json(tree / POLICY.relative_to(ROOT), {
            name: digest((tree / name).read_bytes()) for name in sorted(approved)
        })
        check_readme(tree)
        omitted = project_ledger(tree)
        # Rebuild indexes from the actual public files. Use the installed tools only during preparation.
        modules = tree/'node_modules'
        modules.symlink_to(ROOT/'node_modules',target_is_directory=True)
        try:
            for script in ('docs:acceptance','knowledge:sync'):
                subprocess.run(['npm','run',script],cwd=tree,env=environment,check=True)
            # Time-sensitive findings use the actual current time. Do not ship a dated test receipt.
            subprocess.run(['node','--import','tsx','scripts/knowledge/check.ts'],cwd=tree,check=True)
        finally:
            modules.unlink()
        # The public source contains no generated bundles: npm run dev builds the offline handbooks.
        paths = sorted(p for p in tree.rglob('*') if p.is_file())
        if any(p.is_symlink() for p in tree.rglob('*')):
            raise ValueError('Unexpected link in the assembled public source')
        inventory = {}
        for p in paths:
            name = p.relative_to(tree).as_posix()
            data = p.read_bytes()
            if p.suffix not in BINARY:
                for key,pattern in module.PATTERNS.items():
                    if pattern.search(data):
                        raise ValueError(f'Generated release boundary check failed ({key}): {name}')
            inventory[name] = digest(data)
        check_git_paths([*inventory, 'PUBLIC-SOURCE.json'])
        write_json(tree/'PUBLIC-SOURCE.json', {
            'schemaVersion': 1,
            'version': json.loads(members['package.json'])['version'],
            'license': 'MIT',
            'thirdPartyNotices': 'THIRD-PARTY-NOTICES.md',
            'sourceMode': 'working-tree' if args.worktree else 'clean-commit',
            'sourceDateEpoch': int(source_epoch),
            'archivePolicy': 'original product sources, reviewed assets, no Git history',
            'criteriaWithUnpublishedEvidence': omitted,
            'sha256': inventory,
        })
        if target.exists():
            raise ValueError('Destination was created while preparing export')
        if args.zip:
            archive = Path(scratch)/'source.zip'
            write_archive(archive, tree, source_epoch)
            os.link(archive, zip_target)
        tree.rename(target)
    print(f'Prepared {len(inventory)} source files. Public evidence projection: {omitted} criteria. Destination: {target}')


if __name__ == '__main__':
    try:
        main()
    except (OSError,ValueError,subprocess.CalledProcessError) as error:
        sys.exit(str(error))
