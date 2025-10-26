import { useState, useEffect } from 'react';

interface PracticeIntroProps {
  onDismiss: () => void;
}

const CARDS = [
  {
    title: 'Learn Kannada',
    body: 'Designed for Hindi-speaking children to learn Kannada through interactive practice and phonetic building.',
    icon: '🇮🇳',
  },
  {
    title: 'Build words by sound',
    body: 'Tap letters and matras to construct Hindi transliterations, learning how Devanagari script works.',
    icon: '�',
  },
  {
    title: 'Parent‑guided practice',
    body: 'Show the Kannada text, have your child read it, build the Hindi word together, then mark the result.',
    icon: '🤝',
  },
  {
    title: 'Spaced repetition',
    body: 'Difficult words return automatically. Short practice sessions build lasting fluency.',
    icon: '�',
  },
  {
    title: 'Private & local',
    body: 'Everything stays on your device. No logins, no ads, no cloud storage.',
    icon: '🔒',
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
        zIndex: 10000,
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
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            height: '100%',
            maxHeight: 700,
            background: 'linear-gradient(160deg, var(--bg-overlay, rgba(15,23,42,0.98)), var(--bg-secondary, rgba(30,41,59,0.95)))',
            borderRadius: 16,
            boxShadow: '0 40px 90px rgba(2,6,23,0.6)',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-inverse, #e2e8f0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 10, background: 'linear-gradient(135deg,var(--color-primary,#60a5fa),var(--color-secondary,#7c3aed))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>📚</div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Learn Kannada</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-inverse-muted, rgba(226,232,240,0.8))' }}>For Hindi-speaking kids</div>
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
                Skip
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 16,
              alignItems: 'flex-start',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            <div
              style={{
                flex: '0 0 80px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                minWidth: 60,
              }}
            >
              <div style={{ fontSize: '2.5rem' }}>{CARDS[index].icon}</div>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: 2,
                minWidth: 0,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--text-inverse, #e6eefc)',
                  wordBreak: 'break-word',
                }}
              >
                {CARDS[index].title}
              </h2>
              <p
                style={{
                  marginTop: 12,
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: 'var(--text-inverse-muted, rgba(226, 232, 240, 0.9))',
                  wordBreak: 'break-word',
                }}
              >
                {CARDS[index].body}
              </p>
              <div style={{ marginTop: 18, display: 'flex', gap: 8, alignItems: 'center' }}>
                {CARDS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: i === index ? '#60a5fa' : 'rgba(148, 163, 184, 0.28)',
                      transition: 'background 0.2s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

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
                minWidth: 110,
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
                minWidth: 150,
              }}
            >
              {atLastSlide ? 'Start' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
