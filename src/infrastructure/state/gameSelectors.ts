// Redux Selectors - Infrastructure Layer
// Extract and transform Redux state for UI consumption

import type { RootState, SessionStats } from './gameState';
import type { Word } from './gameState';
import type { ParentGuidance } from '../../domain/entities/ProgressTracker';
import { SessionGuidance, type SessionGuidanceResult } from '../../domain/entities/SessionGuidance';
import { MasteryConfiguration } from '../../domain/value-objects/MasteryConfiguration';
import { ModeConfiguration } from '../config/modeConfiguration';
import { ProgressTracker } from '../../domain/entities/ProgressTracker';
import { SubjectConfiguration } from '../config/subjectConfiguration';

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

/**
 * 🎯 DDD-Compliant Selector: Parent Guidance
 * 
 * Maps Redux state to domain entity and delegates business logic to the domain.
 * Follows trace-based architecture: reads current state, no temporal coupling.
 * 
 * Architecture principle: "Selectors = DTOs only (never styled text)"
 * - Selectors extract state and pass to domain
 * - Domain calculates what message parent should see
 * - UI receives plain data and displays it (no business logic)
 * 
 * NOTE: Memoized to prevent unnecessary React re-renders when returning same guidance.
 * Cache key: userId_wordId_attemptCount_step_revealCount
 * 
 * @param state Redux root state
 * @param wordId Current word ID
 * @returns ParentGuidance DTO with message, urgency, and context
 */
const parentGuidanceCache = new Map<string, ParentGuidance>();

