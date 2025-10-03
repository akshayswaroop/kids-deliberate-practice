import type { Word } from '../state/gameState';

// Import all JSON banks directly for synchronous loading
import englishBank from '../../assets/english_questions_bank.json';
import kannadaWordsBank from '../../assets/kannada_words_bank.json';
import kannadaAlphabetsBank from '../../assets/kannada_alphabets_bank.json';
import hindiAlphabetsBank from '../../assets/hindi_full_barakhadi_bank.json';
import mathTablesBank from '../../assets/math_tables_bank.json';
import humanBodyBank from '../../assets/human_body_grade3_full.json';
import indiaGeographyBank from '../../assets/india_geography_questions.json';
import gramPanchayatBank from '../../assets/gram_panchayat_questions.json';
import hanumanBank from '../../assets/hanuman_chalisa_kids.json';
import storyComprehensionBank from '../../assets/story_comprehension_100.json';
import numberSpellingsBank from '../../assets/number_spellings_1_20.json';
import nationalSymbolsBank from '../../assets/national_symbols.json';
import beforeAfterNumbersBank from '../../assets/before_after_numbers_bank.json';

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
  'number_spellings_1_20.json': numberSpellingsBank,
  'national_symbols.json': nationalSymbolsBank,
  'before_after_numbers_bank.json': beforeAfterNumbersBank,
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
  {
    name: 'english',
    bankPath: 'english_questions_bank.json',
    language: 'english',
    displayIcon: '🇺🇸',
    displayLabel: 'English',
  promptLabel: 'Read this sentence aloud',
  parentInstruction: "Ask your child to read the sentence aloud. Listen and confirm their response, then tap the button that matches how well they did.",
  },
  {
    name: 'kannada',
    bankPath: 'kannada_words_bank.json',
    language: 'kannada',
    displayIcon: '🇮🇳',
    displayLabel: 'Kannada',
    promptLabel: 'Read this word',
    parentInstruction: 'Point to the word, invite your child to read it aloud, then log how it went.',
    supportsRevision: true,
    revisionPanel: {
      title: 'Kannada Revision',
      buttonLabel: 'Kannada Revision',
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
    parentInstruction: 'Show the letter and ask for the sound. If it is tricky, say it together before tapping.',
    supportsRevision: true,
    revisionPanel: {
      title: 'Kannada Alphabet Revision',
      buttonLabel: 'Alphabet Revision',
      primaryField: 'text',
      secondaryField: 'answer',
      notesField: 'notes',
    },
  },
  { 
    name: 'hindialphabets', 
    bankPath: 'hindi_full_barakhadi_bank.json', 
    language: 'hindialphabets', 
    displayIcon: '🇮🇳', 
    displayLabel: 'Hindi Alphabets', 
    promptLabel: 'Say the letter',
    parentInstruction: 'Have your child speak the Hindi sound aloud. Model it gently, then record the attempt.',
    supportsRevision: true,
    revisionPanel: {
      title: 'Hindi Alphabet Revision',
      buttonLabel: 'Hindi Revision',
      primaryField: 'text',
      secondaryField: 'answer',
      notesField: 'notes',
    },
  },
  { 
    name: 'mathtables', 
    bankPath: 'math_tables_bank.json', 
    language: 'mathtables', 
    displayIcon: '🔢', 
    displayLabel: 'Math Tables', 
    promptLabel: 'Solve this problem',
    parentInstruction: 'Ask for the answer out loud. Encourage quick mental recall before you tap the response.',
    supportsRevision: true,
    revisionPanel: {
      title: 'Math Tables Revision',
      buttonLabel: 'Math Revision',
      primaryField: 'text',
      secondaryField: 'answer',
      notesField: 'notes',
    },
  },
  {
    name: 'humanbody',
    bankPath: 'human_body_grade3_full.json',
    language: 'humanbody',
    displayIcon: '🧠',
    displayLabel: 'Human Body',
    promptLabel: 'Answer the question',
    parentInstruction: 'Read the fact aloud, hear their answer, then tap the button that matches how confident it was.',
  },
  {
    name: 'indiageography',
    bankPath: 'india_geography_questions.json',
    language: 'indiageography',
    displayIcon: '🗺️',
    displayLabel: 'India Geography',
    promptLabel: 'Answer the question',
    parentInstruction: 'Ask the question out loud, listen to the response, and record it with the buttons.',
  },
  {
    name: 'grampanchayat',
    bankPath: 'gram_panchayat_questions.json',
    language: 'grampanchayat',
    displayIcon: '🏛️',
    displayLabel: 'Gram Panchayat',
    promptLabel: 'Answer the question',
    parentInstruction: 'Talk through the civics prompt together, then log whether they remembered it.',
  },
  {
    name: 'hanuman',
    bankPath: 'hanuman_chalisa_kids.json',
    language: 'hanuman',
    displayIcon: '🕉️',
    displayLabel: 'Hanuman Chalisa',
    promptLabel: 'Read and answer',
    parentInstruction: 'Chant or read together, then ask what comes next or what it means before tapping.',
  },
  {
    name: 'comprehension',
    bankPath: 'story_comprehension_100.json',
    language: 'comprehension',
    displayIcon: '📚',
    displayLabel: 'Story Comprehension',
    promptLabel: 'Read and answer',
    parentInstruction: 'Read the passage with your child, discuss briefly, then record how completely they answered.',
  },
  {
    name: 'numberspellings',
    bankPath: 'number_spellings_1_20.json',
    language: 'numberspellings',
    displayIcon: '🔤',
    displayLabel: 'Number Spellings (1–20)',
    promptLabel: 'Spell this number',
    parentInstruction: 'Show the number and ask your child to spell it letter by letter aloud before you tap.',
    supportsRevision: true,
    revisionPanel: {
      title: 'Number Spelling Revision',
      buttonLabel: 'Number Spellings',
      primaryField: 'text',
      secondaryField: 'answer',
      notesField: 'notes',
    },
  },
  {
    name: 'nationalsymbols',
    bankPath: 'national_symbols.json',
    language: 'nationalsymbols',
    displayIcon: '🇮🇳',
    displayLabel: 'National Symbols',
    promptLabel: 'Answer the question',
    parentInstruction: 'Quiz them on what each symbol stands for, then choose the button that matches how sure they were.',
    supportsRevision: false,
  },
  {
    name: 'beforeafternumbers',
    bankPath: 'before_after_numbers_bank.json',
    language: 'beforeafternumbers',
    displayIcon: '🔢',
    displayLabel: 'Before & After Numbers',
    promptLabel: 'Complete the sequence',
    parentInstruction: 'Point to the number and ask what comes before or after. Let them think aloud before you tap.',
    supportsRevision: false,
  },
  // ADD NEW SUBJECTS HERE - no code changes needed elsewhere!
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
