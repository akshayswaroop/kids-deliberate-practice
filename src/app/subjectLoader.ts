import type { Word } from '../features/game/state';

// Import all JSON banks directly for synchronous loading
import englishBank from '../assets/english_questions_bank.json';
import kannadaWordsBank from '../assets/kannada_words_bank.json';
import kannadaAlphabetsBank from '../assets/kannada_alphabets_bank.json';
import hindiAlphabetsBank from '../assets/hindi_full_barakhadi_bank.json';
import mathTablesBank from '../assets/math_tables_bank.json';
import humanBodyBank from '../assets/human_body_grade3_full.json';
import indiaGeographyBank from '../assets/india_geography_questions.json';
import gramPanchayatBank from '../assets/gram_panchayat_questions.json';
import hanumanBank from '../assets/hanuman_chalisa_kids.json';
import storyComprehensionBank from '../assets/story_comprehension_100.json';

// Map bank paths to imported data
const BANK_DATA_MAP: Record<string, any> = {
  'english_questions_bank.json': englishBank,
  'kannada_words_bank.json': kannadaWordsBank,
  'kannada_alphabets_bank.json': kannadaAlphabetsBank,
  'hindi_full_barakhadi_bank.json': hindiAlphabetsBank,
  'math_tables_bank.json': mathTablesBank,
  'human_body_grade3_full.json': humanBodyBank,
  'india_geography_questions.json': indiaGeographyBank,
  'gram_panchayat_questions.json': gramPanchayatBank,
  'hanuman_chalisa_kids.json': hanumanBank,
  'story_comprehension_100.json': storyComprehensionBank,
};

// Unified question bank item interface
export interface QuestionBankItem {
  id: string;
  complexity: number;
  question: string;
  answer?: string;
  notes?: string;
}

// Subject configuration interface
export interface SubjectConfig {
  name: string;           // e.g., 'english', 'kannada', 'mathtables'
  bankPath: string;       // e.g., 'english_questions_bank.json'
  language: string;       // e.g., 'english', 'kannada', 'mathtables'
  displayIcon: string;    // e.g., '🇺🇸', '🇮🇳', '🔢'
  displayLabel: string;   // e.g., 'English', 'Kannada', 'Math Tables'
}

/**
 * Generic function to load any standardized question bank and convert to Word objects
 * This eliminates the need for separate createXXXWords() functions
 */
export function loadSubjectWords(bankData: QuestionBankItem[], language: string): Record<string, Word> {
  return bankData.reduce((acc, item) => {
    acc[item.id] = {
      id: item.id,
      text: item.question,                    // Map 'question' to 'text' for Word interface
      language: language,
      complexityLevel: item.complexity,
      answer: item.answer,                    // Optional answer field
      notes: item.notes,                      // Optional notes field
      attempts: [],
      step: 0,
      cooldownSessionsLeft: 0,
      revealCount: 0,
    };
    return acc;
  }, {} as Record<string, Word>);
}

/**
 * Configuration for all subjects - ADD NEW SUBJECTS HERE
 * This is the only place that needs updates when adding new subjects
 */
export const SUBJECT_CONFIGS: SubjectConfig[] = [
  { name: 'english', bankPath: 'english_questions_bank.json', language: 'english', displayIcon: '🇺🇸', displayLabel: 'English' },
  { name: 'kannada', bankPath: 'kannada_words_bank.json', language: 'kannada', displayIcon: '🇮🇳', displayLabel: 'Kannada' },
  { name: 'kannadaalphabets', bankPath: 'kannada_alphabets_bank.json', language: 'kannadaalphabets', displayIcon: '🔤', displayLabel: 'Kannada Alphabets' },
  { name: 'hindialphabets', bankPath: 'hindi_full_barakhadi_bank.json', language: 'hindialphabets', displayIcon: '🇮🇳', displayLabel: 'Hindi Alphabets' },
  { name: 'mathtables', bankPath: 'math_tables_bank.json', language: 'mathtables', displayIcon: '🔢', displayLabel: 'Math Tables' },
  { name: 'humanbody', bankPath: 'human_body_grade3_full.json', language: 'humanbody', displayIcon: '🧠', displayLabel: 'Human Body' },
  { name: 'indiageography', bankPath: 'india_geography_questions.json', language: 'indiageography', displayIcon: '🗺️', displayLabel: 'India Geography' },
  { name: 'grampanchayat', bankPath: 'gram_panchayat_questions.json', language: 'grampanchayat', displayIcon: '🏛️', displayLabel: 'Gram Panchayat' },
  { name: 'hanuman', bankPath: 'hanuman_chalisa_kids.json', language: 'hanuman', displayIcon: '🕉️', displayLabel: 'Hanuman Chalisa' },
  { name: 'comprehension', bankPath: 'story_comprehension_100.json', language: 'comprehension', displayIcon: '📚', displayLabel: 'Story Comprehension' },
  // ADD NEW SUBJECTS HERE - no code changes needed elsewhere!
];

/**
 * Load all words from all configured subjects
 * This is the only function that knows about specific JSON banks
 */
export function loadAllWords(): Record<string, Word> {
  const allWords: Record<string, Word> = {};
  
  // Load all subjects from configuration
  for (const subjectConfig of SUBJECT_CONFIGS) {
    try {
      const bankData = BANK_DATA_MAP[subjectConfig.bankPath];
      if (bankData) {
        const subjectWords = loadSubjectWords(bankData, subjectConfig.language);
        Object.assign(allWords, subjectWords);
      } else {
        console.error(`Bank data not found for: ${subjectConfig.bankPath}`);
      }
    } catch (error) {
      console.error(`Failed to load subject: ${subjectConfig.name}`, error);
    }
  }
  
  return allWords;
}

