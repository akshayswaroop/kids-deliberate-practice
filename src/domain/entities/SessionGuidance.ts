/**
 * 🎯 Domain Entity: Session Guidance
 * 
 * Provides session-level guidance to replace ReadyToPracticeCard modal.
 * Follows DDD architecture and pure domain logic principles.
 */

export interface SessionGuidanceData {
  sessionId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  masteredInSession: number;
  allQuestionsInSetMastered: boolean;
  hasMoreLevels: boolean;
  subject: string;
  isFirstQuestionEver: boolean; // True only for the very first question of a session
}

export interface SessionGuidanceResult {
  message: string;
  urgency: 'success' | 'warning' | 'info';
  context: 'set-introduction' | 'level-transition' | 'completion';
}

export class SessionGuidance {
  private data: SessionGuidanceData;

  private constructor(data: SessionGuidanceData) {
    this.data = data;
  }

  static fromSessionData(data: SessionGuidanceData): SessionGuidance {
    return new SessionGuidance(data);
  }

  /**
   * Get session-level guidance based on current session state.
   * Returns null if no special session guidance is needed (use word-level guidance instead).
   */
  getSessionGuidance(): SessionGuidanceResult | null {
    // Validate data
    if (!this.isValidSessionData()) {
      return null;
    }

    // Scenario 1: Set Introduction (first question of session)
    if (this.isSetIntroduction()) {
      return this.createSetIntroductionGuidance();
    }

    // Scenario 2: Level Transition (all questions mastered, more levels available)
    if (this.isLevelTransition()) {
      return this.createLevelTransitionGuidance();
    }

    // Scenario 3: Completion (all questions mastered, no more levels)
    if (this.isCompletion()) {
      return this.createCompletionGuidance();
    }

    // Scenario 4: Normal operation - use word-level guidance
    return null;
  }

  private isValidSessionData(): boolean {
    return (
      this.data.sessionId.length > 0 &&
      this.data.currentQuestionIndex >= 0 &&
      this.data.totalQuestions > 0 &&
      this.data.currentQuestionIndex < this.data.totalQuestions &&
      this.data.masteredInSession >= 0 &&
      this.data.masteredInSession <= this.data.totalQuestions &&
      this.data.subject.length > 0
    );
  }

  private isSetIntroduction(): boolean {
    // Only show set introduction for the very first question of a session
    // Not when cycling back to question index 0
    return this.data.currentQuestionIndex === 0 && this.data.isFirstQuestionEver;
  }

  private isLevelTransition(): boolean {
    // All questions in current set are mastered AND there are more levels
    return (
      this.data.allQuestionsInSetMastered &&
      this.data.hasMoreLevels &&
      this.data.masteredInSession === this.data.totalQuestions
    );
  }

  private isCompletion(): boolean {
    // All questions mastered AND no more levels available
    return (
      this.data.allQuestionsInSetMastered &&
      !this.data.hasMoreLevels &&
      this.data.masteredInSession === this.data.totalQuestions
    );
  }

  private createSetIntroductionGuidance(): SessionGuidanceResult {
    const questionText = this.data.totalQuestions === 1 
      ? 'Master this question'
      : `cycle through ${this.data.totalQuestions} questions until each is mastered`;

    return {
      message: `Practice Set: We'll ${questionText}`,
      urgency: 'info',
      context: 'set-introduction'
    };
  }

  private createLevelTransitionGuidance(): SessionGuidanceResult {
    return {
      message: 'Great! All questions mastered. Ready for the next challenge?',
      urgency: 'success',
      context: 'level-transition'
    };
  }

  private createCompletionGuidance(): SessionGuidanceResult {
    const subjectDisplayName = this.formatSubjectName(this.data.subject);
    
    return {
      message: `Amazing! You've mastered everything in ${subjectDisplayName}. Check back for new questions!`,
      urgency: 'success',
      context: 'completion'
    };
  }

  private formatSubjectName(subject: string): string {
    // Convert subject codes to display names
    const subjectMap: Record<string, string> = {
      'english': 'English',
      'englishquestions': 'English Questions',
      'kannada': 'Kannada',
      'kannadaalphabets': 'Kannada Alphabets',
      'kannadawords': 'Kannada Words',
      'hindi': 'Hindi',
      'hindialphabets': 'Hindi Alphabets',
      'mathtables': 'Math Tables',
      'math': 'Math',
      'geography': 'Geography',
      'hanuman': 'Hanuman Chalisa',
      'comprehension': 'Story Comprehension',
      'humanbody': 'Human Body',
      'nationalsymbols': 'National Symbols'
    };

    return subjectMap[subject] || this.capitalizeFirstLetter(subject);
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}