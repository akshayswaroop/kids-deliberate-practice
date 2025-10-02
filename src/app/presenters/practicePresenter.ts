import { SUBJECT_CONFIGS } from '../../infrastructure/repositories/subjectLoader';
import {
  selectActiveSessionForMode,
  selectCurrentPracticeData,
  selectCurrentWord,
  selectResponsiveColumns,
  selectShouldShowOnboarding,
} from '../../infrastructure/state/gameSelectors';
import type { RootState as GameState, UserState } from '../../infrastructure/state/gameState';

export interface PracticeCardViewModel {
  mainWord: string;
  transliteration?: string;
  transliterationHi?: string;
  answer?: string;
  notes?: string;
  choices: Array<{ id: string; label: string; progress: number }>;
  isAnswerRevealed: boolean;
  isEnglishMode: boolean;
  columns: number;
}

export interface PracticePanelViewModel {
  sessionId: string | null;
  currentWordId: string | null;
  needsNewSession: boolean;
  showCheckForNewQuestions: boolean;
  card: PracticeCardViewModel;
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
}

export interface PracticeAppViewModel {
  showOnboarding: boolean;
  home?: PracticeHomeViewModel;
}

function mapUsersToOptions(users: Record<string, UserState>): UserOptionViewModel[] {
  return Object.entries(users).map(([id, user]) => ({
    id,
    label: user.displayName || id,
  }));
}

function buildModeOptions(): ModeOptionViewModel[] {
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

  const practiceView: PracticePanelViewModel = {
    sessionId,
    currentWordId,
    needsNewSession: practiceData.needsNewSession ?? false,
    showCheckForNewQuestions: practiceData.needsNewSession ?? false,
    card: {
      mainWord: practiceData.mainWord,
      transliteration: practiceData.transliteration,
      transliterationHi: practiceData.transliterationHi,
      answer: practiceData.answer,
      notes: practiceData.notes,
      choices: practiceData.choices,
      isAnswerRevealed: practiceData.isAnswerRevealed ?? false,
      isEnglishMode: practiceData.isEnglishMode ?? false,
      columns,
    },
  };

  const home: PracticeHomeViewModel = {
    currentUserId: state.currentUserId,
    users: mapUsersToOptions(state.users),
    mode,
    modeOptions: buildModeOptions(),
    columns,
    practice: practiceView,
  };

  return {
    showOnboarding,
    home: showOnboarding ? undefined : home,
  };
}

