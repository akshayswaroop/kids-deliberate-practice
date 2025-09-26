import type { RootState, Word } from "./state";

// Mastery calculation per DOMAIN_RULES.md
export function selectMasteryPercent(state: RootState, wordId: string): number {
  if (!state.currentUserId) return 0;
  const user = state.users[state.currentUserId];
  if (!user) return 0;
  const word = user.words[wordId];
  if (!word) return 0;
  let mastery = 0;
  for (const attempt of word.attempts) {
    if (attempt.result === "correct") mastery += 20;
    else if (attempt.result === "wrong") mastery -= 20;
    mastery = Math.max(0, Math.min(100, mastery));
  }
  return mastery;
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
      // Then check if the word's complexity level is within the user's unlocked level
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
  
  // Check if at least 80% of current level words are mastered (100% mastery)
  const masteredWords = currentLevelWords.filter(word => {
    const mastery = selectMasteryPercent(state, word.id);
    return mastery === 100;
  });
  
  const masteryRate = masteredWords.length / currentLevelWords.length;
  return masteryRate >= 0.8; // 80% threshold for progression
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
    const mastery = selectMasteryPercent(state, word.id);
    
    if (word.attempts.length === 0) {
      buckets.new.push(word);
    } else if (mastery < 60) {
      buckets.struggle.push(word);
    } else if (mastery === 100) {
      // Check if it's time for spaced review
      const now = Date.now();
      if (!word.nextReviewAt || now >= word.nextReviewAt) {
        buckets.mastered.push(word);
      }
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
  choices: Array<{ id: string; label: string; progress: number }>;
} {
  if (!state.currentUserId) {
    return {
      sessionId: null,
      mainWord: '...',
      choices: []
    };
  }
  
  const user = state.users[state.currentUserId];
  if (!user) {
    return {
      sessionId: null,
      mainWord: '...',
      choices: []
    };
  }

  const sessionId = selectActiveSessionForMode(state, mode);
  if (!sessionId || !user.sessions[sessionId]) {
    // Fallback to first available words for display
    const languages = selectCurrentLanguagePreferences(state);
    const availableWords = selectWordsByLanguage(state, languages);
    const wordsArray = Object.values(availableWords);
    
    if (wordsArray.length > 0) {
      const firstWord = wordsArray[0];
      return {
        sessionId: null,
        mainWord: firstWord.wordKannada || firstWord.text || '...',
        // Don't show transliteration in fallback case (no session yet)
        choices: wordsArray.slice(0, 4).map(w => ({ 
          id: w.id, 
          label: w.wordKannada || w.text, 
          progress: selectMasteryPercent(state, w.id) 
        }))
      };
    }
    
    return {
      sessionId: null,
      mainWord: '...',
      choices: []
    };
  }

  const currentWord = selectCurrentWord(state, sessionId);
  const choices = selectPracticeChoices(state, sessionId);
  const session = user.sessions[sessionId];
  
  // Show transliteration/answer for different modes when session is revealed
  const isKannadaMode = mode === 'kannada';
  const isMathTablesMode = mode === 'mathtables';
  const shouldShowTransliteration = (isKannadaMode || isMathTablesMode) && session?.revealed === true;
  
  return {
    sessionId,
    mainWord: currentWord ? (currentWord.wordKannada || currentWord.text || '...') : '...',
    transliteration: shouldShowTransliteration ? currentWord?.transliteration : undefined,
    transliterationHi: shouldShowTransliteration ? currentWord?.transliterationHi : undefined,
    choices
  };
}

export function selectResponsiveColumns(windowWidth: number): number {
  if (windowWidth < 520) return 2;
  if (windowWidth < 900) return 3;
  return 6;
}

// Check if all words in a session are fully mastered (100%)
export function selectAreAllSessionWordsMastered(state: RootState, sessionId: string): boolean {
  if (!state.currentUserId) return false;
  const user = state.users[state.currentUserId];
  if (!user) return false;
  const session = user.sessions[sessionId];
  if (!session) return false;
  
  return session.wordIds.every(wordId => {
    const mastery = selectMasteryPercent(state, wordId);
    return mastery === 100;
  });
}

// Get session size for a specific mode with fallback to default
export function selectSessionSizeForMode(state: RootState, mode: string): number {
  if (!state.currentUserId) return 6; // Default fallback
  const user = state.users[state.currentUserId];
  if (!user) return 6;
  
  // Handle migration: if user has old sessionSize structure, use that as default for all modes
  if (!user.settings.sessionSizes) {
    // Legacy user with old sessionSize structure
    const legacySessionSize = (user.settings as any).sessionSize || 6;
    return legacySessionSize;
  }
  
  // Get sessionSize for the specific mode, fallback to 6 if not set
  return user.settings.sessionSizes[mode] || 6;
}