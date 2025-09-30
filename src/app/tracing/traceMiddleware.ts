/**
 * First-Class Trace Middleware
 * 
 * Production-ready trace collection using Redux Toolkit listener middleware.
 * Captures every action with rich domain context for testing and debugging.
 */
import { createListenerMiddleware } from '@reduxjs/toolkit';
import type { RootState } from '../../infrastructure/state/gameState';
import { MasteryConfiguration } from '../../domain/value-objects/ModeConfiguration';
import type {
  TraceEntry,
  TraceSession,
  StateContext,
  DomainContext,
  TraceConfig,
} from './traceSchema';
import { DEFAULT_TRACE_CONFIG } from './traceSchema';

/**
 * Minimal in-memory trace storage used by middleware and tests.
 * Keeps a single current session and exposes basic helpers used by tests/UI.
 */
const traceConfig: TraceConfig = { ...DEFAULT_TRACE_CONFIG };

const traceStorage = (() => {
  let session: TraceSession | null = null;

  function ensureSession(): TraceSession {
    if (!session) {
      session = {
        sessionId: generateTraceId(),
        startTime: Date.now(),
        entries: [],
        metadata: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'node',
          version: 'dev',
        },
      };
    }
    return session;
  }

  return {
    get currentSession() {
      return ensureSession();
    },

    addEntry(entry: TraceEntry) {
      const s = ensureSession();
      s.entries.push(entry);
      // Rotate if exceeded
      if (s.entries.length > traceConfig.maxEntries) {
        s.entries.splice(0, s.entries.length - traceConfig.maxEntries);
      }
    },

    exportSession(): TraceSession {
      return JSON.parse(JSON.stringify(ensureSession()));
    },

    clearTraces() {
      session = null;
    },

    getTraceCount() {
      return ensureSession().entries.length;
    },

    getAllTraces() {
      return ensureSession().entries.slice();
    },

    getMemoryUsage() {
      const entriesCount = ensureSession().entries.length;
      // Best-effort estimate
      const estimatedSizeKB = Math.round(JSON.stringify(ensureSession().entries).length / 1024);
      return { entriesCount, estimatedSizeKB };
    },
  };
})();

function generateTraceId() {
  return `trace_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function getCurrentSession(): TraceSession {
  return (traceStorage as any).currentSession;
}

/** Extract a lightweight StateContext from the game RootState */
function extractStateContext(state: RootState): StateContext {
  if (!state || !state.users) {
    return {
      currentUserId: null,
      userCount: 0,
      activeMode: 'none',
    };
  }

  const user = state.currentUserId ? state.users[state.currentUserId] : null;
  const activeSessionMode = user?.currentMode || null;
  const activeSessionId = activeSessionMode && user ? user.activeSessions?.[activeSessionMode] : null;
  const activeSession = activeSessionId && user && user.sessions ? user.sessions[activeSessionId] : null;

  const currentWord = activeSession && user && user.words && activeSession.wordIds && activeSession.wordIds.length > 0
    ? user.words[activeSession.wordIds[activeSession.currentIndex]]
    : null;

  return {
    currentUserId: state.currentUserId,
    userCount: Object.keys(state.users || {}).length,
    activeMode: activeSessionMode || 'none',
    currentWord: currentWord
      ? {
          id: currentWord.id,
          text: currentWord.text,
          step: currentWord.step || 0,
          language: currentWord.language,
          complexityLevel: currentWord.complexityLevel || 1,
        }
      : undefined,
    currentSession: activeSession
      ? {
          sessionId: activeSessionId!,
          wordCount: activeSession.wordIds ? activeSession.wordIds.length : 0,
          currentIndex: activeSession.currentIndex || 0,
          revealed: activeSession.revealed || false,
        }
      : undefined,
  };
}

/** Analyze domain-specific changes between two game states */
function analyzeDomainChanges(stateBefore: RootState, stateAfter: RootState, action: any): DomainContext {
  const context: DomainContext = {};

  try {
    // Mastery changes (game/attempt)
    if (action.type === 'game/attempt') {
      const { wordId } = action.payload || {};
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
              wasMastered: MasteryConfiguration.isMastered(beforeWord),
              nowMastered: MasteryConfiguration.isMastered(afterWord),
            };
          }
        }
      }
    }

    // Level progression
    if (action.type === 'game/progressComplexityLevel') {
      const { language } = action.payload || {};
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

    // Session generation
    if (action.type === 'game/addSession') {
      const { sessionId, session } = action.payload || {};
      const afterUserId = stateAfter.currentUserId;

      if (afterUserId && stateAfter.users && session && session.wordIds) {
        const afterUser = stateAfter.users[afterUserId];

        if (afterUser && afterUser.words) {
          const sessionWords = session.wordIds.map((id: string) => afterUser.words[id]).filter(Boolean);
          const unmasteredCount = sessionWords.filter((w: any) => !MasteryConfiguration.isMastered(w)).length;
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

    // User management
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
    console.warn('Trace domain analysis failed:', error);
  }

  return context;
}

// Create the listener middleware and start a global listener that captures all actions
export const traceMiddleware = createListenerMiddleware();

traceMiddleware.startListening({
  predicate: () => true,
  effect: async (action, listenerApi) => {
    if (!traceStorage) return;

    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  const fullStateBefore: any = (listenerApi.getOriginalState && listenerApi.getOriginalState()) || (listenerApi.getState && listenerApi.getState());
  const fullStateAfter: any = listenerApi.getState ? listenerApi.getState() : fullStateBefore;

    const stateBefore = (fullStateBefore && (fullStateBefore.game || fullStateBefore)) as RootState;
    const stateAfter = (fullStateAfter && (fullStateAfter.game || fullStateAfter)) as RootState;

    const stateSerializationStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const beforeContext = extractStateContext(stateBefore);
    const afterContext = extractStateContext(stateAfter);
    const stateSerializationTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - stateSerializationStart;

    const domainContext = analyzeDomainChanges(stateBefore, stateAfter, action);

    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

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
      },
    };

    traceStorage.addEntry(entry);
  },
});

/** Public trace API used by UI and tests */
export const traceAPI = {
  exportCurrentSession: (): TraceSession => traceStorage.exportSession(),
  clearTraces: (): void => traceStorage.clearTraces(),
  getTraceCount: (): number => traceStorage.getTraceCount(),
  getCurrentSessionId: (): string => getCurrentSession().sessionId,
  getRecentTraces: (count: number = 10): TraceEntry[] => {
    const entries = getCurrentSession().entries;
    return entries.slice(-count);
  },
  getAllTraces: (): TraceEntry[] => traceStorage.getAllTraces(),
  getMemoryUsage: (): { entriesCount: number; estimatedSizeKB: number } => traceStorage.getMemoryUsage(),
};

export default traceMiddleware;