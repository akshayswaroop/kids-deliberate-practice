import type { RootState, Word } from "./state";

// Mastery calculation per DOMAIN_RULES.md
export function selectMasteryPercent(state: RootState, wordId: string): number {
  const word = state.words[wordId];
  if (!word) return 0;

  let mastery = 0;
  for (const attempt of word.attempts) {
    if (attempt.result === "correct") mastery += 20;
    else if (attempt.result === "wrong") mastery -= 20;
    mastery = Math.max(0, Math.min(100, mastery));
  }

  return mastery;
}

export function selectCurrentWord(state: RootState, sessionId: string): Word {
  const session = state.sessions[sessionId];
  if (!session) throw new Error("Session not found");
  const wordId = session.wordIds[session.currentIndex];
  return state.words[wordId];
}

export function selectSessionProgress(
  state: RootState,
  sessionId: string
): { current: number; total: number } {
  const session = state.sessions[sessionId];
  if (!session) throw new Error("Session not found");
  return {
    current: session.currentIndex + 1,
    total: session.wordIds.length,
  };
}