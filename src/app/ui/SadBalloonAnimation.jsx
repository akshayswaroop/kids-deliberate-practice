
import React, { useEffect, useState } from "react";

// Sad smiley faces with vibrant balloons and lively animation for wrong answers
export default function SadBalloonAnimation({ visible, onAnimationEnd }) {
  const [show, setShow] = useState(visible);
  useEffect(() => {
    if (visible) {
      setShow(true);
      // Hide after animation duration (2.5s, matches sound)
      const timer = setTimeout(() => {
        setShow(false);
        if (onAnimationEnd) onAnimationEnd();
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, onAnimationEnd]);

  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: "30vh",
        width: "100vw",
        height: "360px",
        pointerEvents: "none",
        zIndex: 2100,
        display: visible ? "block" : "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s"
      }}
    >
      <svg viewBox="0 0 560 360" width="100%" height="100%" aria-label="Sad balloons">
        <defs>
          {/* Vivid balloon gradients */}
          <radialGradient id="balloonRed" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fff8f0"/>
            <stop offset="60%" stopColor="#ff3b30"/>
            <stop offset="80%" stopColor="#ff6b81"/>
            <stop offset="100%" stopColor="#c81d25"/>
          </radialGradient>
          <radialGradient id="balloonBlue" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#e0f7ff"/>
            <stop offset="60%" stopColor="#0a84ff"/>
            <stop offset="80%" stopColor="#60a5fa"/>
            <stop offset="100%" stopColor="#2563eb"/>
          </radialGradient>
          <radialGradient id="balloonYellow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fffde7"/>
            <stop offset="60%" stopColor="#ffd60a"/>
            <stop offset="80%" stopColor="#facc15"/>
            <stop offset="100%" stopColor="#f59e0b"/>
          </radialGradient>
          <radialGradient id="balloonGreen" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#e6ffe6"/>
            <stop offset="60%" stopColor="#34c759"/>
            <stop offset="80%" stopColor="#4ade80"/>
            <stop offset="100%" stopColor="#15803d"/>
          </radialGradient>
          <radialGradient id="balloonPurple" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#f3e8ff"/>
            <stop offset="60%" stopColor="#af52de"/>
            <stop offset="80%" stopColor="#a78bfa"/>
            <stop offset="100%" stopColor="#6d28d9"/>
          </radialGradient>
          <style>{`
            .balloon {
              animation: floatBounceFade 2.5s cubic-bezier(.4,.8,.6,1) forwards;
              opacity: 1;
              filter: drop-shadow(0 4px 16px rgba(0,0,0,0.12));
            }
            .balloon1 { animation-delay: 0s; }
            .balloon2 { animation-delay: 0.3s; }
            .balloon3 { animation-delay: 0.6s; }
            .balloon4 { animation-delay: 0.9s; }
            .balloon5 { animation-delay: 1.2s; }
            @keyframes floatBounceFade {
              0% { transform: translateY(60px) scale(0.8); opacity: 0.7; }
              10% { transform: translateY(40px) scale(1.05); }
              20% { transform: translateY(20px) scale(0.95); opacity: 1; }
              35% { transform: translateY(0px) scale(1.08); }
              50% { transform: translateY(-20px) scale(0.98); }
              65% { transform: translateY(-40px) scale(1.12); }
              80% { transform: translateY(-60px) scale(0.96); }
              90% { opacity: 1; }
              100% { transform: translateY(-90px) scale(1.12); opacity: 0; }
            }
            .sadface {
              animation: sadBounceFade 2.5s cubic-bezier(.4,.8,.6,1) forwards;
              opacity: 1;
              filter: drop-shadow(0 2px 8px rgba(0,0,0,0.10));
            }
            .sadface1 { animation-delay: 0.2s; }
            .sadface2 { animation-delay: 0.7s; }
            @keyframes sadBounceFade {
              0% { transform: scale(0.7) translateY(0); opacity: 0.7; }
              15% { transform: scale(1.05) translateY(-10px); }
              30% { transform: scale(0.95) translateY(0); opacity: 1; }
              45% { transform: scale(1.08) translateY(-12px); }
              60% { transform: scale(0.98) translateY(0); }
              80% { transform: scale(1.12) translateY(-16px); }
              90% { opacity: 1; }
              100% { transform: scale(1.1) translateY(-20px); opacity: 0; }
            }
          `}</style>
        </defs>
        {/* Balloons - more colors, staggered lively animation */}
        <ellipse className="balloon balloon1" cx="120" cy="220" rx="28" ry="38" fill="url(#balloonRed)"/>
        <ellipse className="balloon balloon2" cx="440" cy="200" rx="24" ry="34" fill="url(#balloonBlue)"/>
        <ellipse className="balloon balloon3" cx="280" cy="260" rx="26" ry="36" fill="url(#balloonYellow)"/>
        <ellipse className="balloon balloon4" cx="200" cy="260" rx="22" ry="32" fill="url(#balloonGreen)"/>
        <ellipse className="balloon balloon5" cx="360" cy="240" rx="24" ry="34" fill="url(#balloonPurple)"/>
        {/* Balloon strings */}
        <path d="M120 258 Q120 300 140 340" stroke="#b91c1c" strokeWidth="2" fill="none"/>
        <path d="M440 234 Q440 280 420 340" stroke="#2563eb" strokeWidth="2" fill="none"/>
        <path d="M280 296 Q280 330 300 340" stroke="#ca8a04" strokeWidth="2" fill="none"/>
        <path d="M200 292 Q200 320 220 340" stroke="#15803d" strokeWidth="2" fill="none"/>
        <path d="M360 274 Q360 310 380 340" stroke="#6d28d9" strokeWidth="2" fill="none"/>
        {/* Sad smiley faces - more expressive, staggered lively animation */}
        <g className="sadface sadface1">
          <circle cx="180" cy="120" r="32" fill="url(#balloonYellow)" stroke="#fbbf24" strokeWidth="3"/>
          <ellipse cx="170" cy="115" rx="4" ry="7" fill="#64748b"/>
          <ellipse cx="190" cy="115" rx="4" ry="7" fill="#64748b"/>
          <path d="M170 135 Q180 125 190 135" stroke="#64748b" strokeWidth="3" fill="none"/>
          {/* Tear drop */}
          <ellipse cx="175" cy="130" rx="2.5" ry="5" fill="#60a5fa" opacity="0.7"/>
          {/* Cheek blush */}
          <ellipse cx="185" cy="135" rx="4" ry="2" fill="#fbbf24" opacity="0.7"/>
        </g>
        <g className="sadface sadface2">
          <circle cx="380" cy="100" r="28" fill="url(#balloonPurple)" stroke="#a78bfa" strokeWidth="3"/>
          <ellipse cx="370" cy="95" rx="3" ry="6" fill="#64748b"/>
          <ellipse cx="390" cy="95" rx="3" ry="6" fill="#64748b"/>
          <path d="M370 120 Q380 110 390 120" stroke="#64748b" strokeWidth="2.5" fill="none"/>
          {/* Exaggerated frown and tear */}
          <ellipse cx="375" cy="115" rx="2" ry="4" fill="#0ea5e9" opacity="0.7"/>
          {/* Cheek blush */}
          <ellipse cx="385" cy="120" rx="3" ry="1.5" fill="#a78bfa" opacity="0.7"/>
        </g>
      </svg>
    </div>
  );
}
