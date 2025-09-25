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

- The app exposes a `HomePage` container with three responsive layout variants: `topbar`, `sidebar`, and `center`. Presentation components are built as pure props-only React components and developed via Storybook.
- Root CSS no longer constrains max-width; the UI is designed to use full viewport width with controlled padding/gutters to avoid overflow and preserve readability.