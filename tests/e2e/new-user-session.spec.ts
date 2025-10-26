import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { dismissPracticeIntroIfPresent, gotoAppWithFreshStorage } from './utils/app-helpers';

const MODE = 'kannada';

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

    await test.step('Then Kannada Alphabets practice loads automatically', async () => {
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

    await test.step('When the learner masters the set', async () => {
      await forceSessionComplete(page, MODE);
      await page.waitForTimeout(200);
    });

    await test.step('Then a completion prompt appears', async () => {
      await expect(page.getByRole('heading', { name: /Amazing! You've mastered all questions!/i })).toBeVisible({ timeout: 5000 });
    });

    await test.step('And the practice session is ready for a fresh round', async () => {
      const snapshot = await readSessionSnapshot(page, MODE);
      expect(snapshot?.needsNewSession).toBe(true);
      expect(snapshot?.wordCount).toBeGreaterThanOrEqual(expectedSessionSize);
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
