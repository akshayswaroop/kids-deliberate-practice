import type { Word } from './state';

// Math Tables data with progressive complexity levels
// Following the same pattern as Kannada words but for multiplication tables

export const RAW_MATH_TABLES = [
  // Level 1: 2x table (simplest)
  { factor1: 2, factor2: 2, answer: 4, complexityLevel: 1 },
  { factor1: 2, factor2: 3, answer: 6, complexityLevel: 1 },
  { factor1: 2, factor2: 4, answer: 8, complexityLevel: 1 },
  { factor1: 2, factor2: 5, answer: 10, complexityLevel: 1 },
  { factor1: 2, factor2: 6, answer: 12, complexityLevel: 1 },
  { factor1: 2, factor2: 7, answer: 14, complexityLevel: 1 },
  { factor1: 2, factor2: 8, answer: 16, complexityLevel: 1 },
  { factor1: 2, factor2: 9, answer: 18, complexityLevel: 1 },
  { factor1: 2, factor2: 10, answer: 20, complexityLevel: 1 },

  // Level 2: 3x, 4x, 5x tables  
  { factor1: 3, factor2: 2, answer: 6, complexityLevel: 2 },
  { factor1: 3, factor2: 3, answer: 9, complexityLevel: 2 },
  { factor1: 3, factor2: 4, answer: 12, complexityLevel: 2 },
  { factor1: 3, factor2: 5, answer: 15, complexityLevel: 2 },
  { factor1: 3, factor2: 6, answer: 18, complexityLevel: 2 },
  { factor1: 3, factor2: 7, answer: 21, complexityLevel: 2 },
  { factor1: 3, factor2: 8, answer: 24, complexityLevel: 2 },
  { factor1: 3, factor2: 9, answer: 27, complexityLevel: 2 },
  { factor1: 3, factor2: 10, answer: 30, complexityLevel: 2 },

  { factor1: 4, factor2: 2, answer: 8, complexityLevel: 2 },
  { factor1: 4, factor2: 3, answer: 12, complexityLevel: 2 },
  { factor1: 4, factor2: 4, answer: 16, complexityLevel: 2 },
  { factor1: 4, factor2: 5, answer: 20, complexityLevel: 2 },
  { factor1: 4, factor2: 6, answer: 24, complexityLevel: 2 },
  { factor1: 4, factor2: 7, answer: 28, complexityLevel: 2 },
  { factor1: 4, factor2: 8, answer: 32, complexityLevel: 2 },
  { factor1: 4, factor2: 9, answer: 36, complexityLevel: 2 },
  { factor1: 4, factor2: 10, answer: 40, complexityLevel: 2 },

  { factor1: 5, factor2: 2, answer: 10, complexityLevel: 2 },
  { factor1: 5, factor2: 3, answer: 15, complexityLevel: 2 },
  { factor1: 5, factor2: 4, answer: 20, complexityLevel: 2 },
  { factor1: 5, factor2: 5, answer: 25, complexityLevel: 2 },
  { factor1: 5, factor2: 6, answer: 30, complexityLevel: 2 },
  { factor1: 5, factor2: 7, answer: 35, complexityLevel: 2 },
  { factor1: 5, factor2: 8, answer: 40, complexityLevel: 2 },
  { factor1: 5, factor2: 9, answer: 45, complexityLevel: 2 },
  { factor1: 5, factor2: 10, answer: 50, complexityLevel: 2 },

  // Level 3: 6x, 7x, 8x tables
  { factor1: 6, factor2: 2, answer: 12, complexityLevel: 3 },
  { factor1: 6, factor2: 3, answer: 18, complexityLevel: 3 },
  { factor1: 6, factor2: 4, answer: 24, complexityLevel: 3 },
  { factor1: 6, factor2: 5, answer: 30, complexityLevel: 3 },
  { factor1: 6, factor2: 6, answer: 36, complexityLevel: 3 },
  { factor1: 6, factor2: 7, answer: 42, complexityLevel: 3 },
  { factor1: 6, factor2: 8, answer: 48, complexityLevel: 3 },
  { factor1: 6, factor2: 9, answer: 54, complexityLevel: 3 },
  { factor1: 6, factor2: 10, answer: 60, complexityLevel: 3 },

  { factor1: 7, factor2: 2, answer: 14, complexityLevel: 3 },
  { factor1: 7, factor2: 3, answer: 21, complexityLevel: 3 },
  { factor1: 7, factor2: 4, answer: 28, complexityLevel: 3 },
  { factor1: 7, factor2: 5, answer: 35, complexityLevel: 3 },
  { factor1: 7, factor2: 6, answer: 42, complexityLevel: 3 },
  { factor1: 7, factor2: 7, answer: 49, complexityLevel: 3 },
  { factor1: 7, factor2: 8, answer: 56, complexityLevel: 3 },
  { factor1: 7, factor2: 9, answer: 63, complexityLevel: 3 },
  { factor1: 7, factor2: 10, answer: 70, complexityLevel: 3 },

  { factor1: 8, factor2: 2, answer: 16, complexityLevel: 3 },
  { factor1: 8, factor2: 3, answer: 24, complexityLevel: 3 },
  { factor1: 8, factor2: 4, answer: 32, complexityLevel: 3 },
  { factor1: 8, factor2: 5, answer: 40, complexityLevel: 3 },
  { factor1: 8, factor2: 6, answer: 48, complexityLevel: 3 },
  { factor1: 8, factor2: 7, answer: 56, complexityLevel: 3 },
  { factor1: 8, factor2: 8, answer: 64, complexityLevel: 3 },
  { factor1: 8, factor2: 9, answer: 72, complexityLevel: 3 },
  { factor1: 8, factor2: 10, answer: 80, complexityLevel: 3 },

  // Level 4: 9x, 10x tables
  { factor1: 9, factor2: 2, answer: 18, complexityLevel: 4 },
  { factor1: 9, factor2: 3, answer: 27, complexityLevel: 4 },
  { factor1: 9, factor2: 4, answer: 36, complexityLevel: 4 },
  { factor1: 9, factor2: 5, answer: 45, complexityLevel: 4 },
  { factor1: 9, factor2: 6, answer: 54, complexityLevel: 4 },
  { factor1: 9, factor2: 7, answer: 63, complexityLevel: 4 },
  { factor1: 9, factor2: 8, answer: 72, complexityLevel: 4 },
  { factor1: 9, factor2: 9, answer: 81, complexityLevel: 4 },
  { factor1: 9, factor2: 10, answer: 90, complexityLevel: 4 },

  { factor1: 10, factor2: 2, answer: 20, complexityLevel: 4 },
  { factor1: 10, factor2: 3, answer: 30, complexityLevel: 4 },
  { factor1: 10, factor2: 4, answer: 40, complexityLevel: 4 },
  { factor1: 10, factor2: 5, answer: 50, complexityLevel: 4 },
  { factor1: 10, factor2: 6, answer: 60, complexityLevel: 4 },
  { factor1: 10, factor2: 7, answer: 70, complexityLevel: 4 },
  { factor1: 10, factor2: 8, answer: 80, complexityLevel: 4 },
  { factor1: 10, factor2: 9, answer: 90, complexityLevel: 4 },
  { factor1: 10, factor2: 10, answer: 100, complexityLevel: 4 },

  // Level 5: 11x, 12x tables
  { factor1: 11, factor2: 2, answer: 22, complexityLevel: 5 },
  { factor1: 11, factor2: 3, answer: 33, complexityLevel: 5 },
  { factor1: 11, factor2: 4, answer: 44, complexityLevel: 5 },
  { factor1: 11, factor2: 5, answer: 55, complexityLevel: 5 },
  { factor1: 11, factor2: 6, answer: 66, complexityLevel: 5 },
  { factor1: 11, factor2: 7, answer: 77, complexityLevel: 5 },
  { factor1: 11, factor2: 8, answer: 88, complexityLevel: 5 },
  { factor1: 11, factor2: 9, answer: 99, complexityLevel: 5 },
  { factor1: 11, factor2: 10, answer: 110, complexityLevel: 5 },

  { factor1: 12, factor2: 2, answer: 24, complexityLevel: 5 },
  { factor1: 12, factor2: 3, answer: 36, complexityLevel: 5 },
  { factor1: 12, factor2: 4, answer: 48, complexityLevel: 5 },
  { factor1: 12, factor2: 5, answer: 60, complexityLevel: 5 },
  { factor1: 12, factor2: 6, answer: 72, complexityLevel: 5 },
  { factor1: 12, factor2: 7, answer: 84, complexityLevel: 5 },
  { factor1: 12, factor2: 8, answer: 96, complexityLevel: 5 },
  { factor1: 12, factor2: 9, answer: 108, complexityLevel: 5 },
  { factor1: 12, factor2: 10, answer: 120, complexityLevel: 5 },

  // Level 6: 13x, 14x, 15x tables  
  { factor1: 13, factor2: 2, answer: 26, complexityLevel: 6 },
  { factor1: 13, factor2: 3, answer: 39, complexityLevel: 6 },
  { factor1: 13, factor2: 4, answer: 52, complexityLevel: 6 },
  { factor1: 13, factor2: 5, answer: 65, complexityLevel: 6 },
  { factor1: 13, factor2: 6, answer: 78, complexityLevel: 6 },
  { factor1: 13, factor2: 7, answer: 91, complexityLevel: 6 },
  { factor1: 13, factor2: 8, answer: 104, complexityLevel: 6 },
  { factor1: 13, factor2: 9, answer: 117, complexityLevel: 6 },
  { factor1: 13, factor2: 10, answer: 130, complexityLevel: 6 },

  { factor1: 14, factor2: 2, answer: 28, complexityLevel: 6 },
  { factor1: 14, factor2: 3, answer: 42, complexityLevel: 6 },
  { factor1: 14, factor2: 4, answer: 56, complexityLevel: 6 },
  { factor1: 14, factor2: 5, answer: 70, complexityLevel: 6 },
  { factor1: 14, factor2: 6, answer: 84, complexityLevel: 6 },
  { factor1: 14, factor2: 7, answer: 98, complexityLevel: 6 },
  { factor1: 14, factor2: 8, answer: 112, complexityLevel: 6 },
  { factor1: 14, factor2: 9, answer: 126, complexityLevel: 6 },
  { factor1: 14, factor2: 10, answer: 140, complexityLevel: 6 },

  { factor1: 15, factor2: 2, answer: 30, complexityLevel: 6 },
  { factor1: 15, factor2: 3, answer: 45, complexityLevel: 6 },
  { factor1: 15, factor2: 4, answer: 60, complexityLevel: 6 },
  { factor1: 15, factor2: 5, answer: 75, complexityLevel: 6 },
  { factor1: 15, factor2: 6, answer: 90, complexityLevel: 6 },
  { factor1: 15, factor2: 7, answer: 105, complexityLevel: 6 },
  { factor1: 15, factor2: 8, answer: 120, complexityLevel: 6 },
  { factor1: 15, factor2: 9, answer: 135, complexityLevel: 6 },
  { factor1: 15, factor2: 10, answer: 150, complexityLevel: 6 },

  // Level 7: 16x, 17x, 18x tables
  { factor1: 16, factor2: 2, answer: 32, complexityLevel: 7 },
  { factor1: 16, factor2: 3, answer: 48, complexityLevel: 7 },
  { factor1: 16, factor2: 4, answer: 64, complexityLevel: 7 },
  { factor1: 16, factor2: 5, answer: 80, complexityLevel: 7 },
  { factor1: 16, factor2: 6, answer: 96, complexityLevel: 7 },
  { factor1: 16, factor2: 7, answer: 112, complexityLevel: 7 },
  { factor1: 16, factor2: 8, answer: 128, complexityLevel: 7 },
  { factor1: 16, factor2: 9, answer: 144, complexityLevel: 7 },
  { factor1: 16, factor2: 10, answer: 160, complexityLevel: 7 },

  { factor1: 17, factor2: 2, answer: 34, complexityLevel: 7 },
  { factor1: 17, factor2: 3, answer: 51, complexityLevel: 7 },
  { factor1: 17, factor2: 4, answer: 68, complexityLevel: 7 },
  { factor1: 17, factor2: 5, answer: 85, complexityLevel: 7 },
  { factor1: 17, factor2: 6, answer: 102, complexityLevel: 7 },
  { factor1: 17, factor2: 7, answer: 119, complexityLevel: 7 },
  { factor1: 17, factor2: 8, answer: 136, complexityLevel: 7 },
  { factor1: 17, factor2: 9, answer: 153, complexityLevel: 7 },
  { factor1: 17, factor2: 10, answer: 170, complexityLevel: 7 },

  { factor1: 18, factor2: 2, answer: 36, complexityLevel: 7 },
  { factor1: 18, factor2: 3, answer: 54, complexityLevel: 7 },
  { factor1: 18, factor2: 4, answer: 72, complexityLevel: 7 },
  { factor1: 18, factor2: 5, answer: 90, complexityLevel: 7 },
  { factor1: 18, factor2: 6, answer: 108, complexityLevel: 7 },
  { factor1: 18, factor2: 7, answer: 126, complexityLevel: 7 },
  { factor1: 18, factor2: 8, answer: 144, complexityLevel: 7 },
  { factor1: 18, factor2: 9, answer: 162, complexityLevel: 7 },
  { factor1: 18, factor2: 10, answer: 180, complexityLevel: 7 },

  // Level 8: 19x, 20x tables (highest complexity)
  { factor1: 19, factor2: 2, answer: 38, complexityLevel: 8 },
  { factor1: 19, factor2: 3, answer: 57, complexityLevel: 8 },
  { factor1: 19, factor2: 4, answer: 76, complexityLevel: 8 },
  { factor1: 19, factor2: 5, answer: 95, complexityLevel: 8 },
  { factor1: 19, factor2: 6, answer: 114, complexityLevel: 8 },
  { factor1: 19, factor2: 7, answer: 133, complexityLevel: 8 },
  { factor1: 19, factor2: 8, answer: 152, complexityLevel: 8 },
  { factor1: 19, factor2: 9, answer: 171, complexityLevel: 8 },
  { factor1: 19, factor2: 10, answer: 190, complexityLevel: 8 },

  { factor1: 20, factor2: 2, answer: 40, complexityLevel: 8 },
  { factor1: 20, factor2: 3, answer: 60, complexityLevel: 8 },
  { factor1: 20, factor2: 4, answer: 80, complexityLevel: 8 },
  { factor1: 20, factor2: 5, answer: 100, complexityLevel: 8 },
  { factor1: 20, factor2: 6, answer: 120, complexityLevel: 8 },
  { factor1: 20, factor2: 7, answer: 140, complexityLevel: 8 },
  { factor1: 20, factor2: 8, answer: 160, complexityLevel: 8 },
  { factor1: 20, factor2: 9, answer: 180, complexityLevel: 8 },
  { factor1: 20, factor2: 10, answer: 200, complexityLevel: 8 },
];

/**
 * Creates Math Tables words following the same pattern as Kannada words
 * Each multiplication problem becomes a "word" in the system
 */
export function createMathTablesWords(): Record<string, Word> {
  return RAW_MATH_TABLES.reduce((acc, table) => {
    const id = `${table.factor1}x${table.factor2}`;
    const questionText = `${table.factor1} × ${table.factor2}`;

    acc[id] = {
      id,
      text: questionText, // Display the question like "2 × 3"
      language: 'mathtables',
      complexityLevel: table.complexityLevel,
      // Store the answer as the "transliteration" so the UI can show it when revealed
      transliteration: table.answer.toString(),
      attempts: [],
      step: 0, // Start at step 0
      cooldownSessionsLeft: 0, // Start with no cooldown
    };
    return acc;
  }, {} as Record<string, Word>);
}