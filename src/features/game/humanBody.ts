import type { Word } from './state';
import humanBodyQuestions from '../../assets/human_body_grade3_full.json';

// Human Body question type
export interface RawHumanBodyQuestion {
  id: string;
  category: string;
  complexity: number;
  question: string;
  answer: string;
  notes: string;
}

// Transform raw question data to the app's Word format
export function createHumanBodyWords(): Record<string, Word> {
  return (humanBodyQuestions as RawHumanBodyQuestion[]).reduce((acc, questionData) => {
    const word: Word = {
      id: questionData.id,
      text: questionData.question, // The question becomes the "word" to be studied
      language: 'humanbody',
      complexityLevel: questionData.complexity,
      // Human Body specific fields
      answer: questionData.answer,
      notes: questionData.notes,
      category: questionData.category,
      attempts: [],
    };
    acc[questionData.id] = word;
    return acc;
  }, {} as Record<string, Word>);
}

// Export the raw data for any additional processing needs
export { humanBodyQuestions as RAW_HUMAN_BODY_QUESTIONS };