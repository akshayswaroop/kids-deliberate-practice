/**
 * 🏆 Trophy Animation Component
 * 
 * Celebratory animation when a new trophy (turnaround) is earned.
 * - Shows large trophy in center with pop-in animation
 * - Holds briefly, then shrinks and flies into trophy badge in header
 * - Badge bounces when trophy lands
 * - Optionally adds confetti on appearance and star trail while flying
 * - Whole animation finishes in about three seconds for extra celebration
 * - Runs as overlay so layout doesn't shift
 * - Supports animation queue for multiple trophies
 * - Respects reduced motion accessibility preference
 */

import React, { useState, useEffect, useRef } from 'react';

interface TrophyAnimationProps {
  visible: boolean;
  onAnimationEnd: () => void;
  targetBadgeSelector?: string; // CSS selector for trophy badge in header
}

const TROPHY_ANIMATION_DURATION_MS = 3200;
const TROPHY_COMPLETE_DELAY_MS = 500;
const CONFETTI_PARTICLE_COUNT = 60;
const SPARKLE_COUNT = 36;
const STARBURST_COUNT = 12;

export default function TrophyAnimation({ 
  visible, 
  onAnimationEnd,
  targetBadgeSelector = '.stat-badge:has(.emoji)' // Default to first stat badge with emoji
}: TrophyAnimationProps) {
  const [show, setShow] = useState(visible);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);
  const starburstRef = useRef<HTMLDivElement>(null);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => setReducedMotion(!!mq.matches);
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

  // Find target badge position
  useEffect(() => {
    const findTarget = () => {
      try {
        const el = document.querySelector(targetBadgeSelector);
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
  }, [visible, targetBadgeSelector]);

  // Handle animation lifecycle
  useEffect(() => {
    if (visible) {
      setShow(true);
      
      // If reduced motion, skip animation and just call onAnimationEnd
      if (reducedMotion) {
        const timer = setTimeout(() => {
          setShow(false);
          if (onAnimationEnd) onAnimationEnd();
        }, 100); // Minimal delay
        return () => clearTimeout(timer);
      }
      
      // Normal animation spans several seconds for a big celebration
      const duration = TROPHY_ANIMATION_DURATION_MS;
      
      // Trigger badge bounce when trophy lands at the end of the flight
      const badgeBounceTimer = setTimeout(() => {
        const badge = document.querySelector(targetBadgeSelector);
        if (badge) {
          badge.classList.add('animated');
          setTimeout(() => {
            badge.classList.remove('animated');
          }, 600); // Badge bounce duration from ProgressStatsDisplay
        }
      }, duration);
      
      // Complete animation after badge bounce
      const completeTimer = setTimeout(() => {
        setShow(false);
        if (onAnimationEnd) onAnimationEnd();
      }, duration + TROPHY_COMPLETE_DELAY_MS);
      
      return () => {
        clearTimeout(badgeBounceTimer);
        clearTimeout(completeTimer);
      };
    }
    setShow(false);
  }, [visible, onAnimationEnd, reducedMotion, targetBadgeSelector]);

  // Create confetti particles
  useEffect(() => {
    if (!show || reducedMotion || !confettiRef.current) {
      if (confettiRef.current) {
        confettiRef.current.innerHTML = '';
      }
      return;
    }
    
    const container = confettiRef.current;
    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    
    // Create celebratory confetti burst
    for (let i = 0; i < CONFETTI_PARTICLE_COUNT; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';
      particle.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: 50%;
        top: 50%;
        opacity: 1;
        border-radius: 2px;
        pointer-events: none;
      `;
      
      // Random direction
      const angle = (i / CONFETTI_PARTICLE_COUNT) * Math.PI * 2;
      const velocity = 70 + Math.random() * 70;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;
      
      particle.style.animation = `confetti-burst 1.5s ease-out forwards`;
      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      
      container.appendChild(particle);
    }
    
    // Cleanup
    const cleanup = setTimeout(() => {
      container.innerHTML = '';
    }, 1700);
    
    return () => {
      clearTimeout(cleanup);
      container.innerHTML = '';
    };
  }, [show, reducedMotion]);

  // Create sparkle particles that orbit the trophy
  useEffect(() => {
    const container = sparklesRef.current;
    if (!container) return;

    if (!show || reducedMotion) {
      container.innerHTML = '';
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxTrophyWidth = viewportWidth * 0.8;
    const trophySize = Math.min(viewportHeight * 0.75, maxTrophyWidth);
    const orbitRadius = Math.max(trophySize * 0.45, 150);

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'trophy-sparkle';
      const delay = (i / SPARKLE_COUNT) * 0.9;
      const scale = 0.7 + Math.random() * 0.8;
      const rotation = (360 / SPARKLE_COUNT) * i;
      sparkle.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        width: 18px;
        height: 18px;
        transform-origin: center;
        pointer-events: none;
        opacity: 0;
        animation: sparkle-orbit ${(TROPHY_ANIMATION_DURATION_MS / 1000).toFixed(2)}s ease-in-out ${delay}s forwards;
      `;
      sparkle.style.setProperty('--sparkle-scale', scale.toString());
      sparkle.style.setProperty('--sparkle-rotation', `${rotation}deg`);
      sparkle.style.setProperty('--sparkle-radius', `${orbitRadius}px`);
      sparkle.innerHTML = '<span class="sparkle-core"></span>';
      sparkle.dataset.sparkleIndex = String(i);
      container.appendChild(sparkle);
    }

    return () => {
      container.innerHTML = '';
    };
  }, [show, reducedMotion]);

  // Create starburst rays that explode outward with the trophy
  useEffect(() => {
    const container = starburstRef.current;
    if (!container) return;

    if (!show || reducedMotion) {
      container.innerHTML = '';
      return;
    }

    for (let i = 0; i < STARBURST_COUNT; i++) {
      const ray = document.createElement('div');
      ray.className = 'trophy-starburst';
      const rotation = (360 / STARBURST_COUNT) * i;
      const delay = (i % 4) * 0.05;
      ray.style.setProperty('--star-rotation', `${rotation}deg`);
      ray.style.setProperty('--star-delay', `${delay}s`);
      container.appendChild(ray);
    }

    return () => {
      container.innerHTML = '';
    };
  }, [show, reducedMotion]);

  if (!show) return null;

  // If reduced motion, don't render anything
  if (reducedMotion) return null;

  // Calculate positions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  const targetX = targetRect ? (targetRect.left + targetRect.width / 2) : centerX;
  const targetY = targetRect ? (targetRect.top + targetRect.height / 2) : 60;

  const maxTrophyWidth = viewportWidth * 0.8; // avoid spilling horizontally
  const trophySizePx = Math.min(viewportHeight * 0.75, maxTrophyWidth);

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 2500,
  };

  const trophyFontSize = Math.max(trophySizePx, 200);

  const trophyStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${centerX}px`,
    top: `${centerY}px`,
    transform: 'translate(-50%, -50%)',
    width: `${trophyFontSize}px`,
    height: `${trophyFontSize}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: `trophy-sequence ${(TROPHY_ANIMATION_DURATION_MS / 1000).toFixed(2)}s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`,
    filter: 'drop-shadow(0 22px 46px rgba(255, 200, 0, 0.55))',
  };

  const trophyGlyphStyle: React.CSSProperties = {
    fontSize: `${trophyFontSize}px`,
    lineHeight: 1,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    filter: 'saturate(115%)',
    textShadow: '0 12px 24px rgba(0,0,0,0.25)',
  };

  // CSS animations
  const animationStyles = `
    .trophy-sparkle {
      position: absolute;
      transform: rotate(var(--sparkle-rotation)) translate(var(--sparkle-radius)) scale(var(--sparkle-scale));
    }

    .trophy-sparkle .sparkle-core {
      position: absolute;
      left: -8px;
      top: -8px;
      width: 16px;
      height: 16px;
      background: radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 35%, rgba(255,215,0,0.5) 70%, rgba(255,215,0,0) 100%);
      border-radius: 50%;
      filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.8));
      animation: sparkle-twinkle 1.4s ease-in-out infinite;
    }

    .trophy-starburst {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 8px;
      height: 70px;
      border-radius: 999px;
      background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,220,92,0.0) 75%);
      transform-origin: center 80%;
      opacity: 0;
      animation: starburst-flare ${(TROPHY_ANIMATION_DURATION_MS / 1000).toFixed(2)}s ease-out var(--star-delay) forwards;
      transform: rotate(var(--star-rotation)) scaleY(0.4);
    }

    @keyframes sparkle-twinkle {
      0%, 100% { transform: scale(0.6); opacity: 0; }
      40% { transform: scale(1); opacity: 1; }
      70% { transform: scale(0.8); opacity: 0.6; }
    }

    @keyframes sparkle-orbit {
      0% { transform: rotate(var(--sparkle-rotation)) translate(var(--sparkle-radius)) scale(var(--sparkle-scale)); opacity: 0; }
      15% { opacity: 1; }
      55% { transform: rotate(calc(var(--sparkle-rotation) + 150deg)) translate(calc(var(--sparkle-radius) * 0.8)) scale(calc(var(--sparkle-scale) * 0.9)); }
      85% { opacity: 1; }
      100% { transform: rotate(calc(var(--sparkle-rotation) + 320deg)) translate(calc(var(--sparkle-radius) * 0.45)) scale(calc(var(--sparkle-scale) * 0.45)); opacity: 0; }
    }

    @keyframes trophy-sequence {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
      }
      15% {
        transform: translate(-50%, -50%) scale(1.05);
        opacity: 1;
      }
      35% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      70% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(calc(${targetX}px - ${centerX}px), calc(${targetY}px - ${centerY}px)) scale(0.2);
        opacity: 0;
      }
    }

    @keyframes starburst-flare {
      0% { opacity: 0; transform: rotate(var(--star-rotation)) scaleY(0.2); }
      10% { opacity: 1; transform: rotate(var(--star-rotation)) scaleY(1.1); }
      60% { opacity: 0.8; transform: rotate(var(--star-rotation)) scaleY(0.9); }
      100% { opacity: 0; transform: rotate(var(--star-rotation)) scaleY(0.1); }
    }
    
    @keyframes confetti-burst {
      0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translate(var(--dx), var(--dy)) rotate(900deg);
        opacity: 0;
      }
    }
    
    @keyframes star-trail {
      0% { opacity: 0; transform: scale(0); }
      30% { opacity: 1; transform: scale(1); }
      70% { opacity: 1; transform: scale(0.9); }
      100% { opacity: 0; transform: scale(0.4); }
    }
  `;

  return (
    <div style={overlayStyle} aria-hidden="true">
      <style>{animationStyles}</style>
      
      {/* Confetti container */}
      <div
        ref={confettiRef}
        style={{
          position: 'absolute',
          left: `${centerX}px`,
          top: `${centerY}px`,
          width: '1px',
          height: '1px',
        }}
      />
      
      {/* Sparkles */}
      <div
        ref={sparklesRef}
        style={{
          position: 'absolute',
          left: `${centerX}px`,
          top: `${centerY}px`,
          transform: 'translate(-50%, -50%)',
          width: '1px',
          height: '1px',
        }}
      />

      {/* Starburst rays */}
      <div
        ref={starburstRef}
        style={{
          position: 'absolute',
          left: `${centerX}px`,
          top: `${centerY}px`,
          transform: 'translate(-50%, -50%)',
          width: 0,
          height: 0,
        }}
      />

      {/* Trophy */}
      <div style={trophyStyle}>
        <span style={trophyGlyphStyle} role="img" aria-label="Trophy reward">
          🏆
        </span>
      </div>
      
      {/* Star trail */}
      <div
        style={{
          position: 'absolute',
          left: `${centerX}px`,
          top: `${centerY}px`,
          transform: 'translate(-50%, -50%)',
          fontSize: `${Math.max(trophySizePx * 0.3, 40)}px`,
          animation: `star-trail ${(TROPHY_ANIMATION_DURATION_MS / 1000).toFixed(2)}s ease-out 0.3s`,
          opacity: 0,
        }}
      >
        ⭐
      </div>
    </div>
  );
}
