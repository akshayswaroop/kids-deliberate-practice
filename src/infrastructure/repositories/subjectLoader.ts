import type { Word } from '../state/gameState';

// Import all JSON banks directly for synchronous loading
import kannadaWordsBank from '../../assets/kannada_words_bank.json';
import kannadaAlphabetsBank from '../../assets/kannada_alphabets_bank.json';

// Map bank paths to imported data
const BANK_DATA_MAP: Record<string, any> = {
  'kannada_words_bank.json': kannadaWordsBank,
  'kannada_alphabets_bank.json': kannadaAlphabetsBank,
};

// Unified question bank item interface
export interface QuestionBankItem {
  id: string;
  complexity: number;
  question: string;
  answer?: string;
  notes?: string;
  wordKannada?: string;
  transliteration?: string;
  transliterationHi?: string;
  category?: string;
}

// Subject configuration interface
type WordDisplayField = 'text' | 'wordKannada' | 'transliteration' | 'transliterationHi' | 'answer' | 'notes';

export interface SubjectConfig {
  name: string;           // e.g., 'english', 'kannada', 'mathtables'
  bankPath: string;       // e.g., 'english_questions_bank.json'
  language: string;       // e.g., 'english', 'kannada', 'mathtables'
  displayIcon: string;    // e.g., '🇺🇸', '🇮🇳', '🔢'
  displayLabel: string;   // e.g., 'English', 'Kannada', 'Math Tables'
  promptLabel?: string;   // e.g., 'Say the letter', 'Spell this number', 'Answer the question'
  parentInstruction?: string; // Guidance text for the accompanying adult
  supportsRevision?: boolean; // Whether this subject should include revision sessions (default: false for long questions)
  revisionPanel?: {
    title: string;
    buttonLabel?: string;
    primaryField: WordDisplayField;
    secondaryField?: WordDisplayField;
    notesField?: WordDisplayField;
  };
}

/**
 * Generic function to load any standardized question bank and convert to Word objects
 * This eliminates the need for separate createXXXWords() functions
 */
export function loadSubjectWords(bankData: QuestionBankItem[], language: string): Record<string, Word> {
  return bankData.reduce((acc, item) => {
    acc[item.id] = {
      id: item.id,
      text: item.question,
      language: language,
      complexityLevel: item.complexity,
      wordKannada: item.wordKannada ?? item.question,
      transliteration: item.transliteration,
      transliterationHi: item.transliterationHi,
      answer: item.answer,
      notes: item.notes,
      category: item.category,
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
  {
    name: 'kannada',
    bankPath: 'kannada_words_bank.json',
    language: 'kannada',
    displayIcon: '🇮🇳',
    displayLabel: 'Kannada Words',
    promptLabel: 'Build this word',
    parentInstruction: 'Help your learner drag the Kannada tiles into the right order, sound each syllable, and then read the whole word together.',
    supportsRevision: true,
    revisionPanel: {
      title: 'Kannada Revision',
      buttonLabel: 'Review',
      primaryField: 'text',
      secondaryField: 'answer',
      notesField: 'notes',
    },
  },
  {
    name: 'kannadaalphabets',
    bankPath: 'kannada_alphabets_bank.json',
    language: 'kannadaalphabets',
    displayIcon: '🔤',
    displayLabel: 'Kannada Alphabets',
    promptLabel: 'Say the letter',
    parentInstruction: 'Trace the letter in the air and repeat the sound together.',
    supportsRevision: true,
    revisionPanel: {
      title: 'Alphabet Revision',
      buttonLabel: 'Review Letters',
      primaryField: 'text',
      secondaryField: 'answer',
    },
  },
];

/**
 * Get the display label for a subject by its internal name.
 * Falls back to capitalizing the name if not found in config.
 * 
 * @param subjectName - Internal subject name (e.g., 'mathtables', 'english')
 * @returns Display label (e.g., 'Math Tables', 'English')
 */
export function getSubjectDisplayLabel(subjectName: string): string {
  const config = SUBJECT_CONFIGS.find(s => s.name === subjectName || s.language === subjectName);
  if (config) {
    return config.displayLabel;
  }
  // Fallback: capitalize first letter
  return subjectName.charAt(0).toUpperCase() + subjectName.slice(1);
}

/**
 * Check if a subject supports revision sessions.
 * Subjects with long questions (like National Symbols, Before & After Numbers) 
 * should not have revision as it doesn't make pedagogical sense.
 * 
 * @param subjectName - Internal subject name (e.g., 'mathtables', 'nationalsymbols')
 * @returns Whether the subject supports revision sessions
 */
export function getSubjectSupportsRevision(subjectName: string): boolean {
  const config = SUBJECT_CONFIGS.find(s => s.name === subjectName || s.language === subjectName);
  return config?.supportsRevision ?? false; // Default to false for safety
}

/**
 * Get the prompt label for a subject to clarify what action is expected.
 * This helps learners understand what to do when they see a letter, number, or question.
 * 
 * @param subjectName - Internal subject name (e.g., 'mathtables', 'kannadaalphabets')
 * @returns Prompt label (e.g., 'Say the letter', 'Spell this number', 'Answer the question')
 */
export function getSubjectPromptLabel(subjectName: string): string {
  const config = SUBJECT_CONFIGS.find(s => s.name === subjectName || s.language === subjectName);
  return config?.promptLabel ?? 'Answer the question'; // Default fallback
}

export function getSubjectParentInstruction(subjectName: string): string {
  const config = SUBJECT_CONFIGS.find(s => s.name === subjectName || s.language === subjectName);
  return config?.parentInstruction ?? 'Ask your child to answer out loud while you tap the button that matches.';
}

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
      }
    } catch {
      // Ignore individual subject failures so other banks can still load
    }
  }
  
  return allWords;
}
