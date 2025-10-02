Trace-Driven Contracts with Redux

Goal: Every UI action → traceable domain response. Tests check traces, not pixels.

⸻

Core Loop
	1.	UI dispatches intents (button, tap, etc.).
	2.	Reducers update state (pure).
	3.	Selectors project state → plain JSON view models.
	4.	UI renders view model.

⸻

Trace Layer
	•	Middleware records {intent, viewModel} for each dispatch.
	•	Traces are immutable arrays, stored per session.
	•	Invariants (e.g., “progress never negative”) run here.

⸻

Testing
	•	Tests replay UI intents (dispatches).
	•	Assert on final state + trace history.
	•	No console logs, no Playwright; tests use traces as contracts.

⸻

Principles
	•	Reducers = pure functions, no time/random inside.
	•	Selectors = DTOs only (never styled text).
	•	Middleware = side effects only (storage, API, logging).
	•	Trace = dev-only, can be persisted if debugging.
	•	Adding a new subject should be a minimal change involving adding a question bank and a config change somewhere
	• The core domain classes should have no knowledge about subject , also the UI should also not know anything about subjects
	Principles of Change-Resilient Software

(Promise → Controversy → Resolution)

⸻

1. Essence over Tools
	•	Promise: Core rules outlive frameworks.
	•	Controversy: Abstraction slows small teams.
	•	Resolution: Abstract only at the seam: business rules pure, adapters thin. Don’t generalize what isn’t changing.

⸻

2. One Source of Truth
	•	Promise: Consistent data everywhere.
	•	Controversy: Caches and replicas are duplications.
	•	Resolution: One authoritative source, many read-optimized copies. Duplication is fine if authority is clear.

⸻

3. Pure Core
	•	Promise: Deterministic, testable rules.
	•	Controversy: Some domains need randomness.
	•	Resolution: Keep randomness/time at the edge, inject as inputs. Core rules remain deterministic.

⸻

4. Sharp Boundaries
	•	Promise: Tools can be swapped without breaking rules.
	•	Controversy: Extra layers = boilerplate.
	•	Resolution: Boundaries where churn is likely (DB, UI, API). Inline the rest until change pressures demand a seam.

⸻

5. Small & Clear
	•	Promise: Easier onboarding, safer refactoring.
	•	Controversy: Too many tiny files is worse than a few chunky ones.
	•	Resolution: Split only when function is reused, exceeds mental load, or crosses responsibility.

⸻

6. Tests Buy Freedom
	•	Promise: Outcome tests enable fearless refactoring.
	•	Controversy: Internals (SQL, performance) sometimes matter.
	•	Resolution: Majority outcome-based tests; sprinkle targeted internal tests for non-functional requirements.

⸻

7. Trace Every Story
	•	Promise: Debugging feels like following a timeline.
	•	Controversy: Distributed/AI systems resist clean traces.
	•	Resolution: Trace at the event level, not every detail. Logs/events make the system narratable without pretending it’s linear.

⸻

8. Reversible by Design
	•	Promise: Mistakes are cheap.
	•	Controversy: Not everything is reversible (data loss, schema changes).
	•	Resolution: Favor feature flags & incremental migrations. For irreversible changes: simulate, double-write, then cut over.

⸻

9. Shippable & Honest
	•	Promise: Safe deploys, honest states, user trust.
	•	Controversy: Business sometimes favors speed over polish.
	•	Resolution: Ship small, safe increments. Honest error states can be ugly but must exist; polish later.
