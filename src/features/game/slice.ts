import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './state';
import { getInitialWords } from '../../app/bootstrapState';

const defaultUserId = 'Mishika';
const userDefaults = () => ({
  words: getInitialWords(),
  sessions: {},
  activeSessions: {},
  settings: {
    selectionWeights: {
      struggle: 0.5,
      new: 0.4,
      mastered: 0.1,
    },
    sessionSize: 12,
    languages: ['english'], // Default to English only
  },
});

const initialState: RootState = {
  users: {
    Mishika: userDefaults(),
    Eva: userDefaults(),
    Akshay: userDefaults(),
  },
  currentUserId: defaultUserId,
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
    addUser: function (state, action: PayloadAction<{ userId: string }>) {
      const newUserId = action.payload.userId.trim();
      // Prevent adding empty userId or duplicate userId
      if (!newUserId || state.users[newUserId]) {
        return;
      }
      state.users[newUserId] = {
        words: getInitialWords(),
        sessions: {},
        activeSessions: {},
        settings: {
          selectionWeights: {
            struggle: 0.5,
            new: 0.4,
            mastered: 0.1,
          },
          sessionSize: 12,
          languages: ['english'], // Default to English only
        },
      };
      state.currentUserId = newUserId;
    },
    setMode: function (state, action: PayloadAction<{ mode: string; sessionId: string }>) {
      const user = state.users[state.currentUserId];
      if (user) {
        user.activeSessions[action.payload.mode] = action.payload.sessionId;
      }
    },
    attempt: function (state, action: PayloadAction<{ sessionId: string; wordId: string; result: 'correct' | 'wrong' }>) {
      const user = state.users[state.currentUserId];
      if (!user) return;
      const { sessionId, wordId, result } = action.payload;
      const word = user.words[wordId];
      if (word) {
        word.attempts.push({ timestamp: Date.now(), result });
      }
      const session = user.sessions[sessionId];
      if (session) {
        session.revealed = true;
        session.lastAttempt = result;
      }
    },
    nextCard: function (state, action: PayloadAction<{ sessionId: string }>) {
      const user = state.users[state.currentUserId];
      if (!user) return;
      const { sessionId } = action.payload;
      const session = user.sessions[sessionId];
      if (session) {
        // Find unmastered words in the session (mastery < 100%)
        const unmasteredIndices: number[] = [];
        for (let i = 0; i < session.wordIds.length; i++) {
          const wordId = session.wordIds[i];
          const word = user.words[wordId];
          if (word) {
            // Calculate mastery for this word
            let mastery = 0;
            for (const attempt of word.attempts) {
              if (attempt.result === "correct") mastery += 20;
              else if (attempt.result === "wrong") mastery -= 20;
              mastery = Math.max(0, Math.min(100, mastery));
            }
            // Include this word if not yet mastered
            if (mastery < 100) {
              unmasteredIndices.push(i);
            }
          }
        }

        // If there are unmastered words, randomly pick one
        if (unmasteredIndices.length > 0) {
          const randomIndex = Math.floor(Math.random() * unmasteredIndices.length);
          session.currentIndex = unmasteredIndices[randomIndex];
        } else {
          // If all words are mastered, cycle through all words
          session.currentIndex = (session.currentIndex + 1) % session.wordIds.length;
        }

        session.revealed = false;
        session.lastAttempt = undefined;
      }
    },
    addSession: function (state, action: PayloadAction<{ sessionId: string; session: import('./state').Session }>) {
      const user = state.users[state.currentUserId];
      if (!user) return;
      user.sessions[action.payload.sessionId] = action.payload.session;
    },
    setLanguagePreferences: function (state, action: PayloadAction<{ languages: string[] }>) {
      const user = state.users[state.currentUserId];
      if (!user) return;
      user.settings.languages = action.payload.languages;
    },
  },
});

export const { selectUser, setMode, attempt, nextCard, addSession, addUser, setLanguagePreferences } = gameSlice.actions;
export default gameSlice.reducer;
