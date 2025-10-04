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
  
  // Determine primary message and styling based on answer state or word difficulty
  let primaryMessage = '';
  let secondaryTip = '';
  let bannerColor = 'rgba(59, 130, 246, 0.08)';
  let borderColor = 'rgba(59, 130, 246, 0.2)';
  let textColor = '#1e40af';
  
  // Answer feedback takes priority
  if (lastAnswer === 'correct') {
    primaryMessage = '✔️ Good recall. Click Next; we\'ll show this less often if it stays easy.';
    bannerColor = 'rgba(34, 197, 94, 0.08)';
    borderColor = 'rgba(34, 197, 94, 0.2)';
    textColor = '#15803d';
    
    // Add subject-specific tip for correct answers
    if (mode === 'mathtables') {
      secondaryTip = 'Ask them to explain the step.';
    } else if (mode === 'kannadaalphabets' || mode === 'hindialphabets') {
      secondaryTip = 'Trace in air + say the sound.';
    } else if (mode === 'comprehension' || mode === 'hanuman') {
      secondaryTip = 'One-line re-tell before Next.';
    }
  } else if (lastAnswer === 'wrong') {
    primaryMessage = '↺ Let\'s reinforce this. Say it once, then press Next—we\'ll repeat it soon.';
    bannerColor = 'rgba(251, 146, 60, 0.08)';
    borderColor = 'rgba(251, 146, 60, 0.2)';
    textColor = '#c2410c';
    
    // Add subject-specific tip for wrong answers
    if (mode === 'mathtables') {
      secondaryTip = 'Ask them to explain the step.';
    } else if (mode === 'kannadaalphabets' || mode === 'hindialphabets') {
      secondaryTip = 'Trace in air + say the sound.';
    } else if (mode === 'comprehension' || mode === 'hanuman') {
      secondaryTip = 'One-line re-tell before Next.';
    }
  } else {
    // No answer yet - show initial instruction and context
    if (mode) {
      primaryMessage = getSubjectParentInstruction(mode);
    }
    
    // Add difficulty/context as secondary info
    if (showRepeatExplanation) {
      if (revealCount >= 3) {
        secondaryTip = "Tricky word? That's how we learn! We'll keep practicing this.";
      } else {
        secondaryTip = "This comes back until mastered.";
      }
      bannerColor = 'rgba(245, 158, 11, 0.1)';
      borderColor = 'rgba(245, 158, 11, 0.25)';
      textColor = '#b45309';
    } else if (totalAttempts === 0) {
      secondaryTip = 'New question for your child.';
    } else if (revealCount >= 3) {
      secondaryTip = 'This question has been tricky—we\'ll practice it more.';
      bannerColor = 'rgba(239, 68, 68, 0.08)';
      borderColor = 'rgba(239, 68, 68, 0.2)';
      textColor = '#dc2626';
    } else if (totalAttempts >= 3 && accuracyRate > 0.8) {
      secondaryTip = 'Your child finds this easy!';
      bannerColor = 'rgba(34, 197, 94, 0.08)';
      borderColor = 'rgba(34, 197, 94, 0.2)';
      textColor = '#16a34a';
    } else if (totalAttempts >= 3 && accuracyRate < 0.4) {
      secondaryTip = 'This needs extra practice—it will come back more often.';
      bannerColor = 'rgba(251, 146, 60, 0.08)';
      borderColor = 'rgba(251, 146, 60, 0.2)';
      textColor = '#ea580c';
    } else if (totalAttempts > 0) {
      secondaryTip = 'Good difficulty level.';
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
        padding: '12px 16px',
        margin: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: textColor,
        minHeight: '48px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        animation: lastAnswer ? 'bannerHighlight 300ms ease-out' : 'none',
      }}
    >
      {/* Top row: Session progress if available */}
      {sessionProgress && sessionProgress.total > 0 && (
        <div style={{
          fontSize: '0.65rem',
          fontWeight: '500',
          color: 'rgba(15,23,42,0.5)',
          letterSpacing: '0.02em',
          textAlign: 'center'
        }}>
          {sessionProgress.current} of {sessionProgress.total}
        </div>
      )}
      
      {/* Main message row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        justifyContent: 'space-between'
      }}>
        <div style={{ flex: 1, lineHeight: 1.4, textAlign: 'center' }}>
          {primaryMessage}
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
              color: textColor,
              fontSize: '0.7rem',
              flexShrink: 0,
            }}
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Secondary tip row */}
      {secondaryTip && (
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 500,
          color: textColor,
          opacity: 0.85,
          fontStyle: 'italic',
          textAlign: 'center',
          lineHeight: 1.3
        }}>
          {secondaryTip}
        </div>
      )}
      
      {/* Bottom row: Attempts counter (only when no answer feedback) */}
      {!lastAnswer && totalAttempts > 0 && (
        <div style={{
          fontSize: '0.65rem',
          fontWeight: '500',
          opacity: 0.6,
          textAlign: 'center',
          marginTop: '2px'
        }}>
          {totalAttempts} attempt{totalAttempts !== 1 ? 's' : ''} so far
        </div>
      )}
    </div>
  );
}