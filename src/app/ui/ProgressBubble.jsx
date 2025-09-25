import React from 'react';

/**
 * ProgressBubble - A circular progress indicator with rainbow gradient fill
 * @param {string} label - Text to display in the center of the bubble
 * @param {number} progress - Progress value from 0-100
 * @param {number} size - Size of the bubble in pixels (default: 56)
 */
function ProgressBubble({ label, progress, size = 56 }) {
  const hasProgress = progress > 0;
  
  // Rainbow gradient for progress (same as used in the main app)
  const rainbowGradient = 'linear-gradient(90deg, #ff4d4d 0%, #ff8a3d 20%, #ffd24d 40%, #4dd08a 60%, #5db3ff 80%, #b98bff 100%)';
  
  // Scale font size based on bubble size
  const fontSize = Math.max(10, Math.round(size * 0.25));
  
  const bubbleStyle = {
    position: 'relative',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    fontWeight: 800,
    fontSize: `${fontSize}px`,
    color: '#111827',
    boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
    border: '2px solid rgba(0,0,0,0.06)',
    background: hasProgress ? 'transparent' : 'rgba(255,255,255,0.9)',
    overflow: 'hidden'
  };

  const gradientFillStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: `${Math.min(100, Math.max(0, progress))}%`,
    background: rainbowGradient,
    borderRadius: '50%',
    transition: 'width 420ms cubic-bezier(.2,.9,.2,1)'
  };

  const labelStyle = {
    position: 'relative',
    zIndex: 2,
    color: '#111827'
  };

  return (
    <div style={bubbleStyle} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${progress}% complete`}>
      {hasProgress && <div style={gradientFillStyle} aria-hidden />}
      <div style={labelStyle}>{label}</div>
    </div>
  );
}

export default ProgressBubble;