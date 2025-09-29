import type { Word } from '../features/game/state';

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
  { name: 'mathtables', bankPath: 'math_tables_bank.json', language: 'mathtables', displayIcon: '🔢', displayLabel: 'Math Tables' },
  { name: 'humanbody', bankPath: 'human_body_grade3_full.json', language: 'humanbody', displayIcon: '🧠', displayLabel: 'Human Body' },
  { name: 'indiageography', bankPath: 'india_geography_questions.json', language: 'indiageography', displayIcon: '🗺️', displayLabel: 'India Geography' },
  { name: 'grampanchayat', bankPath: 'gram_panchayat_questions.json', language: 'grampanchayat', displayIcon: '🏛️', displayLabel: 'Gram Panchayat' },
  { name: 'hanuman', bankPath: 'hanuman_chalisa_kids.json', language: 'hanuman', displayIcon: '🕉️', displayLabel: 'Hanuman Chalisa' },
  // ADD NEW SUBJECTS HERE - no code changes needed elsewhere!
];

