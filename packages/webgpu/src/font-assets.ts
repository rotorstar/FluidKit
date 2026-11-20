/** Hash exactly the bytes handed to Glyph. A host without WebCrypto can render but cannot attest the font. */
export async function fetchSurfaceFontAssets(urls: readonly string[], signal?: AbortSignal) {
  const scope = new AbortController();
  const abortSignal = signal ? AbortSignal.any([signal, scope.signal]) : scope.signal;
  try {
    return await Promise.all(urls.map(async url => {
      const response = await fetch(url, { signal: abortSignal });
      if (!response.ok) throw new Error('Surface font request failed: ' + response.status);
      const bytes = await response.arrayBuffer();
      const digest = globalThis.crypto?.subtle ? await crypto.subtle.digest('SHA-256', bytes) : null;
      abortSignal.throwIfAborted();
      return {blob: new Blob([bytes]), sha256: digest ? [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('') : null};
    }));
  } catch (error) {
    scope.abort(error);
    throw error;
  }
}
