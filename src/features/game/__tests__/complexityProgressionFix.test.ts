import { describe, it, expect } from 'vitest';
import gameSlice, { makeUser } from '../slice';
import { selectShouldProgressLevel, selectWordsByComplexityLevel } from '../selectors';
import type { RootState } from '../state';

describe('Complexity Progression Fix', () => {
  it('should automatically progress complexity level when 80% of words are mastered', () => {
    // Create initial state with user
    const userId = 'test_user';
    let state: RootState = {
      users: {
        [userId]: makeUser('Test User')
      },
      currentUserId: userId
    };

    // Master all level 1 English words (first 25 words)
    const englishWords = Object.entries(state.users[userId].words)
      .filter(([_, word]) => word.language === 'english' && word.complexityLevel === 1);

    // Master all level 1 words by setting step = 5
    for (const [wordId, _] of englishWords) {
      state.users[userId].words[wordId].step = 5;
      state.users[userId].words[wordId].attempts = [
        { timestamp: Date.now(), result: 'correct' as const },
        { timestamp: Date.now(), result: 'correct' as const },
        { timestamp: Date.now(), result: 'correct' as const },
        { timestamp: Date.now(), result: 'correct' as const },
        { timestamp: Date.now(), result: 'correct' as const }
      ];
      state.users[userId].words[wordId].cooldownSessionsLeft = 0;
    }

    // Check if progression should happen
    const shouldProgress = selectShouldProgressLevel(state, 'english');
    expect(shouldProgress).toBe(true);

    // Apply complexity progression
    const action = { type: 'game/progressComplexityLevel', payload: { language: 'english' } };
    state = gameSlice(state, action);

    // Verify complexity level increased
    expect(state.users[userId].settings.complexityLevels.english).toBe(2);

    // Verify new words are now available
    const availableWords = selectWordsByComplexityLevel(state, ['english']);
    const level2Words = Object.values(availableWords).filter(word => 
      word.complexityLevel === 2 && word.step === 0 && word.attempts.length === 0
    );
    
    expect(level2Words.length).toBeGreaterThan(0);
    console.log(`✅ Level 2 has ${level2Words.length} new words available`);
  });

  it('should not progress if less than 80% of words are mastered', () => {
    // Create initial state with user
    const userId = 'test_user';
    let state: RootState = {
      users: {
        [userId]: makeUser('Test User')
      },
      currentUserId: userId
    };

    // Master only 50% of level 1 English words
    const englishWords = Object.entries(state.users[userId].words)
      .filter(([_, word]) => word.language === 'english' && word.complexityLevel === 1);
    
    const wordsToMaster = englishWords.slice(0, Math.floor(englishWords.length * 0.5));

    for (const [wordId, _] of wordsToMaster) {
      state.users[userId].words[wordId].step = 5;
      state.users[userId].words[wordId].attempts = [
        { timestamp: Date.now(), result: 'correct' as const },
        { timestamp: Date.now(), result: 'correct' as const },
        { timestamp: Date.now(), result: 'correct' as const },
        { timestamp: Date.now(), result: 'correct' as const },
        { timestamp: Date.now(), result: 'correct' as const }
      ];
    }

    // Check if progression should happen
    const shouldProgress = selectShouldProgressLevel(state, 'english');
    expect(shouldProgress).toBe(false);

    // Verify complexity level stays at 1
    expect(state.users[userId].settings.complexityLevels.english).toBe(1);
  });
});