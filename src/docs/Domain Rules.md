## Domain Rules

### Mastery
- Each correct attempt: **+20% mastery**
- Each wrong attempt: **−20% mastery**
- Mastery is clamped between **0% and 100%**
- Mastery is **derived from attempts** and **never stored directly**

### Spaced Review
- When mastery first reaches **100%**:
  - `reviewInterval = 1 day`
  - `nextReviewAt = now + reviewInterval`
- On review:
  - If **correct**: `reviewInterval *= 2`, `nextReviewAt = now + reviewInterval`
  - If **wrong**: `reviewInterval = 1`, mastery drops as per above rules

### Session Selection
- Select **12 words** (fixed session size) using a deterministic, unmastered-first selection:
  - Prefer words that are not yet mastered (step < 5)
  - Sort deterministically by `(complexityLevel, step, lastPracticedAt, id)` and pick the first 12
  - This simplifies session generation and removes weighted bucket sampling
  - Selection is deterministic for tests (no injected randomness)

### Progressive Learning
- **Complexity Levels**: Words are filtered by current complexity level only
- **Level Progression**: Students must master current level before advancing
- **No Level Mixing**: Session contains words from single complexity level to maintain clear learning progression
- **Multi-Subject Support**: System supports English vocabulary, Kannada script, Math Tables, Human Body facts, and India Geography questions

### Developer Note

- User identity in state is represented by an opaque `userId`. Do not hard-code user names in `src/` files; use `displayName` for human-facing labels when needed. A detection test `noHardcodedUserNames.test.ts` scans the `src/` directory to prevent forbidden literal names from being added to source files.