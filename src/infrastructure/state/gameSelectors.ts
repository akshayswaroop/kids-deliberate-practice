// Redux Selectors - Infrastructure Layer
// Extract and transform Redux state for UI consumption

import type { RootState } from './gameState';
import type { Word } from './gameState';
import { MasteryConfiguration } from '../../domain/value-objects/MasteryConfiguration';
import { ModeConfiguration } from '../config/modeConfiguration';

// Step-based mastery calculation per new spec (0-5 where 5 = mastered)
export function selectMasteryStep(state: RootState, wordId: string): number {
  if (!state.currentUserId) return 0;
  const user = state.users[state.currentUserId];
  if (!user) return 0;
  const word = user.words[wordId];
  if (!word) return 0;
  return word.step;
}

// Legacy mastery percentage function (convert step to percentage for UI compatibility)
export function selectMasteryPercent(state: RootState, wordId: string): number {
  const step = selectMasteryStep(state, wordId);
  // Convert step (0..MASTER_STEP) to percentage (0-100) for UI compatibility.
  // Respect configured MASTER_STEP so progress UI reaches 100% when a word is considered mastered.
  const max = Math.max(1, MasteryConfiguration.MASTER_STEP);
  const clamped = Math.max(0, Math.min(step, max));
  return Math.round((clamped / max) * 100);
}

export function selectCurrentWord(state: RootState, sessionId: string): Word | undefined {
  if (!state.currentUserId) return undefined;
  const user = state.users[state.currentUserId];
  if (!user) return undefined;
  const session = user.sessions[sessionId];
  if (!session) return undefined;
  if (session.currentIndex >= session.wordIds.length) return undefined;
  const wordId = session.wordIds[session.currentIndex];
  if (!wordId || !user.words[wordId]) return undefined;
  return user.words[wordId];
}

export function selectSessionProgress(
  state: RootState,
  sessionId: string
): { current: number; total: number } {
  if (!state.currentUserId) return { current: 0, total: 0 };
  const user = state.users[state.currentUserId];
  if (!user) return { current: 0, total: 0 };
  const session = user.sessions[sessionId];
  if (!session) return { current: 0, total: 0 };
  return {
    current: session.currentIndex + 1,
    total: session.wordIds.length,
  };
}

// Language filtering selectors
export function selectWordsByLanguage(state: RootState, languages: string[]): Record<string, Word> {
  if (!state.currentUserId) return {};
  const user = state.users[state.currentUserId];
  if (!user) return {};
  
  const filteredWords: Record<string, Word> = {};
  
  for (const [wordId, word] of Object.entries(user.words)) {
    if (languages.includes(word.language)) {
      filteredWords[wordId] = word;
    }
  }
  
  return filteredWords;
}

// Progressive learning: filter words by complexity level
export function selectWordsByComplexityLevel(state: RootState, languages: string[]): Record<string, Word> {
  if (!state.currentUserId) return {};
  const user = state.users[state.currentUserId];
  if (!user) return {};
  
  const filteredWords: Record<string, Word> = {};
  
  for (const [wordId, word] of Object.entries(user.words)) {
    if (languages.includes(word.language)) {
      const userLevel = user.settings.complexityLevels[word.language] || 1;
      if (word.complexityLevel <= userLevel) {
        filteredWords[wordId] = word;
      }
    }
  }
  
  return filteredWords;
}

export function selectCurrentLanguagePreferences(state: RootState): string[] {
  if (!state.currentUserId) return [];
  const user = state.users[state.currentUserId];
  if (!user) return [];
  return user.settings.languages;
}

// Get current complexity levels for each language
export function selectComplexityLevels(state: RootState): Record<string, number> {
  if (!state.currentUserId) return {};
  const user = state.users[state.currentUserId];
  if (!user) return {};
  return user.settings.complexityLevels;
}

// Check if user should progress to next complexity level for a language
export function selectShouldProgressLevel(state: RootState, language: string): boolean {
  if (!state.currentUserId) return false;
  const user = state.users[state.currentUserId];
  if (!user) return false;
  
  const currentLevel = user.settings.complexityLevels[language] || 1;
  
  // Get all words at current level for this language
  const currentLevelWords = Object.values(user.words).filter(word => 
    word.language === language && word.complexityLevel === currentLevel
  );
  
  // If no words at current level, don't progress
  if (currentLevelWords.length === 0) return false;
  
  // Progress only when ALL words at this level are mastered (config-driven)
  const allMastered = currentLevelWords.every(word => MasteryConfiguration.isMastered(word));
  return allMastered;
}

export function selectWordsByMasteryBucket(state: RootState, languages: string[]): {
  struggle: Word[];
  new: Word[];
  mastered: Word[];
} {
  // Use complexity level filtering instead of just language filtering
  const words = selectWordsByComplexityLevel(state, languages);
  const buckets = { struggle: [] as Word[], new:[] as Word[], mastered: [] as Word[] };
  
  for (const word of Object.values(words)) {
    if (MasteryConfiguration.isMastered(word)) {
      buckets.mastered.push(word);
    } else if (word.step === 0) {
      buckets.new.push(word);
    } else {
      buckets.struggle.push(word);
    }
  }
  
  return buckets;
}

// UI-specific selectors that extract business logic from components

export function selectShouldShowOnboarding(state: RootState): boolean {
  return !state.currentUserId;
}

export function selectActiveSessionForMode(state: RootState, mode: string): string | null {
  if (!state.currentUserId) return null;
  const user = state.users[state.currentUserId];
  if (!user) return null;
  
  const activeSessions = user.activeSessions || {};
  return activeSessions[mode] || null;
}

