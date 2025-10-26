import { SUBJECT_CONFIGS } from '../../infrastructure/repositories/subjectLoader';
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
  const guidance: GuidanceViewModel = {
    showIntro: !!experience ? (!experience.hasSeenIntro || needsVersionedIntro) : true,
    showStreakCoachmark: !!experience ? !experience.coachmarks.streak : false,
    showProfilesCoachmark: !!experience ? !experience.coachmarks.profiles : false,
    showParentGuideHint: !!experience ? !experience.hasSeenParentGuide : false,
  };

  const home: PracticeHomeViewModel = {
    currentUserId: state.currentUserId,
    users: mapUsersToOptions(state.users),
    mode,
    modeOptions: buildModeOptions(),
    columns,
    practice: practiceView,
    guidance,
  };

  return {
    showOnboarding,
    home: showOnboarding ? undefined : home,
  };
}
