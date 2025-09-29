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