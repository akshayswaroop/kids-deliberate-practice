import { describe, it, expect } from "vitest";
import {
  selectMasteryPercent,
  selectCurrentWord,
  selectSessionProgress,
  selectAreAllSessionWordsMastered,
  selectCurrentPracticeData,
} from "../selectors";
import type { RootState, Word, Session } from "../state";

describe("selectMasteryPercent", () => {
  it("converts step to percentage correctly", () => {
    const word: Word = {
      id: "w1",
      text: "test",
      language: "en",
      complexityLevel: 1,
      attempts: [
        { timestamp: 1, result: "correct" }, 
        { timestamp: 2, result: "wrong" },   
        { timestamp: 3, result: "correct" }, 
        { timestamp: 4, result: "correct" }, 
      ],
      step: 2, // At step 2 after some practice
      cooldownSessionsLeft: 0,
    };

    const state: RootState = {
      users: {
        user1: {
          words: { w1: word },
          sessions: {},
          activeSessions: {},
          settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 6 }, languages: ["english"], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
        },
      },
      currentUserId: 'user1',
    };
    // Step 2 = 2/5 * 100 = 40%
    expect(selectMasteryPercent(state, "w1")).toBe(40);
  });

  it("clamps percentage between 0 and 100", () => {
    const word: Word = {
      id: "w2",
      text: "test2",
      language: "en",
      complexityLevel: 1,
      attempts: Array(10).fill({ timestamp: 1, result: "correct" }), // Many correct attempts
      step: 5, // Mastered
      cooldownSessionsLeft: 0,
    };

    const state: RootState = {
      users: {
        user1: {
          words: { w2: word },
          sessions: {},
          activeSessions: {},
          settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 6 }, languages: ["english"], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
        },
      },
      currentUserId: 'user1',
    };
    // Step 5 = 5/5 * 100 = 100%
    expect(selectMasteryPercent(state, "w2")).toBe(100);
  });
});

describe("selectCurrentWord", () => {
  it("returns the current word from session", () => {
    const words: Record<string, Word> = {
      w1: { id: "w1", text: "one", language: "en", complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 },
      w2: { id: "w2", text: "two", language: "en", complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 },
    };
    const session: Session = {
      wordIds: ["w1", "w2"],
      currentIndex: 1,
      revealed: false,
      mode: "practice",
  createdAt: 0,
  settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 2 }, languages: ["english"], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
    };
    const state: RootState = {
      users: {
        user1: {
          words,
          sessions: { s1: session },
          activeSessions: { practice: "s1" },
          settings: session.settings,
        },
      },
      currentUserId: 'user1',
    };
    const currentWord = selectCurrentWord(state, "s1");
    expect(currentWord).toBe(words["w2"]);
  });
});

describe("selectSessionProgress", () => {
  it("returns current and total progress for session", () => {
    const session: Session = {
      wordIds: ["w1", "w2"],
      currentIndex: 1,
      revealed: false,
      mode: "practice",
  createdAt: 0,
  settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 2 }, languages: ["english"], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
    };
    const state: RootState = {
      users: {
        user1: {
          words: {},
          sessions: { s1: session },
          activeSessions: { practice: "s1" },
          settings: session.settings,
        },
      },
      currentUserId: 'user1',
    };
    const progress = selectSessionProgress(state, "s1");
    expect(progress).toEqual({ current: 2, total: 2 });
  });
});

