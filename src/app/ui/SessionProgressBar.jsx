import React from 'react';

/**
 * SessionProgressBar - Shows overall session progress
 * Displays "X of Y mastered" with animated progress bar
 */
export default function SessionProgressBar({ mastered, total }) {
  const percentage = total > 0 ? (mastered / total) * 100 : 0;
  const isComplete = mastered === total && total > 0;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        marginBottom: 16,
      }}
    >
      {/* Text */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
          Session Progress
        </div>
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: isComplete ? '#10b981' : '#64748b',
          }}
        >
          {mastered} of {total} {isComplete ? '🎉' : ''}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: 8,
          background: '#e2e8f0',
          borderRadius: 999,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: isComplete
              ? 'linear-gradient(90deg, #10b981, #059669)'
              : 'linear-gradient(90deg, #f59e0b, #d97706)',
            borderRadius: 999,
            transition: 'width 0.5s ease',
            boxShadow: isComplete
              ? '0 0 8px rgba(16, 185, 129, 0.5)'
              : 'none',
          }}
        />
      </div>

      {/* Completion message */}
      {isComplete && (
        <div
          style={{
            marginTop: 8,
            fontSize: '0.85rem',
            color: '#10b981',
            fontWeight: 600,
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-in',
          }}
        >
          All words mastered! Great job! ✨
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
