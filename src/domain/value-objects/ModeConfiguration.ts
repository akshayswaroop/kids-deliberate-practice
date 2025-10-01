/**
 * Domain Value Objects for Practice Mode Configuration
 * 
 * Contains pure business rules about different practice modes
 * without any infrastructure dependencies.
 */

export interface TransliterationModeConfig {
  label: string;
  color: string;
  showAsAnswer: boolean;
  answerField: 'transliteration' | 'transliterationHi';
}

export interface AnswerModeConfig {
  background: string;
  border: string;
  shadow: string;
  textColor: string;
}

/**
 * Centralized mode configuration - Domain Business Rules
 * ADD NEW MODES HERE - no more scattered hardcoded checks!
 */
export class ModeConfiguration {
  // Modes that show transliteration when revealed
  private static readonly TRANSLITERATION_MODES: Record<string, TransliterationModeConfig> = {
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
  };
  
  // Modes that show answer + notes when revealed
  private static readonly ANSWER_MODES: Record<string, AnswerModeConfig> = {
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
    },
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
  };

  // Modes that always show answers (no reveal button needed)
  // These are practice modes where the "answer" field contains instructions/prompts, not translations
  private static readonly ALWAYS_SHOW_ANSWER_MODES = ['english'];

  // Domain Business Rules
  static isTransliterationMode(mode: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.TRANSLITERATION_MODES, mode);
  }

  static isAnswerMode(mode: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.ANSWER_MODES, mode);
  }

  static shouldAlwaysShowAnswer(mode: string): boolean {
    return this.ALWAYS_SHOW_ANSWER_MODES.includes(mode);
  }

  static getTransliterationModeConfig(mode: string): TransliterationModeConfig | null {
    return this.TRANSLITERATION_MODES[mode] || null;
  }

  static getAnswerModeConfig(mode: string): AnswerModeConfig {
    return this.ANSWER_MODES[mode] || this.ANSWER_MODES.humanbody;
  }

  static getTransliterationModes(): string[] {
    return Object.keys(this.TRANSLITERATION_MODES);
  }

  static getAnswerModes(): string[] {
    return Object.keys(this.ANSWER_MODES);
  }
}

/**
 * Mastery Business Rules - Domain Constants
 */
export class MasteryConfiguration {
  // Centralized threshold for considering a word "mastered"
  static readonly MASTER_STEP = 2; // Words with step >= MASTER_STEP are considered mastered

  // Helper to check mastery on a word object (keeps domain logic consistent)
  static isMastered(word: { step: number } | undefined | null): boolean {
    if (!word) return false;
    return (word.step || 0) >= this.MASTER_STEP;
  }
}