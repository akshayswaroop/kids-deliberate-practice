/**
 * Sarvam TTS service wrapper
 * UI-only by default (direct API with browser key). Optionally supports a generic proxy via VITE_TTS_PROXY_URL.
 */

export type TTSOptions = {
  target_language_code?: string; // BCP-47 e.g. 'kn-IN'
  speaker?: string | null;
  enable_preprocessing?: boolean;
  pitch?: number | null;
  pace?: number | null;
  loudness?: number | null;
  speech_sample_rate?: 8000 | 16000 | 22050 | 24000 | null;
  model?: 'bulbul:v2' | string;
  output_audio_codec?: string | null; // e.g., 'wav', 'mp3'
};

export type TTSSynthesizeResult = {
  request_id: string | null;
  audioUrl: string; // object URL for playback
  mimeType: string; // e.g., 'audio/wav'
};

const FN_URL = (import.meta as any).env?.VITE_TTS_PROXY_URL || '/api/sarvam-tts';
import { getSarvamApiKey } from '../../../utils/sarvamApiKey';

/**
 * Check if a pre-generated audio file exists for the given word ID.
 * Returns the audio URL if found, null otherwise.
 * Uses HEAD request to check existence without downloading the file.
 */
async function tryPreGeneratedAudio(wordId: string | undefined): Promise<string | null> {
  if (!wordId) return null;
  
  try {
    // Use import.meta.env.BASE_URL to get the correct base path for Vite
    const base = import.meta.env.BASE_URL || '/';
    const audioPath = `${base}audio/kannada/${wordId}.wav`;
    const response = await fetch(audioPath, { method: 'HEAD' });
    
    if (response.ok) {
      return audioPath;
    }
  } catch {
    // File doesn't exist or fetch failed, fall back to API
  }
  
  return null;
}

export async function synthesizeSpeech(
  text: string,
  opts: TTSOptions & { wordId?: string } = {}
): Promise<TTSSynthesizeResult> {
  if (!text || !text.trim()) {
    throw new Error('Cannot synthesize empty text');
  }

  // Try pre-generated audio first if wordId is provided
  const preGenAudioUrl = await tryPreGeneratedAudio(opts.wordId);
  if (preGenAudioUrl) {
    return {
      request_id: null,
      audioUrl: preGenAudioUrl,
      mimeType: 'audio/wav',
    };
  }

  const body = {
    text,
    target_language_code: opts.target_language_code ?? 'kn-IN',
    speaker: opts.speaker ?? undefined,
    enable_preprocessing: opts.enable_preprocessing ?? true,
    pitch: opts.pitch ?? undefined,
    pace: opts.pace ?? undefined,
    loudness: opts.loudness ?? undefined,
    speech_sample_rate: opts.speech_sample_rate ?? undefined,
    model: opts.model ?? undefined,
    output_audio_codec: opts.output_audio_codec ?? undefined,
  };

  // If a public API key is provided (either user-supplied in localStorage or build-time env),
  // call Sarvam directly from the browser (UI-only mode).
  const apiKey = getSarvamApiKey();
  if (apiKey) {
    const resp = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        ...body,
        speaker: body.speaker ? String(body.speaker).toLowerCase() : undefined,
      }),
    });
    if (!resp.ok) {
      const errText = await safeText(resp);
      throw new Error(`TTS (direct) failed (${resp.status}): ${errText}`);
    }
  const json: { request_id?: string | null; audio?: string; audios?: string[] } = await resp.json();
  const base64 = json?.audio || json?.audios?.[0];
  if (!base64) throw new Error('Invalid TTS response: missing audio');
  const mimeType = 'audio/wav';
  const audioBytes = base64ToUint8Array(base64);
  const ab = audioBytes.buffer.slice(audioBytes.byteOffset, audioBytes.byteOffset + audioBytes.byteLength);
  const blob = new Blob([ab as unknown as BlobPart], { type: mimeType });
    const url = URL.createObjectURL(blob);
    return { request_id: json.request_id ?? null, audioUrl: url, mimeType };
  }

  // Otherwise, use the server/proxy path
  const resp = await fetch(FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...body,
      speaker: body.speaker ? String(body.speaker).toLowerCase() : undefined,
    }),
  });
  if (!resp.ok) {
    const errText = await safeText(resp);
    throw new Error(`TTS proxy failed (${resp.status}): ${errText}`);
  }
  const data: { request_id?: string | null; audio?: string; audios?: string[] } = await resp.json();
  const base64 = data?.audio || data?.audios?.[0];
  if (!base64) throw new Error('Invalid TTS response: missing audio');
  const mimeType = 'audio/wav';
  const audioBytes = base64ToUint8Array(base64);
  const ab = audioBytes.buffer.slice(audioBytes.byteOffset, audioBytes.byteOffset + audioBytes.byteLength);
  const blob = new Blob([ab as unknown as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  return { request_id: data.request_id ?? null, audioUrl: url, mimeType };
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function safeText(resp: Response) {
  try {
    return await resp.text();
  } catch {
    return '<no text>';
  }
}
