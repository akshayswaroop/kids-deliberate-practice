import React from 'react';
import './AlphabetChatBot.css';
import { createChatCompletion } from '../../infrastructure/services/chat/sarvamChatService';
import { synthesizeSpeech } from '../../infrastructure/services/tts/sarvamTtsService';

const buildSystemPrompt = (letter) =>
  `You are a cheerful language buddy for young kids who are exploring the Kannada letter or syllable "${letter}". Reply in English unless the child asks otherwise. Keep answers under four short sentences. Stick to the real sounds, stroke order, and kid-friendly words that actually use the letter(s). If the child gives more than one Kannada character, explain how the characters combine. Do not invent stories or personify the letter unless the child specifically asks for that. Avoid sharing your inner thoughts.`;

const SUGGESTIONS = [
  'Tell me about this letter',
  'What sound does it make?',
  'Show me an easy word with it.',
  'How can I write it?',
  'Give me a fun fact!',
];

const stripThinking = (raw) => {
  if (typeof raw !== 'string') return '';
  let cleaned = raw
    .replace(/```thinking[\s\S]*?```/gi, '')
    .replace(/\u200b/g, '');

  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');

  // In case the provider streams only an opening <think> tag, drop everything after it.
  const openIdx = cleaned.search(/<think>/i);
  if (openIdx !== -1) {
    const closeMatch = cleaned.slice(openIdx).search(/<\/think>/i);
    if (closeMatch !== -1) {
      cleaned = cleaned.slice(0, openIdx) + cleaned.slice(openIdx + closeMatch + '</think>'.length);
    } else {
      cleaned = cleaned.slice(0, openIdx);
    }
  }

  cleaned = cleaned.replace(/^\s*(Thoughts?|Thinking|Inner Monologue|Deliberation|Reasoning)\s*:\s*.*$/gim, '');

  return cleaned.trim();
};

export default function AlphabetChatBot({ visible, onClose, letter }) {
  const [messages, setMessages] = React.useState(() => [
    { role: 'system', content: buildSystemPrompt(letter) },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [speakResponses, setSpeakResponses] = React.useState(true);

  React.useEffect(() => {
    // When the letter changes, reset the conversation but keep the assistant ready with the new prompt.
    setMessages([{ role: 'system', content: buildSystemPrompt(letter) }]);
    setInput('');
  }, [letter]);

  const speak = React.useCallback(async (text) => {
    if (!speakResponses || !text) return;
    try {
      const { audioUrl } = await synthesizeSpeech(text, { target_language_code: 'kn-IN', enable_preprocessing: true });
      const a = new Audio(audioUrl);
      a.onended = () => { try { URL.revokeObjectURL(audioUrl); } catch {} };
      await a.play().catch(() => {});
    } catch (e) {
      // ignore speak errors
    }
  }, [speakResponses]);

  const send = React.useCallback(async (userText) => {
    if (!userText || !userText.trim()) return;
    const userMsg = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const systemMsg = messages.find(m => m.role === 'system');
      const history = messages.filter(m => m.role !== 'system');
      const normalizedTurns = [...history, userMsg].reduce((acc, curr) => {
        const prev = acc[acc.length - 1];
        if (prev && prev.role === curr.role) {
          acc[acc.length - 1] = { ...prev, content: `${prev.content}\n\n${curr.content}` };
        } else {
          acc.push({ ...curr });
        }
        return acc;
      }, []);
      // Sarvam expects alternating user/assistant turns; merge consecutive same-role messages.
      const payload = systemMsg ? [systemMsg, ...normalizedTurns] : normalizedTurns;
      const resp = await createChatCompletion(payload, { temperature: 0.3, reasoning_effort: 'low', wiki_grounding: false });
      // Sarvam may return choices with message content
      const choiceText = resp?.choices?.[0]?.message?.content ?? resp?.output ?? JSON.stringify(resp);
      const cleaned = stripThinking(String(choiceText)) || 'Let me think about that again!';
      const assistantMsg = { role: 'assistant', content: cleaned };
      setMessages(prev => [...prev, assistantMsg]);
      speak(cleaned);
    } catch (e) {
      console.error('Letter Buddy chat error', e);
      const errMsg = { role: 'assistant', content: `Oops, I couldn't fetch a reply right now.` };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [messages, speak]);

  const visibleMessages = React.useMemo(
    () => messages.filter((m) => m.role !== 'system'),
    [messages]
  );

  const chatBodyRef = React.useRef(null);

  React.useEffect(() => {
    if (!visible) return;
    const node = chatBodyRef.current;
    if (node) {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    }
  }, [visibleMessages, visible]);

  if (!visible) return null;

  const handleSuggestion = (prompt) => {
    if (loading) return;
    send(prompt === 'Tell me about this letter' ? `Tell me about this letter: ${letter}` : prompt);
  };

  return (
    <div className="alphabet-chatbot-overlay" role="dialog" aria-label={`Chat about ${letter}`}>
      <div className="alphabet-chatbot">
        <div className="alphabet-chatbot-header">
          <div className="alphabet-chatbot-title">
            <span className="letter-chip">{letter}</span>
            <div>
              <strong>Letter Buddy</strong>
              <p>Ask me anything about this letter!</p>
            </div>
          </div>
          <div className="alphabet-chatbot-header-actions">
            <label>
              <input type="checkbox" checked={speakResponses} onChange={(e) => setSpeakResponses(e.target.checked)} /> Narrate
            </label>
            <button type="button" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="alphabet-chatbot-body" ref={chatBodyRef}>
          {visibleMessages.length === 0 ? (
            <div className="chat-placeholder">
              <p>Try one of the spark ideas below or ask your own question.</p>
            </div>
          ) : (
            visibleMessages.map((m, i) => (
              <div key={i} className={`chat-line chat-line-${m.role}`}>
                <div className="chat-bubble">{m.content}</div>
              </div>
            ))
          )}
          {loading && (
            <div className="chat-line chat-line-assistant typing-line">
              <div className="chat-bubble typing-bubble" aria-live="polite">
                <span className="typing-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="typing-text">Letter Buddy is thinking…</span>
              </div>
            </div>
          )}
        </div>

        <div className="alphabet-chatbot-suggestions">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestion(suggestion)}
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="alphabet-chatbot-controls">
          <input
            aria-label="Ask hint or question"
            placeholder="Ask a hint, e.g. 'What sound does it make?'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
            disabled={loading}
          />
          <button type="button" onClick={() => send(input)} disabled={loading || !input.trim()}>{loading ? '...' : 'Ask'}</button>
        </div>
      </div>
    </div>
  );
}
