import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '../features/game/slice';
// import type { RootState } from '../features/game/state';

function loadGameState(): RootState | undefined {
  try {
    const raw = localStorage.getItem('gameState');
    if (raw) return JSON.parse(raw);
  } catch {}
  return undefined;
}
import type { RootState } from '../features/game/state';


// Middleware to persist state on any game action
const persistMiddleware = (storeAPI: any) => (next: any) => (action: any) => {
  const result = next(action);
  if (action.type.startsWith('game/')) {
    const state = storeAPI.getState();
    try {
      localStorage.setItem('gameState', JSON.stringify(state.game));
    } catch (e) {
      // Ignore storage errors
    }
  }
  return result;
};



const loaded = loadGameState();
const preloadedState = loaded ? { game: loaded as RootState } : undefined;

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(persistMiddleware),
  preloadedState,
});

export type AppDispatch = typeof store.dispatch;
export type { RootState };

// Usage:
// import { Provider } from 'react-redux';
// <Provider store={store}> ... </Provider>
