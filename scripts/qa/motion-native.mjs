import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import sharp from 'sharp';

// Explicitly isolated browser context: no user profile, credentials, remote data,
// application globals or test-only renderer. Drive the shipped UI/recording API.
const baseURL = process.env.FLUID_STUDIO_URL ?? 'http://127.0.0.1:3011';
const output = resolve(process.env.FLUID_MOTION_OUTPUT ?? 'docs/qa/2026-11-20-r2/browser');
await mkdir(output, { recursive: true });
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const directions = [
  { id: 'match', title: 'Zeile → Karte', forward: /In Karten verwandeln/, back: /Zur Tabelle/ },
  { id: 'split', title: 'Gruppe → Module', forward: /Kernel aufteilen/, back: /Gruppe schließen/ },
  { id: 'merge', title: 'Karten → Vergleich', forward: /Auswahl verbinden/, back: /In Karten aufteilen/ },
];
const browser = await chromium.launch({ channel: process.env.FLUID_BROWSER_CHANNEL ?? 'chrome', headless: true });
const manifest = { schemaVersion: 1, generatedAt: new Date().toISOString(), baseURL, browserVersion: browser.version(), method: 'isolated-headless-chrome-ui-and-original-visible-browser-canvas-region-png',
  scope: 'Three neutral structural directions, 14 forward and 13 reverse selected phases, 25/50/75 percent UI retarget and reduced-motion endpoints. PNGs cover only the intersection of canvas, ancestor overflow clips and browser viewport. No offscreen-pixel, pacing or human/native-IME claim.', runs: [] };
