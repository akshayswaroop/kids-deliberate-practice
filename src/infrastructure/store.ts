import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './state/gameSlice';
import type { RootState as GameState } from './state/gameState';
import { traceMiddleware } from '../app/tracing/traceMiddleware';
import { loadAllWords, SUBJECT_CONFIGS } from './repositories/subjectLoader';

const DEFAULT_LANGUAGE = SUBJECT_CONFIGS[0]?.name ?? 'kannada';

const ensureArray = <T>(value: T[] | undefined | null): T[] => {
  return Array.isArray(value) ? value : [];
};

const ensureRecord = <T>(value: Record<string, T> | undefined | null): Record<string, T> => {
  return value && typeof value === 'object' ? value : {};
};

const ensureExperience = (experience: any) => {
  if (experience && typeof experience === 'object') {
    const coachmarks = ensureRecord<boolean>(experience.coachmarks);
    return {
      hasSeenIntro: !!experience.hasSeenIntro,
      coachmarks: {
        streak: !!coachmarks.streak,
        profiles: !!coachmarks.profiles,
      },
      hasSeenParentGuide: !!experience.hasSeenParentGuide,
      hasSeenWhyRepeat: !!experience.hasSeenWhyRepeat,
      seenIntroVersion: experience.seenIntroVersion,
    };
  }

  return {
    hasSeenIntro: false,
    coachmarks: {
      streak: false,
      profiles: false,
    },
    hasSeenParentGuide: false,
    hasSeenWhyRepeat: false,
    seenIntroVersion: undefined,
  };
};

function normalizeUser(user: any) {
  if (!user || typeof user !== 'object') return;

  user.words = ensureRecord(user.words);
  user.sessions = ensureRecord(user.sessions);
  user.activeSessions = ensureRecord(user.activeSessions);

  const settings = ensureRecord<any>(user.settings);
  settings.sessionSizes = ensureRecord<number>(settings.sessionSizes);
  settings.complexityLevels = ensureRecord<number>(settings.complexityLevels);

  const existingLanguages = ensureArray<string>(settings.languages);
  const languageSet = new Set(existingLanguages.filter(Boolean));

  if (languageSet.size === 0 && DEFAULT_LANGUAGE) {
    languageSet.add(DEFAULT_LANGUAGE);
  }

  for (const config of SUBJECT_CONFIGS) {
    if (config.language && settings.complexityLevels[config.language] == null) {
      settings.complexityLevels[config.language] = config.defaultComplexityLevel ?? 1;
    }
    if (config.name && !languageSet.has(config.name) && !languageSet.has(config.language)) {
      languageSet.add(config.name);
    }
  }

  settings.languages = Array.from(languageSet);
  user.settings = settings;
  user.experience = ensureExperience(user.experience);
}

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
        user.words = ensureRecord(user.words);
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
        normalizeUser(user);
      });
      if (preloadedState.game && preloadedState.game.currentUserId && !preloadedState.game.users[preloadedState.game.currentUserId]) {
        preloadedState.game.currentUserId = null;
      }
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
