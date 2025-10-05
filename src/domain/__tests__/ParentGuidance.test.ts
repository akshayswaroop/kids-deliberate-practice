import { describe, it, expect } from 'vitest';
import { ProgressTracker } from '../entities/ProgressTracker';

describe('🎯 Parent Guidance Messages (Trace-Based)', () => {
  it('should show "Ready when you are" with no attempts', () => {
    const tracker = ProgressTracker.fromData({
      wordId: 'word1',
      learnerId: 'learner1',
      progress: 0,
      attempts: [],
      cooldownSessionsLeft: 0,
      masteryAchievedAt: undefined,
      revealCount: 0
    });

    const guidance = tracker.getParentGuidance();
    
    expect(guidance.message).toBe('Ready when you are');
    expect(guidance.context).toBe('initial');
    expect(guidance.urgency).toBe('info');
  });

  it('should show success message after first CORRECT attempt', () => {
    const tracker = ProgressTracker.fromData({
      wordId: 'word1',
      learnerId: 'learner1',
      progress: 1, // Step increased to 1 after correct
      attempts: [
        { timestamp: Date.now(), result: 'correct' }
      ],
      cooldownSessionsLeft: 0,
      masteryAchievedAt: undefined,
      revealCount: 0
    });

    const guidance = tracker.getParentGuidance();
    
    console.log('Guidance after 1 correct:', guidance);
    
    expect(guidance.message).toContain('Nice');
    expect(guidance.context).toBe('first-success');
    expect(guidance.urgency).toBe('success');
  });

  it('should show different message after first WRONG attempt', () => {
    const tracker = ProgressTracker.fromData({
      wordId: 'word1',
      learnerId: 'learner1',
      progress: 0, // Still at 0 after wrong
      attempts: [
        { timestamp: Date.now(), result: 'wrong' }
      ],
      cooldownSessionsLeft: 0,
      masteryAchievedAt: undefined,
      revealCount: 0
    });

    const guidance = tracker.getParentGuidance();
    
    console.log('Guidance after 1 wrong:', guidance);
    
    expect(guidance.message).toContain('Let\'s try');
    expect(guidance.context).toBe('first-attempt-wrong');
    expect(guidance.urgency).toBe('info');
  });

  it('should show "Two correct in a row" after second CORRECT attempt', () => {
    const tracker = ProgressTracker.fromData({
      wordId: 'word1',
      learnerId: 'learner1',
      progress: 1,
      attempts: [
        { timestamp: Date.now() - 1000, result: 'correct' },
        { timestamp: Date.now(), result: 'correct' }
      ],
      cooldownSessionsLeft: 0,
      masteryAchievedAt: undefined,
      revealCount: 0
    });

    const guidance = tracker.getParentGuidance();
    
    console.log('Guidance after 2 correct:', guidance);
    
    expect(guidance.message).toContain('Two correct in a row');
    expect(guidance.context).toBe('correct-progress');
    expect(guidance.urgency).toBe('success');
  });

  it('should show mastery message when at threshold (step 2+)', () => {
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
      masteryAchievedAt: undefined,
      revealCount: 0
    });

    const guidance = tracker.getParentGuidance();
    
    console.log('Guidance at mastery:', guidance);
    
    expect(guidance.message).toContain('mastered');
    expect(guidance.context).toBe('mastered');
    expect(guidance.urgency).toBe('success');
  });
});
