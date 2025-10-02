/**
 * 🧪 Learning Test: Rich Domain Entity
 * 
 * This test demonstrates how our rich domain entity encapsulates business logic
 * instead of having it scattered across selectors and reducers.
 */

import { describe, test, expect } from 'vitest';
import { ProgressTracker } from '../entities/ProgressTracker';
import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';

describe('ProgressTracker (Rich Domain Entity)', () => {
  test('should start with zero progress and not be mastered', () => {
    // Arrange
    const wordId = WordId.fromString('word_123');
    const learnerId = LearnerId.fromString('learner_456');
    
    // Act
    const tracker = ProgressTracker.createNew(wordId, learnerId);
    
    // Assert
    expect(tracker.getProgress()).toBe(0);
    expect(tracker.isMastered()).toBe(false);
    expect(tracker.isInCooldown()).toBe(false);
  });

  test('should increase progress on correct answer', () => {
    // Arrange
    const tracker = ProgressTracker.createNew(
      WordId.fromString('word_123'),
      LearnerId.fromString('learner_456')
    );
    
    // Act
    const event = tracker.recordAttempt(true, Date.now()); // correct answer
    
    // Assert
    expect(tracker.getProgress()).toBe(1);
    expect(tracker.isMastered()).toBe(false); // Still not mastered (needs progress ≥ 2)
    expect(event).toBe(null); // No mastery event yet
  });

  test('should achieve mastery at progress 2 and trigger event', () => {
    // Arrange
    const tracker = ProgressTracker.createNew(
      WordId.fromString('word_123'),
      LearnerId.fromString('learner_456')
    );
    
    // Act - Get to progress 2 (mastery threshold)
    tracker.recordAttempt(true, Date.now()); // progress = 1
    const masteryEvent = tracker.recordAttempt(true, Date.now()); // progress = 2 -> MASTERY!
    
    // Assert
    expect(tracker.getProgress()).toBe(2);
    expect(tracker.isMastered()).toBe(true);
    expect(tracker.isInCooldown()).toBe(true); // Should be in cooldown now
    expect(tracker.getCooldownSessionsLeft()).toBe(3); // Business rule: 3 sessions
    
    // Should trigger mastery achieved event
    expect(masteryEvent).not.toBe(null);
    expect(masteryEvent?.getEventType()).toBe('mastery-achieved');
    expect(masteryEvent?.getNewProgress()).toBe(2);
  });

  test('should decrease progress on wrong answer', () => {
    // Arrange
    const tracker = ProgressTracker.createNew(
      WordId.fromString('word_123'),
      LearnerId.fromString('learner_456')
    );
    tracker.recordAttempt(true, Date.now()); // progress = 1
    
    // Act
    const event = tracker.recordAttempt(false, Date.now()); // wrong answer
    
    // Assert
    expect(tracker.getProgress()).toBe(0); // Back to 0
    expect(tracker.isMastered()).toBe(false);
    expect(event).toBe(null); // No mastery change event
  });

  test('should track reveal count', () => {
    // Arrange
    const tracker = ProgressTracker.createNew(
      WordId.fromString('word_123'),
      LearnerId.fromString('learner_456')
    );
    
    // Act
    tracker.recordReveal();
    tracker.recordReveal();
    
    // Assert
    expect(tracker.getRevealCount()).toBe(2);
  });

  test('should convert to/from data for persistence', () => {
    // Arrange
    const tracker = ProgressTracker.createNew(
      WordId.fromString('word_123'),
      LearnerId.fromString('learner_456')
    );
    tracker.recordAttempt(true, Date.now());
    tracker.recordAttempt(true, Date.now()); // achieve mastery
    tracker.recordReveal();
    
    // Act - Convert to persistence data
    const data = tracker.toData();
    const restored = ProgressTracker.fromData(data);
    
    // Assert - All state preserved
    expect(restored.getProgress()).toBe(2);
    expect(restored.isMastered()).toBe(true);
    expect(restored.isInCooldown()).toBe(true);
    expect(restored.getCooldownSessionsLeft()).toBe(3);
    expect(restored.getRevealCount()).toBe(1);
    expect(restored.getAttempts()).toHaveLength(2);
  });
});

/**
 * 🎓 LEARNING MOMENT: What did we just accomplish?
 * 
 * Compare this to the OLD way:
 * 
 * // ❌ OLD: Business logic scattered everywhere
 * const isMastered = (word) => word.step >= 2;  // In selectors
 * const newStep = word.step + 1;                // In reducers
 * const needsCooldown = isMastered(word);       // In more selectors
 * 
 * // ✅ NEW: Business logic encapsulated in domain entity
 * const masteryEvent = tracker.recordAttempt(true, Date.now());  // All logic inside entity
 * const isNowMastered = tracker.isMastered();        // Entity knows its own state
 * 
 * Benefits:
 * 1. Business rules are in ONE place (the entity)
 * 2. Entity is responsible for its own consistency
 * 3. Much easier to test business logic
 * 4. Domain events make state changes explicit
 * 5. Code reads like the business domain ("record attempt", "is mastered")
 */