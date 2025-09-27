// Simple debug script to test session generation
const { createMathTablesWords } = require('./src/features/game/mathTables.ts');

console.log('Math Tables Words:');
const mathWords = createMathTablesWords();
console.log('Total math words:', Object.keys(mathWords).length);
console.log('First 5 math words:', Object.keys(mathWords).slice(0, 5));
console.log('Sample word:', mathWords[Object.keys(mathWords)[0]]);
