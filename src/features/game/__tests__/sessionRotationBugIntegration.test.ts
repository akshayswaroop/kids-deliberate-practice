import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import gameSlice, { makeUser, addSession, setMode } from '../slice';
import { selectShouldProgressLevel, selectWordsByComplexityLevel, selectAreAllSessionWordsMastered } from '../selectors';
import { selectSessionWords } from '../sessionGen';
import type { RootState } from '../state';
import seedrandom from 'seedrandom';

/**
 * INTEGRATION TEST: Hook into existing console logging infrastructure
 * 
 * This test captures the actual console.log output from our enhanced
 * logging throughout the selectors, sessionGen, and actions to verify
 * that the session rotation bug is properly detected and resolved.
 */
describe('Session Rotation Bug - Console Log Integration', () => {
  
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let logOutput: string[];

  beforeEach(() => {
    logOutput = [];
    consoleSpy = vi.spyOn(console, 'log').mockImplementation((...args) => {
      logOutput.push(args.join(' '));
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  function expectLogContains(expectedText: string) {
    const found = logOutput.some(log => log.includes(expectedText));
    if (!found) {
      console.error('Expected log not found:', expectedText);
      console.error('Actual logs:', logOutput);
    }
    expect(found).toBe(true);
  }

  function expectLogSequence(expectedTexts: string[]) {
    expectedTexts.forEach(text => expectLogContains(text));
  }

  it('should capture existing console logs showing the session rotation bug and its fix', () => {
    // Create realistic user state with 24 mastered words (80% of level 1)
    const userId = 'test_user';
    let state: RootState = {
      users: { [userId]: makeUser('Test User') },
      currentUserId: userId
    };

    // Master exactly 24 level-1 English words to trigger the bug scenario
    const englishWords = Object.keys(state.users[userId].words)
      .filter(id => state.users[userId].words[id].language === 'english')
      .slice(0, 24);

    englishWords.forEach(wordId => {
      state.users[userId].words[wordId].step = 5;
      state.users[userId].words[wordId].attempts = Array(5).fill(null).map(() => ({
        timestamp: Date.now(),
        result: 'correct' as const
      }));
    });

    // Clear logs from setup
    logOutput.length = 0;

    // PHASE 1: Test session generation with the buggy scenario
    // This should trigger our SESSION_GEN logging
    const allWords = Object.values(state.users[userId].words)
      .filter(w => w.language === 'english' && w.complexityLevel === 1);
    
    const rng = seedrandom('bug-test');
    const buggySessionWords = selectSessionWords(
      allWords,
      state.users[userId].settings.selectionWeights,
      12,
      rng
    );

    // Verify the SESSION_GEN logs show the problematic state
    expectLogSequence([
      '📊 [SESSION_GEN] Word buckets - New: 0, Struggle: 0, Mastered: 24',
      '🎯 [SESSION_GEN] Sampled - Struggle: 0, New: 0, Mastered:'
    ]);

    // PHASE 2: Test selector logic for session completion
    // Create a session with all mastered words to test the selector
    const sessionId = 'test_session';
    const session = {
      wordIds: buggySessionWords,
      currentIndex: 0,
      revealed: false,
      mode: 'practice' as const,
      createdAt: Date.now(),
      settings: state.users[userId].settings,
    };

    state = gameSlice(state, addSession({ sessionId, session }));
    state = gameSlice(state, setMode({ mode: 'practice', sessionId }));

    // Clear logs and test the selector
    logOutput.length = 0;
    
    const allSessionWordsMastered = selectAreAllSessionWordsMastered(state, sessionId);

    // Verify the SELECTOR logs show the session analysis
    expectLogSequence([
      `🔍 [SELECTOR] selectAreAllSessionWordsMastered called for session: ${sessionId}`,
      '📊 [SELECTOR] Session test_session: 12/12 mastered (100%)',
      '📊 [SELECTOR] Threshold: 10 (80%)', // 12 * 0.8 = 9.6, rounded to 10
      '📊 [SELECTOR] Result: true (CREATE NEW SESSION)'
    ]);

    expect(allSessionWordsMastered).toBe(true);

    // PHASE 3: Test complexity progression detection
    logOutput.length = 0;
    
    const shouldProgress = selectShouldProgressLevel(state, 'english');
    expect(shouldProgress).toBe(true);

    // PHASE 4: Apply the fix and verify new session generation
    state = gameSlice(state, { 
      type: 'game/progressComplexityLevel', 
      payload: { language: 'english' } 
    });

    expect(state.users[userId].settings.complexityLevels.english).toBe(2);

    // Generate new session with expanded word pool
    logOutput.length = 0;
    
    const fixedAvailableWords = selectWordsByComplexityLevel(state, ['english']);
    const fixedSessionWords = selectSessionWords(
      Object.values(fixedAvailableWords).filter(w => w.language === 'english'),
      state.users[userId].settings.selectionWeights,
      12,
      seedrandom('fixed-test')
    );

    // Verify the SESSION_GEN logs show the fixed state with new words available
    expectLogSequence([
      '📊 [SESSION_GEN] Word buckets - New: 38, Struggle: 0, Mastered: 24',
      '🎯 [SESSION_GEN] Sampled - Struggle: 0, New:'  // Should have some new words
    ]);

    // Verify the fix: session now contains new words
    const newWordsInSession = fixedSessionWords.filter(wordId => 
      fixedAvailableWords[wordId].step === 0
    ).length;
    
    expect(newWordsInSession).toBeGreaterThan(0);

    // Print summary of captured logs for debugging (temporarily restore console)
    consoleSpy.mockRestore();
    console.log('\n=== CAPTURED CONSOLE LOGS FROM EXISTING INFRASTRUCTURE ===');
    logOutput.forEach((log, i) => console.log(`${i + 1}: ${log}`));
    
    console.log('\n🎯 This test demonstrates that the existing logging would have revealed:');
    console.log('  • Session generation creates only mastered words when no new words available');
    console.log('  • Selector correctly identifies 100% mastery threshold breach');
    console.log('  • Complexity progression adds 38 new words to the available pool');  
    console.log('  • Fixed session generation now includes new words for fresh learning');
    
    // Re-establish mock for cleanup
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should verify the middleware logging captures session state changes', () => {
    // Test that our existing middleware and action logging works
    const userId = 'middleware_test';
    let state: RootState = {
      users: { [userId]: makeUser('Middleware Test') },
      currentUserId: userId
    };

    // Set up a realistic scenario and capture what the middleware would log
    const sessionId = 'middleware_session';
    const session = {
      wordIds: ['an', 'at', 'as'], // First 3 words
      currentIndex: 0,
      revealed: false,
      mode: 'practice' as const,
      createdAt: Date.now(),
      settings: state.users[userId].settings,
    };

    logOutput.length = 0;

    // Test session addition - this would trigger our logging middleware
    state = gameSlice(state, addSession({ sessionId, session }));
    
    // Test selector calls that happen during normal flow
    const result = selectAreAllSessionWordsMastered(state, sessionId);
    
    // Since the words aren't mastered yet, should show appropriate logs
    expectLogContains('🔍 [SELECTOR] selectAreAllSessionWordsMastered called for session:');
    expectLogContains('📊 [SELECTOR] Result: false (CONTINUE CURRENT)');
    
    expect(result).toBe(false);
  });
});