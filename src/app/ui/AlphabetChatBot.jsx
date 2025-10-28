import React from 'react';
import './AlphabetChatBot.css';
import { createChatCompletion } from '../../infrastructure/services/chat/sarvamChatService';
import { synthesizeSpeech } from '../../infrastructure/services/tts/sarvamTtsService';
import { store } from '../../infrastructure/store';
import { addSession, selectUser, setMode } from '../../infrastructure/state/gameSlice';
import { MasteryConfiguration } from '../../domain/value-objects/MasteryConfiguration';
import kannadaWordBank from '../../assets/kannada_words_bank.json';

const toWordEntries = () => {
  if (!Array.isArray(kannadaWordBank)) return [];
  return kannadaWordBank
    .map((entry) => {
      const text = (entry?.wordKannada || entry?.question || '').trim();
      if (!text || !entry?.id) return null;
      const translit = typeof entry?.transliteration === 'string' ? entry.transliteration.trim().toLowerCase() : undefined;
      return {
        id: entry.id,
        text,
        transliteration: translit,
      };
    })
    .filter(Boolean);
};

const KANNADA_WORD_ENTRIES = toWordEntries();

const WORD_LOOKUP_KANNADA = new Map(
  KANNADA_WORD_ENTRIES.map((entry) => [entry.text, entry])
);

const WORD_LOOKUP_ROMAN = new Map(
  KANNADA_WORD_ENTRIES
    .filter((entry) => entry.transliteration)
    .map((entry) => [entry.transliteration, entry])
);

const DEFAULT_MISSION_POOL = KANNADA_WORD_ENTRIES;

function extractPracticeTokens(rawText) {
  const text = rawText || '';
  const kannadaMatches = text.match(/[\u0C80-\u0CFF]+/g) || [];
  const romanMatches = (text.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g) || [])
    .map(token => token.toLowerCase())
    .filter(token => WORD_LOOKUP_ROMAN.has(token));
  const combined = [...kannadaMatches, ...romanMatches];
  return Array.from(new Set(combined.map(token => token.trim()).filter(Boolean)));
}

function lookupWord(token) {
  if (!token) return null;
  const trimmed = token.trim();
  if (!trimmed) return null;
  if (/[\u0C80-\u0CFF]/.test(trimmed)) {
    return WORD_LOOKUP_KANNADA.get(trimmed) ?? null;
  }
  return WORD_LOOKUP_ROMAN.get(trimmed.toLowerCase()) ?? null;
}

function buildPracticePlan(tokens, targetCount) {
  const effectiveCount = Math.max(1, Math.min(targetCount, DEFAULT_MISSION_POOL.length || targetCount));
  const entries = [];
  const missing = [];
  const seenIds = new Set();

  tokens.forEach((token) => {
    const entry = lookupWord(token);
    if (!entry) {
      missing.push(token);
      return;
    }
    if (seenIds.has(entry.id)) return;
    seenIds.add(entry.id);
    entries.push(entry);
  });

  for (const entry of DEFAULT_MISSION_POOL) {
    if (entries.length >= effectiveCount) break;
    if (seenIds.has(entry.id)) continue;
    seenIds.add(entry.id);
    entries.push(entry);
  }

  return {
    entries: entries.slice(0, effectiveCount),
    missing,
  };
}

function createBuddyMissionSession(wordEntries, { mode = 'kannada', learnerId } = {}) {
  if (!Array.isArray(wordEntries) || wordEntries.length === 0) {
    return { success: false, reason: 'noWords' };
  }

  try {
    const state = store.getState();
    const game = state?.game;
    if (!game) {
      return { success: false, reason: 'noState' };
    }

    const requestedUserId = typeof learnerId === 'string' && learnerId.trim() ? learnerId.trim() : game.currentUserId;
    const resolvedUserId = requestedUserId || Object.keys(game.users || {})[0] || null;
    if (!resolvedUserId || !game.users?.[resolvedUserId]) {
      return { success: false, reason: 'noUser' };
    }

    if (game.currentUserId !== resolvedUserId) {
      store.dispatch(selectUser({ userId: resolvedUserId }));
    }

    const refreshedState = store.getState().game;
    const user = refreshedState.users?.[resolvedUserId];
    if (!user) {
      return { success: false, reason: 'noUser' };
    }

    const availableWordIds = new Set(Object.keys(user.words || {}));
    const wordIds = [];
    const missingEntries = [];

    for (const entry of wordEntries) {
      if (entry?.id && availableWordIds.has(entry.id)) {
        wordIds.push(entry.id);
      } else {
        missingEntries.push(entry);
      }
    }

    if (wordIds.length === 0) {
      return { success: false, reason: 'missingWords', missing: missingEntries.map(entry => entry?.text).filter(Boolean) };
    }

    const now = Date.now();
    const sessionId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `buddy_${now}`;

    const initialMastered = wordIds.filter((id) => {
      const word = user.words[id];
      return word && MasteryConfiguration.isMastered(word);
    });

    const session = {
      wordIds,
      currentIndex: 0,
      revealed: false,
      mode: 'practice',
      createdAt: now,
      settings: user.settings,
      stats: {
        totalQuestions: wordIds.length,
        questionsCompleted: 0,
        masteredInSession: 0,
        practicedInSession: 0,
        yetToTry: wordIds.length,
        currentlyMastered: initialMastered.length,
        initiallyMastered: initialMastered.length,
      },
      initialMasteredWords: initialMastered,
    };

    store.dispatch(addSession({ sessionId, session }));
    store.dispatch(setMode({ mode, sessionId }));

    return {
      success: true,
      sessionId,
      total: wordIds.length,
      missing: missingEntries.map(entry => entry?.text).filter(Boolean),
    };
  } catch (error) {
    return { success: false, reason: 'error', error };
  }
}

