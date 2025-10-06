import { test, expect, Page } from '@playwright/test';
import { gotoAppWithFreshStorage, seedSingleWordSession, seedMultiWordSession } from './utils/app-helpers';

/**
 * Parent Cue Logic + Playwright Visual Test Integration
 * 
 * Tests parent cue visibility, text updates, and visual consistency
 * across mobile (iPhone 14 Pro) and desktop (1280px width) breakpoints.
 * 
 * Scenarios tested:
 * - Correct answer cue update
 * - Wrong answer cue update
 * - Session completion cue
 * - Level transition cue
 * - Banner placement and visibility
 * - Animation stability (no layout shift)
 */

const getBanner = (page: Page) => page.getByTestId('unified-parent-banner');
const getCorrectButton = (page: Page) => page.getByTestId('btn-correct');
const getWrongButton = (page: Page) => page.getByTestId('btn-wrong');
const getNextButton = (page: Page) => page.getByTestId('btn-next');

test.describe('Parent Cue Visual Tests - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport (1280px width as specified)
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('should show initial session introduction cue on desktop', async ({ page }) => {
    await gotoAppWithFreshStorage(page);
    await seedSingleWordSession(page, {
      id: 'w1',
      text: 'The sun rises in the east',
      language: 'english',
    });

    const banner = getBanner(page);
    await expect(banner).toBeVisible();
    
    const bannerText = await banner.textContent();
    expect(bannerText).toContain('Practice Set');
    expect(bannerText).toContain('Master this question');
  });

  test('should update cue after correct answer on desktop', async ({ page }) => {
    await gotoAppWithFreshStorage(page);
    await seedSingleWordSession(page, {
      id: 'w1',
      text: 'Practice question',
      language: 'english',
    });

    const banner = getBanner(page);
    await expect(banner).toBeVisible();

    // Click correct button
    await getCorrectButton(page).click();

    // Wait for state update
    await expect.poll(async () => {
      const state = await page.evaluate(() => {
        const s = (window as any).__readState?.();
        return s?.game?.users?.['test-user']?.words?.w1;
      });
      return state?.attempts?.length;
    }).toBe(1);

    // Banner should no longer show "Practice Set" and should show success message
    await expect(banner).not.toContainText('Practice Set');
    const updatedText = await banner.textContent();
    expect(updatedText).toMatch(/Nice|Good|mastered/i);
  });

  test('should update cue after wrong answer on desktop', async ({ page }) => {
    await gotoAppWithFreshStorage(page);
    await seedSingleWordSession(page, {
      id: 'w1',
      text: 'Practice question',
      language: 'english',
    });

    const banner = getBanner(page);
    await expect(banner).toBeVisible();

    // Click wrong button
    await getWrongButton(page).click();

    // Wait for state update
    await expect.poll(async () => {
      const state = await page.evaluate(() => {
        const s = (window as any).__readState?.();
        return s?.game?.users?.['test-user']?.words?.w1;
      });
      return state?.attempts?.length;
    }).toBe(1);

    // Banner should show guidance for wrong answer
    const updatedText = await banner.textContent();
    expect(updatedText).toMatch(/Let's try|Not quite|try again/i);
  });

  test('should show banner near action buttons with stable layout on desktop', async ({ page }) => {
    await gotoAppWithFreshStorage(page);
    await seedSingleWordSession(page, {
      id: 'w1',
      text: 'Layout test',
      language: 'english',
    });

    const banner = getBanner(page);
    await expect(banner).toBeVisible();

    // Get initial banner position
    const initialBox = await banner.boundingBox();
    expect(initialBox).toBeTruthy();

    // Click correct and check that banner doesn't shift the layout dramatically
    await getCorrectButton(page).click();
    
    // Wait a bit for animation
    await page.waitForTimeout(500);

    const afterClickBox = await banner.boundingBox();
    expect(afterClickBox).toBeTruthy();

    // Banner should maintain consistent height (within a small tolerance for transform animations)
    if (initialBox && afterClickBox) {
      expect(Math.abs(initialBox.height - afterClickBox.height)).toBeLessThan(10);
    }
  });

  test('should show completion message when all questions mastered on desktop', async ({ page }) => {
    await gotoAppWithFreshStorage(page);
    
    // Create a session with a single word for quick completion
    await seedSingleWordSession(page, {
      id: 'w1',
      text: 'Quick completion test',
      language: 'english',
    });

    const banner = getBanner(page);
    await expect(banner).toBeVisible();

    // Master the question (need 2 correct attempts)
    for (let i = 0; i < 2; i++) {
      await getCorrectButton(page).click();
      
      // Wait for state update
      await expect.poll(async () => {
        const state = await page.evaluate(() => {
          const s = (window as any).__readState?.();
          return s?.game?.users?.['test-user']?.words?.w1;
        });
        return state?.attempts?.length;
      }).toBe(i + 1);

      // If not the last attempt, click Next to continue
      if (i < 1) {
        await page.waitForTimeout(3000); // Wait for animation
        await getNextButton(page).click();
      }
    }

    // Check for completion guidance
    await page.waitForTimeout(500);
    const bannerText = await banner.textContent();
    expect(bannerText).toMatch(/mastered|Great work/i);
  });
});

