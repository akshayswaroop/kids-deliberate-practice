import { describe, it, expect } from 'vitest';
import { ProgressTracker } from '../../domain/entities/ProgressTracker';
import { SessionGuidance } from '../../domain/entities/SessionGuidance';

/**
 * Unit tests for cue-selection logic
 * Tests state transitions → expected cue mappings
 * Follows TDD approach as specified in requirements
 */

describe('Parent Cue Selection Logic - State Transitions', () => {
  describe('Initial State Transitions', () => {
    it('should show "Ready when you are" for a brand new question', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 0,
        attempts: [],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      const guidance = tracker.getParentGuidance();
      
      expect(guidance.message).toBe('Ready when you are');
      expect(guidance.urgency).toBe('info');
      expect(guidance.context).toBe('initial');
    });
  });

  describe('First Attempt Transitions', () => {
    it('should show encouraging message after first correct attempt', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 1,
        attempts: [{ timestamp: Date.now(), result: 'correct' }],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      const guidance = tracker.getParentGuidance();
      
      expect(guidance.message).toContain('Nice');
      expect(guidance.urgency).toBe('success');
      expect(guidance.context).toBe('first-success');
    });

    it('should show supportive message after first wrong attempt', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 0,
        attempts: [{ timestamp: Date.now(), result: 'wrong' }],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      const guidance = tracker.getParentGuidance();
      
      expect(guidance.message).toContain('Let\'s try');
      expect(guidance.urgency).toBe('info');
      expect(guidance.context).toBe('first-attempt-wrong');
    });
  });

  describe('Progress Toward Mastery Transitions', () => {
    it('should show progress message after second correct attempt (progress = 1)', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 1,
        attempts: [
          { timestamp: Date.now() - 1000, result: 'correct' },
          { timestamp: Date.now(), result: 'correct' }
        ],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      const guidance = tracker.getParentGuidance();
      
      expect(guidance.message).toContain('Two correct in a row');
      expect(guidance.urgency).toBe('success');
      expect(guidance.context).toBe('correct-progress');
    });

    it('should show near-mastery message (progress > 1 but < 2)', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 1.5, // Between 1 and 2
        attempts: [
          { timestamp: Date.now() - 2000, result: 'correct' },
          { timestamp: Date.now() - 1000, result: 'correct' },
          { timestamp: Date.now(), result: 'correct' }
        ],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      const guidance = tracker.getParentGuidance();
      
      expect(guidance.urgency).toBe('success');
      expect(guidance.context).toBe('correct-progress');
    });
  });

  describe('Mastery Achievement Transition', () => {
    it('should show mastery message when progress >= 2', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 2,
        attempts: [
          { timestamp: Date.now() - 2000, result: 'correct' },
          { timestamp: Date.now() - 1000, result: 'correct' },
          { timestamp: Date.now(), result: 'correct' }
        ],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      const guidance = tracker.getParentGuidance();
      
      expect(guidance.message).toMatch(/mastered/i);
      expect(guidance.urgency).toBe('success');
      expect(guidance.context).toBe('mastered');
    });
  });

  describe('Struggle Pattern Transitions', () => {
    it('should show gentle guidance for low accuracy (< 40%)', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 0,
        attempts: [
          { timestamp: Date.now() - 4000, result: 'wrong' },
          { timestamp: Date.now() - 3000, result: 'wrong' },
          { timestamp: Date.now() - 2000, result: 'wrong' },
          { timestamp: Date.now() - 1000, result: 'wrong' },
          { timestamp: Date.now(), result: 'wrong' }
        ],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      const guidance = tracker.getParentGuidance();
      
      expect(guidance.message).toContain('tricky');
      expect(guidance.urgency).toBe('warning');
      expect(guidance.context).toBe('needs-practice');
    });

    it('should show review message when reveal count >= 3', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 0,
        attempts: [],
        cooldownSessionsLeft: 0,
        revealCount: 3
      });

      const guidance = tracker.getParentGuidance();
      
      expect(guidance.message).toContain('bring this one back later');
      expect(guidance.urgency).toBe('info');
      expect(guidance.context).toBe('struggling');
    });
  });
});

