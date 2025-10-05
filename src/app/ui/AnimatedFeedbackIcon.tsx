import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface AnimatedFeedbackIconProps {
  type: 'correct' | 'wrong';
  onComplete: () => void;
}

export default function AnimatedFeedbackIcon({ type, onComplete }: AnimatedFeedbackIconProps) {
  const [animationStage, setAnimationStage] = useState<'appear' | 'hold' | 'moveToTimeline'>('appear');
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  // Update ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Find the banner timeline element
    const findTimelinePosition = () => {
      const banner = document.querySelector('[data-testid="unified-parent-banner"]');
      if (banner) {
        const bannerRect = banner.getBoundingClientRect();
        // Position at the right side of the banner where timeline is
        return {
          x: bannerRect.right - 60, // 60px from right edge (timeline position)
          y: bannerRect.top + bannerRect.height / 2,
        };
      }
      // Fallback to top-right if banner not found
      return {
        x: window.innerWidth - 80,
        y: 60,
      };
    };

    // Stage 1: Appear (400ms)
    const appearTimer = setTimeout(() => {
      setAnimationStage('hold');
    }, 400);

    // Stage 2: Hold (900ms) - calculate target position during hold
    const holdTimer = setTimeout(() => {
      const target = findTimelinePosition();
      setTargetPosition(target);
      setAnimationStage('moveToTimeline');
    }, 1300); // 400ms appear + 900ms hold

    // Stage 3: Move to timeline (1200ms)
    const moveTimer = setTimeout(() => {
      setAnimationStage('moveToTimeline');
    }, 1300); // 400ms appear + 900ms hold

    // Stage 4: Complete
    const completeTimer = setTimeout(() => {
      onCompleteRef.current();
    }, 2500); // 400ms + 900ms + 1200ms

    return () => {
      clearTimeout(appearTimer);
      clearTimeout(holdTimer);
      clearTimeout(moveTimer);
      clearTimeout(completeTimer);
    };
  }, []); // Empty deps - only run once on mount

  const icon = type === 'correct' ? '✓' : '✗';
  const color = type === 'correct' ? '#16a34a' : '#dc2626';
  const bgColor = type === 'correct' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';

  const getStyle = () => {
    const baseStyle = {
      position: 'fixed' as const,
      zIndex: 9999,
      fontSize: '64px',
      fontWeight: 'bold' as const,
      color: color,
      backgroundColor: bgColor,
      borderRadius: '50%',
      width: '120px',
      height: '120px',
      display: 'flex',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      boxShadow: `0 8px 32px ${color}40`,
      pointerEvents: 'none' as const,
    };

    if (animationStage === 'appear') {
      return {
        ...baseStyle,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0)',
        opacity: 0,
        animation: 'feedbackAppear 400ms ease-out forwards',
        transition: 'none',
      };
    } else if (animationStage === 'hold') {
      return {
        ...baseStyle,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1,
        transition: 'none',
      };
    } else if (animationStage === 'moveToTimeline' && targetPosition) {
      return {
        ...baseStyle,
        top: `${targetPosition.y}px`,
        left: `${targetPosition.x}px`,
        transform: 'translate(-50%, -50%) scale(0.3)',
        opacity: 0,
        transition: 'all 1200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Slower, smoother easing
      };
    }

    return baseStyle;
  };

  return createPortal(
    <div ref={iconRef} style={getStyle()}>
      {icon}
    </div>,
    document.body
  );
}
