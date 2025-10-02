import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PracticeCard from '../PracticeCard.jsx';

vi.mock('../FlyingUnicorn.jsx', () => {
  const React = require('react');
  return {
    default: ({ visible, onAnimationEnd }) => {
      React.useEffect(() => {
        if (visible) {
          onAnimationEnd?.();
        }
      }, [visible, onAnimationEnd]);
      return <div data-testid="mock-flying-unicorn" />;
    },
  };
});

vi.mock('../SadBalloonAnimation.jsx', () => {
  const React = require('react');
  return {
    default: ({ visible, onAnimationEnd }) => {
      React.useEffect(() => {
        if (visible) {
          onAnimationEnd?.();
        }
      }, [visible, onAnimationEnd]);
      return <div data-testid="mock-sad-balloon" />;
    },
  };
});

class FakeAudio {
  public onended: (() => void) | null = null;
  public onerror: (() => void) | null = null;

  set volume(_value: number) {
    // noop: volume is ignored in tests
  }

  play() {
    setTimeout(() => {
      this.onended?.();
    }, 0);
  }

  pause() {}
  load() {}
}

describe('PracticeCard interaction locking', () => {
  const originalAudio = globalThis.Audio;

  const baseStaticProps = {
    mainWord: 'Hello',
    transliteration: 'Hello',
    transliterationHi: 'ಹೆಲೊ',
    answer: 'World',
    notes: 'Sample notes',
    choices: [{ id: 'w1', label: 'Hello', progress: 0 }],
    columns: 6,
    mode: 'kannada',
    isAnswerRevealed: false,
    isEnglishMode: false,
    currentUserId: 'user_test',
  } as const;

  beforeEach(() => {
    vi.stubEnv('MODE', 'development');
    globalThis.Audio = FakeAudio as unknown as typeof Audio;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    globalThis.Audio = originalAudio;
    vi.clearAllMocks();
  });

  it('disables all action buttons while correct animation is running', async () => {
    const onCorrect = vi.fn();
    const onWrong = vi.fn();
    const onNext = vi.fn();
    const onReveal = vi.fn();

    render(
      <PracticeCard
        {...baseStaticProps}
        onCorrect={onCorrect}
        onWrong={onWrong}
        onNext={onNext}
        onRevealAnswer={onReveal}
      />
    );

    const correct = screen.getByTestId('btn-correct');
    const wrong = screen.getByTestId('btn-wrong');
    const reveal = screen.getByTestId('btn-reveal');

    expect(correct).not.toBeDisabled();
    expect(wrong).not.toBeDisabled();
    expect(reveal).not.toBeDisabled();

    fireEvent.click(correct);

    expect(correct).toBeDisabled();
    expect(wrong).toBeDisabled();
    expect(reveal).toBeDisabled();

    await waitFor(() => expect(onNext).toHaveBeenCalled());
    await waitFor(() => expect(correct).not.toBeDisabled());
    expect(wrong).not.toBeDisabled();
    expect(reveal).not.toBeDisabled();
  });

  it('keeps reveal button inactive while interaction is locked', () => {
    const onReveal = vi.fn();
    render(
      <PracticeCard
        {...baseStaticProps}
        onCorrect={vi.fn()}
        onWrong={vi.fn()}
        onNext={vi.fn()}
        onRevealAnswer={onReveal}
      />
    );

    const correct = screen.getByTestId('btn-correct');
    const reveal = screen.getByTestId('btn-reveal');

    fireEvent.click(correct);
    expect(reveal).toBeDisabled();

    fireEvent.click(reveal);
    expect(onReveal).not.toHaveBeenCalled();
  });

  it('disables all buttons and recovers after wrong animation completes', async () => {
    const onCorrect = vi.fn();
    const onWrong = vi.fn();
    const onNext = vi.fn();
    const onReveal = vi.fn();

    render(
      <PracticeCard
        {...baseStaticProps}
        onCorrect={onCorrect}
        onWrong={onWrong}
        onNext={onNext}
        onRevealAnswer={onReveal}
      />
    );

    const wrong = screen.getByTestId('btn-wrong');
    const correct = screen.getByTestId('btn-correct');
    const reveal = screen.getByTestId('btn-reveal');

    fireEvent.click(wrong);

    expect(correct).toBeDisabled();
    expect(wrong).toBeDisabled();
    expect(reveal).toBeDisabled();

    await waitFor(() => expect(onNext).toHaveBeenCalled());
    await waitFor(() => expect(correct).not.toBeDisabled());
    expect(wrong).not.toBeDisabled();
    expect(reveal).not.toBeDisabled();
  });
});