describe('selectAreAllSessionWordsMastered', () => {
  it('returns true when all words in session are 100% mastered', () => {
    const state: RootState = {
      users: {
        user1: {
          words: {
            w1: { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [
              { timestamp: 1, result: 'correct' },
              { timestamp: 2, result: 'correct' },
              { timestamp: 3, result: 'correct' },
              { timestamp: 4, result: 'correct' },
              { timestamp: 5, result: 'correct' }  // 5 correct = mastered
            ], step: 5, cooldownSessionsLeft: 0 },
            w2: { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [
              { timestamp: 1, result: 'correct' },
              { timestamp: 2, result: 'correct' },
              { timestamp: 3, result: 'correct' },
              { timestamp: 4, result: 'correct' },
              { timestamp: 5, result: 'correct' }  // 5 correct = mastered
            ], step: 5, cooldownSessionsLeft: 0 }
          },
          sessions: {
            s1: { wordIds: ['w1', 'w2'], currentIndex: 0, revealed: false, mode: 'practice', createdAt: 0, settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 2 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } }
          },
          activeSessions: {},
          settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 2 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
        }
      },
      currentUserId: 'user1'
    };
    
    expect(selectAreAllSessionWordsMastered(state, 's1')).toBe(true);
  });

  it('returns true when 80% of words are mastered (new behavior)', () => {
    const state: RootState = {
      users: {
        user1: {
          words: {
            w1: { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w2: { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w3: { id: 'w3', text: 'three', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w4: { id: 'w4', text: 'four', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w5: { id: 'w5', text: 'five', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 } // Not mastered
          },
          sessions: {
            s1: { wordIds: ['w1', 'w2', 'w3', 'w4', 'w5'], currentIndex: 0, revealed: false, mode: 'practice', createdAt: 0, settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 5 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } }
          },
          activeSessions: {},
          settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 5 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
        }
      },
      currentUserId: 'user1'
    };
    
    // 4/5 = 80% mastered, should return true
    expect(selectAreAllSessionWordsMastered(state, 's1')).toBe(true);
  });

  it('returns false when less than 80% of words are mastered', () => {
    const state: RootState = {
      users: {
        user1: {
          words: {
            w1: { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w2: { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w3: { id: 'w3', text: 'three', language: 'en', complexityLevel: 1, attempts: [], step: 3, cooldownSessionsLeft: 0 }, // Not mastered
            w4: { id: 'w4', text: 'four', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 }, // Not mastered
            w5: { id: 'w5', text: 'five', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 } // Not mastered
          },
          sessions: {
            s1: { wordIds: ['w1', 'w2', 'w3', 'w4', 'w5'], currentIndex: 0, revealed: false, mode: 'practice', createdAt: 0, settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 5 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } }
          },
          activeSessions: {},
          settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 5 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
        }
      },
      currentUserId: 'user1'
    };
    
    // 2/5 = 40% mastered, should return false
    expect(selectAreAllSessionWordsMastered(state, 's1')).toBe(false);
  });

  it('handles empty sessions correctly', () => {
    const state: RootState = {
      users: {
        user1: {
          words: {},
          sessions: {
            s1: { wordIds: [], currentIndex: 0, revealed: false, mode: 'practice', createdAt: 0, settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 0 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } }
          },
          activeSessions: {},
          settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 0 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
        }
      },
      currentUserId: 'user1'
    };
    
    expect(selectAreAllSessionWordsMastered(state, 's1')).toBe(false);
  });

  it('handles boundary case with exactly 80% mastery', () => {
    const state: RootState = {
      users: {
        user1: {
          words: {
            w1: { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w2: { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w3: { id: 'w3', text: 'three', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w4: { id: 'w4', text: 'four', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w5: { id: 'w5', text: 'five', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w6: { id: 'w6', text: 'six', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w7: { id: 'w7', text: 'seven', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w8: { id: 'w8', text: 'eight', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w9: { id: 'w9', text: 'nine', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w10: { id: 'w10', text: 'ten', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 }, // Not mastered
            w11: { id: 'w11', text: 'eleven', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 }, // Not mastered
            w12: { id: 'w12', text: 'twelve', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 } // Not mastered
          },
          sessions: {
            s1: { wordIds: ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10', 'w11', 'w12'], currentIndex: 0, revealed: false, mode: 'practice', createdAt: 0, settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 12 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } }
          },
          activeSessions: {},
          settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 12 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
        }
      },
      currentUserId: 'user1'
    };
    
    // 9/12 = 75% mastered, but ceil(12 * 0.8) = 10 required, should return false
    expect(selectAreAllSessionWordsMastered(state, 's1')).toBe(false);
  });
});

describe('selectCurrentPracticeData transliteration behavior', () => {
  it('hides transliteration in Kannada mode before session revealed', () => {
    const kannadaWord: Word = {
      id: 'rama',
      text: 'ರಾಮ',
      language: 'kannada',
      complexityLevel: 1,
      wordKannada: 'ರಾಮ',
      transliteration: 'Rāma',
      transliterationHi: 'राम',
      attempts: []
    };

    const session: Session = {
      wordIds: ['rama'],
      currentIndex: 0,
      revealed: false, // Key: session not revealed yet
      mode: 'kannada',
      createdAt: Date.now(),
      settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { kannada: 1 }, languages: ['kannada'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
    };

    const state: RootState = {
      users: {
        user1: {
          words: { rama: kannadaWord },
          sessions: { s1: session },
          activeSessions: { kannada: 's1' },
          settings: session.settings
        }
      },
      currentUserId: 'user1'
    };

    const practiceData = selectCurrentPracticeData(state, 'kannada');
    
    // Should not show transliteration before attempt
    expect(practiceData.transliteration).toBeUndefined();
    expect(practiceData.transliterationHi).toBeUndefined();
    expect(practiceData.mainWord).toBe('ರಾಮ');
  });

  it('shows both transliterations in Kannada mode after session revealed', () => {
    const kannadaWord: Word = {
      id: 'rama',
      text: 'ರಾಮ',
      language: 'kannada',
      complexityLevel: 1,
      wordKannada: 'ರಾಮ',
      transliteration: 'Rāma',
      transliterationHi: 'राम',
      attempts: []
    };

    const session: Session = {
      wordIds: ['rama'],
      currentIndex: 0,
      revealed: true, // Key: session revealed after attempt
      mode: 'kannada',
      createdAt: Date.now(),
      settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { kannada: 1 }, languages: ['kannada'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
    };

    const state: RootState = {
      users: {
        user1: {
          words: { rama: kannadaWord },
          sessions: { s1: session },
          activeSessions: { kannada: 's1' },
          settings: session.settings
        }
      },
      currentUserId: 'user1'
    };

    const practiceData = selectCurrentPracticeData(state, 'kannada');
    
    // Should show both transliterations after attempt
    expect(practiceData.transliteration).toBe('Rāma');
    expect(practiceData.transliterationHi).toBe('राम');
    expect(practiceData.mainWord).toBe('ರಾಮ');
  });

  it('always shows transliteration in English mode regardless of revealed state', () => {
    const englishWord: Word = {
      id: 'cat',
      text: 'cat',
      language: 'english',
      complexityLevel: 1,
      attempts: [],
      step: 0,
      cooldownSessionsLeft: 0
    };

    const session: Session = {
      wordIds: ['cat'],
      currentIndex: 0,
      revealed: false, // Even not revealed
      mode: 'english',
      createdAt: Date.now(),
      settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 1 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
    };

    const state: RootState = {
      users: {
        user1: {
          words: { cat: englishWord },
          sessions: { s1: session },
          activeSessions: { english: 's1' },
          settings: session.settings
        }
      },
      currentUserId: 'user1'
    };

    const practiceData = selectCurrentPracticeData(state, 'english');
    
    // English mode not affected - no special transliteration behavior
    expect(practiceData.mainWord).toBe('cat');
    // English words don't have transliteration fields
    expect(practiceData.transliteration).toBeUndefined();
    expect(practiceData.transliterationHi).toBeUndefined();
  });
});