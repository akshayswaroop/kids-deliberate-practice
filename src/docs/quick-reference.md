# Quick Reference — Build & Test

Keep this minimal checklist handy before running or deploying the app.

## Quick steps

1. Build (compile + typecheck)

   ```bash
   npm run build
   ```

2. Run unit tests

   ```bash
   npm test
   ```

3. Check runtime (start dev server and validate console)

   ```bash
   npm run dev &
   npm run check-runtime
   ```

4. Preview production build

   ```bash
   npm run preview
   ```

## Minimal checklist

- [ ] `npm run build` ✅ (no compiler errors)
- [ ] `npm test` ✅ (all tests pass)
- [ ] `npm run check-runtime` ✅ (no console errors)
- [ ] Manual smoke test in browser ✅

Keep this file short — for full workflow details see the developer docs in repo root if needed.