import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the bank
const bankPath = path.join(__dirname, '../src/assets/kannada_words_bank.json');
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf-8'));

console.log(`Processing ${bank.length} entries...`);

let fixedCount = 0;

// Fix misclassified complexity 3 entries
// Matras should stay at 3, but full words should be 4+
for (const entry of bank) {
  if (entry.complexity === 3 && !entry.id.startsWith('matregalu_')) {
    // This is a full word, not a matra
    // Check length/complexity to assign proper level
    const kannadaLength = entry.question.length;

    if (kannadaLength <= 3) {
      entry.complexity = 4; // Simple short words
    } else if (kannadaLength <= 5) {
      entry.complexity = 5; // Medium words
    } else {
      entry.complexity = 6; // Complex/long words
    }

    fixedCount++;
    console.log(`Fixed: ${entry.id} (${entry.question}) - length ${kannadaLength} → complexity ${entry.complexity}`);
  }
}

// Write back
fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));
console.log(`\n✅ Fixed ${fixedCount} misclassified word entries`);
console.log(`Saved to: ${bankPath}`);
