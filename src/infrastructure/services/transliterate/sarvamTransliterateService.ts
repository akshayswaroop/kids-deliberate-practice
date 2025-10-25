/**
 * Sarvam Transliteration service (UI-only)
 * NOTE: According to Sarvam docs, transliteration across Indic scripts (e.g., hi-IN → bn-IN) may not be supported.
 * This wrapper simply calls the REST endpoint and returns the provider's response shape.
 */

export type NumeralsFormat = 'international' | 'native';
export type SpokenFormNumeralsLanguage = 'native' | 'english';

export type TransliterateOptions = {
  source_language_code: string; // e.g., 'kn-IN'
  target_language_code: string; // e.g., 'en-IN'
  spoken_form?: boolean;
  numerals_format?: NumeralsFormat;
  spoken_form_numerals_language?: SpokenFormNumeralsLanguage;
};

export type TransliterateResult = {
  request_id?: string | null;
  transliterated_text: string;
};

import { getSarvamApiKey } from '../../../utils/sarvamApiKey';
// Allow overriding the endpoint via env if Sarvam changes paths
const TRANSLIT_URL: string | undefined = (import.meta as any).env?.VITE_SARVAM_TRANSLITERATE_URL;
const CANDIDATE_ENDPOINTS: string[] = [
  // 1) Explicit override wins
  ...(TRANSLIT_URL ? [TRANSLIT_URL] : []),
  // 2) Current official path (as of Oct 2025)
  'https://api.sarvam.ai/transliterate',
  // 3) Known historical paths (fallbacks)
  'https://api.sarvam.ai/text/transliterate',
  'https://api.sarvam.ai/text/transliteration',
];

function requireApiKeyOrThrow(): string {
  const key = getSarvamApiKey();
  if (!key) throw new Error('Sarvam API key missing. Add your key in Settings to enable Transliteration.');
  return key;
}

export async function transliterateText(input: string, opts: TransliterateOptions): Promise<TransliterateResult> {
  if (!input || !input.trim()) throw new Error('Cannot transliterate empty text');
  if (!opts?.source_language_code || !opts?.target_language_code) {
    throw new Error('Transliterate requires source_language_code and target_language_code');
  }
  const apiKey = requireApiKeyOrThrow();

  const body = {
    input,
    source_language_code: opts.source_language_code,
    target_language_code: opts.target_language_code,
    spoken_form: opts.spoken_form ?? false,
    numerals_format: opts.numerals_format ?? 'international',
    spoken_form_numerals_language: opts.spoken_form_numerals_language ?? 'native',
  } as const;

  let lastErrText = '';
  for (const url of CANDIDATE_ENDPOINTS) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey,
        },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const t = await safeText(resp);
        lastErrText = `Transliterate failed (${resp.status}): ${t}`;
        // If it's a 404, fall through to try the next candidate
        if (resp.status === 404) continue;
        throw new Error(lastErrText);
      }
      const json = await resp.json();
      const transliterated_text: string | undefined = json?.transliterated_text;
      if (!transliterated_text) throw new Error('Invalid transliterate response: missing transliterated_text');
      return { request_id: json?.request_id ?? null, transliterated_text };
    } catch (e) {
      // Network errors or explicit throws above
      if (String((e as Error)?.message || '').includes('404') || String((e as Error)?.message || '').includes('not_found')) {
        // try next
        continue;
      }
      throw e; // surface non-404 immediately
    }
  }
  throw new Error(lastErrText || 'Transliterate failed: endpoint not found');
}

async function safeText(resp: Response) {
  try { return await resp.text(); } catch { return '<no text>'; }
}
