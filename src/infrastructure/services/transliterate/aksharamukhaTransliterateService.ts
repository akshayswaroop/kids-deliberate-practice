/**
 * Aksharamukha public transliteration API wrapper (UI-only)
 * Source: https://www.aksharamukha.com (public API)
 *
 * Basic usage here: Kannada → Hindi (Devanagari).
 * Endpoint (GET): https://www.aksharamukha.com/api/public?input=<text>&source=Kannada&target=Devanagari
 * Returns: plain text transliterated string (not JSON)
 *
 * Notes:
 * - No API key required. Subject to provider rate limits and availability.
 * - CORS is generally enabled by provider; if blocked, define VITE_AKSHARAMUKHA_PROXY_URL to route through a proxy.
 */

const DEFAULT_ENDPOINT = 'https://www.aksharamukha.com/api/public';
const FALLBACK_ENDPOINTS = [
  'https://aksharamukha-plugin.appspot.com/api/public', // per provider example (preferred per user)
  'http://aksharamukha-plugin.appspot.com/api/public',  // http variant if https not supported
  'https://aksharamukha.appspot.com/api/public',        // legacy appspot
];
const ENV_ENDPOINT: string | undefined = (import.meta as any)?.env?.VITE_AKSHARAMUKHA_URL;
const PROXY_URL: string | undefined = (import.meta as any)?.env?.VITE_AKSHARAMUKHA_PROXY_URL;

export type AkmOptions = {
  source?: 'Kannada';
  target?: 'Devanagari';
};

export async function transliterateKannadaToHindi(input: string, opts: AkmOptions = {}): Promise<{ transliterated_text: string }>
{
  if (!input || !input.trim()) throw new Error('Cannot transliterate empty text');
  const source = opts.source || 'Kannada';
  const target = opts.target || 'Devanagari';

  const buildUrl = (base: string, key: 'text' | 'input', extra?: Record<string, string>) => {
    const params = new URLSearchParams({ [key]: input, source, target, ...(extra || {}) } as any);
    return `${base}?${params.toString()}`;
  };

  // If a proxy is specified, use only the proxy (it should forward to the correct base)
  if (PROXY_URL) {
    // Try both parameter keys and small variations
    const keys: Array<'text' | 'input'> = ['text', 'input'];
    const variations: Array<Record<string, string>> = [{}, { nativize: '1' }];
    for (const key of keys) for (const extra of variations) {
      const url = buildUrl(PROXY_URL, key, extra);
      const resp = await fetch(url, { method: 'GET' });
      if (!resp.ok) {
        const text = await safeText(resp);
        throw new Error(`Aksharamukha failed via proxy (${resp.status}): ${text}`);
      }
      const out = (await resp.text() || '').trim();
      if (out) return { transliterated_text: out };
    }
    throw new Error('Invalid Aksharamukha response: empty');
  }

  // Otherwise, try multiple public endpoints and minor param variations
  const bases = [ENV_ENDPOINT, DEFAULT_ENDPOINT, ...FALLBACK_ENDPOINTS].filter(Boolean) as string[];
  let lastError = '';
  for (const base of bases) {
    const keys: Array<'text' | 'input'> = ['text', 'input'];
    const variations: Array<Record<string, string>> = [{}, { nativize: '1' }];
    for (const key of keys) for (const extra of variations) {
      try {
        const url = buildUrl(base, key, extra);
        const resp = await fetch(url, { method: 'GET' });
        if (!resp.ok) {
          const text = await safeText(resp);
          if (resp.status === 404) {
            lastError = `Aksharamukha not found (404) at ${base}: ${text}`;
            continue; // try other bases/params
          }
          // For non-404 HTTP errors, surface immediately (do not try fallbacks)
          throw new Error(`Aksharamukha failed (${resp.status}) at ${base}: ${text}`);
        }
        const out = (await resp.text() || '').trim();
        if (out) return { transliterated_text: out };
      } catch (e: any) {
        // Only continue on clear network errors; otherwise rethrow
        const msg = (e && e.message) ? e.message : String(e);
        const isNetworkError = e instanceof TypeError || /NetworkError|Failed to fetch|load failed/i.test(msg);
        if (isNetworkError) {
          lastError = msg;
          continue;
        }
        throw e;
      }
    }
  }
  throw new Error(lastError || 'Invalid Aksharamukha response: empty');
}

async function safeText(resp: Response) {
  try { return await resp.text(); } catch { return '<no text>'; }
}
