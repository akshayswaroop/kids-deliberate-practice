import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './state';

const initialState: RootState = {
  words: {},
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
  },
});

export const { setMode, attempt, nextCard } = gameSlice.actions;
export default gameSlice.reducer;
