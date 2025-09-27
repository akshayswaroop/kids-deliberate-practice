# CHANGELOG

## Unreleased

- refactor(session): simplify session generation to deterministic unmastered-first selection and require full (100%) mastery before level progression
  - Removed configurable `selectionWeights` from `SessionSettings` and tests
  - Replaced weighted bucket sampling with `selectSessionWords(allWords, size)` deterministic selection
  - Updated selectors to require `step === 5` for mastery checks
  - Tests and documentation updated to match new behavior
