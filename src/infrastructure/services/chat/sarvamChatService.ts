/**
 * Sarvam Chat service wrapper
 * Provides a small helper to call Sarvam's chat/completions API or a proxy endpoint.
 */
import { getSarvamApiKey } from '../../../utils/sarvamApiKey';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type ChatOptions = {
  temperature?: number;
  reasoning_effort?: 'low' | 'medium' | 'high';
  wiki_grounding?: boolean;
  model?: string; // e.g. 'sarvam-m'
};

const FN_URL = (import.meta as any).env?.VITE_TTS_PROXY_URL || '/api/sarvam-chat';

export async function createChatCompletion(
  messages: ChatMessage[],
  opts: ChatOptions = {}
): Promise<any> {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array');
  }

  const body = {
    model: opts.model ?? 'sarvam-m',
    messages,
    temperature: opts.temperature ?? 0.5,
    reasoning_effort: opts.reasoning_effort ?? 'low',
    wiki_grounding: opts.wiki_grounding ?? false,
  };

  const apiKey = getSarvamApiKey();
  if (apiKey) {
    const resp = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '<no text>');
      throw new Error(`Sarvam chat failed (${resp.status}): ${txt}`);
    }
    const json = await resp.json();
    return json;
  }

  // Fallback to proxy
  const resp = await fetch(FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '<no text>');
    throw new Error(`Sarvam chat proxy failed (${resp.status}): ${txt}`);
  }
  const json = await resp.json();
  return json;
}
