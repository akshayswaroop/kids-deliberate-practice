
import React, { useEffect, useState } from "react";

// Upgraded sad balloon animation: improved gradients, soft glow, particles and dark-mode aware shadows
export default function SadBalloonAnimation({ visible, onAnimationEnd }) {
  const [show, setShow] = useState(visible);
  // Detect preferred color scheme to adapt glow/shadow colors
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const update = () => setIsDark(!!mq.matches);
      update();
      if (mq.addEventListener) mq.addEventListener('change', update);
      else if (mq.addListener) mq.addListener(update);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener('change', update);
        else if (mq.removeListener) mq.removeListener(update);
      };
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (visible) {
      setShow(true);
      // Hide after animation duration (2.6s) — slightly longer for refined fades
      const timer = setTimeout(() => {
        setShow(false);
        if (onAnimationEnd) onAnimationEnd();
      }, 2600);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, onAnimationEnd]);

  if (!show) return null;

  // Choose shadow/glow colors based on theme
  const shadowColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)';
  const innerGlow = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)';

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: '28vh',
        width: '100vw',
        height: '380px',
        pointerEvents: 'none',
        zIndex: 2100,
        display: visible ? 'block' : 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 220ms ease'
      }}
    >
      <svg viewBox="0 0 560 380" width="100%" height="100%" aria-label="Sad balloons">
        <defs>
          {/* Soft glow filter used for dark/light modes */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle highlight for balloons */}
          <radialGradient id="highlight" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0%" stopColor={innerGlow} stopOpacity="1" />
            <stop offset="60%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Vivid balloon gradients (tuned for contrast) */}
          <radialGradient id="balloonRed" cx="0.4" cy="0.35" r="0.9">
            <stop offset="0%" stopColor="#fff2f0" />
            <stop offset="50%" stopColor="#ff5960" />
            <stop offset="85%" stopColor="#ff2d55" />
            <stop offset="100%" stopColor="#c81d25" />
          </radialGradient>
          <radialGradient id="balloonBlue" cx="0.4" cy="0.35" r="0.9">
            <stop offset="0%" stopColor="#eef8ff" />
            <stop offset="50%" stopColor="#2f8bff" />
            <stop offset="85%" stopColor="#1d6fe9" />
            <stop offset="100%" stopColor="#0b5ed7" />
          </radialGradient>
          <radialGradient id="balloonYellow" cx="0.4" cy="0.35" r="0.9">
            <stop offset="0%" stopColor="#fffde7" />
            <stop offset="50%" stopColor="#ffd54a" />
            <stop offset="85%" stopColor="#ffbf00" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
          <radialGradient id="balloonGreen" cx="0.4" cy="0.35" r="0.9">
            <stop offset="0%" stopColor="#f0fff3" />
            <stop offset="50%" stopColor="#3cc26a" />
            <stop offset="85%" stopColor="#32b36b" />
            <stop offset="100%" stopColor="#15803d" />
          </radialGradient>
          <radialGradient id="balloonPurple" cx="0.4" cy="0.35" r="0.9">
            <stop offset="0%" stopColor="#f6efff" />
            <stop offset="50%" stopColor="#b06bff" />
            <stop offset="85%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </radialGradient>

          <style>{`
            .balloon {
              animation: floatBounce 2.6s cubic-bezier(.2,.9,.3,1) forwards;
              filter: drop-shadow(0 10px 30px ${shadowColor});
            }
            .balloon1 { animation-delay: 0s; }
            .balloon2 { animation-delay: 0.18s; }
            .balloon3 { animation-delay: 0.36s; }
            .balloon4 { animation-delay: 0.54s; }
            .balloon5 { animation-delay: 0.72s; }

            @keyframes floatBounce {
              0% { transform: translateY(70px) scale(0.82); opacity: 0; }
              12% { transform: translateY(46px) scale(1.02); opacity: 1; }
              28% { transform: translateY(18px) scale(0.96); }
              44% { transform: translateY(0px) scale(1.06); }
              60% { transform: translateY(-26px) scale(0.98); }
              78% { transform: translateY(-52px) scale(1.08); }
              90% { opacity: 1; }
              100% { transform: translateY(-110px) scale(1.14); opacity: 0; }
            }

            .string {
              stroke-linecap: round;
              stroke-opacity: 0.95;
              transition: stroke 200ms ease;
            }

            .sadface {
              animation: sadPulse 2.6s cubic-bezier(.2,.9,.3,1) forwards;
              transform-origin: center;
            }
            .sadface1 { animation-delay: 0.12s; }
            .sadface2 { animation-delay: 0.5s; }

            @keyframes sadPulse {
              0% { transform: translateY(0) scale(0.78); opacity: 0; }
              14% { transform: translateY(-8px) scale(1.06); opacity: 1; }
              30% { transform: translateY(0px) scale(0.98); }
              46% { transform: translateY(-10px) scale(1.08); }
              64% { transform: translateY(0px) scale(1.0); }
              84% { transform: translateY(-14px) scale(1.12); }
              100% { transform: translateY(-24px) scale(1.08); opacity: 0; }
            }

            /* small sparkling particles behind balloons for visual richness */
            .sparkle { animation: sparkleAnim 2.6s ease forwards; opacity: 0; }
            .sparkle1 { animation-delay: 0s; }
            .sparkle2 { animation-delay: 0.2s; }
            .sparkle3 { animation-delay: 0.45s; }
            @keyframes sparkleAnim {
              0% { transform: scale(0.6) translateY(6px); opacity: 0; }
              25% { opacity: 1; transform: scale(1) translateY(0); }
              70% { opacity: 0.7; transform: scale(0.9) translateY(-20px); }
              100% { opacity: 0; transform: scale(0.8) translateY(-36px); }
            }
          `}</style>
        </defs>

        {/* Soft background vignette for depth */}
        <rect x="0" y="0" width="560" height="380" fill="none" />

        {/* Sparkles for depth */}
        <g>
          <circle className="sparkle sparkle1" cx="90" cy="210" r="3" fill="#fff" opacity="0.9" />
          <circle className="sparkle sparkle2" cx="520" cy="170" r="2.8" fill="#fff" opacity="0.85" />
          <circle className="sparkle sparkle3" cx="300" cy="240" r="2.6" fill="#fff" opacity="0.8" />
        </g>

        {/* Balloons - more colors, staggered lively animation */}
        <g filter="url(#softGlow)">
          <ellipse className="balloon balloon1" cx="120" cy="230" rx="30" ry="42" fill="url(#balloonRed)" />
          <ellipse className="balloon balloon2" cx="440" cy="210" rx="26" ry="36" fill="url(#balloonBlue)" />
          <ellipse className="balloon balloon3" cx="280" cy="270" rx="28" ry="38" fill="url(#balloonYellow)" />
          <ellipse className="balloon balloon4" cx="200" cy="270" rx="24" ry="34" fill="url(#balloonGreen)" />
          <ellipse className="balloon balloon5" cx="360" cy="250" rx="26" ry="36" fill="url(#balloonPurple)" />
        </g>

        {/* Balloon highlights */}
        <ellipse cx="120" cy="212" rx="12" ry="8" fill="url(#highlight)" opacity="0.85" />
        <ellipse cx="440" cy="198" rx="10" ry="6" fill="url(#highlight)" opacity="0.85" />
        <ellipse cx="280" cy="252" rx="11" ry="7" fill="url(#highlight)" opacity="0.85" />
        <ellipse cx="200" cy="252" rx="9" ry="6" fill="url(#highlight)" opacity="0.85" />
        <ellipse cx="360" cy="232" rx="10" ry="6" fill="url(#highlight)" opacity="0.85" />

        {/* Balloon strings with softened color */}
        <path className="string" d="M120 272 Q120 310 138 342" stroke="#b91c1c" strokeWidth="2" fill="none" strokeOpacity="0.95" />
        <path className="string" d="M440 244 Q440 290 420 344" stroke="#0b5ed7" strokeWidth="2" fill="none" strokeOpacity="0.95" />
        <path className="string" d="M280 308 Q280 338 300 348" stroke="#b77903" strokeWidth="2" fill="none" strokeOpacity="0.95" />
        <path className="string" d="M200 304 Q200 328 220 350" stroke="#137f3a" strokeWidth="2" fill="none" strokeOpacity="0.95" />
        <path className="string" d="M360 284 Q360 318 380 352" stroke="#5b21b6" strokeWidth="2" fill="none" strokeOpacity="0.95" />

        {/* Sad smiley faces - more expressive, staggered lively animation */}
        <g className="sadface sadface1">
          <circle cx="180" cy="120" r="34" fill="url(#balloonYellow)" stroke="#fbbf24" strokeWidth="3" />
          <ellipse cx="170" cy="115" rx="4" ry="7" fill="#1f2937" />
          <ellipse cx="190" cy="115" rx="4" ry="7" fill="#1f2937" />
          <path d="M170 136 Q180 125 190 136" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Tear drop */}
          <ellipse cx="175" cy="131" rx="2.5" ry="5" fill="#0ea5e9" opacity="0.9" />
          {/* Soft cheek highlight */}
          <ellipse cx="185" cy="137" rx="4" ry="2" fill="#fbbf24" opacity="0.25" />
        </g>

        <g className="sadface sadface2">
          <circle cx="380" cy="100" r="30" fill="url(#balloonPurple)" stroke="#a78bfa" strokeWidth="3" />
          <ellipse cx="370" cy="95" rx="3" ry="6" fill="#1f2937" />
          <ellipse cx="390" cy="95" rx="3" ry="6" fill="#1f2937" />
          <path d="M370 121 Q380 110 390 121" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="375" cy="116" rx="2" ry="4" fill="#60a5fa" opacity="0.9" />
          <ellipse cx="385" cy="121" rx="3" ry="1.5" fill="#a78bfa" opacity="0.22" />
        </g>
      </svg>
    </div>
  );
}
