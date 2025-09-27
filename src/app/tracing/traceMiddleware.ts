/**
 * First-Class Trace Middleware
 * 
 * Production-ready trace collection using Redux Toolkit listener middleware.
 * Captures every action with rich domain context for testing and debugging.
 */

import { createListenerMiddleware } from '@reduxjs/toolkit';
import type { RootState } from '../../features/game/state';
import type { 
  TraceEntry, 
  TraceSession, 
  StateContext, 
  DomainContext, 
  TraceConfig
} from './traceSchema';
import { DEFAULT_TRACE_CONFIG } from './traceSchema';

// Create the trace listener middleware
export const traceMiddleware = createListenerMiddleware();

/**
 * Production-ready trace storage with memory management
 */
class TraceStorage {
  private currentSession: TraceSession;
  private config: TraceConfig;

  constructor(config: TraceConfig = DEFAULT_TRACE_CONFIG) {
    this.config = config;
    this.currentSession = this.createNewSession();
    
    // Set up periodic cleanup
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60000); // Cleanup every minute
    }
  }

  addEntry(entry: TraceEntry): void {
    if (!this.config.enabled) return;

    this.currentSession.entries.push(entry);
    
    // Trim old entries if needed
    if (this.currentSession.entries.length > this.config.maxEntries) {
      const keep = Math.floor(this.config.maxEntries * 0.8); // Keep 80% when trimming
      this.currentSession.entries = this.currentSession.entries.slice(-keep);
    }
  }

  exportSession(): TraceSession {
    const exported = JSON.parse(JSON.stringify(this.currentSession));
    exported.metadata.duration = Date.now() - this.currentSession.startTime;
    return exported;
  }

  clearTraces(): void {
    this.currentSession = this.createNewSession();
  }

  getTraceCount(): number {
    return this.currentSession.entries.length;
  }

  getAllTraces(): TraceEntry[] {
    return [...this.currentSession.entries]; // Return a copy
  }

  getMemoryUsage(): { entriesCount: number; estimatedSizeKB: number } {
    const entriesCount = this.currentSession.entries.length;
    const estimatedSizeBytes = JSON.stringify(this.currentSession).length * 2; // Rough estimate (UTF-16)
    const estimatedSizeKB = Math.round(estimatedSizeBytes / 1024);
    
    return {
      entriesCount,
      estimatedSizeKB
    };
  }

  private createNewSession(): TraceSession {
    return {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      entries: [],
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'node',
        version: import.meta.env.VITE_APP_VERSION || 'dev',
      }
    };
  }

  private cleanup(): void {
    const sessionAge = Date.now() - this.currentSession.startTime;
    if (sessionAge > this.config.maxSessionAge) {
      this.currentSession = this.createNewSession();
    }
  }

  private generateSessionId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

// Helper function to generate trace IDs
function generateTraceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'trace-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Global trace storage instance
const traceStorage = new TraceStorage();

// Helper to access currentSession for the API
function getCurrentSession(): TraceSession {
  return (traceStorage as any).currentSession;
}

/**
 * Extract lightweight state context from full Redux state
 */
function extractStateContext(state: RootState): StateContext {
  // Safety checks for null/undefined state
  if (!state || !state.users) {
    return {
      currentUserId: null,
      userCount: 0,
      activeMode: 'none',
    };
  }

  const user = state.currentUserId ? state.users[state.currentUserId] : null;
  
  // Use explicit currentMode instead of guessing from activeSessions
  const activeSessionMode = user?.currentMode || null;
  const activeSessionId = activeSessionMode && user ? user.activeSessions[activeSessionMode] : null;
  const activeSession = activeSessionId && user && user.sessions ? user.sessions[activeSessionId] : null;
  
  // Get current word if there's an active session
  const currentWord = activeSession && user && user.words && activeSession.wordIds && activeSession.wordIds.length > 0 ? 
    user.words[activeSession.wordIds[activeSession.currentIndex]] : null;

  return {
    currentUserId: state.currentUserId,
    userCount: Object.keys(state.users || {}).length,
    activeMode: activeSessionMode || 'none',
    currentWord: currentWord ? {
      id: currentWord.id,
      text: currentWord.text,
      step: currentWord.step || 0,
      language: currentWord.language,
      complexityLevel: currentWord.complexityLevel || 1,
    } : undefined,
    currentSession: activeSession ? {
      sessionId: activeSessionId!,
      wordCount: activeSession.wordIds ? activeSession.wordIds.length : 0,
      currentIndex: activeSession.currentIndex || 0,
      revealed: activeSession.revealed || false,
    } : undefined,
  };
}

/**
 * Analyze domain-specific changes between states
 */
