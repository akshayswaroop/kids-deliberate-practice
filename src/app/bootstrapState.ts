import type { Word } from '../features/game/state';
import { SUBJECT_CONFIGS, loadSubjectWords } from './subjectLoader';

// Import all JSON banks directly for synchronous loading
import englishBank from '../assets/english_questions_bank.json';
import kannadaWordsBank from '../assets/kannada_words_bank.json';
import kannadaAlphabetsBank from '../assets/kannada_alphabets_bank.json';
import mathTablesBank from '../assets/math_tables_bank.json';
import humanBodyBank from '../assets/human_body_grade3_full.json';
import indiaGeographyBank from '../assets/india_geography_questions.json';
import gramPanchayatBank from '../assets/gram_panchayat_questions.json';
import hanumanBank from '../assets/hanuman_chalisa_kids.json';

// Map bank paths to imported data
const BANK_DATA_MAP: Record<string, any> = {
  'english_questions_bank.json': englishBank,
  'kannada_words_bank.json': kannadaWordsBank,
  'kannada_alphabets_bank.json': kannadaAlphabetsBank,
  'math_tables_bank.json': mathTablesBank,
  'human_body_grade3_full.json': humanBodyBank,
  'india_geography_questions.json': indiaGeographyBank,
  'gram_panchayat_questions.json': gramPanchayatBank,
  'hanuman_chalisa_kids.json': hanumanBank,
};

export function getInitialWords(): Record<string, Word> {
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
