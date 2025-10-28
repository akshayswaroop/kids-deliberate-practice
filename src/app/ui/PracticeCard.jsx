import React from 'react';
import './PracticeCard.css';
import { synthesizeSpeech } from '../../infrastructure/services/tts/sarvamTtsService';
import AlphabetChatBot from './AlphabetChatBot.jsx';
import { getScriptFontClass } from '../../utils/scriptDetector';
import kannadaAlphabetBank from '../../assets/kannada_alphabets_bank.json';

const extractOrdinal = (id = '') => {
  const match = id.match(/_(\d+)_?/);
  return match ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
};

const vowels = (Array.isArray(kannadaAlphabetBank) ? kannadaAlphabetBank : [])
  .filter(entry => typeof entry?.id === 'string' && entry.id.startsWith('vowel_'))
  .sort((a, b) => extractOrdinal(a.id) - extractOrdinal(b.id));

const consonants = (Array.isArray(kannadaAlphabetBank) ? kannadaAlphabetBank : [])
  .filter(entry => typeof entry?.id === 'string' && entry.id.startsWith('consonant_'))
  .sort((a, b) => extractOrdinal(a.id) - extractOrdinal(b.id));

const padIndex = (value) => String(value).padStart(2, '0');

const LETTER_AUDIO_FILE_MAP = new Map(
  [
    ...vowels.map((entry, idx) => [entry.question.trim(), `swaragalu_${padIndex(idx + 1)}`]),
    ...consonants.map((entry, idx) => [entry.question.trim(), `vyanjanagalu_${padIndex(idx + 1)}`]),
  ],
);

const LETTER_AUDIO_ID_LOOKUP = new Map(
  (Array.isArray(kannadaAlphabetBank) ? kannadaAlphabetBank : [])
    .filter((entry) => entry?.question && entry?.id)
    .map((entry) => [entry.question.trim(), entry.id])
);

const MATRA_AUDIO_FILE_MAP = {
  'ಾ': 'matregalu_01',
  'ಿ': 'matregalu_02',
  'ೀ': 'matregalu_03',
  'ು': 'matregalu_04',
  'ೂ': 'matregalu_05',
  'ೃ': 'matregalu_06',
  'ೆ': 'matregalu_07',
  'ೇ': 'matregalu_08',
  'ೈ': 'matregalu_09',
  'ೊ': 'matregalu_10',
  'ೋ': 'matregalu_11',
  'ೌ': 'matregalu_12',
};

const SEGMENT_AUDIO_FILE_MAP = new Map([
  ...LETTER_AUDIO_FILE_MAP,
  ...Object.entries(MATRA_AUDIO_FILE_MAP),
]);

const MATRA_AUDIO_ID_MAP = {
  'ಾ': 'matra_long_aa',
  'ಿ': 'matra_short_i',
  'ೀ': 'matra_long_ii',
  'ು': 'matra_short_u',
  'ೂ': 'matra_long_uu',
  'ೃ': 'matra_ru',
  'ೆ': 'matra_short_e',
  'ೇ': 'matra_long_ee',
  'ೈ': 'matra_ai',
  'ೊ': 'matra_short_o',
  'ೋ': 'matra_long_oo',
  'ೌ': 'matra_au',
  'ಂ': 'anusvara',
  'ಃ': 'visarga',
  '್': 'virama',
};

const getSegmentAudioId = (segment) => {
  if (!segment) return undefined;
  const trimmed = segment.trim();
  return LETTER_AUDIO_ID_LOOKUP.get(trimmed) || MATRA_AUDIO_ID_MAP[trimmed] || undefined;
};

const JOURNEY_STAGES = [
  { key: 'letters', label: 'Letters' },
  { key: 'matra', label: 'Matra Combos' },
  { key: 'words', label: 'Word Builder' },
];

const splitKannadaSyllable = (value) => {
  if (!value) return [];
  const chars = Array.from(value);
  if (chars.length === 1) return chars;
  const base = chars[0];
  const rest = chars.slice(1);
  return [base, ...rest];
};

