import { SUBJECT_CONFIGS, getSubjectSupportsRevision } from '../../infrastructure/repositories/subjectLoader';
import {
  selectActiveSessionForMode,
  selectCurrentPracticeData,
  selectCurrentWord,
  selectResponsiveColumns,
  selectShouldShowOnboarding,
  selectGuidanceExperience,
  selectSessionProgress,
  selectSessionStats,
} from '../../infrastructure/state/gameSelectors';
import type { RootState as GameState, UserState, SessionStats } from '../../infrastructure/state/gameState';
import { INTRO_TOUR_VERSION } from '../../infrastructure/config/guidance';

export interface SessionFramingViewModel {
  showReadyToPractice: boolean;
  sessionProgress: {
    current: number;
    total: number;
  };
  sessionStats: SessionStats | null;
  showRepeatExplanation: boolean;
}

export interface PracticeCardViewModel {
  mainWord: string;
  transliteration?: string;
  transliterationHi?: string;
  answer?: string;
  notes?: string;
  // Remove choices array - no more per-question badges
  isAnswerRevealed: boolean;
  isEnglishMode: boolean;
  columns: number;
  whyRepeat?: { revealCount: number } | null;
  attempts?: {
    total: number;
    correct: number;
    incorrect: number;
  };
  // Add current word data for intelligent parent guidance
  currentWord?: import('../../infrastructure/state/gameState').Word;
  // Add session progress for display above question
  sessionProgress?: {
    current: number;
    total: number;
  };
}

export interface PracticePanelViewModel {
  sessionId: string | null;
  currentWordId: string | null;
  needsNewSession: boolean;
  showCheckForNewQuestions: boolean;
  card: PracticeCardViewModel;
  sessionFraming: SessionFramingViewModel;
}

export interface RevisionPanelItemViewModel {
  id: string;
  primary: string;
  secondary?: string;
  notes?: string;
}

export interface RevisionPanelViewModel {
  title: string;
  buttonLabel: string;
  items: RevisionPanelItemViewModel[];
}

export interface ModeOptionViewModel {
  value: string;
  label: string;
  icon: string;
}

export interface UserOptionViewModel {
  id: string;
  label: string;
}

export interface PracticeHomeViewModel {
  currentUserId: string | null;
  users: UserOptionViewModel[];
  mode: string;
  modeOptions: ModeOptionViewModel[];
  columns: number;
  practice: PracticePanelViewModel;
  revisionPanel?: RevisionPanelViewModel;
  guidance: GuidanceViewModel;
}

export interface PracticeAppViewModel {
  showOnboarding: boolean;
  home?: PracticeHomeViewModel;
}

export interface GuidanceViewModel {
  showIntro: boolean;
  showStreakCoachmark: boolean;
  showProfilesCoachmark: boolean;
  showParentGuideHint: boolean;
}

function mapUsersToOptions(users: Record<string, UserState>): UserOptionViewModel[] {
  return Object.entries(users).map(([id, user]) => ({
    id,
    label: user.displayName || id,
  }));
}

function buildModeOptions(): ModeOptionViewModel[] {
  // Only Kannada learning - no other subjects
  return SUBJECT_CONFIGS.map(config => ({
    value: config.name,
    label: config.displayLabel,
    icon: config.displayIcon,
  }));
}

function buildRevisionPanel(state: GameState, mode: string): RevisionPanelViewModel | undefined {
  const subjectConfig = SUBJECT_CONFIGS.find(config => config.name === mode);
  if (!subjectConfig || !subjectConfig.revisionPanel || !getSubjectSupportsRevision(mode)) {
    return undefined;
  }

  const user = state.currentUserId ? state.users[state.currentUserId] : undefined;
  if (!user) {
    return undefined;
  }

  const { primaryField, secondaryField, notesField, title, buttonLabel } = subjectConfig.revisionPanel;
  const items = Object.values(user.words)
    .filter(word => word.language === subjectConfig.language)
    .map(word => {
      const primary = (word as any)[primaryField];
      const secondary = secondaryField ? (word as any)[secondaryField] : undefined;
      const notes = notesField ? (word as any)[notesField] : undefined;
      const attempts = Array.isArray((word as any).attempts) ? (word as any).attempts : [];
      const correctAttempts = attempts.filter((attempt: any) => attempt?.result === 'correct').length;
      const totalAttempts = attempts.length;
      return {
        id: word.id,
        primary: typeof primary === 'string' ? primary : '',
        secondary: typeof secondary === 'string' ? secondary : undefined,
        notes: typeof notes === 'string' ? notes : undefined,
        attempts: totalAttempts > 0 ? {
          total: totalAttempts,
          correct: correctAttempts,
          incorrect: totalAttempts - correctAttempts,
        } : undefined,
      } as RevisionPanelItemViewModel;
    })
    .filter(item => !!item.primary);

  if (items.length === 0) {
    return undefined;
  }

  return {
    title,
    buttonLabel: buttonLabel ?? subjectConfig.displayLabel,
    items,
  };
}

