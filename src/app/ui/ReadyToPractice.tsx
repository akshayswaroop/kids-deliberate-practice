// Using the automatic JSX runtime; no React import required for JSX
import { useEffect } from 'react';

interface ReadyToPracticeProps {
  onClose?: () => void;
}

export default function ReadyToPractice({ onClose }: ReadyToPracticeProps) {
  // Add class synchronously before render
  if (typeof document !== 'undefined' && !document.body.classList.contains('overlay-open')) {
    document.body.classList.add('overlay-open');
  }
  
  useEffect(() => {
    if (typeof document !== 'undefined') document.body.classList.add('overlay-open');
    return () => { if (typeof document !== 'undefined') document.body.classList.remove('overlay-open'); };
  }, []);

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>Pick what to practice</h2>
        <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 520 }}>
          Sit beside your child, pick a subject, and guide them as they answer aloud. You’ll tap the buttons while they practise.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-tertiary)',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Maybe later
      </button>
    </header>
  );
}
