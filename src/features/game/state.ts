// Types for game state management

export type Attempt = {
  timestamp: number;
  result: "correct" | "wrong";
};

export type Word = {
  id: string;
  text: string; // For English words, this is the main text. For Kannada, this could be transliteration for display
  language: string;
  // Kannada-specific fields
  wordKannada?: string; // ರಾಮ
  transliteration?: string; // Rāma  
  transliterationHi?: string; // राम
  attempts: Attempt[];
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
