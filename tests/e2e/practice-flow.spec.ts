import { test, expect } from '@playwright/test';
import { gotoAppWithFreshStorage, dismissPracticeIntroIfPresent } from './utils/app-helpers';

test.describe('Story: Practicing a seeded word', () => {
  test('Scenario: Learner answers the current card correctly', async ({ page }) => {
    await test.step('Given a fresh browser context', async () => {
      await gotoAppWithFreshStorage(page);
      await page.waitForFunction(() => typeof (window as any).__seedState === 'function');
    });

    await test.step('And a deterministic practice session exists', async () => {
      await page.evaluate(() => {
        (window as any).__seedState?.({
          users: {
            test: {
              displayName: 'Test',
              words: {
                w1: {
                  id: 'w1',
                  text: 'ಗಾ',
                  wordKannada: 'ಗಾ',
                  language: 'kannada',
                  complexityLevel: 1,
                  answer: 'Meaning',
                  notes: 'Note',
                  attempts: [],
                  step: 0,
                  revealCount: 0,
                  cooldownSessionsLeft: 0,
                },
              },
              sessions: {
                s1: {
                  sessionId: 's1',
                  wordIds: ['w1'],
                  currentIndex: 0,
                  needsNewSession: false,
                  revealed: false,
                },
              },
              activeSessions: { kannada: 's1' },
              currentMode: 'kannada',
              settings: { sessionSizes: {}, languages: ['kannada'], complexityLevels: { kannada: 1 } },
            },
          },
          currentUserId: 'test',
        });
      });
  await page.waitForFunction(() => !!document.querySelector('[data-testid="practice-root"]'));
  // Dismiss any intro/session overlays that may be present after seeding
  await dismissPracticeIntroIfPresent(page);
    });

    await test.step('When the learner assembles the tiles and checks their answer', async () => {
      // Ensure any overlays (session start/end) are dismissed right before interacting
      await dismissPracticeIntroIfPresent(page);
      const targetSegments = ['ಗ', 'ಾ'];
      for (const segment of targetSegments) {
        await page.locator(`[data-segment="${segment}"]`).first().click();
      }
      const checkButton = page.getByRole('button', { name: /check my word/i });
      await expect(checkButton).toBeEnabled();
      await checkButton.click();
      await expect(page.getByText('Brilliant! You built it perfectly.', { exact: false })).toBeVisible();
    });

    await test.step('Then the practice state records the attempt', async () => {
      const state = await page.evaluate(() => (window as any).__readState?.());
      if (state) {
        expect(state).toHaveProperty('game');
        const uid = state.game.currentUserId;
        const word = state.game.users[uid].words['w1'];
        expect(Array.isArray(word.attempts)).toBeTruthy();
        expect(word.attempts.length).toBeGreaterThan(0);
      }
    });
  });
});
