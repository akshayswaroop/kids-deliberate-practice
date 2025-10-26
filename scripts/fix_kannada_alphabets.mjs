import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kannada to Devanagari mappings
const kannadaToDevanagari = {
  // Vowels (Swaragalu)
  'ಅ': 'अ',
  'ಆ': 'आ',
  'ಇ': 'इ',
  'ಈ': 'ई',
  'ಉ': 'उ',
  'ಊ': 'ऊ',
  'ಋ': 'ऋ',
  'ಎ': 'ए',
  'ಏ': 'ए',
  'ಐ': 'ऐ',
  'ಒ': 'ओ',
  'ಓ': 'ओ',
  'ಔ': 'औ',
  'ಅಂ': 'अं',
  'ಅಃ': 'अः',

  // Consonants (Vyanjanagalu)
  'ಕ': 'क',
  'ಖ': 'ख',
  'ಗ': 'ग',
  'ಘ': 'घ',
  'ಙ': 'ङ',
  'ಚ': 'च',
  'ಛ': 'छ',
  'ಜ': 'ज',
  'ಝ': 'झ',
  'ಞ': 'ञ',
  'ಟ': 'ट',
  'ಠ': 'ठ',
  'ಡ': 'ड',
  'ಢ': 'ढ',
  'ಣ': 'ण',
  'ತ': 'त',
  'ಥ': 'थ',
  'ದ': 'द',
  'ಧ': 'ध',
  'ನ': 'न',
  'ಪ': 'प',
  'ಫ': 'फ',
  'ಬ': 'ब',
  'ಭ': 'भ',
  'ಮ': 'म',
  'ಯ': 'य',
  'ರ': 'र',
  'ಲ': 'ल',
  'ವ': 'व',
  'ಶ': 'श',
  'ಷ': 'ष',
  'ಸ': 'स',
  'ಹ': 'ह',
  'ಳ': 'ळ',
  'ೞ': 'ऴ',
  'ಱ': 'ऱ',
};

// Read the merged bank
const bankPath = path.join(__dirname, '../src/assets/kannada_words_bank.json');
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf-8'));

console.log(`Processing ${bank.length} entries...`);

let fixedCount = 0;

// Fix alphabet entries
for (const entry of bank) {
  // Check if this is an alphabet entry (has English description as answer)
  if (entry.answer && (
    entry.answer.includes('sound in') ||
    entry.answer.includes('Sound in') ||
    entry.id.startsWith('swaragalu_') ||
    entry.id.startsWith('vyanjanagalu_') ||
    entry.id.startsWith('yogavaahakagalu_')
  )) {
    const kannadaChar = entry.question;
    const devanagariChar = kannadaToDevanagari[kannadaChar];

    if (devanagariChar) {
      entry.answer = devanagariChar;
      entry.notes = entry.answer; // Keep the English description in notes
      fixedCount++;
      console.log(`Fixed: ${kannadaChar} → ${devanagariChar} (was: "${entry.answer.substring(0, 30)}...")`);
    } else {
      console.warn(`No mapping found for: ${kannadaChar} (id: ${entry.id})`);
    }
  }
}

// Write back
fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));
console.log(`\n✅ Fixed ${fixedCount} alphabet entries`);
console.log(`Saved to: ${bankPath}`);
