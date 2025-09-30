/**
 * 🧪 Learning Test: Domain Service
 * 
 * This test demonstrates how domain services encapsulate complex business logic
 * that involves multiple entities and implements sophisticated domain rules.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { PracticeSessionService } from '../services/PracticeSessionService';
import type { WordDrillInfo, SessionRequirements } from '../services/PracticeSessionService';
import { ProgressTracker } from '../entities/ProgressTracker';
import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';

describe('PracticeSessionService (Domain Service)', () => {
  let sessionService: PracticeSessionService;
  let learnerId: LearnerId;

  beforeEach(() => {
    sessionService = new PracticeSessionService();
    learnerId = LearnerId.fromString('learner_123');
  });

  test('should prioritize struggling words over new words', () => {
    // Arrange - Set up words with different progress levels
    const words: WordDrillInfo[] = [
      { id: 'word_new', text: 'new_word', complexityLevel: 1, subject: 'math' },
      { id: 'word_struggling', text: 'struggling_word', complexityLevel: 1, subject: 'math' },
      { id: 'word_another_new', text: 'another_new', complexityLevel: 1, subject: 'math' }
    ];

    const progressTrackers = new Map<string, ProgressTracker>();
    
    // Create struggling word (has some progress but not mastered)
    const strugglingTracker = ProgressTracker.createNew(
      WordId.fromString('word_struggling'),
      learnerId
    );
    strugglingTracker.recordAttempt(true); // progress = 1 (struggling)
    progressTrackers.set('word_struggling', strugglingTracker);

    // New words have no trackers (will be created as needed)

    const requirements: SessionRequirements = {
      learnerId,
      subject: 'math',
      complexityLevel: 1,
      maxSessionSize: 2
    };

    // Act
    const session = sessionService.generateSession(words, progressTrackers, requirements);

    // Assert - Struggling word should be prioritized
    expect(session.selectedWordIds).toHaveLength(2);
    expect(session.selectedWordIds[0].toString()).toBe('word_struggling'); // First priority
    expect(session.sessionType).toBe('learning');
    expect(session.reasoning).toContain('1 struggling words');
    expect(session.reasoning).toContain('1 new words');
  });

  test('should include revision words when requested', () => {
    // Arrange - Set up mastered word ready for revision
    const words: WordDrillInfo[] = [
      { id: 'word_new', text: 'new_word', complexityLevel: 1, subject: 'math' },
      { id: 'word_mastered', text: 'mastered_word', complexityLevel: 1, subject: 'math' }
    ];

    const progressTrackers = new Map<string, ProgressTracker>();
    
    // Create mastered word that's out of cooldown (ready for revision)
    const masteredTracker = ProgressTracker.createNew(
      WordId.fromString('word_mastered'),
      learnerId
    );
    masteredTracker.recordAttempt(true); // progress = 1
    masteredTracker.recordAttempt(true); // progress = 2 (mastered!)
    
    // Simulate cooldown completion
    masteredTracker.decrementCooldown();
    masteredTracker.decrementCooldown();
    masteredTracker.decrementCooldown(); // Should be out of cooldown now
    
    progressTrackers.set('word_mastered', masteredTracker);

    const requirements: SessionRequirements = {
      learnerId,
      subject: 'math',
      complexityLevel: 1,
      maxSessionSize: 2,
      includeRevisionWords: true
    };

    // Act
    const session = sessionService.generateSession(words, progressTrackers, requirements);

    // Assert - Should include both new and revision words
    expect(session.selectedWordIds).toHaveLength(2);
    expect(session.sessionType).toBe('mixed');
    expect(session.reasoning).toContain('revision words');
  });

  test('should respect complexity level filtering', () => {
    // Arrange - Words from different complexity levels
    const words: WordDrillInfo[] = [
      { id: 'word_level1', text: 'easy_word', complexityLevel: 1, subject: 'math' },
      { id: 'word_level2', text: 'hard_word', complexityLevel: 2, subject: 'math' }
    ];

    const requirements: SessionRequirements = {
      learnerId,
      subject: 'math',
      complexityLevel: 1, // Only level 1
      maxSessionSize: 5
    };

    // Act
    const session = sessionService.generateSession(words, new Map(), requirements);

    // Assert - Should only include level 1 words
    expect(session.selectedWordIds).toHaveLength(1);
    expect(session.selectedWordIds[0].toString()).toBe('word_level1');
  });

  test('should respect subject filtering', () => {
    // Arrange - Words from different subjects
    const words: WordDrillInfo[] = [
      { id: 'math_word', text: '2x3', complexityLevel: 1, subject: 'math' },
      { id: 'english_word', text: 'cat', complexityLevel: 1, subject: 'english' }
    ];

    const requirements: SessionRequirements = {
      learnerId,
      subject: 'math', // Only math
      complexityLevel: 1,
      maxSessionSize: 5
    };

    // Act
    const session = sessionService.generateSession(words, new Map(), requirements);

    // Assert - Should only include math words
    expect(session.selectedWordIds).toHaveLength(1);
    expect(session.selectedWordIds[0].toString()).toBe('math_word');
  });

  test('should determine when to progress to next level', () => {
    // Arrange - All level 1 math words
    const words: WordDrillInfo[] = [
      { id: 'math1', text: '2x2', complexityLevel: 1, subject: 'math' },
      { id: 'math2', text: '2x3', complexityLevel: 1, subject: 'math' },
      { id: 'english1', text: 'cat', complexityLevel: 1, subject: 'english' } // Different subject
    ];

    const progressTrackers = new Map<string, ProgressTracker>();
    
    // Master all math words
    for (const word of words.filter(w => w.subject === 'math')) {
      const tracker = ProgressTracker.createNew(WordId.fromString(word.id), learnerId);
      tracker.recordAttempt(true); // progress = 1
      tracker.recordAttempt(true); // progress = 2 (mastered)
      progressTrackers.set(word.id, tracker);
    }

    // Act
    const shouldProgress = sessionService.shouldProgressToNextLevel(
      words,
      progressTrackers,
      1, // current level
      'math'
    );

    // Assert - Should progress since all math level 1 words are mastered
    expect(shouldProgress).toBe(true);
  });

  test('should provide meaningful reasoning messages', () => {
    // Arrange - Mixed scenario
    const words: WordDrillInfo[] = [
      { id: 'new1', text: 'new1', complexityLevel: 1, subject: 'math' },
      { id: 'new2', text: 'new2', complexityLevel: 1, subject: 'math' },
      { id: 'struggling1', text: 'struggling1', complexityLevel: 1, subject: 'math' }
    ];

    const progressTrackers = new Map<string, ProgressTracker>();
    const strugglingTracker = ProgressTracker.createNew(
      WordId.fromString('struggling1'),
      learnerId
    );
    strugglingTracker.recordAttempt(true); // progress = 1 (struggling)
    progressTrackers.set('struggling1', strugglingTracker);

    const requirements: SessionRequirements = {
      learnerId,
      subject: 'math',
      complexityLevel: 1,
      maxSessionSize: 2
    };

    // Act
    const session = sessionService.generateSession(words, progressTrackers, requirements);

    // Assert - Reasoning should be educational and clear
    expect(session.reasoning).toContain('Selected 2 words for math (Level 1)');
    expect(session.reasoning).toContain('1 struggling words (need help)');
    expect(session.reasoning).toContain('1 new words');
  });
});

/**
 * 🎓 LEARNING MOMENT: What makes this a Domain Service?
 * 
 * Compare this to the OLD scattered approach:
 * 
 * // ❌ OLD: Logic scattered across multiple files
 * // In selectors.ts: filtering logic
 * // In actions.ts: orchestration logic  
 * // In sessionGen.ts: sorting logic
 * // In reducers: state mutation logic
 * 
 * // ✅ NEW: All session generation logic in one domain service
 * const session = sessionService.generateSession(words, trackers, requirements);
 * 
 * Domain Service characteristics:
 * 1. **Stateless**: No internal state, pure business logic
 * 2. **Coordinates**: Works with multiple entities (words, progress trackers)
 * 3. **Domain Knowledge**: Implements complex business rules about learning
 * 4. **Educational**: Provides reasoning for transparency
 * 5. **Testable**: Business logic tested in isolation
 * 
 * Benefits:
 * - All session generation rules in one place
 * - Easy to modify business rules
 * - Clear separation from infrastructure concerns
 * - Highly testable domain logic
 * - Educational transparency (reasoning messages)
 */