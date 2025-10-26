#!/usr/bin/env node

/**
 * Merge Kannada alphabets and words banks into a single unified bank
 * Proper learning order: Vowels → Consonants → Matras → Simple words → Complex words
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, '../src/assets');
const alphabetsPath = path.join(assetsDir, 'kannada_alphabets_bank.json');
const wordsPath = path.join(assetsDir, 'kannada_words_bank.json');
const outputPath = path.join(assetsDir, 'kannada_words_bank.json');
const backupPath = path.join(assetsDir, 'kannada_words_bank.backup.json');

console.log('🔄 Merging Kannada alphabets and words banks...\n');

// Load both banks
const alphabets = JSON.parse(fs.readFileSync(alphabetsPath, 'utf8'));
const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

console.log(`📚 Loaded ${alphabets.length} alphabet entries`);
console.log(`📝 Loaded ${words.length} word entries\n`);

// Categorize alphabets by type
const vowels = alphabets.filter(item => item.id.startsWith('swaragalu_'));
const consonants = alphabets.filter(item => item.id.startsWith('vyanjanagalu_'));
const matras = alphabets.filter(item => item.id.startsWith('matregalu_'));
const barakhadi = alphabets.filter(item => item.id.startsWith('barakhadi_'));

console.log(`  Vowels (swaragalu): ${vowels.length}`);
console.log(`  Consonants (vyanjanagalu): ${consonants.length}`);
console.log(`  Matras (matregalu): ${matras.length}`);
console.log(`  Barakhadi combinations: ${barakhadi.length}\n`);

// Separate words by complexity
const simpleWords = words.filter(w => w.complexity === 1);
const mediumWords = words.filter(w => w.complexity === 2);
const complexWords = words.filter(w => w.complexity >= 3);

console.log(`  Simple words (complexity 1): ${simpleWords.length}`);
console.log(`  Medium words (complexity 2): ${mediumWords.length}`);
console.log(`  Complex words (complexity 3+): ${complexWords.length}\n`);

// Merge in pedagogically sound order:
// 1. Start with vowels (understand basic sounds)
// 2. Add consonants (learn consonant sounds)
// 3. Mix in simple words early (apply knowledge, maintain engagement)
// 4. Matras (understand diacritics)
// 5. Barakhadi (consonant + matra combinations)
// 6. Medium and complex words (build fluency)

const mergedBank = [
  ...vowels,
  ...consonants,
  ...simpleWords.slice(0, 10), // First 10 simple words to practice early
  ...matras,
  ...barakhadi.slice(0, 50), // First 50 barakhadi combinations
  ...simpleWords.slice(10), // Remaining simple words
  ...barakhadi.slice(50), // Remaining barakhadi
  ...mediumWords,
  ...complexWords,
];

console.log(`✅ Merged bank contains ${mergedBank.length} total entries\n`);

// Backup original words bank
fs.writeFileSync(backupPath, JSON.stringify(words, null, 2));
console.log(`💾 Backed up original words to: ${path.basename(backupPath)}`);

// Write merged bank
fs.writeFileSync(outputPath, JSON.stringify(mergedBank, null, 2));
console.log(`📝 Wrote merged bank to: ${path.basename(outputPath)}`);

console.log(`\n✨ Done! Learning progression:`);
console.log(`   1. Vowels (${vowels.length})`);
console.log(`   2. Consonants (${consonants.length})`);
console.log(`   3. First simple words (10)`);
console.log(`   4. Matras (${matras.length})`);
console.log(`   5. Barakhadi starter (50)`);
console.log(`   6. More simple words (${simpleWords.length - 10})`);
console.log(`   7. Full barakhadi (${barakhadi.length - 50})`);
console.log(`   8. Medium words (${mediumWords.length})`);
console.log(`   9. Complex words (${complexWords.length})`);
