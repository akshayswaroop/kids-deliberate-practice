# Kids Deliberate Practice - Multi-Language Learning App

A Redux-first React application for deliberate practice with spaced repetition, supporting both English and Kannada languages with proper script display and transliterations.

## ✨ Features

- **Multi-language Support**: English and Kannada words with proper Unicode script rendering
- **Spaced Repetition**: Intelligent algorithm for optimal learning retention
- **Multi-user Profiles**: Separate progress tracking for different users (Mishika, Eva, Akshay)
- **Responsive UI**: Optimized layout with CSS Grid and responsive bubble sizing
- **Progress Tracking**: Visual mastery indicators with rainbow gradient progress bubbles
- **Language Modes**: Switch between English-only, Kannada-only, or mixed practice modes

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Launch Storybook for component development
npm run storybook
```

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

### Multi-Language Support
- **Kannada Script**: Proper Unicode rendering with 100+ curated words
- **Transliterations**: Hindi and English transliterations as learning hints  
- **Language Filtering**: User preferences for English, Kannada, or mixed modes
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
