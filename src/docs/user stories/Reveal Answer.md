As a parent, I can reveal answers in non‑English modes without changing score and the app tracks reveals.
Acceptance: button visible only in non‑English; toggling shows/hides answer and dispatches action; revealCount increments on each reveal; score untouched.
Status: Implemented locally and pushed to `origin/main` (commit 2589ae7).

Acceptance: button visible only in non‑English; toggling shows/hides answer and dispatches `revealAnswer({sessionId, wordId, revealed})`; `word.revealCount` increments on each reveal; score untouched.