import { getSubjectParentInstruction, getSubjectPromptLabel, SUBJECT_CONFIGS } from '../../infrastructure/repositories/subjectLoader';

interface SubjectPickerModalProps {
  open: boolean;
  selectedMode: string;
  onSelect: (mode: string) => void;
  onClose: () => void;
}

const subjectCards = SUBJECT_CONFIGS.map(config => ({
  name: config.name,
  label: config.displayLabel,
  icon: config.displayIcon,
  prompt: getSubjectPromptLabel(config.name),
  instruction: getSubjectParentInstruction(config.name),
}));

export default function SubjectPickerModal({ open, selectedMode, onSelect, onClose }: SubjectPickerModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose practice subject"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        zIndex: 5000,
      }}
    >
      <div
        style={{
          width: 'min(900px, 100%)',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-primary, #f8fafc)',
          borderRadius: 24,
          boxShadow: '0 40px 90px rgba(15, 23, 42, 0.35)',
          padding: '32px 36px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>Pick what to practice</h2>
            <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 520 }}>
              Sit beside your child, pick a subject, and guide them as they answer aloud. You’ll tap the buttons while they practise.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Maybe later
          </button>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            width: '100%',
          }}
        >
          {subjectCards.map(subject => {
            const isActive = subject.name === selectedMode;
            return (
              <button
                key={subject.name}
                type="button"
                onClick={() => onSelect(subject.name)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '18px 20px',
                  borderRadius: 18,
                  border: `2px solid ${isActive ? 'var(--color-primary, #2563eb)' : 'rgba(148, 163, 184, 0.25)'}`,
                  background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.85)',
                  boxShadow: isActive ? '0 14px 30px rgba(37, 99, 235, 0.18)' : '0 12px 24px rgba(15, 23, 42, 0.08)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                }}
              >
                <span aria-hidden style={{ fontSize: '2rem', lineHeight: 1 }}>{subject.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{subject.label}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{subject.prompt}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{subject.instruction}</span>
                </div>
                {isActive && (
                  <span style={{ marginTop: 8, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary, #2563eb)' }}>Current selection</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
