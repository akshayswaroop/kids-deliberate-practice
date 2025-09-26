import { describe, it, expect } from 'vitest';
import reducer, { setSessionSize } from '../slice';
import { selectSessionSizeForMode } from '../selectors';
import type { RootState } from '../state';

describe('SessionSize Migration', () => {
  it('should handle migration from old sessionSize to new sessionSizes structure', () => {
    // Create a state with old sessionSize structure (legacy user)
    const legacyState: RootState = {
      users: {
        legacyUser: {
          displayName: 'Legacy User',
          words: {},
          sessions: {},
          activeSessions: {},
          settings: {
            selectionWeights: { struggle: 0.5, new: 0.4, mastered: 0.1 },
            sessionSize: 9, // Old structure - single global sessionSize
            languages: ['english'],
          } as any, // Cast to any to allow old structure
        },
      },
      currentUserId: 'legacyUser',
    };

    // Selector should handle legacy structure gracefully
    expect(selectSessionSizeForMode(legacyState, 'english')).toBe(9);
    expect(selectSessionSizeForMode(legacyState, 'kannada')).toBe(9);
    expect(selectSessionSizeForMode(legacyState, 'mixed')).toBe(9);

    // When user sets a new sessionSize, it should migrate to the new structure
    const migratedState = reducer(legacyState, setSessionSize({ mode: 'english', sessionSize: 3 }));

    // After migration, should have new sessionSizes structure
    expect(migratedState.users.legacyUser.settings.sessionSizes).toBeDefined();
    expect(migratedState.users.legacyUser.settings.sessionSizes.english).toBe(3);
    expect(migratedState.users.legacyUser.settings.sessionSizes.kannada).toBe(9); // Migrated from legacy
    expect(migratedState.users.legacyUser.settings.sessionSizes.mixed).toBe(9); // Migrated from legacy

    // Old sessionSize property should be removed
    expect((migratedState.users.legacyUser.settings as any).sessionSize).toBeUndefined();

    // Setting different modes should work correctly after migration
    const finalState = reducer(migratedState, setSessionSize({ mode: 'kannada', sessionSize: 12 }));
    expect(selectSessionSizeForMode(finalState, 'english')).toBe(3);
    expect(selectSessionSizeForMode(finalState, 'kannada')).toBe(12);
    expect(selectSessionSizeForMode(finalState, 'mixed')).toBe(9);
  });

  it('should handle users with no sessionSize at all', () => {
    // User with minimal settings (no sessionSize)
    const minimalState: RootState = {
      users: {
        minimalUser: {
          words: {},
          sessions: {},
          activeSessions: {},
          settings: {
            selectionWeights: { struggle: 0.5, new: 0.4, mastered: 0.1 },
            languages: ['english'],
          } as any,
        },
      },
      currentUserId: 'minimalUser',
    };

    // Should fallback to default of 6
    expect(selectSessionSizeForMode(minimalState, 'english')).toBe(6);
    expect(selectSessionSizeForMode(minimalState, 'kannada')).toBe(6);

    // Setting sessionSize should create the sessionSizes structure
    const updatedState = reducer(minimalState, setSessionSize({ mode: 'english', sessionSize: 4 }));
    expect(updatedState.users.minimalUser.settings.sessionSizes.english).toBe(4);
    expect(updatedState.users.minimalUser.settings.sessionSizes.kannada).toBe(6); // Default from migration
    expect(updatedState.users.minimalUser.settings.sessionSizes.mixed).toBe(6); // Default from migration
  });
});