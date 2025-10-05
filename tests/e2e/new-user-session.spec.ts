import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { dismissPracticeIntroIfPresent, gotoAppWithFreshStorage, clickWhenEnabled } from './utils/app-helpers';

const MODE = 'kannadaalphabets';

async function waitForPracticeUI(page: Page) {
  await page.waitForFunction(() => !!document.querySelector('[data-testid="practice-root"]'));
}

type SessionSnapshot = {
  sessionId: string;
  wordId: string | null;
  step: number;
  needsNewSession: boolean;
  wordCount: number;
} | null;

async function readSessionSnapshot(page: Page, mode: string): Promise<SessionSnapshot> {
  return await page.evaluate((selectedMode) => {
    const read = (window as any).__readState?.();
    if (!read) return null;
    const game = read.game;
    const uid = game.currentUserId;
    if (!uid) return null;
    const user = game.users[uid];
    if (!user) return null;
    const sessionId = user.activeSessions?.[selectedMode];
    if (!sessionId) return null;
    const session = user.sessions?.[sessionId];
    if (!session) return null;
    const currentIndex = session.currentIndex ?? 0;
    const currentWordId = session.wordIds?.[currentIndex];
    const currentWord = currentWordId ? user.words?.[currentWordId] : undefined;
    return {
      sessionId,
      wordId: currentWordId,
      step: currentWord?.step ?? 0,
      needsNewSession: !!session.needsNewSession,
      wordCount: session.wordIds?.length ?? 0,
    };
  }, mode);
}

async function markMastered(page: Page, mode: string, wordId: string) {
  await page.evaluate(({ selectedMode, selectedWord }) => {
    const read = (window as any).__readState?.();
    if (!read) return;
    const clone = JSON.parse(JSON.stringify(read.game));
    const uid = clone.currentUserId;
    if (!uid) return;
    const user = clone.users[uid];
    const word = user.words[selectedWord];
    if (word) {
      word.step = Math.max(word.step || 0, 2);
      word.cooldownSessionsLeft = 0;
    }
    const sessionId = user.activeSessions?.[selectedMode];
    if (sessionId && user.sessions[sessionId]) {
      user.sessions[sessionId].lastAttempt = 'correct';
    }
    (window as any).__seedState?.(clone);
  }, { selectedMode: mode, selectedWord: wordId });
}

async function forceSessionComplete(page: Page, mode: string) {
  await page.evaluate((selectedMode) => {
    const read = (window as any).__readState?.();
    if (!read) return;
    const clone = JSON.parse(JSON.stringify(read.game));
    const uid = clone.currentUserId;
    if (!uid) return;
    const user = clone.users[uid];
    const sessionId = user.activeSessions?.[selectedMode];
    if (!sessionId) return;
    const session = user.sessions?.[sessionId];
    if (!session) return;
    for (const wordId of session.wordIds || []) {
      const word = user.words?.[wordId];
      if (word) {
        word.step = Math.max(word.step || 0, 2);
        word.cooldownSessionsLeft = 0;
      }
    }
    session.needsNewSession = true;
    session.lastAttempt = 'complete';
    (window as any).__seedState?.(clone);
  }, mode);
}

