import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from '../../../App';
import { store } from '../../../app/store';
import { addSession, attempt } from '../slice';

describe('App integration: onNext', () => {
  it('creates a new session when current session words are mastered', async () => {
    // Ensure clean storage
    try { localStorage.clear(); } catch {}

    // Create a user
    store.dispatch({ type: 'game/addUser', payload: { userId: 'int_user' } });
    // get some english word ids
    const state = store.getState();
    const words = state.game.users['int_user'].words;
    const englishIds = Object.values(words).filter((w: any) => w.language === 'english').map((w: any) => w.id).slice(0, 4);

    // mark them mastered by dispatching attempts (avoid mutating frozen state)
    englishIds.forEach((id: string) => {
      // dispatch 5 correct attempts to reach step 5
      for (let i = 0; i < 5; i++) {
        store.dispatch(attempt({ sessionId: 'seed', wordId: id, result: 'correct', now: Date.now() } as any));
      }
    });

    const sessionId = 'int_s_1';
    const session = { wordIds: englishIds, currentIndex: 0, revealed: false, mode: 'practice', createdAt: Date.now(), settings: state.game.users['int_user'].settings };
    store.dispatch(addSession({ sessionId, session } as any));
    // set active session for mode
    store.dispatch({ type: 'game/setMode', payload: { mode: 'english', sessionId } });

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // Find Next button and click it
    const nextButton = await screen.findByRole('button', { name: /Next/ });
    fireEvent.click(nextButton);

    // Wait for active session to change
    await waitFor(() => {
      const newSid = store.getState().game.users['int_user'].activeSessions['english'];
      expect(newSid).toBeDefined();
      expect(newSid).not.toBe(sessionId);
    });
  });
});
