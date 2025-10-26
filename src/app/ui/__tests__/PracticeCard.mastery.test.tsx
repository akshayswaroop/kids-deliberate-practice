import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

describe('PracticeCard mastery edge cases', () => {
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
    vi.useFakeTimers();
    vi.stubEnv('MODE', 'development');
    globalThis.Audio = FakeAudio as unknown as typeof Audio;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllEnvs();
    globalThis.Audio = originalAudio;
    vi.clearAllMocks();
  });

  it('enables Next button and shows completion prompt when session is complete', async () => {
    // Simulate the REAL mastery scenario: session completion with guidance
    const onNext = vi.fn();
    render(
      <PracticeCardHarness
        choices={[{ id: 'w1', label: 'Hello', progress: 50 }]} // not individually mastered
        mainWord={'Hello'}
        onNext={onNext}
        sessionGuidance={{
          message: "Amazing! You've mastered everything in Practice. Check back for new questions!",
          urgency: 'success',
          context: 'completion'
        }}
        sessionStats={{
          totalQuestions: 4,
          questionsCompleted: 4,
          masteredInSession: 2,
          practicedInSession: 1,
          yetToTry: 1,
          currentlyMastered: 3,
          initiallyMastered: 1
        }}
      />
    );
    const nextButton = screen.getByTestId('btn-next');
    await act(async () => {
      await Promise.resolve();
    });
    expect(nextButton).toBeEnabled();

    const prompt = screen.getByRole('dialog');
    expect(prompt).toBeInTheDocument();
    expect(screen.getByText(/Practice next set/i)).toBeInTheDocument();

    fireEvent.click(nextButton);
    expect(onNext).toHaveBeenCalledTimes(1);
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('auto-advances to a fresh session after the completion delay', async () => {
    const onNext = vi.fn();
    render(
      <PracticeCardHarness
        onNext={onNext}
        sessionGuidance={{
          message: 'Ready for a fresh round!',
          urgency: 'success',
          context: 'completion'
        }}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
