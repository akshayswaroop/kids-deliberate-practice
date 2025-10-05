import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
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
    vi.stubEnv('MODE', 'development');
    globalThis.Audio = FakeAudio as unknown as typeof Audio;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    globalThis.Audio = originalAudio;
    vi.clearAllMocks();
  });

  it('disables all action buttons when all questions are mastered', async () => {
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
      />
    );
    // All action buttons should be present and disabled due to session completion
    const nextButton = await screen.findByTestId('btn-next');
    const correctButton = await screen.findByTestId('btn-correct');
    const wrongButton = await screen.findByTestId('btn-wrong');
    const revealButton = await screen.findByTestId('btn-reveal');
    expect(nextButton).toBeDisabled();
    expect(correctButton).toBeDisabled();
    expect(wrongButton).toBeDisabled();
    expect(revealButton).toBeDisabled();
  });
});