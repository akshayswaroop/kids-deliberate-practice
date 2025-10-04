import { useState, useEffect } from 'react';

interface SessionEndCardProps {
  masteredInSession: number;
  practicedInSession: number;
  yetToTry: number;
  onContinue: () => void;
  showMasteryAnimation?: boolean;
}

export default function SessionEndCard({ 
  masteredInSession, 
  practicedInSession, 
  yetToTry,
  onContinue,
  showMasteryAnimation = false
}: SessionEndCardProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (showMasteryAnimation && masteredInSession > 0) {
      setShowAnimation(true);
    }
  }, [showMasteryAnimation, masteredInSession]);

  const totalAttempted = masteredInSession + practicedInSession;

  return (
    <div
      data-testid="session-end-card"
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
          color: '#e2e8f0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Celebration animation */}
        {showAnimation && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: -1,
            }}
          >
            {/* Star burst animation */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                  animation: `starBurst 2s ease-out ${i * 0.1}s`,
                }}
              >
                <span style={{ fontSize: '2rem' }}>⭐</span>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🎉</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>
              Great session!
            </h2>
          </div>
        </div>

        {/* Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 16,
          margin: '8px 0',
        }}>
          {/* Mastered */}
          <div style={{
            background: masteredInSession > 0 
              ? 'linear-gradient(135deg, #10b981, #34d399)' 
              : 'rgba(148, 163, 184, 0.2)',
            borderRadius: 12,
            padding: '16px 12px',
            boxShadow: masteredInSession > 0 
              ? '0 4px 12px rgba(16, 185, 129, 0.3)' 
              : 'none',
            border: masteredInSession > 0 ? 'none' : '2px dashed rgba(148, 163, 184, 0.4)',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>⭐</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 2 }}>
              {masteredInSession}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Mastered
            </div>
          </div>

          {/* Practiced */}
          <div style={{
            background: practicedInSession > 0 
              ? 'linear-gradient(135deg, #f59e0b, #f97316)' 
              : 'rgba(148, 163, 184, 0.2)',
            borderRadius: 12,
            padding: '16px 12px',
            boxShadow: practicedInSession > 0 
              ? '0 4px 12px rgba(245, 158, 11, 0.3)' 
              : 'none',
            border: practicedInSession > 0 ? 'none' : '2px dashed rgba(148, 163, 184, 0.4)',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🔄</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 2 }}>
              {practicedInSession}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Practiced
            </div>
          </div>

          {/* Yet to try */}
          <div style={{
            background: yetToTry > 0 
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
              : 'rgba(148, 163, 184, 0.2)',
            borderRadius: 12,
            padding: '16px 12px',
            boxShadow: yetToTry > 0 
              ? '0 4px 12px rgba(99, 102, 241, 0.3)' 
              : 'none',
            border: yetToTry > 0 ? 'none' : '2px dashed rgba(148, 163, 184, 0.4)',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🕒</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 2 }}>
              {yetToTry}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Yet to try
            </div>
          </div>
        </div>

        {/* Encouragement message */}
        <div style={{
          padding: '16px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: 12,
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '1rem', 
            lineHeight: 1.5,
            color: 'rgba(226, 232, 240, 0.9)'
          }}>
            {masteredInSession > 0 && practicedInSession === 0 && yetToTry === 0 ? (
              "🌟 Perfect! You've mastered everything in this session!"
            ) : masteredInSession > 0 ? (
              `🎯 Awesome! You mastered ${masteredInSession} new ${masteredInSession === 1 ? 'word' : 'words'}!`
            ) : totalAttempted > 0 ? (
              "💪 Great practice! Keep going and you'll master these soon!"
            ) : (
              "🚀 Ready to start? Let's practice together!"
            )}
          </p>
        </div>

        {/* Continue button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <button
            type="button"
            onClick={onContinue}
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
            {yetToTry > 0 ? (
              <>
                <span style={{ fontSize: '1.25rem' }}>▶️</span>
                Continue Practice
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.25rem' }}>🎯</span>
                New Session
              </>
            )}
          </button>
        </div>

        {/* CSS for animations */}
        <style>{`
          @keyframes starBurst {
            0% {
              transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) scale(0);
              opacity: 1;
            }
            50% {
              transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-60px) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-100px) scale(0);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
}