async function storePng(directory, name, canvas) {
  const captured = await canvas.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const roundedClips = [];
    let left = Math.max(0, rect.left), top = Math.max(0, rect.top), right = Math.min(innerWidth, rect.right), bottom = Math.min(innerHeight, rect.bottom);
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent), box = parent.getBoundingClientRect();
      if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
        const radii = [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomLeftRadius, style.borderBottomRightRadius].map(value => value.endsWith('px') ? Number.parseFloat(value) : 0);
        if (radii.some(radius => radius > 0)) roundedClips.push({ className: parent.className, x: box.left, y: box.top, width: box.width, height: box.height, radii });
      }
      if (style.overflowX !== 'visible') { left = Math.max(left, box.left + parent.clientLeft); right = Math.min(right, box.left + parent.clientLeft + parent.clientWidth); }
      if (style.overflowY !== 'visible') { top = Math.max(top, box.top + parent.clientTop); bottom = Math.min(bottom, box.top + parent.clientTop + parent.clientHeight); }
    }
    return { pixelWidth: element.width, pixelHeight: element.height,
      canvasBounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      roundedClips, viewport: { x: left, y: top, width: right - left, height: bottom - top, dpr: devicePixelRatio }, dataset: { ...element.dataset } };
  });
  // Capture the composited browser image. A WebGL canvas is allowed to discard
  // its drawing buffer after presentation; toDataURL later would be blank and
  // would produce a meaningless apparent pixel-continuity pass.
  const { x, y, width, height } = captured.viewport;
  const bytes = await canvas.page().screenshot({ type: 'png', clip: { x, y, width, height }, animations: 'allow' });
  const after = await canvas.evaluate(element => ({ backend: element.dataset.backend, progress: element.dataset.progress, width: element.width, height: element.height, frames: element.dataset.frames }));
  if (after.backend !== captured.dataset.backend || after.progress !== captured.dataset.progress || after.width !== captured.pixelWidth || after.height !== captured.pixelHeight) throw new Error('Presentation changed during browser image capture');
  const stats = await sharp(bytes).stats();
  if (!stats.channels.slice(0, 3).some(channel => channel.stdev > 1)) throw new Error('Canvas capture has no visible variation; refusing a blank-image proof');
  await writeFile(join(directory, `${name}.png`), bytes);
  const raster = await sharp(bytes).metadata();
  const metadata = { pixelWidth: raster.width, pixelHeight: raster.height, canvasPixelWidth: captured.pixelWidth, canvasPixelHeight: captured.pixelHeight,
    capture: 'visible-browser-canvas-region', canvasBounds: captured.canvasBounds, roundedClips: captured.roundedClips, viewport: captured.viewport, dataset: captured.dataset, frameAfterCapture: after.frames };
  return { ...metadata, file: `${name}.png`, sha256: sha256(bytes), bytes: bytes.length };
}
async function difference(directory, before, after) {
  const a = await sharp(await readFile(join(directory, before.file))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(await readFile(join(directory, after.file))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (a.info.width !== b.info.width || before.viewport.dpr !== after.viewport.dpr || Math.abs(before.viewport.x - after.viewport.x) > .01 || Math.abs(before.viewport.y - after.viewport.y) > .01) return { comparable: false, reason: 'Different original canvas width, DPR or CSS origin' };
  const commonHeight = Math.min(a.info.height, b.info.height), pixels = a.info.width * commonHeight;
  let different = 0, total = 0, maximum = 0, excluded = 0, innerDifferent = 0, innerTotal = 0, innerMaximum = 0;
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const roundedCorner = (frame, x, y) => (frame.roundedClips ?? []).some(clip => {
    const px = frame.viewport.x + (x + .5) / frame.viewport.dpr, py = frame.viewport.y + (y + .5) / frame.viewport.dpr;
    // Conservatively exclude the geometric corner quadrants, plus a single
    // pixel footprint for compositing antialiasing. Raw metrics stay untouched.
    const margin = 1 / frame.viewport.dpr;
    return clip.radii.some((r, index) => r > 0 &&
      (index % 2 === 0 ? px >= clip.x - margin && px <= clip.x + r + margin : px <= clip.x + clip.width + margin && px >= clip.x + clip.width - r - margin) &&
      (index < 2 ? py >= clip.y - margin && py <= clip.y + r + margin : py <= clip.y + clip.height + margin && py >= clip.y + clip.height - r - margin));
  });
  for (let i = 0; i < pixels * 4; i += 4) {
    const x = i / 4 % a.info.width, y = Math.floor(i / 4 / a.info.width), outsideInner = roundedCorner(before, x, y) || roundedCorner(after, x, y);
    if (outsideInner) excluded++;
    let changed = false;
    for (let c = 0; c < 3; c++) { const delta = Math.abs(a.data[i + c] - b.data[i + c]); total += delta; maximum = Math.max(maximum, delta); changed ||= delta > 0;
      if (!outsideInner) { innerTotal += delta; innerMaximum = Math.max(innerMaximum, delta); }
    }
    if (changed) { different++; box.minX = Math.min(box.minX, x); box.maxX = Math.max(box.maxX, x); box.minY = Math.min(box.minY, y); box.maxY = Math.max(box.maxY, y); if (!outsideInner) innerDifferent++; }
  }
  return { comparable: true, scope: 'Common unchanged visible canvas rectangle; original browser PNGs remain complete', commonWidth: a.info.width, commonHeight,
    omittedBeforePixels: a.info.width * (a.info.height - commonHeight), omittedAfterPixels: b.info.width * (b.info.height - commonHeight),
    differentPixels: different, pixels, maximumChannelDifference: maximum, meanChannelDifference: total / (pixels * 3), differenceBounds: different ? box : null,
    gpuInterior: { scope: 'Common visible rectangle minus measured rounded DOM clip corner quadrants and one pixel footprint; no channel tolerance applied', excludedPixels: excluded,
      pixels: pixels - excluded, differentPixels: innerDifferent, maximumChannelDifference: innerMaximum, meanChannelDifference: innerTotal / ((pixels - excluded) * 3) } };
}
async function contactSheet(directory, samples, file = 'contact-sheet.png') {
  const width = 360, height = 300, label = 30, columns = 3, rows = Math.ceil(samples.length / columns);
  const images = [];
  for (let index = 0; index < samples.length; index++) {
    const sample = samples[index], left = index % columns * width, top = Math.floor(index / columns) * (height + label);
    const png = await sharp(await readFile(join(directory, sample.file))).resize(width, height, { fit: 'contain', background: '#0b1520' }).png().toBuffer();
    images.push({ input: png, left, top: top + label });
    images.push({ input: Buffer.from(`<svg width="${width}" height="${label}"><rect width="100%" height="100%" fill="#e8eef4"/><text x="10" y="21" font-family="Arial" font-size="15" fill="#16283b">${sample.dataset.progress} · ${sample.dataset.backend}</text></svg>`), left, top });
  }
  await sharp({ create: { width: columns * width, height: rows * (height + label), channels: 4, background: '#e8eef4' } }).composite(images).png().toFile(join(directory, file));
}
try {
  for (const backend of ['webgpu', 'webgl2'].filter(value => !process.env.FLUID_MOTION_BACKEND || value === process.env.FLUID_MOTION_BACKEND)) for (const direction of directions.filter(value => !process.env.FLUID_MOTION_DIRECTION || value.id === process.env.FLUID_MOTION_DIRECTION)) {
    const directory = join(output, `${backend}-${direction.id}`); await mkdir(directory, { recursive: true });
    const context = await browser.newContext({ locale: 'de-DE', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference', acceptDownloads: true });
    const page = await context.newPage(), errors = [], failedResponses = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) failedResponses.push({ url: response.url(), status: response.status() }); });
    const run = { backend, direction: direction.id, directory, errors, failedResponses, frames: [], reverseFrames: [], retargets: [], reducedMotion: [] };
    manifest.runs.push(run);
    try {
      await page.goto(baseURL, { waitUntil: 'networkidle' });
      const stage = page.locator('[data-motion-version="2"]'), canvas = stage.locator('canvas');
      await expect(stage.locator('[data-status="ready"]')).toBeVisible({ timeout: 60000 });
      await page.getByText('Entwicklerwerkzeuge', { exact: true }).click();
      await page.getByLabel('Rendering backend').selectOption(backend === 'webgpu' ? 'webgpu-only' : 'webgl2');
      await expect(canvas).toHaveAttribute('data-backend', backend, { timeout: 30000 });
      await page.getByRole('tab', { name: 'UI-Qualität', exact: true }).click();
      run.buildId = await page.locator('.quality-build code').textContent();
      run.environment = await page.evaluate(async () => {
        const adapter = await navigator.gpu?.requestAdapter();
        return { userAgent: navigator.userAgent, platform: navigator.platform, hardwareConcurrency: navigator.hardwareConcurrency,
          gpu: adapter ? { vendor: adapter.info.vendor, architecture: adapter.info.architecture, device: adapter.info.device, description: adapter.info.description, isFallbackAdapter: adapter.info.isFallbackAdapter } : null };
      });
      if (backend === 'webgl2') run.environment.webgl = await canvas.evaluate(element => {
        const gl = element.getContext('webgl2'), extension = gl?.getExtension('WEBGL_debug_renderer_info');
        return gl ? { version: gl.getParameter(gl.VERSION), vendor: extension ? gl.getParameter(extension.UNMASKED_VENDOR_WEBGL) : null,
          renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : null } : null;
      });
      await page.getByText('Entwicklerwerkzeuge', { exact: true }).click();
      await page.getByText('Wiedergabe und Zeitlupe', { exact: true }).click();
      const slider = page.getByRole('slider', { name: 'Animationsposition' });
      const seek = async value => {
        // A real keyboard event reliably reaches a controlled native range,
        // including an already-zero checkpoint after a new clip commit.
        if (value === 0) { await slider.press('End'); await expect(slider).toHaveValue('100'); await expect.poll(async () => Number(await canvas.getAttribute('data-progress'))).toBe(1); await slider.press('Home'); }
        else await slider.fill(String(value * 100));
        await expect.poll(async () => Number(await canvas.getAttribute('data-progress')), { timeout: 15000 }).toBeCloseTo(value, 5);
        await page.evaluate(() => window.scrollTo(0, 0));
      };
      const settled = async () => { await expect.poll(async () => Number(await canvas.getAttribute('data-progress'))).toBe(1); };
      const transform = async name => { await page.getByRole('button', { name }).click(); await expect(stage).toHaveAttribute('data-phase', 'transitioning'); await settled(); };
      await page.getByRole('group', { name: 'Formübergang wählen' }).getByRole('button', { name: direction.title, exact: true }).click();
      await settled();
      await transform(direction.forward);
      await page.getByText('Effekt-Studio · Akzent wählen', { exact: true }).click();
      const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Run exportieren', exact: true }).click();
      const download = await downloadPromise; await download.saveAs(join(directory, 'recording.json'));
      const recordingBytes = await readFile(join(directory, 'recording.json')), recording = JSON.parse(recordingBytes);
      expect(recording.schemaVersion).toBe(4); expect(recording.plan?.selected ?? null).toBeNull();
      run.recording = { file: 'recording.json', sha256: sha256(recordingBytes), schemaVersion: recording.schemaVersion, sourceRevision: recording.plan?.sourceRevision, targetRevision: recording.plan?.targetRevision, relationKinds: recording.motionPlan.relations.map(relation => relation.kind) };
      await page.getByText('Effekt-Studio · Akzent wählen', { exact: true }).click();
      for (const phase of [0, .1, .2, .3, .4, .5, .6, .7, .75, .8, .85, .9, .95, 1]) {
        await seek(phase); run.frames.push(await storePng(directory, `phase-${Math.round(phase * 100).toString().padStart(3, '0')}`, canvas));
      }
      await transform(direction.back);
      for (const phase of [0, .05, .1, .15, .2, .25, .5, .75, .8, .85, .9, .95, 1]) {
        await seek(phase); run.reverseFrames.push(await storePng(directory, `reverse-${Math.round(phase * 100).toString().padStart(3, '0')}`, canvas));
      }
      await transform(direction.forward);
      for (const phase of [.25, .5, .75]) {
        await seek(phase);
        const before = await storePng(directory, `retarget-${phase * 100}-before`, canvas);
        await page.getByRole('button', { name: direction.back }).click();
        // A React commit publishes the new clip asynchronously. Do not seek the
        // previous clip and mistake the later start for a failed zero checkpoint.
        await expect(stage).toHaveAttribute('data-phase', 'transitioning');
        // The immutable clip retains its captured source after completing. Wait
        // for the controlled input to leave zero before requesting zero again;
        // pressing Home on an already-zero range does not emit an input event.
        await settled(); await expect(slider).toHaveValue('100');
        await seek(0);
        const after = await storePng(directory, `retarget-${phase * 100}-after`, canvas);
        run.retargets.push({ phase, before, after, pixels: await difference(directory, before, after), url: page.url() });
        await seek(1); await transform(direction.forward);
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.getByRole('button', { name: direction.back }).click(); await settled();
      run.reducedMotion.push(await storePng(directory, 'reduced-source', canvas));
      await page.getByRole('button', { name: direction.forward }).click(); await settled();
      run.reducedMotion.push(await storePng(directory, 'reduced-target', canvas));
      run.result = errors.length ? 'browser-errors' : 'captured-awaiting-visual-review';
      await contactSheet(directory, run.frames);
      await contactSheet(directory, run.reverseFrames, 'reverse-contact-sheet.png');
    } catch (error) { run.result = 'failed'; run.failure = String(error);
      await page.screenshot({ path: join(directory, 'failure.png'), fullPage: true }).catch(() => {});
      try {
        const developer = page.getByText('Entwicklerwerkzeuge', { exact: true });
        if (!await developer.evaluate(element => element.closest('details')?.open)) await developer.click();
        await page.getByRole('tab', { name: 'State & Daten', exact: true }).click();
        run.failurePresentation = await page.locator('.showcase-facts').innerText();
        run.failureCanvas = await page.locator('[data-motion-version="2"] canvas').evaluate(element => ({ ...element.dataset }));
      } catch (diagnosticError) { run.failureDiagnostic = String(diagnosticError); }
    }
    finally { await writeFile(join(directory, 'report.json'), JSON.stringify(run, null, 2)); await context.close(); await writeFile(join(output, 'manifest.json'), JSON.stringify(manifest, null, 2)); }
  }
} finally { await browser.close(); }
console.log(JSON.stringify(manifest.runs.map(run => ({ backend: run.backend, direction: run.direction, result: run.result, failure: run.failure, frames: run.frames.length, retargets: run.retargets.length, errors: run.errors })), null, 2));
if (manifest.runs.some(run => run.result === 'failed' || run.errors.length)) process.exitCode = 1;
