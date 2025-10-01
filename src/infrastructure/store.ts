import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './state/gameSlice';
import type { RootState as GameState } from './state/gameState';
import { traceMiddleware } from '../app/tracing/traceMiddleware';
import { loadAllWords } from './repositories/subjectLoader';

function loadGameState(): GameState | undefined {
  try {
    const raw = localStorage.getItem('gameState');
    if (raw) return JSON.parse(raw);
  } catch {}
  return undefined;
}

// Middleware to persist state on any game action
const persistMiddleware = (storeAPI: any) => (next: any) => (action: any) => {
  const result = next(action);
  if (action.type.startsWith('game/')) {
    const state = storeAPI.getState();
    console.log(`💾 [PERSIST] Saving state after action: ${action.type}`);
    try {
      localStorage.setItem('gameState', JSON.stringify(state.game));
      console.log(`✅ [PERSIST] State saved successfully`);
    } catch (e) {
      console.error(`❌ [PERSIST] Failed to save state:`, e);
    }
  }
  return result;
};



const loaded = loadGameState();

// Merge new words/subjects into existing users so they automatically 
// pick up newly added content without losing their progress
let gameState = loaded;
if (loaded) {
  try {
    const initialWords = loadAllWords();
    Object.values(loaded.users || {}).forEach((user: any) => {
      user.words = user.words || {};
      // Add any missing words from initial set (new words/subjects)
      Object.entries(initialWords).forEach(([wordId, wordObj]) => {
        if (!user.words[wordId]) {
          user.words[wordId] = { ...wordObj };
        } else {
          // 🧠 Smart auto-refresh: Update content if it has changed
          const existingWord = user.words[wordId];
          const contentChanged = 
            existingWord.answer !== wordObj.answer || 
            existingWord.notes !== wordObj.notes;
          
          if (contentChanged) {
            // Preserve all progress data, only update content
            user.words[wordId] = {
              ...existingWord,
              answer: wordObj.answer,
              notes: wordObj.notes
            };
            console.log(`🔄 [AUTO-REFRESH] Updated content for word: ${wordId}`);
          }
        }
      });
    });
    console.log('🔄 [MERGE] Added new words/subjects and auto-refreshed content for existing users');
  } catch (e) {
    console.error('❌ [MERGE] Failed to merge new words:', e);
  }
}

const preloadedState = gameState ? { game: gameState } : undefined;

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware()
    .prepend(traceMiddleware.middleware)  // Add trace middleware first
    .concat(persistMiddleware),
  preloadedState,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

// Usage:
// import { Provider } from 'react-redux';
// <Provider store={store}> ... </Provider>