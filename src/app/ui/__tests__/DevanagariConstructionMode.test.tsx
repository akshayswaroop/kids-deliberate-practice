import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DevanagariConstructionMode from '../DevanagariConstructionMode.jsx';

describe('DevanagariConstructionMode', () => {
  beforeAll(() => {
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    }
  });

  const clickComponent = async (user: ReturnType<typeof userEvent.setup>, glyph: string) => {
    const button = await screen.findByRole('button', { name: glyph });
    await user.click(button);
  };

  it('dispatches completion once and does not auto-complete the next answer', async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <DevanagariConstructionMode
        answer="आज"
        mode="kannada"
        dispatch={dispatch}
      />
    );

    await clickComponent(user, 'अ');
    await clickComponent(user, 'ा');
    await clickComponent(user, 'ज');

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1300));
    });
    expect(dispatch).toHaveBeenCalledTimes(1);

    rerender(
      <DevanagariConstructionMode
        answer="आम"
        mode="kannada"
        dispatch={dispatch}
      />
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
    });

    expect(dispatch).toHaveBeenCalledTimes(1);
  }, 10000);
});
