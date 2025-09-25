import PracticeCard from './PracticeCard';

export default {
  title: 'UI/PracticeCard',
  component: PracticeCard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    mainWord: {
      control: 'text',
      description: 'The main word to practice',
    },
    choices: {
      control: 'object',
      description: 'Array of choice objects with id, label, and progress',
    },
    onCorrect: {
      action: 'correct',
      description: 'Called when user clicks "She read it"',
    },
    onWrong: {
      action: 'wrong', 
      description: 'Called when user clicks "Couldn\'t read"',
    },
  },
};

// Generate 12 dummy bubbles with mixed progress
const generateDummyChoices = () => [
  { id: '1', label: 'cat', progress: 100 },
  { id: '2', label: 'dog', progress: 60 },
  { id: '3', label: 'sun', progress: 0 },
  { id: '4', label: 'run', progress: 80 },
  { id: '5', label: 'big', progress: 20 },
  { id: '6', label: 'red', progress: 100 },
  { id: '7', label: 'hat', progress: 40 },
  { id: '8', label: 'cup', progress: 0 },
  { id: '9', label: 'bed', progress: 60 },
  { id: '10', label: 'fox', progress: 100 },
  { id: '11', label: 'toy', progress: 80 },
  { id: '12', label: 'bee', progress: 20 },
];

// Default story
export const Default = {
  args: {
    mainWord: 'cat',
    transliteration: null,
    choices: generateDummyChoices(),
    onCorrect: () => console.log('✓ Child read the word correctly!'),
    onWrong: () => console.log('✗ Child couldn\'t read the word'),
  },
};

// Different word examples
export const LongerWord = {
  args: {
    mainWord: 'elephant',
    transliteration: 'el-uh-fuhnt',
    choices: generateDummyChoices(),
    onCorrect: () => console.log('✓ Child read "elephant" correctly!'),
    onWrong: () => console.log('✗ Child couldn\'t read "elephant"'),
  },
};

export const ShortWord = {
  args: {
    mainWord: 'go',
    transliteration: null,
    choices: generateDummyChoices(),
    onCorrect: () => console.log('✓ Child read "go" correctly!'),
    onWrong: () => console.log('✗ Child couldn\'t read "go"'),
  },
};

// Progress variations
export const AllBeginner = {
  args: {
    mainWord: 'new',
    transliteration: null,
    choices: generateDummyChoices().map(choice => ({ ...choice, progress: 0 })),
    onCorrect: () => console.log('✓ First success on new word!'),
    onWrong: () => console.log('✗ Still learning new words'),
  },
};

export const AllMastered = {
  args: {
    mainWord: 'expert',
    transliteration: 'ek-spurt',
    choices: generateDummyChoices().map(choice => ({ ...choice, progress: 100 })),
    onCorrect: () => console.log('✓ Perfect! All words mastered!'),
    onWrong: () => console.log('✗ Rare mistake on mastered words'),
  },
};

// Interactive playground
export const Playground = {
  args: {
    mainWord: 'play',
    transliteration: 'pley',
    choices: generateDummyChoices(),
    onCorrect: () => console.log('✓ Correct button clicked!'),
    onWrong: () => console.log('✗ Wrong button clicked!'),
  },
};

// Stress test with 12 bubbles
export const StressTest12Bubbles = {
  args: {
    mainWord: "Complex",
    transliteration: "kuhm-pleks",
    choices: Array.from({ length: 12 }, (_, i) => ({
      id: `choice-${i + 1}`,
      label: `Choice ${i + 1}`,
      progress: Math.random()
    })),
    onCorrect: () => console.log('✓ Handled 12 bubbles correctly!'),
    onWrong: () => console.log('✗ 12 bubble layout test'),
  }
};

// New story to test large bubbles and space optimization
export const LargeBubblesOptimized = {
  args: {
    mainWord: "Optimized",
    transliteration: "op-ti-mahyzd", 
    choices: [
      { id: '1', label: 'Perfect', progress: 1.0 },
      { id: '2', label: 'Good', progress: 0.7 },
      { id: '3', label: 'Okay', progress: 0.4 },
      { id: '4', label: 'Learning', progress: 0.2 },
      { id: '5', label: 'New', progress: 0.0 },
      { id: '6', label: 'Practice', progress: 0.6 }
    ],
    onCorrect: () => console.log('✓ Large bubble optimization success!'),
    onWrong: () => console.log('✗ Testing large bubble layout'),
  }
};