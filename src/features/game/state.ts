// Types for game state management

export type Attempt = {
  timestamp: number;
  result: "correct" | "wrong";
};

export type Word = {
  id: string;
  text: string; // For English words, this is the main text. For Kannada, this could be transliteration for display
  language: string;
  complexityLevel: number; // 1-based progressive learning level (1 = easiest, higher = more complex)
  // Kannada-specific fields
  wordKannada?: string; // ರಾಮ
  transliteration?: string; // Rāma  
  transliterationHi?: string; // राम
  // Human Body mode fields
  answer?: string; // The correct answer to the question
  notes?: string; // Additional information revealed after attempting
  category?: string; // Topic category (e.g., "skeleton_bones", "general_body")
  attempts: Attempt[];
  
  // Step-based mastery fields (new spec)
  step: number; // 0-5, where 5 indicates mastery
  lastPracticedAt?: number; // timestamp of last practice attempt
  lastRevisedAt?: number; // timestamp of last revision attempt
  cooldownSessionsLeft: number; // sessions remaining before eligible for revision
  
  // Legacy fields (will be computed from step if needed)
  nextReviewAt?: number;
  reviewInterval?: number;
};

export type SessionSettings = {
  selectionWeights: {
    struggle: number;
    new: number;
    mastered: number;
  };
  // Store session size per mode/language instead of single global value
  sessionSizes: Record<string, number>; // mode -> sessionSize (e.g., { english: 6, kannada: 3, mixed: 9 })
  // Language filtering for sessions
  languages: string[]; // ["english", "kannada"] or ["mixed"]
  // Progressive learning: track unlocked complexity level per language
  complexityLevels: Record<string, number>; // e.g., { "english": 2, "kannada": 3, "hindi": 1 }
};

export type Session = {
  wordIds: string[];
  currentIndex: number;
  revealed: boolean;
  lastAttempt?: "correct" | "wrong";
  mode: string;
  createdAt: number;
  settings: SessionSettings;
  // Flag indicating that all words are mastered and a new session should be generated
  needsNewSession?: boolean;
};

export type UserState = {
  // Optional human-friendly display name for UI (not used as the state key)
  displayName?: string;
  words: Record<string, Word>;
  sessions: Record<string, Session>;
  activeSessions: Record<string, string>;
  settings: SessionSettings;
};

export type RootState = {
  users: Record<string, UserState>;
  // No default user required; allow null until a user is created/selected
  currentUserId: string | null;
};
