import SubjectCard from '../SubjectCard';

export default {
  title: 'Practice/SubjectCard',
  component: SubjectCard,
};

export const Default = () => (
  <div style={{ width: 360 }}>
    <SubjectCard
      icon="🇺🇸"
      label="English"
      instruction="Ask your child to read the sentence aloud. Listen and confirm their response."
      isActive
    />
  </div>
);

export const Grid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, width: 640 }}>
    <SubjectCard icon="🇺🇸" label="English" instruction="Short instruction" isActive />
    <SubjectCard icon="🇮🇳" label="Kannada" instruction="Short instruction" />
    <SubjectCard icon="🔤" label="Alphabets" instruction="Short instruction" />
    <SubjectCard icon="🧮" label="Math" instruction="Short instruction" />
  </div>
);
