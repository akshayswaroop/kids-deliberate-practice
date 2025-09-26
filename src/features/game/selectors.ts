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

export function selectCurrentLanguagePreferences(state: RootState): string[] {
  if (!state.currentUserId) return ['english'];
  const user = state.users[state.currentUserId];
  if (!user) return ['english'];
  return user.settings.languages;
}

export function selectWordsByMasteryBucket(state: RootState, languages: string[]): {
  struggle: Word[];
  new: Word[];
  mastered: Word[];
} {
  const words = selectWordsByLanguage(state, languages);
  const buckets = { struggle: [] as Word[], new: [] as Word[], mastered: [] as Word[] };
  
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
        transliteration: firstWord.transliteration,
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
  
  return {
    sessionId,
    mainWord: currentWord ? (currentWord.wordKannada || currentWord.text || '...') : '...',
    transliteration: currentWord?.transliteration,
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