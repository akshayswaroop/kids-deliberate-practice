# Kids Deliberate Practice - Multi-Language Learning App

A Redux-first React application for deliberate practice with spaced repetition, supporting both English and Kannada languages with proper script display and transliterations.

## ✨ Features

- **Multi-language Support**: English and Kannada words with proper Unicode script rendering
- **Spaced Repetition**: Intelligent algorithm for optimal learning retention
- **Multi-user Profiles**: Separate progress tracking for different users (use opaque user ids with optional display names)
- **Fixed Session Size**: Simplified experience with exactly 12 questions per session
- **Progressive Learning**: Complexity level system ensures proper learning progression
- **Responsive UI**: Optimized layout with CSS Grid and responsive bubble sizing
- **Progress Tracking**: Visual mastery indicators with rainbow gradient progress bubbles
- **Language Modes**: Switch between English, Kannada, Math Tables, Human Body, or India Geography practice modes

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to production
npm run deploy
```

## Development

Run `npm run dev` to start the Vite dev server.

### Kannada Text-to-Speech (Sarvam AI)

This repo includes a secure integration for Kannada TTS using a local dev proxy (suitable for GitHub Pages production where there is no server).

What’s included:
- Local dev proxy: `scripts/dev-tts-proxy.mjs`
- Front-end service: `src/infrastructure/services/tts/sarvamTtsService.ts`
- Demo UI: navigate to `/tts-demo` (dev) or `/kids-deliberate-practice/tts-demo` (GitHub Pages)

UI-only mode (works on GitHub Pages, exposes the key to the browser):
1) Add to `.env`:

  ```bash
  echo 'VITE_SARVAM_API_KEY=YOUR_KEY_HERE' >> .env
  ```

2) Run the app and open the demo:

  ```bash
  npm run dev
  ```

  - Dev: http://localhost:5173/kids-deliberate-practice/tts-demo
  - GitHub Pages: https://<your-username>.github.io/kids-deliberate-practice/tts-demo

3) Security note: anyone can view your key in the browser. Prefer server proxy in real deployments.

Alternative: Per-user key in Settings
- You can skip the `.env` step and paste your Sarvam API key in the app under Settings → "Sarvam API Key".
- The key is stored only in this browser's localStorage and overrides the build-time key.
- Same security caveat applies: suitable for personal/testing use only.

Secure local mode (keeps key off the browser using a local proxy):
Setup steps (local):
1) Create a Sarvam API key from https://dashboard.sarvam.ai/
2) Copy `.env.example` to `.env` and set `SARVAM_API_KEY`:

  ```bash
  cp .env.example .env
  echo 'SARVAM_API_KEY=YOUR_KEY_HERE' >> .env
  ```

3) In one terminal, run the TTS proxy:

  ```bash
  node scripts/dev-tts-proxy.mjs
  ```

4) In another terminal, run the app:

  ```bash
  npm run dev
  ```

5) Open the demo:
- Dev: http://localhost:5173/kids-deliberate-practice/tts-demo (base path configured)
- GitHub Pages: For production, deploy a serverless proxy and set `VITE_TTS_PROXY_URL` to it.

Notes:
- The proxy keeps your API key out of the browser. For production, deploy an equivalent proxy to any serverless provider (e.g., Vercel, Cloudflare). Set `VITE_TTS_PROXY_URL` to its URL if needed.
- Defaults use Kannada (`kn-IN`) and return WAV audio. You can tune pace/pitch/loudness via the service options.

### Transliteration (Kannada → English)

We integrate Sarvam's Transliterate API in UI-only mode to convert Kannada script into English (Latin) phonetic text.

- Front-end service: `src/infrastructure/services/transliterate/sarvamTransliterateService.ts`
- UI integration: Use the "ಅ→A" button on the practice card when in Kannada mode

Setup (UI-only, GitHub Pages compatible):

```bash
echo 'VITE_SARVAM_API_KEY=YOUR_KEY_HERE' >> .env
# Optional: override endpoint if Sarvam changes paths
echo 'VITE_SARVAM_TRANSLITERATE_URL=https://api.sarvam.ai/transliterate' >> .env
```

Notes:
- The provider supports Indic↔English transliteration. Indic↔Indic (e.g., Kannada→Hindi) is not supported and returns 400.
- Options include `spoken_form`, `numerals_format` (`international` or `native`), and `spoken_form_numerals_language` (`english` or `native`).
- Target language is `en-IN`; source is `kn-IN`.
 - You can also paste your Sarvam API key in Settings. It is stored in localStorage and used by both TTS and Transliteration.

## 🌐 Deployment

**Live Site**: https://<your-github-username>.github.io/kids-deliberate-practice/

### Deploy to Production

```bash
npm run deploy
```

This will:
1. Build the project (`npm run build`)
2. Publish `dist` to GitHub Pages using `gh-pages` (`npm run deploy:gh`)

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## ✅ Deployment Checklist

Keep this minimal checklist handy before running or deploying the app:

### Quick steps

1. **Build** (compile + typecheck)
   ```bash
   npm run build
   ```

2. **Run unit tests**
   ```bash
   npm test
   ```

3. **Check runtime** (start dev server and validate console)
   ```bash
   npm run dev &
   npm run check-runtime
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

