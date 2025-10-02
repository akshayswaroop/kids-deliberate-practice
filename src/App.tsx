import { useState, useEffect } from 'react';
import useAppDispatch, { useAppSelector } from './infrastructure/hooks/reduxHooks';
import { ThemeProvider } from './app/ui/ThemeContext';
import { PracticeServiceProvider } from './app/providers/PracticeServiceProvider';
// Removed attempt import - now handled by domain actions
import { handleNextPressed, ensureActiveSession, markCurrentWordCorrect, markCurrentWordWrong } from './infrastructure/state/gameActions';
import { revealAnswer } from './infrastructure/state/gameSlice';
import HomePage from './app/ui/HomePage';
import Onboarding from './app/ui/Onboarding';
import { buildPracticeAppViewModel } from './app/presenters/practicePresenter';
import type { RootState as GameState } from './infrastructure/state/gameState';

// Single, clean App implementation
function App() {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(state => state.game as GameState);
  const [mode, setMode] = useState<string>('english');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const currentUserId = gameState.currentUserId;
    if (currentUserId) {
      const user = gameState.users[currentUserId];
      const defaultMode = user?.settings?.languages?.[0];
      if (defaultMode && mode !== defaultMode) {
        setMode(defaultMode);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentUserId]);

  const handleCreateUser = (userId: string, displayName?: string) => {
    dispatch({ type: 'game/addUser', payload: { userId, displayName } });
  };
  const handleSwitchUser = (userId: string) => {
    dispatch({ type: 'game/selectUser', payload: { userId } });
  };
  const handleSetMode = (newMode: string) => setMode(newMode);

  const viewModel = buildPracticeAppViewModel({ state: gameState, mode, windowWidth });
  const homeVM = viewModel.home;

  // ensure there's an active session for the current mode when the app mounts or mode changes
  useEffect(() => {
    const currentUserId = gameState.currentUserId;
    if (!currentUserId) return;
    dispatch(ensureActiveSession({ mode } as any) as any);
  }, [gameState.currentUserId, mode]);

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

  const onRevealAnswer = (revealed: boolean) => {
    const sessionId = homeVM?.practice.sessionId;
    const wordId = homeVM?.practice.currentWordId;
    if (sessionId && wordId) {
      dispatch(revealAnswer({ sessionId, wordId, revealed }));
    }
  };

  if (viewModel.showOnboarding) {
    return (
      <ThemeProvider>
        <PracticeServiceProvider>
          <Onboarding onCreate={(userId, displayName) => { handleCreateUser(userId, displayName); handleSwitchUser(userId); }} />
        </PracticeServiceProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <PracticeServiceProvider>
        {homeVM && (
          <HomePage
            ui={homeVM}
            onCreateUser={handleCreateUser}
            onSwitchUser={handleSwitchUser}
            onSetMode={handleSetMode}
            onCorrect={onCorrect}
            onWrong={onWrong}
            onNext={onNext}
            onRevealAnswer={onRevealAnswer}
          />
        )}
      </PracticeServiceProvider>
    </ThemeProvider>
  );
}

export default App;
