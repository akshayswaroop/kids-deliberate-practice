/**
 * 🎯 Domain Service: PracticeSessionService
 * 
 * This service encapsulates the complex business logic for creating practice sessions.
 * It doesn't belong to any single entity, but coordinates between multiple domain concepts.
 * 
 * Domain Services contain business logic that:
 * - Involves multiple entities/aggregates
 * - Implements complex domain rules
 * - Coordinates domain processes
 */

import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';
import { ProgressTracker } from '../entities/ProgressTracker';
import { DomainEventFactory } from '../events/LearningEvents';
import type { DomainEventCollection } from '../events/LearningEvents';

export interface WordDrillInfo {
  id: string;
  text: string;
  complexityLevel: number;
  subject: string; // math, english, kannada, etc.
}

export interface SessionRequirements {
  learnerId: LearnerId;
  subject: string;
  complexityLevel: number;
  maxSessionSize: number;
  includeRevisionWords?: boolean; // Include mastered words ready for revision
}

export interface PracticeSession {
  selectedWordIds: WordId[];
  sessionType: 'learning' | 'revision' | 'mixed';
  totalAvailable: number;
  reasoning: string;
  events: DomainEventCollection;
}

/**
 * Domain Service for Practice Session Generation
 * 
 * Encapsulates the complex business rules around how to select words
 * for an effective learning session.
 */
export class PracticeSessionService {
  
  /**
   * 🎯 CORE BUSINESS LOGIC: Generate optimal practice session
   * 
   * This method implements sophisticated domain rules:
   * 1. Prioritize unmastered words from current complexity level
   * 2. Include revision words if needed
   * 3. Sort by learning priority (struggle words first)
   * 4. Respect session size limits
   * 5. Provide reasoning for educational transparency
   */
  generateSession(
    availableWords: WordDrillInfo[],
    progressTrackers: Map<string, ProgressTracker>, // wordId -> ProgressTracker
    requirements: SessionRequirements
  ): PracticeSession {
    
    // Filter words for the target subject and complexity level
    const relevantWords = availableWords.filter(word => 
      word.subject === requirements.subject && 
      word.complexityLevel === requirements.complexityLevel
    );

    if (relevantWords.length === 0) {
      return {
        selectedWordIds: [],
        sessionType: 'learning',
        totalAvailable: 0,
        reasoning: `No words available for ${requirements.subject} at complexity level ${requirements.complexityLevel}`,
        events: []
      };
    }

    // Categorize words by learning status
    const wordCategories = this.categorizeWordsByStatus(relevantWords, progressTrackers);
    
    // Apply business rules to select optimal session
    const selection = this.selectOptimalWords(wordCategories, requirements);
    
    // Generate domain event for session creation
    const sessionId = crypto.randomUUID();
    const sessionStartedEvent = DomainEventFactory.sessionStarted(
      requirements.learnerId,
      sessionId,
      requirements.subject,
      requirements.complexityLevel,
      selection.wordIds.length,
      selection.sessionType
    );
    
    return {
      selectedWordIds: selection.wordIds,
      sessionType: selection.sessionType,
      totalAvailable: relevantWords.length,
      reasoning: selection.reasoning,
      events: [sessionStartedEvent]
    };
  }

  /**
   * Business logic: Categorize words by their learning status
   */
  private categorizeWordsByStatus(
    words: WordDrillInfo[],
    progressTrackers: Map<string, ProgressTracker>
  ): {
    struggling: Array<{ word: WordDrillInfo; tracker: ProgressTracker }>;
    learning: Array<{ word: WordDrillInfo; tracker: ProgressTracker }>;
    mastered: Array<{ word: WordDrillInfo; tracker: ProgressTracker }>;
    revision: Array<{ word: WordDrillInfo; tracker: ProgressTracker }>;
  } {
    const categories = {
      struggling: [] as Array<{ word: WordDrillInfo; tracker: ProgressTracker }>,
      learning: [] as Array<{ word: WordDrillInfo; tracker: ProgressTracker }>,
      mastered: [] as Array<{ word: WordDrillInfo; tracker: ProgressTracker }>,
      revision: [] as Array<{ word: WordDrillInfo; tracker: ProgressTracker }>
    };

    for (const word of words) {
      const tracker = progressTrackers.get(word.id);
      if (!tracker) {
        // No progress tracked yet - create new tracker for categorization
        const newTracker = ProgressTracker.createNew(
          WordId.fromString(word.id),
          LearnerId.fromString('temp') // Will be replaced with actual learner
        );
        categories.learning.push({ word, tracker: newTracker });
        continue;
      }

      if (tracker.isMastered()) {
        if (tracker.isInCooldown()) {
          categories.mastered.push({ word, tracker });
        } else {
          categories.revision.push({ word, tracker });
        }
      } else {
        const progress = tracker.getProgress();
        if (progress === 0) {
          categories.learning.push({ word, tracker });
        } else {
          // Progress > 0 but not mastered = struggling
          categories.struggling.push({ word, tracker });
        }
      }
    }

    return categories;
  }

