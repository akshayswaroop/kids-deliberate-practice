import { useState, useEffect } from 'react';

interface PracticeIntroProps {
  onDismiss: () => void;
}

const CARDS = [
  {
    title: 'Every attempt counts',
    body: 'Kids see streaks and attempt tallies grow even before answers are perfect. No typing—just say the answer aloud—so practice stays playful and fast.',
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

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('overlay-open');
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('overlay-open');
      }
    };
  }, []);

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
        background: 'rgba(15, 23, 42, 0.80)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        zIndex: 10000, // ensure intro sits above any bottom controls
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          width: 'min(1000px, 96vw)',
          height: 'min(760px, 92vh)',
    background: 'linear-gradient(160deg, var(--bg-overlay, rgba(15,23,42,0.98)), var(--bg-secondary, rgba(30,41,59,0.95)))',
          borderRadius: 16,
          boxShadow: '0 40px 90px rgba(2,6,23,0.6)',
          padding: '28px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflow: 'hidden'
        }}>
          {/* Header: App title + skip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-inverse, #e2e8f0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 10, background: 'linear-gradient(135deg,var(--color-primary,#60a5fa),var(--color-secondary,#7c3aed))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🧒</div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Kids Practice</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-inverse-muted, rgba(226,232,240,0.8))' }}>Gentle daily practice for kids</div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={onDismiss}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-inverse-muted, rgba(226, 232, 240, 0.75))',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '8px 12px'
                }}
              >
                Skip tour
              </button>
            </div>
          </div>

          {/* Body: card content */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', overflow: 'hidden', flex: 1 }}>
            <div style={{ flex: '0 0 110px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
              <div style={{ fontSize: '3.25rem' }}>{CARDS[index].icon}</div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6 }}>
              <h2 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-inverse, #e6eefc)' }}>{CARDS[index].title}</h2>
              <p style={{ marginTop: 12, fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-inverse-muted, rgba(226, 232, 240, 0.9))' }}>{CARDS[index].body}</p>

              <div style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                {CARDS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: i === index ? '#60a5fa' : 'rgba(148, 163, 184, 0.28)',
                      transition: 'background 0.2s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer: navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={index === 0}
              aria-disabled={index === 0}
              style={{
                padding: '12px 22px',
                borderRadius: 999,
                border: '1px solid rgba(148, 163, 184, 0.24)',
                background: index === 0 ? 'rgba(71,85,105,0.35)' : 'rgba(15,23,42,0.85)',
                color: '#e2e8f0',
                fontWeight: 700,
                cursor: index === 0 ? 'not-allowed' : 'pointer',
                minWidth: 120,
              }}
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: '12px 28px',
                borderRadius: 999,
                border: 'none',
                background: 'linear-gradient(135deg, #38bdf8, #7c3aed)',
                color: '#fff',
                fontWeight: 800,
                cursor: 'pointer',
                minWidth: 160,
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

// Ensure body class is removed if component unmounts unexpectedly
