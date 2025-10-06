/**
 * 🎯 Rich Domain Entity: ProgressTracker
 * 
 * This entity encapsulates ALL business logic around word mastery progression.
 * Instead of having business rules scattered across selectors and reducers,
 * the domain entity itself knows how to manage its state.
 * 
 * DDD Principle: "Tell, Don't Ask" - instead of asking an entity for its data
 * and calculating outside, we tell the entity what happened and let it decide.
 */

import { Attempt } from '../value-objects/Attempt';
import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';
import { MasteryEvent } from '../events/MasteryEvent';

/**
 * Parent guidance value object
 * 
 * Represents the coaching message parents should see to guide their child.
 * This is a domain concept - the system "knows" what message is appropriate
 * based on learning progress state.
 */
export interface ParentGuidance {
  /** The message text to display to the parent */
  message: string;
  /** Urgency level affects visual styling (success=green, warning=orange, info=blue) */
  urgency: 'success' | 'warning' | 'info';
  /** Context identifier for analytics/testing - not displayed to user */
  context: string;
}

export class ProgressTracker {
  private wordId: WordId;
  private learnerId: LearnerId;
  private progress: number; // 0-5, using our ubiquitous language term "progress"
  private attempts: Attempt[];
  private cooldownSessionsLeft: number;
  private masteryAchievedAt?: Date;
  private revealCount: number;

  private constructor(
    wordId: WordId,
    learnerId: LearnerId,
    progress: number,
    attempts: Attempt[],
    cooldownSessionsLeft: number,
    masteryAchievedAt?: Date,
    revealCount: number = 0
  ) {
    this.wordId = wordId;
    this.learnerId = learnerId;
    this.progress = progress;
    this.attempts = attempts;
    this.cooldownSessionsLeft = cooldownSessionsLeft;
    this.masteryAchievedAt = masteryAchievedAt;
    this.revealCount = revealCount;
  }

  /**
   * Factory method to create a new ProgressTracker for an unlearned word
   */
  static createNew(wordId: WordId, learnerId: LearnerId): ProgressTracker {
    return new ProgressTracker(
      wordId,
      learnerId,
      0, // Start with no progress
      [],
      0, // No cooldown initially
      undefined, // Not mastered yet
      0 // No reveals yet
    );
  }

  /**
   * Factory method to recreate from persistence data
   */
  static fromData(data: {
    wordId: string;
    learnerId: string;
    progress: number;
    attempts: Array<{ timestamp: number; result: 'correct' | 'wrong' }>;
    cooldownSessionsLeft: number;
    masteryAchievedAt?: string;
    revealCount?: number;
  }): ProgressTracker {
    return new ProgressTracker(
      WordId.fromString(data.wordId),
      LearnerId.fromString(data.learnerId),
      data.progress,
      data.attempts.map(a => Attempt.fromData(a)),
      data.cooldownSessionsLeft,
      data.masteryAchievedAt ? new Date(data.masteryAchievedAt) : undefined,
      data.revealCount || 0
    );
  }

  /**
   * 🎯 CORE BUSINESS LOGIC: Record an attempt and update progress
   * 
   * This method encapsulates the business rules:
   * - Correct answer → +1 progress (max 5)
   * - Wrong answer → -1 progress (min 0)
   * - Progress ≥ 2 = Mastered
   * - Mastery triggers cooldown period
   */
  recordAttempt(correct: boolean, timestamp: number): MasteryEvent | null {
    const attempt = Attempt.create(correct, timestamp);
    this.attempts.push(attempt);

    const wasAlreadyMastered = this.isMastered();

    // Apply progress change based on our domain rules
    if (correct) {
      this.progress = Math.min(5, this.progress + 1);
    } else {
      this.progress = Math.max(0, this.progress - 1);
    }

    // Check if mastery status changed
    const isNowMastered = this.isMastered();
    
    if (!wasAlreadyMastered && isNowMastered) {
      // Just achieved mastery!
      this.masteryAchievedAt = new Date(timestamp);
      this.cooldownSessionsLeft = 3; // Business rule: 3 sessions cooldown
      
      return MasteryEvent.masteryAchieved(this.wordId, this.learnerId, this.progress);
    }

    if (wasAlreadyMastered && !isNowMastered) {
      // Lost mastery (rare but possible)
      this.masteryAchievedAt = undefined;
      this.cooldownSessionsLeft = 0;
      
      return MasteryEvent.masteryLost(this.wordId, this.learnerId, this.progress);
    }

    return null; // No mastery status change
  }

  /**
   * 🎯 CORE BUSINESS RULE: What constitutes mastery?
   * 
   * Using our ubiquitous language: progress ≥ 2 = mastered
   */
  isMastered(): boolean {
    return this.progress >= 2;
  }

  /**
   * 🎯 BUSINESS RULE: Is this word in cooldown period?
   */
  isInCooldown(): boolean {
    return this.isMastered() && this.cooldownSessionsLeft > 0;
  }

  /**
   * 🎯 BUSINESS LOGIC: Decrement cooldown after a session
   */
  decrementCooldown(): void {
    if (this.cooldownSessionsLeft > 0) {
      this.cooldownSessionsLeft--;
    }
  }

  /**
   * Track when user reveals the answer (for analytics)
   */
  recordReveal(): void {
    this.revealCount++;
  }

  // 📊 Query methods (read-only access to state)
  getProgress(): number {
    return this.progress;
  }

