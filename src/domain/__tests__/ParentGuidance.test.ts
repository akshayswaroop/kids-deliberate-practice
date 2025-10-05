import { describe, it, expect } from 'vitest';
import { ProgressTracker } from '../entities/ProgressTracker';

describe('🎯 Parent Guidance Messages (Trace-Based)', () => {
  it('should show "First try" with no attempts', () => {
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
    
    expect(guidance.message).toBe('First try');
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
    
    expect(guidance.message).toContain('Great');
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
    
    expect(guidance.message).toContain('First try');
    expect(guidance.context).toBe('first-attempt-wrong');
    expect(guidance.urgency).toBe('info');
  });

  it('should show "Good job" after second CORRECT attempt', () => {
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
    
    expect(guidance.message).toContain('Good job');
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
    
    expect(guidance.message).toContain('Mastered');
    expect(guidance.context).toBe('mastered');
    expect(guidance.urgency).toBe('success');
  });
});
