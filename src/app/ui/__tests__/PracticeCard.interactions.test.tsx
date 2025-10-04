import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PracticeCard from '../PracticeCard.jsx';
import type { PracticeCardProps } from '../PracticeCard';

vi.mock('../FlyingUnicorn.jsx', () => {
  const React = require('react');
  const Mock = ({ visible, onAnimationEnd }: { visible: boolean; onAnimationEnd?: () => void }) => {
    React.useEffect(() => {
      if (visible) {
        onAnimationEnd?.();
      }
    }, [visible, onAnimationEnd]);
    return <div data-testid="mock-flying-unicorn" />;
  };
  return { default: Mock };
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

  const baseStaticProps: PracticeCardProps = {
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
    onCorrect: () => {},
    onWrong: () => {},
    onNext: () => {},
  };

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

    // Wait for Next button to appear after animation
    const nextButton = await screen.findByTestId('btn-next');
    expect(nextButton).toBeInTheDocument();
    
    // Correct/wrong buttons should be hidden when Next button appears
    expect(screen.queryByTestId('btn-correct')).not.toBeInTheDocument();
    expect(screen.queryByTestId('btn-wrong')).not.toBeInTheDocument();
    
    // Click Next button to progress
    fireEvent.click(nextButton);
    expect(onNext).toHaveBeenCalled();
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

    // Wait for Next button to appear after animation
    const nextButton = await screen.findByTestId('btn-next');
    expect(nextButton).toBeInTheDocument();
    
    // Correct/wrong buttons should be hidden when Next button appears
    expect(screen.queryByTestId('btn-correct')).not.toBeInTheDocument();
    expect(screen.queryByTestId('btn-wrong')).not.toBeInTheDocument();
    
    // Click Next button to progress
    fireEvent.click(nextButton);
    expect(onNext).toHaveBeenCalled();
  });
});
