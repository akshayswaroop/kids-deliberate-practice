import { decrementCooldowns, addSession, setMode, nextCard, attempt, progressComplexityLevel } from './gameSlice';
import {
  selectIsSessionFullyMastered,
  selectWordsByComplexityLevel,
  selectSessionSizeForMode,
  selectShouldProgressLevel,
} from './gameSelectors';
import { SessionGenerationService } from '../../domain/services/SessionGenerationService';
import type { Session, Word } from './gameState';
import { MasteryConfiguration } from '../../domain/value-objects/MasteryConfiguration';
import { SUBJECT_CONFIGS } from '../repositories/subjectLoader';

const countGraphemes = (value: string | undefined | null): number => {
  if (!value) return 0;
  const text = value.trim();
  if (!text) return 0;
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
      const segmenter = new Intl.Segmenter('kn', { granularity: 'grapheme' });
      let count = 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const _ of segmenter.segment(text)) {
        count += 1;
      }
      return count;
    }
  } catch {
    // Fallback to naive grapheme counting
  }
  return Array.from(text).length;
};

/**
 * Pure function: Select next practice index from unmastered words
 * Randomness injected as parameter for testability
 * 
 * Architecture principle: "Keep randomness/time at the edge, inject as inputs"
 */
const selectNextPracticeIndex = (
  session: Session | undefined, 
  words: Record<string, Word>,
  _randomValue: number = Math.random()
): number | null => {
  if (!session || !Array.isArray(session.wordIds) || session.wordIds.length === 0) {
    return null;
  }

  const currentIndex = Number.isInteger(session.currentIndex) ? session.currentIndex : 0;
  const unmasteredIndices: number[] = [];

  for (let i = 0; i < session.wordIds.length; i++) {
    const wordId = session.wordIds[i];
    const word = words[wordId];
    if (word && !MasteryConfiguration.isMastered(word)) {
      unmasteredIndices.push(i);
    }
  }

  if (unmasteredIndices.length === 0) {
    return null;
  }

  if (unmasteredIndices.length === 1) {
    return unmasteredIndices[0];
  }

  const nextHigher = unmasteredIndices.find(index => index > currentIndex);
  if (typeof nextHigher === 'number') {
    return nextHigher;
  }

  const fallback = unmasteredIndices.find(index => index !== currentIndex);
  if (typeof fallback === 'number') {
    return fallback;
  }

  return unmasteredIndices[0];
};

/**
 * Generate session ID with timestamp
 * Time injected as parameter for testability
 * 
 * Architecture principle: "Pure Core - inject time at the edge"
 */
const generateSessionId = (timestamp: number = Date.now()): string => {
  return 'session_' + timestamp;
};

// Thunk to handle UI 'Next' press orchestration. Keeps domain logic out of UI components.
export const handleNextPressed = (payload: { mode: string }) => (dispatch: any, getState: any) => {
  const root = getState();
  const state = root.game;
  const uid = state.currentUserId;
  if (!uid) {
    return;
  }
  const user = state.users[uid];
  if (!user) {
    return;
  }

  const activeSessionId = user.activeSessions && user.activeSessions[payload.mode];
  if (!activeSessionId) {
    return;
  }

  const currentSession = user.sessions && user.sessions[activeSessionId];
  if (!currentSession) {
    return;
  }

  const allWordsMastered = selectIsSessionFullyMastered(state as any, activeSessionId);

  if (allWordsMastered) {
    // Decrement cooldowns for mastery words
    dispatch(decrementCooldowns({ wordIds: currentSession.wordIds }));

    // Check if user should progress to next complexity level
    const shouldProgress = selectShouldProgressLevel(state as any, payload.mode);
    if (shouldProgress) {
      dispatch(progressComplexityLevel({ language: payload.mode }));
    }

    // Get fresh state after potential level progression
    const freshState = getState().game;
    const modeLanguages = [payload.mode];
    const availableWords = selectWordsByComplexityLevel(freshState as any, modeLanguages as any);
    const allWordsArr = Object.values(availableWords || {});
    
    if (allWordsArr.length > 0) {
      const sessionSize = selectSessionSizeForMode(freshState as any, payload.mode);
      const modeConfig = SUBJECT_CONFIGS.find(config => config.name === payload.mode || config.language === payload.mode);
      const minGraphemes = modeConfig?.minGraphemes ?? 1;
      const practiceCandidates = allWordsArr.filter(word => {
        const surface = (word.wordKannada || word.text || '').trim();
        if (!surface) return false;
        return countGraphemes(surface) >= minGraphemes;
      });
      const sessionWordPool = practiceCandidates.length > 0 ? practiceCandidates : allWordsArr;
      
      // Use domain service for session word selection
      const ids = SessionGenerationService.selectSessionWords(sessionWordPool as Word[], sessionSize);

      const newSessionId = generateSessionId(); // Use helper with injected time
      const now = Date.now(); // Get time once at the edge
      const freshUser = freshState.users[uid!];
      const session = {
        wordIds: ids,
        currentIndex: 0,
        revealed: false,
        mode: 'practice',
        createdAt: now,
        settings: freshUser.settings,
      } as any;

      dispatch(addSession({ sessionId: newSessionId, session } as any));
      dispatch(setMode({ mode: payload.mode, sessionId: newSessionId } as any));
    }
  } else {
    const nextIndex = selectNextPracticeIndex(currentSession, user.words); // Uses default Math.random at edge
    if (nextIndex !== null) {
      dispatch(nextCard({ sessionId: activeSessionId, nextIndex } as any));
    } else {
      dispatch(nextCard({ sessionId: activeSessionId, nextIndex: currentSession.currentIndex, needsNewSession: true } as any));
    }
  }
};

