/**
 * 🎯 Domain Repositories Index
 * 
 * Central export point for all domain repository interfaces.
 * These interfaces define what data access the domain needs
 * without specifying implementation details.
 */

// Progress tracking repositories
export type { 
  ProgressRepository,
  LearningStatistics,
  SubjectStatistics 
} from './ProgressRepository';

// Word content repositories  
export type {
  WordRepository,
  WordDrill,
  LearnerRepository,
  LearnerProfile,
  LearnerPreferences
} from './WordRepository';

// Session data repositories
export type {
  SessionRepository,
  PracticeSession,
  SessionWord,
  SessionAttempt,
  SessionSummary,
  SessionAnalytics,
  SubjectSessionStats,
  WeeklyStats,
  StreakData,
  TimeFrame
} from './SessionRepository';

// Import types for interface definitions below
import type { ProgressRepository } from './ProgressRepository';
import type { WordRepository, LearnerRepository } from './WordRepository';
import type { SessionRepository } from './SessionRepository';

/**
 * 🎯 Repository Unit of Work Interface
 * 
 * Coordinates transactions across multiple repositories
 * for complex domain operations that span aggregates.
 */
export interface UnitOfWork {
  /**
   * Access to all repositories within this unit of work
   */
  progressRepository: ProgressRepository;
  wordRepository: WordRepository;
  learnerRepository: LearnerRepository;
  sessionRepository: SessionRepository;

  /**
   * Begin a transaction
   */
  begin(): Promise<void>;

  /**
   * Commit all changes made within this unit of work
   */
  commit(): Promise<void>;

  /**
   * Rollback all changes made within this unit of work
   */
  rollback(): Promise<void>;

  /**
   * Execute a function within a transaction
   */
  withTransaction<T>(operation: (uow: UnitOfWork) => Promise<T>): Promise<T>;
}

/**
 * 🎯 Repository Factory Interface
 * 
 * Creates configured repository instances.
 * Implementation will be provided by infrastructure layer.
 */
export interface RepositoryFactory {
  createProgressRepository(): ProgressRepository;
  createWordRepository(): WordRepository;
  createLearnerRepository(): LearnerRepository;
  createSessionRepository(): SessionRepository;
  createUnitOfWork(): UnitOfWork;
}