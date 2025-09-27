import { test, expect } from '@playwright/test';

test.describe('Session Rotation Bug - 80% Threshold', () => {
  test('should create new session when 80% of words are mastered', async ({ page }) => {
    // Start with a fresh app
    await page.goto('http://localhost:5174');
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="practice-card"]', { timeout: 5000 }).catch(() => {
      // If no test ID, wait for the practice interface
      return page.waitForSelector('text="Next word"', { timeout: 5000 });
    });
    
    // Get initial session info
    const initialSessionInfo = await page.evaluate(() => {
      const gameState = localStorage.getItem('gameState');
      if (!gameState) return null;
      const parsed = JSON.parse(gameState);
      const user = parsed.users[parsed.currentUserId];
      const sessionId = user.activeSessions['english'];
      const session = user.sessions[sessionId];
      return {
        sessionId,
        wordIds: session.wordIds,
        wordCount: session.wordIds.length
      };
    });
    
    console.log('Initial session:', initialSessionInfo);
    
    if (!initialSessionInfo) {
      throw new Error('No initial session found');
    }
    
    // Master 80% of words (10 out of 12) by dispatching correct attempts
    const wordsToMaster = initialSessionInfo.wordIds.slice(0, 10); // First 10 words
    
    for (const wordId of wordsToMaster) {
      // Master each word by making 5 correct attempts (step 0 -> 5)
      for (let attempt = 0; attempt < 5; attempt++) {
        await page.evaluate(([sessionId, wordId]) => {
          // Simulate a correct attempt by directly manipulating state
          const gameState = localStorage.getItem('gameState');
          if (!gameState) return;
          const parsed = JSON.parse(gameState);
          const user = parsed.users[parsed.currentUserId];
          
          if (!user.words[wordId]) {
            user.words[wordId] = { step: 0, attempts: [] };
          }
          
          // Add correct attempt
          user.words[wordId].attempts.push({
            timestamp: Date.now(),
            result: 'correct'
          });
          
          // Advance step
          user.words[wordId].step = Math.min(5, user.words[wordId].step + 1);
          user.words[wordId].lastPracticedAt = Date.now();
          
          if (user.words[wordId].step === 5) {
            user.words[wordId].lastRevisedAt = Date.now();
            user.words[wordId].cooldownSessionsLeft = 1;
          }
          
          localStorage.setItem('gameState', JSON.stringify(parsed));
        }, [initialSessionInfo.sessionId, wordId]);
      }
    }
    
    // Verify 10 words are mastered
    const masteredCount = await page.evaluate(([sessionId]) => {
      const gameState = localStorage.getItem('gameState');
      if (!gameState) return 0;
      const parsed = JSON.parse(gameState);
      const user = parsed.users[parsed.currentUserId];
      const session = user.sessions[sessionId];
      
      return session.wordIds.filter((wordId: any) => {
        const word = user.words[wordId];
        return word && word.step === 5;
      }).length;
    }, [initialSessionInfo.sessionId]);
    
    console.log(`Mastered ${masteredCount}/12 words (${Math.round(masteredCount/12*100)}%)`);
    expect(masteredCount).toBe(10);
    
    // Now click "Next word" - this should trigger new session creation
    await page.click('text="Next word"');
    
    // Wait a moment for state to update
    await page.waitForTimeout(500);
    
    // Check if a new session was created
    const finalSessionInfo = await page.evaluate(() => {
      const gameState = localStorage.getItem('gameState');
      if (!gameState) return null;
      const parsed = JSON.parse(gameState);
      const user = parsed.users[parsed.currentUserId];
      const sessionId = user.activeSessions['english'];
      const session = user.sessions[sessionId];
      return {
        sessionId,
        wordIds: session.wordIds,
        sessionCount: Object.keys(user.sessions).length
      };
    });
    
    console.log('Final session:', finalSessionInfo);
    
    if (!finalSessionInfo) {
      throw new Error('No final session found');
    }
    
    console.log('Session changed:', finalSessionInfo.sessionId !== initialSessionInfo.sessionId);
    console.log('Total sessions:', finalSessionInfo.sessionCount);
    
    // The bug: Session should have changed but doesn't
    expect(finalSessionInfo.sessionId).not.toBe(initialSessionInfo.sessionId);
    expect(finalSessionInfo.sessionCount).toBeGreaterThan(1);
  });
});