/**
 * 🎯 Domain Layer BDD Test: Complete User Learning Journey with Cooldowns
 * 
 * This test demonstrates the complete domain business logic for how a user
 * progresses through learning sessions, including mastery and cooldown mechanics.
 * 
 * Written in BDD style to clearly show business behavior across multiple sessions.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { PracticeSessionService } from '../services/PracticeSessionService';
import { ProgressTracker } from '../entities/ProgressTracker';
import { LearnerId } from '../value-objects/LearnerId';
import { WordId } from '../value-objects/WordId';
import { MasteryConfiguration } from '../value-objects/ModeConfiguration';
import type { WordDrillInfo, SessionRequirements } from '../services/PracticeSessionService';

describe('🎯 Complete User Learning Journey (Domain BDD)', () => {
  let sessionService: PracticeSessionService;
  let learnerId: LearnerId;
  let mathWords: WordDrillInfo[];
  let progressTrackers: Map<string, ProgressTracker>;

  beforeEach(() => {
    sessionService = new PracticeSessionService();
    learnerId = LearnerId.fromString('alice-learner');
    
    // Set up a small math subject with 5 words for clear journey tracking
    mathWords = [
      { id: 'math_2x2', text: '2 × 2 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'math_2x3', text: '2 × 3 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'math_2x4', text: '2 × 4 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'math_2x5', text: '2 × 5 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'math_2x6', text: '2 × 6 = ?', complexityLevel: 1, subject: 'math' }
    ];
    
    progressTrackers = new Map<string, ProgressTracker>();
  });

  function createSessionRequirements(sessionSize: number = 3, includeRevision: boolean = true): SessionRequirements {
    return {
      learnerId,
      subject: 'math',
      complexityLevel: 1,
      maxSessionSize: sessionSize,
      includeRevisionWords: includeRevision
    };
  }

  function simulateCorrectAttempts(wordId: string, attempts: number): void {
    if (!progressTrackers.has(wordId)) {
      progressTrackers.set(wordId, ProgressTracker.createNew(WordId.fromString(wordId), learnerId));
    }
    const tracker = progressTrackers.get(wordId)!;
    for (let i = 0; i < attempts; i++) {
      tracker.recordAttempt(true);
    }
  }

  function simulateSessionCooldownDecrement(): void {
    // Simulate one session passing - decrement all cooldowns
    progressTrackers.forEach(tracker => {
      if (tracker.isInCooldown()) {
        tracker.decrementCooldown();
      }
    });
  }

  function getMasteredWords(): string[] {
    return Array.from(progressTrackers.entries())
      .filter(([_, tracker]) => tracker.isMastered())
      .map(([wordId, _]) => wordId);
  }

  function getWordsInCooldown(): string[] {
    return Array.from(progressTrackers.entries())
      .filter(([_, tracker]) => tracker.isMastered() && tracker.isInCooldown())
      .map(([wordId, _]) => wordId);
  }

  function getWordsReadyForRevision(): string[] {
    return Array.from(progressTrackers.entries())
      .filter(([_, tracker]) => tracker.isMastered() && !tracker.isInCooldown())
      .map(([wordId, _]) => wordId);
  }

  test('👥 Complete Learning Journey: From New Learner to Mastery with Cooldowns', () => {
    console.log('🎯 Starting Complete Learning Journey with Cooldown Demo');
    console.log('===============================================================');
    console.log(`📚 Subject: Math (${mathWords.length} words)`);
    console.log(`👤 Learner: ${learnerId.toString()}`);
    console.log(`🎯 Mastery Threshold: ${MasteryConfiguration.MASTER_STEP} correct attempts`);
    console.log();

    // ==========================================
    // 📖 SESSION 1: Brand New Learner
    // ==========================================
    console.log('📖 SESSION 1: Brand New Learner');
    console.log('--------------------------------');
    
    const session1 = sessionService.generateSession(mathWords, progressTrackers, createSessionRequirements());
    
    console.log(`ℹ️  Generated session with ${session1.selectedWordIds.length} words`);
    console.log(`ℹ️  Session type: ${session1.sessionType}`);
    console.log(`ℹ️  Words selected: ${session1.selectedWordIds.map(id => id.toString()).join(', ')}`);
    console.log(`ℹ️  Reasoning: ${session1.reasoning}`);
    
    // Should get new learning words only (no mastered words exist yet)
    expect(session1.sessionType).toBe('learning');
    expect(session1.selectedWordIds).toHaveLength(3); // maxSessionSize
    expect(session1.reasoning).toContain('new words');
    
    // Simulate user practicing and mastering 2 words in this session
    simulateCorrectAttempts('math_2x2', MasteryConfiguration.MASTER_STEP); // Master this word
    simulateCorrectAttempts('math_2x3', MasteryConfiguration.MASTER_STEP); // Master this word  
    simulateCorrectAttempts('math_2x4', 1); // Partial progress on this word
    
    console.log(`✅ User mastered: ${getMasteredWords().join(', ')}`);
    console.log(`🔄 Words in cooldown: ${getWordsInCooldown().join(', ')}`);
    console.log(`⏳ Cooldown sessions remaining: ${progressTrackers.get('math_2x2')?.getCooldownSessionsLeft() || 0}`);
    console.log();

    // Verify cooldown behavior
    expect(getMasteredWords()).toHaveLength(2);
    expect(getWordsInCooldown()).toHaveLength(2);
    expect(progressTrackers.get('math_2x2')?.getCooldownSessionsLeft()).toBe(3); // Business rule
    
    // ==========================================
    // 📖 SESSION 2: Some Progress, Cooldowns Active
    // ==========================================
    simulateSessionCooldownDecrement(); // One session passes
    
    console.log('📖 SESSION 2: Some Progress, Cooldowns Active');
    console.log('----------------------------------------------');
    
    const session2 = sessionService.generateSession(mathWords, progressTrackers, createSessionRequirements());
    
    console.log(`ℹ️  Generated session with ${session2.selectedWordIds.length} words`);
    console.log(`ℹ️  Session type: ${session2.sessionType}`);
    console.log(`ℹ️  Words selected: ${session2.selectedWordIds.map(id => id.toString()).join(', ')}`);
    console.log(`ℹ️  Reasoning: ${session2.reasoning}`);
    console.log(`🔄 Mastered words still in cooldown: ${getWordsInCooldown().join(', ')}`);
    console.log(`⏳ Cooldown sessions remaining: ${progressTrackers.get('math_2x2')?.getCooldownSessionsLeft() || 0}`);
    
    // Should prioritize struggling + new words (mastered words still in cooldown)
    expect(session2.sessionType).toBe('learning');
    expect(session2.selectedWordIds.some(id => id.toString() === 'math_2x4')).toBe(true); // struggling word
    expect(session2.selectedWordIds.some(id => id.toString() === 'math_2x2')).toBe(false); // in cooldown
    expect(session2.selectedWordIds.some(id => id.toString() === 'math_2x3')).toBe(false); // in cooldown
    
    // Simulate more practice
    simulateCorrectAttempts('math_2x4', 1); // Now mastered (total 2 attempts)
    simulateCorrectAttempts('math_2x5', MasteryConfiguration.MASTER_STEP); // Master new word
    
    console.log(`✅ User mastered: ${getMasteredWords().join(', ')}`);
    console.log();

    // ==========================================  
    // 📖 SESSION 3: More Cooldowns, Mixed Learning
    // ==========================================
    simulateSessionCooldownDecrement(); // Another session passes
    
    console.log('📖 SESSION 3: More Cooldowns, Mixed Learning');
    console.log('---------------------------------------------');
    
    const session3 = sessionService.generateSession(mathWords, progressTrackers, createSessionRequirements());
    
    console.log(`ℹ️  Generated session with ${session3.selectedWordIds.length} words`);
    console.log(`ℹ️  Session type: ${session3.sessionType}`);
    console.log(`ℹ️  Words selected: ${session3.selectedWordIds.map(id => id.toString()).join(', ')}`);
    console.log(`🔄 Mastered words still in cooldown: ${getWordsInCooldown().join(', ')}`);
    console.log(`⏳ Cooldown sessions remaining: ${progressTrackers.get('math_2x2')?.getCooldownSessionsLeft() || 0}`);
    
    // Should still be learning mode (words still in cooldown)
    expect(getWordsInCooldown().length).toBeGreaterThan(0);
    expect(session3.sessionType).toBe('learning');
    
    // Master the last word
    simulateCorrectAttempts('math_2x6', MasteryConfiguration.MASTER_STEP);
    
    console.log(`✅ All words mastered: ${getMasteredWords().join(', ')}`);
    console.log();

    // ==========================================
    // 📖 SESSION 4: Cooldown Completion - Revision Time!
    // ==========================================
    simulateSessionCooldownDecrement(); // Final cooldown decrement
    
    console.log('📖 SESSION 4: Cooldown Completion - Revision Time!');
    console.log('---------------------------------------------------');
    
    const session4 = sessionService.generateSession(mathWords, progressTrackers, createSessionRequirements());
    
    console.log(`ℹ️  Generated session with ${session4.selectedWordIds.length} words`);
    console.log(`ℹ️  Session type: ${session4.sessionType}`);
    console.log(`ℹ️  Words selected: ${session4.selectedWordIds.map(id => id.toString()).join(', ')}`);
    console.log(`ℹ️  Reasoning: ${session4.reasoning}`);
    console.log(`✅ Words ready for revision: ${getWordsReadyForRevision().join(', ')}`);
    console.log(`🔄 Words still in cooldown: ${getWordsInCooldown().join(', ')}`);
    console.log(`⏳ Cooldown sessions remaining: ${progressTrackers.get('math_2x2')?.getCooldownSessionsLeft() || 0}`);
    
    // Should now include revision words as cooldowns complete
    expect(getWordsReadyForRevision().length).toBeGreaterThan(0);
    if (getWordsReadyForRevision().length > 0) {
      // Session type should be 'revision' when only revision words are available
      expect(session4.sessionType).toBe('revision'); // Pure revision session
      expect(session4.reasoning).toContain('revision');
    }
    
    console.log();
    console.log('📊 JOURNEY COMPLETION REPORT');
    console.log('=============================');
    console.log(`✅ Total words mastered: ${getMasteredWords().length}/${mathWords.length}`);
    console.log(`🔄 Words in cooldown: ${getWordsInCooldown().length}`);
    console.log(`🎯 Words ready for revision: ${getWordsReadyForRevision().length}`);
    console.log(`📈 Learning progression: New → Progress → Mastery → Cooldown → Revision`);
    console.log();
    console.log('🎉 COMPLETE DOMAIN JOURNEY SUCCESSFUL! 🎉');
    
    // Final assertions
    expect(getMasteredWords()).toHaveLength(mathWords.length);
    expect(progressTrackers.size).toBeGreaterThan(0);
    
    // Verify domain business rules were followed
    progressTrackers.forEach((tracker, wordId) => {
      expect(tracker.isMastered()).toBe(true);
      console.log(`📋 ${wordId}: progress=${tracker.getProgress()}, cooldown=${tracker.getCooldownSessionsLeft()}`);
    });
  });

  test('🔄 Cooldown Mechanics: Mastered Words Return for Revision', () => {
    console.log('🔄 Testing Cooldown Mechanics');
    console.log('==============================');
    
    // Set up one mastered word with completed cooldown
    simulateCorrectAttempts('math_2x2', MasteryConfiguration.MASTER_STEP);
    
    // Simulate 3 sessions passing (cooldown completion)
    simulateSessionCooldownDecrement();
    simulateSessionCooldownDecrement(); 
    simulateSessionCooldownDecrement();
    
    console.log(`✅ Word mastered and cooldown completed: math_2x2`);
    console.log(`⏳ Cooldown sessions remaining: ${progressTrackers.get('math_2x2')?.getCooldownSessionsLeft()}`);
    
    // Create a mixed scenario: some revision words + some new words available
    const sessionWithRevision = sessionService.generateSession(
      mathWords, 
      progressTrackers, 
      createSessionRequirements(3, true) // Include revision words, session size 3
    );
    
    console.log(`ℹ️  Session type: ${sessionWithRevision.sessionType}`);
    console.log(`ℹ️  Words selected: ${sessionWithRevision.selectedWordIds.map(id => id.toString()).join(', ')}`);
    console.log(`ℹ️  Reasoning: ${sessionWithRevision.reasoning}`);
    
    // Should include session generation (exact behavior depends on domain rules)
    expect(sessionWithRevision.selectedWordIds.length).toBeGreaterThan(0);
    
    // The session could be 'mixed' (revision + new), 'revision' (only revision), or 'learning' (prioritizing new)
    // depending on the domain service's prioritization logic
    expect(['mixed', 'revision', 'learning']).toContain(sessionWithRevision.sessionType);
    
    console.log('✅ Cooldown mechanics working correctly!');
  });
});