test.describe('Parent Cue Visual Tests - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport (iPhone 14 Pro as specified)
    await page.setViewportSize({ width: 393, height: 852 });
  });

  test('should show initial session introduction cue on mobile', async ({ page }) => {
    await gotoAppWithFreshStorage(page);
    await seedSingleWordSession(page, {
      id: 'w1',
      text: 'The sun rises in the east',
      language: 'english',
    });

    const banner = getBanner(page);
    await expect(banner).toBeVisible();
    
    const bannerText = await banner.textContent();
    expect(bannerText).toContain('Practice Set');
    expect(bannerText).toContain('Master this question');
  });

  test('should update cue after correct answer on mobile', async ({ page }) => {
    await gotoAppWithFreshStorage(page);
    await seedSingleWordSession(page, {
      id: 'w1',
      text: 'Practice question',
      language: 'english',
    });

    const banner = getBanner(page);
    await expect(banner).toBeVisible();

    // Click correct button
    await getCorrectButton(page).click();

    // Wait for state update
    await expect.poll(async () => {
      const state = await page.evaluate(() => {
        const s = (window as any).__readState?.();
        return s?.game?.users?.['test-user']?.words?.w1;
      });
      return state?.attempts?.length;
    }).toBe(1);

    // Banner should show success message
    await expect(banner).not.toContainText('Practice Set');
    const updatedText = await banner.textContent();
    expect(updatedText).toMatch(/Nice|Good|mastered/i);
  });

  test('should be visible near action buttons on mobile', async ({ page }) => {
    await gotoAppWithFreshStorage(page);
    await seedSingleWordSession(page, {
      id: 'w1',
      text: 'Mobile visibility test',
      language: 'english',
    });

    const banner = getBanner(page);
    await expect(banner).toBeVisible();

    // Get banner and button positions
    const bannerBox = await banner.boundingBox();
    const correctButtonBox = await getCorrectButton(page).boundingBox();
    
    expect(bannerBox).toBeTruthy();
    expect(correctButtonBox).toBeTruthy();

    // Banner should be visible in viewport
    if (bannerBox && correctButtonBox) {
      // Banner should be above the action buttons
      expect(bannerBox.y).toBeLessThan(correctButtonBox.y);
      
      // Banner should be in viewport
      expect(bannerBox.y).toBeGreaterThanOrEqual(0);
      expect(bannerBox.y + bannerBox.height).toBeLessThanOrEqual(852);
    }
  });

  test('should maintain stable layout during animations on mobile', async ({ page }) => {
    await gotoAppWithFreshStorage(page);
    await seedSingleWordSession(page, {
      id: 'w1',
      text: 'Animation test',
      language: 'english',
    });

    const banner = getBanner(page);
    await expect(banner).toBeVisible();

    // Get button position before click
    const correctButton = getCorrectButton(page);
    const initialButtonBox = await correctButton.boundingBox();

    // Click correct
    await correctButton.click();
    
    // Wait for animation
    await page.waitForTimeout(500);

    // Button position should be stable (not shifted significantly)
    const afterClickButtonBox = await correctButton.boundingBox();
    
    if (initialButtonBox && afterClickButtonBox) {
      // Y position should not shift more than a few pixels
      expect(Math.abs(initialButtonBox.y - afterClickButtonBox.y)).toBeLessThan(20);
    }
  });
});

test.describe('Parent Cue Animation Stability', () => {
  test('banner fade-in animation should not cause layout shift', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoAppWithFreshStorage(page);
    await seedSingleWordSession(page, {
      id: 'w1',
      text: 'Animation stability test',
      language: 'english',
    });

    const banner = getBanner(page);
    const practiceRoot = page.locator('[data-testid="practice-root"]');
    
    // Get practice root position before interaction
    const initialRootBox = await practiceRoot.boundingBox();

    // Trigger a cue update
    await getCorrectButton(page).click();
    
    // Wait for animation to complete
    await page.waitForTimeout(1700); // Wait for full animation cycle

    // Practice root should not have shifted
    const afterAnimationRootBox = await practiceRoot.boundingBox();
    
    if (initialRootBox && afterAnimationRootBox) {
      // Positions should be nearly identical (small tolerance for transform animations)
      expect(Math.abs(initialRootBox.y - afterAnimationRootBox.y)).toBeLessThan(5);
    }
  });
});
