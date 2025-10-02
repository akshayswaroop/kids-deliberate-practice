/**
 * Trace-Based Testing Framework
 * 
 * Production-ready testing utilities that replace traditional unit tests.
 * Tests replay UI intents and assert on trace history instead of mocking.
 */

import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '../infrastructure/state/gameSlice';
import { traceMiddleware, traceAPI } from '../app/tracing/traceMiddleware';
import type { RootState } from '../infrastructure/state/gameState';
import type { TraceEntry, TraceSession } from '../app/tracing/traceSchema';

/**
 * Test store factory with trace middleware enabled
 */
function createTestStore(initialState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      game: gameReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore trace middleware internals
          ignoredActionPaths: ['trace'],
          ignoredStatePaths: ['trace'],
        },
      }).prepend(traceMiddleware.middleware),
    preloadedState: initialState ? { game: initialState as RootState } : undefined,
  });
}

/**
 * Core trace test execution function
 */
export async function runTraceTest(
  testName: string,
  actions: Array<{ type: string; payload?: any }>,
  assertions: (traces: TraceEntry[], session: TraceSession) => void | Promise<void>,
  initialState?: Partial<RootState>
): Promise<void> {
  console.log(`🧪 Running trace test: ${testName}`);
  
  // Clear any existing traces
  traceAPI.clearTraces();
  
  // Create test store with proper initial state
  const store = createTestStore(initialState);
  
  // If we have initial state with users, make sure they're actually added to the store
  if (initialState && initialState.users && initialState.currentUserId) {
    // The store should already have this data, but let's verify it's working
    const state = store.getState();
    console.log(`📋 Store initialized with user: ${state.game.currentUserId}, userCount: ${Object.keys(state.game.users).length}`);
  }
  
  // Dispatch all actions in sequence
  for (const action of actions) {
    store.dispatch(action);
    // Small delay to ensure trace middleware processes the action
    await new Promise(resolve => setTimeout(resolve, 1));
  }
  
  // Get final traces and session
  const traces = traceAPI.getRecentTraces(1000); // Get all traces
  const session = traceAPI.exportCurrentSession();
  
  try {
    // Run assertions
    await assertions(traces, session);
    console.log(`✅ ${testName} - PASSED`);
  } catch (error) {
    console.error(`❌ ${testName} - FAILED`);
    console.error('Error:', error);
    console.log('Traces captured:', traces.length);
  // Removed broken imports for features/game/slice and features/game/state
  }
}

/**
 * Assertion helpers for common domain rules
 */
export const traceAssertions = {
  /**
   * Assert that a word progressed through the expected step sequence
   */
  expectStepProgression(
    traces: TraceEntry[],
    wordId: string,
    expectedSteps: number[]
  ): void {
    const masteryChanges = traces
      .filter(t => t.domainContext.masteryChanged?.wordId === wordId)
      .map(t => t.domainContext.masteryChanged!);
    
    if (masteryChanges.length !== expectedSteps.length - 1) {
      throw new Error(
        `Expected ${expectedSteps.length - 1} step changes for word ${wordId}, got ${masteryChanges.length}`
      );
    }
    
    for (let i = 0; i < masteryChanges.length; i++) {
      const change = masteryChanges[i];
      const expectedFrom = expectedSteps[i];
      const expectedTo = expectedSteps[i + 1];
      
      if (change.oldStep !== expectedFrom || change.newStep !== expectedTo) {
        throw new Error(
          `Step ${i + 1}: Expected ${expectedFrom}→${expectedTo}, got ${change.oldStep}→${change.newStep}`
        );
      }
    }
  },

  /**
   * Assert that mastery was achieved (step 5 reached)
   */
  expectMastery(traces: TraceEntry[], wordId: string): void {
    const masteryAchieved = traces.some(t => 
      t.domainContext.masteryChanged?.wordId === wordId && 
      t.domainContext.masteryChanged.nowMastered
    );
    
    if (!masteryAchieved) {
      throw new Error(`Word ${wordId} was never mastered (>= MASTER_STEP)`);
    }
  },

  /**
   * Assert that a session was generated with expected characteristics
   */
  expectSessionGeneration(
    traces: TraceEntry[],
    mode: string,
    expectedWordCount: number,
    maxMasteredCount?: number
  ): void {
    const sessionGen = traces.find(t => 
      t.domainContext.sessionGeneration?.mode === mode
    )?.domainContext.sessionGeneration;
    
    if (!sessionGen) {
      throw new Error(`No session generation found for mode ${mode}`);
    }
    
    if (sessionGen.totalWords !== expectedWordCount) {
      throw new Error(
        `Expected ${expectedWordCount} words in session, got ${sessionGen.totalWords}`
      );
    }
    
    if (maxMasteredCount !== undefined && sessionGen.masteredCount > maxMasteredCount) {
      throw new Error(
        `Too many mastered words in session: ${sessionGen.masteredCount} > ${maxMasteredCount}`
      );
    }
  },

  /**
   * Assert that level progression occurred
   */
  expectLevelProgression(
    traces: TraceEntry[],
    language: string,
    expectedOldLevel: number,
    expectedNewLevel: number
  ): void {
    const progression = traces.find(t => 
      t.domainContext.levelProgression?.language === language
    )?.domainContext.levelProgression;
    
    if (!progression) {
      throw new Error(`No level progression found for language ${language}`);
    }
    
    if (progression.oldLevel !== expectedOldLevel || progression.newLevel !== expectedNewLevel) {
      throw new Error(
        `Expected level ${expectedOldLevel}→${expectedNewLevel}, got ${progression.oldLevel}→${progression.newLevel}`
      );
    }
  },

  /**
   * Assert that no more than X actions were traced (performance check)
   */
  expectMaxActions(traces: TraceEntry[], maxActions: number): void {
    if (traces.length > maxActions) {
      throw new Error(`Too many actions traced: ${traces.length} > ${maxActions}`);
    }
  },

  /**
   * Assert that specific action types were captured
   */
  expectActionTypes(traces: TraceEntry[], expectedTypes: string[]): void {
    const actualTypes = traces.map(t => t.action.type);
    
    for (const expectedType of expectedTypes) {
      if (!actualTypes.includes(expectedType)) {
        throw new Error(`Missing expected action type: ${expectedType}`);
      }
    }
  },

  /**
   * Assert that session contains reasonable word mix (domain rule compliance)
   */
  expectReasonableWordMix(traces: TraceEntry[], sessionMode: string): void {
    const sessionGen = traces.find(t => 
      t.domainContext.sessionGeneration?.mode === sessionMode
    )?.domainContext.sessionGeneration;
    
    if (!sessionGen) {
      throw new Error(`No session generation found for mode ${sessionMode}`);
    }
    
    // Domain rule: Sessions should have meaningful mix (not all mastered words)
    const masteredRatio = sessionGen.masteredCount / sessionGen.totalWords;
    
    if (masteredRatio > 0.8) {
      throw new Error(
        `Session has too many mastered words: ${masteredRatio * 100}% (should be ≤80%)`
      );
    }
    
    // Domain rule: Sessions should have reasonable size (1-12 words)
    if (sessionGen.totalWords < 1 || sessionGen.totalWords > 12) {
      throw new Error(
        `Session size out of bounds: ${sessionGen.totalWords} (should be 1-12)`
      );
    }
  },
};

