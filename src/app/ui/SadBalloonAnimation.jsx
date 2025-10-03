import React, { useEffect, useState } from 'react';

export const ENCOURAGEMENT_ANIMATION_DURATION_MS = 3000;

// Gentle encouragement overlay shown after a wrong attempt.
// Keeps original contract: accepts { visible, onAnimationEnd }.
export default function SadBalloonAnimation({ visible, onAnimationEnd }) {
  const isTestEnv = (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test') ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test');
  const [show, setShow] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(!!motionQuery.matches);
    updateMotion();

    if (motionQuery.addEventListener) motionQuery.addEventListener('change', updateMotion);
    else if (motionQuery.addListener) motionQuery.addListener(updateMotion);

    return () => {
      if (motionQuery.removeEventListener) motionQuery.removeEventListener('change', updateMotion);
      else if (motionQuery.removeListener) motionQuery.removeListener(updateMotion);
    };
  }, []);

  useEffect(() => {
    const findTarget = () => {
      try {
        const el = document.querySelector('.target-word-glow');
        if (el) {
          setTargetRect(el.getBoundingClientRect());
          return;
        }
      } catch {}
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
    if (isTestEnv) {
      if (visible) {
        onAnimationEnd?.();
      }
      return;
    }

    if (visible) {
      setShow(true);
      const duration = reducedMotion ? 700 : ENCOURAGEMENT_ANIMATION_DURATION_MS;
      const timer = window.setTimeout(() => {
        setShow(false);
        onAnimationEnd?.();
      }, duration);
      return () => window.clearTimeout(timer);
    }
    setShow(false);
  }, [visible, onAnimationEnd, reducedMotion, isTestEnv]);

  if (isTestEnv) return null;
  if (!show) return null;

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const anchorX = targetRect ? targetRect.left + targetRect.width / 2 : viewportWidth / 2;
  const anchorY = targetRect ? Math.max(targetRect.top - 40, viewportHeight * 0.18) : viewportHeight * 0.22;

  const glowSize = targetRect ? Math.max(targetRect.width, 140) : Math.min(viewportWidth * 0.35, 220);
  const cardWidth = Math.min(360, Math.max(260, glowSize * 1.4));

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 2400,
  };

  const effectiveDurationMs = reducedMotion ? 700 : ENCOURAGEMENT_ANIMATION_DURATION_MS;
  const baseSeconds = effectiveDurationMs / 1000;
  const glowDuration = reducedMotion ? 0.6 : Math.max(baseSeconds * 0.92, 1.4);
  const cardDuration = reducedMotion ? 0.6 : baseSeconds;
  const sparkleDriftDuration = reducedMotion ? 0.6 : baseSeconds;
  const sparklePopDuration = reducedMotion ? 0.6 : Math.max(baseSeconds * 0.9, 1.1);

  return (
    <div style={overlayStyle} aria-hidden>
      <style>{`
        .encourage-glow {
          position: absolute;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(80,200,255,0.28) 0%, rgba(80,200,255,0.08) 55%, transparent 80%);
          filter: blur(0px);
          opacity: 0;
        }
        .encourage-glow.animate {
          animation: glowPulse ${glowDuration}s ease-out forwards;
        }

        .encourage-card {
          position: absolute;
          transform: translate(-50%, -50%);
          width: ${cardWidth}px;
          padding: 18px 22px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(224,246,255,0.98));
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
          display: flex;
          gap: 14px;
          align-items: flex-start;
          opacity: 0;
        }
        .encourage-card.animate {
          animation: cardFloat ${cardDuration}s cubic-bezier(.2,.9,.3,1) forwards;
        }

        .encourage-card .icon {
          font-size: 2.2rem;
          line-height: 1;
          filter: drop-shadow(0 6px 14px rgba(56, 189, 248, 0.35));
        }

        .encourage-card h4 {
          margin: 0 0 4px 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
        }
        .encourage-card p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.45;
          color: #1f2937;
        }

        .encourage-card p strong {
          color: #0284c7;
        }

        .sparkle-cluster {
          position: absolute;
          transform: translate(-50%, -50%);
          display: grid;
          place-items: center;
          opacity: 0;
        }
        .sparkle-cluster.animate {
          animation: sparkleDrift ${sparkleDriftDuration}s ease-out forwards;
        }
        .sparkle-cluster span {
          font-size: 1.4rem;
          opacity: 0;
          animation: sparklePop ${sparklePopDuration}s ease-out forwards;
        }
        .sparkle-cluster span:nth-child(2) { animation-delay: 0.18s; }
        .sparkle-cluster span:nth-child(3) { animation-delay: 0.32s; }

        @keyframes glowPulse {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          18% { opacity: 0.22; transform: translate(-50%, -50%) scale(0.9); }
          80% { opacity: 0.28; transform: translate(-50%, -50%) scale(1.05); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
        }

        @keyframes cardFloat {
          0% { opacity: 0; transform: translate(-50%, -22%) scale(0.85); }
          15% { opacity: 1; transform: translate(-50%, -6%) scale(1.03); }
          70% { opacity: 1; transform: translate(-50%, -10%) scale(1.0); }
          90% { opacity: 1; transform: translate(-50%, -12%) scale(1.0); }
          100% { opacity: 0; transform: translate(-50%, -28%) scale(0.97); }
        }

        @keyframes sparkleDrift {
          0% { opacity: 0; transform: translate(-50%, -70%); }
          20% { opacity: 1; transform: translate(-50%, -105%); }
          85% { opacity: 1; transform: translate(-50%, -135%); }
          100% { opacity: 0; transform: translate(-50%, -165%); }
        }

        @keyframes sparklePop {
          0% { opacity: 0; transform: scale(0.4) rotate(0deg); }
          25% { opacity: 1; transform: scale(1.1) rotate(10deg); }
          75% { opacity: 0.95; transform: scale(0.95) rotate(-6deg); }
          100% { opacity: 0; transform: scale(0.6) rotate(8deg); }
        }
      `}</style>

      <div
        className={`encourage-glow ${reducedMotion ? '' : 'animate'}`}
        style={{
          left: anchorX,
          top: anchorY,
          width: glowSize,
          height: glowSize,
        }}
      />

      <div
        className={`encourage-card ${reducedMotion ? '' : 'animate'}`}
        style={{
          left: anchorX,
          top: anchorY + glowSize * 0.55,
        }}
      >
        <div className="icon" aria-hidden>🌈</div>
        <div>
          <h4>Great effort!</h4>
          <p>
            Let's peek at the explanation and <strong>give it another go.</strong>
          </p>
        </div>
      </div>

      <div
        className={`sparkle-cluster ${reducedMotion ? '' : 'animate'}`}
        style={{
          left: anchorX,
          top: anchorY - glowSize * 0.25,
        }}
      >
        <span aria-hidden>✨</span>
        <span aria-hidden>💫</span>
        <span aria-hidden>✨</span>
      </div>
    </div>
  );
}
