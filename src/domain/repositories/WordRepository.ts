/**
 * 🎯 Domain Repository: Word Content Data Access
 * 
 * This interface defines what operations the domain needs for accessing
 * word content and drill information, separate from progress tracking.
 */

import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';

/**
 * Word drill information as needed by domain logic
 */
export interface WordDrill {
  id: string;
  text: string;
  subject: string;
  complexityLevel: number;
  category?: string;
  metadata?: Record<string, any>;
}

/**
 * Repository interface for word content and drill data
 */
export interface WordRepository {
  /**
   * Find a specific word drill by ID
   */
  findById(wordId: WordId): Promise<WordDrill | null>;

  /**
   * Find all words for a subject and complexity level
   */
  findBySubjectAndLevel(subject: string, complexityLevel: number): Promise<WordDrill[]>;

  /**
   * Find all words for a subject (all levels)
   */
  findBySubject(subject: string): Promise<WordDrill[]>;

  /**
   * Get all available subjects
   */
  getAvailableSubjects(): Promise<string[]>;

  /**
   * Get available complexity levels for a subject
   */
  getComplexityLevels(subject: string): Promise<number[]>;

  /**
   * Search words by text content (for practice customization)
   */
  searchByText(searchTerm: string, subject?: string): Promise<WordDrill[]>;

  /**
   * Get recommended words based on learning path
   */
  getRecommendedWords(
    learnerId: LearnerId, 
    subject: string, 
    complexityLevel: number,
    excludeWordIds?: WordId[]
  ): Promise<WordDrill[]>;

  /**
   * Get total word count for progress calculations
   */
  getWordCount(subject: string, complexityLevel?: number): Promise<number>;
}

/**
 * Repository interface for learner profile data
 */
export interface LearnerRepository {
  /**
   * Find learner profile by ID
   */
  findById(learnerId: LearnerId): Promise<LearnerProfile | null>;

  /**
   * Save learner profile
   */
  save(learnerProfile: LearnerProfile): Promise<void>;

  /**
   * Get learner preferences for personalized experience
   */
  getPreferences(learnerId: LearnerId): Promise<LearnerPreferences>;

  /**
   * Update learner preferences
   */
  updatePreferences(learnerId: LearnerId, preferences: Partial<LearnerPreferences>): Promise<void>;
}

/**
 * Learner profile information
 */
export interface LearnerProfile {
  id: string;
  name: string;
  age?: number;
  grade?: string;
  preferredSubjects: string[];
  learningGoals: string[];
  createdAt: Date;
  lastActiveAt: Date;
}

/**
 * Learner preferences for personalized learning
 */
export interface LearnerPreferences {
  maxSessionSize: number;
  preferredDifficulty: 'adaptive' | 'easy' | 'medium' | 'hard';
  enableHints: boolean;
  enableCelebrations: boolean;
  practiceReminders: boolean;
  preferredPracticeTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
  visualTheme: 'colorful' | 'minimal' | 'dark';
  soundEffects: boolean;
}