  /**
   * 🎯 CORE BUSINESS RULES: How to select optimal words for learning
   */
  private selectOptimalWords(
    categories: ReturnType<typeof this.categorizeWordsByStatus>,
    requirements: SessionRequirements
  ): {
    wordIds: WordId[];
    sessionType: 'learning' | 'revision' | 'mixed';
    reasoning: string;
  } {
    const selected: Array<{ word: WordDrillInfo; tracker: ProgressTracker }> = [];
    const maxSize = requirements.maxSessionSize;

    // BUSINESS RULE 1: Always prioritize struggling words (they need help!)
    const strugglingWords = this.sortByPriority(categories.struggling);
    selected.push(...strugglingWords.slice(0, maxSize));

    // BUSINESS RULE 2: Fill remaining slots with new learning words
    if (selected.length < maxSize) {
      const learningWords = this.sortByPriority(categories.learning);
      const remaining = maxSize - selected.length;
      selected.push(...learningWords.slice(0, remaining));
    }

    // BUSINESS RULE 3: Include revision words if requested and space available
    if (requirements.includeRevisionWords && selected.length < maxSize) {
      const revisionWords = this.sortByPriority(categories.revision);
      const remaining = maxSize - selected.length;
      selected.push(...revisionWords.slice(0, remaining));
    }

    // Determine session type based on composition
    let sessionType: 'learning' | 'revision' | 'mixed' = 'learning';
    const hasRevision = selected.some(s => 
      categories.revision.some(r => r.word.id === s.word.id)
    );
    const hasLearning = selected.some(s => 
      categories.learning.some(l => l.word.id === s.word.id) ||
      categories.struggling.some(st => st.word.id === s.word.id)
    );

    if (hasRevision && hasLearning) {
      sessionType = 'mixed';
    } else if (hasRevision) {
      sessionType = 'revision';
    }

    // Generate educational reasoning
    const reasoning = this.generateReasoningMessage(categories, selected, requirements);

    return {
      wordIds: selected.map(s => WordId.fromString(s.word.id)),
      sessionType,
      reasoning
    };
  }

  /**
   * Business rule: Sort words by learning priority
   * 1. Lower progress first (need more help)
   * 2. Least recently practiced first
   * 3. Alphabetical for consistency
   */
  private sortByPriority(
    items: Array<{ word: WordDrillInfo; tracker: ProgressTracker }>
  ): Array<{ word: WordDrillInfo; tracker: ProgressTracker }> {
    return items.sort((a, b) => {
      // Progress: lower first (struggling words get priority)
      const progressDiff = a.tracker.getProgress() - b.tracker.getProgress();
      if (progressDiff !== 0) return progressDiff;

      // Last practiced: older first (spread practice)
      const attemptsA = a.tracker.getAttempts();
      const attemptsB = b.tracker.getAttempts();
      const lastA = attemptsA.length > 0 ? attemptsA[attemptsA.length - 1].getTimestamp() : 0;
      const lastB = attemptsB.length > 0 ? attemptsB[attemptsB.length - 1].getTimestamp() : 0;
      const timeDiff = lastA - lastB;
      if (timeDiff !== 0) return timeDiff;

      // Alphabetical for deterministic ordering
      return a.word.text.localeCompare(b.word.text);
    });
  }

  /**
   * Generate human-readable explanation of word selection
   */
  private generateReasoningMessage(
    categories: ReturnType<typeof this.categorizeWordsByStatus>,
    selected: Array<{ word: WordDrillInfo; tracker: ProgressTracker }>,
    requirements: SessionRequirements
  ): string {
    const strugglingCount = selected.filter(s => 
      categories.struggling.some(st => st.word.id === s.word.id)
    ).length;

    const learningCount = selected.filter(s => 
      categories.learning.some(l => l.word.id === s.word.id)
    ).length;

    const revisionCount = selected.filter(s => 
      categories.revision.some(r => r.word.id === s.word.id)
    ).length;

    let reason = `Selected ${selected.length} words for ${requirements.subject} (Level ${requirements.complexityLevel}): `;
    
    const parts: string[] = [];
    if (strugglingCount > 0) parts.push(`${strugglingCount} struggling words (need help)`);
    if (learningCount > 0) parts.push(`${learningCount} new words`);
    if (revisionCount > 0) parts.push(`${revisionCount} revision words`);
    
    reason += parts.join(', ');
    
    if (selected.length === 0) {
      reason = `No words available - all words at this level are mastered and in cooldown`;
    }

    return reason;
  }

  /**
   * Check if learner should progress to next complexity level
   * 
   * Business Rule: Progress when ALL words in current level are mastered
   */
  shouldProgressToNextLevel(
    words: WordDrillInfo[],
    progressTrackers: Map<string, ProgressTracker>,
    currentComplexityLevel: number,
    subject: string
  ): boolean {
    const currentLevelWords = words.filter(w => 
      w.subject === subject && w.complexityLevel === currentComplexityLevel
    );

    if (currentLevelWords.length === 0) return false;

    // All words must be mastered to progress
    return currentLevelWords.every(word => {
      const tracker = progressTrackers.get(word.id);
      return tracker && tracker.isMastered();
    });
  }
}