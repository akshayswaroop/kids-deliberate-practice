import type { RootState, Word } from "./state";

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
  // Convert step (0-5) to percentage (0-100) for UI compatibility
  return (step / 5) * 100;
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
  if (!state.currentUserId) throw new Error("User not found");
  const user = state.users[state.currentUserId];
  if (!user) throw new Error("User not found");
  const session = user.sessions[sessionId];
  if (!session) throw new Error("Session not found");
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
    if (languages.includes(word.language) || languages.includes('mixed')) {
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
    // First check if the language is selected
    if (languages.includes(word.language) || languages.includes('mixed')) {
      // Only include words from current level - proper progressive learning
      const userLevelForLanguage = user.settings.complexityLevels[word.language] || 1;
      if (word.complexityLevel <= userLevelForLanguage) {
        filteredWords[wordId] = word;
      }
    }
  }
  
  return filteredWords;
}

export function selectCurrentLanguagePreferences(state: RootState): string[] {
  if (!state.currentUserId) return ['english'];
  const user = state.users[state.currentUserId];
  if (!user) return ['english'];
  return user.settings.languages;
}

// Get current complexity levels for each language
export function selectComplexityLevels(state: RootState): Record<string, number> {
  if (!state.currentUserId) return { english: 1, kannada: 1, hindi: 1 };
  const user = state.users[state.currentUserId];
  if (!user) return { english: 1, kannada: 1, hindi: 1 };
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
  
  // Progress only when ALL words at this level are mastered (step = 5)
  const allMastered = currentLevelWords.every(word => word.step === 5);
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
    if (word.step === 0 && word.attempts.length === 0) {
      // New: step = 0, attempts.length = 0
      buckets.new.push(word);
    } else if (word.step >= 1 && word.step <= 4) {
      // Active: 1 ≤ step ≤ 4 (renamed from "struggle" to "active" but keeping same bucket name for compatibility)
      buckets.struggle.push(word);
    } else if (word.step === 5 && word.cooldownSessionsLeft === 0) {
      // Revision: step = 5, cooldownSessionsLeft = 0
      buckets.mastered.push(word);
    }
    // Note: Words with step = 5 and cooldownSessionsLeft > 0 are intentionally excluded
    // from regular buckets but can be used as emergency fallback in sessionGen.ts
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

export function selectPracticeChoices(state: RootState, sessionId: string): Array<{ id: string; label: string; progress: number }> {
  if (!state.currentUserId) return [];
  const user = state.users[state.currentUserId];
  if (!user) return [];
  
  const session = user.sessions[sessionId];
  if (!session) return [];
  
  return session.wordIds.map((id: string) => {
    const word = user.words[id];
    if (!word) {
      return { id, label: id, progress: 0 };
    }
    return { 
      id, 
      label: word.wordKannada || word.text || id, 
      progress: selectMasteryPercent(state, id) 
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
} {
  if (!state.currentUserId) {
    return {
      sessionId: null,
      mainWord: '...',
      choices: [],
      needsNewSession: false
    };
  }
  
  const user = state.users[state.currentUserId];
  if (!user) {
    return {
      sessionId: null,
      mainWord: '...',
      choices: [],
      needsNewSession: false
    };
  }

  const sessionId = selectActiveSessionForMode(state, mode);
  
  if (!sessionId || !user.sessions[sessionId]) {
    // Return empty state - this indicates a bug that needs fixing
    return {
      sessionId: null,
      mainWord: 'ERROR: No Session',
      choices: [],
      needsNewSession: false
    };
  }

  const currentWord = selectCurrentWord(state, sessionId);
  const choices = selectPracticeChoices(state, sessionId);
  const session = user.sessions[sessionId];
  
  // Show transliteration/answer for different modes when session is revealed
  const isKannadaMode = mode === 'kannada';
  const isMathTablesMode = mode === 'mathtables';
  const isHumanBodyMode = mode === 'humanbody';
  const isIndiaGeographyMode = mode === 'indiageography';
  const isGramPanchayatMode = mode === 'grampanchayat';
  const shouldShowTransliteration = (isKannadaMode || isMathTablesMode) && session?.revealed === true;
  const shouldShowAnswer = (isHumanBodyMode || isIndiaGeographyMode || isGramPanchayatMode) && session?.revealed === true;
  
  return {
    sessionId,
    mainWord: currentWord ? (currentWord.wordKannada || currentWord.text || '...') : '...',
    needsNewSession: session?.needsNewSession || false,
    transliteration: shouldShowTransliteration ? currentWord?.transliteration : undefined,
    transliterationHi: shouldShowTransliteration ? currentWord?.transliterationHi : undefined,
    answer: shouldShowAnswer ? currentWord?.answer : undefined,
    notes: shouldShowAnswer ? currentWord?.notes : undefined,
    choices
  };
}

export function selectResponsiveColumns(windowWidth: number): number {
  if (windowWidth < 520) return 2;
  if (windowWidth < 900) return 3;
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
  if (!session || session.wordIds.length === 0) {
    return false;
  }
  
  const allMastered = session.wordIds.every(wordId => {
    const word = user.words[wordId];
    if (!word || word.step !== 5) {
      return false;
    }
    return true;
  });
  return allMastered;
}

// Get session size for a specific mode with fallback to default
export function selectSessionSizeForMode(_state: RootState, _mode: string): number {
  // Always return 12 questions for all modes - simplified approach
  return 12;
}