import React from 'react';

/**
 * CircularProgressMeter - Shows mastery progress for a single word
 * Displays how many correct attempts are needed (e.g., "1/2")
 */
export default function CircularProgressMeter({ current, total, size = 48 }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on progress
  const getColor = () => {
    if (percentage === 0) return '#cbd5e1'; // Gray - not started
    if (percentage < 100) return '#f59e0b'; // Amber - in progress
    return '#10b981'; // Green - mastered
  };

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'rotate(-90deg)',
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="3"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
          }}
        />
      </svg>

      {/* Center text */}
      <div
        style={{
          fontSize: size * 0.3,
          fontWeight: 700,
          color: getColor(),
          zIndex: 1,
          lineHeight: 1,
        }}
      >
        {current}/{total}
      </div>
    </div>
  );
}
