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
  sessionSize: number;
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
};

export type UserState = {
  words: Record<string, Word>;
  sessions: Record<string, Session>;
  activeSessions: Record<string, string>;
  settings: SessionSettings;
};

export type RootState = {
  users: Record<string, UserState>;
  currentUserId: string;
};
