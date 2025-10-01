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
  recordAttempt(correct: boolean): MasteryEvent | null {
    const attempt = Attempt.create(correct);
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
      this.masteryAchievedAt = new Date();
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