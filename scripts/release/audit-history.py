"""Summarize observed credential and workstation patterns, without printing their values."""
from collections import Counter, defaultdict
import gzip
import io
import json
import re
import subprocess
import sys
import zipfile

# Keep examples and the regex source itself distinct from actual credentials.
PATTERNS = {
    'private-key': re.compile(rb'-----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----'),
    'provider-token': re.compile(rb'(?:sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{36,}|gh[pousr]_[A-Za-z0-9]{32,}|github_pat_[A-Za-z0-9_]{48,}|AKIA[0-9A-Z]{16})'),
    'authenticated-url': re.compile(rb'(?:https?|postgres(?:ql)?|mysql|mongodb(?:\+srv)?|rediss?|amqps?)://[^\s/@:]+:[^\s/@:]{7,}@'),
    'workstation-path': re.compile(rb'/(?:Users|home)/(?!example/|user/)[\w.-]+/|[A-Za-z]:\\{1,2}Users\\{1,2}[\w.-]+'),
}
LIMIT = 160 * 1024 * 1024

def is_sensitive_filename(name):
    base = name.rsplit(b'/', 1)[-1].lower()
    if base in {b'.env.example', b'.env.sample', b'.env.template'}:
        return False
    return bool(
        base == b'.env' or base.startswith(b'.env.') or
        base in {b'id_rsa', b'id_dsa', b'id_ecdsa', b'id_ed25519', b'.git-credentials', b'.npmrc', b'.pypirc'} or
        re.search(rb'\.(?:sqlite(?:3|-shm|-wal)?|p12|pfx|pem|key)$', base)
    )


def main():
    objects = subprocess.check_output(['git', 'rev-list', '--objects', '--all']).splitlines()
    names = {line.split(b' ', 1)[0]: line.partition(b' ')[2] for line in objects}
    output = subprocess.check_output(['git', 'cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'], input=b'\n'.join(names) + b'\n')
    blobs = [line.split() for line in output.splitlines() if line.split()[1] == b'blob']
    counts = Counter()
    areas = defaultdict(set)
    archive_limits = Counter()
    def inspect(blob):
        matches = set()
        if blob.startswith(b'\x1f\x8b'):
            with gzip.GzipFile(fileobj=io.BytesIO(blob)) as handle:
                data = handle.read(LIMIT + 1)
                if len(data) > LIMIT:
                    archive_limits['gzip-limit'] += 1
            return inspect_text(data[:LIMIT])
        if blob.startswith(b'PK\x03\x04'):
            with zipfile.ZipFile(io.BytesIO(blob)) as archive:
                consumed = 0
                for item in archive.infolist():
                    consumed += item.file_size
                    if consumed > LIMIT:
                        archive_limits['zip-limit'] += 1
                        break
                    if not item.is_dir():
                        matches.update(inspect_text(archive.read(item)))
            return matches
        return inspect_text(blob)
    def inspect_text(blob):
        if b'\0' in blob[:4096]:
            return set()
        return {key for key, pattern in PATTERNS.items() if pattern.search(blob)}
    with subprocess.Popen(['git', 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE) as proc:
        for oid, _, size in blobs:
            proc.stdin.write(oid + b'\n')
            proc.stdin.flush()
            proc.stdout.readline()
            blob = proc.stdout.read(int(size))
            assert proc.stdout.read(1) == b'\n'
            path = names[oid].decode('utf-8', errors='replace')
            area = 'docs/qa' if path.startswith('docs/qa/') else path.split('/',1)[0]
            for category in inspect(blob):
                counts[category] += 1
                areas[category].add(area)
        proc.stdin.close()
    commits = subprocess.check_output(['git', 'rev-list', '--all']).splitlines()
    # One blob can have different names in different trees. Inspect those names independently.
    paths = set()
    for commit in commits:
        listing = subprocess.check_output(['git', 'ls-tree', '-r', '-z', '--name-only', commit])
        paths.update(name for name in listing.split(b'\0') if name)
    protected_names = sum(is_sensitive_filename(name) for name in paths)
    report = {
        'reachableCommits': len(commits),
        'distinctBlobs': len(blobs), 'matchedBlobsByCategory': dict(counts),
        'matchedAreas': {k: sorted(v) for k,v in areas.items()}, 'sensitiveFilenames': protected_names,
        'archiveBounds': { 'bytesPerArchive': LIMIT, 'truncated': dict(archive_limits) },
        'scope': 'Reachable Git blobs, readable text and bounded gzip/zip entries. No OCR, encrypted payload, reflog, remote-side or personal-data certification.'
    }
    print(json.dumps(report, indent=2))
    return int(any(counts.get(k) for k in ('private-key','provider-token','authenticated-url')) or bool(protected_names) or bool(archive_limits))

if __name__ == '__main__':
    sys.exit(main())
