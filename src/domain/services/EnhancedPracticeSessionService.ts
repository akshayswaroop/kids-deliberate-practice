/**
 * 🎯 Enhanced Practice Session Service with Repository Dependencies
 * 
 * This demonstrates how domain services use repository interfaces
 * for data access while maintaining domain logic focus.
 */

import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';
import { ProgressTracker } from '../entities/ProgressTracker';
import { DomainEventFactory } from '../events/LearningEvents';
import type { DomainEventCollection } from '../events/LearningEvents';
import type { WordRepository, ProgressRepository } from '../repositories';

export interface EnhancedSessionRequirements {
  learnerId: LearnerId;
  subject: string;
  complexityLevel: number;
  maxSessionSize: number;
  includeRevisionWords?: boolean;
  excludeWordIds?: WordId[];
}

export interface EnhancedPracticeSession {
  selectedWordIds: WordId[];
  sessionType: 'learning' | 'revision' | 'mixed';
  reasoning: string;
  events: DomainEventCollection;
  estimatedDuration: number; // minutes
  recommendedBreakAfter?: number; // questions
}

/**
 * Enhanced Practice Session Service with repository dependencies
 */
export class EnhancedPracticeSessionService {
  private wordRepository: WordRepository;
  private progressRepository: ProgressRepository;

  constructor(
    wordRepository: WordRepository,
    progressRepository: ProgressRepository
  ) {
    this.wordRepository = wordRepository;
    this.progressRepository = progressRepository;
  }

  /**
   * Generate a practice session using repository data access
   */
  async generateSessionFromRepositories(
    requirements: EnhancedSessionRequirements
  ): Promise<EnhancedPracticeSession> {
    
    // 1. Load available words from repository
    const availableWords = await this.wordRepository.findBySubjectAndLevel(
      requirements.subject,
      requirements.complexityLevel
    );

    if (availableWords.length === 0) {
      return this.createEmptySession(requirements, 'No words available for this subject and level');
    }

    // 2. Load progress data for all words
    const wordIds = availableWords.map(w => WordId.fromString(w.id));
    const progressMap = await this.progressRepository.findByWordsAndLearner(
      wordIds,
      requirements.learnerId
    );

    // 3. Apply domain business rules for optimal session
    const sessionStrategy = this.determineSessionStrategy(availableWords, progressMap, requirements);
    
    // 4. Generate domain events
    const sessionId = crypto.randomUUID();
    const sessionStartedEvent = DomainEventFactory.sessionStarted(
      requirements.learnerId,
      sessionId,
      requirements.subject,
      requirements.complexityLevel,
      sessionStrategy.selectedWords.length,
      sessionStrategy.sessionType
    );

    return {
      selectedWordIds: sessionStrategy.selectedWords.map(w => WordId.fromString(w.id)),
      sessionType: sessionStrategy.sessionType,
      reasoning: sessionStrategy.reasoning,
      events: [sessionStartedEvent],
      estimatedDuration: this.estimateSessionDuration(sessionStrategy.selectedWords.length),
      recommendedBreakAfter: this.calculateBreakPoint(sessionStrategy.selectedWords.length)
    };
  }

  /**
   * Get learning statistics for a learner
   */
  async getLearningStatistics(learnerId: LearnerId) {
    return await this.progressRepository.getStatistics(learnerId);
  }

  /**
   * Check if learner should progress to next level
   */
  async shouldProgressToNextLevel(
    learnerId: LearnerId,
    subject: string,
    currentLevel: number
  ): Promise<boolean> {
    const masteredWords = await this.progressRepository.findMasteredByLearnerAndSubject(
      learnerId,
      subject
    );

    const totalWordsInLevel = await this.wordRepository.getWordCount(subject, currentLevel);
    const masteredInCurrentLevel = masteredWords.filter(
      tracker => tracker.getProgress() >= 2 // Business rule: mastery threshold
    ).length;

    // Business rule: Progress when 80% of level is mastered
    return masteredInCurrentLevel >= (totalWordsInLevel * 0.8);
  }

  /**
   * Private: Determine optimal session strategy
   */
  private determineSessionStrategy(
    availableWords: any[],
    progressMap: Map<string, ProgressTracker>,
    requirements: EnhancedSessionRequirements
  ) {
    // Filter out excluded words
    const eligibleWords = requirements.excludeWordIds 
      ? availableWords.filter(w => !requirements.excludeWordIds!.some(id => id.toString() === w.id))
      : availableWords;

    // Categorize words by learning status
    const strugglingWords = eligibleWords.filter(w => {
      const tracker = progressMap.get(w.id);
      return tracker && tracker.getProgress() === 1; // Struggling
    });

    const newWords = eligibleWords.filter(w => !progressMap.has(w.id));

    const revisionWords = requirements.includeRevisionWords 
      ? eligibleWords.filter(w => {
          const tracker = progressMap.get(w.id);
          return tracker && tracker.isMastered() && tracker.getCooldownSessionsLeft() === 0;
        })
      : [];

    // Apply learning algorithm
    const selectedWords = [];
    let sessionType: 'learning' | 'revision' | 'mixed' = 'learning';

    // Priority 1: Struggling words (need immediate attention)
    selectedWords.push(...strugglingWords.slice(0, Math.min(2, requirements.maxSessionSize)));

    // Priority 2: Revision words (if requested and space available)
    const remainingSlots = requirements.maxSessionSize - selectedWords.length;
    if (revisionWords.length > 0 && remainingSlots > 0) {
      selectedWords.push(...revisionWords.slice(0, Math.min(1, remainingSlots)));
      sessionType = selectedWords.length === revisionWords.length ? 'revision' : 'mixed';
    }

    // Priority 3: New words (fill remaining slots)
    const finalSlots = requirements.maxSessionSize - selectedWords.length;
    if (finalSlots > 0) {
      selectedWords.push(...newWords.slice(0, finalSlots));
    }

    const reasoning = this.generateReasoning(
      selectedWords.length,
      strugglingWords.length,
      newWords.length,
      revisionWords.length,
      requirements
    );

    return {
      selectedWords,
      sessionType,
      reasoning
    };
  }

  private createEmptySession(
    _requirements: EnhancedSessionRequirements, 
    reason: string
  ): EnhancedPracticeSession {
    return {
      selectedWordIds: [],
      sessionType: 'learning',
      reasoning: reason,
      events: [],
      estimatedDuration: 0,
      recommendedBreakAfter: undefined
    };
  }

  private estimateSessionDuration(wordCount: number): number {
    // Business rule: Average 1.5 minutes per word
    return Math.ceil(wordCount * 1.5);
  }

  private calculateBreakPoint(wordCount: number): number | undefined {
    // Business rule: Recommend break after 10 questions for focus
    return wordCount > 10 ? 10 : undefined;
  }

  private generateReasoning(
    totalSelected: number,
    strugglingCount: number,
    newCount: number,
    revisionCount: number,
    requirements: EnhancedSessionRequirements
  ): string {
    const parts = [`Selected ${totalSelected} words for ${requirements.subject} (Level ${requirements.complexityLevel})`];
    
    if (strugglingCount > 0) {
      parts.push(`${strugglingCount} struggling words (need help)`);
    }
    if (newCount > 0) {
      parts.push(`${newCount} new words`);
    }
    if (revisionCount > 0) {
      parts.push(`${revisionCount} revision words`);
    }

    return parts.join(': ');
  }
}