/**
 * First-Class Trace System Schema
 * 
 * Comprehensive trace types for production debugging and trace-based testing.
 * Every UI action generates a TraceEntry with full context for debugging and testing.
 */

import type { RootState as GameState } from '../../infrastructure/state/gameState';

export interface TraceEntry {
  /** Unique trace entry ID */
  id: string;
  
  /** High-precision timestamp when action occurred */
  timestamp: number;
  
  /** User session identifier for grouping related traces */
  sessionId: string;
  
  /** Action that triggered this trace entry */
  action: {
    type: string;
    payload: any;
  };

  /**
   * Intent (alias for action) captured explicitly per architecture contract.
   * Kept separate for consumers that expect the intent/view model pair.
   */
  intent: {
    type: string;
    payload: any;
  };

  /** Relevant state context before action (lightweight extract, not full state) */
  stateBefore: StateContext;

  /** Relevant state context after action */
  stateAfter: StateContext;

  /** Domain-specific context capturing learning mechanics changes */
  domainContext: DomainContext;

  /** Full game state snapshot prior to the action (for deterministic replay) */
  gameStateBefore?: GameState;

  /** Full game state snapshot after the action */
  gameStateAfter?: GameState;

  /** Serialized view model snapshot after the action */
  viewModel: Record<string, unknown>;
  
  /** Performance metrics for this action */
  performance: {
    /** Time action took to process (milliseconds) */
    actionDuration: number;
    /** Time spent serializing state context */
    stateSerializationTime: number;
  };
}

/** Lightweight state context (not full Redux state) */
export interface StateContext {
  /** Current active user ID */
  currentUserId: string | null;
  
  /** Total number of users in system */
  userCount: number;
  
  /** Currently active learning mode */
  activeMode: string;
  
  /** Current word being practiced (if any) */
  currentWord?: {
    id: string;
    text: string;
    step: number;
    language: string;
    complexityLevel: number;
  };
  
  /** Current session context (if any) */
  currentSession?: {
    sessionId: string;
    wordCount: number;
    currentIndex: number;
    revealed: boolean;
  };
}

/** Domain-specific context for learning mechanics */
export interface DomainContext {
  /** Mastery step changes (for attempt actions) */
  masteryChanged?: {
    wordId: string;
    oldStep: number;
    newStep: number;
    wasMastered: boolean;
    nowMastered: boolean;
  };
  
  /** Level progression changes */
  levelProgression?: {
    language: string;
    oldLevel: number;
    newLevel: number;
    triggeredBy: 'all_mastered' | 'manual';
  };
  
  /** New session generation */
  sessionGeneration?: {
    sessionId: string;
    mode: string;
    totalWords: number;
    unmasteredCount: number;
    masteredCount: number;
  };
  
  /** User management changes */
  userManagement?: {
    action: 'created' | 'switched' | 'settings_changed';
    userId: string;
    details?: any;
  };
}

/** Complete trace session for export/import */
export interface TraceSession {
  /** Unique session identifier */
  sessionId: string;
  
  /** Session start timestamp */
  startTime: number;
  
  /** All trace entries in chronological order */
  entries: TraceEntry[];
  
  /** Session metadata */
  metadata: {
    /** Browser user agent */
    userAgent: string;
    /** App version */
    version: string;
    /** Active user during session (if any) */
    userId?: string;
    /** Total session duration when exported */
    duration?: number;
  };
}

/** Configuration for trace collection */
export interface TraceConfig {
  /** Maximum number of trace entries to keep in memory */
  maxEntries: number;
  
  /** Maximum session age before auto-rotation (milliseconds) */
  maxSessionAge: number;
  
  /** Whether to include performance metrics */
  includePerformance: boolean;
  
  /** Whether trace collection is enabled */
  enabled: boolean;
}

/** Default trace configuration */
export const DEFAULT_TRACE_CONFIG: TraceConfig = {
  maxEntries: 1000,
  maxSessionAge: 30 * 60 * 1000, // 30 minutes
  includePerformance: true,
  enabled: true,
};
