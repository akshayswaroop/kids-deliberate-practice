import React from 'react';
import ProgressBubble from './ProgressBubble';

export default function PracticeCard({ mainWord, transliteration, choices, onCorrect, onWrong }) {
  return (
        <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 24,
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Large main word at the top */}
            {/* Prominent main word */}
      <div style={{
        textAlign: 'center',
        color: '#2c3e50',
        padding: '12px 16px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          fontSize: `clamp(${Math.max(56, Math.min(88, 32 + mainWord.length * 2))}px, 8vw, 96px)`,
          fontWeight: 'bold',
          marginBottom: '12px',
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          wordBreak: 'break-word',
          maxWidth: '100%'
        }}>
          {mainWord}
        </div>
        {transliteration && (
          <div style={{
            fontSize: 'clamp(18px, 3.5vw, 24px)',
            color: '#7f8c8d',
            fontStyle: 'italic',
            marginTop: '8px'
          }}>
            {transliteration}
          </div>
        )}
      </div>

      {/* Responsive grid of progress bubbles (scales to 12+) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        gap: 24,
        width: '100%',
        padding: '0 16px',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {choices.map((choice) => (
          <ProgressBubble
            key={choice.id}
            label={choice.label}
            progress={choice.progress}
            size={112}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginTop: 12
      }}>
        <button
          onClick={onCorrect}
          style={{
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(39, 174, 96, 0.25)',
            transition: 'all 0.2s ease',
            minWidth: '140px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#229954';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#27ae60';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ✓ She read it
        </button>

        <button
          onClick={onWrong}
          style={{
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(231, 76, 60, 0.25)',
            transition: 'all 0.2s ease',
            minWidth: '140px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#c0392b';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#e74c3c';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ✗ Couldn't read
        </button>
      </div>
    </div>
  );
}