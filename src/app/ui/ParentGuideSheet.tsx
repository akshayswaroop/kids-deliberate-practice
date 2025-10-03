interface ParentGuideSheetProps {
  open: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
}

const HIGHLIGHTS = [
  {
    title: 'Every attempt celebrated',
    description: 'Streaks and attempt counts climb with each try so kids stay motivated even when they miss.',
    icon: '🎉',
  },
  {
    title: 'Smart repetition',
    description: 'Spaced repetition + deliberate practice quietly resurface tricky cards until mastery.',
    icon: '🔁',
  },
  {
    title: 'Multiple profiles',
    description: 'Switch learners instantly so each child sees their own subjects and progress.',
    icon: '👧🏽',
  },
  {
    title: 'Parent-led practice',
    description: 'Adults handle the buttons and pacing. Ask your child for the answer, tap Correct or Try later for them, and cheer every attempt.',
    icon: '🙋🏽‍♀️',
  },
  {
    title: 'Rich subject library',
    description: 'Languages, number spellings, facts, and more—pick what matters this week and pause the rest.',
    icon: '📚',
  },
  {
    title: 'Privacy by default',
    description: 'Progress lives on this device only. No ads, accounts, or data sharing required.',
    icon: '🛡️',
  },
];

export default function ParentGuideSheet({ open, onClose, onAcknowledge }: ParentGuideSheetProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="parent-guide-sheet"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 3500,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: 'min(640px, 100%)',
          background: '#f8fafc',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -20px 40px rgba(15, 23, 42, 0.2)',
          padding: '28px 24px 32px',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a' }}>Parent Guide</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close parent guide"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.3rem',
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            ✕
          </button>
        </header>
        <p style={{ margin: '0 0 20px', color: '#475569', lineHeight: 1.5 }}>
          A quick tour of what you can point out to your child and how we keep practice calm, motivating, and private.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {HIGHLIGHTS.map(item => (
            <div
              key={item.title}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '16px 18px',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                display: 'flex',
                gap: 14,
              }}
            >
              <span style={{ fontSize: '1.7rem' }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{item.title}</div>
                <p style={{ margin: '6px 0 0', color: '#475569', lineHeight: 1.5 }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              border: '1px solid #cbd5f5',
              background: '#fff',
              color: '#334155',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onAcknowledge();
              onClose();
            }}
            style={{
              padding: '10px 22px',
              borderRadius: 999,
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
