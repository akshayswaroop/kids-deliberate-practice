
import React, { useEffect, useState } from 'react';

// Replace the large decorative balloon animation with a focused tile halo + falling tear animation.
// The component keeps the same contract: props { visible, onAnimationEnd } and calls onAnimationEnd after animation.
export default function SadBalloonAnimation({ visible, onAnimationEnd }) {
  const [show, setShow] = useState(visible);
  const [targetRect, setTargetRect] = useState(null);

  const [isDark, setIsDark] = useState(false);

  // check reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const darkMq = window.matchMedia('(prefers-color-scheme: dark)');
      const update = () => setReducedMotion(!!mq.matches);
      const updateDark = () => setIsDark(!!darkMq.matches);
      update();
      updateDark();
      if (mq.addEventListener) mq.addEventListener('change', update);
      else if (mq.addListener) mq.addListener(update);
      if (darkMq.addEventListener) darkMq.addEventListener('change', updateDark);
      else if (darkMq.addListener) darkMq.addListener(updateDark);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener('change', update);
        else if (mq.removeListener) mq.removeListener(update);
        if (darkMq.removeEventListener) darkMq.removeEventListener('change', updateDark);
        else if (darkMq.removeListener) darkMq.removeListener(updateDark);
      };
    }
    return undefined;
  }, []);

  // Monitor main target position (.target-word-glow). If not found, fallback to center top.
  useEffect(() => {
    const findTarget = () => {
      try {
        const el = document.querySelector('.target-word-glow');
        if (el) {
          const r = el.getBoundingClientRect();
          setTargetRect(r);
          return;
        }
      } catch (e) {
        // ignore
      }
      setTargetRect(null);
    };
    findTarget();
    window.addEventListener('resize', findTarget);
    window.addEventListener('scroll', findTarget, true);
    return () => {
      window.removeEventListener('resize', findTarget);
      window.removeEventListener('scroll', findTarget, true);
    };
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setShow(true);
      // Match animation length to the brass-fail sound (~2500ms exactly).
      const duration = reducedMotion ? 700 : 2500; // exact match to audio duration
      const timer = setTimeout(() => {
        setShow(false);
        if (onAnimationEnd) onAnimationEnd();
      }, duration);
      return () => clearTimeout(timer);
    }
    setShow(false);
  }, [visible, onAnimationEnd, reducedMotion]);

  if (!show) return null;

  // Compute position for overlay: center over target if available
  const left = targetRect ? (targetRect.left + targetRect.width / 2) : window.innerWidth / 2;
  const top = targetRect ? (targetRect.top + targetRect.height / 2) : window.innerHeight * 0.2;

  // Compute sizes based on targetRect for visibility
  const haloWidth = targetRect ? Math.round(Math.max(220, targetRect.width * 1.8)) : 320;
  const haloHeight = Math.round(haloWidth * 0.38);
  const outlineInset = Math.round(Math.max(10, haloHeight * 0.18));
  const tearW = targetRect ? Math.round(Math.min(28, Math.max(12, targetRect.width * 0.08))) : 16;
  const tearH = Math.round(tearW * 1.6);

  // Inline styles for the overlay; pointerEvents none so it doesn't block input
  const overlayStyle = {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 2200,
  };

  // Halo and tear styling use CSS animations; define inlined <style> for encapsulation
  return (
    <div style={overlayStyle} aria-hidden>
      <style>{`
        .sad-overlay {
          position: absolute;
          transform: translate(-50%, -50%);
          will-change: transform, opacity;
        }
        .halo {
          opacity: 0;
          transform-origin: center;
        }
        .halo.animate {
          animation: haloPop 2.5s cubic-bezier(.2,.9,.3,1) forwards;
        }
        @keyframes haloPop {
          0% { opacity: 0; transform: scale(0.88); }
          15% { opacity: 1; transform: scale(1.06); }
          50% { transform: scale(0.98); }
          100% { opacity: 0; transform: scale(1.02); }
        }

        .tile-outline {
          position: absolute;
          border-radius: 12px;
          box-shadow: 0 6px 22px rgba(0,0,0,0.14) inset;
          opacity: 0;
        }
  .tile-outline.animate { animation: outlinePulse 2.5s ease forwards; }
        @keyframes outlinePulse {
          0% { opacity: 0; transform: scale(0.96); }
          12% { opacity: 1; transform: scale(1.02); }
          50% { transform: scale(1.0); }
          100% { opacity: 0; transform: scale(1.0); }
        }

        .tear {
          border-radius: 8px 8px 10px 10px;
          background: linear-gradient(180deg, rgba(160,220,255,1), rgba(30,150,240,1));
          box-shadow: 0 10px 30px rgba(30,150,240,0.22);
          transform-origin: top center;
          opacity: 0;
        }
  .tear.animate { animation: tearFall 2.5s cubic-bezier(.2,.9,.3,1) forwards; }
        @keyframes tearFall {
          0% { opacity: 0; transform: translateY(-6px) scale(0.8); }
          12% { opacity: 1; transform: translateY(0px) scale(1.0); }
          50% { transform: translateY(28px) scale(0.92); }
          100% { transform: translateY(80px) scale(0.84); opacity: 0; }
        }

        /* reduced motion short-circuit */
        @media (prefers-reduced-motion: reduce) {
          .halo.animate, .tile-outline.animate, .tear.animate {
            animation-duration: 360ms !important;
            animation-timing-function: linear !important;
          }
        }
        .sadface {
          opacity: 0;
          transform-origin: center;
        }
        .sadface.animate {
          animation: sadFacePop 2.5s cubic-bezier(.2,.9,.3,1) forwards;
        }
        @keyframes sadFacePop {
          0% { transform: translateY(0) scale(0.7); opacity: 0; }
          12% { transform: translateY(-8px) scale(1.05); opacity: 1; }
          30% { transform: translateY(0px) scale(0.95); }
          60% { transform: translateY(-12px) scale(1.08); }
          100% { transform: translateY(-32px) scale(1.02); opacity: 0; }
        }
      `}</style>

      <div
        className="sad-overlay"
        style={{ left, top }}
      >
        <div
          className={`halo ${reducedMotion ? '' : 'animate'}`}
          aria-hidden
          style={{
            width: haloWidth,
            height: haloHeight,
            borderRadius: haloHeight / 2,
            background: isDark
              ? `radial-gradient(closest-side, rgba(255,255,255,0.06), rgba(255,255,255,0))`
              : `radial-gradient(closest-side, rgba(255,90,96,0.20), rgba(255,255,255,0))`,
            boxShadow: isDark
              ? '0 18px 48px rgba(255,90,96,0.08)'
              : '0 18px 48px rgba(255,90,96,0.18)',
            opacity: 1
          }}
        />

        <div
          className={`tile-outline ${reducedMotion ? '' : 'animate'}`}
          aria-hidden
          style={{
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            margin: outlineInset,
            border: `3px solid ${isDark ? 'rgba(255,255,255,0.22)' : 'rgba(220,40,47,0.95)'}`,
            opacity: 1,
            borderRadius: Math.max(8, Math.round(haloHeight * 0.22))
          }}
        />

        {/* Multiple tears - staggered positions and delays */}
        <div style={{ position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%, 0)' }}>
          <div
            className={`tear ${reducedMotion ? '' : 'animate'}`}
            aria-hidden
            style={{ width: tearW, height: tearH, marginLeft: -tearW - 6, animationDelay: reducedMotion ? '0ms' : '80ms' }}
          />
          <div
            className={`tear ${reducedMotion ? '' : 'animate'}`}
            aria-hidden
            style={{ width: tearW, height: tearH, marginLeft: -Math.round(tearW / 2), animationDelay: reducedMotion ? '0ms' : '200ms' }}
          />
          <div
            className={`tear ${reducedMotion ? '' : 'animate'}`}
            aria-hidden
            style={{ width: tearW, height: tearH, marginLeft: 6 + Math.round(tearW / 4), animationDelay: reducedMotion ? '0ms' : '340ms' }}
          />
        </div>

        {/* Yellow sad face emojis - 15 scattered around the overlay */}
        {[
          { left: '20%', top: '15%', size: 44, delay: 100 },
          { left: '75%', top: '18%', size: 38, delay: 180 },
          { left: '50%', top: '10%', size: 42, delay: 260 },
          { left: '35%', top: '25%', size: 40, delay: 340 },
          { left: '65%', top: '28%', size: 36, delay: 420 },
          { left: '12%', top: '35%', size: 38, delay: 500 },
          { left: '88%', top: '32%', size: 40, delay: 580 },
          { left: '45%', top: '38%', size: 42, delay: 660 },
          { left: '28%', top: '48%', size: 36, delay: 740 },
          { left: '72%', top: '45%', size: 38, delay: 820 },
          { left: '55%', top: '52%', size: 40, delay: 900 },
          { left: '18%', top: '58%', size: 38, delay: 980 },
          { left: '82%', top: '55%', size: 42, delay: 1060 },
          { left: '40%', top: '62%', size: 36, delay: 1140 },
          { left: '60%', top: '65%', size: 40, delay: 1220 }
        ].map((face, i) => (
          <div key={i} style={{ position: 'absolute', left: face.left, top: face.top }}>
            <svg width={face.size} height={face.size} viewBox="0 0 48 48" className={`sadface ${reducedMotion ? '' : 'animate'}`} style={{ animationDelay: reducedMotion ? '0ms' : `${face.delay}ms` }} aria-hidden>
              {/* Bright yellow smiley face */}
              <circle cx="24" cy="24" r="20" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
              {/* Dark eyes for contrast */}
              <circle cx="18" cy="20" r="3" fill="#1a1a1a" />
              <circle cx="30" cy="20" r="3" fill="#1a1a1a" />
              {/* Sad frown mouth */}
              <path d="M16 32 Q24 26 32 32" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
