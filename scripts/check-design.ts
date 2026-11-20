import { mkdir, rename, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { buildDesignReport } from './design-static';
import { summarizeQuality } from '../packages/testing/src/quality';
import { FLUID_THEME, themeCSS } from '../packages/contracts/src/theme';

const root = fileURLToPath(new URL('../', import.meta.url));
const report = await buildDesignReport(root);
const directory = join(root, 'apps/studio/generated');
await mkdir(directory, { recursive: true });
const temporary = join(directory, `design-static.${process.pid}.json`);
await writeFile(temporary, `${JSON.stringify(report, null, 2)}\n`);
await rename(temporary, join(directory, 'design-static.json'));
await writeFile(join(directory, 'design-tokens.css'), `/* Generated from ThemeDefinition ${FLUID_THEME.id}@${FLUID_THEME.version}. */\n${themeCSS(FLUID_THEME)}`);
const summary = summarizeQuality(report);
console.info(`Design ${report.context.buildId}: ${summary.errors} Fehler, ${summary.warnings} Warnungen; ${report.checks[0]?.checked} Quelldateien. Render-/Semantik-/Screenshot-Abnahme separat.`);
for (const finding of report.checks.flatMap(check => check.findings)) console.info(`${finding.severity} ${finding.target.file}:${finding.target.line} ${finding.rule}: ${finding.message}`);
if (summary.errors) process.exitCode = 1;
