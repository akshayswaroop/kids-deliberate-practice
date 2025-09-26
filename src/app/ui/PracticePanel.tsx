// @ts-ignore
import PracticeCard from './PracticeCard.jsx';

interface PracticePanelProps {
  mainWord: string;
  transliteration?: string;
  choices: Array<{ id: string; label: string; progress: number }>;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
  columns?: number;
}

export default function PracticePanel({ 
  mainWord, 
  transliteration, 
  choices, 
  onCorrect, 
  onWrong, 
  onNext,
  columns = 6
}: PracticePanelProps) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PracticeCard
        mainWord={mainWord}
        transliteration={transliteration}
        choices={choices}
        onCorrect={onCorrect}
        onWrong={onWrong}
        onNext={onNext}
        columns={columns}
      />
    </div>
  );
}
