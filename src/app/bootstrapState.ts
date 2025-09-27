import wordsList from '../assets/words.en.json';
import type { Word } from '../features/game/state';
import { createKannadaWords } from '../features/game/kannadaWords';
import { createMathTablesWords } from '../features/game/mathTables';
import { createHumanBodyWords } from '../features/game/humanBody';
import { createIndiaGeographyWords } from '../features/game/indiaGeography';
import { createGramPanchayatWords } from '../features/game/gramPanchayat';
import { createHanumanChalisaWords } from '../features/game/hanumanChalisa';

// English complexity level mapping based on progressive learning principles
const ENGLISH_COMPLEXITY_MAPPING: Record<string, number> = {
  // Level 1: Simple CVC words (2-3 letters, basic phonics)
  "an": 1, "at": 1, "am": 1, "as": 1, "be": 1, "by": 1, "do": 1, "go": 1, "he": 1, "hi": 1, 
  "if": 1, "in": 1, "is": 1, "it": 1, "me": 1, "my": 1, "no": 1, "of": 1, "on": 1, "or": 1, 
  "so": 1, "to": 1, "up": 1, "us": 1, "we": 1,
  
  // Level 2: Basic CVC words (3 letters)
  "bat": 2, "cat": 2, "dog": 2, "egg": 2, "fan": 2, "hat": 2, "jam": 2, "kid": 2, "log": 2, 
  "man": 2, "nap": 2, "owl": 2, "pan": 2, "rat": 2, "sun": 2, "tap": 2, "van": 2, "win": 2, 
  "zip": 2, "box": 2, "bus": 2, "cup": 2, "dot": 2, "fox": 2, "gum": 2, "hen": 2, "jar": 2, 
  "kit": 2, "lap": 2, "map": 2, "net": 2, "pen": 2, "red": 2, "sad": 2, "ten": 2, "vet": 2, 
  "wax": 2, "yak": 2,
  
  // Level 3: CCVC and more complex 3-letter combinations
  "big": 3, "bug": 3, "cut": 3, "dig": 3, "fit": 3, "got": 3, "hot": 3, "jet": 3, "let": 3, 
  "mix": 3, "not": 3, "pit": 3, "run": 3, "sit": 3, "top": 3, "wet": 3, "yes": 3, "zig": 3, 
  "hop": 3, "mat": 3, "pat": 3, "rag": 3, "sip": 3, "tag": 3, "wig": 3
};

export function getInitialWords(): Record<string, Word> {
  // English words from JSON with complexity levels
  const englishWords = (wordsList as string[]).reduce((acc, text) => {
    acc[text] = {
      id: text,
      text,
      language: 'english', // Use full language name for consistency
      complexityLevel: ENGLISH_COMPLEXITY_MAPPING[text] || 1, // Default to level 1 if not mapped
      attempts: [],
      step: 0, // Start at step 0
      cooldownSessionsLeft: 0, // Start with no cooldown
      revealCount: 0, // Initialize reveal tracking
    };
    return acc;
  }, {} as Record<string, Word>);
  
  // Kannada words from the rich dataset
  const kannadaWords = createKannadaWords();
  
  // Math Tables words from the structured dataset
  const mathTablesWords = createMathTablesWords();
  
  // Human Body questions from the grade 3 dataset
  const humanBodyWords = createHumanBodyWords();
  
  // India Geography questions with progressive complexity levels
  const indiaGeographyWords = createIndiaGeographyWords();
  
  // Gram Panchayat questions for civics education
  const gramPanchayatWords = createGramPanchayatWords();
  
  // Hanuman Chalisa verses for spiritual learning
  const hanumanChalisaWords = createHanumanChalisaWords();
  
  // Combine all language word sets
  return { ...englishWords, ...kannadaWords, ...mathTablesWords, ...humanBodyWords, ...indiaGeographyWords, ...gramPanchayatWords, ...hanumanChalisaWords };
}
