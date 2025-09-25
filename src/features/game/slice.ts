import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './state';
import { getInitialWords } from '../../app/bootstrapState';

const initialState: RootState = {
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
  },
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<{ mode: string; sessionId: string }>) {
      state.activeSessions[action.payload.mode] = action.payload.sessionId;
    },
    attempt(state, action: PayloadAction<{ sessionId: string; wordId: string; result: 'correct' | 'wrong' }>) {
      const { sessionId, wordId, result } = action.payload;
      const word = state.words[wordId];
      if (word) {
        word.attempts.push({ timestamp: Date.now(), result });
      }
      const session = state.sessions[sessionId];
      if (session) {
        session.revealed = true;
        session.lastAttempt = result;
      }
    },
    nextCard(state, action: PayloadAction<{ sessionId: string }>) {
      const { sessionId } = action.payload;
      const session = state.sessions[sessionId];
      if (session) {
        if (session.currentIndex < session.wordIds.length - 1) {
          session.currentIndex += 1;
        }
        session.revealed = false;
        session.lastAttempt = undefined;
      }
    },

    addSession(state, action: PayloadAction<{ sessionId: string; session: import('./state').Session }>) {
      state.sessions[action.payload.sessionId] = action.payload.session;
    },
  },
});

export const { setMode, attempt, nextCard, addSession } = gameSlice.actions;
export default gameSlice.reducer;
