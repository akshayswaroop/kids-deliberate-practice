// No need to import React in TSX files with React 17+

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
          background: 'rgba(255,255,255,0.95)',
          color: '#1f2937',
          minWidth: '120px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <option value="english">🇺🇸 English</option>
        <option value="kannada">🇮🇳 Kannada</option>
        <option value="mathtables">🔢 Math Tables</option>
        <option value="humanbody">🧠 Human Body</option>
        <option value="indiageography">🗺️ India Geography</option>
        <option value="grampanchayat">🏛️ Gram Panchayat</option>
        <option value="hanuman">🕉️ Hanuman Chalisa</option>
      </select>
    </div>
  );
}
