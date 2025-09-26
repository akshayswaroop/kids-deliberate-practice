import type { Word } from './state';
import indiaGeographyQuestions from '../../assets/india_geography_questions.json';

// India Geography question type matching the JSON structure
export interface RawIndiaGeographyQuestion {
  question: string;
  answer: string;
  note: string;
  complexity: number;
}

// Transform raw question data to the app's Word format
export function createIndiaGeographyWords(): Record<string, Word> {
  return (indiaGeographyQuestions as RawIndiaGeographyQuestion[]).reduce((acc, questionData, index) => {
    // Create unique ID based on complexity level and index within that level
    const levelIndex = indiaGeographyQuestions
      .slice(0, index)
      .filter(q => q.complexity === questionData.complexity).length + 1;
    const id = `geo_level${questionData.complexity}_${levelIndex}`;
    
    const word: Word = {
      id,
      text: questionData.question, // The question becomes the "word" to be studied
      language: 'indiageography',
      complexityLevel: questionData.complexity,
      // India Geography specific fields
      answer: questionData.answer,
      notes: questionData.note,
      attempts: [],
    };
    acc[id] = word;
    return acc;
  }, {} as Record<string, Word>);
}

// Export the raw data for any additional processing needs
export { indiaGeographyQuestions as RAW_INDIA_GEOGRAPHY_QUESTIONS };

// Export complexity level statistics for testing and validation
export function getComplexityLevelStats() {
  const stats: Record<number, number> = {};
  (indiaGeographyQuestions as RawIndiaGeographyQuestion[]).forEach(q => {
    stats[q.complexity] = (stats[q.complexity] || 0) + 1;
  });
  return stats;
}