const segmentWord = (word, wordDetails) => {
  if (!word) return [];
  const processed = splitKannadaSyllable(word);
  if (processed.length > 1) {
    return processed.map(part => part.trim()).filter(Boolean);
  }
  try {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('kn', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(word)).map(entry => entry.segment);
    }
  } catch {
    // Fallback to plain splitting
  }
  const fallback = Array.from(word);
  if (fallback.length <= 1 && wordDetails?.answer && wordDetails.answer.includes('+')) {
    const parts = wordDetails.answer
      .split('+')
      .map(part => part.trim())
      .filter(Boolean);
    if (parts.length > 1) {
      return parts;
    }
  }
  return fallback;
};

const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const buildStageLabel = (word) => {
  const category = word?.category;
  if (category === 'letter') return 'Letters';
  if (category === 'matra') return 'Matra Combos';
  if (category === 'word') return 'Words';
  const level = word?.complexityLevel ?? 1;
  if (level <= 1) return 'Letters';
  if (level === 2) return 'Matra Combos';
  return 'Words';
};

const joinSegments = (segments) => segments.map(tile => tile?.value ?? '').join('');

function WordTile({ tile, onClick, onDragStart, onDragEnd, draggable, isDragging, className = '' }) {
  if (!tile) return null;
  return (
    <button
      type="button"
      className={[
        'word-tile',
        isDragging ? 'word-tile--dragging' : '',
        className,
      ].filter(Boolean).join(' ')}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      data-segment={tile.value}
    >
      {tile.value}
    </button>
  );
}

