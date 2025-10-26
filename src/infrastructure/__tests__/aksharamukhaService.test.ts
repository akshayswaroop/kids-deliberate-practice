import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { transliterateKannadaToHindi } from '../services/transliterate/aksharamukhaTransliterateService';

describe('aksharamukhaTransliterateService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    (global as any).fetch = vi.fn();
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('throws on empty input', async () => {
    await expect(transliterateKannadaToHindi('')).rejects.toThrow(/empty/);
  });

  it('returns transliterated text on success', async () => {
    // @ts-expect-error mock
    global.fetch.mockResolvedValueOnce({ ok: true, text: async () => 'नमस्कार' });
    const res = await transliterateKannadaToHindi('ನಮಸ್ಕಾರ');
    expect(res.transliterated_text).toBe('नमस्कार');
  });

  it('surfaces http errors', async () => {
    // @ts-expect-error mock
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'server err' });
    await expect(transliterateKannadaToHindi('ನಮಸ್ಕಾರ')).rejects.toThrow(/500/);
  });
});
