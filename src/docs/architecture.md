# Kids Practice – Trace‑Driven Architecture Handbook

### Philosophy
Build systems that reveal their reasoning. Every click, every update, should leave a trail you can replay. A good architecture isn’t just functional — it’s narratable.

---

## Core Loop

```text
UI Intent → Reducer (pure) → State → Selector → ViewModel → UI Render
```

1. **UI dispatches intents** — user taps “Kid got it,” “Reveal,” or “Next.”  
2. **Reducers update state** — pure, deterministic functions.  
3. **Selectors** turn state into plain JSON view models (no styling).  
4. **UI** simply renders the view model — never computes domain logic.

---

## Trace Layer

Each user action generates a **trace**:

```json
{
  "intent": "markCorrect",
  "prevState": { ... },
  "nextState": { ... },
  "viewModel": { ... }
}
```

- Traces are immutable and stored per session.  
- Middleware ensures every domain transition is auditable.  
- Invariants like “progress ≥ 0” or “streak ≤ total” are validated here.  

This means debugging isn’t a log hunt — it’s story replay.

---

## Testing Model

We ground our confidence in **traces**.

- Tests replay UI dispatches.  
- Assertions check final state and trace sequence.  
- UI component tests render against selectors to guard interaction contracts.  
- Browser automation is kept to a tiny Playwright smoke suite for sanity checks — the heavy lifting still lives in fast, deterministic trace tests.  

**Outcome:** UI refactors stay safe; logic remains provable without relying on slow end-to-end runs.

---

## Design Principles

### 1. Essence over Tools  
Frameworks change; rules persist. Abstract only at the seam — business logic pure, adapters thin.

### 2. One Source of Truth  
State lives in Redux. Selectors may project copies for the UI, but there’s one canonical state per session.

### 3. Pure Core  
Reducers must be deterministic. Inject randomness or timestamps as explicit parameters, never hidden inside.

### 4. Sharp Boundaries  
Domain → Store → UI. Side effects (storage, API, sound) stay at the edge.

### 5. Small & Clear  
Split only when code exceeds mental load or crosses responsibility. Avoid fragmentation for its own sake.

### 6. Tests Buy Freedom  
Traces are your insurance policy. The more complete they are, the more boldly you can refactor.

### 7. Trace Every Story  
Debugging should feel like reading a diary. Every dispatch becomes part of the system’s narrative.

### 8. Reversible by Design  
Feature flags, incremental migrations, and testable rollbacks. Never paint the system into a corner.

### 9. Shippable & Honest  
If a state can exist, represent it honestly. It’s fine if it looks ugly — lies in state lead to chaos later.

---

## Example: End‑to‑End Flow

```text
UI tap ("Kid got it")
   ↓
Dispatch → reducer.markCorrect()
   ↓
state.progress += 1
   ↓
selector.getPracticeView() → JSON
   ↓
render(viewModel)
   ↓
trace.append({intent, state, viewModel})
```

Every loop leaves a breadcrumb. That’s the audit trail of learning.

---

### Closing Thought
Software that can tell its own story is easier to trust, test, and teach.
