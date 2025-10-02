import { test, expect } from '@playwright/test';

test.describe('Story: Kannada Revision Library', () => {
  test('Scenario: Learner opens revision view and can scroll tiles', async ({ page }) => {
    await page.context().addInitScript(() => localStorage.clear());

    await page.setViewportSize({ width: 1280, height: 560 });

    await page.goto('/');

    await expect(page.getByTestId('onboarding-container')).toBeVisible();
    await page.getByTestId('onboarding-name-input').fill('Scroll Tester');
    await page.getByTestId('onboarding-create-button').click();

    await page.getByTestId('practice-root').waitFor();

    await expect(page.getByTestId('btn-kannada-revision')).toHaveCount(0);

    await page.selectOption('#mode-select', 'kannadaalphabets');
    await expect(page.getByTestId('btn-kannada-revision')).toBeVisible();
    await page.waitForTimeout(50);
    await page.getByTestId('btn-kannada-revision').click();

    await page.waitForFunction(() => !!document.querySelector('.kr-grid'), { timeout: 5000 });

    const grid = page.locator('.kr-grid');
    await expect(grid).toBeVisible();

    const metrics = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>('.kr-grid');
      if (!el) return null;
      const { scrollHeight, clientHeight } = el;
      return { scrollHeight, clientHeight };
    });

    expect(metrics && metrics.scrollHeight > metrics.clientHeight).toBeTruthy();

    const scrolled = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>('.kr-grid');
      if (!el) return false;
      el.scrollTop = el.scrollHeight;
      return el.scrollTop > 0;
    });
    expect(scrolled).toBeTruthy();
  });
});
