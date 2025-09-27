import { test, expect } from '@playwright/test';

test.describe('Session Rotation Bug in English Mode', () => {
  test('should generate new session after mastering 2 complete sets, not rotate within second set', async ({ page }) => {
    // Start the app
    await page.goto('http://localhost:5174');
    
    // Wait for app to load and skip onboarding if present
    await page.waitForSelector('body');
    
    // Check if onboarding is present and create a user if needed
    const onboardingPresent = await page.locator('text=Create Your Profile').isVisible().catch(() => false);
    if (onboardingPresent) {
      await page.fill('input[placeholder*="name" i]', 'TestUser');
      await page.click('button:has-text("Start Learning")');
      await page.waitForTimeout(1000);
    }
    
    // Ensure we're in English mode
    const modeSelector = page.locator('select, [data-testid="mode-selector"]').first();
    if (await modeSelector.isVisible().catch(() => false)) {
      await modeSelector.selectOption('english');
      await page.waitForTimeout(500);
    }
    
    // Wait for practice card to load
    await page.waitForSelector('.mastery-tile', { timeout: 10000 });
    
    // Helper function to master all words in current session
    const masterCurrentSession = async (sessionNumber: number) => {
      console.log(`\n=== MASTERING SESSION ${sessionNumber} ===`);
      
      const sessionWords: string[] = [];
      let wordsToMaster = new Set<string>();
      
      // Collect all words in current session by cycling through them
      for (let i = 0; i < 15; i++) { // Max 15 attempts to find all words
        const mainWordElement = page.locator('.target-word-glow').first();
        await mainWordElement.waitFor({ timeout: 5000 });
        const currentWord = await mainWordElement.textContent();
        
        if (currentWord && !wordsToMaster.has(currentWord)) {
          wordsToMaster.add(currentWord);
          sessionWords.push(currentWord);
          console.log(`Found word in session ${sessionNumber}: "${currentWord}"`);
        }
        
        // Click Next to cycle to next word
        await page.click('button:has-text("Next")');
        await page.waitForTimeout(300);
        
        // If we've seen 12+ words or we're cycling back to first word, break
        if (wordsToMaster.size >= 12 || (sessionWords.length > 0 && currentWord === sessionWords[0] && i > 0)) {
          break;
        }
      }
      
      console.log(`Session ${sessionNumber} contains ${wordsToMaster.size} unique words: [${Array.from(wordsToMaster).join(', ')}]`);
      
      // Now master each word in the session
      for (const wordToMaster of wordsToMaster) {
        let attempts = 0;
        while (attempts < 20) { // Max 20 attempts to find and master each word
          const mainWordElement = page.locator('.target-word-glow').first();
          await mainWordElement.waitFor({ timeout: 5000 });
          const currentWord = await mainWordElement.textContent();
          
          if (currentWord === wordToMaster) {
            // Found the word we want to master, click correct multiple times
            console.log(`Mastering word: "${currentWord}"`);
            for (let correct = 0; correct < 6; correct++) {
              await page.click('button:has-text("Read it well!")');
              await page.waitForTimeout(200);
            }
            console.log(`✓ Mastered: "${currentWord}"`);
            break;
          } else {
            // Not the word we want, click Next to find it
            await page.click('button:has-text("Next")');
            await page.waitForTimeout(300);
          }
          attempts++;
        }
        
        if (attempts >= 20) {
          console.log(`⚠️  Could not find word "${wordToMaster}" after 20 attempts`);
        }
      }
      
      return Array.from(wordsToMaster);
    };
    
    // Master first session
    const session1Words = await masterCurrentSession(1);
    
    // Click Next to trigger new session generation
    console.log(`\n=== CLICKING NEXT AFTER SESSION 1 ===`);
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    
    // Master second session
    const session2Words = await masterCurrentSession(2);
    
    // Verify session 2 has different words than session 1
    const session1Set = new Set(session1Words);
    const session2Set = new Set(session2Words);
    const overlap = session1Words.filter(word => session2Set.has(word));
    console.log(`Session overlap: ${overlap.length} words: [${overlap.join(', ')}]`);
    
    // Now for the critical test - click Next after mastering session 2
    console.log(`\n=== CLICKING NEXT AFTER SESSION 2 (THE CRITICAL MOMENT) ===`);
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    
    // Check what word appears - it should be from a NEW session (session 3)
    const firstWordAfterSession2 = await page.locator('.target-word-glow').first().textContent();
    console.log(`First word after clicking Next: "${firstWordAfterSession2}"`);
    
    // Collect several words from what should be session 3
    const potentialSession3Words = new Set<string>();
    for (let i = 0; i < 8; i++) {
      const currentWord = await page.locator('.target-word-glow').first().textContent();
      if (currentWord) {
        potentialSession3Words.add(currentWord);
      }
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(300);
    }
    
    console.log(`Words appearing after session 2: [${Array.from(potentialSession3Words).join(', ')}]`);
    
    // Check if these words are from session 2 (BUG) or genuinely new words (CORRECT)
    const wordsFromSession2 = Array.from(potentialSession3Words).filter(word => session2Set.has(word));
    const newWords = Array.from(potentialSession3Words).filter(word => !session2Set.has(word) && !session1Set.has(word));
    
    console.log(`\n=== BUG ANALYSIS ===`);
    console.log(`Words recycled from session 2: ${wordsFromSession2.length} - [${wordsFromSession2.join(', ')}]`);
    console.log(`Genuinely new words: ${newWords.length} - [${newWords.join(', ')}]`);
    
    // The bug exists if we're seeing mostly session 2 words instead of new words
    if (wordsFromSession2.length > potentialSession3Words.size / 2) {
      console.log(`🐛 BUG CONFIRMED: After mastering 2 sessions, clicking Next is recycling session 2 words instead of creating new session`);
      console.log(`Expected: New session with different words`);
      console.log(`Actual: Rotating within session 2 words`);
    } else {
      console.log(`✅ BEHAVIOR CORRECT: New session created with fresh words`);
    }
    
    // Assertions to formalize the test
    expect(session1Words.length).toBeGreaterThan(0);
    expect(session2Words.length).toBeGreaterThan(0);
    expect(potentialSession3Words.size).toBeGreaterThan(0);
    
    // The critical assertion - we should NOT be rotating within session 2
    // If bug exists, this will fail and document the issue
    expect(wordsFromSession2.length).toBeLessThan(potentialSession3Words.size / 2);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'tests/screenshots/session-rotation-bug.png' });
  });
});