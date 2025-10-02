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
const makePersistMiddleware = () => (storeAPI: any) => (next: any) => (action: any) => {
  const result = next(action);
  if (action.type.startsWith('game/')) {
    const state = storeAPI.getState();
    try {
      localStorage.setItem('gameState', JSON.stringify(state.game));
    } catch {
      // Persistence is best-effort; ignore storage failures
    }
  }
  return result;
};



// Factory to create app store with optional persistence and preloaded state
export function createAppStore(opts?: { persist?: boolean; preloadedState?: { game: GameState } | undefined }) {
  const { persist = true } = opts ?? {};
  let preloadedState = opts?.preloadedState;

  if (persist && !preloadedState) {
    const loaded = loadGameState();
    preloadedState = loaded ? { game: loaded } : undefined;
  }

  // Merge new words into existing users when persistence is on and we have preloaded state
  if (preloadedState?.game) {
    try {
      const initialWords = loadAllWords();
      Object.values((preloadedState.game as any).users || {}).forEach((user: any) => {
        user.words = user.words || {};
        Object.entries(initialWords).forEach(([wordId, wordObj]) => {
          if (!user.words[wordId]) {
            user.words[wordId] = { ...wordObj };
          } else {
            const existingWord = user.words[wordId];
            const contentChanged = existingWord.answer !== wordObj.answer || existingWord.notes !== wordObj.notes;
            if (contentChanged) {
              user.words[wordId] = { ...existingWord, answer: wordObj.answer, notes: wordObj.notes };
            }
          }
        });
      });
    } catch {
      // Ignore merge failures to avoid breaking app startup
    }
  }

  const middlewareBuilder = (getDefaultMiddleware: any) => {
    const base = getDefaultMiddleware().prepend(traceMiddleware.middleware);
    return persist ? base.concat(makePersistMiddleware()) : base;
  };

  const store = configureStore({
    reducer: { game: gameReducer },
    middleware: middlewareBuilder,
    preloadedState,
  });

  return store;
}

// Default app store (production/dev usage) keeps current behavior
export const store = createAppStore();

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

// Usage:
// import { Provider } from 'react-redux';
// <Provider store={store}> ... </Provider>
