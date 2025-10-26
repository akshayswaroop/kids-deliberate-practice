import { test, expect } from '@playwright/test';
import { gotoAppWithFreshStorage, seedSingleWordSession, ensurePracticeOverlayDismissed } from './utils/app-helpers';

const nextButton = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: /move to next question/i });

const correctButton = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: /kid answered correctly/i });

const wrongButton = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: /kid needs another try/i });

const practiceRoot = (page: import('@playwright/test').Page) =>
  page.locator('[data-testid="practice-root"]');

const banner = (page: import('@playwright/test').Page) =>
  page.getByTestId('unified-parent-banner');

test.describe('Feedback Animation and Button States', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAppWithFreshStorage(page);
    await seedSingleWordSession(page, {
      id: 'w1',
      text: 'The pen is green.',
      language: 'english',
    });
    // Note: seedSingleWordSession now handles overlay dismissal and practice startup
  });

  test('banner reacts once and stays stable after a correct answer', async ({ page }) => {
    await correctButton(page).click();
    // After answering, session guidance is no longer shown, word guidance takes over
    await expect(banner(page)).not.toContainText('Practice Set');
  // Accept a range of positive cues that our UI may emit
  await expect(banner(page)).toHaveText(/Nice|Good|Great|mastered|All done/i);
  });

  test('Next enables after correct animation and previous buttons stay disabled', async ({ page }) => {
    const correct = correctButton(page);
    const next = nextButton(page);

    await correct.click();
    await expect(next).toBeDisabled();
    await expect(next).toBeEnabled({ timeout: 3500 });
    await expect(correct).toBeDisabled();
  });

  test('Next enables after wrong animation and wrong button stays disabled', async ({ page }) => {
    const wrong = wrongButton(page);
    const next = nextButton(page);

    await wrong.click();
    await expect(next).toBeDisabled();
    await expect(next).toBeEnabled({ timeout: 3500 });
    await expect(wrong).toBeDisabled();
  });

  test('card applies shake animation on wrong answer', async ({ page }) => {
    await wrongButton(page).click();
    await expect(practiceRoot(page)).toHaveAttribute('data-shake-state', 'active');
    await expect(practiceRoot(page)).toHaveAttribute('data-shake-state', 'idle', { timeout: 1000 });
  });
});
