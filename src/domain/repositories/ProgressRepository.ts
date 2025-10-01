/**
 * 🎯 Domain Repository: Progress Tracking Data Access
 * 
 * This interface defines what data access operations the domain needs
 * for progress tracking, without specifying how they're implemented.
 * 
 * The infrastructure layer will implement this interface, possibly
 * using Redux, localStorage, or a database.
 */

import { ProgressTracker } from '../entities/ProgressTracker';
import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';

/**
 * Repository interface for ProgressTracker aggregate
 */
export interface ProgressRepository {
  /**
   * Find progress tracker for a specific word and learner
   */
  findByWordAndLearner(wordId: WordId, learnerId: LearnerId): Promise<ProgressTracker | null>;

  /**
   * Find all progress trackers for a learner
   */
  findByLearner(learnerId: LearnerId): Promise<ProgressTracker[]>;

  /**
   * Find progress trackers for multiple words for a learner
   */
  findByWordsAndLearner(wordIds: WordId[], learnerId: LearnerId): Promise<Map<string, ProgressTracker>>;

  /**
   * Find all mastered words for a learner in a specific subject
   */
  findMasteredByLearnerAndSubject(learnerId: LearnerId, subject: string): Promise<ProgressTracker[]>;

  /**
   * Save a progress tracker (insert or update)
   */
  save(progressTracker: ProgressTracker): Promise<void>;

  /**
   * Save multiple progress trackers in a batch
   */
  saveAll(progressTrackers: ProgressTracker[]): Promise<void>;

  /**
   * Delete progress tracker (for testing or data cleanup)
   */
  delete(wordId: WordId, learnerId: LearnerId): Promise<void>;

  /**
   * Get learning statistics for analytics
   */
  getStatistics(learnerId: LearnerId): Promise<LearningStatistics>;
}

/**
 * Learning statistics for analytics and insights
 */
export interface LearningStatistics {
  totalWordsAttempted: number;
  totalWordsMastered: number;
  masteryPercentage: number;
  averageAttemptsToMastery: number;
  subjectBreakdown: SubjectStatistics[];
  currentStreak: number;
  longestStreak: number;
  
  // 🌱 Turnaround metrics: shows growth and resilience
  turnaroundCount: number; // Words that were once wrong but now mastered
}

export interface SubjectStatistics {
  subject: string;
  wordsAttempted: number;
  wordsMastered: number;
  masteryPercentage: number;
  averageAccuracy: number;
}