import { useState, useEffect } from 'react';
import useAppDispatch, { useAppSelector } from './infrastructure/hooks/reduxHooks';
import { ThemeProvider } from './app/ui/ThemeContext';
import { PracticeServiceProvider } from './app/providers/PracticeServiceProvider';
// Removed attempt import - now handled by domain actions
import { handleNextPressed, ensureActiveSession, markCurrentWordCorrect, markCurrentWordWrong } from './infrastructure/state/gameActions';
import { revealAnswer, setMode as setModeAction, markIntroSeen, markCoachmarkSeen, markParentGuideSeen, markWhyRepeatSeen } from './infrastructure/state/gameSlice';
import HomePage from './app/ui/HomePage';
import Onboarding from './app/ui/Onboarding';
import { buildPracticeAppViewModel } from './app/presenters/practicePresenter';
import type { RootState as GameState } from './infrastructure/state/gameState';
import TraceDiagnosticsApp from './app/diagnostics/TraceDiagnosticsApp';
import { SUBJECT_CONFIGS } from './infrastructure/repositories/subjectLoader';

// Single, clean App implementation
function App() {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/diagnostics')) {
    return (
      <ThemeProvider>
        <TraceDiagnosticsApp />
      </ThemeProvider>
    );
  }

  const dispatch = useAppDispatch();
  const gameState = useAppSelector(state => state.game as GameState);
  const currentUserId = gameState.currentUserId;
  const currentUser = currentUserId ? gameState.users[currentUserId] : undefined;
  const [modeOverride, setModeOverride] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem('kdp:lastMode');
    }
    return null;
  });
  const fallbackMode = SUBJECT_CONFIGS[0]?.name ?? 'english';
  const derivedMode =
    modeOverride ??
    currentUser?.currentMode ??
    currentUser?.settings?.languages?.[0] ??
    fallbackMode;
  const mode = derivedMode;
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !modeOverride) {
      window.sessionStorage.setItem('kdp:lastMode', derivedMode);
    }
  }, [modeOverride, derivedMode]);

  useEffect(() => {
    if (!modeOverride) return;
    if (currentUser?.currentMode === modeOverride) {
      setModeOverride(null);
    }
  }, [modeOverride, currentUser?.currentMode]);

  const handleCreateUser = (userId: string, displayName?: string) => {
    dispatch({ type: 'game/addUser', payload: { userId, displayName } });
  };
  const handleSwitchUser = (userId: string) => {
    dispatch({ type: 'game/selectUser', payload: { userId } });
    setModeOverride(null);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('kdp:lastMode');
    }
  };
  const handleSetMode = (newMode: string) => {
    setModeOverride(newMode);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('kdp:lastMode', newMode);
    }
    const existingSessionId = currentUser?.activeSessions?.[newMode];
    if (existingSessionId) {
      dispatch(setModeAction({ mode: newMode, sessionId: existingSessionId }));
    }
  };

  const isDiagnostics = typeof window !== 'undefined' && window.location.pathname.startsWith('/diagnostics');

  const viewModel = buildPracticeAppViewModel({ state: gameState, mode, windowWidth });
  const homeVM = viewModel.home;

  // ensure there's an active session for the current mode when the app mounts or mode changes
  useEffect(() => {
    if (isDiagnostics) return;
    if (!currentUserId) return;
    dispatch(ensureActiveSession({ mode } as any) as any);
  }, [currentUserId, mode, dispatch, isDiagnostics]);

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

  const dismissIntro = () => {
    dispatch(markIntroSeen());
  };

  const handleCoachmarkSeen = (coachmark: 'streak' | 'profiles') => {
    dispatch(markCoachmarkSeen({ coachmark }));
  };

  const acknowledgeParentGuide = () => {
    dispatch(markParentGuideSeen());
  };

  const acknowledgeWhyRepeat = () => {
    dispatch(markWhyRepeatSeen());
  };

  if (isDiagnostics) {
    return (
      <ThemeProvider>
        <TraceDiagnosticsApp />
      </ThemeProvider>
    );
  }

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
            onDismissIntro={dismissIntro}
            onCoachmarkSeen={handleCoachmarkSeen}
            onParentGuideAcknowledged={acknowledgeParentGuide}
            onWhyRepeatAcknowledged={acknowledgeWhyRepeat}
          />
        )}
      </PracticeServiceProvider>
    </ThemeProvider>
  );
}

export default App;
