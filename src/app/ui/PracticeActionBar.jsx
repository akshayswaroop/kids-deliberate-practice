import React from 'react';
import './PracticeCard.css';

/**
 * Standalone bottom action bar for practice UI.
 * Self-contained with defensive CSS to prevent parent interference.
 * Props:
 * - children: React nodes (usually buttons)
 * - style: Optional style overrides
 * - className: Optional extra class
 */
export default function PracticeActionBar({ children, style = {}, className = '' }) {
  // Defensive inline styles to ensure consistent rendering regardless of parent context
  const defensiveStyles = {
    // CSS isolation and containment
    isolation: 'isolate',
    contain: 'layout style paint',
    
    // Core layout (defensive overrides)
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px', // Slightly reduce gap for better proportions
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px', // More generous padding
    borderRadius: '14px',
    boxSizing: 'border-box',
    
    // Prevent text inheritance issues
    fontSize: '1rem',
    lineHeight: '1.2',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    
    // Ensure consistent sizing
    width: '100%',
    maxWidth: '920px',
    minHeight: '64px',
    
    // Override any external interference
    position: 'relative',
    zIndex: 1,
    overflow: 'visible',
    
    ...style // Allow style prop to override if needed
  };

  return (
    <div 
      className={`practice-action-bar ${className}`} 
      style={defensiveStyles}
    >
      {children}
    </div>
  );
}
