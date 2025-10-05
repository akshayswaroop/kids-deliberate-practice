/**
 * Infrastructure: Subject Configuration
 * 
 * Centralizes subject-specific display names and tips.
 * Keeps domain layer agnostic of specific subjects.
 * 
 * Architecture principle: "The core domain classes should have no knowledge about subject"
 */

interface SubjectConfig {
  displayName: string;
  parentTip?: string;
}

/**
 * Subject-specific configuration
 * ADD NEW SUBJECTS HERE - domain layer remains agnostic
 */
export class SubjectConfiguration {
  private static readonly SUBJECT_MAP: Record<string, SubjectConfig> = {
    'english': {
      displayName: 'English',
      parentTip: 'Have them read it again.'
    },
    'englishquestions': {
      displayName: 'English Questions'
    },
    'kannada': {
      displayName: 'Kannada'
    },
    'kannadaalphabets': {
      displayName: 'Kannada Alphabets',
      parentTip: 'Trace in air + say the sound.'
    },
    'kannadawords': {
      displayName: 'Kannada Words'
    },
    'hindi': {
      displayName: 'Hindi'
    },
    'hindialphabets': {
      displayName: 'Hindi Alphabets',
      parentTip: 'Trace in air + say the sound.'
    },
    'mathtables': {
      displayName: 'Math Tables',
      parentTip: 'Ask them to explain the step.'
    },
    'math': {
      displayName: 'Math'
    },
    'geography': {
      displayName: 'Geography'
    },
    'hanuman': {
      displayName: 'Hanuman Chalisa',
      parentTip: 'One-line re-tell before Next.'
    },
    'comprehension': {
      displayName: 'Story Comprehension',
      parentTip: 'One-line re-tell before Next.'
    },
    'humanbody': {
      displayName: 'Human Body'
    },
    'nationalsymbols': {
      displayName: 'National Symbols'
    },
    'indiageography': {
      displayName: 'India Geography'
    },
    'grampanchayat': {
      displayName: 'Gram Panchayat'
    }
  };

  /**
   * Get display name for a subject code
   * Falls back to capitalized subject code if not found
   */
  static getDisplayName(subject: string): string {
    const config = this.SUBJECT_MAP[subject];
    if (config) {
      return config.displayName;
    }
    // Fallback: capitalize first letter
    return subject.charAt(0).toUpperCase() + subject.slice(1);
  }

  /**
   * Get parent tip for a subject (if available)
   */
  static getParentTip(subject: string): string | null {
    const config = this.SUBJECT_MAP[subject];
    return config?.parentTip || null;
  }

  /**
   * Check if subject is configured
   */
  static isConfigured(subject: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.SUBJECT_MAP, subject);
  }
}
