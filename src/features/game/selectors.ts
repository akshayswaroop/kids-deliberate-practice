import type { RootState, Word } from "./state";

// Mastery calculation per DOMAIN_RULES.md
export function selectMasteryPercent(state: RootState, wordId: string): number {
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