export function selectParentGuidance(
  state: RootState,
  wordId: string
): ParentGuidance {
  if (!state.currentUserId) {
    return {
      message: 'First try',
      urgency: 'info',
      context: 'initial'
    };
  }

  const user = state.users[state.currentUserId];
  if (!user || !user.words[wordId]) {
    return {
      message: 'First try',
      urgency: 'info',
      context: 'initial'
    };
  }

  const word = user.words[wordId];

  // Create cache key based on state that affects guidance
  const cacheKey = `${state.currentUserId}_${wordId}_${word.attempts?.length || 0}_${word.step || 0}_${word.revealCount || 0}`;
  
  console.log('[selectParentGuidance] Called with cache key:', cacheKey);
  
  // Return cached result if unchanged
  const cached = parentGuidanceCache.get(cacheKey);
  if (cached) {
    console.log('[selectParentGuidance] Returning cached:', cached);
    return cached;
  }

  console.log('[selectParentGuidance] Cache miss, computing new guidance');

  // Reconstitute domain entity from state
  const progressTracker = ProgressTracker.fromData({
    wordId: word.id,
    learnerId: state.currentUserId,
    progress: word.step || 0,
    attempts: (word.attempts || []).map(a => ({
      timestamp: a.timestamp,
      result: a.result
    })),
    cooldownSessionsLeft: 0,
    masteryAchievedAt: undefined,
    revealCount: word.revealCount || 0
  });

  // Delegate to domain entity - it knows the business rules
  const guidance = progressTracker.getParentGuidance();
  
  console.log('[selectParentGuidance] Computed guidance:', guidance);
  
  // Cache the result
  parentGuidanceCache.set(cacheKey, guidance);
  
  // Keep cache size reasonable (max 100 entries)
  if (parentGuidanceCache.size > 100) {
    const firstKey = parentGuidanceCache.keys().next().value;
    if (firstKey) parentGuidanceCache.delete(firstKey);
  }
  
  return guidance;
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

export function selectSessionStats(
  state: RootState,
  sessionId: string
): SessionStats | null {
  if (!state.currentUserId) return null;
  const user = state.users[state.currentUserId];
  if (!user) return null;
  const session = user.sessions[sessionId];
  if (!session) return null;
  
  // Calculate current session statistics
  const totalQuestions = session.wordIds.length;
  const questionsCompleted = session.currentIndex + 1;
  
  // Track words mastered during this session vs. initially mastered
  const initialMastered = new Set(session.initialMasteredWords || []);
  let masteredInSession = 0;
  let practicedInSession = 0;
  let yetToTry = 0;
  
  for (let i = 0; i < session.wordIds.length; i++) {
    const wordId = session.wordIds[i];
    const word = user.words[wordId];
    
    if (word) {
      const isCurrentlyMastered = word.step >= 2; // Using MasteryConfiguration threshold
      const wasInitiallyMastered = initialMastered.has(wordId);
      
      if (i < questionsCompleted) {
        // Question has been seen in this session
        if (isCurrentlyMastered && !wasInitiallyMastered) {
          masteredInSession++;
        } else if (!isCurrentlyMastered) {
          practicedInSession++;
        }
      } else {
        // Question not yet attempted
        yetToTry++;
      }
    } else {
      // Word not found, count as yet to try
      if (i >= questionsCompleted) {
        yetToTry++;
      }
    }
  }
  
  return {
    totalQuestions,
    questionsCompleted,
    masteredInSession,
    practicedInSession,
    yetToTry,
  };
}

export function selectIsSessionComplete(
  state: RootState,
  sessionId: string
): boolean {
  if (!state.currentUserId) return false;
  const user = state.users[state.currentUserId];
  if (!user) return false;
  const session = user.sessions[sessionId];
  if (!session) return false;
  
  return session.currentIndex >= session.wordIds.length - 1;
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
  if (!user || !user.settings || !user.settings.complexityLevels) return false;
  
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

/**
 * 🎯 DDD-Compliant Selector: Session Guidance
 * 
 * Provides session-level guidance to replace ReadyToPracticeCard modal.
 * Delegates to SessionGuidance domain entity following the same pattern as selectParentGuidance.
 * 
 * Architecture principle: "Selectors = DTOs only (never styled text)"
 * - Selectors extract state and pass to domain
 * - Domain calculates what session-level message to show
 * - UI receives plain data and displays it
 * 
 * @param state Redux root state
 * @param sessionId Current session ID
 * @returns SessionGuidanceResult or null if no session guidance needed
 */
const sessionGuidanceCache = new Map<string, SessionGuidanceResult | null>();

export function selectSessionGuidance(
  state: RootState,
  sessionId: string
): SessionGuidanceResult | null {
  if (!state.currentUserId) {
    return null;
  }

  const user = state.users[state.currentUserId];
  if (!user || !user.sessions[sessionId]) {
    return null;
  }

  const session = user.sessions[sessionId];
  
  // Create cache key based on session state that affects guidance
  const masteredCount = session.wordIds.filter(wordId => {
    const word = user.words[wordId];
    return word && MasteryConfiguration.isMastered(word);
  }).length;

  // Include total attempts in cache key to invalidate when attempts change
  const totalAttempts = session.wordIds.reduce((total, wordId) => {
    const word = user.words[wordId];
    return total + (word ? word.attempts.length : 0);
  }, 0);
  
  const cacheKey = `${state.currentUserId}_${sessionId}_${session.currentIndex}_${masteredCount}_${totalAttempts}_${session.wordIds.length}`;
  
  // Return cached result if unchanged
  const cached = sessionGuidanceCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Determine if all questions in set are mastered
  const allQuestionsInSetMastered = session.wordIds.every(wordId => {
    const word = user.words[wordId];
    return word && MasteryConfiguration.isMastered(word);
  });

  // Check if there are more complexity levels available
  // Look for unmastered words at higher complexity levels in the same language/mode
  const currentLevel = user.settings.complexityLevels[session.mode || 'english'] || 1;
  const hasWordsAtHigherLevels = Object.values(user.words).some(word => 
    word.language === (session.mode || 'english') && 
    word.complexityLevel > currentLevel &&
    !MasteryConfiguration.isMastered(word)
  );
  const hasMoreLevels = hasWordsAtHigherLevels;

  // Check if this is truly the first question ever in this session
  // True only when at index 0 AND no words in session have any attempts yet
  const isFirstQuestionEver = session.currentIndex === 0 && 
    session.wordIds.every(wordId => {
      const word = user.words[wordId];
      return !word || word.attempts.length === 0;
    });

  // Reconstitute domain entity from state
  const sessionGuidance = SessionGuidance.fromSessionData({
    sessionId: sessionId,
    currentQuestionIndex: session.currentIndex,
    totalQuestions: session.wordIds.length,
    masteredInSession: masteredCount,
    allQuestionsInSetMastered,
    hasMoreLevels,
    subject: session.mode || 'english',
    isFirstQuestionEver
  });

  // Delegate to domain entity
  const guidance = sessionGuidance.getSessionGuidance();
  
  // Infrastructure layer formats subject name for display (domain stays agnostic)
  if (guidance && guidance.context === 'completion') {
    const subjectDisplayName = SubjectConfiguration.getDisplayName(sessionGuidance.getSubject());
    guidance.message = `Amazing! You've mastered everything in ${subjectDisplayName}. Check back for new questions!`;
  }
  
  // Cache the result
  sessionGuidanceCache.set(cacheKey, guidance);
  
  // Keep cache size reasonable (max 50 entries)
  if (sessionGuidanceCache.size > 50) {
    const firstKey = sessionGuidanceCache.keys().next().value;
    if (firstKey) sessionGuidanceCache.delete(firstKey);
  }
  
  return guidance;
}
