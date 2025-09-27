import { describe, it, expect } from 'vitest';
import { selectAreAllSessionWordsMastered } from './features/game/selectors';
import { makeUser } from './features/game/slice';

describe('80% threshold bug test', () => {
  it('should return true when 80% of words are mastered', () => {
    // Create a state with 12 words, master 10 (83% > 80%)
    const user = makeUser('Test User');
    const sessionId = 'test_session';
    const wordIds = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10', 'w11', 'w12'];
    
    // Set up session
    (user.sessions as any)[sessionId] = {
      wordIds,
      currentIndex: 0,
      revealed: false,
      mode: 'practice',
      createdAt: Date.now(),
      settings: user.settings
    };
    
    // Master first 10 words (83% > 80% threshold)
    wordIds.slice(0, 10).forEach(wordId => {
      (user.words as any)[wordId] = {
        id: wordId,
        text: wordId,
        language: 'english',
        complexityLevel: 1,
        step: 5, // Mastered
        attempts: [
          { timestamp: Date.now() - 1000, result: 'correct' },
          { timestamp: Date.now() - 800, result: 'correct' },
          { timestamp: Date.now() - 600, result: 'correct' },
          { timestamp: Date.now() - 400, result: 'correct' },
          { timestamp: Date.now() - 200, result: 'correct' }
        ],
        lastPracticedAt: Date.now(),
        lastRevisedAt: Date.now(),
        cooldownSessionsLeft: 1
      };
    });
    
    // Leave last 2 words unmastered (step 0)
    wordIds.slice(10).forEach(wordId => {
      (user.words as any)[wordId] = {
        id: wordId,
        text: wordId,
        language: 'english',
        complexityLevel: 1,
        step: 0,
        attempts: [],
        lastPracticedAt: undefined,
        lastRevisedAt: undefined,
        cooldownSessionsLeft: 0
      };
    });
    
    const state = {
      users: { 'test_user': user },
      currentUserId: 'test_user'
    };
    
    const result = selectAreAllSessionWordsMastered(state, sessionId);
    
    console.log('Test Results:');
    console.log(`Mastered words: 10/12 (83%)`);
    console.log(`Threshold: 80%`);
    console.log(`Selector result: ${result}`);
    console.log(`Expected: true`);
    
    expect(result).toBe(true);
  });
});