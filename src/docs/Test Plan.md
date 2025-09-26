## Test Plan & Strategy

### 🎯 High-Leverage Tests (Essential - Run Always)

#### Core Business Logic (3 test files, 9 tests, ~0.8s)
- **`selectors.test.ts`** (4 tests) - **CRITICAL**
  - Mastery calculation: Clamped between 0-100, ±20% per attempt
  - Word bucket classification: new/struggle/mastered buckets
  - Current word and session progress selectors
- **`reducers.test.ts`** (4 tests) - **CRITICAL** 
  - Redux state mutations: attempt(), nextCard(), user management
  - State integrity and immutability validation
- **`sessionGen.test.ts`** (1 test) - **HIGH VALUE**
  - Deterministic weighted word selection using seeded RNG
  - Bucket distribution and selection algorithm

#### Component Testing (1 test, ~2s)
- **`HomePage.stories.jsx`** (1 test) - **HIGH VALUE**
  - Visual/interaction testing via Storybook + Playwright
  - Component rendering and user interactions

**Total Essential Tests: 10 tests in ~2.8 seconds**

### 📊 Medium-Value Tests (Run Less Frequently)

- **`sessionFlow.test.ts`** (1 test, 32ms) - End-to-end learning progression  
- **`multiUserPersistence.test.ts`** (1 test, 11ms) - Multi-user state isolation

### 🗑️ Low-Priority Tests (Consider Removing)

- **`homepageFlow.test.ts`** (2 tests) - Redundant with reducers.test.ts
- **`noHardcodedUserNames.test.ts`** (1 test) - Should be ESLint rule instead

### 🚀 Test Commands

```bash
# Essential daily workflow
npm run test:unit         # All unit tests (14 tests, ~1.4s)
npm run test:all          # Unit + Storybook (15 tests, ~4s)

# Development workflow  
npm run test:unit:watch   # Watch mode for TDD
npm run test:stories      # Storybook component tests only

# Focus testing (just the essentials)
npx vitest run --config vitest.config.unit.ts src/features/game/__tests__/selectors.test.ts src/features/game/__tests__/reducers.test.ts src/features/game/__tests__/sessionGen.test.ts
```

### 🔧 Test Architecture

#### Separated Configurations
- **`vitest.config.unit.ts`** - Fast jsdom unit tests
- **`vite.config.ts`** - Browser-based Storybook integration tests

#### Test Categories
- **Calculations**: Pure business logic in selectors (no side effects)
- **Actions**: State mutations in reducers (minimal logic)  
- **Presentation**: UI components via Storybook (visual testing)

### Manual Testing
Use the Storybook stories and the built-in onboarding flow to verify manual scenarios. The previous Diagnostics panel was removed; use the Storybook stories and `#diagnostics` no longer applies.