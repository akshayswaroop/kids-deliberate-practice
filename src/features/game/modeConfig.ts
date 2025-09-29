// Centralized mode configuration
// ADD NEW MODES HERE - no more scattered hardcoded checks!

export const MODE_CONFIG = {
  // Modes that show transliteration when revealed
  transliterationModes: {
    kannada: { 
      label: 'English', 
      color: '#6366f1',
      // For Kannada mode, when the answer should be shown use the Hindi transliteration field
      showAsAnswer: true,
      answerField: 'transliterationHi'
    },
    mathtables: { 
      label: 'Answer', 
      color: '#4b5563', 
      showAsAnswer: true,
      // Math tables store the numeric answer in `transliteration` so surface that as the canonical answer
      answerField: 'transliteration'
    }
  },
  
  // Modes that show answer + notes when revealed
  answerModes: {
    humanbody: { 
      background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05))',
      border: '2px solid rgba(34,197,94,0.2)',
      shadow: '0 4px 12px rgba(34,197,94,0.1)',
      textColor: '#065f46'
    },
    indiageography: {
      background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))',
      border: '2px solid rgba(59,130,246,0.2)', 
      shadow: '0 4px 12px rgba(59,130,246,0.1)',
      textColor: '#1e40af'
    },
    grampanchayat: {
      background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(147,51,234,0.05))',
      border: '2px solid rgba(168,85,247,0.2)',
      shadow: '0 4px 12px rgba(168,85,247,0.1)', 
      textColor: '#7c2d12'
    }
    ,
    // Hanuman Chalisa mode: shows verse (main), answer (kid-friendly translation) and notes
    hanuman: {
      background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))',
      border: '2px solid rgba(245,158,11,0.12)',
      shadow: '0 4px 12px rgba(245,158,11,0.08)',
      textColor: '#92400e'
    },
    // Story Comprehension mode: shows reading comprehension questions with answers
    comprehension: {
      background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(67,56,202,0.05))',
      border: '2px solid rgba(99,102,241,0.2)',
      shadow: '0 4px 12px rgba(99,102,241,0.1)',
      textColor: '#4338ca'
    }
  }
} as const;

// Helper functions for type-safe mode checking
export const isTransliterationMode = (mode: string): mode is keyof typeof MODE_CONFIG.transliterationModes => {
  return MODE_CONFIG.transliterationModes.hasOwnProperty(mode);
};

export const isAnswerMode = (mode: string): mode is keyof typeof MODE_CONFIG.answerModes => {
  return MODE_CONFIG.answerModes.hasOwnProperty(mode);
};

export const getAnswerModeStyle = (mode: string) => {
  return MODE_CONFIG.answerModes[mode as keyof typeof MODE_CONFIG.answerModes] || MODE_CONFIG.answerModes.humanbody;
};

// Arrays for backward compatibility and selector usage
export const TRANSLITERATION_MODES = Object.keys(MODE_CONFIG.transliterationModes);
export const ANSWER_MODES = Object.keys(MODE_CONFIG.answerModes);

// Mastery configuration: centralized threshold for considering a word "mastered".
export const MASTER_STEP = 2; // Words with step >= MASTER_STEP are considered mastered

// Helper to check mastery on a word object (keeps selector logic consistent)
export const isMastered = (word: { step: number } | undefined | null): boolean => {
  if (!word) return false;
  return (word.step || 0) >= MASTER_STEP;
};