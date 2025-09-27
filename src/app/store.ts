import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '../features/game/slice';
import type { RootState as GameState } from '../features/game/state';
import { traceMiddleware } from './tracing/traceMiddleware';

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
const preloadedState = loaded ? { game: loaded } : undefined;

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
