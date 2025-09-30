/**
 * 🎯 Domain Repository: Session Data Access
 * 
 * This interface defines operations for persisting and retrieving
 * practice session data and analytics.
 */

import { LearnerId } from '../value-objects/LearnerId';
import { WordId } from '../value-objects/WordId';

/**
 * Practice session data as stored/retrieved
 */
export interface PracticeSession {
  sessionId: string;
  learnerId: string;
  subject: string;
  complexityLevel: number;
  sessionType: 'learning' | 'revision' | 'mixed';
  startedAt: Date;
  completedAt?: Date;
  words: SessionWord[];
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds?: number;
  wasCompleted: boolean;
}

/**
 * Individual word performance in a session
 */
export interface SessionWord {
  wordId: string;
  wordText: string;
  attempts: SessionAttempt[];
  finalResult: 'correct' | 'incorrect' | 'revealed' | 'skipped';
  timeSpentSeconds: number;
}

/**
 * Individual attempt within a session
 */
export interface SessionAttempt {
  attemptNumber: number;
  answer: string;
  isCorrect: boolean;
  timestampMs: number;
  hintUsed: boolean;
}

/**
 * Repository interface for practice session data
 */
export interface SessionRepository {
  /**
   * Create and save a new practice session
   */
  createSession(session: Omit<PracticeSession, 'sessionId'>): Promise<PracticeSession>;

  /**
   * Find session by ID
   */
  findById(sessionId: string): Promise<PracticeSession | null>;

  /**
   * Find all sessions for a learner
   */
  findByLearner(learnerId: LearnerId, limit?: number): Promise<PracticeSession[]>;

  /**
   * Find recent sessions for a learner
   */
  findRecentSessions(learnerId: LearnerId, days: number): Promise<PracticeSession[]>;

  /**
   * Update session with progress
   */
  updateSession(sessionId: string, updates: Partial<PracticeSession>): Promise<void>;

  /**
   * Mark session as completed
   */
  completeSession(
    sessionId: string, 
    completedAt: Date, 
    finalResults: SessionSummary
  ): Promise<void>;

  /**
   * Get session analytics for insights
   */
  getSessionAnalytics(learnerId: LearnerId, timeframe?: TimeFrame): Promise<SessionAnalytics>;

  /**
   * Delete old session data (for privacy/storage management)
   */
  cleanupOldSessions(olderThanDays: number): Promise<number>;
}

/**
 * Session completion summary
 */
export interface SessionSummary {
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds: number;
  accuracyPercentage: number;
  wordsAdvanced: WordId[];
  strugglingWords: WordId[];
}

/**
 * Time frame for analytics
 */
export interface TimeFrame {
  startDate: Date;
  endDate: Date;
}

/**
 * Session analytics for learning insights
 */
export interface SessionAnalytics {
  totalSessions: number;
  totalPracticeTime: number; // seconds
  averageSessionDuration: number; // seconds
  overallAccuracy: number; // percentage
  consistencyScore: number; // 0-100, based on regular practice
  subjectBreakdown: SubjectSessionStats[];
  weeklyProgress: WeeklyStats[];
  streakData: StreakData;
}

export interface SubjectSessionStats {
  subject: string;
  sessionCount: number;
  totalQuestions: number;
  accuracy: number;
  averageDuration: number;
  improvement: number; // percentage change over timeframe
}

export interface WeeklyStats {
  weekStarting: Date;
  sessionCount: number;
  totalQuestions: number;
  accuracy: number;
  practiceTime: number;
}

export interface StreakData {
  currentStreak: number; // consecutive days with practice
  longestStreak: number;
  streakStartDate?: Date;
  isActiveToday: boolean;
}