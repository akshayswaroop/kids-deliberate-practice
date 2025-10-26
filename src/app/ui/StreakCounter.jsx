import React from 'react';

/**
 * StreakCounter - Shows consecutive correct answers
 * Displays fire icon with number, celebrates milestones
 */
export default function StreakCounter({ streak, style }) {
  const [showMilestone, setShowMilestone] = React.useState(false);
  const [prevStreak, setPrevStreak] = React.useState(streak);

  // Milestone thresholds
  const milestones = [5, 10, 25, 50, 100];
  const isMilestone = milestones.includes(streak);

  // Check if we just hit a milestone
  React.useEffect(() => {
    if (streak > prevStreak && isMilestone) {
      setShowMilestone(true);
      const timer = setTimeout(() => setShowMilestone(false), 2000);
      return () => clearTimeout(timer);
    }
    setPrevStreak(streak);
  }, [streak, prevStreak, isMilestone]);

  if (streak === 0) return null;

  const getFireColor = () => {
    if (streak >= 50) return 'linear-gradient(135deg, #ef4444, #dc2626)'; // Red hot!
    if (streak >= 25) return 'linear-gradient(135deg, #f97316, #ea580c)'; // Orange
    if (streak >= 10) return 'linear-gradient(135deg, #f59e0b, #d97706)'; // Amber
    return 'linear-gradient(135deg, #fbbf24, #f59e0b)'; // Yellow
  };

  return (
    <>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: getFireColor(),
          padding: '6px 12px',
          borderRadius: 999,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.9rem',
          animation: showMilestone ? 'pulse 0.5s ease-in-out' : 'none',
          ...style,
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>🔥</span>
        <span>{streak}</span>
        {streak >= 10 && <span style={{ fontSize: '0.75rem' }}>STREAK</span>}
      </div>

      {/* Milestone celebration */}
      {showMilestone && (
        <div
          style={{
            position: 'fixed',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            padding: '20px 32px',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)',
            fontSize: '1.5rem',
            fontWeight: 800,
            textAlign: 'center',
            animation: 'milestoneAppear 0.5s ease-out',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🔥</div>
          <div>{streak} IN A ROW!</div>
          <div style={{ fontSize: '1rem', opacity: 0.9, marginTop: 4 }}>
            You're on fire!
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        
        @keyframes milestoneAppear {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}
