interface SubjectCardProps {
  icon: string;
  label: string;
  instruction?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function SubjectCard({ icon, label, instruction, isActive = false, onClick }: SubjectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 8,
        padding: '12px 14px',
        borderRadius: 12,
        border: `1.5px solid ${isActive ? 'var(--color-primary, #2563eb)' : 'rgba(15,23,42,0.06)'}`,
        background: isActive ? 'rgba(37,99,235,0.06)' : 'var(--bg-card, #fff)',
        boxShadow: isActive ? '0 8px 20px rgba(37,99,235,0.08)' : '0 6px 14px rgba(2,6,23,0.03)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'transform 0.12s ease, box-shadow 0.14s ease, border-color 0.14s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{label}</span>
      </div>

  {instruction && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{instruction}</div>}

      {isActive && (
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: 'var(--color-primary, #2563eb)' }}>Current selection</div>
      )}
    </button>
  );
}
