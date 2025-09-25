import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './state';
import { getInitialWords } from '../../app/bootstrapState';

const defaultUserId = 'user1';
const initialState: RootState = {
  users: {
    [defaultUserId]: {
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
    },
  },
  currentUserId: defaultUserId,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    selectUser(state, action: PayloadAction<{ userId: string }>) {
      if (state.users[action.payload.userId]) {
        state.currentUserId = action.payload.userId;
      }
    },
    addUser(state, action: PayloadAction<{ userId: string }>) {
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
    setMode(state, action: PayloadAction<{ mode: string; sessionId: string }>) {
      const user = state.users[state.currentUserId];
      if (user) {
        user.activeSessions[action.payload.mode] = action.payload.sessionId;
      }
    },
    attempt(state, action: PayloadAction<{ sessionId: string; wordId: string; result: 'correct' | 'wrong' }>) {
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
    nextCard(state, action: PayloadAction<{ sessionId: string }>) {
      const user = state.users[state.currentUserId];
      if (!user) return;
      const { sessionId } = action.payload;
      const session = user.sessions[sessionId];
      if (session) {
        if (session.currentIndex < session.wordIds.length - 1) {
          session.currentIndex += 1;
        }
        session.revealed = false;
        session.lastAttempt = undefined;
      }
    },
    addSession(state, action: PayloadAction<{ sessionId: string; session: import('./state').Session }>) {
      const user = state.users[state.currentUserId];
      if (!user) return;
      user.sessions[action.payload.sessionId] = action.payload.session;
    },
    setLanguagePreferences(state, action: PayloadAction<{ languages: string[] }>) {
      const user = state.users[state.currentUserId];
      if (!user) return;
      user.settings.languages = action.payload.languages;
    },
  },
});

export const { selectUser, setMode, attempt, nextCard, addSession, addUser, setLanguagePreferences } = gameSlice.actions;
export default gameSlice.reducer;
