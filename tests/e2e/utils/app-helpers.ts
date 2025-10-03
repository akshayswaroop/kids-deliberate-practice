import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

export async function gotoAppWithFreshStorage(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => typeof (window as any).__seedState === 'function');
}

export async function clickWhenEnabled(locator: Locator) {
  await expect(locator).toBeVisible();
  await expect(locator).toBeEnabled();
  await locator.click();
}

export async function dismissPracticeIntroIfPresent(page: Page) {
  const overlay = page.getByTestId('practice-intro-overlay');
  if ((await overlay.count()) === 0) {
    return;
  }

  if (!(await overlay.isVisible())) {
    return;
  }

  const skipButton = page.getByRole('button', { name: /Skip tour/i });
  let skipVisible = false;
  try {
    skipVisible = await skipButton.isVisible();
  } catch {
    skipVisible = false;
  }

  if (skipVisible) {
    await skipButton.click();
  } else {
    const startButton = page.getByRole('button', { name: /Start practicing/i });
    let startVisible = false;
    try {
      startVisible = await startButton.isVisible();
    } catch {
      startVisible = false;
    }
    if (startVisible) {
      await startButton.click();
    }
  }

  await expect(overlay).toBeHidden();
}
