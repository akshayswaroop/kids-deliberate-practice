import kannadaBank from '../../assets/kannada_alphabets_bank.json';
import './KannadaRevision.css';

type Letter = {
  id: string;
  question: string;
  answer: string;
  notes?: string;
  complexity?: number;
};

export default function KannadaRevision({ onClose }: { onClose?: () => void }) {
  const letters: Letter[] = (kannadaBank as unknown as Letter[]).filter(item => item.question && item.answer);

  return (
    <div className="kr-container">
      <div className="kr-header">
        <h2>Kannada Alphabet — Revision</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {onClose && (
            <button className="kr-close" onClick={onClose} aria-label="close">Close</button>
          )}
        </div>
      </div>

      <div className="kr-grid">
        {letters.map(letter => (
          <div key={letter.id} className="kr-tile" role="article" aria-label={`Letter ${letter.question}`}>
            <div className="kr-letter">{letter.question}</div>
            <div className="kr-answer">{letter.answer}</div>
            {letter.notes ? <div className="kr-notes">{letter.notes}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
