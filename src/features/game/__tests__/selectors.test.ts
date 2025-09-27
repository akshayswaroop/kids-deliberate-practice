import { describe, it, expect } from "vitest";
import {
  selectMasteryPercent,
  selectCurrentWord,
  selectSessionProgress,
  selectIsSessionFullyMastered,
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
          settings: { sessionSizes: { english: 6 }, languages: ["english"], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
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
          settings: { sessionSizes: { english: 6 }, languages: ["english"], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
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
  settings: { sessionSizes: { english: 2 }, languages: ["english"], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
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
  it("returns current progress", () => {
  const state: RootState = {
    users: {
      user1: {
      words: { w1: { id: 'w1', text: 'hello', language: 'english', complexityLevel: 1, attempts: [], step: 2, cooldownSessionsLeft: 0 }, w2: { id: 'w2', text: 'world', language: 'english', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 } },
      sessions: { s1: { wordIds: ['w1', 'w2'], currentIndex: 0, revealed: false, mode: 'practice', createdAt: 0, settings: { sessionSizes: { english: 2 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } } },
      activeSessions: {},
      settings: { sessionSizes: { english: 2 }, languages: ["english"], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
    }
    },
    currentUserId: 'user1'
  };
    const progress = selectSessionProgress(state, "s1");
    expect(progress.current).toBe(1);
    expect(progress.total).toBe(2);
  });

  it("handles completed sessions", () => {
  const state: RootState = {
    users: {
      user1: {
      words: { w1: { id: 'w1', text: 'hello', language: 'english', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 }, w2: { id: 'w2', text: 'world', language: 'english', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 } },
      sessions: { s1: { wordIds: ['w1', 'w2'], currentIndex: 1, revealed: false, mode: 'practice', createdAt: 0, settings: { sessionSizes: { english: 2 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } } },
      activeSessions: {},
      settings: { sessionSizes: { english: 2 }, languages: ["english"], complexityLevels: { english: 1, kannada: 1, hindi: 1 } },
    }
    },
    currentUserId: 'user1'
  };
    const progress = selectSessionProgress(state, "s1");
    expect(progress.current).toBe(2);
    expect(progress.total).toBe(2);
  });
});

describe('selectIsSessionFullyMastered', () => {
  it('returns true when all words in session are fully mastered (step = 5)', () => {
    const state: RootState = {
      users: {
        user1: {
          words: {
            w1: { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 },
            w2: { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [], step: 5, cooldownSessionsLeft: 0 }
          },
          sessions: {
            s1: { wordIds: ['w1', 'w2'], currentIndex: 0, revealed: false, mode: 'practice', createdAt: 0, settings: { sessionSizes: { english: 2 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } }
          },
          activeSessions: {},
          settings: { sessionSizes: { english: 2 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
        }
      },
      currentUserId: 'user1'
    };
    
    expect(selectIsSessionFullyMastered(state, 's1')).toBe(true);
  });

  it('returns false when not all words are fully mastered', () => {
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
            s1: { wordIds: ['w1', 'w2', 'w3', 'w4', 'w5'], currentIndex: 0, revealed: false, mode: 'practice', createdAt: 0, settings: { sessionSizes: { english: 5 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } }
          },
          activeSessions: {},
          settings: { sessionSizes: { english: 5 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
        }
      },
      currentUserId: 'user1'
    };
    
    expect(selectIsSessionFullyMastered(state, 's1')).toBe(false);
  });

  it('returns false when some words are partially mastered', () => {
    const state: RootState = {
      users: {
        user1: {
          words: {
            w1: { id: 'w1', text: 'one', language: 'en', complexityLevel: 1, attempts: [], step: 4, cooldownSessionsLeft: 0 },
            w2: { id: 'w2', text: 'two', language: 'en', complexityLevel: 1, attempts: [], step: 3, cooldownSessionsLeft: 0 },
            w3: { id: 'w3', text: 'three', language: 'en', complexityLevel: 1, attempts: [], step: 2, cooldownSessionsLeft: 0 },
            w4: { id: 'w4', text: 'four', language: 'en', complexityLevel: 1, attempts: [], step: 1, cooldownSessionsLeft: 0 },
            w5: { id: 'w5', text: 'five', language: 'en', complexityLevel: 1, attempts: [], step: 0, cooldownSessionsLeft: 0 }
          },
          sessions: {
            s1: { wordIds: ['w1', 'w2', 'w3', 'w4', 'w5'], currentIndex: 0, revealed: false, mode: 'practice', createdAt: 0, settings: { sessionSizes: { english: 5 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } }
          },
          activeSessions: {},
          settings: { sessionSizes: { english: 5 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
        }
      },
      currentUserId: 'user1'
    };
    
    expect(selectIsSessionFullyMastered(state, 's1')).toBe(false);
  });

  it('handles empty sessions', () => {
    const state: RootState = {
      users: {
        user1: {
          words: {},
          sessions: {
            s1: { wordIds: [], currentIndex: 0, revealed: false, mode: 'practice', createdAt: 0, settings: { sessionSizes: { english: 0 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } }
          },
          activeSessions: {},
          settings: { sessionSizes: { english: 0 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
        }
      },
      currentUserId: 'user1'
    };
    
    expect(selectIsSessionFullyMastered(state, 's1')).toBe(false);
  });

  it('handles large sessions with mixed mastery', () => {
    const words: Record<string, Word> = {};
    const wordIds: string[] = [];
    
    // Create 12 words: 10 mastered, 2 unmastered
    for (let i = 1; i <= 12; i++) {
      const id = `w${i}`;
      const step = i <= 10 ? 5 : 0; // First 10 are mastered
      words[id] = { id, text: `word${i}`, language: 'en', complexityLevel: 1, attempts: [], step, cooldownSessionsLeft: 0 };
      wordIds.push(id);
    }

    const state: RootState = {
      users: {
        user1: {
          words,
          sessions: {
            s1: { wordIds, currentIndex: 0, revealed: false, mode: 'practice', createdAt: 0, settings: { sessionSizes: { english: 12 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } }
          },
          activeSessions: {},
          settings: { sessionSizes: { english: 12 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
        }
      },
      currentUserId: 'user1'
    };
    
    expect(selectIsSessionFullyMastered(state, 's1')).toBe(false);
  });
});

describe('selectCurrentPracticeData', () => {
  it('handles kannada mode correctly', () => {
    const kannadaWord: Word = {
      id: 'k1',
      text: 'Rāma',
      language: 'kannada',
      complexityLevel: 1,
      wordKannada: 'ರಾಮ',
      transliteration: 'Rāma',
      transliterationHi: 'राम',
      attempts: [],
      step: 0,
      cooldownSessionsLeft: 0,
    };

    const state: RootState = {
      users: {
        user1: {
          words: { k1: kannadaWord },
          sessions: {
            kan1: { wordIds: ['k1'], currentIndex: 0, revealed: false, mode: 'kannada', createdAt: 0, settings: { sessionSizes: { kannada: 1 }, languages: ['kannada'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } }
          },
          activeSessions: { kannada: 'kan1' },
          settings: { sessionSizes: { kannada: 1 }, languages: ['kannada'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
        }
      },
      currentUserId: 'user1'
    };

    const data = selectCurrentPracticeData(state, 'kannada');
    expect(data.sessionId).toBe('kan1');
    expect(data.mainWord).toBe('ರಾಮ');
    expect(data.transliteration).toBeUndefined(); // Not revealed yet
    expect(data.transliterationHi).toBeUndefined(); // Not revealed yet
  });

  it('handles english mode correctly', () => {
    const englishWord: Word = {
      id: 'e1',
      text: 'hello',
      language: 'english',
      complexityLevel: 1,
      attempts: [],
      step: 2,
      cooldownSessionsLeft: 0,
    };

    const state: RootState = {
      users: {
        user1: {
          words: { e1: englishWord },
          sessions: {
            eng1: { wordIds: ['e1'], currentIndex: 0, revealed: false, mode: 'english', createdAt: 0, settings: { sessionSizes: { english: 1 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } } }
          },
          activeSessions: { english: 'eng1' },
          settings: { sessionSizes: { english: 1 }, languages: ['english'], complexityLevels: { english: 1, kannada: 1, hindi: 1 } }
        }
      },
      currentUserId: 'user1'
    };

    const data = selectCurrentPracticeData(state, 'english');
    expect(data.sessionId).toBe('eng1');
    expect(data.mainWord).toBe('hello');
    expect(data.transliteration).toBeUndefined();
    expect(data.transliterationHi).toBeUndefined();
  });
});