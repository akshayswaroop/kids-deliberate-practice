import React from 'react';
import ProgressBubble from './ProgressBubble';

export default function PracticeCard({ mainWord, choices, onCorrect, onWrong }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px',
      gap: '32px',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Large main word at the top */}
      <div style={{
        fontSize: '72px',
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
        lineHeight: 1.2,
        marginTop: '20px'
      }}>
        {mainWord}
      </div>

      {/* Grid of progress bubbles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))',
        gap: '16px',
        width: '100%',
        maxWidth: '800px',
        justifyItems: 'center',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {choices.map((choice) => (
          <ProgressBubble
            key={choice.id}
            label={choice.label}
            progress={choice.progress}
            size={56}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: '24px',
        marginTop: 'auto',
        paddingBottom: '20px'
      }}>
        <button
          onClick={onCorrect}
          style={{
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
            transition: 'all 0.2s ease',
            minWidth: '160px'
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
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)',
            transition: 'all 0.2s ease',
            minWidth: '160px'
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