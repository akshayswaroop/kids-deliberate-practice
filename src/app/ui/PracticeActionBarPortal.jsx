import { createPortal } from 'react-dom';

export default function PracticeActionBarPortal({ children }) {
  if (typeof document === 'undefined') return null;

  // Always render the portal - CSS will handle hiding when body.overlay-open is present
  // This is simpler and more reliable than trying to coordinate React state with class changes
  return createPortal(
    <div className="practice-action-bar-wrapper" role="region" aria-label="Practice action bar" style={{ background: 'rgba(255,255,255,0.6)' }}>
      {children}
    </div>,
    document.body
  );
}

