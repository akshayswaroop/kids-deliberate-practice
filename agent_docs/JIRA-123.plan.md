---
agent_doc_type: plan
jira_id: JIRA-123
created_by: copilot-planning-mode
created_on: 2025-10-08T00:00:00Z
summary: Fix session rollover so users can start a new session when bank has more questions
---

# JIRA-123.plan.md

## Summary
When all questions in the current session are mastered the UI shows a completion message and disables actions even when there are remaining unmastered questions in the bank. The app should allow starting a new session using remaining questions at the same complexity level instead of blocking the user.

## Root cause (investigation notes)
- The session guidance selector (`selectSessionGuidance` in `src/infrastructure/state/gameSelectors.ts`) computes `hasMoreQuestionsInBank` by checking for unmastered words at the current level that are not part of the session.
- `selectSessionGuidance` uses `session.mode` to determine the current language/subject and current complexity level, but sessions created by `gameActions.ensureActiveSession` and `handleNextPressed` set `mode: 'practice'` on the session object (see `gameActions.ts`), not the subject name.
- Because `session.mode` is `'practice'` rather than the language (e.g., `'english'`), `selectSessionGuidance` filters words by `word.language === (session.mode || 'english')` and finds no matches. That sets `hasMoreQuestionsInBank` to false, leading the selector to produce a completion message and the UI to disable further actions.
- The root cause: session objects use `mode: 'practice'` instead of the language/subject string. The session should store the subject (language) so selectors can correctly compute remaining bank words.

## Proposed fix (high-level)
- When creating sessions (in `src/infrastructure/state/gameActions.ts`), set the session's `mode` field to the actual subject/language (payload.mode), not the literal string `'practice'`.
- This allows `selectSessionGuidance` and other selectors to compute `hasMoreQuestionsInBank` correctly.

## Slices / Milestones (TDD-first)
1. TDD-first failing test: selector integration
   - Add unit test in `src/infrastructure/__tests__/sessionGuidanceSelector.test.ts` (or update existing) that constructs a state where:
     - user.settings.complexityLevels["english"] = 1
     - create a session with `mode: 'practice'` (current bug) and wordIds at level 1 where some words outside session are unmastered
     - expect `selectSessionGuidance` to set guidance.message encouraging to "Click Next to practice more" when there are unmastered words in bank
   - Initially this test should fail because `hasMoreQuestionsInBank` is false with `mode: 'practice'`.
2. Fix implementation
   - Change session creation in `gameActions.ensureActiveSession` and `handleNextPressed` to use `mode: payload.mode` instead of `'practice'` when building the session object.
3. Unit tests for action creators
   - Add tests to ensure sessions created by `ensureActiveSession` and `handleNextPressed` have `mode` equal to the requested subject.
4. Integration smoke test
   - Run an existing session rollover integration test (`src/infrastructure/state/__tests__/sessionRollover.integration.test.ts`) and e2e tests referencing rollover to ensure behavior is correct.

## Approach Notes
- This is a small, low-risk change in the infra/action layer. It doesn't change domain selection logic.
- Backwards compatibility: session objects already included `mode`, but with wrong value. Adjusting to the language string won't break existing code which uses `session.mode || 'english'`.
- Edge case: some places assume session.mode may be undefined; keep fallback logic.

## Testing Strategy
- Unit tests:
  - Add/modify selector unit tests to assert `hasMoreQuestionsInBank` behavior.
  - Add tests for `ensureActiveSession` and `handleNextPressed` to assert session.mode is set to payload.mode.
- Integration tests:
  - Run `sessionRollover.integration.test.ts` and `gameIntegration.bdd.test.ts` to ensure session creation + rollover works end-to-end.
- E2E:
  - Run `tests/e2e/number-spellings-session-rollover.spec.ts` or similar to confirm UI allows starting a new session when bank has remaining questions.

## Risks & Rollout
- Low risk: single-line changes in action creators. Risk of missing other places that construct sessions; search for `mode: 'practice'` and update consistently.
- Rollout: ship as patch release. Monitor session creation telemetry if available.
- Rollback: revert commit.

## Open Questions
1. Are there any consumers expecting `session.mode === 'practice'` literal? (Search found uses of `session.mode || 'english'` so likely safe.)
2. Should session object have a separate field (`session.subject`) to avoid overloading `mode`? Not necessary now but worth noting.

## Self-Review
✅ Clarity | ✅ Slices | ✅ Tests | ✅ Risks | ✅ Reflection

---
Next → `confirm: implement` to proceed with code edits (I will create a small patch: replace `mode: 'practice'` with `mode: payload.mode` in the two session creation sites, add unit tests, run tests).
