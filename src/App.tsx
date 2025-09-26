
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMode as setModeAction, addSession, attempt, nextCard } from './features/game/slice';
import HomePage from './app/ui/HomePage';
import Onboarding from './app/ui/Onboarding';
import { 
  selectWordsByComplexityLevel,
  selectCurrentLanguagePreferences,
  selectShouldShowOnboarding,
  selectActiveSessionForMode,
  selectCurrentPracticeData,
  selectResponsiveColumns,
  selectAreAllSessionWordsMastered,
  selectSessionSizeForMode
} from './features/game/selectors';
import { selectSessionWords } from './features/game/sessionGen';

// Diagnostics panel removed — app is structured to use selectors and pure components

function App() {
  const dispatch = useDispatch();
  const rootState = useSelector((state: { game: any }) => state.game);
  const users = rootState.users || {};
  const currentUserId = rootState.currentUserId as string | null;
  const userState = currentUserId && users[currentUserId]
    ? users[currentUserId]
    : { words: {}, sessions: {}, settings: { languages: ['english'], selectionWeights: { struggle: 0.5, new: 0.4, mastered: 0.1 }, sessionSizes: { english: 6, kannada: 6, mixed: 6 } } };
  const [mode, setMode] = useState(userState.settings.languages[0] || 'english');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Window resize effect for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleCreateUser = (username: string, displayName?: string) => {
    // Preserve optional displayName as-is. If undefined, we store no displayName so UI can fall back to id.
    dispatch({ type: 'game/addUser', payload: { userId: username, displayName } });
  };
  const handleSwitchUser = (userId: string) => {
    dispatch({ type: 'game/selectUser', payload: { userId } });
  };
  const handleSetMode = (newMode: string) => {
    dispatch({ type: 'game/setLanguagePreferences', payload: { languages: [newMode] } });
    setMode(newMode);
  };

  // Use selectors to get clean, derived data
  const shouldShowOnboarding = selectShouldShowOnboarding(rootState as any);
  const practiceData = selectCurrentPracticeData(rootState as any, mode);
  const columns = selectResponsiveColumns(windowWidth);
  
  // Handle session creation if needed (this should eventually move to a side effect)
  const sessionId = selectActiveSessionForMode(rootState as any, mode);
  if (!sessionId && currentUserId) {
    // Create a session using sessionGen (fallback simple pick if empty)
    const currentLanguages = selectCurrentLanguagePreferences(rootState as any);
    const availableWords = selectWordsByComplexityLevel(rootState as any, currentLanguages as any);
    const allWordsArr = Object.values(availableWords || {});
    if (allWordsArr.length > 0) {
      const ids = selectSessionWords(allWordsArr, userState.settings.selectionWeights || { struggle: 0.5, new: 0.4, mastered: 0.1 }, selectSessionSizeForMode(rootState as any, mode), Math.random as any);
      const newSessionId = 'session_' + Date.now();
      const session = {
        wordIds: ids,
        currentIndex: 0,
        revealed: false,
        mode: 'practice',
        createdAt: Date.now(),
        settings: userState.settings,
      };
      dispatch(addSession({ sessionId: newSessionId, session } as any));
      // Record this session as the active session for the current mode
      dispatch(setModeAction({ mode, sessionId: newSessionId } as any));
    }
  }

  const onCorrect = () => {
    const activeSessionId = practiceData.sessionId;
    if (!activeSessionId) return;
    // attempt on current word
    const session = userState.sessions[activeSessionId];
    if (!session) return;
    const wordId = session.wordIds[session.currentIndex];
    dispatch(attempt({ sessionId: activeSessionId, wordId, result: 'correct' } as any));
  };

  const onWrong = () => {
    const activeSessionId = practiceData.sessionId;
    if (!activeSessionId) return;
    const session = userState.sessions[activeSessionId];
    if (!session) return;
    const wordId = session.wordIds[session.currentIndex];
    dispatch(attempt({ sessionId: activeSessionId, wordId, result: 'wrong' } as any));
  };

  const onNext = () => {
    const activeSessionId = practiceData.sessionId;
    if (!activeSessionId) return;
    
    // Check if all words in current session are mastered before dispatching nextCard
    const currentSession = userState.sessions[activeSessionId];
    if (!currentSession) return;
    
    // Use selector to check if all words are mastered (pure calculation)
    const allWordsMastered = selectAreAllSessionWordsMastered(rootState as any, activeSessionId);
    
    if (allWordsMastered) {
      // Generate a new session using the existing session generation logic
      const currentLanguages = selectCurrentLanguagePreferences(rootState as any);
      const availableWords = selectWordsByComplexityLevel(rootState as any, currentLanguages as any);
      const allWordsArr = Object.values(availableWords || {});
      if (allWordsArr.length > 0) {
        const ids = selectSessionWords(allWordsArr, userState.settings.selectionWeights || { struggle: 0.5, new: 0.4, mastered: 0.1 }, selectSessionSizeForMode(rootState as any, mode), Math.random as any);
        const newSessionId = 'session_' + Date.now();
        const session = {
          wordIds: ids,
          currentIndex: 0,
          revealed: false,
          mode: 'practice',
          createdAt: Date.now(),
          settings: userState.settings,
        };
        dispatch(addSession({ sessionId: newSessionId, session } as any));
        // Record this session as the active session for the current mode
        dispatch(setModeAction({ mode, sessionId: newSessionId } as any));
      }
    } else {
      // Normal nextCard behavior for sessions with unmastered words
      dispatch(nextCard({ sessionId: activeSessionId } as any));
    }
  };

  // Navigation: location.hash handling removed along with Diagnostics panel
  if (shouldShowOnboarding) {
    return <Onboarding onCreate={(userId, displayName) => { handleCreateUser(userId, displayName); handleSwitchUser(userId); }} />;
  }

  return (
    <HomePage
      users={users}
      currentUserId={currentUserId}
      onCreateUser={handleCreateUser}
      onSwitchUser={handleSwitchUser}
      onSetMode={handleSetMode}
      mode={mode}
      mainWord={practiceData.mainWord}
      transliteration={practiceData.transliteration}
      transliterationHi={practiceData.transliterationHi}
      answer={practiceData.answer}
      notes={practiceData.notes}
      choices={practiceData.choices}
      onCorrect={onCorrect}
      onWrong={onWrong}
      onNext={onNext}
      columns={columns}
      layout="topbar"
    />
  );
}

export default App;