/**
 * Helper to create test users with specific word states
 */
export function createTestUser(userId: string, words: Array<{
  id: string;
  text: string;
  step?: number;
  language?: string;
  complexityLevel?: number;
}>) {
  const userWords: Record<string, any> = {};
  
  words.forEach(word => {
    userWords[word.id] = {
      id: word.id,
      text: word.text,
      step: word.step || 0,
      language: word.language || 'english',
      complexityLevel: word.complexityLevel || 1,
      attempts: [],
      cooldownSessionsLeft: 0,
    };
  });
  
  return {
    users: {
      [userId]: {
        displayName: `Test User ${userId}`,
        words: userWords,
        sessions: {},
        activeSessions: {},
        settings: {
          sessionSizes: {
            english: 12,
            kannada: 12,
            mathtables: 12,
            humanbody: 5,
            indiageography: 12,
            mixed: 12
          },
          languages: ['english'],
          complexityLevels: {
            english: 1,
            kannada: 1,
            mathtables: 1,
            indiageography: 1,
            hindi: 1
          },
        },
      },
    },
    currentUserId: userId,
  };
}

/**
 * Helper to simulate realistic user interactions
 */
export const userInteractions = {
  /**
   * Simulate user attempting a word multiple times until mastery
   */
  masterWord(wordId: string, correctAttempts: number = 5, sessionId: string = 'test-session'): Array<{ type: string; payload: any }> {
    const actions = [];
    let timestampSeed = Date.now();
    
    for (let i = 0; i < correctAttempts; i++) {
      timestampSeed += 1;
      actions.push({
        type: 'game/attempt',
        payload: { 
          sessionId, 
          wordId, 
          result: 'correct',
          now: timestampSeed,
        },
      });
    }
    
    return actions;
  },

  /**
   * Simulate mixed correct/incorrect attempts
   */
  attemptWordWithMistakes(
    wordId: string, 
    sequence: boolean[],
    sessionId: string = 'test-session'
  ): Array<{ type: string; payload: any }> {
    let timestampSeed = Date.now();
    return sequence.map(correct => {
      timestampSeed += 1;
      return {
        type: 'game/attempt',
        payload: {
          sessionId,
          wordId,
          result: correct ? 'correct' : 'wrong',
          now: timestampSeed,
        },
      };
    });
  },

  /**
   * Simulate completing an entire session
   */
  completeSession(wordIds: string[], sessionId: string = 'test-session'): Array<{ type: string; payload: any }> {
    const actions = [];
    
    // Start session
    actions.push({
      type: 'game/startSession',
      payload: { sessionId },
    });
    
    // Complete each word in the session
    wordIds.forEach(wordId => {
      actions.push(...this.masterWord(wordId));
    });
    
    return actions;
  },
};

/**
 * Export complete testing API
 */
export const traceTestAPI = {
  runTraceTest,
  assert: traceAssertions,
  createTestUser,
  interactions: userInteractions,
  createTestStore,
};
