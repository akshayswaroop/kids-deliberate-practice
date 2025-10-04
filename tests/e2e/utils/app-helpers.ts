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

  // Also dismiss session start overlay if present (new session framing overlay)
  const sessionStart = page.getByTestId('session-start-card');
  try {
    if ((await sessionStart.count()) > 0 && (await sessionStart.isVisible())) {
      // Try matching the Start Practice button label
      const startBtn = page.getByRole('button', { name: /Start Practice/i });
      if (await startBtn.count() > 0) {
        await startBtn.click();
        await expect(sessionStart).toBeHidden();
      } else {
        // Fallback: click any visible button inside the overlay
        const btns = sessionStart.locator('button');
        if ((await btns.count()) > 0) {
          await btns.first().click();
          await expect(sessionStart).toBeHidden();
        }
      }
    }
  } catch (e) {
    // Ignore errors here; helper should be resilient in CI/local runs
  }

  // If practice-root still not visible, try sending Escape and clicking overlay backdrop as a last resort
  try {
    await page.keyboard.press('Escape');
    // Click center of viewport to dismiss any modal that closes on backdrop click
    const vp = page.viewportSize();
    const cx = vp && vp.width ? Math.floor(vp.width / 2) : 100;
    const cy = vp && vp.height ? Math.floor(vp.height / 2) : 100;
    await page.mouse.click(cx, cy);
  } catch (e) {
    // ignore
  }
}
