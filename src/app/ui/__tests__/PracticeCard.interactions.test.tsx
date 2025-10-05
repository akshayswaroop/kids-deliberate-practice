import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

function createAttemptStats(history: Array<{ result: 'correct' | 'wrong' }>) {
  const total = history.length;
  const correct = history.filter(a => a.result === 'correct').length;
  const incorrect = total - correct;
  return { total, correct, incorrect };
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

  function PracticeCardHarness(props: Partial<PracticeCardProps>) {
    const [history, setHistory] = React.useState<Array<{ timestamp: number; result: 'correct' | 'wrong' }>>([]);

    const handleCorrect = () => {
      props.onCorrect?.();
      setHistory(prev => [...prev, { timestamp: Date.now(), result: 'correct' }]);
    };

    const handleWrong = () => {
      props.onWrong?.();
      setHistory(prev => [...prev, { timestamp: Date.now(), result: 'wrong' }]);
    };

    return (
    <PracticeCard
      {...baseStaticProps}
      {...props}
      onCorrect={handleCorrect}
      onWrong={handleWrong}
      attemptHistory={history}
      attemptStats={createAttemptStats(history)}
      animationDurationMs={20}
      isAnswerRevealed={history.length > 0}
    />
  );
}

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
      <PracticeCardHarness
        onCorrect={onCorrect}
        onWrong={onWrong}
        onNext={onNext}
        onRevealAnswer={onReveal}
      />
    );

    const correct = screen.getByTestId('btn-correct');
    const wrong = screen.getByTestId('btn-wrong');
    const reveal = screen.getByTestId('btn-reveal');

    // Click correct button to trigger animation
    fireEvent.click(correct);
    
    // All buttons should be disabled during animation
    expect(correct).toBeDisabled();
    expect(wrong).toBeDisabled();
    expect(reveal).toBeDisabled();
  });

  it('handles mastery state correctly', async () => {
    // Simulate a mastered scenario: progress = 100
    const onNext = vi.fn();
    render(
      <PracticeCardHarness
        choices={[{ id: 'w1', label: 'Hello', progress: 100 }]} // mastered
        mainWord={'Hello'}
        onNext={onNext}
      />
    );
    
    // Check that buttons behave correctly in mastery state
    const correctButton = screen.getByTestId('btn-correct');
    const wrongButton = screen.getByTestId('btn-wrong');
    
    // Individual question mastery should disable action buttons
    expect(correctButton).toBeDisabled();
    expect(wrongButton).toBeDisabled();
  });

  it('keeps reveal button inactive while interaction is locked', () => {
    const onReveal = vi.fn();
    render(
      <PracticeCardHarness
        onCorrect={vi.fn()}
        onWrong={vi.fn()}
        onNext={vi.fn()}
        onRevealAnswer={onReveal}
      />
    );

    const correctBtn = screen.getByTestId('btn-correct');
    const revealBtn = screen.getByTestId('btn-reveal');

    fireEvent.click(correctBtn);
    expect(revealBtn).toBeDisabled();

    fireEvent.click(revealBtn);
    expect(onReveal).not.toHaveBeenCalled();
  });

  it('disables all buttons and recovers after wrong animation completes', async () => {
    const onCorrect = vi.fn();
    const onWrong = vi.fn();
    const onNext = vi.fn();
    const onReveal = vi.fn();

    render(
      <PracticeCardHarness
        onCorrect={onCorrect}
        onWrong={onWrong}
        onNext={onNext}
        onRevealAnswer={onReveal}
      />
    );

    const wrongBtn = screen.getByTestId('btn-wrong');
    const correctBtn = screen.getByTestId('btn-correct');
    const revealBtn = screen.getByTestId('btn-reveal');

    fireEvent.click(wrongBtn);
    expect(correctBtn).toBeDisabled();
    expect(wrongBtn).toBeDisabled();
    expect(revealBtn).toBeDisabled();

    // Wait for Next button to become enabled after animation (2.5s)
    const nextButton = await screen.findByTestId('btn-next');
    await waitFor(() => {
      expect(nextButton).toBeEnabled();
    });
    
    // Correct/wrong buttons should be disabled when Next button is enabled (they stay visible)
    expect(screen.queryByTestId('btn-correct')).toBeDisabled();
    expect(screen.queryByTestId('btn-wrong')).toBeDisabled();
    
    // Click Next button to progress
    fireEvent.click(nextButton);
    expect(onNext).toHaveBeenCalled();
  });
});
