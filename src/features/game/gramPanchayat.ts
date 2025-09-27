import type { Word } from './state';
import gramPanchayatQuestions from '../../assets/gram_panchayat_questions.json';

// Gram Panchayat question type
export interface RawGramPanchayatQuestion {
  id: string;
  category: string;
  complexity: number;
  question: string;
  answer: string;
  notes: string;
}

// Transform raw question data to the app's Word format
export function createGramPanchayatWords(): Record<string, Word> {
  return (gramPanchayatQuestions as RawGramPanchayatQuestion[]).reduce((acc, questionData) => {
    const word: Word = {
      id: questionData.id,
      text: questionData.question, // The question becomes the "word" to be studied
      language: 'grampanchayat',
      complexityLevel: questionData.complexity,
      // Gram Panchayat specific fields
      answer: questionData.answer,
      notes: questionData.notes,
      category: questionData.category,
      attempts: [],
      step: 0, // Start at step 0
      cooldownSessionsLeft: 0, // Start with no cooldown
      revealCount: 0, // Initialize reveal tracking
    };
    acc[questionData.id] = word;
    return acc;
  }, {} as Record<string, Word>);
}

// Export the raw data for any additional processing needs
export { gramPanchayatQuestions as RAW_GRAM_PANCHAYAT_QUESTIONS };