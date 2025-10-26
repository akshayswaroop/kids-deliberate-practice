import React from 'react';

/**
 * SessionSummaryDashboard - Shows end-of-session stats
 * Displays mastered words, total progress, streak, and badges earned
 */
export default function SessionSummaryDashboard({
  show,
  masteredThisSession,
  totalMastered,
  currentStreak,
  badgesEarned = [],
  onContinue,
  onReviewWeak,
  onClose,
}) {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 24,
        animation: 'fadeIn 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 20,
          padding: '32px 24px',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.4s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎉</div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#1e293b',
              marginBottom: 8,
            }}
          >
            Session Complete!
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Great work practicing today
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            marginBottom: 24,
          }}
        >
          {/* Words Mastered This Session */}
          <div
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: 12,
              padding: 16,
              textAlign: 'center',
              color: 'white',
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>
              {masteredThisSession}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              Mastered Today
            </div>
          </div>

          {/* Total Mastered */}
          <div
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              borderRadius: 12,
              padding: 16,
              textAlign: 'center',
              color: 'white',
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>
              {totalMastered}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              Total Mastered
            </div>
          </div>

          {/* Streak */}
          {currentStreak > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                color: 'white',
                gridColumn: currentStreak >= 10 ? '1 / -1' : 'auto',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>
                🔥 {currentStreak}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                {currentStreak >= 10 ? 'Amazing Streak!' : 'Current Streak'}
              </div>
            </div>
          )}
        </div>

        {/* Badges Earned */}
        {badgesEarned.length > 0 && (
          <div
            style={{
              background: '#fef3c7',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              border: '2px solid #fbbf24',
            }}
          >
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#92400e',
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              🏆 New Badges Earned!
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {badgesEarned.map((badge, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'white',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#92400e',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {badge.icon} {badge.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          <button
            type="button"
            onClick={onContinue}
            style={{
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Continue Practicing →
          </button>

          {onReviewWeak && (
            <button
              type="button"
              onClick={onReviewWeak}
              style={{
                padding: '12px 24px',
                background: 'white',
                color: '#4f46e5',
                border: '2px solid #4f46e5',
                borderRadius: 12,
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Review Weak Words
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: 'transparent',
              color: '#64748b',
              border: 'none',
              borderRadius: 12,
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
