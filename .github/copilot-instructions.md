# Repository Copilot Instructions

This file provides repository-wide guidance for GitHub Copilot and other automated agents.

Primary guidance:

- Treat files under `src/docs/` as the authoritative source for architecture and domain rules.
- Important files: `src/docs/architecture.md`, `src/docs/product.md`.
- Before proposing or applying changes that affect system behavior, read `src/docs` and prefer its guidance.
- When in conflict, prefer `src/docs` over code comments or ad-hoc notes.
- `architecture.md` covers technical trace-driven architecture patterns
- `product.md` covers domain model and deliberate practice philosophy

Keep these instructions concise and human-readable.