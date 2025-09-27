import { describe, it, expect } from 'vitest';
import reducer, { addSession, attempt, nextCard } from '../slice';
import { selectSessionWords } from '../sessionGen';
import { getInitialWords } from '../../../app/bootstrapState';
import type { RootState, Session } from '../state';

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
            sessionSizes: { english: 12 },
            languages: ['english'],
            complexityLevels: { english: 1, kannada: 1, hindi: 1 },
          },
        },
      },
      currentUserId: 'user_master',
    };

  // RNG no longer needed with deterministic selection

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
      const size = state.users.user_master.settings.sessionSizes.english;
      const wordIds = selectSessionWords(englishAllWordsArr, size);
      // Ensure only unmastered (step < 5) words are selected
      expect(wordIds.every(id => state.users.user_master.words[id].step < 5)).toBe(true);

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
            sessionSizes: { english: 2 },
            languages: ['english'],
            complexityLevels: { english: 1, kannada: 1, hindi: 1 },
          },
        },
      },
      currentUserId: 'small_user',
    };

  // RNG no longer needed with deterministic selection

    function anyUnmastered(s: RootState) {
      return Object.values(s.users.small_user.words).some(w => w.language === 'english' && w.step < 5);
    }

    let iter = 0;
    while (anyUnmastered(state) && iter < 20) {
      iter += 1;
      const allWordsArr = Object.values(state.users.small_user.words).filter(w => w.language === 'english');
  const wordIds = selectSessionWords(allWordsArr, state.users.small_user.settings.sessionSizes.english);
  expect(wordIds.every(id => state.users.small_user.words[id].step < 5)).toBe(true);

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
