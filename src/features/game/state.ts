// Types for game state management

export type Attempt = {
  timestamp: number;
  result: "correct" | "wrong";
};

export type Word = {
  id: string;
  text: string;
  language: string;
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