const buildSystemPrompt = (letter) =>
  `You are a cheerful language buddy for young kids who are exploring the Kannada letter or syllable "${letter}". Reply in English unless the child asks otherwise. Keep answers under four short sentences. Stick to the real sounds, stroke order, and kid-friendly words that actually use the letter(s). If the child gives more than one Kannada character, explain how the characters combine. When the child asks for a practice mission, suggest up to ten real Kannada words and explain how each will earn trophies. Do not invent stories or personify the letter unless the child specifically asks for that. Avoid sharing your inner thoughts.`;

const SUGGESTIONS = [
  'Tell me about this letter',
  'What sound does it make?',
  'Show me an easy word with it.',
  'How can I write it?',
  'Give me a fun fact!',
  'Plan a 10 word mission for me.',
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

export default function AlphabetChatBot({
  visible,
  onClose,
  letter,
  learnerId,
  missionTarget = 10,
  defaultSessionSize = 10,
}) {
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

  const maybeHandlePracticeRequest = React.useCallback(async (rawText) => {
    const text = rawText || '';
    const normalized = text.toLowerCase();
    const mentionsMission = /\b(practice|practise|plan|mission|train|session)\b/.test(normalized);
    const tokens = extractPracticeTokens(text);
    if (!mentionsMission && tokens.length === 0) {
      return false;
    }

    const isExplicitMissionCommand = /\bmission\b/.test(normalized);
    if (!isExplicitMissionCommand && tokens.length === 0) {
      const prompt = 'Tell me the Kannada words you want to practise (Kannada script works best). You can also say “Plan a 5 word mission” and I’ll pick a set for you.';
      setMessages(prev => [...prev, { role: 'assistant', content: prompt }]);
      speak(prompt);
      return true;
    }

    const fallbackCount = missionTarget || defaultSessionSize || Math.min(10, DEFAULT_MISSION_POOL.length || 10);
    const countMatch = normalized.match(/(\d+)\s*(?:new\s+)?(?:words?|letters?)/);
    const requestedCount = countMatch ? Number.parseInt(countMatch[1], 10) : null;
    const desiredCount = Number.isFinite(requestedCount) && requestedCount > 0 ? requestedCount : fallbackCount;

    const { entries, missing } = buildPracticePlan(tokens, desiredCount);

    if (mentionsMission && entries.length === 0) {
      const exampleList = DEFAULT_MISSION_POOL.slice(0, Math.min(6, DEFAULT_MISSION_POOL.length))
        .map(entry => entry.text)
        .join(', ');
      const guidance = missing.length > 0
        ? `I couldn't match ${missing.join(', ')}. Try typing those words in Kannada script, or pick from examples like ${exampleList}.`
        : `Tell me the Kannada words you'd like to practise, or say something like "Plan a 5 word mission" and I'll choose some for you.`;
      setMessages(prev => [...prev, { role: 'assistant', content: guidance }]);
      speak(guidance);
      return true;
    }

    if (entries.length === 0) {
      return false;
    }

    const sessionResult = createBuddyMissionSession(entries, { mode: 'kannada', learnerId });
    const trophyLabel = entries.length === 1 ? '1 trophy' : `${entries.length} trophies`;
    const missionLines = entries
      .map((entry, idx) => `${idx + 1}. ${entry.text}${entry.transliteration ? ` (${entry.transliteration})` : ''}`)
      .join('\n');

    const parts = [
      `Mission ready! We're practising ${entries.length === 1 ? '1 word' : `${entries.length} words`} for ${trophyLabel}.`,
      missionLines,
    ];

    if (missing.length > 0) {
      parts.push(`I couldn't find ${missing.join(', ')} in our library yet, so I picked the best-fitting words I have.`);
    }

    if (sessionResult.success) {
      parts.push('I loaded them into your practice deck. Tap the yellow tiles to hear each sound as you build!');
      if (sessionResult.missing && sessionResult.missing.length > 0) {
        parts.push(`A few words were missing audio: ${sessionResult.missing.join(', ')}. I skipped those for now.`);
      }
    } else {
      if (sessionResult.reason === 'noUser') {
        parts.push('I need a learner profile to load the mission. Choose a profile on the home screen and ask me again.');
      } else if (sessionResult.reason === 'missingWords') {
        const missingList = sessionResult.missing?.join(', ');
        parts.push(`I couldn't find those words in our deck yet${missingList ? ` (${missingList})` : ''}, but you can still ask me about their sounds here.`);
      } else {
        parts.push('I ran into a hiccup while loading the mission, but you can still practise the list with me.');
      }
    }

    parts.push(`I'm right here—when you finish, tell me what you'd like to practise next.`);

    const responseText = parts.filter(Boolean).join('\n\n');
    setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    speak(responseText);
    return true;
  }, [defaultSessionSize, learnerId, missionTarget, speak]);

  const send = React.useCallback(async (userText) => {
    if (!userText || !userText.trim()) return;
    const userMsg = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const handled = await maybeHandlePracticeRequest(userText);
      if (handled) {
        setLoading(false);
        return;
      }
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
  }, [messages, maybeHandlePracticeRequest, speak]);

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
    let message = prompt;
    if (prompt === 'Tell me about this letter') {
      message = `Tell me about this letter: ${letter}`;
    } else if (prompt.toLowerCase().includes('mission')) {
      const goal = missionTarget || defaultSessionSize || Math.min(10, DEFAULT_MISSION_POOL.length || 10);
      message = `Can you plan a ${goal} word practice mission for me?`;
    }
    send(message);
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
