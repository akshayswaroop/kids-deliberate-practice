/**
 * 🎯 Detailed Algorithm Test: Word Selection with Cooldowns
 * 
 * This test covers the exact scenario asked about:
 * - 14 words total
 * - Session 1: 12 words (9 correct, 3 wrong)  
 * - Session 2: Algorithm prioritizes struggling vs new vs mastered
 * 
 * Tests the core business rules for word selection priority.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { PracticeSessionService } from '../services/PracticeSessionService';
import { ProgressTracker } from '../entities/ProgressTracker';
import { LearnerId } from '../value-objects/LearnerId';
import { WordId } from '../value-objects/WordId';
import type { WordDrillInfo, SessionRequirements } from '../services/PracticeSessionService';

describe('🔍 Word Selection Algorithm: Struggling vs Strong Priority', () => {
  let sessionService: PracticeSessionService;
  let learnerId: LearnerId;
  let wordBank: WordDrillInfo[]; // 14 words total
  let progressTrackers: Map<string, ProgressTracker>;

  beforeEach(() => {
    sessionService = new PracticeSessionService();
    learnerId = LearnerId.fromString('algorithm-test-learner');
    
    // Create exactly 14 words as in the scenario
    wordBank = [
      { id: 'word_01', text: '2 × 2 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'word_02', text: '2 × 3 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'word_03', text: '2 × 4 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'word_04', text: '2 × 5 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'word_05', text: '2 × 6 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'word_06', text: '2 × 7 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'word_07', text: '2 × 8 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'word_08', text: '2 × 9 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'word_09', text: '2 × 10 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'word_10', text: '3 × 2 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'word_11', text: '3 × 3 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'word_12', text: '3 × 4 = ?', complexityLevel: 1, subject: 'math' },
      // These 2 were NOT in session 1 (untouched)
      { id: 'word_13', text: '3 × 5 = ?', complexityLevel: 1, subject: 'math' },
      { id: 'word_14', text: '3 × 6 = ?', complexityLevel: 1, subject: 'math' }
    ];
    
    progressTrackers = new Map<string, ProgressTracker>();
  });

  function createSessionRequirements(sessionSize: number): SessionRequirements {
    return {
      learnerId,
      subject: 'math',
      complexityLevel: 1,
      maxSessionSize: sessionSize,
      includeRevisionWords: true
    };
  }

  function simulateSession1Results(): void {
    // Simulate Session 1 results: 12 words attempted
    
    // 9 words answered ALL CORRECT → MASTERED + COOLDOWN
    const masteredWordIds = ['word_01', 'word_02', 'word_03', 'word_04', 'word_05', 'word_06', 'word_07', 'word_08', 'word_09'];
    
    masteredWordIds.forEach(wordId => {
      const tracker = ProgressTracker.createNew(WordId.fromString(wordId), learnerId);
      // Simulate getting answers correct → reaches mastery (progress >= 2)
      tracker.recordAttempt(true, Date.now());  // progress = 1
      tracker.recordAttempt(true, Date.now());  // progress = 2 (MASTERED!)
      // This triggers cooldownSessionsLeft = 3
      progressTrackers.set(wordId, tracker);
    });
    
    // 3 words answered WRONG multiple times → STRUGGLING (progress = 1, not mastered)
    const strugglingWordIds = ['word_10', 'word_11', 'word_12'];
    
    strugglingWordIds.forEach(wordId => {
      const tracker = ProgressTracker.createNew(WordId.fromString(wordId), learnerId);
      // Simulate mixed results - some progress but not mastered
      tracker.recordAttempt(true, Date.now());  // progress = 1 
      tracker.recordAttempt(false, Date.now()); // progress = 0
      tracker.recordAttempt(true, Date.now());  // progress = 1 (STRUGGLING - has progress but < 2)
      progressTrackers.set(wordId, tracker);
    });
    
    // word_13 and word_14 have NO trackers = NEW WORDS
  }

  test('📊 Exact Scenario: 14 Words → Session 1 (12 words) → Session 2 Algorithm', () => {
    console.log('\n🎯 Testing Exact Scenario: Word Selection Algorithm');
    console.log('===================================================');
    console.log(`📚 Total Word Bank: ${wordBank.length} words`);
    
    // ========================================
    // 📖 SIMULATE SESSION 1 RESULTS
    // ========================================
    console.log('\n📖 STEP 1: Simulating Session 1 Results');
    console.log('----------------------------------------');
    simulateSession1Results();
    
    // Verify Session 1 setup
    const masteredCount = Array.from(progressTrackers.values()).filter(t => t.isMastered()).length;
    const strugglingCount = Array.from(progressTrackers.values()).filter(t => !t.isMastered() && t.getProgress() > 0).length;
    const untouchedCount = wordBank.length - progressTrackers.size;
    
    console.log(`✅ Session 1 Results:`);
    console.log(`   - Mastered: ${masteredCount} words (all correct → cooldown)`);
    console.log(`   - Struggling: ${strugglingCount} words (wrong multiple times)`);
    console.log(`   - Untouched: ${untouchedCount} words (not in session 1)`);
    
    expect(masteredCount).toBe(9);
    expect(strugglingCount).toBe(3);
    expect(untouchedCount).toBe(2);
    
    // Verify cooldown status
    console.log('\n📊 Individual Word Status:');
    progressTrackers.forEach((tracker, wordId) => {
      if (tracker.isMastered()) {
        expect(tracker.isInCooldown()).toBe(true);
        expect(tracker.getCooldownSessionsLeft()).toBe(3);
        console.log(`  🔒 ${wordId}: mastered, cooldown = ${tracker.getCooldownSessionsLeft()}`);
      } else {
        expect(tracker.isInCooldown()).toBe(false);
        console.log(`  🚨 ${wordId}: struggling, progress = ${tracker.getProgress()}`);
      }
    });
    
    // ========================================
    // 🎯 SESSION 2: ALGORITHM SELECTION
    // ========================================
    console.log('\n📖 STEP 2: Algorithm Selection for Session 2');
    console.log('---------------------------------------------');
    
    const session2 = sessionService.generateSession(wordBank, progressTrackers, createSessionRequirements(12));
    
    console.log(`ℹ️  Selected ${session2.selectedWordIds.length} words for session 2`);
    console.log(`ℹ️  Session type: ${session2.sessionType}`);
    console.log(`ℹ️  Words selected: ${session2.selectedWordIds.map(id => id.toString()).join(', ')}`);
    console.log(`ℹ️  Reasoning: ${session2.reasoning}`);
    
    // ========================================
    // 🧪 VERIFY ALGORITHM BUSINESS RULES
    // ========================================
    console.log('\n📖 STEP 3: Verifying Business Rules');
    console.log('------------------------------------');
    
    // RULE 1: Mastered words should be EXCLUDED (in cooldown)
    const selectedIds = session2.selectedWordIds.map(id => id.toString());
    const masteredIds = ['word_01', 'word_02', 'word_03', 'word_04', 'word_05', 'word_06', 'word_07', 'word_08', 'word_09'];
    
    masteredIds.forEach(masteredId => {
      expect(selectedIds).not.toContain(masteredId);
    });
    console.log('✅ RULE 1: All 9 mastered words excluded (cooldown protection)');
    
    // RULE 2: Struggling words should be PRIORITIZED (selected first)
    const strugglingIds = ['word_10', 'word_11', 'word_12'];
    strugglingIds.forEach(strugglingId => {
      expect(selectedIds).toContain(strugglingId);
    });
    console.log('✅ RULE 2: All 3 struggling words prioritized (need help)');
    
    // RULE 3: New words should fill remaining slots
    const newIds = ['word_13', 'word_14'];
    newIds.forEach(newId => {
      expect(selectedIds).toContain(newId);
    });
    console.log('✅ RULE 3: All 2 new words included (remaining capacity)');
    
    // RULE 4: Session should contain exactly: 3 struggling + 2 new = 5 words
    expect(session2.selectedWordIds).toHaveLength(5);
    expect(session2.sessionType).toBe('learning'); // No revision words yet
    console.log('✅ RULE 4: Total session size = 5 words (3 struggling + 2 new)');
    
    console.log('\n📊 ALGORITHM VERIFICATION COMPLETE');
    console.log('==================================');
    console.log('🎯 Strong words (mastered): Protected by cooldown');
    console.log('🚨 Weak words (struggling): Given priority attention');  
    console.log('📚 New words: Fill remaining learning capacity');
    console.log('⚖️ Adaptive session: Size adjusts based on availability\n');
  });

  test('🔄 Cooldown Progression: Session 3 and 4 Behavior', () => {
    console.log('🔄 Testing Cooldown Progression Over Multiple Sessions');
    console.log('======================================================');
    
    // Setup: Same as previous test
    simulateSession1Results();
    
    // SESSION 2: (as verified above - 5 words)
    const session2 = sessionService.generateSession(wordBank, progressTrackers, createSessionRequirements(12));
    console.log(`📖 Session 2: ${session2.selectedWordIds.length} words selected`);
    
    // Simulate Session 2 results: 2 struggling words get mastered
    const strugglingTracker1 = progressTrackers.get('word_10')!;
    const strugglingTracker2 = progressTrackers.get('word_11')!;
    
    strugglingTracker1.recordAttempt(true, Date.now()); // progress = 1 → 2 (mastered!)
    strugglingTracker2.recordAttempt(true, Date.now()); // progress = 1 → 2 (mastered!)
    
    // Decrement cooldowns for all mastered words (1 session passed)
    progressTrackers.forEach(tracker => {
      if (tracker.isInCooldown()) {
        tracker.decrementCooldown();
      }
    });
    
    console.log(`🔄 After Session 2: Cooldowns decremented by 1`);
    
    // SESSION 3: Even fewer available words
    const session3 = sessionService.generateSession(wordBank, progressTrackers, createSessionRequirements(12));
    
    console.log(`📖 Session 3: ${session3.selectedWordIds.length} words selected`);
    console.log(`ℹ️  Words: ${session3.selectedWordIds.map(id => id.toString()).join(', ')}`);
    
    // Should now have 11 mastered words (9 + 2 newly mastered)
    // Should have 1 struggling word (word_12)  
    // Should have 2 new words if not yet attempted
    
    const masteredWordsInCooldown = Array.from(progressTrackers.values()).filter(t => t.isMastered() && t.isInCooldown()).length;
    console.log(`🔒 Mastered words still in cooldown: ${masteredWordsInCooldown}`);
    
    expect(masteredWordsInCooldown).toBeGreaterThan(0); // Some still in cooldown
    expect(session3.selectedWordIds.length).toBeLessThanOrEqual(5); // Fewer available words
    
    console.log('✅ Cooldown progression working correctly');
  });

  test('🎓 Revision Phase: When Cooldowns Complete', () => {
    console.log('🎓 Testing Revision Phase: Cooldown Completion');
    console.log('===============================================');
    
    // Setup: Start with some mastered words
    simulateSession1Results();
    
    // Simulate 3 sessions passing (complete cooldown)
    for (let session = 0; session < 3; session++) {
      progressTrackers.forEach(tracker => {
        if (tracker.isInCooldown()) {
          tracker.decrementCooldown();
        }
      });
      console.log(`🔄 Session ${session + 1}: Cooldowns decremented`);
    }
    
    // Now some words should be out of cooldown
    const wordsReadyForRevision = Array.from(progressTrackers.values()).filter(t => t.isMastered() && !t.isInCooldown()).length;
    console.log(`🎓 Words ready for revision: ${wordsReadyForRevision}`);
    
    const revisionSession = sessionService.generateSession(wordBank, progressTrackers, createSessionRequirements(12));
    
    console.log(`📖 Revision Session: ${revisionSession.selectedWordIds.length} words`);
    console.log(`ℹ️  Session type: ${revisionSession.sessionType}`);
    console.log(`ℹ️  Reasoning: ${revisionSession.reasoning}`);
    
    // Should include revision words now
    expect(wordsReadyForRevision).toBeGreaterThan(0);
    expect(['mixed', 'revision']).toContain(revisionSession.sessionType);
    
    console.log('✅ Revision phase activated when cooldowns complete');
  });
});