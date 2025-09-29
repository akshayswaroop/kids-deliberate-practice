import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './state';
import { isMastered } from './modeConfig';
import { loadAllWords } from '../../app/subjectLoader';
// Thunks moved to actions.ts

// Use semantic/opaque user ids in core state instead of real names.
export const DEFAULT_USER_ID = 'user_default';

export const makeUser = (displayName?: string) => ({
  displayName,
  words: loadAllWords(),
  sessions: {},
  activeSessions: {},
  settings: {
    // Generic defaults - subjects get added dynamically as they're encountered
    sessionSizes: {}, // Will be populated as subjects are used
    languages: [], // Will be populated from available subjects
    complexityLevels: {} // Will be populated as subjects are used
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
        user.currentMode = action.payload.mode; // Track the current active mode
      }
    },
    attempt: function (state, action: PayloadAction<{ sessionId: string; wordId: string; result: 'correct' | 'wrong'; now?: number }>) {
  const uid = state.currentUserId;
  if (!uid) return;
  const user = state.users[uid];
      const { sessionId, wordId, result, now = Date.now() } = action.payload;
      const word = user.words[wordId];
      if (word) {
        // Add attempt to history
        word.attempts.push({ timestamp: now, result });
        
        // Step-based transitions per new spec, using isMastered() helper
        if (!isMastered(word)) {
          // Practice mode (not mastered)
          if (result === 'correct') {
            word.step = Math.min(5, word.step + 1);
            word.lastPracticedAt = now;
            // If this update caused mastery (per step threshold), set revision metadata
            if (isMastered(word)) {
              word.lastRevisedAt = now;
              word.cooldownSessionsLeft = 1;
            }
          } else {
            // Wrong answer resets progress step downwards
            word.step = Math.max(0, word.step - 1);
            word.lastPracticedAt = now;
          }
        } else if (isMastered(word) && word.cooldownSessionsLeft === 0) {
          // Revision mode (considered mastered per config, cooldownSessionsLeft = 0)
          if (result === 'correct') {
            // Stay at mastered state, set cooldown
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
        // Don't auto-reveal answers on attempt - only track the attempt result
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
        // Find unmastered words in the session (not mastered per config)
        const unmasteredIndices: number[] = [];
        for (let i = 0; i < session.wordIds.length; i++) {
          const wordId = session.wordIds[i];
          const word = user.words[wordId];
          if (word && !isMastered(word)) {
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
        user.settings.sessionSizes = {};
        // Remove old sessionSize property if it exists
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
    revealAnswer: function (state, action: PayloadAction<{ sessionId: string; wordId: string; revealed: boolean }>) {
      const uid = state.currentUserId;
      if (!uid) return;
      const user = state.users[uid];
      if (!user) return;
      
      const { sessionId, wordId, revealed } = action.payload;
      const session = user.sessions[sessionId];
      const word = user.words[wordId];
      
      if (session && word) {
        // Toggle the revealed state in session
        session.revealed = revealed;
        
        // Increment reveal count only when revealing (not hiding)
        if (revealed) {
          word.revealCount = (word.revealCount || 0) + 1;
        }
      }
    },
    decrementCooldowns: function (state, action: PayloadAction<{ wordIds: string[] }>) {
      const uid = state.currentUserId;
      if (!uid) return;
      const user = state.users[uid];
      if (!user) return;
      
      // Decrement cooldownSessionsLeft for revision words after session
      action.payload.wordIds.forEach(wordId => {
        const word = user.words[wordId];
        if (word && isMastered(word) && word.cooldownSessionsLeft > 0) {
          word.cooldownSessionsLeft = Math.max(0, word.cooldownSessionsLeft - 1);
        }
      });
    },
  },
});

export const { selectUser, setMode, attempt, nextCard, addSession, addUser, setLanguagePreferences, setSessionSize, progressComplexityLevel, setComplexityLevel, decrementCooldowns, revealAnswer } = gameSlice.actions;
export default gameSlice.reducer;
