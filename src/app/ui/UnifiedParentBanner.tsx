import { useEffect, useRef, useState } from 'react';
import type { Word, SessionStats } from '../../infrastructure/state/gameState';
import type { ParentGuidance } from '../../domain/entities/ProgressTracker';
import type { SessionGuidanceResult } from '../../domain/entities/SessionGuidance';
import { SubjectConfiguration } from '../../infrastructure/config/subjectConfiguration';

interface UnifiedParentBannerProps {
  currentWord: Word;
  parentGuidance: ParentGuidance; // Domain-provided guidance (DDD compliant)
  sessionGuidance?: SessionGuidanceResult | null; // Session-level guidance takes priority
  showRepeatExplanation?: boolean;
  onDismiss?: () => void;
  mode?: string; // Subject mode for context-specific tips
  lastAnswer?: 'correct' | 'wrong' | null; // Track answer state for feedback
  sessionProgress?: { current: number; total: number } | null;
  sessionStats?: SessionStats | null;
}

export default function UnifiedParentBanner({ 
  currentWord, 
  parentGuidance,
  sessionGuidance,
  showRepeatExplanation = false,
  onDismiss,
  mode,
  lastAnswer = null,
  sessionProgress,
  sessionStats
}: UnifiedParentBannerProps) {
  
  const attempts = Array.isArray(currentWord.attempts) ? currentWord.attempts : [];
  const attemptCount = attempts.length;
  const lastAttempt = attemptCount > 0 ? attempts[attemptCount - 1] : null;
  const previousAttemptCountRef = useRef(attemptCount);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showUpdateCue, setShowUpdateCue] = useState(false);

  useEffect(() => {
    let highlightTimer: number | null = null;
    let cueTimer: number | null = null;
    const previousCount = previousAttemptCountRef.current ?? 0;
    if (attemptCount > previousCount) {
      setIsHighlighted(true);
      setShowUpdateCue(true);
      highlightTimer = window.setTimeout(() => {
        setIsHighlighted(false);
        highlightTimer = null;
      }, 600);
      cueTimer = window.setTimeout(() => {
        setShowUpdateCue(false);
        cueTimer = null;
      }, 1600);
    }
    previousAttemptCountRef.current = attemptCount;
    return () => {
      if (highlightTimer !== null) {
        window.clearTimeout(highlightTimer);
      }
      if (cueTimer !== null) {
        window.clearTimeout(cueTimer);
      }
    };
  }, [attemptCount]);
  
  // Generate mini timeline (last 8 attempts)
  const recentAttempts = attempts.slice(-8);
  
  // Get subject-specific tip from infrastructure config
  // Architecture: UI reads config, doesn't hard-code subject knowledge
  const getSubjectTip = () => {
    return mode ? SubjectConfiguration.getParentTip(mode) || '' : '';
  };
  
  const totalQuestions = sessionStats?.totalQuestions ?? sessionProgress?.total ?? 0;
  const completedQuestions = sessionStats?.questionsCompleted ?? sessionProgress?.current ?? 0;
  const showProgressBreakdown = !!sessionStats && sessionStats.totalQuestions > 0;
  const masteredCount = showProgressBreakdown ? sessionStats.currentlyMastered : 0;
  const practicingCount = showProgressBreakdown ? Math.max(sessionStats.practicedInSession, 0) : 0;
  const pendingCount = showProgressBreakdown
    ? Math.max(sessionStats.totalQuestions - (masteredCount + practicingCount), 0)
    : Math.max((sessionProgress?.total ?? 0) - (sessionProgress?.current ?? 0), 0);
  const progressSegments = showProgressBreakdown ? [
    { key: 'mastered', label: 'Mastered', value: masteredCount, color: '#22c55e' },
    { key: 'practicing', label: 'Practicing', value: practicingCount, color: '#3b82f6' },
    { key: 'pending', label: 'Pending', value: pendingCount, color: '#94a3b8' },
  ].filter(segment => segment.value > 0 && sessionStats.totalQuestions > 0) : [];
  const completionPercent = showProgressBreakdown && sessionStats.totalQuestions > 0
    ? Math.round((masteredCount / sessionStats.totalQuestions) * 100)
    : null;

  // Determine which guidance to use: session guidance takes priority over word guidance
  const activeGuidance = sessionGuidance || parentGuidance;
  
  // Map domain urgency to visual styling (presentation logic only)
  const getStylesForUrgency = (urgency: 'success' | 'warning' | 'info') => {
    switch (urgency) {
      case 'success':
        return {
          bannerColor: 'rgba(34, 197, 94, 0.08)',
          borderColor: 'rgba(34, 197, 94, 0.2)',
          textColor: '#15803d'
        };
      case 'warning':
        return {
          bannerColor: 'rgba(251, 146, 60, 0.08)',
          borderColor: 'rgba(251, 146, 60, 0.2)',
          textColor: '#c2410c'
        };
      case 'info':
      default:
        return {
          bannerColor: 'rgba(59, 130, 246, 0.08)',
          borderColor: 'rgba(59, 130, 246, 0.2)',
          textColor: '#1e40af'
        };
    }
  };

  const styles = getStylesForUrgency(activeGuidance.urgency);
  const highlightPalettes = {
    success: {
      border: 'rgba(34, 197, 94, 0.45)',
      glow: 'rgba(34, 197, 94, 0.28)',
      badge: '#22c55e'
    },
    warning: {
      border: 'rgba(249, 115, 22, 0.45)',
      glow: 'rgba(249, 115, 22, 0.28)',
      badge: '#fb923c'
    },
    info: {
      border: 'rgba(59, 130, 246, 0.45)',
      glow: 'rgba(59, 130, 246, 0.28)',
      badge: '#3b82f6'
    }
  } as const;

  const negativePalette = {
    border: 'rgba(248, 113, 113, 0.55)',
    glow: 'rgba(248, 113, 113, 0.32)',
    badge: '#ef4444'
  };

  const latestResult = lastAttempt?.result === 'wrong' ? 'wrong' : lastAttempt ? 'correct' : null;
  const paletteKey = activeGuidance.urgency in highlightPalettes ? activeGuidance.urgency : 'info';
  const basePalette = highlightPalettes[paletteKey];
  const appliedPalette = latestResult === 'wrong' ? negativePalette : basePalette;

  const bannerBorderColor = isHighlighted ? appliedPalette.border : styles.borderColor;
  const bannerShadow = isHighlighted
    ? `0 18px 36px ${appliedPalette.glow}`
    : '0 2px 8px rgba(0,0,0,0.05)';
  const updateBadgeColor = appliedPalette.badge;

  // For session guidance, use message as-is. For word guidance, append subject-specific tip
  const tip = sessionGuidance ? '' : getSubjectTip();
  const actionableCue = tip ? `${activeGuidance.message}. ${tip}` : activeGuidance.message;

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div
      key={`${lastAnswer}-${attempts.length}`}
      data-testid="unified-parent-banner"
      style={{
        background: styles.bannerColor,
        border: `1px solid ${bannerBorderColor}`,
        borderRadius: 12,
        padding: '10px 16px',
        margin: '8px 12px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: styles.textColor,
        minHeight: '44px',
        boxShadow: bannerShadow,
        animation: lastAnswer ? 'bannerHighlight 300ms ease-out' : 'none',
        position: 'relative',
        overflow: 'visible',
        transform: isHighlighted ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 220ms ease-out, transform 220ms ease-out, border-color 220ms ease-out'
      }}
    >
      {showUpdateCue && (
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translate(-50%, 100%)',
            padding: '3px 12px',
            borderRadius: 999,
            background: updateBadgeColor,
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 6px 16px rgba(15, 23, 42, 0.18)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          New guidance
        </div>
      )}
      {/* Left: Session progress with clear label and mastery overview */}
      {(totalQuestions > 0 || showProgressBreakdown) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            alignItems: 'flex-start',
            minWidth: '160px',
            flex: '0 1 220px',
            whiteSpace: 'normal'
          }}
        >
          {totalQuestions > 0 && (
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                opacity: 0.75,
              }}
            >
              Card {Math.min(completedQuestions, totalQuestions)} of {totalQuestions}
            </div>
          )}
          {showProgressBreakdown && (
            <>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  opacity: 0.8,
                }}
              >
                Mastered {masteredCount}/{sessionStats.totalQuestions}
                {completionPercent !== null ? ` (${completionPercent}%)` : ''}
              </div>
              <div
                role="presentation"
                aria-hidden
                style={{
                  display: 'flex',
                  width: '100%',
                  maxWidth: 220,
                  height: 6,
                  borderRadius: 999,
                  overflow: 'hidden',
                  background: 'rgba(15, 23, 42, 0.08)'
                }}
              >
                {progressSegments.length > 0 ? progressSegments.map(segment => (
                  <span
                    key={segment.key}
                    style={{
                      width: `${(segment.value / sessionStats.totalQuestions) * 100}%`,
                      background: segment.color,
                      transition: 'width 220ms ease-out'
                    }}
                  />
                )) : (
                  <span style={{ width: '100%', background: 'rgba(203, 213, 225, 0.6)' }} />
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  fontSize: '0.68rem',
                  opacity: 0.7,
                  lineHeight: 1.3,
                  width: '100%'
                }}
              >
                {progressSegments.map(segment => (
                  <span
                    key={`${segment.key}-legend`}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: segment.color,
                      }}
                    />
                    {segment.label} {segment.value}
                  </span>
                ))}
                {progressSegments.length === 0 && (
                  <span style={{ opacity: 0.7 }}>Progress updates as you practice</span>
                )}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Center: Actionable message (from domain) */}
      <div style={{ 
        flex: '1 1 auto',
        lineHeight: 1.3,
        fontSize: '0.85rem',
        textAlign: 'center',
        minWidth: '200px',
        transition: 'opacity 220ms ease-out, transform 220ms ease-out',
        opacity: isHighlighted ? 1 : 0.92,
        transform: isHighlighted ? 'translateY(-1px)' : 'translateY(0)'
      }}>
        {actionableCue}
      </div>
      
      {/* Right: Visual timeline showing attempt history */}
      <div style={{
        fontSize: '1.8rem',
        letterSpacing: '2px',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        minWidth: '140px',
        maxWidth: '140px',
        flexShrink: 0,
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '4px'
      }}>
        {recentAttempts.length > 0 ? (
          recentAttempts.map((attempt, idx) => (
            <span 
              key={idx} 
              style={{ 
                color: attempt.result === 'correct' ? '#22c55e' : '#f87171',
                fontWeight: 600,
                opacity: isHighlighted && idx === recentAttempts.length - 1 ? 1 : 0.92,
                textShadow: isHighlighted && idx === recentAttempts.length - 1
                  ? `0 0 12px ${appliedPalette.glow}`
                  : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.2em',
                height: '1.2em',
                transform: isHighlighted && idx === recentAttempts.length - 1 ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 180ms ease-out, opacity 180ms ease-out, text-shadow 180ms ease-out'
              }}
            >
              {attempt.result === 'correct' ? '✓' : '✗'}
            </span>
          ))
        ) : (
          <span style={{ opacity: 0 }}>···</span>
        )}
      </div>
      
      {/* Dismiss button for repeat explanation */}
      {showRepeatExplanation && onDismiss && (
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'rgba(0, 0, 0, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: styles.textColor,
            fontSize: '0.7rem',
            flexShrink: 0,
            marginLeft: 'auto'
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
