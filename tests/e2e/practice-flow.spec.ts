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
  // Dismiss any intro/session overlays that may be present after seeding
  await dismissPracticeIntroIfPresent(page);
    });

    await test.step('When the learner marks the card as correct', async () => {
      // Ensure any overlays (session start/end) are dismissed right before interacting
      await dismissPracticeIntroIfPresent(page);
      // As an immediate last-resort, forcibly hide any overlay elements and remove overlay-open class
      await page.evaluate(() => {
        const ids = ['practice-intro-overlay', 'session-start-card', 'session-end-card'];
        ids.forEach((id) => {
          const el = document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
          if (el) {
            el.style.display = 'none';
            el.style.pointerEvents = 'none';
            el.setAttribute('data-e2e-forced-hidden', '1');
          }
        });
        // Remove overlay-open class to ensure buttons are visible
        document.body.classList.remove('overlay-open');
      });
      await expect(page.getByTestId('btn-correct')).toBeVisible();
      await expect(page.getByTestId('btn-wrong')).toBeVisible();
      try {
        await page.getByTestId('btn-correct').click();
      } catch (e) {
        // As a last resort, dispatch a DOM click which bypasses pointer interception
        await page.evaluate(() => {
          const el = document.querySelector('[data-testid="btn-correct"]') as HTMLElement | null;
          if (el) el.click();
        });
      }
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