// Thunk to ensure there's an active session for the given mode. If none exists, create one.
// Clean domain action: Mark current word as correct (UI doesn't need to know about sessions)
export const markCurrentWordCorrect = (payload: { mode: string }) => (dispatch: any, getState: any) => {
  const root = getState();
  const state = root.game;
  const uid = state.currentUserId;
  if (!uid) return;
  const user = state.users[uid];
  if (!user) return;

  const activeSessionId = user.activeSessions && user.activeSessions[payload.mode];
  if (!activeSessionId) {
    return;
  }
  
  const session = user.sessions[activeSessionId];
  if (!session) {
    return;
  }
  
  const wordId = session.wordIds[session.currentIndex];
  const now = Date.now();
  dispatch(attempt({ sessionId: activeSessionId, wordId, result: 'correct', now } as any));
};

export const completeConstructionWord = (payload: { mode: string }) => (dispatch: any, getState: any) => {
  dispatch(markCurrentWordCorrect(payload) as any);

  const state = getState();
  const game = state.game;
  const uid = game.currentUserId;
  if (!uid) return;
  const user = game.users[uid];
  if (!user) return;
  const activeSessionId = user.activeSessions?.[payload.mode];
  if (!activeSessionId) return;
  const session = user.sessions[activeSessionId];
  if (!session) return;

  // Auto-progress for construction mode sessions so the next word appears without manual input
  if (Array.isArray(session.wordIds) && session.wordIds.length > 0) {
    dispatch(handleNextPressed(payload) as any);
  }
};

// Clean domain action: Mark current word as wrong (UI doesn't need to know about sessions)
export const markCurrentWordWrong = (payload: { mode: string }) => (dispatch: any, getState: any) => {
  const root = getState();
  const state = root.game;
  const uid = state.currentUserId;
  if (!uid) return;
  const user = state.users[uid];
  if (!user) return;

  const activeSessionId = user.activeSessions && user.activeSessions[payload.mode];
  if (!activeSessionId) {
    return;
  }
  
  const session = user.sessions[activeSessionId];
  if (!session) {
    return;
  }
  
  const wordId = session.wordIds[session.currentIndex];
  const now = Date.now();
  dispatch(attempt({ sessionId: activeSessionId, wordId, result: 'wrong', now } as any));
};

export const ensureActiveSession = (payload: { mode: string }) => (dispatch: any, getState: any) => {
  const root = getState();
  const state = root.game;
  const uid = state.currentUserId;
  if (!uid) return;
  const user = state.users[uid];
  if (!user) return;

  const activeSessionId = user.activeSessions && user.activeSessions[payload.mode];
  if (activeSessionId) return; // already have a session

  // Check if user should progress to next complexity level before creating session
  const shouldProgress = selectShouldProgressLevel(state as any, payload.mode);
  if (shouldProgress) {
    dispatch(progressComplexityLevel({ language: payload.mode }));
  }

  const modeLanguages = [payload.mode];
  const availableWords = selectWordsByComplexityLevel(state as any, modeLanguages as any);
  const allWordsArr = Object.values(availableWords || {});
  if (allWordsArr.length === 0) return;

  const modeConfig = SUBJECT_CONFIGS.find(config => config.name === payload.mode || config.language === payload.mode);
  const minGraphemes = modeConfig?.minGraphemes ?? 1;
  const practiceCandidates = allWordsArr.filter(word => {
    const surface = (word.wordKannada || word.text || '').trim();
    if (!surface) return false;
    return countGraphemes(surface) >= minGraphemes;
  });
  const sessionWordPool = practiceCandidates.length > 0 ? practiceCandidates : allWordsArr;

  // Use domain service for session word selection
  const ids = SessionGenerationService.selectSessionWords(
    sessionWordPool as Word[],
    selectSessionSizeForMode(state as any, payload.mode)
  );

  // Track which words are already mastered at session start
  const initialMasteredWords = ids.filter(wordId => {
    const word = user.words[wordId];
    return word && MasteryConfiguration.isMastered(word);
  });

  const newSessionId = generateSessionId(); // Use helper with injected time
  const now = Date.now(); // Get time once at the edge
  const session = {
    wordIds: ids,
    currentIndex: 0,
    revealed: false,
    mode: 'practice',
    createdAt: now,
    settings: user.settings,
    initialMasteredWords,
  } as any;

  dispatch(addSession({ sessionId: newSessionId, session } as any));
  dispatch(setMode({ mode: payload.mode, sessionId: newSessionId } as any));
};

export default {};
