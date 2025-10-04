import type { Word } from '../../infrastructure/state/gameState';
import { getSubjectParentInstruction } from '../../infrastructure/repositories/subjectLoader';

interface UnifiedParentBannerProps {
  currentWord: Word;
  showRepeatExplanation?: boolean;
  revealCount?: number;
  onDismiss?: () => void;
  mode?: string; // Subject mode for context-specific tips
  lastAnswer?: 'correct' | 'wrong' | null; // Track answer state for feedback
  sessionProgress?: { current: number; total: number } | null;
}

export default function UnifiedParentBanner({ 
  currentWord, 
  showRepeatExplanation = false,
  revealCount = 0,
  onDismiss,
  mode,
  lastAnswer = null,
  sessionProgress
}: UnifiedParentBannerProps) {
  
  const attempts = Array.isArray(currentWord.attempts) ? currentWord.attempts : [];
  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter(attempt => attempt.result === 'correct').length;
  const accuracyRate = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;
  
  // Generate mini timeline (last 8 attempts)
  const recentAttempts = attempts.slice(-8);
  const timeline = recentAttempts.map(attempt => 
    attempt.result === 'correct' ? '✓' : '✗'
  ).join('');
  
  // Get subject-specific tip
  const getSubjectTip = () => {
    if (mode === 'mathtables') {
      return 'Ask them to explain the step.';
    } else if (mode === 'kannadaalphabets' || mode === 'hindialphabets') {
      return 'Trace in air + say the sound.';
    } else if (mode === 'comprehension' || mode === 'hanuman') {
      return 'One-line re-tell before Next.';
    }
    return '';
  };
  
  // Determine actionable cue and styling
  let actionableCue = '';
  let bannerColor = 'rgba(59, 130, 246, 0.08)';
  let borderColor = 'rgba(59, 130, 246, 0.2)';
  let textColor = '#1e40af';
  
  // Answer feedback takes priority
  if (lastAnswer === 'correct') {
    const tip = getSubjectTip();
    actionableCue = tip ? `Good! ${tip}` : 'Good! Click Next.';
    bannerColor = 'rgba(34, 197, 94, 0.08)';
    borderColor = 'rgba(34, 197, 94, 0.2)';
    textColor = '#15803d';
  } else if (lastAnswer === 'wrong') {
    const tip = getSubjectTip();
    actionableCue = tip ? `Say it once, then Next. ${tip}` : 'Say it once, then Next—we\'ll repeat it soon.';
    bannerColor = 'rgba(251, 146, 60, 0.08)';
    borderColor = 'rgba(251, 146, 60, 0.2)';
    textColor = '#c2410c';
  } else {
    // No answer yet - show performance-based cue
    if (showRepeatExplanation && revealCount >= 3) {
      actionableCue = 'Tricky—keep going. ' + (getSubjectTip() || 'We\'ll practice this more.');
      bannerColor = 'rgba(245, 158, 11, 0.1)';
      borderColor = 'rgba(245, 158, 11, 0.25)';
      textColor = '#b45309';
    } else if (totalAttempts === 0) {
      const tip = getSubjectTip();
      actionableCue = tip ? `First try—${tip}` : (mode ? getSubjectParentInstruction(mode) : 'First try.');
    } else if (revealCount >= 3) {
      actionableCue = 'Tricky—keep going. ' + (getSubjectTip() || 'We\'ll practice this more.');
      bannerColor = 'rgba(239, 68, 68, 0.08)';
      borderColor = 'rgba(239, 68, 68, 0.2)';
      textColor = '#dc2626';
    } else if (totalAttempts >= 2 && accuracyRate > 0.8) {
      actionableCue = 'Steady recall. ' + (getSubjectTip() || 'Great work!');
      bannerColor = 'rgba(34, 197, 94, 0.08)';
      borderColor = 'rgba(34, 197, 94, 0.2)';
      textColor = '#16a34a';
    } else if (totalAttempts >= 2 && accuracyRate < 0.4) {
      actionableCue = 'Needs practice. ' + (getSubjectTip() || 'We\'ll repeat this more.');
      bannerColor = 'rgba(251, 146, 60, 0.08)';
      borderColor = 'rgba(251, 146, 60, 0.2)';
      textColor = '#ea580c';
    } else if (totalAttempts >= 2) {
      actionableCue = 'Building mastery. ' + (getSubjectTip() || 'Keep going!');
    } else {
      const tip = getSubjectTip();
      actionableCue = tip || (mode ? getSubjectParentInstruction(mode) : 'Let\'s practice.');
    }
  }

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div
      key={`${lastAnswer}-${totalAttempts}`}
      data-testid="unified-parent-banner"
      style={{
        background: bannerColor,
        border: `1px solid ${borderColor}`,
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
        color: textColor,
        minHeight: '44px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        animation: lastAnswer ? 'bannerHighlight 300ms ease-out' : 'none',
      }}
    >
      {/* Left: Session progress with clear label */}
      {sessionProgress && sessionProgress.total > 0 && (
        <div style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          opacity: 0.7,
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          Card {sessionProgress.current} of {sessionProgress.total}
        </div>
      )}
      
      {/* Center: Actionable message (primary) */}
      <div style={{ 
        flex: '1 1 auto',
        lineHeight: 1.3,
        fontSize: '0.85rem',
        textAlign: 'center',
        minWidth: '200px'
      }}>
        {actionableCue}
      </div>
      
      {/* Right: Visual timeline showing attempt history */}
      {timeline && timeline.length > 0 && (
        <div style={{
          fontSize: '0.8rem',
          letterSpacing: '3px',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          maxWidth: '100px',
          flexShrink: 0,
          display: 'flex',
          gap: '3px'
        }}>
          {recentAttempts.map((attempt, idx) => (
            <span 
              key={idx} 
              style={{ 
                color: attempt.result === 'correct' ? '#16a34a' : '#dc2626',
                fontWeight: 600
              }}
            >
              {attempt.result === 'correct' ? '✓' : '✗'}
            </span>
          ))}
        </div>
      )}
      
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
            color: textColor,
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