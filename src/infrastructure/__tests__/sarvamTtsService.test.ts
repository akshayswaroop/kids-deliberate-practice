import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { synthesizeSpeech } from '../services/tts/sarvamTtsService';

describe('synthesizeSpeech', () => {
  const originalFetch = global.fetch;
  const originalCreate = (global as any).URL?.createObjectURL;
  const originalRevoke = (global as any).URL?.revokeObjectURL;

  beforeEach(() => {
    (global as any).fetch = vi.fn();
    // Minimal blob URL stubs for jsdom
    if (!(global as any).URL) (global as any).URL = {} as any;
    (global as any).URL.createObjectURL = vi.fn(() => 'blob:mock');
    (global as any).URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    if (originalCreate) (global as any).URL.createObjectURL = originalCreate;
    if (originalRevoke) (global as any).URL.revokeObjectURL = originalRevoke;
    vi.restoreAllMocks();
  });

  it('throws on empty text', async () => {
    await expect(synthesizeSpeech(''))
      .rejects.toThrow(/empty text/);
  });

  it('calls proxy and returns audio URL', async () => {
    const fakeBase64 = btoa('RIFF....WAVEfmt ');
    // @ts-expect-error mock
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ request_id: 'abc', audio: fakeBase64 }),
    });

    const res = await synthesizeSpeech('ಹಲೋ ವಿಶ್ವ');
    expect(res.request_id).toBe('abc');
    expect(res.audioUrl).toMatch(/^blob:/);
    expect(res.mimeType).toBe('audio/wav');
    // Clean up the created URL
    URL.revokeObjectURL(res.audioUrl);
  });

  it('surface proxy errors with status', async () => {
    // @ts-expect-error mock
    global.fetch.mockResolvedValueOnce({ ok: false, status: 502, text: async () => 'Bad Gateway' });
    await expect(synthesizeSpeech('ಟೆಸ್ಟ್'))
      .rejects.toThrow(/502/);
  });
});
