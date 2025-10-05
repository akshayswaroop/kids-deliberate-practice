/**
 * 🎯 Negative Tests: ProgressTracker
 * 
 * Tests edge cases, invalid inputs, and boundary conditions
 * to catch potential bugs in ProgressTracker domain entity.
 * 
 * Architecture principle: "Tests Buy Freedom - outcome tests + targeted internal tests"
 */

import { describe, test, expect } from 'vitest';
import { ProgressTracker } from '../entities/ProgressTracker';
import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';

describe('ProgressTracker Negative Tests', () => {
  describe('Progress Boundaries', () => {
    test('should not go below 0 progress on wrong answers', () => {
      const tracker = ProgressTracker.createNew(
        WordId.fromString('word1'),
        LearnerId.fromString('learner1')
      );

      // Record multiple wrong answers
      tracker.recordAttempt(false, Date.now());
      expect(tracker.getProgress()).toBe(0);

      tracker.recordAttempt(false, Date.now() + 1000);
      expect(tracker.getProgress()).toBe(0); // Should stay at 0

      tracker.recordAttempt(false, Date.now() + 2000);
      expect(tracker.getProgress()).toBe(0); // Still at 0
    });

    test('should cap progress at 5 on correct answers', () => {
      const tracker = ProgressTracker.createNew(
        WordId.fromString('word1'),
        LearnerId.fromString('learner1')
      );

      // Record 10 correct answers (more than max)
      for (let i = 0; i < 10; i++) {
        tracker.recordAttempt(true, Date.now() + i * 1000);
      }

      expect(tracker.getProgress()).toBe(5); // Should cap at 5
    });

    test('should handle alternating correct/wrong at boundaries', () => {
      const tracker = ProgressTracker.createNew(
        WordId.fromString('word1'),
        LearnerId.fromString('learner1')
      );

      // Start at 0, go wrong (stays 0)
      tracker.recordAttempt(false, Date.now());
      expect(tracker.getProgress()).toBe(0);

      // Go correct (now 1)
      tracker.recordAttempt(true, Date.now() + 1000);
      expect(tracker.getProgress()).toBe(1);

      // Go wrong (back to 0)
      tracker.recordAttempt(false, Date.now() + 2000);
      expect(tracker.getProgress()).toBe(0);

      // Verify no negative progress
      expect(tracker.getProgress()).toBeGreaterThanOrEqual(0);
    });

    test('should handle progress 5 followed by wrong answer', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 5, // At max
        attempts: [],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      tracker.recordAttempt(false, Date.now());
      expect(tracker.getProgress()).toBe(4); // Should decrement from max
    });
  });

  describe('Mastery Status Transitions', () => {
    test('should detect mastery at progress 2', () => {
      const tracker = ProgressTracker.createNew(
        WordId.fromString('word1'),
        LearnerId.fromString('learner1')
      );

      expect(tracker.isMastered()).toBe(false);

      tracker.recordAttempt(true, Date.now());
      expect(tracker.isMastered()).toBe(false); // progress 1

      tracker.recordAttempt(true, Date.now() + 1000);
      expect(tracker.isMastered()).toBe(true); // progress 2 = mastered
    });

    test('should lose mastery when falling below threshold', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 2, // At mastery
        attempts: [
          { timestamp: Date.now() - 2000, result: 'correct' },
          { timestamp: Date.now() - 1000, result: 'correct' }
        ],
        cooldownSessionsLeft: 3,
        masteryAchievedAt: new Date(Date.now() - 1000).toISOString(),
        revealCount: 0
      });

      expect(tracker.isMastered()).toBe(true);
      expect(tracker.getCooldownSessionsLeft()).toBe(3);

      // Record wrong answer
      const event = tracker.recordAttempt(false, Date.now());

      expect(tracker.isMastered()).toBe(false); // Lost mastery (progress 1)
      expect(tracker.getCooldownSessionsLeft()).toBe(0); // Cooldown reset
      expect(event?.getEventType()).toBe('mastery-lost');
    });

    test('should not trigger mastery event if already mastered', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 3, // Already mastered
        attempts: [],
        cooldownSessionsLeft: 2,
        masteryAchievedAt: new Date().toISOString(),
        revealCount: 0
      });

      const event = tracker.recordAttempt(true, Date.now());
      expect(event).toBeNull(); // No event for staying mastered
      expect(tracker.getProgress()).toBe(4); // Progress increased
    });
  });

  describe('Cooldown Mechanics', () => {
    test('should set cooldown to 3 when mastery achieved', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 1,
        attempts: [],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      tracker.recordAttempt(true, Date.now());
      expect(tracker.isMastered()).toBe(true);
      expect(tracker.getCooldownSessionsLeft()).toBe(3);
      expect(tracker.isInCooldown()).toBe(true);
    });

    test('should decrement cooldown correctly', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 2,
        attempts: [],
        cooldownSessionsLeft: 3,
        masteryAchievedAt: new Date().toISOString(),
        revealCount: 0
      });

      expect(tracker.isInCooldown()).toBe(true);

      tracker.decrementCooldown();
      expect(tracker.getCooldownSessionsLeft()).toBe(2);

      tracker.decrementCooldown();
      expect(tracker.getCooldownSessionsLeft()).toBe(1);

      tracker.decrementCooldown();
      expect(tracker.getCooldownSessionsLeft()).toBe(0);
      expect(tracker.isInCooldown()).toBe(false);
    });

    test('should not go below 0 cooldown sessions', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 2,
        attempts: [],
        cooldownSessionsLeft: 0,
        masteryAchievedAt: new Date().toISOString(),
        revealCount: 0
      });

      tracker.decrementCooldown();
      expect(tracker.getCooldownSessionsLeft()).toBe(0); // Should stay at 0

      tracker.decrementCooldown();
      expect(tracker.getCooldownSessionsLeft()).toBe(0);
    });
  });

  describe('Parent Guidance Edge Cases', () => {
    test('should provide initial guidance with no attempts', () => {
      const tracker = ProgressTracker.createNew(
        WordId.fromString('word1'),
        LearnerId.fromString('learner1')
      );

      const guidance = tracker.getParentGuidance();
      expect(guidance.context).toBe('initial');
      expect(guidance.message).toBe('Ready when you are');
      expect(guidance.urgency).toBe('info');
    });

    test('should provide struggling guidance with high reveal count', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 0,
        attempts: [],
        cooldownSessionsLeft: 0,
        revealCount: 5 // High reveal count
      });

      const guidance = tracker.getParentGuidance();
      expect(guidance.context).toBe('struggling');
      expect(guidance.urgency).toBe('info'); // Changed from 'warning' to match new implementation
    });

    test('should provide correct guidance after many failed attempts', () => {
      const tracker = ProgressTracker.createNew(
        WordId.fromString('word1'),
        LearnerId.fromString('learner1')
      );

      // Record 5 wrong attempts (low accuracy)
      for (let i = 0; i < 5; i++) {
        tracker.recordAttempt(false, Date.now() + i * 1000);
      }

      const guidance = tracker.getParentGuidance();
      expect(guidance.urgency).toBe('warning'); // Low accuracy returns warning
      expect(guidance.context).toMatch(/needs-practice|struggling|retry-needed/);
    });

    test('should maintain guidance consistency at boundaries', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 2, // Exactly at mastery
        attempts: [
          { timestamp: Date.now() - 2000, result: 'correct' },
          { timestamp: Date.now() - 1000, result: 'correct' }
        ],
        cooldownSessionsLeft: 3,
        masteryAchievedAt: new Date().toISOString(),
        revealCount: 0
      });

      const guidance = tracker.getParentGuidance();
      expect(guidance.context).toBe('mastered');
      expect(guidance.urgency).toBe('success');
    });
  });

  describe('Turnaround Detection', () => {
    test('should not be turnaround with no wrong attempts', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 3,
        attempts: [
          { timestamp: Date.now() - 3000, result: 'correct' },
          { timestamp: Date.now() - 2000, result: 'correct' },
          { timestamp: Date.now() - 1000, result: 'correct' }
        ],
        cooldownSessionsLeft: 0,
        masteryAchievedAt: new Date().toISOString(),
        revealCount: 0
      });

      expect(tracker.isMastered()).toBe(true);
      expect(tracker.isTurnaround()).toBe(false); // No wrong attempts
    });

    test('should be turnaround with recovery after failure', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 2,
        attempts: [
          { timestamp: Date.now() - 4000, result: 'wrong' },
          { timestamp: Date.now() - 3000, result: 'wrong' },
          { timestamp: Date.now() - 2000, result: 'correct' },
          { timestamp: Date.now() - 1000, result: 'correct' }
        ],
        cooldownSessionsLeft: 3,
        masteryAchievedAt: new Date().toISOString(),
        revealCount: 0
      });

      expect(tracker.isMastered()).toBe(true);
      expect(tracker.isTurnaround()).toBe(true); // Has wrong then mastered
    });

    test('should not be turnaround if not mastered yet', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 1, // Not mastered
        attempts: [
          { timestamp: Date.now() - 2000, result: 'wrong' },
          { timestamp: Date.now() - 1000, result: 'correct' }
        ],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      expect(tracker.isMastered()).toBe(false);
      expect(tracker.isTurnaround()).toBe(false);
    });
  });

  describe('Data Persistence Edge Cases', () => {
    test('should handle missing optional fields in fromData', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 1,
        attempts: [],
        cooldownSessionsLeft: 0
        // Missing masteryAchievedAt and revealCount
      });

      expect(tracker.getProgress()).toBe(1);
      expect(tracker.getRevealCount()).toBe(0);
      expect(tracker.getMasteryAchievedAt()).toBeUndefined();
    });

    test('should serialize and deserialize correctly', () => {
      const original = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 3,
        attempts: [
          { timestamp: Date.now() - 1000, result: 'correct' }
        ],
        cooldownSessionsLeft: 2,
        masteryAchievedAt: new Date().toISOString(),
        revealCount: 1
      });

      const data = original.toData();
      const restored = ProgressTracker.fromData(data);

      expect(restored.getProgress()).toBe(original.getProgress());
      expect(restored.getCooldownSessionsLeft()).toBe(original.getCooldownSessionsLeft());
      expect(restored.getRevealCount()).toBe(original.getRevealCount());
      expect(restored.isMastered()).toBe(original.isMastered());
    });

    test('should handle empty attempts array', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 0,
        attempts: [], // Empty
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      expect(tracker.getAttempts().length).toBe(0);
      const guidance = tracker.getParentGuidance();
      expect(guidance.context).toBe('initial');
    });
  });

  describe('Reveal Count Tracking', () => {
    test('should increment reveal count', () => {
      const tracker = ProgressTracker.createNew(
        WordId.fromString('word1'),
        LearnerId.fromString('learner1')
      );

      expect(tracker.getRevealCount()).toBe(0);

      tracker.recordReveal();
      expect(tracker.getRevealCount()).toBe(1);

      tracker.recordReveal();
      expect(tracker.getRevealCount()).toBe(2);

      tracker.recordReveal();
      expect(tracker.getRevealCount()).toBe(3);
    });

    test('should affect guidance when reveal count is high', () => {
      const tracker = ProgressTracker.createNew(
        WordId.fromString('word1'),
        LearnerId.fromString('learner1')
      );

      // Record 3 reveals
      tracker.recordReveal();
      tracker.recordReveal();
      tracker.recordReveal();

      const guidance = tracker.getParentGuidance();
      expect(guidance.context).toBe('struggling');
      expect(guidance.urgency).toBe('info'); // Changed to match reassuring tone
    });
  });
});
