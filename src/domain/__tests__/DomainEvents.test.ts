/**
 * 🧪 Learning Test: Domain Events System
 * 
 * This test demonstrates how domain events make business processes
 * explicit and enable event-driven architecture patterns.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { PracticeSessionService } from '../services/PracticeSessionService';
import type { WordDrillInfo, SessionRequirements } from '../services/PracticeSessionService';
import { ProgressTracker } from '../entities/ProgressTracker';
import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';
import { 
  DomainEventFactory, 
  PracticeSessionStarted
} from '../events/LearningEvents';

describe('Domain Events System', () => {
  let sessionService: PracticeSessionService;
  let learnerId: LearnerId;

  beforeEach(() => {
    sessionService = new PracticeSessionService();
    learnerId = LearnerId.fromString('learner_123');
  });

  test('should emit PracticeSessionStarted event when session is generated', () => {
    // Arrange
    const words: WordDrillInfo[] = [
      { id: 'word1', text: 'cat', complexityLevel: 1, subject: 'english' },
      { id: 'word2', text: 'dog', complexityLevel: 1, subject: 'english' }
    ];

    const requirements: SessionRequirements = {
      learnerId,
      subject: 'english',
      complexityLevel: 1,
      maxSessionSize: 2
    };

    // Act
    const session = sessionService.generateSession(words, new Map(), requirements);

    // Assert - Event should be generated
    expect(session.events).toHaveLength(1);
    
    const event = session.events[0] as PracticeSessionStarted;
    expect(event.getEventType()).toBe('practice-session-started');
    expect(event.getLearnerId().toString()).toBe('learner_123');
    expect(event.getSubject()).toBe('english');
    expect(event.getComplexityLevel()).toBe(1);
    expect(event.getWordCount()).toBe(2);
    expect(event.getSessionType()).toBe('learning');
    
    // Event should have metadata
    expect(event.getEventId()).toBeDefined();
    expect(event.getOccurredAt()).toBeInstanceOf(Date);
  });

  test('should create events with factory methods', () => {
    // Act - Create events using factory
    const sessionStarted = DomainEventFactory.sessionStarted(
      learnerId,
      'session_123',
      'math',
      2,
      5,
      'mixed'
    );

    const sessionCompleted = DomainEventFactory.sessionCompleted(
      learnerId,
      'session_123',
      4,
      5,
      180, // 3 minutes
      [WordId.fromString('word1'), WordId.fromString('word2')]
    );

    const achievement = DomainEventFactory.achievementUnlocked(
      learnerId,
      'first-mastery',
      'First Mastery!',
      'You mastered your first word!',
      'medium'
    );

    // Assert - Events should be properly constructed
    expect(sessionStarted.getEventType()).toBe('practice-session-started');
    expect(sessionStarted.getSubject()).toBe('math');
    expect(sessionStarted.getComplexityLevel()).toBe(2);

    expect(sessionCompleted.getEventType()).toBe('practice-session-completed');
    expect(sessionCompleted.getAccuracyPercentage()).toBe(80); // 4/5 = 80%
    expect(sessionCompleted.getDurationSeconds()).toBe(180);

    expect(achievement.getEventType()).toBe('achievement-unlocked');
    expect(achievement.getAchievementType()).toBe('first-mastery');
    expect(achievement.getCelebrationLevel()).toBe('medium');
  });

  test('should serialize events to JSON for persistence or transmission', () => {
    // Arrange
    const event = DomainEventFactory.sessionCompleted(
      learnerId,
      'session_123',
      3,
      4,
      120,
      [WordId.fromString('word1')]
    );

    // Act
    const json = event.toJson();

    // Assert - JSON should contain all relevant data
    expect(json).toMatchObject({
      eventType: 'practice-session-completed',
      learnerId: 'learner_123',
      sessionId: 'session_123',
      correctAnswers: 3,
      totalQuestions: 4,
      durationSeconds: 120,
      accuracyPercentage: 75,
      wordsAdvanced: ['word1']
    });

    expect(json.eventId).toBeDefined();
    expect(json.occurredAt).toBeDefined();
    expect(new Date(json.occurredAt)).toBeInstanceOf(Date);
  });

  test('should demonstrate mastery progression with events', () => {
    // Arrange - Simulate mastery progression
    const wordId = WordId.fromString('multiplication_2x3');
    const tracker = ProgressTracker.createNew(wordId, learnerId);

    // Act - Record attempts that lead to mastery
    const event1 = tracker.recordAttempt(true);  // progress = 1
    const event2 = tracker.recordAttempt(true);  // progress = 2 (mastered!)

    // Assert - Should generate mastery achievement event
    expect(event1).toBeNull(); // No mastery yet
    expect(event2).not.toBeNull(); // Mastery achieved!
    
    expect(event2!.getEventType()).toBe('mastery-achieved');
    expect(event2!.getWordId().toString()).toBe('multiplication_2x3');
    expect(event2!.getLearnerId().toString()).toBe('learner_123');
  });

  test('should enable event-driven business process tracking', () => {
    // This test demonstrates how events enable business process visibility
    
    // Scenario: Complete learning session with mastery achievement
    const sessionEvents: any[] = [];

    // 1. Session Started
    const sessionStarted = DomainEventFactory.sessionStarted(
      learnerId, 'session_123', 'math', 1, 3, 'learning'
    );
    sessionEvents.push(sessionStarted);

    // 2. Progress during session (would come from ProgressTracker)
    const tracker = ProgressTracker.createNew(WordId.fromString('word1'), learnerId);
    const masteryEvent1 = tracker.recordAttempt(true);
    const masteryEvent2 = tracker.recordAttempt(true); // Mastery achieved
    
    if (masteryEvent1) sessionEvents.push(masteryEvent1);
    if (masteryEvent2) sessionEvents.push(masteryEvent2);

    // 3. Achievement unlocked
    const achievement = DomainEventFactory.achievementUnlocked(
      learnerId, 'first-mastery', 'Math Champion!', 'You mastered your first math concept!', 'large'
    );
    sessionEvents.push(achievement);

    // 4. Session Completed
    const sessionCompleted = DomainEventFactory.sessionCompleted(
      learnerId, 'session_123', 3, 3, 240, [WordId.fromString('word1')]
    );
    sessionEvents.push(sessionCompleted);

    // Assert - Complete business process captured in events
    const eventTypes = sessionEvents.map(e => e.getEventType());
    expect(eventTypes).toEqual([
      'practice-session-started',
      'mastery-achieved',
      'achievement-unlocked', 
      'practice-session-completed'
    ]);

    // Events enable business analytics
    const completionEvent = sessionEvents.find(e => e.getEventType() === 'practice-session-completed');
    expect(completionEvent.getAccuracyPercentage()).toBe(100);
    expect(completionEvent.getWordsAdvanced()).toHaveLength(1);
  });
});

/**
 * 🎓 LEARNING MOMENT: Domain Events Benefits
 * 
 * Compare to the OLD approach without events:
 * 
 * // ❌ OLD: Side effects hidden in business logic
 * tracker.recordAttempt(true);
 * // Hidden: notifications, achievements, analytics, audit logs
 * 
 * // ✅ NEW: All business moments explicit as events
 * const events = tracker.recordAttempt(true);
 * events.forEach(event => eventDispatcher.dispatch(event));
 * 
 * Key Benefits:
 * 
 * 1. **Business Process Visibility**: Every important business moment 
 *    is captured as a first-class event
 * 
 * 2. **Decoupling**: Domain logic doesn't need to know about
 *    notifications, analytics, or other side effects
 * 
 * 3. **Audit Trail**: Complete history of business events for
 *    debugging and compliance
 * 
 * 4. **Event-Driven Architecture**: External systems can react
 *    to domain events without coupling to domain internals
 * 
 * 5. **Testing**: Business processes can be tested by verifying
 *    expected events are generated
 * 
 * 6. **Analytics**: Rich data for learning analytics and insights
 * 
 * Real-world usage:
 * - Send push notifications when achievements are unlocked
 * - Update leaderboards when sessions complete
 * - Trigger adaptive content recommendations
 * - Generate progress reports for parents/teachers
 * - A/B testing of learning interventions
 */