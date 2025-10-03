/**
 * 🌱 Progress Stats Display Component
 * 
 * Displays growth metrics: Turnarounds and Streak
 * Based on spec: Show just two things across sessions for growth story
 * 
 * Architecture: UI layer component using application service hook
 */

import { useState, useEffect, useRef } from 'react';
import { useProgressStats } from '../hooks/useProgressStats';
import { getSubjectDisplayLabel } from '../../infrastructure/repositories/subjectLoader';
import TrophyAnimation from './TrophyAnimation';

interface ProgressStatsProps {
  currentUserId: string | null;
  compact?: boolean;
  subject?: string; // Filter stats by subject/language
}

/**
 * Component to display Turnarounds and Streak metrics.
 * Uses DDD architecture with proper layer separation.
 */
export function ProgressStatsDisplay({ currentUserId, compact = false, subject }: ProgressStatsProps) {
  // Use application service hook (follows DDD)
  const { stats, loading, todayAttempts } = useProgressStats({ userId: currentUserId, subject });
  const [prevStats, setPrevStats] = useState(stats);
  const [prevTodayAttempts, setPrevTodayAttempts] = useState(todayAttempts);
  
  // Trophy animation state
  const [displayedTurnaroundCount, setDisplayedTurnaroundCount] = useState(0);
  const [animationQueue, setAnimationQueue] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const isFirstRender = useRef(true);
  
  // Initialize displayed count on first render
  useEffect(() => {
    if (isFirstRender.current && stats) {
      setDisplayedTurnaroundCount(stats.turnaroundCount);
      isFirstRender.current = false;
    }
  }, [stats]);
  
  // Track previous stats for animation detection
  useEffect(() => {
    if (stats && stats !== prevStats) {
      // Detect new trophies and add to queue
      if (prevStats && stats.turnaroundCount > prevStats.turnaroundCount && !isFirstRender.current) {
        const newTrophies = stats.turnaroundCount - prevStats.turnaroundCount;
        const newQueue: number[] = [];
        for (let i = 0; i < newTrophies; i++) {
          newQueue.push(prevStats.turnaroundCount + i + 1);
        }
        setAnimationQueue(prev => [...prev, ...newQueue]);
      }
      setPrevStats(stats);
    }
    if (todayAttempts !== prevTodayAttempts) {
      setPrevTodayAttempts(todayAttempts);
    }
  }, [stats, prevStats, todayAttempts, prevTodayAttempts]);
  
  // Process animation queue
  useEffect(() => {
    if (animationQueue.length > 0 && !isAnimating) {
      setIsAnimating(true);
    }
  }, [animationQueue, isAnimating]);
  
  // Handle animation completion
  const handleAnimationEnd = () => {
    setAnimationQueue(prev => prev.slice(1));
    setDisplayedTurnaroundCount(prev => prev + 1);
    setIsAnimating(false);
  };
  
  if (loading || !stats) {
    return null;
  }
  
  const { turnaroundCount, currentStreak } = stats;
  
  // Detect which counters changed for animations
  const streakChanged = !!(prevStats && prevStats.currentStreak !== currentStreak);
  const attemptsChanged = !!(prevTodayAttempts !== undefined && prevTodayAttempts !== todayAttempts);
  
  // Edge cases from spec - use displayedTurnaroundCount for compact view
  const turnaroundMessage = displayedTurnaroundCount === 0 
    ? "Keep going, you'll conquer tricky items soon!" 
    : `${displayedTurnaroundCount} tricky item${displayedTurnaroundCount === 1 ? '' : 's'} you conquered!`;
  
  const streakMessage = currentStreak === 0
    ? "Don't worry, start a new streak today!"
    : `${currentStreak} day${currentStreak === 1 ? '' : 's'} in a row!`;
  
  if (compact) {
    // CSS animations for counters with eye-catching bounce effect
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
      
      /* Custom tooltip styling */
      .stat-badge[data-tooltip] {
        position: relative;
        cursor: pointer;
      }
      
      .stat-badge[data-tooltip]:hover::before {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(-8px);
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 500;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      
      .stat-badge[data-tooltip]:hover::after {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(-2px);
        border: 6px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.9);
        z-index: 1000;
        pointer-events: none;
      }
    `;
    
    return (
      <>
        <style>{counterAnimations}</style>
        
        {/* Trophy animation */}
        <TrophyAnimation 
          visible={isAnimating}
          onAnimationEnd={handleAnimationEnd}
          targetBadgeSelector=".trophy-badge"
        />
        
        <div style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          fontSize: '0.85rem'
        }}>
          {/* Turnarounds counter */}
          {displayedTurnaroundCount > 0 && (
            <div 
              className={`stat-badge trophy-badge ${displayedTurnaroundCount !== turnaroundCount ? 'animated' : ''}`}
              data-tooltip={`${displayedTurnaroundCount} item${displayedTurnaroundCount === 1 ? '' : 's'} conquered from wrong to mastered!`}
              key={`turnaround-${displayedTurnaroundCount}`}
            >
              <span className="emoji">🏆</span>
              <span>{displayedTurnaroundCount}</span>
            </div>
          )}
          {/* Streak counter */}
          {currentStreak > 0 && (
            <div 
              className={`stat-badge ${streakChanged ? 'animated' : ''}`}
              data-tooltip={`${currentStreak} day${currentStreak === 1 ? '' : 's'} practice streak!`}
              key={`streak-${currentStreak}`}
            >
              <span className="emoji">🔥</span>
              <span>{currentStreak}</span>
            </div>
          )}
          {/* Overall attempts counter */}
          <div 
            className={`stat-badge ${attemptsChanged ? 'animated' : ''}`}
            data-tooltip={`${todayAttempts} question${todayAttempts === 1 ? '' : 's'} attempted today${subject ? ` in ${getSubjectDisplayLabel(subject)}` : ''}`}
            key={`attempts-${todayAttempts}`}
          >
            <span className="emoji">📝</span>
            <span>{todayAttempts}</span>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: 20,
      background: 'var(--bg-secondary)',
      borderRadius: 12,
      boxShadow: 'var(--shadow-soft)'
    }}>
      <h3 style={{
        margin: 0,
        fontSize: '1.2rem',
        fontWeight: 700,
        color: 'var(--text-primary)'
      }}>
        Your Growth Story
      </h3>
      
      {/* Turnarounds */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        background: displayedTurnaroundCount > 0 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1))'
          : 'var(--bg-primary)',
        borderRadius: 8,
        border: '2px solid',
        borderColor: displayedTurnaroundCount > 0 ? 'var(--color-success)' : 'var(--border-color)'
      }}>
        <div style={{ fontSize: '2rem' }}>🌱</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--text-primary)',
            marginBottom: 4
          }}>
            Turnarounds
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}>
            {turnaroundMessage}
          </div>
          {displayedTurnaroundCount > 0 && (
            <div style={{
              marginTop: 8,
              fontSize: '0.85rem',
              color: 'var(--text-tertiary)',
              fontStyle: 'italic'
            }}>
              Shows growth and resilience
            </div>
          )}
        </div>
      </div>
      
      {/* Streak */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        background: currentStreak > 0 
          ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1))'
          : 'var(--bg-primary)',
        borderRadius: 8,
        border: '2px solid',
        borderColor: currentStreak > 0 ? 'var(--color-warning)' : 'var(--border-color)'
      }}>
        <div style={{ fontSize: '2rem' }}>🔥</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--text-primary)',
            marginBottom: 4
          }}>
            Streak
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}>
            {streakMessage}
          </div>
          {currentStreak > 0 && (
            <div style={{
              marginTop: 8,
              fontSize: '0.85rem',
              color: 'var(--text-tertiary)',
              fontStyle: 'italic'
            }}>
              Reinforces daily habit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressStatsDisplay;
