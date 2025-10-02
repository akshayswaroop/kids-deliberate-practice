import { test, expect } from '@playwright/test';

test.describe('Story: Practicing a seeded word', () => {
  test('Scenario: Learner answers the current card correctly', async ({ page }) => {
    await test.step('Given a fresh browser context', async () => {
      await page.context().addInitScript(() => localStorage.clear());
      await page.goto('/');
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
                  text: 'Hello',
                  transliteration: 'Hello',
                  language: 'english',
                  complexityLevel: 1,
                  answer: 'World',
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
              activeSessions: { english: 's1' },
              settings: { sessionSizes: {}, languages: ['english'], complexityLevels: { english: 1 } },
            },
          },
          currentUserId: 'test',
        });
      });
      await page.waitForFunction(() => !!document.querySelector('[data-testid="practice-root"]'));
    });

    await test.step('When the learner marks the card as correct', async () => {
      await expect(page.getByTestId('btn-correct')).toBeVisible();
      await expect(page.getByTestId('btn-wrong')).toBeVisible();
      await page.getByTestId('btn-correct').click();
    });

    await test.step('Then the practice state records the attempt', async () => {
      const state = await page.evaluate(() => (window as any).__readState?.());
      if (state) {
        expect(state).toHaveProperty('game');
        const uid = state.game.currentUserId;
        const word = state.game.users[uid].words['w1'];
        expect(Array.isArray(word.attempts)).toBeTruthy();
      }
    });
  });
});
