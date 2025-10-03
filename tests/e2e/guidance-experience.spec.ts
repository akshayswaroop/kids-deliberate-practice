import { expect, test } from '@playwright/test';
import { dismissPracticeIntroIfPresent, gotoAppWithFreshStorage } from './utils/app-helpers';

const createUserFlow = async (page: import('@playwright/test').Page) => {
  await gotoAppWithFreshStorage(page);
  await expect(page.getByTestId('onboarding-container')).toBeVisible();
  await page.getByTestId('onboarding-name-input').fill('Coachmark Tester');
  await page.getByTestId('onboarding-create-button').click();
  await expect(page.getByTestId('practice-intro-overlay')).toBeVisible();
  await dismissPracticeIntroIfPresent(page);
};

test.describe('Guidance overlays', () => {
  test('Callouts stay hidden once the intro tour is dismissed', async ({ page }) => {
    await createUserFlow(page);

    await expect(page.getByTestId('practice-intro-overlay')).toBeHidden();

    await expect(page.getByTestId('practice-root')).toBeVisible();
    await expect(page.getByTestId('coachmark-profiles')).toHaveCount(0);
    await expect(page.getByTestId('coachmark-streak')).toHaveCount(0);

    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await dismissPracticeIntroIfPresent(page);
    await expect(page.getByTestId('onboarding-container')).toHaveCount(0);
    await expect(page.getByTestId('practice-root')).toBeVisible();
    await expect(page.getByTestId('coachmark-profiles')).toHaveCount(0);
    await expect(page.getByTestId('coachmark-streak')).toHaveCount(0);
  });
});
