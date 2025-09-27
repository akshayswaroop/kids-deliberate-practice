// Centralized mode configuration
// ADD NEW MODES HERE - no more scattered hardcoded checks!

export const MODE_CONFIG = {
  // Modes that show transliteration when revealed
  transliterationModes: {
    kannada: { 
      label: 'English', 
      color: '#6366f1' 
    },
    mathtables: { 
      label: 'Answer', 
      color: '#4b5563', 
      showAsAnswer: true 
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