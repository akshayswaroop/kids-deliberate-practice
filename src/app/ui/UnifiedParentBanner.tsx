import type { Word } from '../../infrastructure/state/gameState';

interface UnifiedParentBannerProps {
  currentWord: Word;
  showRepeatExplanation?: boolean;
  revealCount?: number;
  onDismiss?: () => void;
}

export default function UnifiedParentBanner({ 
  currentWord, 
  showRepeatExplanation = false,
  revealCount = 0,
  onDismiss 
}: UnifiedParentBannerProps) {
  
  // Analyze the word's performance to generate intelligent guidance
  const getGuidanceCue = (word: Word): { message: string; emoji: string; type: 'challenging' | 'easy' | 'new' | 'improving' | 'repeat' } => {
    const attempts = Array.isArray(word.attempts) ? word.attempts : [];
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(attempt => attempt.result === 'correct').length;
    const accuracyRate = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;
    
    // If this is a repeat explanation, prioritize that message
    if (showRepeatExplanation) {
      if (revealCount >= 3) {
        return {
          message: "Smart practice: Tricky word? That's how we learn!",
          emoji: "🧠",
          type: 'repeat'
        };
      }
      return {
        message: "Smart practice: This comes back until mastered",
        emoji: "🧠", 
        type: 'repeat'
      };
    }
    
    // New word (never attempted)
    if (totalAttempts === 0) {
      return {
        message: "New question for your child",
        emoji: "✨",
        type: 'new'
      };
    }
    
    // Word that's been revealed multiple times (struggling)
    if (revealCount >= 3) {
      return {
        message: "This question has been tricky",
        emoji: "💪",
        type: 'challenging'
      };
    }
    
    // High accuracy (> 80%) - easy for the child
    if (totalAttempts >= 3 && accuracyRate > 0.8) {
      return {
        message: "Your child finds this easy!",
        emoji: "🌟",
        type: 'easy'
      };
    }
    
    // Low accuracy - challenging
    if (totalAttempts >= 3 && accuracyRate < 0.4) {
      return {
        message: "This question needs extra practice",
        emoji: "🎯",
        type: 'challenging'
      };
    }
    
    // Default case
    return {
      message: "Good difficulty level",
      emoji: "👍",
      type: 'improving'
    };
  };

  const guidance = getGuidanceCue(currentWord);
  
  // Color schemes based on guidance type
  const getColorScheme = (type: string) => {
    switch (type) {
      case 'repeat':
        return {
          background: 'linear-gradient(135deg, #f59e0b, #f97316)',
          text: 'white'
        };
      case 'challenging':
        return {
          background: 'rgba(239, 68, 68, 0.1)',
          text: '#dc2626'
        };
      case 'easy':
        return {
          background: 'rgba(34, 197, 94, 0.1)',
          text: '#16a34a'
        };
      case 'new':
        return {
          background: 'rgba(168, 85, 247, 0.1)',
          text: '#7c3aed'
        };
      default:
        return {
          background: 'rgba(59, 130, 246, 0.1)',
          text: '#2563eb'
        };
    }
  };

  const colors = getColorScheme(guidance.type);

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div
      data-testid="unified-parent-banner"
      style={{
        background: colors.background,
        borderRadius: 8,
        padding: '8px 12px',
        margin: '0 12px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.8rem',
        fontWeight: 500,
        color: colors.text,
        textAlign: 'center',
        minHeight: '32px',
        boxShadow: guidance.type === 'repeat' ? '0 2px 8px rgba(245, 158, 11, 0.25)' : 'none',
      }}
    >
      {/* Guidance emoji */}
      <span style={{ fontSize: '1rem' }}>
        {guidance.emoji}
      </span>
      
      {/* Compact guidance message */}
      <span style={{ flex: 1 }}>
        {guidance.message}
      </span>
      
      {/* Attempts indicator (very small) */}
      {!showRepeatExplanation && (
        <span style={{
          fontSize: '0.65rem',
          opacity: 0.7,
          marginLeft: '4px'
        }}>
          {currentWord.attempts?.length || 0} attempts
        </span>
      )}

      {/* Dismiss button for repeat explanation */}
      {showRepeatExplanation && onDismiss && (
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '0.7rem',
            flexShrink: 0,
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}