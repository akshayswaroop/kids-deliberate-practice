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
    choices: generateDummyChoices(),
    onCorrect: () => console.log('✓ Child read the word correctly!'),
    onWrong: () => console.log('✗ Child couldn\'t read the word'),
  },
};

// Different word examples
export const LongerWord = {
  args: {
    mainWord: 'elephant',
    choices: generateDummyChoices(),
    onCorrect: () => console.log('✓ Child read "elephant" correctly!'),
    onWrong: () => console.log('✗ Child couldn\'t read "elephant"'),
  },
};

export const ShortWord = {
  args: {
    mainWord: 'go',
    choices: generateDummyChoices(),
    onCorrect: () => console.log('✓ Child read "go" correctly!'),
    onWrong: () => console.log('✗ Child couldn\'t read "go"'),
  },
};

// Progress variations
export const AllBeginner = {
  args: {
    mainWord: 'new',
    choices: generateDummyChoices().map(choice => ({ ...choice, progress: 0 })),
    onCorrect: () => console.log('✓ First success on new word!'),
    onWrong: () => console.log('✗ Still learning new words'),
  },
};

export const AllMastered = {
  args: {
    mainWord: 'expert',
    choices: generateDummyChoices().map(choice => ({ ...choice, progress: 100 })),
    onCorrect: () => console.log('✓ Perfect! All words mastered!'),
    onWrong: () => console.log('✗ Rare mistake on mastered words'),
  },
};

// Interactive playground
export const Playground = {
  args: {
    mainWord: 'play',
    choices: generateDummyChoices(),
    onCorrect: () => console.log('✓ Correct button clicked!'),
    onWrong: () => console.log('✗ Wrong button clicked!'),
  },
};