function analyzeDomainChanges(
  stateBefore: RootState, 
  stateAfter: RootState, 
  action: any
): DomainContext {
  const context: DomainContext = {};

  try {
    // Analyze mastery changes (attempt actions)
    if (action.type === 'game/attempt') {
      const { wordId } = action.payload;
      const beforeUserId = stateBefore.currentUserId;
      const afterUserId = stateAfter.currentUserId;
      
      if (beforeUserId && afterUserId && stateBefore.users && stateAfter.users) {
        const beforeUser = stateBefore.users[beforeUserId];
        const afterUser = stateAfter.users[afterUserId];
        
        if (beforeUser && afterUser && beforeUser.words && afterUser.words) {
          const beforeWord = beforeUser.words[wordId];
          const afterWord = afterUser.words[wordId];
          
          if (beforeWord && afterWord && beforeWord.step !== afterWord.step) {
            context.masteryChanged = {
              wordId,
              oldStep: beforeWord.step || 0,
              newStep: afterWord.step || 0,
              wasMastered: (beforeWord.step || 0) === 5,
              nowMastered: (afterWord.step || 0) === 5,
            };
          }
        }
      }
    }

    // Analyze level progression
    if (action.type === 'game/progressComplexityLevel') {
      const { language } = action.payload;
      const beforeUserId = stateBefore.currentUserId;
      const afterUserId = stateAfter.currentUserId;
      
      if (beforeUserId && afterUserId && stateBefore.users && stateAfter.users) {
        const beforeUser = stateBefore.users[beforeUserId];
        const afterUser = stateAfter.users[afterUserId];
        
        if (beforeUser && afterUser && beforeUser.settings && afterUser.settings) {
          const oldLevel = beforeUser.settings.complexityLevels?.[language] || 1;
          const newLevel = afterUser.settings.complexityLevels?.[language] || 1;
          
          if (oldLevel !== newLevel) {
            context.levelProgression = {
              language,
              oldLevel,
              newLevel,
              triggeredBy: 'all_mastered',
            };
          }
        }
      }
    }

    // Analyze session generation
    if (action.type === 'game/addSession') {
      const { sessionId, session } = action.payload;
      const afterUserId = stateAfter.currentUserId;
      
      if (afterUserId && stateAfter.users && session && session.wordIds) {
        const afterUser = stateAfter.users[afterUserId];
        
        if (afterUser && afterUser.words) {
          const sessionWords = session.wordIds.map((id: string) => afterUser.words[id]).filter(Boolean);
          const unmasteredCount = sessionWords.filter((w: any) => (w?.step || 0) < 5).length;
          const masteredCount = sessionWords.length - unmasteredCount;
          
          context.sessionGeneration = {
            sessionId,
            mode: session.mode,
            totalWords: session.wordIds.length,
            unmasteredCount,
            masteredCount,
          };
        }
      }
    }

    // Analyze user management
    if (action.type === 'game/addUser') {
      context.userManagement = {
        action: 'created',
        userId: action.payload?.userId || 'unknown',
      };
    } else if (action.type === 'game/selectUser') {
      context.userManagement = {
        action: 'switched',
        userId: action.payload?.userId || 'unknown',
      };
    }

  } catch (error) {
    // Fail gracefully - don't break app if trace analysis fails
    console.warn('Trace domain analysis failed:', error);
  }

  return context;
}

// Set up the main trace listener that captures ALL actions
traceMiddleware.startListening({
  predicate: () => true, // Capture every single action
  effect: async (action, listenerApi) => {
    if (!traceStorage) return; // Safety check

    const startTime = performance.now();
    
    // Get states (getOriginalState gives us the state before the action)
    // Note: In tests, the state is nested under .game, in production it might be different
    const fullStateBefore = listenerApi.getOriginalState() as any;
    const fullStateAfter = listenerApi.getState() as any;
    
    // Extract the game state (handle both direct RootState and nested {game: RootState} structures)
    const stateBefore = fullStateBefore.game || fullStateBefore;
    const stateAfter = fullStateAfter.game || fullStateAfter;
    
    const stateSerializationStart = performance.now();
    const beforeContext = extractStateContext(stateBefore);
    const afterContext = extractStateContext(stateAfter);
    const stateSerializationTime = performance.now() - stateSerializationStart;
    
    const domainContext = analyzeDomainChanges(stateBefore, stateAfter, action);
    
    const endTime = performance.now();

    const entry: TraceEntry = {
      id: generateTraceId(),
      timestamp: Date.now(),
      sessionId: getCurrentSession().sessionId,
      action: {
        type: action.type,
        payload: action.payload,
      },
      stateBefore: beforeContext,
      stateAfter: afterContext,
      domainContext,
      performance: {
        actionDuration: endTime - startTime,
        stateSerializationTime,
      }
    };

    traceStorage.addEntry(entry);
  }
});

/**
 * Public API for trace functionality
 */
export const traceAPI = {
  /** Export current trace session for debugging/sharing */
  exportCurrentSession: (): TraceSession => traceStorage.exportSession(),
  
  /** Clear all traces and start fresh session */
  clearTraces: (): void => traceStorage.clearTraces(),
  
  /** Get current number of trace entries */
  getTraceCount: (): number => traceStorage.getTraceCount(),
  
  /** Get current session ID */
  getCurrentSessionId: (): string => getCurrentSession().sessionId,
  
  /** Get last N trace entries */
  getRecentTraces: (count: number = 10): TraceEntry[] => {
    const entries = getCurrentSession().entries;
    return entries.slice(-count);
  },
  
  /** Get all trace entries */
  getAllTraces: (): TraceEntry[] => traceStorage.getAllTraces(),
  
  /** Get memory usage statistics */
  getMemoryUsage: (): { entriesCount: number; estimatedSizeKB: number } => traceStorage.getMemoryUsage(),
};

// Export middleware for store configuration
export default traceMiddleware;