interface CoachmarkProps {
  message: string;
  onDismiss: () => void;
  style?: React.CSSProperties;
  ctaLabel?: string;
  onCta?: () => void;
  testId?: string;
}

export default function Coachmark({ message, onDismiss, style, ctaLabel, onCta, testId }: CoachmarkProps) {
  return (
    <div
      data-testid={testId}
      style={{
        position: 'relative',
        background: '#fff',
        color: '#0f172a',
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
        maxWidth: 260,
        fontSize: '0.9rem',
        lineHeight: 1.4,
        border: '1px solid rgba(59, 130, 246, 0.2)',
        ...style,
      }}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss coachmark"
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          background: 'transparent',
          border: 'none',
          fontSize: '0.9rem',
          color: '#94a3b8',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span>{message}</span>
        {ctaLabel && (
          <button
            type="button"
            onClick={() => {
              onDismiss();
              onCta?.();
            }}
            style={{
              alignSelf: 'flex-start',
              padding: '6px 12px',
              borderRadius: 999,
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
