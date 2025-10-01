import React from 'react';

// Trace export UI removed. Keep a no-op component so imports don't break in other files.
interface TraceExportProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const TraceExport: React.FC<TraceExportProps> = () => {
  return null;
};

export default TraceExport;