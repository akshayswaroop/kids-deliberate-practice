import { describe, it, expect } from 'vitest';
import reducer, { addSession, attempt, nextCard } from '../slice';
import { selectSessionWords } from '../sessionGen';
import { getInitialWords } from '../../../app/bootstrapState';
import type { RootState, Session } from '../state';

// Deterministic RNG for tests
function rngFactory(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('Master all English words', () => {
  it('should iterate sessions of 12 until all english words are mastered', () => {
    const allWords = getInitialWords();

    let state: RootState = {
      users: {
        user_master: {
          words: allWords,
          sessions: {},
          activeSessions: {},
          settings: {
            selectionWeights: { struggle: 0.5, new: 0.4, mastered: 0.1 },
            sessionSizes: { english: 12 },
            languages: ['english'],
            complexityLevels: { english: 1, kannada: 1, hindi: 1 },
          },
        },
      },
      currentUserId: 'user_master',
    };

    const rng = rngFactory(12345);

    // Helper to check if any english words remain unmastered
    function anyUnmastered(s: RootState) {
      return Object.values(s.users.user_master.words).some(w => w.language === 'english' && w.step < 5);
    }

    const totalEnglish = Object.values(state.users.user_master.words).filter(w => w.language === 'english').length;
    let iteration = 0;
    // Tighter cap: expected batches + small margin (reviews/cooldowns)
    const expectedBatches = Math.ceil(totalEnglish / state.users.user_master.settings.sessionSizes.english);
    const maxIterations = expectedBatches + 6;

    while (anyUnmastered(state) && iteration < maxIterations) {
      iteration += 1;

  const allWordsArr = Object.values(state.users.user_master.words);
  const englishAllWordsArr = allWordsArr.filter(w => w.language === 'english');

      // Snapshot available buckets BEFORE selection to assert composition
  // Operate on English-only words for selection (app would filter by language before selection)
  const availNew = englishAllWordsArr.filter(w => w.step === 0 && w.attempts.length === 0);
  const availStruggle = englishAllWordsArr.filter(w => w.step >= 1 && w.step <= 4);
  const availMastered = englishAllWordsArr.filter(w => w.step === 5 && w.cooldownSessionsLeft === 0);

      const weights = state.users.user_master.settings.selectionWeights;
      const size = state.users.user_master.settings.sessionSizes.english;
      const totalWeight = weights.struggle + weights.new + weights.mastered;
      const desiredStruggle = Math.round((weights.struggle / totalWeight) * size);
      const desiredNew = Math.round((weights.new / totalWeight) * size);
      const desiredMastered = size - desiredStruggle - desiredNew;

      const wordIds = selectSessionWords(
        englishAllWordsArr,
        state.users.user_master.settings.selectionWeights,
        size,
        rng
      );

      // Count selected by bucket
  const selNewCount = wordIds.filter(id => availNew.some(w => w.id === id)).length;
      const selStruggleCount = wordIds.filter(id => availStruggle.some(w => w.id === id)).length;
      const selMasteredCount = wordIds.filter(id => availMastered.some(w => w.id === id)).length;

      // If all buckets have enough items, selection should match desired proportions exactly
      const allBucketsHaveEnough =
        availStruggle.length >= desiredStruggle &&
        availNew.length >= desiredNew &&
        availMastered.length >= desiredMastered;

      if (allBucketsHaveEnough) {
        expect(selStruggleCount).toBe(desiredStruggle);
        expect(selNewCount).toBe(desiredNew);
        expect(selMasteredCount).toBe(desiredMastered);
      } else {
        // Otherwise ensure counts are sensible: none exceed availability
        expect(selStruggleCount).toBeLessThanOrEqual(availStruggle.length);
        expect(selNewCount).toBeLessThanOrEqual(availNew.length);
        expect(selMasteredCount).toBeLessThanOrEqual(availMastered.length);
        // Allow for fallback selections (mastered words with cooldowns)
        const selectedFromPrimary = selStruggleCount + selNewCount + selMasteredCount;
        const fallbackPool = englishAllWordsArr.filter(w => w.step === 5 && w.cooldownSessionsLeft > 0);
        const otherSelected = wordIds.length - selectedFromPrimary;
        expect(otherSelected).toBeLessThanOrEqual(fallbackPool.length);
      }

      // Create a session and simulate mastering all words in it
      const sid = `s_${iteration}`;
      const session: Session = {
        wordIds,
        currentIndex: 0,
        revealed: false,
        mode: 'practice',
        createdAt: Date.now(),
        settings: state.users.user_master.settings,
      };

      // Print selected English words for this session for review
      const wordsForPrint = wordIds.map(id => state.users.user_master.words[id].text);
      // eslint-disable-next-line no-console
      console.log(`Session ${iteration} (${wordIds.length}):`, wordsForPrint.join(', '));

      state = reducer(state, addSession({ sessionId: sid, session }));

      // For each word in the session, perform 5 correct attempts
      for (const id of wordIds) {
        for (let i = 0; i < 5; i++) {
          state = reducer(state, attempt({ sessionId: sid, wordId: id, result: 'correct' }));
        }
      }

      // Trigger nextCard to mark needsNewSession if appropriate
      state = reducer(state, nextCard({ sessionId: sid }));
    }

    // Assert we finished in reasonable iterations
    expect(iteration).toBeLessThanOrEqual(maxIterations);

    // All english words should be mastered (step === 5)
    const unmastered = Object.values(state.users.user_master.words).filter(w => w.language === 'english' && w.step < 5);
    expect(unmastered.length).toBe(0);
  });
});

describe('Small bank odd session handling', () => {
  it('should handle a 5-word bank with session size 2 until all are mastered and print sessions', () => {
    // Create a tiny English-only word bank (5 words)
    const words = ['one', 'two', 'three', 'four', 'five'];
    const tinyWordsRecord = words.reduce((acc: Record<string, any>, t) => {
      acc[t] = { id: t, text: t, language: 'english', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 };
      return acc;
    }, {} as Record<string, any>);

    let state: RootState = {
      users: {
        small_user: {
          words: tinyWordsRecord,
          sessions: {},
          activeSessions: {},
          settings: {
            selectionWeights: { struggle: 1, new: 1, mastered: 0 },
            sessionSizes: { english: 2 },
            languages: ['english'],
            complexityLevels: { english: 1, kannada: 1, hindi: 1 },
          },
        },
      },
      currentUserId: 'small_user',
    };

    const rng = rngFactory(7);

    function anyUnmastered(s: RootState) {
      return Object.values(s.users.small_user.words).some(w => w.language === 'english' && w.step < 5);
    }

    let iter = 0;
    while (anyUnmastered(state) && iter < 20) {
      iter += 1;
      const allWordsArr = Object.values(state.users.small_user.words).filter(w => w.language === 'english');
      const wordIds = selectSessionWords(allWordsArr, state.users.small_user.settings.selectionWeights, state.users.small_user.settings.sessionSizes.english, rng);

      // Print session words
      const printable = wordIds.map(id => state.users.small_user.words[id].text);
      // eslint-disable-next-line no-console
      console.log(`SmallBank Session ${iter} (${wordIds.length}):`, printable.join(', '));

      const sid = `small_s_${iter}`;
      const session: Session = { wordIds, currentIndex: 0, revealed: false, mode: 'practice', createdAt: Date.now(), settings: state.users.small_user.settings };
      state = reducer(state, addSession({ sessionId: sid, session }));

      for (const id of wordIds) {
        for (let i = 0; i < 5; i++) {
          state = reducer(state, attempt({ sessionId: sid, wordId: id, result: 'correct' }));
        }
      }
      state = reducer(state, nextCard({ sessionId: sid }));
    }

    // Print final summary
    const remaining = Object.values(state.users.small_user.words).filter(w => w.step < 5).map(w => w.id);
    // eslint-disable-next-line no-console
    console.log('SmallBank finished in', iter, 'iterations; remaining unmastered:', remaining.join(', '));

    expect(remaining.length).toBe(0);
  });
});
