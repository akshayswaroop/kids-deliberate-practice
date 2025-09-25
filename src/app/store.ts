import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '../features/game/slice';
import type { RootState } from '../features/game/state';

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type { RootState };

// Usage:
// import { Provider } from 'react-redux';
// <Provider store={store}> ... </Provider>
