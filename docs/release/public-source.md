# Preparing a public FluidKit source release

FluidKit Pro can be shared on GitHub as a source workspace. Recipients can build the GPU showcase, run Studio locally and read the handbooks without a provider account. The MIT grant covers the original project code and documentation. Fonts and other redistributed third-party assets carry their own notices. The workspace manifests keep npm publication disabled. [MIT license](../../LICENSE) · [Third-party notices](../../THIRD-PARTY-NOTICES.md)

## Create the candidate

Use Git, Node.js 24 or later, npm, and Python 3.9 or later. From the maintainer checkout, install the locked dependencies and check its reachable Git history. The history tool reports counts and file categories. It never prints matching values.

```sh
npm ci
python3 -B -m unittest discover -s tests/release
python3 scripts/release/audit-history.py
python3 scripts/release/public-source.py --zip ../fluidkit-public
```

Choose a new directory outside the checkout. The default requires a clean candidate commit. During development add `--worktree` to preview current source changes. The command creates the directory and a ZIP beside it. Both contain the same source and SHA-256 inventory in `PUBLIC-SOURCE.json`. Generated source indexes use the commit timestamp, or an explicit `SOURCE_DATE_EPOCH`. Freshness and source checks run against the actual files and the current date.

The exporter selects project sources, fonts, handbook chapters and reviewed screenshots. Changes to reviewed binary assets require a new digest in `scripts/release/public-assets.json`. Inspect the image or font and its provenance before updating the digest. Local configuration, databases, generated bundles, old prototypes and large test recordings stay in the maintainer checkout. The public acceptance register retains only byte-verifiable evidence included in the candidate. It records where a result needs to be reproduced.

## Verify and hand off

Run these commands in the new directory. `npm ci` installs from the lockfile. The local build creates the Studio and offline readers, including their dependency notices.

```sh
cd ../fluidkit-public
npm ci
npm run check
npm run check:acceptance
npm run check:plan
npm run check:flows
npm run knowledge:check
npm run build
npm run dev
```

Open the address printed by the Studio server. Check the German, English and French entry points, change language with an active selection, and open both handbooks. Browser scenarios use `npm run test:e2e` with the project's Playwright browsers installed. Hardware scores, platform accessibility reviews and live model evaluations have their own evidence gates. A local source build needs no model credentials.

For a GitHub release, initialize a fresh Git repository **in a pristine copy of the reviewed directory** and commit this candidate as its first tree. Review the staged file list before connecting a new GitHub remote. The maintainer repository has its own historical QA captures and workstation paths. The public ZIP can also be shared directly. A maintainer can enable private vulnerability reporting on the new public repository so researchers can use the contact channel described in the [security policy](../../SECURITY.md). [GitHub settings](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository) The preparation and test commands use local files and never change repository visibility.

## What the audit covers

The history scan reads reachable local Git refs, plaintext blobs and size-bounded ZIP/gzip contents. It reports recognizable key formats, authenticated URLs, common secret filenames and workstation paths. Screenshots and fonts pass a separate content and attribution review, then receive pinned digests. The report describes the scope of these checks. Personal data embedded in an image, opaque binaries and remote-only refs need their own review when a future release adds such material.
