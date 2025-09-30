import React, { useState } from 'react';
import { useAppSelector } from '../../infrastructure/hooks/reduxHooks';
import { traceAPI } from '../tracing/traceMiddleware';

interface TraceExportProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const TraceExport: React.FC<TraceExportProps> = ({ isVisible = false, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const currentUserId = useAppSelector(state => state.game.currentUserId);

  if (!isVisible) return null;

  const handleExportTraces = () => {
    setIsExporting(true);
    
    try {
      // Get all traces from storage
      const allTraces = traceAPI.getAllTraces();
      
      // Create export data with metadata
      const exportData = {
        exportTimestamp: Date.now(),
        exportVersion: '1.0',
        userId: currentUserId,
        traceCount: allTraces.length,
        traces: allTraces,
        systemInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href
        }
      };

      // Create downloadable JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `trace-export-${currentUserId || 'anonymous'}-${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        setIsExporting(false);
        onClose?.();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to export traces:', error);
      setIsExporting(false);
    }
  };

  const handleClearTraces = () => {
    if (window.confirm('Are you sure you want to clear all trace data? This cannot be undone.')) {
      traceAPI.clearTraces();
      onClose?.();
    }
  };

  const traceCount = traceAPI.getTraceCount();
  const memoryUsage = traceAPI.getMemoryUsage();

  return (
    <div className="trace-export-overlay">
      <div className="trace-export-modal">
        <div className="trace-export-header">
          <h2>🔍 Trace Export</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="trace-export-content">
          <div className="trace-stats">
            <div className="stat-item">
              <span className="stat-label">Total Traces:</span>
              <span className="stat-value">{traceCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Memory Usage:</span>
              <span className="stat-value">{memoryUsage.entriesCount} entries ({Math.round(memoryUsage.estimatedSizeKB)}KB)</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">User ID:</span>
              <span className="stat-value">{currentUserId || 'Not set'}</span>
            </div>
          </div>

          <div className="trace-export-description">
            <p>Export your trace data to help developers debug issues. This includes:</p>
            <ul>
              <li>All user actions and responses</li>
              <li>Domain context and learning progress</li>
              <li>Performance metrics and timestamps</li>
              <li>System information for debugging</li>
            </ul>
            <p><strong>Note:</strong> No personal data is included, only learning interaction traces.</p>
          </div>

          <div className="trace-export-actions">
            <button 
              className="export-button primary"
              onClick={handleExportTraces}
              disabled={isExporting || traceCount === 0}
            >
              {isExporting ? '📦 Exporting...' : exportComplete ? '✅ Exported!' : '📥 Export Traces'}
            </button>
            
            <button 
              className="clear-button secondary"
              onClick={handleClearTraces}
              disabled={isExporting || traceCount === 0}
            >
              🗑️ Clear All Traces
            </button>
          </div>

          {traceCount === 0 && (
            <div className="no-traces-message">
              <p>No traces available. Use the app to generate trace data first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraceExport;