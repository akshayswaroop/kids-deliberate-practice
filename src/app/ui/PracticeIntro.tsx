import { useState } from 'react';

interface PracticeIntroProps {
  onDismiss: () => void;
}

const CARDS = [
  {
    title: 'Every attempt counts',
    body: 'Kids see streaks and attempt tallies grow even before answers are perfect. It keeps practice playful and rewarding.',
    icon: '🎯',
  },
  {
    title: 'Grown-ups guide practice',
    body: 'A parent or caregiver taps the buttons while encouraging the child to say answers aloud. The app is built for side-by-side coaching, not independent screen time.',
    icon: '🤝',
  },
  {
    title: 'Smart repetition',
    body: 'We lean on spaced repetition and deliberate practice so tricky cards resurface gently until they stick.',
    icon: '🧠',
  },
  {
    title: 'Built for families',
    body: 'Switch between subjects and learner profiles instantly. Progress stays safely on this device—no accounts needed.',
    icon: '👪',
  },
];

export default function PracticeIntro({ onDismiss }: PracticeIntroProps) {
  const [index, setIndex] = useState(0);
  const atLastSlide = index === CARDS.length - 1;

  const handleNext = () => {
    if (atLastSlide) {
      onDismiss();
      return;
    }
    setIndex(prev => Math.min(prev + 1, CARDS.length - 1));
  };

  const handleBack = () => {
    setIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div
      data-testid="practice-intro-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 4000,
      }}
    >
      <div
        style={{
          width: 'min(540px, 100%)',
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
          borderRadius: 20,
          boxShadow: '0 30px 60px rgba(15, 23, 42, 0.45)',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#e2e8f0' }}>
          <span style={{ fontSize: '2.5rem' }}>{CARDS[index].icon}</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>{CARDS[index].title}</h2>
            <p style={{ margin: '8px 0 0', fontSize: '1rem', lineHeight: 1.6, color: 'rgba(226, 232, 240, 0.8)' }}>{CARDS[index].body}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {CARDS.map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: i === index ? '#60a5fa' : 'rgba(148, 163, 184, 0.4)',
                transition: 'background 0.2s ease',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(226, 232, 240, 0.65)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Skip tour
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={index === 0}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                border: '1px solid rgba(148, 163, 184, 0.6)',
                background: index === 0 ? 'rgba(71, 85, 105, 0.4)' : 'rgba(15,23,42,0.6)',
                color: '#e2e8f0',
                fontWeight: 600,
                cursor: index === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: '10px 22px',
                borderRadius: 999,
                border: 'none',
                background: 'linear-gradient(135deg, #38bdf8, #7c3aed)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {atLastSlide ? 'Start practicing' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
