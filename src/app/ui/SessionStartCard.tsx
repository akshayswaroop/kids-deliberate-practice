interface SessionStartCardProps {
  totalQuestions: number;
  onStart: () => void;
}

export default function SessionStartCard({ totalQuestions, onStart }: SessionStartCardProps) {
  return (
    <div
      data-testid="session-start-card"
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
          width: 'min(480px, 100%)',
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
          borderRadius: 20,
          boxShadow: '0 30px 60px rgba(15, 23, 42, 0.45)',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          color: '#e2e8f0',
          textAlign: 'center',
        }}
      >
        {/* Header with emoji and title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
          <span style={{ fontSize: '3rem' }}>⭐</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Ready to practice?</h2>
          </div>
        </div>

        {/* Main message */}
        <div>
          <p style={{ 
            margin: '8px 0 0', 
            fontSize: '1.25rem', 
            lineHeight: 1.6, 
            color: 'rgba(226, 232, 240, 0.9)',
            fontWeight: 500 
          }}>
            This round has <strong style={{ color: '#60a5fa' }}>{totalQuestions} questions</strong>
          </p>
          <p style={{ 
            margin: '12px 0 0', 
            fontSize: '1.5rem', 
            lineHeight: 1.4, 
            color: '#fbbf24',
            fontWeight: 700
          }}>
            → Let's get started!
          </p>
        </div>

        {/* Start button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <button
            type="button"
            onClick={onStart}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '16px 32px',
              fontSize: '1.125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🚀</span>
            Start Practice!
          </button>
        </div>

        {/* Fun encouragement */}
        <p style={{ 
          margin: 0, 
          fontSize: '0.875rem', 
          color: 'rgba(148, 163, 184, 0.8)',
          fontStyle: 'italic'
        }}>
          Say your answers out loud and have fun! 🎯
        </p>
      </div>
    </div>
  );
}