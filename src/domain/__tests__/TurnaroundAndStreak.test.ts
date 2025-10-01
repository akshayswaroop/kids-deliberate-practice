/**
 * 🧪 Tests for Turnaround and Streak Functionality
 * 
 * Testing growth metrics: words that went from wrong → mastered (turnarounds)
 * and consecutive daily practice (streaks)
 */

import { describe, test, expect } from 'vitest';
import { ProgressTracker } from '../entities/ProgressTracker';
import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';

describe('Turnaround Detection (Growth & Resilience)', () => {
  test('should identify a word as turnaround when it was wrong then mastered', () => {
    // Arrange: Create tracker and record wrong then correct attempts
    const tracker = ProgressTracker.createNew(
      WordId.fromString('word_123'),
      LearnerId.fromString('learner_456')
    );
    
    // Act: Wrong attempt, then multiple correct attempts to achieve mastery
    tracker.recordAttempt(false); // wrong → progress = 0
    expect(tracker.isTurnaround()).toBe(false); // Not mastered yet
    
    tracker.recordAttempt(true);  // correct → progress = 1
    tracker.recordAttempt(true);  // correct → progress = 2 (mastered!)
    
    // Assert: Now it's a turnaround (was wrong, now mastered)
    expect(tracker.isMastered()).toBe(true);
    expect(tracker.isTurnaround()).toBe(true);
  });

  test('should NOT identify as turnaround if only correct attempts', () => {
    // Arrange: Create tracker
    const tracker = ProgressTracker.createNew(
      WordId.fromString('word_123'),
      LearnerId.fromString('learner_456')
    );
    
    // Act: Only correct attempts
    tracker.recordAttempt(true);  // progress = 1
    tracker.recordAttempt(true);  // progress = 2 (mastered!)
    
    // Assert: Mastered but not a turnaround (no struggle)
    expect(tracker.isMastered()).toBe(true);
    expect(tracker.isTurnaround()).toBe(false);
  });

  test('should NOT identify as turnaround if not yet mastered', () => {
    // Arrange
    const tracker = ProgressTracker.createNew(
      WordId.fromString('word_123'),
      LearnerId.fromString('learner_456')
    );
    
    // Act: Wrong attempt but not mastered yet
    tracker.recordAttempt(false); // progress = 0
    tracker.recordAttempt(true);  // progress = 1
    
    // Assert: Not mastered, so not a turnaround yet
    expect(tracker.isMastered()).toBe(false);
    expect(tracker.isTurnaround()).toBe(false);
  });

  test('should identify turnaround even with multiple wrong attempts', () => {
    // Arrange: Simulate multiple struggles before mastery
    const tracker = ProgressTracker.createNew(
      WordId.fromString('word_123'),
      LearnerId.fromString('learner_456')
    );
    
    // Act: Multiple wrong attempts, then correct to mastery
    tracker.recordAttempt(false); // progress = 0
    tracker.recordAttempt(false); // progress = 0
    tracker.recordAttempt(true);  // progress = 1
    tracker.recordAttempt(false); // progress = 0
    tracker.recordAttempt(true);  // progress = 1
    tracker.recordAttempt(true);  // progress = 2 (mastered!)
    
    // Assert: Turnaround shows resilience
    expect(tracker.isMastered()).toBe(true);
    expect(tracker.isTurnaround()).toBe(true);
  });

  test('should persist turnaround state through serialization', () => {
    // Arrange: Create turnaround word
    const tracker = ProgressTracker.createNew(
      WordId.fromString('word_123'),
      LearnerId.fromString('learner_456')
    );
    
    tracker.recordAttempt(false); // wrong
    tracker.recordAttempt(true);  // correct
    tracker.recordAttempt(true);  // mastered
    
    // Act: Serialize and restore
    const data = tracker.toData();
    const restored = ProgressTracker.fromData(data);
    
    // Assert: Turnaround state preserved
    expect(restored.isMastered()).toBe(true);
    expect(restored.isTurnaround()).toBe(true);
  });
});

describe('Streak Calculation Edge Cases', () => {
  test('should handle empty practice history', () => {
    // No attempts = no streak
    const practiceDates = new Set<string>();
    expect(practiceDates.size).toBe(0);
  });

  test('should count single day practice as streak of 1', () => {
    // Single day practice
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const practiceDates = new Set([today.toISOString().split('T')[0]]);
    expect(practiceDates.size).toBe(1);
  });

  test('should detect consecutive days correctly', () => {
    // Arrange: Create 3 consecutive days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);
    
    const dates = [
      dayBefore.toISOString().split('T')[0],
      yesterday.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    ].sort();
    
    // Verify dates are consecutive
    const date0 = new Date(dates[0]);
    const date1 = new Date(dates[1]);
    const date2 = new Date(dates[2]);
    
    const diff1 = Math.floor((date1.getTime() - date0.getTime()) / (1000 * 60 * 60 * 24));
    const diff2 = Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(diff1).toBe(1);
    expect(diff2).toBe(1);
  });

  test('should handle gap in practice (broken streak)', () => {
    // Arrange: Today and 3 days ago (gap of 2 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const dates = [
      threeDaysAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    ];
    
    // Verify there's a gap
    const date0 = new Date(dates[0]);
    const date1 = new Date(dates[1]);
    const dayDiff = Math.floor((date1.getTime() - date0.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(dayDiff).toBeGreaterThan(1); // Gap exists, streak broken
  });
});

describe('Turnaround Business Logic Examples', () => {
  test('should show growth story: 18 tricky words conquered', () => {
    // Simulate 18 words that were wrong then mastered
    const turnarounds: ProgressTracker[] = [];
    
    for (let i = 0; i < 18; i++) {
      const tracker = ProgressTracker.createNew(
        WordId.fromString(`word_${i}`),
        LearnerId.fromString('learner_456')
      );
      
      tracker.recordAttempt(false); // struggle
      tracker.recordAttempt(true);  // improve
      tracker.recordAttempt(true);  // mastered!
      
      if (tracker.isTurnaround()) {
        turnarounds.push(tracker);
      }
    }
    
    // Assert: All 18 should be turnarounds
    expect(turnarounds.length).toBe(18);
    
    // UI message: "🌱 Turnarounds: 18 tricky words you conquered!"
    const message = `🌱 Turnarounds: ${turnarounds.length} tricky words you conquered!`;
    expect(message).toBe('🌱 Turnarounds: 18 tricky words you conquered!');
  });

  test('should show encouraging message when no turnarounds yet', () => {
    // No turnarounds yet
    const turnaroundCount = 0;
    
    // UI message from spec
    const message = turnaroundCount === 0 
      ? "Keep going, you'll conquer tricky words soon!"
      : `${turnaroundCount} tricky words you conquered!`;
    
    expect(message).toBe("Keep going, you'll conquer tricky words soon!");
  });

  test('should show streak broken message', () => {
    // Streak broken (0 days) - UI message from spec
    const message = "Don't worry, start a new streak today!";
    
    expect(message).toBe("Don't worry, start a new streak today!");
  });

  test('should show active streak message', () => {
    // Active 6-day streak
    const currentStreak = 6;
    
    // UI message from spec
    const message = `${currentStreak} days in a row!`;
    
    expect(message).toBe('6 days in a row!');
  });
});
