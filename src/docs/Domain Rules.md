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
- Select **12 words** (fixed session size) using **weighted buckets**:
  - **Struggle**: `mastery < 60%`
  - **New**: `attempts.length == 0`
  - **Mastered**: `mastery == 100%` and `now >= nextReviewAt`
- **Weights** for buckets are configurable: `{ struggle, new, mastered }`
- **Randomness** is injected via RNG (seedable for tests)

### Progressive Learning
- **Complexity Levels**: Words are filtered by current complexity level only
- **Level Progression**: Students must master current level before advancing
- **No Level Mixing**: Session contains words from single complexity level to maintain clear learning progression

### Developer Note

- User identity in state is represented by an opaque `userId`. Do not hard-code user names in `src/` files; use `displayName` for human-facing labels when needed. A detection test `noHardcodedUserNames.test.ts` scans the `src/` directory to prevent forbidden literal names from being added to source files.