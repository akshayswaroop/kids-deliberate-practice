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

export async function dismissPracticeIntroIfPresent(page: Page): Promise<void> {
  console.log('🔄 Checking for overlays to dismiss...');
  
  // First, dismiss practice-intro-overlay (if present) as it can block other UI elements
  const practiceIntroOverlay = page.getByTestId('practice-intro-overlay');
  if (await practiceIntroOverlay.isVisible()) {
    console.log('✅ Found practice-intro-overlay, dismissing...');
    
    // Look for start practice button
    const startBtn = practiceIntroOverlay.getByRole('button', { name: /start practice|begin|continue/i });
    
    if (await startBtn.isVisible()) {
      await startBtn.click();
    } else {
      // Fallback: try any button in the overlay
      const buttons = practiceIntroOverlay.locator('button');
      const buttonCount = await buttons.count();
      if (buttonCount > 0) {
        await buttons.first().click();
      }
    }
    
    // Wait for the overlay to disappear
    await practiceIntroOverlay.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('✅ practice-intro-overlay dismissed');
  }

  // Then check for session-end-card (appears after completing words)
  const sessionEndOverlay = page.getByTestId('session-end-card');
  if (await sessionEndOverlay.isVisible()) {
    console.log('✅ Found session-end-card overlay, dismissing...');
    
    // Try to find a continue or new session button
    const continueBtn = sessionEndOverlay.getByRole('button', { name: /continue|new session/i });
    
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    } else {
      // Fallback: click any button in the overlay
      const buttons = sessionEndOverlay.locator('button');
      const buttonCount = await buttons.count();
      if (buttonCount > 0) {
        await buttons.first().click();
      }
    }
    
    // Wait for the overlay to disappear
    await sessionEndOverlay.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('✅ session-end-card dismissed');
  }

  console.log('✅ All overlays checked and dismissed if present');
}

// Alias for test code that expects this name
export const ensurePracticeOverlayDismissed = dismissPracticeIntroIfPresent;

// Helper to seed a single-word session for deterministic E2E tests
export async function seedSingleWordSession(page: Page, word: { id: string; text: string; language: string; answer?: string; notes?: string }) {
  // Wait for the test bridge to be available
  await page.waitForFunction(() => typeof (window as any).__seedState === 'function');
  
  // Seed a complete, valid game state following the actual Redux schema
  await page.evaluate(({ word }) => {
    const userId = 'test-user';
    const sessionId = 'test-session';
    const mode = word.language || 'english';
    
    const gameState = {
      users: {
        [userId]: {
          displayName: 'Test User',
          words: {
            [word.id]: {
              id: word.id,
              text: word.text,
              language: word.language,
              complexityLevel: 1,
              answer: word.answer || '',
              notes: word.notes || '',
              attempts: [],
              step: 0, // Starting step for new words
              cooldownSessionsLeft: 0,
              revealCount: 0,
            },
          },
          sessions: {
            [sessionId]: {
              wordIds: [word.id],
              currentIndex: 0,
              revealed: false,
              mode: mode,
              createdAt: Date.now(),
              settings: {
                sessionSizes: { [mode]: 1 },
                languages: [word.language],
                complexityLevels: { [word.language]: 1 }
              }
            }
          },
          activeSessions: {
            [mode]: sessionId
          },
          currentMode: mode,
          settings: {
            sessionSizes: { [mode]: 1 },
            languages: [word.language],
            complexityLevels: { [word.language]: 1 }
          },
          experience: {
            hasSeenIntro: true, // Skip intro for tests
            coachmarks: { streak: true, profiles: true },
            hasSeenParentGuide: true,
            hasSeenWhyRepeat: true,
            seenIntroVersion: '1.0.0'
          }
        }
      },
      currentUserId: userId
    };
    
    // Seed the state
    (window as any).__seedState(gameState);
    
    // Debug log
    console.log('Seeded state, checking result:', (window as any).__readState?.());
  }, { word });
  
  // Wait for the UI to be ready - fix: check state.game.currentUserId, not state.currentUserId
  await page.waitForFunction(() => {
    const state = (window as any).__readState?.();
    return state?.game?.currentUserId === 'test-user';
  });
  
  // Wait for practice UI to render, then dismiss any overlays
  await page.waitForTimeout(500);
  await dismissPracticeIntroIfPresent(page);
  
  // Start the practice session if we're on the ready screen
  const startPracticeBtn = page.getByRole('button', { name: /start practice/i });
  if (await startPracticeBtn.isVisible()) {
    console.log('✅ Found Start Practice button, clicking...');
    await startPracticeBtn.click();
    await page.getByTestId('practice-root').waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Practice session started successfully');
  }

  console.log('✅ Single word session seeded successfully');
}
