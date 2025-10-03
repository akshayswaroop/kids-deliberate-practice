interface ModeSelectorProps {
  mode: string;
  onSetMode: (mode: string) => void;
  compact?: boolean;
  options: Array<{ value: string; label: string; icon: string }>;
}

export default function ModeSelector({ mode, onSetMode, compact = false, options }: ModeSelectorProps) {
  return (
    <div style={{ marginBottom: compact ? 0 : 32, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          id="mode-select"
          value={mode}
          onChange={event => onSetMode(event.target.value)}
          style={{
            padding: compact ? '8px 36px 8px 12px' : '10px 40px 10px 16px',
            borderRadius: 999,
            border: 'none',
            fontSize: compact ? '14px' : '16px',
            fontWeight: 600,
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            minWidth: '180px',
            boxShadow: 'var(--shadow-soft)',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: compact ? 12 : 16,
            pointerEvents: 'none',
            color: 'var(--text-secondary)'
          }}
        >
          ▾
        </span>
      </div>
    </div>
  );
}
