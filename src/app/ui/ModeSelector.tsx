interface ModeSelectorProps {
  mode: string;
  onSetMode: (mode: string) => void;
  compact?: boolean;
  options: Array<{ value: string; label: string; icon: string }>;
}

export default function ModeSelector({ mode, onSetMode, compact = false, options }: ModeSelectorProps) {
  return (
    <div style={{ marginBottom: compact ? 0 : 32, display: 'flex', alignItems: 'center' }}>
      <select 
        id="mode-select" 
        value={mode} 
        onChange={e => onSetMode(e.target.value)} 
        style={{ 
          padding: compact ? '6px 12px' : '8px 16px', 
          borderRadius: 8, 
          border: 'none',
          fontSize: compact ? '14px' : '16px',
          fontWeight: 600,
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          minWidth: '120px',
          boxShadow: 'var(--shadow-soft)',
          transition: 'all 0.3s ease'
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
