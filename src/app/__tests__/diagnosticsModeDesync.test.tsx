import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../../App';
import { createAppStore } from '../../infrastructure/store';
import type { RootState } from '../../infrastructure/state/gameState';

function buildPreloadedState(): { game: RootState } {
  const now = Date.now();
  return {
    game: {
      currentUserId: 'user_1',
      users: {
        user_1: {
          displayName: 'Akshay',
          words: {
            eng_01: {
              id: 'eng_01',
              text: 'Mina feels happy.',
              language: 'english',
              complexityLevel: 1,
              attempts: [],
              step: 0,
              cooldownSessionsLeft: 0,
              revealCount: 0,
            },
          },
          sessions: {
            session_english: {
              wordIds: ['eng_01'],
              currentIndex: 0,
              revealed: false,
              mode: 'practice',
              createdAt: now,
              settings: {
                sessionSizes: {},
                languages: ['english'],
                complexityLevels: {},
              },
            },
          },
          activeSessions: {
            english: 'session_english',
          },
          currentMode: 'english',
          settings: {
            sessionSizes: {},
            languages: ['kannadaalphabets', 'english'],
            complexityLevels: {},
          },
          experience: {
            hasSeenIntro: false,
            hasSeenParentGuide: false,
            hasSeenWhyRepeat: false,
            coachmarks: {
              streak: false,
              profiles: false,
            },
          },
        },
      },
    },
  };
}

describe('Diagnostics navigation mode synchronisation', () => {
  it('exposes existing mismatch between dropdown mode and card after returning from diagnostics', async () => {
    const store = createAppStore({ persist: false, preloadedState: buildPreloadedState() });
    window.history.replaceState({}, '', '/');

    const { rerender } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const modeSelect = document.getElementById('mode-select') as HTMLSelectElement;
    fireEvent.change(modeSelect, { target: { value: 'english' } });
    expect((modeSelect as HTMLSelectElement).value).toBe('english');
    expect(screen.getByText(/Mina feels happy/i)).toBeInTheDocument();

    await act(async () => {
      window.history.pushState({}, '', '/diagnostics');
      rerender(
        <Provider store={store}>
          <App />
        </Provider>
      );
    });
    expect(screen.getByText(/Trace Diagnostics/i)).toBeInTheDocument();

    await act(async () => {
      window.history.pushState({}, '', '/');
      rerender(
        <Provider store={store}>
          <App />
        </Provider>
      );
    });

    const modeSelectAfter = document.getElementById('mode-select') as HTMLSelectElement;
    const userState = store.getState().game.users['user_1'];
    expect(userState.currentMode).toBe('english');
    expect(modeSelectAfter.value).toBe('english');
  });
});
