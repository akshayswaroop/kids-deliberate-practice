import { test, expect } from '@playwright/test';
import { gotoAppWithFreshStorage, seedSingleWordSession } from './utils/app-helpers';

test.describe('Parent Banner Messages', () => {
  test('should show contextual messages after answering', async ({ page }) => {
    await test.step('Setup: Create a deterministic session', async () => {
      await gotoAppWithFreshStorage(page);
      await seedSingleWordSession(page, {
        id: 'w1',
        text: 'Hello',
        language: 'english',
        answer: 'World',
        notes: '',
      });
    });

    await test.step('Initial state: should show session introduction message', async () => {
      const banner = page.getByTestId('unified-parent-banner');
      await expect(banner).toBeVisible();
      
      const bannerText = await banner.textContent();
      console.log('Initial banner text:', bannerText);
      // With the new session guidance priority, first question shows session introduction
      expect(bannerText).toContain('Practice Set');
      expect(bannerText).toContain('Master this question'); // Single question session
    });

    await test.step('After clicking correct: should show success message', async () => {
      await expect(page.getByTestId('btn-correct')).toBeVisible();
      
      await page.getByTestId('btn-correct').click();
      
      await expect.poll(async () => {
        const state = await page.evaluate(() => {
          const s = (window as any).__readState?.();
          return s?.game?.users?.['test-user']?.words?.w1;
        });
        return state?.attempts?.length;
      }, { message: 'waiting for recorded attempt' }).toBe(1);

      // After answering, session guidance is no longer shown, word guidance takes over
      await expect(page.getByTestId('unified-parent-banner')).not.toContainText('Practice Set');
    });
  });
});
