import './RevisionPanel.css';

type RevisionItem = {
  id: string;
  primary: string;
  secondary?: string;
  notes?: string;
  attempts?: {
    total: number;
    correct: number;
    incorrect: number;
  };
};

interface RevisionPanelProps {
  title: string;
  items: RevisionItem[];
  onClose?: () => void;
}

export default function RevisionPanel({ title, items, onClose }: RevisionPanelProps) {
  return (
    <div className="revision-container">
      <div className="revision-header">
        <h2>{title}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {onClose && (
            <button className="revision-close" onClick={onClose} aria-label="close">
              Close
            </button>
          )}
        </div>
      </div>

      <div className="revision-grid">
        {items.map(item => (
          <div key={item.id} className="revision-tile" role="article" aria-label={`Revision item ${item.primary}`}>
            <div className="revision-primary">{item.primary}</div>
            {item.secondary ? <div className="revision-secondary">{item.secondary}</div> : null}
            {item.notes ? <div className="revision-notes">{item.notes}</div> : null}
            {item.attempts ? (
              <div className="revision-attempts">
                <span title="Correct answers">✅ {item.attempts.correct}</span>
                <span title="Needs retry">🔁 {item.attempts.incorrect}</span>
                <span title="Total tries">🧮 {item.attempts.total}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
