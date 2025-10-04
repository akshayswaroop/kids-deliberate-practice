import React from 'react';
import { createPortal } from 'react-dom';

export default function PracticeActionBarPortal({ children }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="practice-action-bar-wrapper" role="region" aria-label="Practice action bar">
      {children}
    </div>,
    document.body
  );
}
