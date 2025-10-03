/**
 * 🏆 Trophy Animation Component
 * 
 * Celebratory animation when a new trophy (turnaround) is earned.
 * - Shows large trophy in center with pop-in animation
 * - Holds briefly, then shrinks and flies into trophy badge in header
 * - Badge bounces when trophy lands
 * - Optionally adds confetti on appearance and star trail while flying
 * - Whole animation finishes in about one second
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

export default function TrophyAnimation({ 
  visible, 
  onAnimationEnd,
  targetBadgeSelector = '.stat-badge:has(.emoji)' // Default to first stat badge with emoji
}: TrophyAnimationProps) {
  const [show, setShow] = useState(visible);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);

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
      
      // Normal animation: exactly 1000ms total
      // Trophy animation ends at 1000ms, then badge bounces
      const duration = 1000;
      
      // Trigger badge bounce when trophy lands (at 1000ms)
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
      }, duration + 100); // Small delay to ensure badge bounce starts
      
      return () => {
        clearTimeout(badgeBounceTimer);
        clearTimeout(completeTimer);
      };
    }
    setShow(false);
  }, [visible, onAnimationEnd, reducedMotion, targetBadgeSelector]);

  // Create confetti particles
  useEffect(() => {
    if (!show || reducedMotion || !confettiRef.current) return;
    
    const container = confettiRef.current;
    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    
    // Create 30 confetti particles
    for (let i = 0; i < 30; i++) {
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
      const angle = (i / 30) * Math.PI * 2;
      const velocity = 50 + Math.random() * 50;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;
      
      particle.style.animation = `confetti-burst 0.8s ease-out forwards`;
      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      
      container.appendChild(particle);
    }
    
    // Cleanup
    const cleanup = setTimeout(() => {
      container.innerHTML = '';
    }, 900);
    
    return () => {
      clearTimeout(cleanup);
      container.innerHTML = '';
    };
  }, [show, reducedMotion]);

  if (!show) return null;

  // If reduced motion, don't render anything
  if (reducedMotion) return null;

  // Calculate positions
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const targetX = targetRect ? (targetRect.left + targetRect.width / 2) : centerX;
  const targetY = targetRect ? (targetRect.top + targetRect.height / 2) : 60;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 2500,
  };

  const trophyStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${centerX}px`,
    top: `${centerY}px`,
    transform: 'translate(-50%, -50%)',
    fontSize: '120px',
    animation: 'trophy-sequence 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
    filter: 'drop-shadow(0 10px 30px rgba(255, 215, 0, 0.5))',
  };

  // CSS animations
  const animationStyles = `
    @keyframes trophy-sequence {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
      }
      20% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 1;
      }
      40% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      50% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(calc(${targetX}px - ${centerX}px), calc(${targetY}px - ${centerY}px)) scale(0.2);
        opacity: 0;
      }
    }
    
    @keyframes confetti-burst {
      0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translate(var(--dx), var(--dy)) rotate(720deg);
        opacity: 0;
      }
    }
    
    @keyframes star-trail {
      0% {
        opacity: 0;
        transform: scale(0);
      }
      50% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.5);
      }
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
      
      {/* Trophy */}
      <div style={trophyStyle}>
        🏆
      </div>
      
      {/* Star trail */}
      <div
        style={{
          position: 'absolute',
          left: `${centerX}px`,
          top: `${centerY}px`,
          transform: 'translate(-50%, -50%)',
          fontSize: '40px',
          animation: 'star-trail 0.8s ease-out 0.2s 3',
          opacity: 0,
        }}
      >
        ⭐
      </div>
    </div>
  );
}
