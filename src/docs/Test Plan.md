## Test Plan

### Selectors
- **Mastery**: Clamped between 0 and 100, obeys ±20 adjustment.
- **Current Word**: `words[session.wordIds[currentIndex]]`
- **Session Progress**: `{ current: index + 1, total: wordIds.length }`

### Session Generator
- Deterministic, uses seeded RNG.
- Honors weights and bucket assignments.

### Reducers
- **attempt()**: Appends attempt, sets `revealed = true`, updates `lastAttempt`. No mastery calculation.
- **nextCard()**: Increments index if possible, sets `revealed = false`, clears `lastAttempt`.