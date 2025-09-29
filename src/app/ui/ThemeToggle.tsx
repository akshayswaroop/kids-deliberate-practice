import { useTheme } from './ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'var(--button-accent-bg)',
        border: 'none',
        color: 'var(--text-inverse)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        minWidth: '70px',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-medium)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0px)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span style={{ fontSize: '16px' }}>
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
      <span>
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}