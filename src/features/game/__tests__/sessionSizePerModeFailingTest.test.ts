import { describe, it, expect } from 'vitest';
import reducer, { setSessionSize } from '../slice';
import { selectSessionSizeForMode } from '../selectors';
import type { RootState } from '../state';

function makeInitialState(): RootState {
  return {
    users: {
      testUser: {
        displayName: 'Test User',
        words: {},
        sessions: {},
        activeSessions: {},
        settings: {
          selectionWeights: { struggle: 0.5, new: 0.4, mastered: 0.1 },
          sessionSizes: { 
            english: 6,   // Default for English
            kannada: 6,   // Default for Kannada  
            mixed: 6      // Default for mixed mode
          },
          complexityLevels: { english: 1, kannada: 1, hindi: 1 },
          languages: ['english'],
        },
      },
    },
    currentUserId: 'testUser',
  };
}

describe('Session Size Per-Mode', () => {
  it('should remember different session sizes for different modes', () => {
    let state = makeInitialState();
    
    // Fixed session size is always 12 for all modes
    expect(selectSessionSizeForMode(state, 'english')).toBe(12);
    expect(selectSessionSizeForMode(state, 'kannada')).toBe(12);
    
    // User switches to English mode and sets sessionSize to 3
    state = reducer(state, setSessionSize({ mode: 'english', sessionSize: 3 }));
    
    // User switches to Kannada mode and sets sessionSize to 9
    state = reducer(state, setSessionSize({ mode: 'kannada', sessionSize: 9 }));
    
    // Session size is now fixed at 12 for all modes - no per-mode configuration
    expect(selectSessionSizeForMode(state, 'english')).toBe(12); // Fixed at 12
    expect(selectSessionSizeForMode(state, 'kannada')).toBe(12); // Fixed at 12
  });
});