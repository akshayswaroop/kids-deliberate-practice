/**
 * 🌱 Progress Stats Display Component
 *
 * Displays growth metrics: Turnarounds and Streak
 * Based on spec: Show just two things across sessions for growth story
 *
 * Architecture: UI layer component using application service hook
 */

import { useEffect, useRef, useState } from 'react';
import type { FocusEvent as ReactFocusEvent, MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useProgressStats } from '../hooks/useProgressStats';
import { getSubjectDisplayLabel } from '../../infrastructure/repositories/subjectLoader';
import TrophyAnimation from './TrophyAnimation';

interface ProgressStatsProps {
  currentUserId: string | null;
  compact?: boolean;
  subject?: string; // Filter stats by subject/language
}

type TooltipPlacement = 'above' | 'below';

type TooltipState = {
  message: string;
  x: number;
  y: number;
  placement: TooltipPlacement;
};

/**
 * Component to display Turnarounds and Streak metrics.
 * Uses DDD architecture with proper layer separation.
 */
export function ProgressStatsDisplay({ currentUserId, compact = false, subject }: ProgressStatsProps) {
  // Use application service hook (follows DDD)
  const { stats, loading, todayAttempts } = useProgressStats({ userId: currentUserId, subject });
  const [prevStats, setPrevStats] = useState(stats);
  const [prevTodayAttempts, setPrevTodayAttempts] = useState(todayAttempts);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [displayedTurnaroundCount, setDisplayedTurnaroundCount] = useState(() => stats?.turnaroundCount ?? 0);
  const [animationQueue, setAnimationQueue] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const isFirstRender = useRef(true);

  const tooltipMaxWidth = 220;
  const tooltipMargin = 12;

  const showTooltip = (
    event: ReactMouseEvent<HTMLDivElement> | ReactFocusEvent<HTMLDivElement>,
    message: string,
    placement: TooltipPlacement
  ) => {
    if (typeof window === 'undefined') return;
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const viewportWidth = window.innerWidth || tooltipMaxWidth + tooltipMargin * 2;
    const halfWidth = tooltipMaxWidth / 2;
    const desiredCenter = rect.left + rect.width / 2;
    const minCenter = tooltipMargin + halfWidth;
    const maxCenter = viewportWidth - tooltipMargin - halfWidth;
    const clampedCenter = Math.min(Math.max(desiredCenter, minCenter), maxCenter);
    const y = placement === 'below' ? rect.bottom + tooltipMargin : rect.top - tooltipMargin;

    setTooltip({
      message,
      x: clampedCenter,
      y,
      placement
    });
  };

  const hideTooltip = () => setTooltip(null);

  const tooltipNode = tooltip && typeof document !== 'undefined'
    ? createPortal(
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: tooltip.placement === 'below' ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            padding: '10px 12px',
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#e2e8f0',
            borderRadius: 10,
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: 1.4,
            maxWidth: tooltipMaxWidth,
            width: 'max-content',
            textAlign: 'center',
            zIndex: 10000,
            pointerEvents: 'none',
            boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)',
            whiteSpace: 'normal'
          }}
        >
          {tooltip.message}
        </div>,
        document.body
      )
    : null;

  useEffect(() => {
    if (!tooltip || typeof window === 'undefined') return;

    const handleViewportChange = () => setTooltip(null);

    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);

    return () => {
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [tooltip]);

  useEffect(() => {
    if (stats && isFirstRender.current) {
      setDisplayedTurnaroundCount(stats.turnaroundCount);
      isFirstRender.current = false;
    }
  }, [stats]);

  useEffect(() => {
    if (stats && prevStats && stats !== prevStats) {
      if (stats.turnaroundCount > prevStats.turnaroundCount && !isFirstRender.current) {
        const newTrophies = stats.turnaroundCount - prevStats.turnaroundCount;
        const newQueue = Array.from({ length: newTrophies }, (_, index) => prevStats.turnaroundCount + index + 1);
        setAnimationQueue(prev => [...prev, ...newQueue]);
      } else if (stats.turnaroundCount < prevStats.turnaroundCount) {
        setAnimationQueue([]);
        setDisplayedTurnaroundCount(stats.turnaroundCount);
      }
    }

    if (stats && stats !== prevStats) {
      setPrevStats(stats);
    }

    if (todayAttempts !== prevTodayAttempts) {
      setPrevTodayAttempts(todayAttempts);
    }
  }, [stats, prevStats, todayAttempts, prevTodayAttempts]);

  useEffect(() => {
    if (animationQueue.length > 0 && !isAnimating) {
      setIsAnimating(true);
    }
  }, [animationQueue, isAnimating]);

  const handleAnimationEnd = () => {
    setAnimationQueue(prev => prev.slice(1));
    setDisplayedTurnaroundCount(prev => prev + 1);
    setIsAnimating(false);
  };

  if (loading || !stats) {
    return tooltipNode ?? null;
  }

  const { turnaroundCount, currentStreak } = stats;

  const trophyAnimating = animationQueue.length > 0 || displayedTurnaroundCount < turnaroundCount;
  const streakChanged = !!(prevStats && prevStats.currentStreak !== currentStreak);
  const attemptsChanged = !!(prevTodayAttempts !== undefined && prevTodayAttempts !== todayAttempts);

  // Edge cases from spec - use displayedTurnaroundCount for animated view
  const turnaroundMessage = displayedTurnaroundCount === 0
    ? "Keep going, you'll conquer tricky items soon!"
    : `${displayedTurnaroundCount} tricky item${displayedTurnaroundCount === 1 ? '' : 's'} you conquered!`;

  const streakMessage = currentStreak === 0
    ? "Don't worry, start a new streak today!"
    : `${currentStreak} day${currentStreak === 1 ? '' : 's'} in a row!`;

  if (compact) {
    const counterAnimations = `
      @keyframes counterBounce {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.3) rotate(-5deg); }
        50% { transform: scale(1.4) rotate(5deg); }
        75% { transform: scale(1.3) rotate(-3deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      
      @keyframes badgeGlow {
        0%, 100% { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
        50% { box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4); }
      }
      
      .stat-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: var(--bg-accent);
        border-radius: 999px;
        font-weight: 700;
        color: var(--text-primary);
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: relative;
        cursor: pointer;
      }
      
      .stat-badge:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .stat-badge.animated {
        animation: counterBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55),
                   badgeGlow 0.6s ease-out;
      }
      
      .stat-badge .emoji {
        font-size: 1.1em;
        display: inline-block;
      }
      
      .stat-badge.animated .emoji {
        animation: counterBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.1s;
      }
    `;

    return (
      <>
        <style>{counterAnimations}</style>

        <TrophyAnimation
          visible={isAnimating}
          onAnimationEnd={handleAnimationEnd}
          targetBadgeSelector=".trophy-badge"
        />

        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            fontSize: '0.85rem'
          }}
        >
          {displayedTurnaroundCount > 0 && (
            <div
              className={`stat-badge trophy-badge ${trophyAnimating ? 'animated' : ''}`}
              key={`turnaround-${displayedTurnaroundCount}`}
              tabIndex={0}
              onMouseEnter={event =>
                showTooltip(
                  event,
                  `${displayedTurnaroundCount} item${displayedTurnaroundCount === 1 ? '' : 's'} conquered from wrong to mastered!`,
                  'below'
                )
              }
              onFocus={event =>
                showTooltip(
                  event,
                  `${displayedTurnaroundCount} item${displayedTurnaroundCount === 1 ? '' : 's'} conquered from wrong to mastered!`,
                  'below'
                )
              }
              onMouseLeave={hideTooltip}
              onBlur={hideTooltip}
            >
              <span className="emoji">🏆</span>
              <span>{displayedTurnaroundCount}</span>
            </div>
          )}

          {currentStreak > 0 && (
            <div
              className={`stat-badge ${streakChanged ? 'animated' : ''}`}
              key={`streak-${currentStreak}`}
              tabIndex={0}
              onMouseEnter={event =>
                showTooltip(event, `${currentStreak} day${currentStreak === 1 ? '' : 's'} practice streak!`, 'below')
              }
              onFocus={event =>
                showTooltip(event, `${currentStreak} day${currentStreak === 1 ? '' : 's'} practice streak!`, 'below')
              }
              onMouseLeave={hideTooltip}
              onBlur={hideTooltip}
            >
              <span className="emoji">🔥</span>
              <span>{currentStreak}</span>
            </div>
          )}

          <div
            className={`stat-badge ${attemptsChanged ? 'animated' : ''}`}
            key={`attempts-${todayAttempts}`}
            tabIndex={0}
            onMouseEnter={event =>
              showTooltip(
                event,
                `${todayAttempts} question${todayAttempts === 1 ? '' : 's'} attempted today${
                  subject ? ` in ${getSubjectDisplayLabel(subject)}` : ''
                }`,
                'below'
              )
            }
            onFocus={event =>
              showTooltip(
                event,
                `${todayAttempts} question${todayAttempts === 1 ? '' : 's'} attempted today${
                  subject ? ` in ${getSubjectDisplayLabel(subject)}` : ''
                }`,
                'below'
              )
            }
            onMouseLeave={hideTooltip}
            onBlur={hideTooltip}
          >
            <span className="emoji">📝</span>
            <span>{todayAttempts}</span>
          </div>
        </div>
        {tooltipNode}
      </>
    );
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 20,
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-soft)'
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}
        >
          Your Growth Story
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: 16,
            background:
              displayedTurnaroundCount > 0
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1))'
                : 'var(--bg-primary)',
            borderRadius: 8,
            border: '2px solid',
            borderColor: displayedTurnaroundCount > 0 ? 'var(--color-success)' : 'var(--border-color)'
          }}
        >
          <div style={{ fontSize: '2rem' }}>🌱</div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--text-primary)',
                marginBottom: 4
              }}
            >
              Turnarounds
            </div>
            <div
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}
            >
              {turnaroundMessage}
            </div>
            {displayedTurnaroundCount > 0 && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: '0.85rem',
                  color: 'var(--text-tertiary)',
                  fontStyle: 'italic'
                }}
              >
                Shows growth and resilience
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: 16,
            background:
              currentStreak > 0
                ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1))'
                : 'var(--bg-primary)',
            borderRadius: 8,
            border: '2px solid',
            borderColor: currentStreak > 0 ? 'var(--color-warning)' : 'var(--border-color)'
          }}
        >
          <div style={{ fontSize: '2rem' }}>🔥</div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--text-primary)',
                marginBottom: 4
              }}
            >
              Streak
            </div>
            <div
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}
            >
              {streakMessage}
            </div>
            {currentStreak > 0 && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: '0.85rem',
                  color: 'var(--text-tertiary)',
                  fontStyle: 'italic'
                }}
              >
                Reinforces daily habit
              </div>
            )}
          </div>
        </div>
      </div>
      {tooltipNode}
    </>
  );
}

export default ProgressStatsDisplay;
