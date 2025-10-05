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

/**
 * Pure function: Select next practice index from unmastered words
 * Randomness injected as parameter for testability
 * 
 * Architecture principle: "Keep randomness/time at the edge, inject as inputs"
 */
const selectNextPracticeIndex = (
  session: Session | undefined, 
  words: Record<string, Word>,
  randomValue: number = Math.random() // Default at edge, can be injected for tests
): number | null => {
  if (!session || !Array.isArray(session.wordIds)) return null;
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
  const randomIndex = Math.floor(randomValue * unmasteredIndices.length);
  return unmasteredIndices[randomIndex];
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
      
      // Use domain service for session word selection
      const ids = SessionGenerationService.selectSessionWords(allWordsArr as Word[], sessionSize);

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

  // Use domain service for session word selection
  const ids = SessionGenerationService.selectSessionWords(
    allWordsArr as Word[],
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
