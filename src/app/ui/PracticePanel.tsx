// @ts-ignore
import PracticeCard from './PracticeCard.jsx';

interface PracticePanelProps {
  mainWord: string;
  transliteration?: string;
  transliterationHi?: string;
  answer?: string;
  notes?: string;
  choices: Array<{ id: string; label: string; progress: number }>;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
  columns?: number;
  mode?: string;
}

export default function PracticePanel({ 
  mainWord, 
  transliteration, 
  transliterationHi,
  answer,
  notes,
  choices, 
  onCorrect, 
  onWrong, 
  onNext,
  columns = 6
  , mode
}: PracticePanelProps & { mode?: string }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PracticeCard
        mainWord={mainWord}
        transliteration={transliteration}
        transliterationHi={transliterationHi}
        answer={answer}
        notes={notes}
        choices={choices}
        onCorrect={onCorrect}
        onWrong={onWrong}
        onNext={onNext}
        columns={columns}
        mode={mode}
      />
    </div>
  );
}
