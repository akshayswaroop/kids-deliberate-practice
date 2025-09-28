import React from "react";

// Flying unicorn SVG as a React component
export default function FlyingUnicorn({ visible, onAnimationEnd }) {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: "30vh",
        width: "560px",
        height: "360px",
        pointerEvents: "none",
        zIndex: 2000,
        transition: "opacity 0.3s",
        opacity: visible ? 1 : 0,
        animation: visible ? "fly-unicorn 2.5s linear forwards" : "none"
      }}
      onAnimationEnd={onAnimationEnd}
    >
      {/* Crisp Flying Unicorn SVG (recognizable silhouette) */}
      <svg viewBox="0 0 560 360" width="100%" height="100%" role="img" aria-label="Flying unicorn">
        <defs>
          <linearGradient id="bodyG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff"/>
            <stop offset="100%" stopColor="#f3f6ff"/>
          </linearGradient>
          <linearGradient id="rbw" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#ff3b30"/>
            <stop offset="20%" stopColor="#ff9500"/>
            <stop offset="40%" stopColor="#ffd60a"/>
            <stop offset="60%" stopColor="#34c759"/>
            <stop offset="80%" stopColor="#0a84ff"/>
            <stop offset="100%" stopColor="#af52de"/>
          </linearGradient>
          <linearGradient id="wingG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e7ecff" />
          </linearGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#98a2ff" floodOpacity="0.25"/>
          </filter>
          <style>{`
            .bob   { animation:bob 3.6s ease-in-out infinite; transform-origin: 280px 180px; }
            .wing  { animation:flap 1.2s ease-in-out infinite; transform-origin: 305px 120px; }
            .wing2 { animation:flap 1.2s ease-in-out infinite reverse; transform-origin: 330px 132px; }
            @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
            @keyframes flap{ 0%,100%{transform:rotate(8deg)} 50%{transform:rotate(-14deg)} }
            .line { stroke:#d6dcff; stroke-width:2; }
            @keyframes fly-unicorn {
              0%   { left: -560px; opacity: 1; }
              10%  { opacity: 1; }
              90%  { opacity: 1; }
              100% { left: 100vw; opacity: 0; }
            }
          `}</style>
        </defs>

        {/* sparkles */}
        <g opacity=".7">
          <circle cx="60" cy="70" r="2.2" fill="#ffd6ff"/>
          <circle cx="120" cy="300" r="1.8" fill="#e1f0ff"/>
          <circle cx="520" cy="70" r="2" fill="#e5dbff"/>
          <circle cx="480" cy="300" r="2" fill="#ffe8d1"/>
        </g>

        {/* Unicorn group */}
        <g className="bob" filter="url(#soft)">
          {/* Tail */}
          <path d="M235 210
                   c-35 12 -52 45 -28 65
                   c20 -8 35 -10 48 2
                   c-7 -18 -7 -35 8 -50 z"
                fill="url(#rbw)"/>

          {/* Body (horse-like oval) */}
          <ellipse cx="325" cy="200" rx="120" ry="80" fill="url(#bodyG)" stroke="#e6eaff" strokeWidth="2"/>

          {/* Legs */}
          <g>
            <rect x="300" y="250" width="18" height="50" rx="8" fill="#fff" stroke="#e6eaff" strokeWidth="2"/>
            <rect x="360" y="250" width="18" height="50" rx="8" fill="#fff" stroke="#e6eaff" strokeWidth="2"/>
            <rect x="300" y="295" width="18" height="8" rx="4" fill="#c9d2ff"/>
            <rect x="360" y="295" width="18" height="8" rx="4" fill="#c9d2ff"/>
          </g>

          {/* Neck */}
          <path d="M390 155 q18 35 -8 60 h-38 q-8 -38 15 -65 z"
                fill="url(#bodyG)" stroke="#e6eaff" strokeWidth="2"/>

          {/* Head with muzzle */}
          <g transform="translate(400,130)">
            {/* head */}
            <path d="M0 40
                     a38 34 0 1 0 76 0
                     q0 -18 -10 -28
                     q-15 -14 -35 -14
                     q-20 0 -31 13
                     q-10 10 -10 29z"
                  fill="url(#bodyG)" stroke="#e6eaff" strokeWidth="2"/>
            {/* ear */}
            <path d="M46 -2 L60 16 L42 12 Z" fill="#fff" stroke="#e6eaff" strokeWidth="2"/>
            {/* horn (spiral look) */}
            <path d="M28 -18 L42 12 L20 8 Z" fill="url(#rbw)" stroke="#e6eaff" strokeWidth="1.5"/>
            {/* eye */}
            <circle cx="54" cy="38" r="5.5" fill="#333648"/>
            {/* cheek */}
            <circle cx="44" cy="52" r="6" fill="#ffc6d9"/>
            {/* bridle line */}
            <path d="M15 40 Q38 32 76 40" className="line" fill="none"/>
          </g>

          {/* Mane */}
          <path d="M376 150
                   c-40 -25 -70 -28 -95 -15
                   c30 10 45 20 55 35
                   c8 -6 20 -13 40 -20 z"
                fill="url(#rbw)"/>

          {/* Wings */}
          <g className="wing">
            <path d="M305 120
                     c-55 -10 -90 12 -95 40
                     c35 0 65 8 95 25
                     c-8 -18 -4 -40 0 -65 z"
                  fill="url(#wingG)" stroke="#dfe4ff" strokeWidth="2"/>
            <path d="M240 150 c14 6 30 12 48 18" className="line" fill="none"/>
            <path d="M255 140 c14 6 30 12 48 18" className="line" fill="none"/>
          </g>
          <g className="wing2">
            <path d="M330 132
                     c-45 -14 -74 6 -78 30
                     c30 0 54 8 78 22
                     c-6 -16 -3 -34 0 -52 z"
                  fill="url(#wingG)" stroke="#dfe4ff" strokeWidth="2"/>
            <path d="M275 154 c12 5 25 10 40 15" className="line" fill="none"/>
          </g>
        </g>
      </svg>
    </div>
  );
}
