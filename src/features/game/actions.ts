import { decrementCooldowns, addSession, setMode, nextCard, attempt, progressComplexityLevel } from './slice';
import { selectAreAllSessionWordsMastered, selectWordsByComplexityLevel, selectSessionSizeForMode, selectShouldProgressLevel } from './selectors';
import { selectSessionWords } from './sessionGen';

// Thunk to handle UI 'Next' press orchestration. Keeps domain logic out of UI components.
export const handleNextPressed = (payload: { mode: string }) => (dispatch: any, getState: any) => {
  console.log(`🚀 [ACTION] handleNextPressed called with mode: ${payload.mode}`);
  
  const root = getState();
  const state = root.game;
  const uid = state.currentUserId;
  if (!uid) {
    console.log(`❌ [ACTION] No currentUserId`);
    return;
  }
  const user = state.users[uid];
  if (!user) {
    console.log(`❌ [ACTION] No user found for: ${uid}`);
    return;
  }

  const activeSessionId = user.activeSessions && user.activeSessions[payload.mode];
  if (!activeSessionId) {
    console.log(`❌ [ACTION] No activeSessionId for mode: ${payload.mode}`);
    return;
  }
  console.log(`📝 [ACTION] Active session: ${activeSessionId}`);

  const currentSession = user.sessions && user.sessions[activeSessionId];
  if (!currentSession) {
    console.log(`❌ [ACTION] No currentSession found for: ${activeSessionId}`);
    return;
  }
  console.log(`📝 [ACTION] Current session has ${currentSession.wordIds.length} words`);

  console.log(`🔍 [ACTION] Calling selectAreAllSessionWordsMastered...`);
  const allWordsMastered = selectAreAllSessionWordsMastered(state as any, activeSessionId);
  console.log(`📊 [ACTION] Selector returned: ${allWordsMastered}`);

  if (allWordsMastered) {
    console.log(`✅ [ACTION] 80% threshold met - CREATING NEW SESSION`);
    
    // Decrement cooldowns for mastery words
    dispatch(decrementCooldowns({ wordIds: currentSession.wordIds }));

    // Check if user should progress to next complexity level
    const shouldProgress = selectShouldProgressLevel(state as any, payload.mode);
    if (shouldProgress) {
      console.log(`📈 [ACTION] Auto-progressing complexity level for ${payload.mode}`);
      dispatch(progressComplexityLevel({ language: payload.mode }));
    }

    const modeLanguages = [payload.mode];
    const availableWords = selectWordsByComplexityLevel(state as any, modeLanguages as any);
    const allWordsArr = Object.values(availableWords || {});
    console.log(`📝 [ACTION] Available words for new session: ${allWordsArr.length}`);
    
    if (allWordsArr.length > 0) {
      const sessionSize = selectSessionSizeForMode(state as any, payload.mode);
      console.log(`📝 [ACTION] New session size: ${sessionSize}`);
      
      const ids = selectSessionWords(
        allWordsArr,
        user.settings.selectionWeights || { struggle: 0.2, new: 0.7, mastered: 0.1 },
        sessionSize,
        Math.random as any
      );
      console.log(`📝 [ACTION] Selected word IDs for new session: [${ids.join(', ')}]`);

      const newSessionId = 'session_' + Date.now();
      const session = {
        wordIds: ids,
        currentIndex: 0,
        revealed: false,
        mode: 'practice',
        createdAt: Date.now(),
        settings: user.settings,
      } as any;

      console.log(`🎯 [ACTION] Creating new session: ${newSessionId}`);
      dispatch(addSession({ sessionId: newSessionId, session } as any));
      dispatch(setMode({ mode: payload.mode, sessionId: newSessionId } as any));
      console.log(`✅ [ACTION] New session created and activated: ${newSessionId}`);
    } else {
      console.log(`❌ [ACTION] No available words for new session`);
    }
  } else {
    console.log(`🔄 [ACTION] 80% threshold NOT met - CONTINUING CURRENT SESSION`);
    dispatch(nextCard({ sessionId: activeSessionId } as any));
  }
};

// Thunk to ensure there's an active session for the given mode. If none exists, create one.
// Clean domain action: Mark current word as correct (UI doesn't need to know about sessions)
export const markCurrentWordCorrect = (payload: { mode: string }) => (dispatch: any, getState: any) => {
  console.log(`✅ [DOMAIN] markCurrentWordCorrect for mode: ${payload.mode}`);
  const root = getState();
  const state = root.game;
  const uid = state.currentUserId;
  if (!uid) return;
  const user = state.users[uid];
  if (!user) return;

  const activeSessionId = user.activeSessions && user.activeSessions[payload.mode];
  if (!activeSessionId) {
    console.log(`❌ [DOMAIN] No active session for mode: ${payload.mode}`);
    return;
  }
  
  const session = user.sessions[activeSessionId];
  if (!session) {
    console.log(`❌ [DOMAIN] Session not found: ${activeSessionId}`);
    return;
  }
  
  const wordId = session.wordIds[session.currentIndex];
  console.log(`📝 [DOMAIN] Marking word "${wordId}" as CORRECT`);
  dispatch(attempt({ sessionId: activeSessionId, wordId, result: 'correct' } as any));
};

// Clean domain action: Mark current word as wrong (UI doesn't need to know about sessions)
export const markCurrentWordWrong = (payload: { mode: string }) => (dispatch: any, getState: any) => {
  console.log(`❌ [DOMAIN] markCurrentWordWrong for mode: ${payload.mode}`);
  const root = getState();
  const state = root.game;
  const uid = state.currentUserId;
  if (!uid) return;
  const user = state.users[uid];
  if (!user) return;

  const activeSessionId = user.activeSessions && user.activeSessions[payload.mode];
  if (!activeSessionId) {
    console.log(`❌ [DOMAIN] No active session for mode: ${payload.mode}`);
    return;
  }
  
  const session = user.sessions[activeSessionId];
  if (!session) {
    console.log(`❌ [DOMAIN] Session not found: ${activeSessionId}`);
    return;
  }
  
  const wordId = session.wordIds[session.currentIndex];
  console.log(`📝 [DOMAIN] Marking word "${wordId}" as WRONG`);
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
    console.log(`📈 [ACTION] Auto-progressing complexity level for ${payload.mode} during ensureActiveSession`);
    dispatch(progressComplexityLevel({ language: payload.mode }));
  }

  const modeLanguages = [payload.mode];
  const availableWords = selectWordsByComplexityLevel(state as any, modeLanguages as any);
  const allWordsArr = Object.values(availableWords || {});
  if (allWordsArr.length === 0) return;

  const ids = selectSessionWords(
    allWordsArr,
    user.settings.selectionWeights || { struggle: 0.2, new: 0.7, mastered: 0.1 },
    selectSessionSizeForMode(state as any, payload.mode),
    Math.random as any
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