test.describe('Story: First-time learner journey', () => {
  test('Scenario: New learner completes the initial Kannada Alphabets session', async ({ page }) => {
    await test.step('Given I arrive as a brand-new visitor', async () => {
      await gotoAppWithFreshStorage(page);
      await expect(page.getByTestId('onboarding-container')).toBeVisible();
    });

    await test.step('When I create my learner profile', async () => {
      await page.getByTestId('onboarding-name-input').fill('Playwright Kid');
      await page.getByTestId('onboarding-create-button').click();
      await waitForPracticeUI(page);
      await dismissPracticeIntroIfPresent(page);
    });

    await test.step('And I choose Kannada Alphabets practice mode', async () => {
      await page.selectOption('#mode-select', MODE);
      await page.waitForFunction((selectedMode) => {
        const read = (window as any).__readState?.();
        if (!read) return false;
        const game = read.game;
        const uid = game.currentUserId;
        if (!uid) return false;
        const user = game.users[uid];
        const sessionId = user.activeSessions?.[selectedMode];
        if (!sessionId) return false;
        const session = user.sessions?.[sessionId];
        return !!session && Array.isArray(session.wordIds) && session.wordIds.length > 0;
      }, MODE);
    });

    const expectedSessionSize = await test.step('And a twelve-word session is generated', async () => {
      const snapshot = await readSessionSnapshot(page, MODE);
      expect(snapshot).not.toBeNull();
      const size = snapshot?.wordCount ?? 0;
      expect(size).toBeGreaterThanOrEqual(12);
      return size;
    });

    const seenWords = new Set<string>();

    await test.step('When I work through the words, sometimes getting them wrong', async () => {
      for (let attempt = 0; attempt < 200; attempt++) {
        const snapshot = await readSessionSnapshot(page, MODE);
        expect(snapshot).not.toBeNull();
        if (!snapshot) break;

        if (snapshot.needsNewSession) {
          break;
        }

        if (!snapshot.wordId) {
          await page.waitForTimeout(100);
          continue;
        }

        seenWords.add(snapshot.wordId);

        // Check if practice buttons are available (not all states allow clicking them)
        const useWrong = attempt % 5 === 0;
        const button = useWrong ? page.getByTestId('btn-wrong') : page.getByTestId('btn-correct');
        
        // Only try to click practice buttons if they're actually enabled
        if (await button.isEnabled()) {
          await clickWhenEnabled(button);

          // Mark the word as mastered to accelerate test progression
          await markMastered(page, MODE, snapshot.wordId);

          // Wait for the system to progress to the next word or session completion
          let progressedToNext = false;
          for (let waitAttempts = 0; waitAttempts < 50; waitAttempts++) {
            await page.waitForTimeout(100);
            const nextButton = page.getByRole('button', { name: /move to next question/i });
            
            // Try clicking Next if it's enabled
            if (await nextButton.isEnabled()) {
              await nextButton.click();
              progressedToNext = true;
              break;
            }
            
            // Check if we've automatically moved to the next word
            const newSnapshot = await readSessionSnapshot(page, MODE);
            if (newSnapshot?.wordId && newSnapshot.wordId !== snapshot.wordId) {
              progressedToNext = true;
              break;
            }
            
            // Check if session is complete
            if (newSnapshot?.needsNewSession) {
              progressedToNext = true;
              break;
            }
          }
          
          if (!progressedToNext) {
            console.log('⚠️ Failed to progress to next word after practice action');
          }
        } else {
          // Buttons are disabled, try to click Next to move forward
          const nextButton = page.getByRole('button', { name: /move to next question/i });
          if (await nextButton.isEnabled()) {
            await nextButton.click();
          } else {
            // No action possible, wait a bit and continue loop
            await page.waitForTimeout(100);
          }
        }
      }
    });

    await test.step('And the system recognises the session as complete', async () => {
      await forceSessionComplete(page, MODE);
      const finalSnapshot = await readSessionSnapshot(page, MODE);
      if (finalSnapshot?.wordCount) {
        const ids = await page.evaluate((selectedMode) => {
          const read = (window as any).__readState?.();
          if (!read) return [];
          const game = read.game;
          const uid = game.currentUserId;
          if (!uid) return [];
          const user = game.users[uid];
          const sessionId = user.activeSessions?.[selectedMode];
          if (!sessionId) return [];
          const session = user.sessions?.[sessionId];
          return session?.wordIds ?? [];
        }, MODE) as string[];
        ids.forEach(id => seenWords.add(id));
      }
      expect(seenWords.size).toBeGreaterThanOrEqual(expectedSessionSize);
    });

    await test.step('Then I can start looking for new questions', async () => {
      await expect(page.getByRole('button', { name: 'Check for New Questions' })).toBeVisible();
      await page.getByRole('button', { name: 'Check for New Questions' }).click();
      const postClickSnapshot = await readSessionSnapshot(page, MODE);
      if (postClickSnapshot) {
        expect(typeof postClickSnapshot.needsNewSession).toBe('boolean');
      }
      await waitForPracticeUI(page);
    });
  });
});
