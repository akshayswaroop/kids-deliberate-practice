import React from 'react';
import ModeSelector from './ModeSelector';

/**
 * App header matching the actual HomePage.tsx implementation.
 * Uses CSS variables and responsive layout for consistency with the real app.
 * On mobile: shows icons only for buttons, scales down title.
 */
export default function AppHeader({ 
  mode,
  modeOptions = [],
  currentUserId,
  onSetMode = () => {},
  onOpenSubjectPicker = () => {},
  onOpenRevision = () => {},
  onOpenSettings = () => {},
  showRevisionButton = false,
  revisionButtonLabel = 'Revision',
  statsSlot = null,
  className = '',
  style = {}
}) {
  const headerStyles = {
    background: 'var(--gradient-rainbow)',
    padding: '14px 24px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 6px 18px rgba(15, 23, 42, 0.15)',
    ...style
  };

  const mobileHeaderStyles = {
    '@media (max-width: 640px)': {
      flexWrap: 'nowrap',
      gap: 8,
      padding: '12px 16px'
    }
  };

  return (
    <header className={`app-header ${className}`} style={headerStyles}>
      <style>{`
        @media (max-width: 640px) {
          .app-header {
            flex-wrap: nowrap !important;
            gap: 8px !important;
            padding: 12px 16px !important;
            justify-content: flex-start !important;
          }
          .app-header .hide-on-mobile {
            display: none !important;
          }
          .app-header .hide-text-on-mobile {
            font-size: 0 !important;
            width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          .app-header > div:first-of-type {
            flex: 0 0 auto !important;
          }
          .app-header > div:nth-of-type(2) {
            flex: 1 1 auto !important;
            min-width: 0 !important;
          }
          .app-header > div:last-of-type {
            flex: 0 0 auto !important;
            flex-wrap: nowrap !important;
            gap: 6px !important;
          }
          .app-header button {
            padding: 6px 10px !important;
            gap: 4px !important;
          }
          .hide-on-mobile-subject {
            display: none !important;
          }
          .show-on-mobile-subject {
            display: inline-flex !important;
          }
        }
      `}</style>
      
      {/* Left: App Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-inverse)', minWidth: 0, flex: '0 0 auto' }}>
        <span role="img" aria-label="sparkle" style={{ fontSize: 22, flexShrink: 0 }}>✨</span>
        <h1 className="hide-text-on-mobile" style={{ 
          fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', 
          fontWeight: 900, 
          margin: 0, 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          minWidth: 0 
        }}>
          Kids Deliberate Practice
        </h1>
      </div>

      {/* Center: Subject Selector */}
      <div style={{ display: 'flex', justifyContent: 'center', minWidth: 0, gap: 8, alignItems: 'center', flex: '1 1 auto' }}>
        {/* Desktop: Full subject dropdown */}
        <div className="hide-on-mobile-subject" style={{ flex: '1 1 auto', minWidth: 0 }}>
          <ModeSelector
            compact
            mode={mode}
            options={modeOptions}
            onSetMode={onSetMode}
          />
        </div>
        
        {/* Mobile: Compact subject icon button */}
        <button
          type="button"
          onClick={onOpenSubjectPicker}
          aria-label="Change subject"
          title="Change subject"
          className="show-on-mobile-subject"
          style={{
            display: 'none',
            border: 'none',
            background: 'rgba(255,255,255,0.95)',
            color: '#1f2937',
            borderRadius: 10,
            padding: '8px 12px',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            gap: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          📚 <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {modeOptions.find(opt => opt.value === mode)?.label || 'Select Subject'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenSubjectPicker}
          aria-label="Browse all subjects"
          title="Browse all subjects"
          className="hide-on-mobile"
          style={{
            border: 'none',
            background: 'rgba(15,23,42,0.16)',
            color: 'var(--text-inverse)',
            borderRadius: 10,
            padding: 8,
            width: 36,
            height: 36,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M3 5h18M3 12h18M3 19h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Right: Stats and Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', flexWrap: 'nowrap', flex: '0 0 auto' }}>
        {statsSlot || null}

        {showRevisionButton && (
          <button
            type="button"
            onClick={onOpenRevision}
            aria-label="Revision"
            title="Review learned words"
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              border: 'none',
              background: 'rgba(15,23,42,0.18)',
              color: 'var(--text-inverse)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
          >
            📚 <span style={{ display: 'inline' }} className="hide-on-mobile">{revisionButtonLabel}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open practice settings"
          title="Settings"
          style={{
            border: 'none',
            background: 'rgba(15,23,42,0.18)',
            borderRadius: 14,
            padding: '8px 16px',
            color: 'var(--text-inverse)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4.5" width="14" height="2" rx="1" fill="currentColor" />
              <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor" />
              <rect x="3" y="13.5" width="14" height="2" rx="1" fill="currentColor" />
            </svg>
          </span>
          <span style={{ display: 'inline' }} className="hide-on-mobile">Settings</span>
        </button>
      </div>
    </header>
  );
}