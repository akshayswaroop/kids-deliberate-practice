import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { dismissPracticeIntroIfPresent, gotoAppWithFreshStorage } from './utils/app-helpers';

const MODE = 'kannadaalphabets';
const USER_ID = 'build-mode-e2e-user';
const SESSION_ID = 'build-mode-session';

type KannadaWordSeed = {
  id: string;
  wordKannada: string;
  transliteration: string;
  transliterationHi: string;
  answer: string;
  notes: string;
};

const KANNADA_WORDS: KannadaWordSeed[] = [
  {
    id: 'word-aj',
    wordKannada: 'ಅಜ',
    transliteration: 'aj',
    transliterationHi: 'अज',
    answer: 'अज',
    notes: 'Build the letters for ಅಜ',
  },
  {
    id: 'word-rama',
    wordKannada: 'ರಾಮ',
    transliteration: 'rāma',
    transliterationHi: 'राम',
    answer: 'राम',
    notes: 'Build the letters for ರಾಮ',
  },
  {
    id: 'word-kala',
    wordKannada: 'ಕಲ',
    transliteration: 'kala',
    transliterationHi: 'कल',
    answer: 'कल',
    notes: 'Build the letters for ಕಲ',
  },
];

async function seedKannadaConstructionSession(page: Page) {
  const createdAt = Date.now();
  const sessionSettings = {
    sessionSizes: { [MODE]: KANNADA_WORDS.length },
    languages: [MODE],
    complexityLevels: { [MODE]: 1 },
  };

  const words = KANNADA_WORDS.reduce<Record<string, any>>((acc, word) => {
    acc[word.id] = {
      id: word.id,
      text: word.transliteration,
      wordKannada: word.wordKannada,
      transliteration: word.transliteration,
      transliterationHi: word.transliterationHi,
      answer: word.answer,
      notes: word.notes,
      language: MODE,
      complexityLevel: 1,
      attempts: [],
      step: 0,
      cooldownSessionsLeft: 0,
      revealCount: 0,
    };
    return acc;
  }, {});

  const gameState = {
    users: {
      [USER_ID]: {
        displayName: 'Build Mode Kid',
        words,
        sessions: {
          [SESSION_ID]: {
            wordIds: KANNADA_WORDS.map(word => word.id),
            currentIndex: 0,
            revealed: false,
            lastAttempt: undefined,
            mode: MODE,
            createdAt,
            needsNewSession: false,
            stats: {
              totalQuestions: KANNADA_WORDS.length,
              questionsCompleted: 0,
              masteredInSession: 0,
              practicedInSession: 0,
              yetToTry: KANNADA_WORDS.length,
              currentlyMastered: 0,
              initiallyMastered: 0,
            },
            settings: sessionSettings,
          },
        },
        activeSessions: { [MODE]: SESSION_ID },
        currentMode: MODE,
        settings: sessionSettings,
        experience: {
          hasSeenIntro: true,
          coachmarks: { streak: true, profiles: true },
          hasSeenParentGuide: true,
          hasSeenWhyRepeat: true,
          seenIntroVersion: '1.0.0',
        },
      },
    },
    currentUserId: USER_ID,
  };

  await page.evaluate(state => {
    (window as any).__seedState?.(state);
  }, gameState);

  await page.waitForFunction(
    ({ userId, mode }) => {
      const state = (window as any).__readState?.();
      if (!state?.game) return false;
      const { game } = state;
      if (game.currentUserId !== userId) return false;
      const user = game.users?.[userId];
      if (!user) return false;
      const sessionId = user.activeSessions?.[mode];
      if (!sessionId) return false;
      const session = user.sessions?.[sessionId];
      return !!session && Array.isArray(session.wordIds) && session.wordIds.length > 0;
    },
    { userId: USER_ID, mode: MODE }
  );
}

async function readActiveWord(page: Page) {
  return await page.evaluate(({ userId, mode }) => {
    const state = (window as any).__readState?.();
    if (!state?.game) return null;
    const game = state.game;
    if (game.currentUserId !== userId) return null;
    const user = game.users?.[userId];
    if (!user) return null;
    const sessionId = user.activeSessions?.[mode];
    if (!sessionId) return null;
    const session = user.sessions?.[sessionId];
    if (!session) return null;
    const currentWordId = session.wordIds?.[session.currentIndex];
    if (!currentWordId) return null;
    const word = user.words?.[currentWordId];
    if (!word) return null;
    return {
      wordId: currentWordId as string,
      answer: String(word.answer || ''),
      wordKannada: String(word.wordKannada || word.text || ''),
      index: session.currentIndex ?? 0,
    };
  }, { userId: USER_ID, mode: MODE });
}

async function buildWordFromAnswer(page: Page, answer: string) {
  const components = Array.from(answer).filter(part => part.trim().length > 0);
  for (const component of components) {
    const button = page.locator('[data-testid="construction-component"]', { hasText: component }).first();
    await button.waitFor({ state: 'visible', timeout: 10000 });
    await button.click();
  }
}

async function waitForNextWord(page: Page, previousWordId: string) {
  await page.waitForFunction(
    ({ userId, mode, prev }) => {
      const state = (window as any).__readState?.();
      if (!state?.game) return false;
      const { game } = state;
      if (game.currentUserId !== userId) return false;
      const user = game.users?.[userId];
      if (!user) return false;
      const sessionId = user.activeSessions?.[mode];
      if (!sessionId) return false;
      const session = user.sessions?.[sessionId];
      if (!session) return false;
      const currentWordId = session.wordIds?.[session.currentIndex];
      return !!currentWordId && currentWordId !== prev;
    },
    { userId: USER_ID, mode: MODE, prev: previousWordId }
  );

  return await readActiveWord(page);
}

test.describe('Regression: Kannada construction mode progression', () => {
  test('Scenario: second Kannada word stays in build mode after first completion', async ({ page }) => {
    await gotoAppWithFreshStorage(page);
    await seedKannadaConstructionSession(page);
    await page.waitForFunction(() => !!document.querySelector('[data-testid="practice-root"]'));
    await dismissPracticeIntroIfPresent(page);

    const firstWord = await readActiveWord(page);
    expect(firstWord).not.toBeNull();
    if (!firstWord) {
      throw new Error('Failed to read the first active word');
    }
    expect(firstWord.wordId).toBe(KANNADA_WORDS[0].id);

    await buildWordFromAnswer(page, firstWord.answer);

    const afterProgression = await waitForNextWord(page, firstWord.wordId);
    expect(afterProgression).not.toBeNull();
    if (!afterProgression) {
      throw new Error('Practice session did not advance after completing the first word');
    }

    // Regression expectation: we should advance to the next word and stay in construction mode
    // The exact next word order may vary due to session mechanics, but we verify construction mode persists
    const expectedNext = KANNADA_WORDS[1];
    expect(afterProgression.wordId).toBe(expectedNext.id); // Should be the second word exactly
    await expect(page.getByTestId('target-word')).toContainText(expectedNext.wordKannada);
    await expect(page.getByText('Build the word here:')).toBeVisible();
  });
});
