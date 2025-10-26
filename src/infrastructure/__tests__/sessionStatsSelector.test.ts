import { describe, it, expect } from 'vitest';
import { selectSessionStats } from '../state/gameSelectors';
import type { RootState } from '../state/gameState';

function buildState(state: Partial<RootState>): RootState {
  return {
    currentUserId: null,
    users: {},
    ...state,
  } as RootState;
}

describe('selectSessionStats', () => {
  it('summarises mastered, practicing, pending, and initial counts correctly', () => {
    const state = buildState({
      currentUserId: 'u1',
      users: {
        u1: {
          displayName: 'Test Kid',
          settings: {
            sessionSizes: { kannadaalphabets: 12 },
            languages: ['kannadaalphabets'],
            complexityLevels: { kannadaalphabets: 1 },
          },
          experience: {
            hasSeenIntro: true,
            coachmarks: { streak: true, profiles: true },
            hasSeenParentGuide: true,
            hasSeenWhyRepeat: true,
          },
          words: {
            w1: {
              id: 'w1',
              text: 'ಅ',
              language: 'kannadaalphabets',
              complexityLevel: 1,
              attempts: [],
              step: 3, // mastered before session
              cooldownSessionsLeft: 0,
              revealCount: 0,
            },
            w2: {
              id: 'w2',
              text: 'ಆ',
              language: 'kannadaalphabets',
              complexityLevel: 1,
              attempts: [{ timestamp: 1, result: 'correct' }],
              step: 2, // mastered during session
              cooldownSessionsLeft: 0,
              revealCount: 0,
            },
            w3: {
              id: 'w3',
              text: 'ಇ',
              language: 'kannadaalphabets',
              complexityLevel: 1,
              attempts: [],
              step: 0, // not yet attempted
              cooldownSessionsLeft: 0,
              revealCount: 0,
            },
          },
          sessions: {
            s1: {
              wordIds: ['w1', 'w2', 'w3'],
              currentIndex: 1, // user has seen w1 and w2
              revealed: false,
              mode: 'practice',
              createdAt: 0,
              settings: {
                sessionSizes: { kannadaalphabets: 12 },
                languages: ['kannadaalphabets'],
                complexityLevels: { kannadaalphabets: 1 },
              },
              initialMasteredWords: ['w1'],
            },
          },
          activeSessions: { kannadaalphabets: 's1' },
          currentMode: 'kannadaalphabets',
        },
      },
    });

    const stats = selectSessionStats(state, 's1');

    expect(stats).not.toBeNull();
    expect(stats).toEqual({
      totalQuestions: 3,
      questionsCompleted: 2,
      masteredInSession: 1, // w2 mastered during the session
      practicedInSession: 0,
      yetToTry: 1,
      currentlyMastered: 2, // w1 + w2
      initiallyMastered: 1,
    });
  });
});
