import React from 'react';

/**
 * Smart hints component that analyzes construction errors
 * Provides contextual guidance on what's missing or extra
 */
export default function ConstructionHint({ constructed, expected, show }) {
  if (!show || !constructed || !expected) return null;

  const constructedComponents = constructed.map(item => item.component);
  const expectedComponents = expected;

  // Analyze the difference
  const analysis = analyzeConstruction(constructedComponents, expectedComponents);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: 'linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%)',
        border: '2px solid #ffc107',
        borderRadius: 12,
        padding: '12px 16px',
        marginTop: 12,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2)',
      }}
    >
      <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>💡</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: '#856404', marginBottom: 4 }}>
          {analysis.title}
        </div>
        <div style={{ color: '#856404', fontSize: '0.95rem', lineHeight: 1.4 }}>
          {analysis.message}
        </div>
      </div>
    </div>
  );
}

/**
 * Analyzes construction errors and generates helpful hints
 */
function analyzeConstruction(constructed, expected) {
  // Case 1: Empty construction
  if (constructed.length === 0) {
    return {
      title: 'Start building!',
      message: `Tap the letters below to build: ${expected.join(' + ')}`
    };
  }

  // Case 2: Too few components
  if (constructed.length < expected.length) {
    const missing = expected.filter((comp, idx) => constructed[idx] !== comp);
    if (missing.length === 1) {
      return {
        title: 'Almost there!',
        message: `You need to add: ${missing[0]}`
      };
    }
    return {
      title: 'Keep going!',
      message: `You need ${expected.length - constructed.length} more component(s)`
    };
  }

  // Case 3: Too many components
  if (constructed.length > expected.length) {
    return {
      title: 'Too many!',
      message: `Remove ${constructed.length - expected.length} component(s). Try tapping them to remove.`
    };
  }

  // Case 4: Right length, wrong order or components
  const wrongPositions = [];
  for (let i = 0; i < expected.length; i++) {
    if (constructed[i] !== expected[i]) {
      wrongPositions.push({ position: i, expected: expected[i], got: constructed[i] });
    }
  }

  if (wrongPositions.length > 0) {
    const first = wrongPositions[0];
    
    // Check if it's just wrong order
    const allComponentsPresent = expected.every(comp => constructed.includes(comp));
    if (allComponentsPresent) {
      return {
        title: 'Wrong order!',
        message: `Try rearranging. Position ${first.position + 1} should be "${first.expected}", not "${first.got}"`
      };
    }

    // Wrong components
    return {
      title: 'Check your components',
      message: `Position ${first.position + 1} should be "${first.expected}", but you have "${first.got}"`
    };
  }

  // Shouldn't reach here, but just in case
  return {
    title: 'Not quite right',
    message: 'Try again! Look at the expected answer carefully.'
  };
}
