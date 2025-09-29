/**
 * BDD-Style Math Learning Journey Test
 * 
 * This test follows the complete user journey step-by-step:
 * 1. User loads app → sees English mode with 12 questions
 * 2. User switches to Math mode → sees level 1 questions  
 * 3. User masters questions one by one → all questions completed
 * 4. User clicks Next → expects fresh level 2 questions
 * 
 * Each step reports success/failure in plain English for easy debugging
 */

import { describe, test, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import gameSlice from '../slice';
import { traceMiddleware, traceAPI } from '../../../app/tracing/traceMiddleware';
import { handleNextPressed } from '../actions';
import type { RootState } from '../state';
import { MASTER_STEP } from '../../game/modeConfig';

// Test helper to create store with tracing
function createTestStore() {
  return configureStore({
    reducer: { game: gameSlice },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(traceMiddleware.middleware),
  });
}

// BDD Test Report Helper
class TestStep {
  private stepName: string;
  
  constructor(stepName: string) {
    this.stepName = stepName;
  }
  
  success(message: string) {
    console.log(`✅ STEP ${this.stepName}: ${message}`);
  }
  
  failure(message: string) {
    console.log(`❌ STEP ${this.stepName}: ${message}`);
    throw new Error(`Step "${this.stepName}" failed: ${message}`);
  }
  
  info(message: string) {
    console.log(`ℹ️  STEP ${this.stepName}: ${message}`);
  }
}

describe("Complete Math Learning Journey", () => {
  let store: ReturnType<typeof createTestStore>;
  let userId: string;

  beforeEach(() => {
    store = createTestStore();
    traceAPI.clearTraces();
    userId = `user_${Date.now()}`;
  });

  test("User masters level 1 math and progresses to level 2", async () => {
    console.log("\n🎯 Starting Complete Math Learning Journey Test");
    console.log("===============================================\n");

    // STEP 1: User loads app and sees English mode with 12 questions
    const step1 = new TestStep("1 - App Loading & English Mode");
    
    step1.info("User opens the learning app for the first time");
    store.dispatch({
      type: 'game/addUser',
      payload: { userId, displayName: 'Sarah' }
    });

    // Create English session with 12 questions
    const englishSessionId = `english_${Date.now()}`;
    store.dispatch({
      type: 'game/addSession',
      payload: {
        sessionId: englishSessionId,
        session: {
          wordIds: Array.from({length: 12}, (_, i) => `word_${i + 1}`),
          mode: 'practice',
          settings: {
            languages: ['english'],
            complexityLevels: { english: 1 }
          }
        }
      }
    });

    store.dispatch({
      type: 'game/setMode',
      payload: { mode: 'english', sessionId: englishSessionId }
    });

    const state1 = store.getState().game as RootState;
    const user1 = state1.users[userId];
    const englishSession = user1.sessions[englishSessionId];

    if (user1.currentMode === 'english' && englishSession.wordIds.length === 12) {
      step1.success("User sees English mode with 12 questions as expected");
    } else {
      step1.failure(`Expected English mode with 12 questions, got ${user1.currentMode} with ${englishSession.wordIds.length} questions`);
    }

    // STEP 2: User switches to Math mode and sees level 1 questions
    const step2 = new TestStep("2 - Switch to Math Mode");
    
    step2.info("User clicks 'Math Mode' to learn multiplication tables");
    
    const mathSessionId = `math_${Date.now()}`;
    
    // Get all level 1 math word IDs for the session
    const tempState = store.getState().game as RootState;
    const tempUser = tempState.users[userId];
    const allLevel1WordIds = Object.values(tempUser.words)
      .filter(word => word.language === 'mathtables' && word.complexityLevel === 1)
      .map(word => word.id);
    
    store.dispatch({
      type: 'game/addSession',
      payload: {
        sessionId: mathSessionId,
        session: {
          wordIds: allLevel1WordIds, // All level 1 words, not just a subset
          mode: 'practice',
          settings: {
            languages: ['mathtables'],
            complexityLevels: { mathtables: 1 }
          }
        }
      }
    });

    store.dispatch({
      type: 'game/setMode',
      payload: { mode: 'mathtables', sessionId: mathSessionId }
    });

    const state2 = store.getState().game as RootState;
    const user2 = state2.users[userId];
    const mathSession = user2.sessions[mathSessionId];

    const complexityLevel = user2.settings.complexityLevels.mathtables || 1; // Use same default as the app
    if (user2.currentMode === 'mathtables' && 
        complexityLevel === 1 &&
        mathSession.wordIds.length > 0 &&
        mathSession.wordIds.every(id => id.startsWith('2x'))) {
      step2.success(`User sees Math mode with ${mathSession.wordIds.length} level 1 questions (2x tables)`);
    } else {
      step2.failure(`Expected Math mode with level 1 (2x) questions, got mode: ${user2.currentMode}, level: ${complexityLevel}`);
    }

    // STEP 3: User masters questions one by one
    const step3 = new TestStep("3 - Master All Questions");
    
    step3.info("User practices and masters each multiplication question");
    
    // First, get all level 1 math words from the user's word collection
    const state3Pre = store.getState().game as RootState;
    const user3Pre = state3Pre.users[userId];
    const allLevel1MathWords = Object.values(user3Pre.words).filter(word => 
      word.language === 'mathtables' && word.complexityLevel === 1
    );
    
    step3.info(`Found ${allLevel1MathWords.length} total level 1 math words to master`);
    
    // Master ALL level 1 math words (not just session words) for proper progression
    // Make MASTER_STEP correct attempts for each word to master it
    for (const word of allLevel1MathWords) {
      for (let attempt = 1; attempt <= MASTER_STEP; attempt++) {
        store.dispatch({
          type: 'game/attempt',
          payload: {
            sessionId: mathSessionId,
            wordId: word.id,
            result: 'correct'
          }
        });
      }
    }
    
    step3.info(`Mastered all ${allLevel1MathWords.length} level 1 words: ${allLevel1MathWords.map(w => w.id).join(', ')}`);

    // Verify mastery was set correctly for progression check
    const state3 = store.getState().game as RootState;
    const user3 = state3.users[userId];
    
    const masteredLevel1Words = Object.values(user3.words).filter(word => 
      word.language === 'mathtables' && word.complexityLevel === 1 && word.step >= MASTER_STEP
    );
    
    if (masteredLevel1Words.length === allLevel1MathWords.length) {
      step3.success(`All ${masteredLevel1Words.length} level 1 math words mastered - ready for progression`);
    } else {
      step3.failure(`Only ${masteredLevel1Words.length}/${allLevel1MathWords.length} level 1 words mastered`);
    }

    // STEP 4: User clicks Next and expects fresh level 2 questions
    const step4 = new TestStep("4 - Click Next for Level 2");
    
    step4.info("User clicks 'Next' button expecting level 2 questions");
    
    // Debug: Check progression readiness before clicking Next
    const preState = store.getState().game as RootState;
    const preUser = preState.users[userId];
    const level1Words = Object.values(preUser.words).filter(w => 
      w.language === 'mathtables' && w.complexityLevel === 1
    );
    const masteredLevel1 = level1Words.filter(w => w.step >= 5);
    step4.info(`Pre-click: ${masteredLevel1.length}/${level1Words.length} level 1 words mastered`);
    step4.info(`Current level: ${preUser.settings.complexityLevels.mathtables}`);
    
    const tracesBefore = traceAPI.getTraceCount();
    store.dispatch(handleNextPressed({ mode: 'mathtables' }));
    
    const state4 = store.getState().game as RootState;
    const user4 = state4.users[userId];
    const newTraces = traceAPI.getAllTraces().slice(tracesBefore);

    // Check what actions were dispatched
    const actionTypes = newTraces.map(t => t.action.type);
    step4.info(`Actions dispatched: ${actionTypes.join(', ')}`);

    // Check level progression
    const currentLevel = user4.settings.complexityLevels.mathtables;
    if (currentLevel === 2) {
      step4.success("Level progression successful: 1 → 2");
    } else {
      step4.failure(`Expected level progression to 2, but stayed at level ${currentLevel}`);
    }

    // Check session generation
    const sessionTraces = newTraces.filter(t => t.action.type === 'game/addSession');
    if (sessionTraces.length === 0) {
      step4.failure("No new session created after clicking Next");
    }

    const latestSessionTrace = sessionTraces[sessionTraces.length - 1];
    const sessionGeneration = latestSessionTrace.domainContext.sessionGeneration;

    step4.info(`Session generation found ${sessionGeneration?.totalWords || 0} total words`);
    step4.info(`Session generation found ${sessionGeneration?.unmasteredCount || 0} unmastered words`);

    // CRITICAL BUG CHECK: Should find level 2 questions 
    // The bug was that it found 0 words, but now it should find level 2 words (up to session limit)
    if (!sessionGeneration || sessionGeneration.totalWords === 0) {
      step4.failure("🐛 BUG DETECTED: No words found for level 2 - user cannot continue learning!");
    } else if (sessionGeneration.totalWords < 10) {
      step4.failure(`🐛 BUG DETECTED: Only ${sessionGeneration.totalWords} level 2 words found, too few to continue`);
    } else {
      step4.success(`Fresh level 2 questions available: ${sessionGeneration.totalWords} words found (session size limited)`);
    }

    // FINAL REPORT
    console.log("\n📊 JOURNEY COMPLETION REPORT");
    console.log("=============================");
    console.log("✅ Step 1: App loaded with English mode (12 questions)");
    console.log("✅ Step 2: Switched to Math mode (level 1 questions)");
    console.log("✅ Step 3: Mastered all level 1 questions");
    
    // Report success if sessionGeneration met our earlier success criteria
    if (sessionGeneration && sessionGeneration.totalWords >= 10) {
      console.log("✅ Step 4: Successfully progressed to level 2 with fresh questions (session size limited)");
      console.log("\n🎉 COMPLETE USER JOURNEY SUCCESSFUL! 🎉");
    } else {
      console.log("❌ Step 4: FAILED - User stuck with no questions after mastery");
      console.log("\n💔 USER JOURNEY BROKEN - LEARNING STOPS HERE 💔");
    }
  });

  test("Partial mastery scenario - user should stay at same level", () => {
    console.log("\n🔄 Testing Partial Mastery Scenario");
    console.log("===================================\n");

    const step = new TestStep("Partial Mastery");
    
    // Create user with math session
    store.dispatch({
      type: 'game/addUser',
      payload: { userId, displayName: 'Alex' }
    });

    const sessionId = `partial_${Date.now()}`;
    const allQuestions = ['2x1', '2x2', '2x3', '2x4', '2x5'];
    
    store.dispatch({
      type: 'game/addSession',
      payload: {
        sessionId,
        session: {
          wordIds: allQuestions,
          mode: 'practice',
          settings: {
            languages: ['mathtables'],
            complexityLevels: { mathtables: 1 }
          }
        }
      }
    });

    store.dispatch({
      type: 'game/setMode',
      payload: { mode: 'mathtables', sessionId }
    });

    // Master only half the questions
    const halfQuestions = allQuestions.slice(0, 2);
    halfQuestions.forEach(id => {
      store.dispatch({
        type: 'game/updateWordStep',
        payload: { wordId: id, step: 5 }
      });
    });

    step.info(`Mastered ${halfQuestions.length}/${allQuestions.length} questions`);

    // Click Next
    store.dispatch(handleNextPressed({ mode: 'mathtables' }));

    const finalState = store.getState().game as RootState;
    const finalUser = finalState.users[userId];
    const finalComplexityLevel = finalUser.settings.complexityLevels.mathtables || 1; // Use same default as the app

    if (finalComplexityLevel === 1) {
      step.success("User correctly stays at level 1 with partial mastery");
    } else {
      step.failure(`Expected to stay at level 1, but progressed to level ${finalComplexityLevel}`);
    }
  });
});