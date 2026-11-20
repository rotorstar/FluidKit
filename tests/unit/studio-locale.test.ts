import { describe, expect, it } from 'vitest';
import { pathLocale, requestLocale, studioHref, unprefixedPath } from '../../apps/studio/lib/locale-routing';
import { diagnosticMessage } from '../../apps/studio/lib/diagnostic-messages';
import { studioMessage } from '../../apps/studio/lib/studio-messages';

describe('Studio language routing', () => {
  it('uses the explicit preference, negotiated supported language, then the project default', () => {
    expect(requestLocale('fr', 'en-US')).toBe('fr');
    expect(requestLocale('invalid', 'ja, fr-CA;q=0.8,en-GB;q=0.6')).toBe('fr');
    expect(requestLocale(undefined, 'en;q=0.1,fr;q=0.8')).toBe('fr');
    expect(requestLocale(undefined, 'en;q=0,es,fr;q=2')).toBe('de');
  });
  it('moves only the language prefix and preserves full domain URLs and asset paths', () => {
    expect(studioHref('/en?view=cards&picked=core#selection','fr')).toBe('/fr?view=cards&picked=core#selection');
    expect(studioHref('/studio/flows?module=core#step','en')).toBe('/en/studio/flows?module=core#step');
    for (const url of ['/api/authoring','/knowledge/public/handbook.html','//outside.example','https://example.org/']) expect(studioHref(url,'fr')).toBe(url);
    expect(pathLocale('/english/studio')).toBeNull();
    expect(unprefixedPath('/de')).toBe('/');
  });
  it('validates all three translations of every Studio message', () => {
    expect(() => studioMessage.validate()).not.toThrow();
    expect(() => diagnosticMessage.validate()).not.toThrow();
  });
});
