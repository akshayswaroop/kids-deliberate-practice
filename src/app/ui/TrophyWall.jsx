import React from 'react';

/**
 * TrophyWall Component
 * 
 * Visual trophy collection display for kids to track session progress.
 * Shows 12 slots that fill with trophies as words are mastered.
 * 
 * Design principles:
 * - Binary feedback: Trophy earned or empty slot (no ambiguity)
 * - Visual goal: "Earn 10 trophies to complete!"
 * - Instant gratification: Trophy appears as soon as word is mastered
 * - Kid-friendly: Uses emojis and simple language
 */
export default function TrophyWall({ 
  totalWords = 12, 
  masteredCount = 0,
  goalCount = 10 
}) {
  const [justCompletedGoal, setJustCompletedGoal] = React.useState(false);
  const prevMasteredRef = React.useRef(masteredCount);

  // Detect when goal is just reached
  React.useEffect(() => {
    const prev = prevMasteredRef.current;
    if (prev < goalCount && masteredCount >= goalCount) {
      setJustCompletedGoal(true);
      // Reset after animation
      const timer = setTimeout(() => setJustCompletedGoal(false), 2000);
      return () => clearTimeout(timer);
    }
    prevMasteredRef.current = masteredCount;
  }, [masteredCount, goalCount]);

  const trophies = [];
  
  for (let i = 0; i < totalWords; i++) {
    if (i < masteredCount) {
      trophies.push({ id: i, earned: true });
    } else {
      trophies.push({ id: i, earned: false });
    }
  }

  const isComplete = masteredCount >= goalCount;
  const remaining = Math.max(0, goalCount - masteredCount);

  return (
    <div style={{
      background: isComplete 
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))'
        : 'linear-gradient(135deg, rgba(249, 250, 251, 0.8), rgba(243, 244, 246, 0.6))',
      borderRadius: '16px',
      padding: '12px 16px',
      border: isComplete 
        ? '2px solid rgba(16, 185, 129, 0.4)'
        : '2px solid rgba(229, 231, 235, 0.8)',
      boxShadow: isComplete
        ? '0 4px 16px rgba(16, 185, 129, 0.2)'
        : '0 2px 8px rgba(15, 23, 42, 0.04)',
      transition: 'all 400ms ease',
      animation: justCompletedGoal ? 'goalReached 600ms ease' : 'none'
    }}>
      {/* Goal text */}
      <div style={{
        fontSize: 'clamp(12px, 3vw, 14px)',
        fontWeight: 700,
        color: isComplete ? '#10b981' : '#64748b',
        marginBottom: '8px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        flexWrap: 'wrap'
      }}>
        {isComplete ? (
          <>
            <span style={{ fontSize: '18px' }}>🎉</span>
            <span>All {totalWords} trophies earned! Amazing!</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '16px' }}>🎯</span>
            <span>
              Collect all {totalWords} trophies
              {masteredCount > 0 && ` • ${remaining} to go!`}
            </span>
          </>
        )}
      </div>

      {/* Trophy grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(28px, 1fr))',
        gap: 'clamp(6px, 1.5vw, 8px)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {trophies.map((trophy) => (
          <div
            key={trophy.id}
            style={{
              fontSize: 'clamp(24px, 6vw, 28px)',
              textAlign: 'center',
              transition: 'transform 200ms ease, filter 200ms ease',
              transform: trophy.earned ? 'scale(1)' : 'scale(0.85)',
              filter: trophy.earned ? 'none' : 'grayscale(100%) opacity(0.3)',
              animation: trophy.earned ? 'trophyPop 400ms ease' : 'none'
            }}
            aria-label={trophy.earned ? 'Trophy earned' : 'Trophy not yet earned'}
          >
            🏆
          </div>
        ))}
      </div>

      {/* Progress text */}
      <div style={{
        marginTop: '8px',
        fontSize: 'clamp(11px, 2.5vw, 13px)',
        fontWeight: 600,
        color: isComplete ? '#059669' : '#94a3b8',
        textAlign: 'center'
      }}>
        {masteredCount}/{totalWords} trophies earned
        {isComplete && ' ✓'}
      </div>

      {/* CSS animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes trophyPop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes goalReached {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.02);
          }
          75% {
            transform: scale(0.98);
          }
        }
      `}} />
    </div>
  );
}