export function buildPracticeAppViewModel(params: {
  state: GameState;
  mode: string;
  windowWidth: number;
}): PracticeAppViewModel {
  const { state, mode, windowWidth } = params;

  const showOnboarding = selectShouldShowOnboarding(state);
  const columns = selectResponsiveColumns(windowWidth);
  const practiceData = selectCurrentPracticeData(state, mode);
  const sessionId = selectActiveSessionForMode(state, mode);
  const currentWord = sessionId ? selectCurrentWord(state, sessionId) : undefined;
  const currentWordId = currentWord?.id ?? null;
  const experience = selectGuidanceExperience(state);
  const shouldExplainRepeat = !!experience && !experience.hasSeenWhyRepeat && !!practiceData.whyRepeatInfo;

  // Session framing logic
  const sessionProgress = sessionId ? selectSessionProgress(state, sessionId) : { current: 0, total: 0 };
  const sessionStats = sessionId ? selectSessionStats(state, sessionId) : null;
  
  // Determine when to show session start card and repeat explanation
  // Show session start when a new session is created (first question, index 0)
  const showReadyToPractice = sessionId && sessionProgress.current === 1 && !practiceData.needsNewSession;
  // Show repeat explanation for questions that have been revealed multiple times
  const showRepeatExplanation = shouldExplainRepeat;

  const sessionFraming: SessionFramingViewModel = {
    showReadyToPractice: !!showReadyToPractice,
    sessionProgress,
    sessionStats,
    showRepeatExplanation,
  };

  const practiceView: PracticePanelViewModel = {
    sessionId,
    currentWordId,
    needsNewSession: practiceData.needsNewSession ?? false,
    showCheckForNewQuestions: practiceData.needsNewSession ?? false,
    sessionFraming,
    card: {
      mainWord: practiceData.mainWord,
      transliteration: practiceData.transliteration,
      transliterationHi: practiceData.transliterationHi,
      answer: practiceData.answer,
      notes: practiceData.notes,
      isAnswerRevealed: practiceData.isAnswerRevealed ?? false,
      isEnglishMode: practiceData.isEnglishMode ?? false,
      columns,
      whyRepeat: shouldExplainRepeat && practiceData.whyRepeatInfo ? practiceData.whyRepeatInfo : null,
      attempts: practiceData.attemptSummary,
      currentWord: currentWord,
      sessionProgress: sessionStats && sessionStats.totalQuestions > 0 ? {
        current: sessionStats.questionsCompleted,
        total: sessionStats.totalQuestions
      } : undefined,
    },
  };

  const needsVersionedIntro = !!experience && experience.seenIntroVersion !== INTRO_TOUR_VERSION;
  const home: PracticeHomeViewModel = {
    currentUserId: state.currentUserId,
    users: mapUsersToOptions(state.users),
    mode,
    modeOptions: buildModeOptions(),
    columns,
    practice: practiceView,
    revisionPanel: buildRevisionPanel(state, mode),
    guidance: {
      // Show intro if either the legacy flag says not seen OR we bumped the version
      showIntro: !!experience && (!experience.hasSeenIntro || needsVersionedIntro),
      showStreakCoachmark: !!experience && !experience.coachmarks.streak,
      showProfilesCoachmark: !!experience && !experience.coachmarks.profiles,
      showParentGuideHint: !!experience && !experience.hasSeenParentGuide,
    },
  };

  return {
    showOnboarding,
    home: showOnboarding ? undefined : home,
  };
}