describe('Session Guidance - State Transitions', () => {
  describe('Session Introduction', () => {
    it('should show introduction cue for first question ever', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'session1',
        currentQuestionIndex: 0,
        totalQuestions: 12,
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: true
      });

      const guidance = sessionGuidance.getSessionGuidance();
      
      expect(guidance).not.toBeNull();
      expect(guidance!.message).toContain('Practice Set');
      expect(guidance!.urgency).toBe('info');
      expect(guidance!.context).toBe('set-introduction');
    });

    it('should not show introduction when cycling back to index 0', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'session1',
        currentQuestionIndex: 0,
        totalQuestions: 12,
        masteredInSession: 5,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: false // Not first question ever
      });

      const guidance = sessionGuidance.getSessionGuidance();
      
      // Should return null for normal operation
      expect(guidance).toBeNull();
    });
  });

  describe('Level Transition', () => {
    it('should show "New round begins" when all questions mastered and more levels available', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'session1',
        currentQuestionIndex: 11,
        totalQuestions: 12,
        masteredInSession: 12,
        allQuestionsInSetMastered: true,
        hasMoreLevels: true,
        subject: 'kannada',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();
      
      expect(guidance).not.toBeNull();
      expect(guidance!.message).toBe('New round begins — these are fresh cards');
      expect(guidance!.urgency).toBe('info');
      expect(guidance!.context).toBe('level-transition');
    });

    it('should not show level transition if questions remain unmastered', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'session1',
        currentQuestionIndex: 11,
        totalQuestions: 12,
        masteredInSession: 8, // Not all mastered
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'kannada',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();
      
      expect(guidance).toBeNull();
    });
  });

  describe('Session Completion', () => {
    it('should show completion message when all mastered and no more levels', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'session1',
        currentQuestionIndex: 11,
        totalQuestions: 12,
        masteredInSession: 12,
        allQuestionsInSetMastered: true,
        hasMoreLevels: false, // No more levels
        subject: 'mathtables',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();
      
      expect(guidance).not.toBeNull();
      expect(guidance!.message).toContain('All done for this subject');
      expect(guidance!.message).toContain('rest those neurons');
      expect(guidance!.urgency).toBe('success');
      expect(guidance!.context).toBe('completion');
    });
  });

  describe('Normal Operation', () => {
    it('should return null during normal practice (no special guidance needed)', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'session1',
        currentQuestionIndex: 5,
        totalQuestions: 12,
        masteredInSession: 3,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();
      
      // During normal practice, rely on word-level guidance
      expect(guidance).toBeNull();
    });
  });
});

describe('Cue Message Tone Validation', () => {
  describe('Messages should be calm and reassuring', () => {
    it('initial message should be welcoming', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 0,
        attempts: [],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      const guidance = tracker.getParentGuidance();
      
      // Should not contain jargon or harsh language
      expect(guidance.message.toLowerCase()).not.toContain('fail');
      expect(guidance.message.toLowerCase()).not.toContain('wrong');
      expect(guidance.message.toLowerCase()).not.toContain('error');
    });

    it('wrong answer message should be supportive, not judgmental', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 0,
        attempts: [{ timestamp: Date.now(), result: 'wrong' }],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      const guidance = tracker.getParentGuidance();
      
      // Should be encouraging
      expect(guidance.message).toMatch(/Let's try|together|show them/i);
      
      // Should not be harsh
      expect(guidance.message.toLowerCase()).not.toContain('fail');
      expect(guidance.message.toLowerCase()).not.toContain('incorrect');
    });

    it('struggling message should acknowledge difficulty without judgment', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 0,
        attempts: [],
        cooldownSessionsLeft: 0,
        revealCount: 3
      });

      const guidance = tracker.getParentGuidance();
      
      // Should be neutral and forward-looking
      expect(guidance.message).toContain('bring this one back later');
      expect(guidance.message.toLowerCase()).not.toContain('fail');
    });
  });

  describe('Messages should be contextual', () => {
    it('mastery message should celebrate achievement', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 2,
        attempts: [
          { timestamp: Date.now() - 2000, result: 'correct' },
          { timestamp: Date.now() - 1000, result: 'correct' },
          { timestamp: Date.now(), result: 'correct' }
        ],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      const guidance = tracker.getParentGuidance();
      
      expect(guidance.message).toMatch(/Great work|mastered/i);
    });

    it('progress message should show current state', () => {
      const tracker = ProgressTracker.fromData({
        wordId: 'word1',
        learnerId: 'learner1',
        progress: 1,
        attempts: [
          { timestamp: Date.now() - 1000, result: 'correct' },
          { timestamp: Date.now(), result: 'correct' }
        ],
        cooldownSessionsLeft: 0,
        revealCount: 0
      });

      const guidance = tracker.getParentGuidance();
      
      expect(guidance.message).toContain('Two correct in a row');
    });
  });
});
