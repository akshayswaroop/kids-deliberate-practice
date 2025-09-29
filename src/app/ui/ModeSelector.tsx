// No need to import React in TSX files with React 17+
import { SUBJECT_CONFIGS } from '../subjectLoader';

interface ModeSelectorProps {
  mode: string;
  onSetMode: (mode: string) => void;
  compact?: boolean;
}

export default function ModeSelector({ mode, onSetMode, compact = false }: ModeSelectorProps) {
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
        {SUBJECT_CONFIGS.map(subject => (
          <option key={subject.name} value={subject.name}>
            {subject.displayIcon} {subject.displayLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
