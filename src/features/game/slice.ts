import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './state';
import { getInitialWords } from '../../app/bootstrapState';
// Thunks moved to actions.ts

// Use semantic/opaque user ids in core state instead of real names.
export const DEFAULT_USER_ID = 'user_default';

export const makeUser = (displayName?: string) => ({
  displayName,
  words: getInitialWords(),
  sessions: {},
  activeSessions: {},
  settings: {
      // selectionWeights removed (simplified session generation logic)
    sessionSizes: { 
      english: 12,   // Default for English
      kannada: 12,   // Default for Kannada  
      mathtables: 12, // Default for Math Tables
      humanbody: 5,  // Small sessions for Human Body (only 18 total questions, allows 3+ cycles)
      indiageography: 12, // Default for India Geography
      mixed: 12      // Default for mixed mode
    },
    languages: ['english'], // Default to English only
    complexityLevels: {
      'english': 1,  // Start with Level 1 English (simple CVC words)
      'kannada': 1,  // Start with Level 1 Kannada (simple words without complex matras)
      'mathtables': 1, // Start with Level 1 Math Tables (1x and 2x tables)
      'indiageography': 1, // Start with Level 1 India Geography (basic facts)
      'hindi': 1     // Future support for Hindi
    }
  },
});

const initialState: RootState = {
  // Start with no users by default. Let the UI create a user on first use.
  users: {},
  currentUserId: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    selectUser: function (state, action: PayloadAction<{ userId: string }>) {
      if (state.users[action.payload.userId]) {
        state.currentUserId = action.payload.userId;
      }
    },
    addUser: function (state, action: PayloadAction<{ userId: string; displayName?: string }>) {
      const newUserId = action.payload.userId.trim();
      // Prevent adding empty userId or duplicate userId
      if (!newUserId || state.users[newUserId]) {
        return;
      }
        state.users[newUserId] = makeUser(action.payload.displayName);
      state.currentUserId = newUserId;
    },
    setMode: function (state, action: PayloadAction<{ mode: string; sessionId: string }>) {
      const uid = state.currentUserId;
      if (!uid) return;
      const user = state.users[uid];
      if (user) {
        user.activeSessions[action.payload.mode] = action.payload.sessionId;
      }
    },
    attempt: function (state, action: PayloadAction<{ sessionId: string; wordId: string; result: 'correct' | 'wrong'; now?: number }>) {
  const uid = state.currentUserId;
  if (!uid) return;
  const user = state.users[uid];
      const { sessionId, wordId, result, now = Date.now() } = action.payload;
      const word = user.words[wordId];
      if (word) {
        const prevStep = word.step;
        
        // Add attempt to history
        word.attempts.push({ timestamp: now, result });
        
        // Step-based transitions per new spec
        if (word.step < 5) {
          // Practice mode (step < 5)
          if (result === 'correct') {
            word.step = Math.min(5, word.step + 1);
            word.lastPracticedAt = now;
            
            // If step reaches 5, mark mastered and set cooldown
            if (word.step === 5) {
              word.lastRevisedAt = now;
              word.cooldownSessionsLeft = 1;
              console.log(`🎉 [ATTEMPT] Word "${wordId}" MASTERED! (step ${prevStep} → ${word.step})`);
            } else {
              console.log(`📈 [ATTEMPT] Word "${wordId}" correct: step ${prevStep} → ${word.step}`);
            }
          } else {
            // Wrong answer
            word.step = Math.max(0, word.step - 1);
            word.lastPracticedAt = now;
            console.log(`📉 [ATTEMPT] Word "${wordId}" wrong: step ${prevStep} → ${word.step}`);
          }
        } else if (word.step === 5 && word.cooldownSessionsLeft === 0) {
          // Revision mode (step = 5, cooldownSessionsLeft = 0)
          if (result === 'correct') {
            // Stay at step 5, set cooldown
            word.lastRevisedAt = now;
            word.cooldownSessionsLeft = 1;
          } else {
            // Drop to step 3, back to practice
            word.step = 3;
            word.lastPracticedAt = now;
            word.cooldownSessionsLeft = 0;
          }
        }
      }
      
      const session = user.sessions[sessionId];
      if (session) {
        session.revealed = true;
        session.lastAttempt = result;
      }
    },
    nextCard: function (state, action: PayloadAction<{ sessionId: string }>) {
  const uid = state.currentUserId;
  if (!uid) return;
  const user = state.users[uid];
      const { sessionId } = action.payload;
      const session = user.sessions[sessionId];
      if (session) {
        // Find unmastered words in the session (step < 5)
        const unmasteredIndices: number[] = [];
        for (let i = 0; i < session.wordIds.length; i++) {
          const wordId = session.wordIds[i];
          const word = user.words[wordId];
          if (word && word.step < 5) {
            unmasteredIndices.push(i);
          }
        }

        // If there are unmastered words, randomly pick one
        if (unmasteredIndices.length > 0) {
          const randomIndex = Math.floor(Math.random() * unmasteredIndices.length);
          session.currentIndex = unmasteredIndices[randomIndex];
          session.needsNewSession = false;
        } else {
          // If all words are mastered, signal that a new session is needed
          session.needsNewSession = true;
        }

        session.revealed = false;
        session.lastAttempt = undefined;
      }
    },
    addSession: function (state, action: PayloadAction<{ sessionId: string; session: import('./state').Session }>) {
      const uid = state.currentUserId;
      if (!uid) return;
      const user = state.users[uid];
      if (!user) return;
      user.sessions[action.payload.sessionId] = action.payload.session;
    },
    setLanguagePreferences: function (state, action: PayloadAction<{ languages: string[] }>) {
      const uid = state.currentUserId;
      if (!uid) return;
      const user = state.users[uid];
      if (!user) return;
      user.settings.languages = action.payload.languages;
    },
    setSessionSize: function (state, action: PayloadAction<{ mode: string; sessionSize: number }>) {
      const uid = state.currentUserId;
      if (!uid) return;
      const user = state.users[uid];
      if (!user) return;
      
      // Handle migration: if user has old sessionSize structure, migrate to new structure
      if (!user.settings.sessionSizes) {
        const legacySessionSize = (user.settings as any).sessionSize || 6;
        user.settings.sessionSizes = {
          english: legacySessionSize,
          kannada: legacySessionSize,
          mixed: legacySessionSize
        };
        // Remove old sessionSize property
        delete (user.settings as any).sessionSize;
      }
      
      user.settings.sessionSizes[action.payload.mode] = action.payload.sessionSize;
    },
    progressComplexityLevel: function (state, action: PayloadAction<{ language: string }>) {
      const uid = state.currentUserId;
      if (!uid) return;
      const user = state.users[uid];
      if (!user) return;
      
      const currentLevel = user.settings.complexityLevels[action.payload.language] || 1;
      // Progress to next level (with a reasonable max level of 10)
      user.settings.complexityLevels[action.payload.language] = Math.min(currentLevel + 1, 10);
    },
    setComplexityLevel: function (state, action: PayloadAction<{ language: string; level: number }>) {
      const uid = state.currentUserId;
      if (!uid) return;
      const user = state.users[uid];
      if (!user) return;
      
      // Ensure level is within bounds (1-10)
      const level = Math.max(1, Math.min(10, action.payload.level));
      user.settings.complexityLevels[action.payload.language] = level;
    },
    decrementCooldowns: function (state, action: PayloadAction<{ wordIds: string[] }>) {
      const uid = state.currentUserId;
      if (!uid) return;
      const user = state.users[uid];
      if (!user) return;
      
      // Decrement cooldownSessionsLeft for revision words after session
      action.payload.wordIds.forEach(wordId => {
        const word = user.words[wordId];
        if (word && word.step === 5 && word.cooldownSessionsLeft > 0) {
          word.cooldownSessionsLeft = Math.max(0, word.cooldownSessionsLeft - 1);
        }
      });
    },
  },
});

export const { selectUser, setMode, attempt, nextCard, addSession, addUser, setLanguagePreferences, setSessionSize, progressComplexityLevel, setComplexityLevel, decrementCooldowns } = gameSlice.actions;
export default gameSlice.reducer;
