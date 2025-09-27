import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useAppDispatch from './app/hooks';
// Removed attempt import - now handled by domain actions
import { handleNextPressed, ensureActiveSession, markCurrentWordCorrect, markCurrentWordWrong } from './features/game/actions';
import HomePage from './app/ui/HomePage';
import Onboarding from './app/ui/Onboarding';
import {
  selectShouldShowOnboarding,
  selectCurrentPracticeData,
  selectResponsiveColumns,
} from './features/game/selectors';

// Single, clean App implementation
function App() {
  const dispatch = useAppDispatch();
  const rootState = useSelector((state: { game: any }) => state.game);
  const users = rootState.users || {};
  const currentUserId = rootState.currentUserId as string | null;
  const userState = currentUserId && users[currentUserId]
    ? users[currentUserId]
    : { words: {}, sessions: {}, settings: { languages: ['english'], sessionSizes: { english: 6, kannada: 6, mixed: 6 }, complexityLevels: { english: 1, kannada: 1, hindi: 1 } } };
  const [mode, setMode] = useState(userState.settings.languages[0] || 'english');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreateUser = (username: string, displayName?: string) => {
    dispatch({ type: 'game/addUser', payload: { userId: username, displayName } });
  };
  const handleSwitchUser = (userId: string) => {
    dispatch({ type: 'game/selectUser', payload: { userId } });
  };
  const handleSetMode = (newMode: string) => setMode(newMode);

  const shouldShowOnboarding = selectShouldShowOnboarding(rootState as any);
  const practiceData = selectCurrentPracticeData(rootState as any, mode);
  const columns = selectResponsiveColumns(windowWidth);

  // ensure there's an active session for the current mode when the app mounts or mode changes
  useEffect(() => {
    if (!currentUserId) return;
    dispatch(ensureActiveSession({ mode } as any) as any);
  }, [currentUserId, mode]);

  // Clean UI actions - no session knowledge required
  const onCorrect = () => {
    dispatch(markCurrentWordCorrect({ mode } as any) as any);
  };

  const onWrong = () => {
    dispatch(markCurrentWordWrong({ mode } as any) as any);
  };

  const onNext = () => {
    dispatch(handleNextPressed({ mode } as any) as any);
  };

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
