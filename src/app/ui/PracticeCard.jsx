import React from 'react';
import './PracticeCard.css';
import { synthesizeSpeech } from '../../infrastructure/services/tts/sarvamTtsService';
import AlphabetChatBot from './AlphabetChatBot.jsx';
import { getScriptFontClass } from '../../utils/scriptDetector';

const segmentWord = (word) => {
  if (!word) return [];
  try {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('kn', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(word)).map(entry => entry.segment);
    }
  } catch {
    // Fallback to plain splitting
  }
  return Array.from(word);
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
  const resetKeyRef = React.useRef(0);

  const segments = React.useMemo(() => segmentWord(mainWord), [mainWord]);
  const stageLabel = React.useMemo(() => buildStageLabel(currentWord), [currentWord]);
  const stageTheme = React.useMemo(() => {
    const key = (stageLabel || '').toLowerCase();
    if (key.includes('matra')) return 'matra';
    if (key.includes('word')) return 'words';
    return 'letters';
  }, [stageLabel]);
  const isComplete = React.useMemo(() => slots.every(Boolean), [slots]);
  const progressMeta = React.useMemo(() => {
    const total = sessionProgress?.total ?? 0;
    const current = Math.min(sessionProgress?.current ?? 0, total);
    const safeTotal = Math.max(total, 0);
    return { total: safeTotal, current };
  }, [sessionProgress]);
  const [gardenBloomIndex, setGardenBloomIndex] = React.useState(null);
  const previousProgressRef = React.useRef(progressMeta.current);

  const handleMarkSuccess = React.useCallback(() => {
    onCorrect?.();
    setStatus('correct');
    setFeedback('Locked in! Ready for the next word.');
  }, [onCorrect]);

  const handleMarkStruggle = React.useCallback(() => {
    onWrong?.();
    setStatus('incorrect');
    setFeedback('No worries—let’s fix it together.');
  }, [onWrong]);

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

  React.useEffect(() => {
    const prev = previousProgressRef.current ?? 0;
    if (progressMeta.current > prev) {
      setGardenBloomIndex(progressMeta.current - 1);
    } else if (progressMeta.current === 0) {
      setGardenBloomIndex(null);
    }
    previousProgressRef.current = progressMeta.current;
  }, [progressMeta.current]);

  React.useEffect(() => {
    if (gardenBloomIndex === null || gardenBloomIndex < 0) return;
    const timer = window.setTimeout(() => setGardenBloomIndex(null), 900);
    return () => window.clearTimeout(timer);
  }, [gardenBloomIndex]);

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
    const nextSlot = slots.findIndex(slot => !slot);
    if (nextSlot === -1) {
      return;
    }
    moveTileToSlot(tileId, nextSlot);
  };

  const handleSlotClick = (tileId) => {
    returnTileToPool(tileId);
  };

  const handleCheckAnswer = () => {
    if (!isComplete) return;
    const guess = joinSegments(slots);
    setLastBuilt(guess);
    if (guess === mainWord) {
      if (status !== 'correct') {
        onCorrect?.();
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
      });
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        try { URL.revokeObjectURL(audioUrl); } catch {}
        setSpeaking(false);
      };
      await audio.play().catch(() => {
        setSpeaking(false);
      });
    } catch {
      setSpeaking(false);
    }
  };

  const toggleAnswer = () => {
    const next = !answerVisible;
    setAnswerVisible(next);
    onRevealAnswer?.(next);
  };

  const showHint = status === 'incorrect' && lastBuilt && lastBuilt !== mainWord;
  const mismatchMap = React.useMemo(() => {
    if (!showHint) return new Set();
    const set = new Set();
    const parts = segmentWord(mainWord);
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
      <header className="word-builder-header">
        <div className={`stage-chip stage-chip--${stageTheme}`}>{stageLabel}</div>
        {progressMeta.total > 0 && (
          <div
            className="progress-trail"
            role="img"
            aria-label={`Progress ${progressMeta.current} of ${progressMeta.total}`}
          >
            {Array.from({ length: progressMeta.total }).map((_, idx) => (
              <span
                key={idx}
                className={[
                  'progress-token',
                  idx < progressMeta.current ? 'progress-token--filled' : 'progress-token--empty',
                  `progress-token--${stageTheme}`,
                ].filter(Boolean).join(' ')}
              />
            ))}
          </div>
        )}
        {attemptStats && (
          <div className="progress-chip progress-chip--attempts" aria-label="Attempts">
            ✓ {attemptStats.correct} · ✗ {attemptStats.incorrect}
          </div>
        )}
      </header>

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

      <div className="word-builder-actionbar">
        <button
          type="button"
          className="actionbar-button actionbar-button--success"
          data-testid="btn-correct"
          onClick={handleMarkSuccess}
        >
          ✅ I built it!
        </button>
        <button
          type="button"
          className="actionbar-button actionbar-button--struggle"
          data-testid="btn-wrong"
          onClick={handleMarkStruggle}
        >
          🤔 I need help
        </button>
      </div>

      {progressMeta.total > 0 && (
        <section
          className="word-garden"
          aria-label={`Word garden progress ${progressMeta.current} of ${progressMeta.total}`}
        >
          {Array.from({ length: progressMeta.total }).map((_, idx) => (
            <div
              key={idx}
              className={[
                'word-garden-flower',
                idx < progressMeta.current ? 'word-garden-flower--sprouted' : 'word-garden-flower--seed',
                idx === gardenBloomIndex ? 'word-garden-flower--bloom' : '',
              ].filter(Boolean).join(' ')}
            />
          ))}
        </section>
      )}

      {chatOpen && (
        <AlphabetChatBot
          visible={chatOpen}
          onClose={() => setChatOpen(false)}
          letter={mainWord}
        />
      )}
    </div>
  );
}
