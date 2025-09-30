import { decrementCooldowns, addSession, setMode, nextCard, attempt, progressComplexityLevel } from './gameSlice';
import { selectIsSessionFullyMastered, selectWordsByComplexityLevel, selectSessionSizeForMode, selectShouldProgressLevel } from './gameSelectors';
import { SessionGenerationService } from '../../domain/services/SessionGenerationService';
import type { Word } from './gameState';

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

      const newSessionId = 'session_' + Date.now();
      const freshUser = freshState.users[uid!];
      const session = {
        wordIds: ids,
        currentIndex: 0,
        revealed: false,
        mode: 'practice',
        createdAt: Date.now(),
        settings: freshUser.settings,
      } as any;

      dispatch(addSession({ sessionId: newSessionId, session } as any));
      dispatch(setMode({ mode: payload.mode, sessionId: newSessionId } as any));
    }
  } else {
    dispatch(nextCard({ sessionId: activeSessionId } as any));
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
  dispatch(attempt({ sessionId: activeSessionId, wordId, result: 'correct' } as any));
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
  dispatch(attempt({ sessionId: activeSessionId, wordId, result: 'wrong' } as any));
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

  const newSessionId = 'session_' + Date.now();
  const session = {
    wordIds: ids,
    currentIndex: 0,
    revealed: false,
    mode: 'practice',
    createdAt: Date.now(),
    settings: user.settings,
  } as any;

  dispatch(addSession({ sessionId: newSessionId, session } as any));
  dispatch(setMode({ mode: payload.mode, sessionId: newSessionId } as any));
};

export default {};