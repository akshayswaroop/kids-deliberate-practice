import React from 'react';

/**
 * Lightweight confetti celebration component
 * Triggers a brief (< 1s) CSS animation on success
 * Non-blocking, accessible, respects reduced-motion preference
 */
export default function ConfettiCelebration({ show, onComplete }) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete && onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Show simple checkmark instead of animation
    return (
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          fontSize: '4rem',
          animation: 'fadeOut 1s ease-out',
        }}
      >
        ✅
      </div>
    );
  }

  // Generate confetti particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 6],
    left: 20 + Math.random() * 60, // Random horizontal position (20-80%)
    delay: Math.random() * 0.3, // Stagger animation
    duration: 0.8 + Math.random() * 0.4, // Vary fall speed
    rotation: Math.random() * 360, // Random rotation
    size: 8 + Math.random() * 8, // Vary size (8-16px)
  }));

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999,
          overflow: 'hidden',
        }}
      >
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.left}%`,
              top: '-20px',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              borderRadius: '2px',
              animation: `confettiFall ${particle.duration}s ease-in ${particle.delay}s forwards`,
              transform: `rotate(${particle.rotation}deg)`,
            }}
          />
        ))}
        
        {/* Success icon in center */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '3rem',
            animation: 'fadeOut 1s ease-out',
          }}
        >
          ✅
        </div>
      </div>
    </>
  );
}