export default function PracticeCard({
  mainWord,
  wordId,
  transliteration,
  answer,
  notes,
  onCorrect,
  onWrong,
  onNext,
  onRevealAnswer,
  isAnswerRevealed,
  currentUserId,
  sessionProgress,
  sessionStats,
  attemptStats,
  currentWord,
}) {
  const [pool, setPool] = React.useState([]);
  const [slots, setSlots] = React.useState([]);
  const [status, setStatus] = React.useState('building'); // building | checking | correct | incorrect
  const [feedback, setFeedback] = React.useState('');
  const [speaking, setSpeaking] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [answerVisible, setAnswerVisible] = React.useState(!!isAnswerRevealed);
  const [lastBuilt, setLastBuilt] = React.useState('');
  const [draggingId, setDraggingId] = React.useState(null);
  const [slotMatches, setSlotMatches] = React.useState([]);
  const [slotFlashes, setSlotFlashes] = React.useState([]);
  const [showTrophy, setShowTrophy] = React.useState(false);
  const [trophyBurstKey, setTrophyBurstKey] = React.useState(0);
  const trophyTimeoutRef = React.useRef(null);
  const nextAdvanceRef = React.useRef(null);
  const resetKeyRef = React.useRef(0);
  const segmentAudioCacheRef = React.useRef(new Map());
  const segmentAudioInflightRef = React.useRef(new Map());
  const lastPlayedAudioRef = React.useRef(null);

  const playUrl = React.useCallback((url, { revokeOnEnd = false } = {}) => {
    if (!url) return Promise.resolve();

    if (lastPlayedAudioRef.current) {
      try {
        lastPlayedAudioRef.current.pause();
        lastPlayedAudioRef.current.currentTime = 0;
      } catch {
        // ignore pause errors
      }
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      lastPlayedAudioRef.current = audio;

      const cleanup = (shouldRevoke = revokeOnEnd) => {
        if (lastPlayedAudioRef.current === audio) {
          lastPlayedAudioRef.current = null;
        }
        if (shouldRevoke && url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(url);
          } catch {
            // ignore revoke errors
          }
        }
      };

      audio.onended = () => {
        cleanup(true);
        resolve();
      };

      audio.onerror = () => {
        cleanup(true);
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch((error) => {
        cleanup(true);
        reject(error);
      });
    });
  }, []);

  const speakWithWebSpeech = React.useCallback((text) => {
    if (typeof window === 'undefined' || !text) return false;
    const { speechSynthesis, SpeechSynthesisUtterance } = window;
    if (!speechSynthesis || typeof SpeechSynthesisUtterance !== 'function') {
      return false;
    }
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'kn-IN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }, []);

  const segments = React.useMemo(() => segmentWord(mainWord, currentWord), [mainWord, currentWord]);
  const stageLabel = React.useMemo(() => buildStageLabel(currentWord), [currentWord]);
  const stageTheme = React.useMemo(() => {
    const key = (stageLabel || '').toLowerCase();
    if (key.includes('matra')) return 'matra';
    if (key.includes('word')) return 'words';
    return 'letters';
  }, [stageLabel]);
  const isComplete = React.useMemo(() => slots.every(Boolean), [slots]);
  const fetchSegmentAudio = React.useCallback((segment) => {
    const trimmed = segment?.trim();
    if (!trimmed) return Promise.resolve(null);

    const staticFile = SEGMENT_AUDIO_FILE_MAP.get(trimmed);
    if (staticFile) {
      const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
      const url = `${base}/audio/kannada/${staticFile}.wav`;
      const payload = { url, isObjectUrl: false };
      segmentAudioCacheRef.current.set(trimmed, payload);
      return Promise.resolve(payload);
    }

    const cached = segmentAudioCacheRef.current.get(trimmed);
    if (cached) {
      return Promise.resolve(cached);
    }

    const inflight = segmentAudioInflightRef.current.get(trimmed);
    if (inflight) {
      return inflight;
    }

    const wordId = getSegmentAudioId(trimmed);
    const promise = synthesizeSpeech(trimmed, {
      target_language_code: 'kn-IN',
      enable_preprocessing: true,
      wordId,
      speech_sample_rate: 22050,
    })
      .then(({ audioUrl }) => {
        const payload = {
          url: audioUrl,
          isObjectUrl: audioUrl.startsWith('blob:'),
        };
        segmentAudioCacheRef.current.set(trimmed, payload);
        segmentAudioInflightRef.current.delete(trimmed);
        return payload;
      })
      .catch((error) => {
        segmentAudioInflightRef.current.delete(trimmed);
        throw error;
      });

    segmentAudioInflightRef.current.set(trimmed, promise);
    return promise;
  }, []);

  const playSegmentSound = React.useCallback(async (segment) => {
    const trimmed = segment?.trim();
    if (!trimmed) return;

    try {
      const payload = await fetchSegmentAudio(trimmed);
      if (!payload || !payload.url) return;
      await playUrl(payload.url, { revokeOnEnd: payload.isObjectUrl });
    } catch {
      segmentAudioCacheRef.current.delete(trimmed);
      try {
        const { audioUrl } = await synthesizeSpeech(trimmed, {
          target_language_code: 'kn-IN',
          enable_preprocessing: true,
        });
        await playUrl(audioUrl, { revokeOnEnd: true });
        return;
      } catch {
        // ignore and try web speech fallback
      }
      speakWithWebSpeech(trimmed);
    }
  }, [fetchSegmentAudio, playUrl, speakWithWebSpeech]);
  const missionStats = React.useMemo(() => {
    const total = sessionStats?.totalQuestions ?? sessionProgress?.total ?? 0;
    const mastered = sessionStats?.masteredInSession ?? 0;
    const attempted = sessionStats?.questionsCompleted ?? sessionProgress?.current ?? 0;
    const safeTotal = Math.max(total, 0);
    const safeTrophies = Math.min(Math.max(mastered, 0), safeTotal || mastered);
    const safeAttempted = Math.min(Math.max(attempted, 0), safeTotal || attempted);
    return {
      total: safeTotal,
      trophies: safeTrophies,
      attempted: safeAttempted,
    };
  }, [sessionProgress, sessionStats]);
  const missionTarget = missionStats.total || 10;
  const trophyCount = Math.min(missionStats.trophies, missionTarget);
  const attemptedCount = Math.min(missionStats.attempted, missionTarget);
  const missionPercent = missionTarget > 0 ? Math.min(100, Math.round((trophyCount / missionTarget) * 100)) : 0;
  const currentJourneyIndex = React.useMemo(() => {
    const idx = JOURNEY_STAGES.findIndex(stage => stage.key === stageTheme);
    return idx === -1 ? 0 : idx;
  }, [stageTheme]);

  React.useEffect(() => {
    setAnswerVisible(!!isAnswerRevealed);
  }, [isAnswerRevealed]);

  React.useEffect(() => {
    const startTiles = segments.map((segment, index) => ({
      id: `${wordId || 'word'}-${index}-${segment}-${Math.random().toString(36).slice(2)}`,
      value: segment,
    }));
    setPool(shuffle(startTiles));
    setSlots(Array(segments.length).fill(null));
    setStatus('building');
    setFeedback('');
    setLastBuilt('');
    setDraggingId(null);
    setAnswerVisible(false);
    setSlotMatches(Array(segments.length).fill(false));
    setSlotFlashes(Array(segments.length).fill(null));
    resetKeyRef.current += 1;
  }, [mainWord, segments.length, wordId, currentUserId]);

  const updateSlotMatches = React.useCallback((nextSlots) => {
    setSlotMatches(nextSlots.map((tile, idx) => Boolean(tile && tile.value === segments[idx])));
  }, [segments]);

  const triggerSlotFlash = React.useCallback((slotIndex, type) => {
    const flashKey = Date.now();
    setSlotFlashes(prev => {
      const baseline = prev && prev.length ? [...prev] : [];
      baseline[slotIndex] = { type, key: flashKey };
      return baseline;
    });
    if (type === 'wrong') {
      window.setTimeout(() => {
        setSlotFlashes(prev => {
          if (!prev || prev[slotIndex]?.key !== flashKey) return prev;
          const next = [...prev];
          next[slotIndex] = null;
          return next;
        });
      }, 600);
    }
  }, []);

  const moveTileToSlot = React.useCallback((tileId, slotIndex) => {
    setPool(prevPool => {
      const tileFromPoolIdx = prevPool.findIndex(tile => tile.id === tileId);
      const tileFromSlotIdx = slots.findIndex(tile => tile?.id === tileId);
      let tile = null;
      let nextPool = prevPool;
      let nextSlots = [...slots];

      if (tileFromPoolIdx >= 0) {
        tile = prevPool[tileFromPoolIdx];
        nextPool = [...prevPool];
        nextPool.splice(tileFromPoolIdx, 1);
      } else if (tileFromSlotIdx >= 0) {
        tile = slots[tileFromSlotIdx];
        nextSlots[tileFromSlotIdx] = null;
      } else {
        return prevPool;
      }

      const displaced = nextSlots[slotIndex];
      nextSlots[slotIndex] = tile;
      if (displaced) {
        nextPool = [...nextPool, displaced];
      }
      setSlots(nextSlots);
      updateSlotMatches(nextSlots);
      if (tile) {
        const isMatch = tile.value === segments[slotIndex];
        triggerSlotFlash(slotIndex, isMatch ? 'correct' : 'wrong');
      }
      return nextPool;
    });
  }, [slots, segments, triggerSlotFlash, updateSlotMatches]);

  const returnTileToPool = React.useCallback((tileId) => {
    setPool(prevPool => {
      if (prevPool.some(tile => tile.id === tileId)) {
        return prevPool;
      }
      const slotIndex = slots.findIndex(tile => tile?.id === tileId);
      if (slotIndex === -1) {
        return prevPool;
      }
      const tile = slots[slotIndex];
      const nextSlots = [...slots];
      nextSlots[slotIndex] = null;
      setSlots(nextSlots);
      updateSlotMatches(nextSlots);
      setSlotFlashes(prev => {
        if (!prev || !prev.length) return prev;
        const next = [...prev];
        next[slotIndex] = null;
        return next;
      });
      return [...prevPool, tile];
    });
  }, [slots, updateSlotMatches]);

  const handleDropOnSlot = (event, slotIndex) => {
    event.preventDefault();
    const tileId = event.dataTransfer?.getData('text/plain') || draggingId;
    if (!tileId) return;
    moveTileToSlot(tileId, slotIndex);
    setDraggingId(null);
  };

  const handleDropOnPool = (event) => {
    event.preventDefault();
    const tileId = event.dataTransfer?.getData('text/plain') || draggingId;
    if (!tileId) return;
    returnTileToPool(tileId);
    setDraggingId(null);
  };

  const handleTileClick = (tileId) => {
    const tile = pool.find(item => item.id === tileId);
    if (tile) {
      void playSegmentSound(tile.value);
    }
    const nextSlot = slots.findIndex(slot => !slot);
    if (nextSlot === -1) {
      return;
    }
    moveTileToSlot(tileId, nextSlot);
  };

  const handleSlotClick = (tileId) => {
    const tile = slots.find(slot => slot?.id === tileId);
    if (tile) {
      void playSegmentSound(tile.value);
    }
    returnTileToPool(tileId);
  };

  const handleCheckAnswer = () => {
    if (!isComplete) return;
    const guess = joinSegments(slots);
    setLastBuilt(guess);
    if (guess === mainWord) {
      if (status !== 'correct') {
        onCorrect?.();
        triggerTrophy();
        if (nextAdvanceRef.current) {
          window.clearTimeout(nextAdvanceRef.current);
        }
        nextAdvanceRef.current = window.setTimeout(() => {
          onNext?.();
          nextAdvanceRef.current = null;
        }, 1500);
      }
      setStatus('correct');
      setFeedback('Brilliant! You built it perfectly.');
    } else {
      onWrong?.();
      setStatus('incorrect');
      setFeedback('Almost there! Swap the tiles to fix the word.');
    }
  };

  const handleResetBoard = () => {
    const startTiles = segments.map((segment, index) => ({
      id: `${wordId || 'word'}-${index}-${segment}-${Math.random().toString(36).slice(2)}`,
      value: segment,
    }));
    setPool(shuffle(startTiles));
    setSlots(Array(segments.length).fill(null));
    setStatus('building');
    setFeedback('');
    setLastBuilt('');
    setDraggingId(null);
    setSlotMatches(Array(segments.length).fill(false));
    setSlotFlashes(Array(segments.length).fill(null));
    setShowTrophy(false);
    if (trophyTimeoutRef.current) {
      window.clearTimeout(trophyTimeoutRef.current);
      trophyTimeoutRef.current = null;
    }
    if (nextAdvanceRef.current) {
      window.clearTimeout(nextAdvanceRef.current);
      nextAdvanceRef.current = null;
    }
    if (answerVisible) {
      setAnswerVisible(false);
      onRevealAnswer?.(false);
    }
  };

  const handleSpeak = async () => {
    if (!mainWord) return;
    setSpeaking(true);
    try {
      const { audioUrl } = await synthesizeSpeech(mainWord, {
        target_language_code: 'kn-IN',
        enable_preprocessing: true,
        wordId: (currentWord?.id ?? wordId) || undefined,
        speech_sample_rate: 22050,
      });
      await playUrl(audioUrl, { revokeOnEnd: true });
    } catch {
      const spoke = speakWithWebSpeech(mainWord);
      if (!spoke) {
        // optional: could surface UI feedback later
      }
    } finally {
      setSpeaking(false);
    }
  };

  const toggleAnswer = () => {
    const next = !answerVisible;
    setAnswerVisible(next);
    onRevealAnswer?.(next);
  };

  const triggerTrophy = React.useCallback(() => {
    setTrophyBurstKey(prev => prev + 1);
    setShowTrophy(true);
    if (trophyTimeoutRef.current) {
      window.clearTimeout(trophyTimeoutRef.current);
    }
    trophyTimeoutRef.current = window.setTimeout(() => {
      setShowTrophy(false);
      trophyTimeoutRef.current = null;
    }, 1600);
  }, []);

  React.useEffect(() => {
    return () => {
      segmentAudioCacheRef.current.forEach((entry) => {
        if (entry?.isObjectUrl) {
          try {
            URL.revokeObjectURL(entry.url);
          } catch {
            // ignore revoke errors
          }
        }
      });
      segmentAudioCacheRef.current.clear();
      segmentAudioInflightRef.current.clear();
      if (lastPlayedAudioRef.current) {
        try {
          lastPlayedAudioRef.current.pause();
        } catch {
          // ignore pause errors
        }
        lastPlayedAudioRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (trophyTimeoutRef.current) {
        window.clearTimeout(trophyTimeoutRef.current);
      }
      if (nextAdvanceRef.current) {
        window.clearTimeout(nextAdvanceRef.current);
      }
    };
  }, []);

  const showHint = status === 'incorrect' && lastBuilt && lastBuilt !== mainWord;
  const mismatchMap = React.useMemo(() => {
    if (!showHint) return new Set();
    const set = new Set();
    const parts = segmentWord(mainWord, currentWord);
    slots.forEach((tile, index) => {
      if (!tile) return;
      if (tile.value !== parts[index]) {
        set.add(tile.id);
      }
    });
    return set;
  }, [showHint, slots, mainWord]);

  return (
    <div
      className={`word-builder-shell word-builder-shell--${stageTheme}`}
      data-testid="practice-root"
    >
      {showTrophy && (
        <div
          key={trophyBurstKey}
          className="trophy-burst"
          role="status"
          aria-live="polite"
          aria-label="Trophy earned! Great job."
        >
          <span className="trophy-burst__icon" aria-hidden="true">
            🏆
          </span>
          {Array.from({ length: 6 }).map((_, idx) => (
            <span
              key={idx}
              className={`trophy-burst__confetti trophy-burst__confetti--${idx + 1}`}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
      <header className="word-builder-header">
        <div className={`stage-chip stage-chip--${stageTheme}`}>{stageLabel}</div>
        {missionTarget > 0 && (
          <div className="progress-stack" aria-live="polite">
            <div
              className="progress-trail"
              role="img"
              aria-label={`Trophies ${trophyCount} of ${missionTarget}`}
            >
              {Array.from({ length: missionTarget }).map((_, idx) => {
                const tokenClass = idx < trophyCount
                  ? 'progress-token--filled'
                  : idx < attemptedCount
                    ? 'progress-token--attempted'
                    : 'progress-token--empty';
                return (
                  <span
                    key={idx}
                    className={['progress-token', tokenClass].join(' ')}
                  />
                );
              })}
            </div>
            <span className="progress-stack__label">🏆 {trophyCount} / {missionTarget}</span>
          </div>
        )}
        {attemptStats && (
          <div className="progress-chip progress-chip--attempts" aria-label="Attempts">
            ✓ {attemptStats.correct} · ✗ {attemptStats.incorrect}
          </div>
        )}
      </header>

      {missionTarget > 0 && (
        <section
          className="mission-banner"
          aria-label={`Mission progress ${trophyCount} of ${missionTarget} trophies`}
        >
          <div className="mission-banner__copy">
            <span className="mission-banner__title">Today's mission</span>
            <span className="mission-banner__subtitle">
              Earn {missionTarget} trophies to finish this quest.
            </span>
          </div>
          <div className="mission-banner__progress">
            <div
              className="mission-banner__meter"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={missionTarget}
              aria-valuenow={trophyCount}
            >
              <span
                className="mission-banner__meter-fill"
                style={{ width: `${missionPercent}%` }}
              />
            </div>
            <span className="mission-banner__count">{trophyCount} / {missionTarget}</span>
          </div>
        </section>
      )}

      <section className="journey-rail" aria-label="Learning journey milestones">
        {JOURNEY_STAGES.map((stage, idx) => {
          const status = idx < currentJourneyIndex ? 'complete' : idx === currentJourneyIndex ? 'current' : 'upcoming';
          return (
            <div key={stage.key} className={`journey-step journey-step--${status}`}>
              <div className="journey-step__marker">
                {status === 'complete' ? '✓' : idx + 1}
              </div>
              <div className="journey-step__body">
                <span className="journey-step__label">{stage.label}</span>
                <span className="journey-step__status">
                  {status === 'complete' ? 'Completed' : status === 'current' ? 'In progress' : 'Next up'}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      <section className="listen-row" aria-live="polite">
        <div>
          <p className="listen-title">Listen and build the word</p>
          {transliteration && <p className="listen-subtitle">{transliteration}</p>}
        </div>
        <div className="listen-actions">
          <button
            type="button"
            className="listen-button"
            onClick={handleSpeak}
            disabled={speaking}
          >
            {speaking ? 'Playing…' : '🔊 Hear it'}
          </button>
          <button
            type="button"
            className="listen-button listen-button--ghost"
            onClick={handleResetBoard}
          >
            ↺ Reset
          </button>
        </div>
      </section>

      <section className="word-board" aria-label="Word construction area">
        {slots.map((tile, index) => {
          const tileId = tile?.id;
          const isDragging = draggingId === tileId;
          const hasMismatch = mismatchMap.has(tileId);
          const match = slotMatches[index];
          const flash = slotFlashes[index];
          const slotClass = [
            'word-slot',
            tile ? 'word-slot--filled' : '',
            hasMismatch ? 'word-slot--hint' : '',
            match ? 'word-slot--settled' : '',
            flash?.type === 'correct' ? 'word-slot--flash-correct' : '',
            flash?.type === 'wrong' ? 'word-slot--flash-wrong' : '',
          ].filter(Boolean).join(' ');
          return (
            <div
              key={`${resetKeyRef.current}-${index}`}
              className={slotClass}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDropOnSlot(event, index)}
              role="button"
              tabIndex={0}
              onClick={() => tile && handleSlotClick(tile.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  if (tile) handleSlotClick(tile.id);
                }
              }}
              aria-label={tile ? `Slot ${index + 1}, occupied with ${tile.value}` : `Empty slot ${index + 1}`}
            >
              <WordTile
                tile={tile}
                draggable
                onClick={() => tile && handleSlotClick(tile.id)}
                onDragStart={(event) => {
                  if (!tile) return;
                  setDraggingId(tile.id);
                  event.dataTransfer?.setData('text/plain', tile.id);
                  event.dataTransfer?.setDragImage?.(event.currentTarget, 20, 20);
                }}
                onDragEnd={() => setDraggingId(null)}
                isDragging={isDragging}
                className={[
                  match ? 'word-tile--settled' : '',
                  flash?.type === 'correct' ? 'word-tile--flash-correct' : '',
                  flash?.type === 'wrong' ? 'word-tile--flash-wrong' : '',
                ].filter(Boolean).join(' ')}
              />
            </div>
          );
        })}
      </section>

      <section
        className="word-pool"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDropOnPool}
        aria-label="Letter tiles to drag"
      >
        {pool.length === 0 ? (
          <p className="word-pool__empty">All tiles placed. Tap a tile to move it back.</p>
        ) : (
          pool.map(tile => (
            <WordTile
              key={tile.id}
              tile={tile}
              draggable
              isDragging={draggingId === tile.id}
              onClick={() => handleTileClick(tile.id)}
              onDragStart={(event) => {
                setDraggingId(tile.id);
                event.dataTransfer?.setData('text/plain', tile.id);
                event.dataTransfer?.setDragImage?.(event.currentTarget, 20, 20);
              }}
              onDragEnd={() => setDraggingId(null)}
            />
          ))
        )}
      </section>

      {feedback && (
        <div className={`word-builder-feedback word-builder-feedback--${status}`}>
          <span role="img" aria-hidden="true">{status === 'correct' ? '🌟' : '💡'}</span>
          <span>{feedback}</span>
        </div>
      )}

      {answerVisible && (answer || notes) && (
        <aside className="word-builder-answer">
          <h3>Answer key</h3>
          {answer && <p className={getScriptFontClass(answer)}>{answer}</p>}
          {notes && <p className="answer-notes">{notes}</p>}
        </aside>
      )}

      <footer className="word-builder-controls">
        <button
          type="button"
          className="control-button control-button--primary"
          onClick={handleCheckAnswer}
          disabled={!isComplete || status === 'correct'}
        >
          Check my word
        </button>
        <button
          type="button"
          className="control-button"
          onClick={toggleAnswer}
        >
          {answerVisible ? 'Hide hints' : 'Show hints'}
        </button>
        <button
          type="button"
          className="control-button control-button--buddy"
          onClick={() => setChatOpen(true)}
        >
          <span className="buddy-avatar" aria-hidden="true">
            <span className="buddy-face">
              <span className="buddy-eye buddy-eye--left" />
              <span className="buddy-eye buddy-eye--right" />
              <span className="buddy-smile" />
            </span>
            <span className="buddy-body" />
          </span>
          <span className="buddy-label">Ask Letter Buddy</span>
        </button>
        <button
          type="button"
          className="control-button control-button--next"
          data-testid="btn-next"
          onClick={onNext}
          disabled={status !== 'correct'}
        >
          Next word →
        </button>
      </footer>

      {chatOpen && (
        <AlphabetChatBot
          visible={chatOpen}
          onClose={() => setChatOpen(false)}
          letter={mainWord}
          learnerId={currentUserId ?? null}
          missionTarget={missionTarget}
          defaultSessionSize={missionTarget}
        />
      )}
    </div>
  );
}
