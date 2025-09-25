import React from 'react';
import ProgressBubble from './ProgressBubble';

export default function PracticeCard({ mainWord, transliteration, choices, onCorrect, onWrong }) {
  return (
    <div style={{
      backgroundColor: 'transparent',
      borderRadius: '16px',
      padding: '20px 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      margin: '0 auto',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Compact main word section */}
      <div style={{
        textAlign: 'center',
        color: '#2c3e50',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          fontSize: `clamp(${Math.max(56, Math.min(88, 32 + mainWord.length * 2))}px, 8vw, 100px)`,
          fontWeight: 'bold',
          marginBottom: transliteration ? '8px' : '0px',
          lineHeight: 0.9,
          letterSpacing: '-0.02em',
          wordBreak: 'break-word',
          maxWidth: '100%'
        }}>
          {mainWord}
        </div>
        {transliteration && (
          <div style={{
            fontSize: 'clamp(14px, 2.8vw, 20px)',
            color: '#7f8c8d',
            fontStyle: 'italic',
            marginTop: '4px'
          }}>
            {transliteration}
          </div>
        )}
      </div>

      {/* Multi-row grid of progress bubbles - optimized for space */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
        gridAutoRows: 'min-content',
        gap: 20,
        width: '100%',
        padding: '0 12px',
        maxWidth: '100%',
        boxSizing: 'border-box',
        justifyItems: 'center',
        alignItems: 'start',
        flex: 1,
        alignContent: 'center'
      }}>
        {choices.map((choice) => (
          <ProgressBubble
            key={choice.id}
            label={choice.label}
            progress={choice.progress}
            size={Math.max(72, Math.min(96, 60 + choice.label.length * 4))}
          />
        ))}
      </div>

      {/* Compact action buttons */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginTop: 4
      }}>
        <button
          onClick={onCorrect}
          style={{
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(39, 174, 96, 0.25)',
            transition: 'all 0.2s ease',
            minWidth: '120px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#229954';
            e.target.style.transform = 'translateY(-1px)';
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
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(231, 76, 60, 0.25)',
            transition: 'all 0.2s ease',
            minWidth: '120px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#c0392b';
            e.target.style.transform = 'translateY(-1px)';
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