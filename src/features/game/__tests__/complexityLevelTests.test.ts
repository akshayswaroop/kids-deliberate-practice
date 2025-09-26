import { describe, it, expect } from 'vitest';
import reducer from '../slice';
import type { RootState } from '../state';
import { 
  selectWordsByComplexityLevel, 
  selectComplexityLevels, 
  selectShouldProgressLevel 
} from '../selectors';

function makeInitialWithComplexityLevels(): RootState {
  return {
    users: {
      user1: {
        words: {
          // Level 1 English words
          w1: { id: 'w1', text: 'an', language: 'english', complexityLevel: 1, attempts: [] },
          w2: { id: 'w2', text: 'at', language: 'english', complexityLevel: 1, attempts: [] },
          // Level 2 English words  
          w3: { id: 'w3', text: 'bat', language: 'english', complexityLevel: 2, attempts: [] },
          w4: { id: 'w4', text: 'cat', language: 'english', complexityLevel: 2, attempts: [] },
          // Level 3 English words
          w5: { id: 'w5', text: 'big', language: 'english', complexityLevel: 3, attempts: [] },
          // Level 1 Kannada words
          k1: { id: 'k1', text: 'ರಾಮ', language: 'kannada', complexityLevel: 1, attempts: [] },
          k2: { id: 'k2', text: 'ಲವ', language: 'kannada', complexityLevel: 1, attempts: [] },
          // Level 2 Kannada words
          k3: { id: 'k3', text: 'ಸೀತಾ', language: 'kannada', complexityLevel: 2, attempts: [] },
        },
        sessions: {},
        activeSessions: {},
        settings: { 
          selectionWeights: { struggle: 1, new: 1, mastered: 1 }, 
          sessionSize: 6, 
          languages: ['english', 'kannada'],
          complexityLevels: { english: 1, kannada: 1, hindi: 1 }
        },
      },
    },
    currentUserId: 'user1',
  };
}

describe('Complexity Level System', () => {
  it('should filter words by complexity level', () => {
    const state = makeInitialWithComplexityLevels();
    
    // User is at level 1 for both languages
    const words = selectWordsByComplexityLevel(state, ['english', 'kannada']);
    const wordIds = Object.keys(words);
    
    // Should only include level 1 words
    expect(wordIds).toContain('w1'); // Level 1 English
    expect(wordIds).toContain('w2'); // Level 1 English
    expect(wordIds).toContain('k1'); // Level 1 Kannada
    expect(wordIds).toContain('k2'); // Level 1 Kannada
    
    // Should NOT include level 2+ words
    expect(wordIds).not.toContain('w3'); // Level 2 English
    expect(wordIds).not.toContain('w4'); // Level 2 English
    expect(wordIds).not.toContain('w5'); // Level 3 English
    expect(wordIds).not.toContain('k3'); // Level 2 Kannada
  });

  it('should include higher level words when user progresses', () => {
    let state = makeInitialWithComplexityLevels();
    
    // Progress English to level 2
    state = reducer(state, { type: 'game/progressComplexityLevel', payload: { language: 'english' } });
    
    const words = selectWordsByComplexityLevel(state, ['english', 'kannada']);
    const wordIds = Object.keys(words);
    
    // Should include level 1 and 2 English words
    expect(wordIds).toContain('w1'); // Level 1 English
    expect(wordIds).toContain('w2'); // Level 1 English  
    expect(wordIds).toContain('w3'); // Level 2 English
    expect(wordIds).toContain('w4'); // Level 2 English
    
    // Should NOT include level 3 English words yet
    expect(wordIds).not.toContain('w5'); // Level 3 English
    
    // Kannada should still be at level 1
    expect(wordIds).toContain('k1'); // Level 1 Kannada
    expect(wordIds).toContain('k2'); // Level 1 Kannada
    expect(wordIds).not.toContain('k3'); // Level 2 Kannada
  });

  it('should detect when user should progress to next level', () => {
    let state = makeInitialWithComplexityLevels();
    
    // Initially, user should not progress (no mastery)
    expect(selectShouldProgressLevel(state, 'english')).toBe(false);
    
    // Master 80% of level 1 English words (need 2 out of 2 words mastered)
    // Add mastery attempts to both level 1 words
    for (let i = 0; i < 5; i++) {
      state.users.user1.words.w1.attempts.push({ timestamp: Date.now(), result: 'correct' });
      state.users.user1.words.w2.attempts.push({ timestamp: Date.now(), result: 'correct' });
    }
    
    // Now should be eligible for progression
    expect(selectShouldProgressLevel(state, 'english')).toBe(true);
    
    // Kannada should still not be eligible (no mastery)
    expect(selectShouldProgressLevel(state, 'kannada')).toBe(false);
  });

  it('should track complexity levels per language', () => {
    let state = makeInitialWithComplexityLevels();
    
    const initialLevels = selectComplexityLevels(state);
    expect(initialLevels.english).toBe(1);
    expect(initialLevels.kannada).toBe(1);
    expect(initialLevels.hindi).toBe(1);
    
    // Progress English
    state = reducer(state, { type: 'game/progressComplexityLevel', payload: { language: 'english' } });
    let levels = selectComplexityLevels(state);
    expect(levels.english).toBe(2);
    expect(levels.kannada).toBe(1); // Should remain unchanged
    
    // Progress Kannada
    state = reducer(state, { type: 'game/progressComplexityLevel', payload: { language: 'kannada' } });
    levels = selectComplexityLevels(state);
    expect(levels.english).toBe(2);
    expect(levels.kannada).toBe(2);
  });

  it('should allow setting specific complexity levels', () => {
    let state = makeInitialWithComplexityLevels();
    
    // Set English to level 3 directly
    state = reducer(state, { type: 'game/setComplexityLevel', payload: { language: 'english', level: 3 } });
    
    const levels = selectComplexityLevels(state);
    expect(levels.english).toBe(3);
    expect(levels.kannada).toBe(1); // Should remain unchanged
    
    // Test bounds checking - should clamp to max level 10
    state = reducer(state, { type: 'game/setComplexityLevel', payload: { language: 'english', level: 15 } });
    expect(selectComplexityLevels(state).english).toBe(10);
    
    // Test bounds checking - should clamp to min level 1
    state = reducer(state, { type: 'game/setComplexityLevel', payload: { language: 'english', level: -5 } });
    expect(selectComplexityLevels(state).english).toBe(1);
  });

  it('should filter words correctly for mixed language selection', () => {
    const state = makeInitialWithComplexityLevels();
    
    // Test with mixed language selection
    const words = selectWordsByComplexityLevel(state, ['mixed']);
    const wordIds = Object.keys(words);
    
    // Should include level 1 words from all languages
    expect(wordIds).toContain('w1'); // Level 1 English
    expect(wordIds).toContain('w2'); // Level 1 English
    expect(wordIds).toContain('k1'); // Level 1 Kannada
    expect(wordIds).toContain('k2'); // Level 1 Kannada
    
    // Should NOT include level 2+ words
    expect(wordIds).not.toContain('w3'); // Level 2 English
    expect(wordIds).not.toContain('k3'); // Level 2 Kannada
  });
});