### Minimal checklist

- [ ] `npm run build` ✅ (no compiler errors)
- [ ] `npm test` ✅ (all tests pass)
- [ ] `npm run check-runtime` ✅ (no console errors)
- [ ] Manual smoke test in browser ✅

## 🧪 Testing Strategy

### Test Commands
```bash
npm test                  # Run all tests
npm run test:unit         # Run unit tests only (fast: ~1.7s)
npm run test:unit:watch   # Watch mode for development
npx playwright test       # Run thin E2E smoke tests (serves in test mode)
```

### High-Leverage Tests (Essential)
- **Domain Tests** - Business logic and mastery calculations
- **Infrastructure Tests** - Redux integration and state management  
- **Integration Tests** - End-to-end user journeys and BDD scenarios
  - Create the store using `createAppStore({ persist: false, preloadedState })` to avoid localStorage.

**Total: 28 tests covering domain, infrastructure, and integration layers**

### Test Architecture
- **Unit Tests**: `vitest.config.unit.ts` - Fast jsdom-based testing
- **Integration (Redux + Domain)**: Use the store factory to run logic in-memory.
- **E2E (Playwright, thin)**: UI smoke flows with deterministic seeding via a test bridge.
- **Auto-run**: All tests run on every commit via pre-commit hooks
- **Git Integration**: Tests must pass before commits are allowed

### E2E with Playwright (Thin and Deterministic)

- Playwright runs against a dev server started in Vite test mode so the test bridge is available.
- The bridge exposes two helpers on `window`:
  - `__seedState(state)` replaces the Redux `game` slice with the provided object.
  - `__readState()` returns the current Redux state for optional assertions.
- A basic smoke test lives at `tests/e2e/practice-flow.spec.ts:1`.

Local run:

```bash
npx playwright test
```

Safety note: localStorage is cleared only inside the test browser context and origin. No real user sessions are affected.

## 🎨 Development Tools

### Component Development
Presentation components are tested via unit tests and story-driven development has been removed from this repository.

### Interactive Diagnostics
During development you can open an interactive Diagnostics panel in the running app by appending `#diagnostics` to the URL (e.g. `http://localhost:5173/#diagnostics`). The Diagnostics view provides:
- Live JSON state viewer
- Quick controls for switching users  
- Session creation and management
- Attempt simulation for testing reducers

## 🏗️ Architecture

### Trace-Driven Architecture
This app uses a trace-driven architecture where every user action generates auditable traces for debugging and testing. See `src/docs/architecture.md` for detailed architectural principles.

### Core Design Principles
- **Pure Core**: Business logic in deterministic reducers with injected dependencies
- **Sharp Boundaries**: Domain → Store → UI with side effects at the edge
- **Trace Every Story**: Every dispatch becomes part of the system's narrative
- **Tests Buy Freedom**: Comprehensive trace-based testing enables fearless refactoring

For complete architecture details and domain philosophy, see:
- `src/docs/architecture.md` - Technical architecture handbook
- `src/docs/product.md` - Product domain and learning principles

## Developer Notes

- Hard-coded human names (for example `Mishika`, `Eva`, `user1`) were removed from core `src/` code. The app now stores users by opaque `userId` keys and an optional `displayName` for UI labels.
- On first run the app shows an Onboarding screen to create the initial user rather than baking a default user into the app state.
- A fast Vitest detection test was added to `src/features/game/__tests__/noHardcodedUserNames.test.ts` that scans `src/` (excluding `__tests__` and `src/assets`) to prevent re-introducing forbidden literal names into source files. Keep test fixtures and sample user names inside `__tests__` only.

### Session Management
- **Fixed Session Size**: All practice sessions contain exactly 12 questions for consistent experience
- **Progressive Learning**: Words filtered by current complexity level only - no mixing of difficulty levels
- **Proper Learning Path**: Students must master current level before advancing to harder content
- **Simplified UX**: No configuration dropdowns - focus on learning, not settings
 - **Multiple Subjects**: Support for English words & questions, Kannada script, Math Tables, Human Body facts, and India Geography

### Multi-Language Support
- **Kannada Script**: Proper Unicode rendering with 100+ curated words
- **Transliterations**: Hindi and English transliterations as learning hints  
- **Language Filtering**: User preferences for English, Kannada, Math Tables, Human Body, or India Geography modes
- **Unicode Quality**: Fixed character encoding issues (Sinhala → Kannada corrections)

### Optimized UI Layout
- **Space Efficient**: CSS Grid with responsive bubble sizing (64-112px based on content)
- **Multi-row Display**: Automatic wrapping for optimal horizontal space usage
- **Full Viewport**: Components use `minHeight: 100vh` for maximum space utilization
- **Minimal Padding**: Reduced excessive spacing throughout component hierarchy

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