export function selectGuidanceExperience(state: RootState): import('./gameState').GuidanceExperience | null {
  if (!state.currentUserId) return null;
  const user = state.users[state.currentUserId];
  if (!user) return null;
  return user.experience ?? null;
}

export function selectPracticeChoices(state: RootState, sessionId: string): Array<{ id: string; label: string; progress: number }> {
  if (!state.currentUserId) return [];
  const user = state.users[state.currentUserId];
  if (!user) return [];
  
  const session = user.sessions[sessionId];
  if (!session) return [];
  
  return session.wordIds.map((id: string) => {
    const word = user.words[id];
    if (!word) return { id, label: '...', progress: 0 };
    
    return {
      id,
      label: word.wordKannada || word.text || '...',
      progress: selectMasteryPercent(state, id),
    };
  });
}

export function selectCurrentPracticeData(state: RootState, mode: string): {
  sessionId: string | null;
  mainWord: string;
  transliteration?: string;
  transliterationHi?: string;
  answer?: string;
  notes?: string;
  choices: Array<{ id: string; label: string; progress: number }>;
  needsNewSession?: boolean;
  isAnswerRevealed?: boolean;
  isEnglishMode?: boolean;
  whyRepeatInfo?: { revealCount: number } | null;
  attemptSummary?: {
    total: number;
    correct: number;
    incorrect: number;
  };
} {
  if (!state.currentUserId) {
    return {
      sessionId: null,
      mainWord: '...',
      choices: [],
      needsNewSession: true,
      isAnswerRevealed: false,
      isEnglishMode: false,
    };
  }
  
  const user = state.users[state.currentUserId];
  if (!user) {
    return {
      sessionId: null,
      mainWord: '...',
      choices: [],
      needsNewSession: true,
      isAnswerRevealed: false,
      isEnglishMode: false,
    };
  }

  const sessionId = selectActiveSessionForMode(state, mode);
  
  if (!sessionId || !user.sessions[sessionId]) {
    return {
      sessionId: null,
      mainWord: '...',
      choices: [],
      needsNewSession: false, // Don't show celebration for new users - let session creation happen
      isAnswerRevealed: false,
      isEnglishMode: false,
    };
  }

  const currentWord = selectCurrentWord(state, sessionId);
  const choices = selectPracticeChoices(state, sessionId);
  const session = user.sessions[sessionId];
  
  // Configuration-driven mode categorization (no more hardcoded mode lists!)
  // Import from shared config to keep modes in sync across components
  const shouldShowTransliteration = ModeConfiguration.getTransliterationModes().includes(mode) && session?.revealed === true;
  // Universal answer/notes logic - show if the word has these fields and session is revealed
  const shouldShowAnswer = session?.revealed === true;
  
  // Some modes always show answers (configured in domain)
  const alwaysShowAnswer = ModeConfiguration.shouldAlwaysShowAnswer(mode);

  // If transliteration mode declares that its transliteration should act as the canonical answer,
  // surface the specified field on the current word as `answer` so the UI (details panel) shows it.
  let computedAnswer: string | undefined = undefined;
  let computedNotes: string | undefined = undefined;
  if (shouldShowTransliteration) {
    const modeConfig = ModeConfiguration.getTransliterationModeConfig(mode);
    if (modeConfig && currentWord) {
      computedAnswer = currentWord[modeConfig.answerField];
    }
  }
  
  const revealCount = currentWord?.revealCount ?? 0;
  const whyRepeatInfo =
    session?.revealed && currentWord && revealCount >= 3
      ? { revealCount }
      : null;

  const attempts = Array.isArray(currentWord?.attempts) ? (currentWord?.attempts as Array<{ result?: string }>) : [];
  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter(attempt => attempt.result === 'correct').length;
  const incorrectAttempts = totalAttempts - correctAttempts;

  const attemptSummary = {
    total: totalAttempts,
    correct: correctAttempts,
    incorrect: incorrectAttempts,
  };

  return {
    sessionId,
    mainWord: currentWord ? (currentWord.wordKannada || currentWord.text || '...') : '...',
    needsNewSession: session?.needsNewSession || false,
  transliteration: shouldShowTransliteration ? currentWord?.transliteration : undefined,
  transliterationHi: shouldShowTransliteration ? currentWord?.transliterationHi : undefined,
  answer: computedAnswer || (shouldShowAnswer || alwaysShowAnswer ? currentWord?.answer : undefined),
  notes: computedNotes || (shouldShowAnswer || alwaysShowAnswer ? currentWord?.notes : undefined),
    choices,
    isAnswerRevealed: session?.revealed || false,
    isEnglishMode: mode === 'english',
    whyRepeatInfo,
    attemptSummary,
  };
}

export function selectResponsiveColumns(windowWidth: number): number {
  if (windowWidth < 520) return 3;
  if (windowWidth < 900) return 4;
  return 6;
}

// Check if ALL words in a session are fully mastered (strict full-mastery requirement)
export function selectIsSessionFullyMastered(state: RootState, sessionId: string): boolean {
  if (!state.currentUserId) {
    return false;
  }
  const user = state.users[state.currentUserId];
  if (!user) {
    return false;
  }
  const session = user.sessions[sessionId];
  if (!session) {
    return false;
  }
  
  // Check if ALL words in this session are mastered using domain configuration
  return session.wordIds.every(wordId => {
    const word = user.words[wordId];
    return word && MasteryConfiguration.isMastered(word);
  });
}

// Get session size for a specific mode with fallback to default
export function selectSessionSizeForMode(_state: RootState, _mode: string): number {
  // Use domain service default - can be enhanced to read user preferences
  return 12;
}
