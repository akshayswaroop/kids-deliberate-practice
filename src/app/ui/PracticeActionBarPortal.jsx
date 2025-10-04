import React from 'react';
import { createPortal } from 'react-dom';

export default function PracticeActionBarPortal({ children }) {
  if (typeof document === 'undefined') return null;

  // Render the portal synchronously when document is available to avoid
  // a transient missing action bar on mobile where effects may run later.
  return createPortal(
    <div className="practice-action-bar-wrapper" role="region" aria-label="Practice action bar" style={{ background: 'rgba(255,255,255,0.6)' }}>
      {children}
    </div>,
    document.body
  );
}

