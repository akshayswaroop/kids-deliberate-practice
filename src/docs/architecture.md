## Architecture (Redux-first)

### State Tree

- **words**:  
  `Record<wordId, { id, text, language, attempts: [{ timestamp: number, result: "correct" | "wrong" }], nextReviewAt?: number, reviewInterval?: number }>`
- **sessions**:  
  `Record<sessionId, { wordIds: string[], currentIndex: number, revealed: boolean, lastAttempt?: "correct" | "wrong", mode: string, createdAt: number, settings: { selectionWeights: { struggle: number, new: number, mastered: number }, sessionSize: number } }>`
- **activeSessions**:  
  `Record<mode, sessionId>`
- **settings**:  
  `{ selectionWeights, sessionSize }`

### Rules

- **Reducers**: Mechanical updates (no domain math).
- **Selectors**: Domain rules (pure calculations).
- **UI**: Dumb view that calls selectors and dispatches actions.

### Layout & Presentation


### Developer Note

- Users are stored in state keyed by an opaque `userId` (string). Do not rely on human names as state keys. A `displayName` field exists on the `UserState` and is optional; UI components should prefer `displayName || userId` when rendering user labels.
- Hard-coded user names were intentionally removed from `src/` code. Tests and fixtures may still use these literals inside `__tests__`.