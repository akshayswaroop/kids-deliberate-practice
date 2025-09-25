# Kids Deliberate Practice - AI Coding Instructions

## Architecture Overview

This is a **Redux-first React app** for language learning with spaced repetition. The architecture enforces strict separation of concerns inspired by "Grokking Simplicity":

- **Calculations** (`src/features/game/selectors.ts`): Pure functions, domain logic, no side effects
- **Actions** (`src/features/game/slice.ts`): State changes with side effects, minimal logic
- **Data** (`src/features/game/state.ts`): Immutable data structures, type definitions
- **Presentation Components**: Pure UI components that render props, no business logic

**Storybook-Driven UI Development**: All presentation components are developed in isolation using Storybook, with comprehensive stories covering edge cases, state variations, and interactive testing scenarios.

## State Structure

Multi-user game state persisted to localStorage:
```typescript
RootState {
  users: Record<userId, UserState>
  currentUserId: string
}

UserState {
  words: Record<wordId, Word>      // All vocabulary with attempts history
  sessions: Record<sessionId, Session>  // Practice sessions
  activeSessions: Record<mode, sessionId>  // Current session per mode
  settings: SessionSettings        // User preferences
}
```

## Core Domain Rules

**Mastery Calculation** (always derived, never stored):
- Each correct: +20%, wrong: -20%, clamped 0-100%
- Implemented in `selectMasteryPercent()` selector

**Session Selection Buckets**:
- **New**: `attempts.length === 0`
- **Struggle**: `mastery < 60%`  
- **Mastered**: `mastery === 100%` AND `now >= nextReviewAt`

**Language Support**: 
- English words from `assets/words.en.json`
- Kannada words with transliteration from `kannadaWords.ts`
- Filter by language preferences in user settings

## Development Patterns

**Functional Programming (Grokking Simplicity principles)**:
- **Pure Calculations**: All domain logic in selectors, deterministic, testable
- **Controlled Actions**: State mutations isolated to reducers, minimal logic
- **Immutable Data**: No direct state mutation, use Immer via Redux Toolkit
- **Presentation Components**: UI components receive all data as props, no hooks or logic
- **Stratified Design**: Clear layers with calculations at bottom, actions in middle, UI at top

**Testing** (Vitest + React Testing Library):
- Unit tests for reducers: `__tests__/reducers.test.ts`
- Domain logic tests for selectors: `__tests__/selectors.test.ts` 
- Use `makeInitial()` helper functions for test state setup
- Test calculations separately from actions for better isolation

**Storybook Development** (configured with React-Vite):
- **Presentation component stories**: `src/app/ui/*.stories.jsx` for UI components
- **Story structure**: Default export with component metadata, named exports for variations
- **Mock props pattern**: Use `generateDummy*()` functions for consistent test data
- **Action logging**: Use Storybook actions for event handlers (`action: 'correct'`)
- **Controls**: Define `argTypes` for interactive property testing
- **Autodocs**: Use `tags: ['autodocs']` for automatic documentation
- **Component variations**: Create stories for different states (Default, Playground, AllVariations)
- **Edge case testing**: Stories like `AllBeginner`, `AllMastered`, `SizeVariations` to test extremes
- **Pure function approach**: Stories test components as pure functions of their props

**State Management**:
- Always use selectors for computed values, never inline calculations
- Persist entire game state on any `game/` action via `persistMiddleware`
- Load state from localStorage on app startup
- Separate business logic (selectors) from state updates (reducers)

**Component Architecture**:
- **Container Components**: Connect to Redux, pass data to presentation components  
- **Presentation Components**: Pure functions of props like `PracticeCard`, `ProgressBubble`
- **Props-only pattern**: All styling via inline styles, no external CSS dependencies
- **Event delegation**: Pass callbacks as props (`onCorrect`, `onWrong`)
- **Accessible components**: Include ARIA labels and semantic HTML

**File Organization**:
- Feature slices in `src/features/game/`
- UI components in `src/app/ui/` with co-located stories
- Shared types in `state.ts`
- Bootstrap logic in `src/app/bootstrapState.ts`
- Domain documentation in `src/docs/`
- Storybook config in `.storybook/`

## Key Commands

```bash
npm run dev          # Start development server
npm run test         # Run Vitest tests
npm run build        # TypeScript compilation + Vite build  
npm run lint         # ESLint with TypeScript support
npm run storybook    # Launch Storybook for component development
```

## Multi-Language Support

When adding new languages:
1. Add language data files to `assets/` (follow `words.en.json` format)
2. Update `bootstrapState.ts` to include new language words
3. Add language option to UI language selector
4. Ensure selectors respect language filtering via `selectWordsByLanguage()`

## Functional Programming Principles ("Grokking Simplicity")

**Calculations vs Actions vs Data**:
- **Calculations**: `selectMasteryPercent()`, `selectWordsByMasteryBucket()` - pure, no side effects
- **Actions**: Redux reducers, localStorage writes, user interactions - controlled side effects  
- **Data**: State types, word definitions, immutable structures

**Key Rules**:
- **Calculations don't call actions** - selectors never trigger state changes
- **Actions can call calculations** - reducers can use pure functions for logic
- **Keep calculations pure** - same input always produces same output
- **Minimize action surface area** - isolate side effects to specific boundaries

**Stratified Design in Practice**:
- **Layer 1 (Data)**: Type definitions in `state.ts`, raw word data in JSON files
- **Layer 2 (Calculations)**: Pure domain logic in selectors, mastery algorithms
- **Layer 3 (Actions)**: State updates in reducers, persistence middleware
- **Layer 4 (UI)**: Presentation components tested in Storybook isolation

## Critical Implementation Details

- **Never store derived values** (mastery, buckets) in state - always calculate via selectors
- **Multi-user persistence**: All changes auto-save to localStorage keyed by current user
- **Session generation**: Use weighted random selection from buckets (see `sessionGen.ts`)
- **Type safety**: Strict TypeScript with proper Redux typing patterns
- **Pure component pattern**: Pass all dependencies as props, no direct Redux connections in presentation components