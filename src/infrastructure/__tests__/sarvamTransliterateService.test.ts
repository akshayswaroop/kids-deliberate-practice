import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { transliterateText } from '../services/transliterate/sarvamTransliterateService';

describe('transliterateText', () => {
  const originalFetch = global.fetch;
  const originalEnv = (import.meta as any).env;

  beforeEach(() => {
    (global as any).fetch = vi.fn();
    // Ensure a key exists for UI-only mode
    (import.meta as any).env = { ...(originalEnv || {}), VITE_SARVAM_API_KEY: 'test-key' } as any;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    (import.meta as any).env = originalEnv;
    vi.restoreAllMocks();
  });

  it('throws on empty input', async () => {
    await expect(transliterateText('', { source_language_code: 'kn-IN', target_language_code: 'en-IN' }))
      .rejects.toThrow(/empty text/);
  });

  it('returns transliterated text', async () => {
    // @ts-expect-error mock
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ request_id: 'r1', transliterated_text: 'halo' }) });
    const res = await transliterateText('ಹಲೋ', { source_language_code: 'kn-IN', target_language_code: 'en-IN', spoken_form: true });
    expect(res.request_id).toBe('r1');
    expect(res.transliterated_text.toLowerCase()).toContain('ha');
  });

  it('surfaces HTTP errors', async () => {
    // @ts-expect-error mock
    global.fetch.mockResolvedValueOnce({ ok: false, status: 400, text: async () => 'bad request' });
    await expect(transliterateText('ಟೆಸ್ಟ್', { source_language_code: 'kn-IN', target_language_code: 'en-IN' }))
      .rejects.toThrow(/400/);
  });
});
