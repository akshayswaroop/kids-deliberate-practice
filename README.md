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
- **Language Modes**: Switch between English, Kannada, Math Tables, or Human Body practice modes

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test:all          # Run all tests (unit + Storybook)
npm run test:unit         # Run unit tests only (fast: ~1.7s)
npm run test:stories      # Run Storybook component tests
npm run test:unit:watch   # Watch mode for development
npm run test:watch        # Watch mode for all tests (continuous)

# Launch Storybook for component development
npm run storybook
```

## 🧪 Testing Strategy

### Quick Test Commands
```bash
npm run test:all          # All tests (unit + Storybook) - ~4s
npm run test:unit         # Unit tests only (fast) - ~1.7s  
npm run test:stories      # Storybook component tests - ~2s
npm run test:unit:watch   # Watch mode for development
npm run test:watch        # Continuous testing (all tests)
```

### High-Leverage Tests (Essential)
- **`selectors.test.ts`** - Mastery calculation algorithm (+20/-20% logic)
- **`reducers.test.ts`** - Redux state mutations and integrity  
- **`sessionGen.test.ts`** - Weighted word selection algorithm
- **`HomePage.stories.jsx`** - Visual/interaction component testing

**Total: 10 critical tests in ~2 seconds**

### Test Architecture
- **Unit Tests**: `vitest.config.unit.ts` - Fast jsdom-based testing
- **Component Tests**: `vite.config.ts` - Browser-based Storybook integration
- **Auto-run**: All tests run on every commit via pre-commit hooks
- **Git Integration**: Tests must pass before commits are allowed

## 🎨 Development Tools

### Storybook & Component Development
This project uses Storybook to develop and test presentation components in isolation (stories live under `src/app/ui/*.stories.*`).

### Interactive Diagnostics
During development you can open an interactive Diagnostics panel in the running app by appending `#diagnostics` to the URL (e.g. `http://localhost:5173/#diagnostics`). The Diagnostics view provides:
- Live JSON state viewer
- Quick controls for switching users  
- Session creation and management
- Attempt simulation for testing reducers

## 🏗️ Architecture

### Redux-First Design
- **Calculations** (`selectors.ts`): Pure functions for domain logic and mastery calculation
- **Actions** (`slice.ts`): State mutations with minimal logic
- **Data** (`state.ts`): Immutable data structures and type definitions
- **Presentation**: Pure UI components tested in Storybook isolation

## Developer Notes

- Hard-coded human names (for example `Mishika`, `Eva`, `user1`) were removed from core `src/` code. The app now stores users by opaque `userId` keys and an optional `displayName` for UI labels.
- On first run the app shows an Onboarding screen to create the initial user rather than baking a default user into the app state.
- A fast Vitest detection test was added to `src/features/game/__tests__/noHardcodedUserNames.test.ts` that scans `src/` (excluding `__tests__` and `src/assets`) to prevent re-introducing forbidden literal names into source files. Keep test fixtures and sample user names inside `__tests__` only.

### Session Management
- **Fixed Session Size**: All practice sessions contain exactly 12 questions for consistent experience
- **Progressive Learning**: Words filtered by current complexity level only - no mixing of difficulty levels
- **Proper Learning Path**: Students must master current level before advancing to harder content
- **Simplified UX**: No configuration dropdowns - focus on learning, not settings

### Multi-Language Support
- **Kannada Script**: Proper Unicode rendering with 100+ curated words
- **Transliterations**: Hindi and English transliterations as learning hints  
- **Language Filtering**: User preferences for English, Kannada, Math Tables, or Human Body modes
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
