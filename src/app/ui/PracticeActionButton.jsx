import React from 'react';

/**
 * Self-contained action button with defensive styling.
 * Prevents text truncation and external CSS interference.
 */
export default function PracticeActionButton({ 
  children, 
  className = '', 
  variant = 'primary',
  onClick,
  style = {},
  ...props 
}) {
  const isDisabled = Boolean(props.disabled);
  // Defensive styles to ensure consistent button rendering
  const baseStyles = {
    // CSS isolation
    isolation: 'isolate',
    contain: 'layout style paint',
    
    // Core button styling
    border: '0',
    outline: '0',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    borderRadius: '10px',
    transition: 'transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease',
    
    // Prevent text truncation
    minHeight: '52px', // Slightly taller for better alignment
    height: '52px', // Fixed height for consistent alignment
    minWidth: '120px',
    maxWidth: '420px',
    padding: '12px 20px', // More vertical padding for better proportion
    
    // Layout and typography
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px', // Add proper spacing between icon and text
    whiteSpace: 'nowrap',
    fontSize: '1.01rem',
    fontWeight: '600',
    lineHeight: '1.3', // Slightly increase for better vertical alignment
    wordBreak: 'normal',
    textOverflow: 'ellipsis',
    overflow: 'visible',
    
    // Font consistency
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    
    // Variant-specific styles
    ...(variant === 'primary' && {
      background: '#22c55e',
      color: 'white',
      fontWeight: '700'
    }),
    ...(variant === 'secondary' && {
      background: '#ef4444',
      color: 'white',
      fontWeight: '700'
    }),
    ...(variant === 'reveal' && {
      border: '2px solid #22c55e',
      color: '#22c55e',
      background: 'white',
      fontWeight: '700'
    }),
    opacity: isDisabled ? 0.55 : 1,
    pointerEvents: isDisabled ? 'none' : 'auto',
    ...style // Allow style prop to override
  };

  const hoverStyles = {
    transform: 'translateY(-3px) scale(1.02)'
  };

  const activeStyles = {
    transform: 'translateY(0) scale(0.995)'
  };

  return (
    <button
      className={`practice-action-button ${className}`}
      style={baseStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (isDisabled) return;
        Object.assign(e.target.style, { ...baseStyles, ...hoverStyles });
      }}
      onMouseLeave={(e) => {
        Object.assign(e.target.style, baseStyles);
      }}
      onMouseDown={(e) => {
        if (isDisabled) return;
        Object.assign(e.target.style, { ...baseStyles, ...activeStyles });
      }}
      onMouseUp={(e) => {
        if (isDisabled) return;
        Object.assign(e.target.style, baseStyles);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
