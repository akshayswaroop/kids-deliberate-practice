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
- Select `sessionSize` words using **weighted buckets**:
  - **Struggle**: `mastery < 60%`
  - **New**: `attempts.length == 0`
  - **Mastered**: `mastery == 100%` and `now >= nextReviewAt`
- **Weights** for buckets are configurable: `{ struggle, new, mastered }`
- **Randomness** is injected via RNG (seedable for tests)