  getWordId(): WordId {
    return this.wordId;
  }

  getLearnerId(): LearnerId {
    return this.learnerId;
  }

  getCooldownSessionsLeft(): number {
    return this.cooldownSessionsLeft;
  }

  getRevealCount(): number {
    return this.revealCount;
  }

  getAttempts(): readonly Attempt[] {
    return [...this.attempts]; // Return copy to maintain encapsulation
  }

  getMasteryAchievedAt(): Date | undefined {
    return this.masteryAchievedAt;
  }

  /**
   * 🎯 BUSINESS LOGIC: Check if this word is a "turnaround"
   * 
   * A turnaround means the child once got the word wrong but later mastered it.
   * This shows growth and resilience.
   * 
   * Business rule: Must have at least one wrong attempt AND be currently mastered.
   */
  isTurnaround(): boolean {
    if (!this.isMastered()) {
      return false; // Not mastered yet
    }
    
    if (this.attempts.length === 0) {
      return false; // No attempts yet
    }

    // Check if there's at least one wrong attempt in history
    return this.attempts.some(attempt => !attempt.isCorrect());
  }

  /**
   * 🎯 BUSINESS LOGIC: Get parent guidance message
   * 
   * Returns contextual coaching message for parents based on the child's
   * CURRENT progress state (from Redux/domain state).
   * 
   * This follows trace-based architecture: read current state, return guidance.
   * No temporal coupling, no predictive logic, single source of truth.
   * 
   * Business rules:
   * - Uses progress (step) and attempts array as source of truth
   * - Most recent attempt determines context (correct/wrong feedback)
   * - progress 2+: at or approaching mastery
   * - High reveal count: struggling, needs different approach
   * 
   * @returns ParentGuidance with message and urgency level
   */
  getParentGuidance(): ParentGuidance {
    const totalAttempts = this.attempts.length;
    const correctCount = this.attempts.filter(a => a.isCorrect()).length;
    const accuracyRate = totalAttempts > 0 ? correctCount / totalAttempts : 0;
    
    // Check most recent attempt for contextual feedback
    const lastAttempt = totalAttempts > 0 ? this.attempts[totalAttempts - 1] : null;

    // Context: Most recent attempt was correct
    if (lastAttempt?.isCorrect()) {
      if (this.progress >= 2) {
        // At or beyond mastery threshold
        return {
          message: 'Great work — this one is mastered',
          urgency: 'success',
          context: 'mastered'
        };
      }
      if (totalAttempts === 1) {
        // First attempt and it was correct
        return {
          message: 'Nice start! One more time to lock it in',
          urgency: 'success',
          context: 'first-success'
        };
      }
      // General correct answer - progress toward mastery
      if (this.progress === 1) {
        return {
          message: 'Two correct in a row! We\'ll mark it mastered soon',
          urgency: 'success',
          context: 'correct-progress'
        };
      }
      return {
        message: 'Good! One more correct will master this',
        urgency: 'success',
        context: 'correct-progress'
      };
    }

    // Context: Most recent attempt was wrong
    if (lastAttempt && !lastAttempt.isCorrect()) {
      if (totalAttempts === 1) {
        // First attempt was wrong
        return {
          message: 'Let\'s try this together — show them first',
          urgency: 'info',
          context: 'first-attempt-wrong'
        };
      }
      if (accuracyRate < 0.4) {
        // Low accuracy indicates struggle
        return {
          message: 'This one\'s been tricky before — let\'s try again slowly',
          urgency: 'warning',
          context: 'needs-practice'
        };
      }
      // General wrong answer
      return {
        message: 'Not quite — give it another try',
        urgency: 'info',
        context: 'retry-needed'
      };
    }

    // Context: No attempts yet (or between questions)
    if (this.revealCount >= 3) {
      return {
        message: 'We\'ll bring this one back later for review',
        urgency: 'info',
        context: 'struggling'
      };
    }
    
    if (totalAttempts === 0) {
      return {
        message: 'Ready when you are',
        urgency: 'info',
        context: 'initial'
      };
    }

    // Performance-based feedback (when no recent attempt context)
    if (totalAttempts >= 2 && accuracyRate > 0.8) {
      return {
        message: 'Steady progress — keep going',
        urgency: 'success',
        context: 'strong-performance'
      };
    }

    if (totalAttempts >= 2 && accuracyRate < 0.4) {
      return {
        message: 'Still forming the memory — we\'ll practice more',
        urgency: 'info',
        context: 'weak-performance'
      };
    }

    // Default: building mastery
    return {
      message: 'Working on it',
      urgency: 'info',
      context: 'in-progress'
    };
  }

  /**
   * Convert to plain data for persistence
   */
  toData(): {
    wordId: string;
    learnerId: string;
    progress: number;
    attempts: Array<{ timestamp: number; result: 'correct' | 'wrong' }>;
    cooldownSessionsLeft: number;
    masteryAchievedAt?: string;
    revealCount: number;
  } {
    return {
      wordId: this.wordId.toString(),
      learnerId: this.learnerId.toString(),
      progress: this.progress,
      attempts: this.attempts.map(a => a.toData()),
      cooldownSessionsLeft: this.cooldownSessionsLeft,
      masteryAchievedAt: this.masteryAchievedAt?.toISOString(),
      revealCount: this.revealCount,
    };
  }
}
