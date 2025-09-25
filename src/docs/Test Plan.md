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

### Diagnostics / Manual Testing
- The app exposes an interactive Diagnostics panel (reachable via the `#diagnostics` hash) which includes:
	- Live state viewer (JSON)
	- User selection and creation controls
	- Language mode selector
	- Session creation (start session)
	- Quick attempt buttons and next-card control

Use this panel to run manual flows and verify selectors/reducers in an isolated environment.