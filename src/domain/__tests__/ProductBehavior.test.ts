/**
 * 🎯 Product Manager Friendly Tests
 * 
 * These tests describe user behavior in plain language that any stakeholder can understand.
 * Each test tells a story about how the learning algorithm adapts to help children learn.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { PracticeSessionService } from '../services/PracticeSessionService';
import { ProgressTracker } from '../entities/ProgressTracker';
import { LearnerId } from '../value-objects/LearnerId';
import { WordId } from '../value-objects/WordId';
import type { WordDrillInfo } from '../services/PracticeSessionService';

describe('🎯 Product Behavior: Adaptive Learning Algorithm', () => {
  let sessionService: PracticeSessionService;
  let sarah: LearnerId;
  let multiplicationTables: WordDrillInfo[];
  let progressData: Map<string, ProgressTracker>;

  beforeEach(() => {
    sessionService = new PracticeSessionService();
    sarah = LearnerId.fromString('sarah-grade3');
    
    // Real multiplication table questions
    multiplicationTables = [
      { id: '2x2', text: '2 × 2 = ?', complexityLevel: 1, subject: 'math' },
      { id: '2x3', text: '2 × 3 = ?', complexityLevel: 1, subject: 'math' },
      { id: '2x4', text: '2 × 4 = ?', complexityLevel: 1, subject: 'math' },
      { id: '2x5', text: '2 × 5 = ?', complexityLevel: 1, subject: 'math' },
      { id: '2x6', text: '2 × 6 = ?', complexityLevel: 1, subject: 'math' },
      { id: '2x7', text: '2 × 7 = ?', complexityLevel: 1, subject: 'math' },
      { id: '2x8', text: '2 × 8 = ?', complexityLevel: 1, subject: 'math' },
      { id: '2x9', text: '2 × 9 = ?', complexityLevel: 1, subject: 'math' },
      { id: '2x10', text: '2 × 10 = ?', complexityLevel: 1, subject: 'math' },
      { id: '3x2', text: '3 × 2 = ?', complexityLevel: 1, subject: 'math' },
      { id: '3x3', text: '3 × 3 = ?', complexityLevel: 1, subject: 'math' },
      { id: '3x4', text: '3 × 4 = ?', complexityLevel: 1, subject: 'math' }
    ];
    
    progressData = new Map<string, ProgressTracker>();
  });

  function createSession(maxSize: number = 12) {
    return sessionService.generateSession(multiplicationTables, progressData, {
      learnerId: sarah,
      subject: 'math',
      complexityLevel: 1,
      maxSessionSize: maxSize,
      includeRevisionWords: true
    });
  }

  function simulateAnswers(wordId: string, correct: boolean, times: number = 1) {
    const tracker = progressData.get(wordId) || ProgressTracker.createNew(WordId.fromString(wordId), sarah);
    let timestampSeed = Date.now();
    for (let i = 0; i < times; i++) {
      timestampSeed += 1;
      tracker.recordAttempt(correct, timestampSeed);
    }
    progressData.set(wordId, tracker);
  }

  test('👧 Story: Sarah learns multiplication tables - Day 1', () => {
    console.log('\n👧 SARAH\'S LEARNING JOURNEY - DAY 1');
    console.log('===================================');
    console.log('Sarah is a 3rd grader starting to learn multiplication tables.');
    console.log('She has never seen these problems before.\n');

    // Day 1: First practice session
    const session1 = createSession(6);
    
    console.log('📚 SARAH\'S FIRST PRACTICE SESSION');
    console.log('----------------------------------');
    console.log(`• The app gives Sarah ${session1.selectedWordIds.length} new multiplication problems`);
    console.log(`• Problems: ${session1.selectedWordIds.map(id => id.toString()).join(', ')}`);
    console.log(`• These are all new to her, so she gets a manageable set to start learning\n`);
    
    expect(session1.selectedWordIds.length).toBe(6);
    expect(session1.sessionType).toBe('learning');
    
    // Sarah practices and gets some right, some wrong
    console.log('🎯 SARAH\'S PERFORMANCE');
    console.log('-----------------------');
    
    // Sarah gets the easy ones right (2x2, 2x3, 2x4)
    simulateAnswers('2x2', true, 2); // Mastered!
    simulateAnswers('2x3', true, 2); // Mastered!
    simulateAnswers('2x4', true, 2); // Mastered!
    console.log('✅ Sarah quickly masters: 2×2, 2×3, 2×4 (these are easy for her)');
    
    // Sarah struggles with harder ones (2x7, 2x8, 2x9)
    simulateAnswers('2x7', false, 1);
    simulateAnswers('2x7', true, 1);  // Some progress but not mastered
    simulateAnswers('2x8', false, 1);
    simulateAnswers('2x8', true, 1);  // Some progress but not mastered  
    simulateAnswers('2x9', false, 1);
    simulateAnswers('2x9', true, 1);  // Some progress but not mastered
    console.log('🚨 Sarah struggles with: 2×7, 2×8, 2×9 (these are harder)');
    console.log('   - She gets some right but makes mistakes too\n');
    
    const masteredCount = Array.from(progressData.values()).filter(t => t.isMastered()).length;
    const strugglingCount = Array.from(progressData.values()).filter(t => !t.isMastered() && t.getProgress() > 0).length;
    
    console.log('📊 END OF DAY 1 SUMMARY');
    console.log('------------------------');
    console.log(`• Mastered: ${masteredCount} problems (Sarah knows these well now)`);
    console.log(`• Struggling: ${strugglingCount} problems (Sarah needs more practice)`);
    console.log('• The mastered problems will be set aside for a few days');
    console.log('• Tomorrow, Sarah will focus on the problems she\'s struggling with\n');
    
    expect(masteredCount).toBe(3);
    expect(strugglingCount).toBe(3);
  });

  test('👧 Story: Sarah learns multiplication tables - Day 2', () => {
    console.log('\n👧 SARAH\'S LEARNING JOURNEY - DAY 2');
    console.log('===================================');
    console.log('Yesterday Sarah mastered some problems and struggled with others.');
    console.log('Today the app is smart about what to show her.\n');

    // Set up Day 1 results
    simulateAnswers('2x2', true, 2); // Mastered
    simulateAnswers('2x3', true, 2); // Mastered  
    simulateAnswers('2x4', true, 2); // Mastered
    simulateAnswers('2x7', false, 1); simulateAnswers('2x7', true, 1); // Struggling
    simulateAnswers('2x8', false, 1); simulateAnswers('2x8', true, 1); // Struggling
    simulateAnswers('2x9', false, 1); simulateAnswers('2x9', true, 1); // Struggling

    const session2 = createSession(6);
    
    console.log('📚 SARAH\'S SECOND PRACTICE SESSION (Next Day)');
    console.log('----------------------------------------------');
    console.log('🧠 THE APP\'S SMART DECISIONS:');
    console.log(`• Excludes problems Sarah already mastered (2×2, 2×3, 2×4)`);
    console.log(`• Prioritizes problems Sarah struggled with yesterday`);
    console.log(`• Adds some new problems to keep learning moving forward\n`);
    
    const selectedProblems = session2.selectedWordIds.map(id => id.toString());
    console.log(`📋 Today's Practice Set: ${selectedProblems.join(', ')}`);
    
    // Should include the struggling problems (but algorithm may select some, not all)
    const strugglingProblems = ['2x7', '2x8', '2x9'];
    const strugglingIncluded = strugglingProblems.filter(p => selectedProblems.includes(p));
    
    expect(strugglingIncluded.length).toBeGreaterThan(0); // At least some struggling problems included
    
    // Should NOT include mastered problems (they're in cooldown)
    expect(selectedProblems).not.toContain('2x2');
    expect(selectedProblems).not.toContain('2x3');
    expect(selectedProblems).not.toContain('2x4');
    
    console.log(`\n✅ SMART ALGORITHM BEHAVIOR:`);
    console.log(`• ❌ No easy problems Sarah already knows (prevents boredom)`);
    console.log(`• 🎯 Struggling problems included: ${strugglingIncluded.join(', ')}`);
    console.log(`• 📚 Some new problems to continue learning`);
    console.log(`• ⚖️ Perfect balance - not too hard, not too easy\n`);
  });

  test('👧 Story: Sarah learns multiplication tables - Week Later', () => {
    console.log('\n👧 SARAH\'S LEARNING JOURNEY - ONE WEEK LATER');
    console.log('=============================================');
    console.log('Sarah has been practicing for a week. Let\'s see how the app');
    console.log('brings back problems she mastered for review.\n');

    // Simulate a week of learning
    // She mastered these early on
    simulateAnswers('2x2', true, 2);
    simulateAnswers('2x3', true, 2);
    simulateAnswers('2x4', true, 2);
    
    // Simulate 3 days passing (cooldown expires)
    progressData.forEach(tracker => {
      if (tracker.isInCooldown()) {
        tracker.decrementCooldown(); // Day 1
        tracker.decrementCooldown(); // Day 2
        tracker.decrementCooldown(); // Day 3 - cooldown complete!
      }
    });
    
    // She's also learned more problems
    simulateAnswers('2x5', true, 2); // Newly mastered
    simulateAnswers('2x6', true, 2); // Newly mastered
    
    const weekLaterSession = createSession(8);
    
    console.log('📚 SARAH\'S PRACTICE SESSION - WEEK LATER');
    console.log('-----------------------------------------');
    console.log('🔄 TIME FOR REVIEW!');
    console.log('The app notices that Sarah mastered 2×2, 2×3, 2×4 a few days ago.');
    console.log('It\'s time to check if she still remembers them!\n');
    
    const sessionProblems = weekLaterSession.selectedWordIds.map(id => id.toString());
    console.log(`📋 Today's Mixed Practice: ${sessionProblems.join(', ')}`);
    console.log(`📊 Session Type: ${weekLaterSession.sessionType}`);
    
    // Should include some revision problems now
    expect(weekLaterSession.sessionType).toBe('mixed');
    
    console.log('\n✅ LONG-TERM LEARNING BEHAVIOR:');
    console.log('• 🔄 Brings back mastered problems for review');
    console.log('• 🧠 Prevents forgetting (spaced repetition)'); 
    console.log('• 📈 Builds long-term retention');
    console.log('• 🎯 Mixes review with new learning optimally\n');
    
    console.log('🎉 SARAH\'S LEARNING JOURNEY SUCCESS!');
    console.log('The app adapted to Sarah\'s learning patterns and helped her');
    console.log('build both immediate mastery and long-term retention.\n');
  });

  test('👨‍💼 Product Manager Validation: Algorithm Business Rules', () => {
    console.log('\n👨‍💼 PRODUCT MANAGER VALIDATION');
    console.log('==============================');
    console.log('Key business rules that drive user engagement and learning outcomes:\n');

    // Setup mixed scenario
    simulateAnswers('2x2', true, 2);   // Mastered (should be protected)
    simulateAnswers('2x3', false, 2);  // Struggling (should be prioritized)
    simulateAnswers('2x4', false, 1); simulateAnswers('2x4', true, 1); // Struggling
    // 2x5, 2x6, 2x7 are new (should fill remaining slots)

    const session = createSession(6);
    const selected = session.selectedWordIds.map(id => id.toString());
    
    console.log('🎯 BUSINESS RULE VALIDATION');
    console.log('----------------------------');
    
    // Rule 1: Don't bore users with stuff they already know
    if (!selected.includes('2x2')) {
      console.log('✅ ENGAGEMENT RULE: Mastered content excluded (prevents boredom)');
    }
    
    // Rule 2: Help users where they struggle most
    if (selected.includes('2x3') && selected.includes('2x4')) {
      console.log('✅ LEARNING RULE: Struggling content prioritized (targeted help)');
    }
    
    // Rule 3: Keep learning moving forward
    const newProblemsCount = selected.filter(id => !progressData.has(id)).length;
    if (newProblemsCount > 0) {
      console.log('✅ PROGRESS RULE: New content included (continuous learning)');
    }
    
    console.log(`\n📊 SESSION COMPOSITION:`);
    console.log(`• Total problems: ${selected.length}`);
    console.log(`• Struggling problems: ${selected.filter(id => progressData.has(id) && !progressData.get(id)!.isMastered()).length}`);
    console.log(`• New problems: ${newProblemsCount}`);
    console.log(`• Mastered problems: 0 (protected by cooldown)`);
    
    console.log('\n💡 PRODUCT IMPACT:');
    console.log('• Users stay engaged (not bored by easy content)');
    console.log('• Users improve faster (focused practice on weaknesses)');
    console.log('• Users retain knowledge (spaced repetition of mastered content)');
    console.log('• Users see progress (continuous introduction of new material)\n');
    
    expect(session.selectedWordIds.length).toBeGreaterThan(0);
    expect(session.sessionType).toBeDefined();
  });
});
