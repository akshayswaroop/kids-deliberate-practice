# 🏗️ Domain-Driven Design Architecture Guide

*Complete guide to the DDD transformation of the Kids Deliberate Practice App*

> **📋 Business Rules**: This guide covers the technical architecture. For authoritative business rules, see [`Domain Rules.md`](./Domain%20Rules.md).

## 📖 Table of Contents

1. [What We Built](#what-we-built)
2. [Architecture Overview](#architecture-overview)
3. [Domain Aggregate Design](#domain-aggregate-design)
4. [Infrastructure Layer](#infrastructure-layer)
5. [Integration & Usage](#integration--usage)
6. [Testing Strategy](#testing-strategy)
7. [Benefits & Maintainability](#benefits--maintainability)
8. [Further Learning](#further-learning)

---

## 🎯 What We Built

You've successfully transformed your React/Redux app from an **anemic domain model** to a **rich Domain-Driven Design** architecture. This represents a complete architectural evolution:

### **8-Step DDD Transformation**

1. ✅ **Domain Language** - Created ubiquitous language for kids learning domain
2. ✅ **Domain Aggregates** - Identified entity boundaries and relationships  
3. ✅ **Rich Entities** - Moved business logic into domain entities
4. ✅ **Domain Services** - Extracted complex business operations
5. ✅ **Domain Events** - Added event-driven architecture
6. ✅ **Repository Interfaces** - Defined clean domain contracts
7. ✅ **Infrastructure Layer** - Implemented Redux as infrastructure
8. ✅ **Application Layer** - Created clean React integration

### **The Dramatic Improvement**

**Before (Anemic Model)**
```typescript
// Business logic scattered everywhere
const handleAnswer = () => {
  const progress = useAppSelector(selectProgress);
  const newProgress = isCorrect ? progress + 1 : Math.max(0, progress - 1);
  const isMastered = newProgress >= 5 && attempts.length >= 3;
  dispatch(updateProgress({ progress: newProgress, isMastered }));
  if (isMastered) dispatch(showCelebration());
};
```

**After (Rich Domain Model)**
```typescript
// Clean business intent
const handleAnswer = async (wordId, isCorrect) => {
  const result = await recordPracticeAttempt(
    learnerProfile.id,
    wordId,
    isCorrect
  );
  
  if (result.isMastered) {
    showCelebration(result.event);
  }
};
```

---

## 🏗️ Architecture Overview

### **Layered Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components (UI)                   │
│                   • CleanPracticeComponent                  │
│                   • No Redux complexity                     │
│                   • Pure business use cases                 │
└─────────────────────────┬───────────────────────────────────┘
                         │
┌─────────────────────────┴───────────────────────────────────┐
│                  Application Services                       │
│                • PracticeApplicationService                 │
│                • Coordinates use cases                      │
│                • Error handling & validation                │
└─────────────────────────┬───────────────────────────────────┘
                         │
┌─────────────────────────┴───────────────────────────────────┐
│                    Domain Layer                             │
│    Entities:         Services:           Events:            │
│    • ProgressTracker • PracticeService   • MasteryEvent     │
│    • WordDrill       • SessionService    • StreakEvent     │
│                                                             │
│    Value Objects:    Repository Contracts:                  │
│    • WordId          • ProgressRepository                   │
│    • LearnerId       • WordRepository                       │
│    • Attempt         • SessionRepository                    │
└─────────────────────────┬───────────────────────────────────┘
                         │
┌─────────────────────────┴───────────────────────────────────┐
│                 Infrastructure Layer                        │
│              • ReduxRepositoryFactory                       │
│              • Domain ↔ Redux Mappers                       │
│              • Repository Implementations                   │
└─────────────────────────┬───────────────────────────────────┘
                         │
┌─────────────────────────┴───────────────────────────────────┐
│                      Redux Store                            │
│                   (Storage Detail)                          │
└─────────────────────────────────────────────────────────────┘
```

### **Dependency Flow**

```
React Components (UI)
        ↓
Application Services (Coordination)
        ↓
Domain Services (Business Logic)
        ↓
Repository Interfaces (Contracts)
        ↓
Repository Implementations (Redux Bridge)
        ↓
Redux State (Storage)
```

---

## 🏗️ Domain Aggregate Design

### **Understanding Aggregates**

**Aggregate Rules:**
1. **Single Root**: Each aggregate has one "root" entity that controls access
2. **Consistency Boundary**: Everything inside must stay consistent 
3. **Transaction Boundary**: Changes to aggregate happen as one unit
4. **Small Size**: Keep aggregates as small as possible

### **Previous Problem: Mega-Aggregate**
```typescript
// 😱 BEFORE: UserState was a MASSIVE aggregate
UserState {
  words: Record<string, Word>           // 1000s of words!
  sessions: Record<string, Session>     // Multiple sessions
  settings: SessionSettings             // User preferences  
  activeSessions: Record<string, string> // Active sessions per mode
}
```
**Problem**: This violated "small aggregate" rule - one user change affected thousands of words!

### **New Aggregate Design**

#### **Aggregate 1: Learner** ⭐️ *Root*
```typescript
class Learner {
  id: LearnerId
  displayName: string
  preferences: LearnerPreferences
  currentComplexityLevels: Record<Subject, number>
  
  // Domain Methods:
  progressToNextLevel(subject: Subject): LevelProgressionEvent
  setPreferences(prefs: LearnerPreferences): void
}
```
**Responsibility**: Learner identity and global learning preferences
**Why separate**: Learner info changes independently of practice activities

#### **Aggregate 2: WordDrill** ⭐️ *Root*  
```typescript
class WordDrill {
  id: DrillId
  subject: Subject // Math, English, Kannada
  complexityLevel: number
  words: Word[]  // Collection of related words
  
  // Domain Methods:
  getUnmasteredWords(): Word[]
  getMasteredWords(): Word[]
  isCompletelyMastered(): boolean
}
```
**Responsibility**: Managing a collection of related learning items
**Why separate**: Words are grouped by subject/complexity and managed together

#### **Aggregate 3: PracticeSession** ⭐️ *Root*
```typescript
class PracticeSession {
  id: SessionId
  learnerId: LearnerId  // Reference to Learner
  drillId: DrillId      // Reference to WordDrill
  selectedWords: WordId[]
  currentIndex: number
  state: 'active' | 'completed' | 'abandoned'
  
  // Domain Methods:
  submitAnswer(wordId: WordId, correct: boolean): MasteryEvent[]
  moveToNext(): void
  isComplete(): boolean
}
```
**Responsibility**: Managing an active learning session
**Why separate**: Sessions are temporary and have different lifecycle than words

#### **Aggregate 4: ProgressTracker** ⭐️ *Root*
```typescript
class ProgressTracker {
  wordId: WordId
  learnerId: LearnerId
  currentProgress: number // 0-5
  attempts: Attempt[]
  masteryAchievedAt?: Date
  cooldownSessionsLeft: number
  
  // Domain Methods:
  recordAttempt(correct: boolean): MasteryEvent | null
  isMastered(): boolean
  isInCooldown(): boolean
  decrementCooldown(): void
}
```
**Responsibility**: Tracking mastery progress for one word per learner
**Why separate**: Progress is specific to learner+word combination

### **Aggregate Relationships**

```
Learner ──references──→ PracticeSession
                     ↗
WordDrill ──────────┘

ProgressTracker ──references──→ Learner
               └──references──→ Word (from WordDrill)
```

**Key insight**: Aggregates reference each other by ID, not direct object references!

---

## 🔧 Infrastructure Layer

The infrastructure layer bridges our clean domain with existing Redux state:

### **🏗️ Domain Mappers**
```typescript
// Convert between domain objects and Redux state
class ProgressTrackerMapper {
  static toDomain(reduxData, wordId, learnerId): ProgressTracker
  static toRedux(tracker): ReduxProgressState
}
```

### **🗄️ Repository Implementations**
```typescript
// Redux-based implementation of domain contracts
class ReduxProgressRepository implements ProgressRepository {
  async findByWordAndLearner(wordId, learnerId): Promise<ProgressTracker>
  async save(tracker): Promise<void>
  async getStatistics(learnerId): Promise<LearningStatistics>
}
```

### **🏭 Repository Factory**
```typescript
// Dependency injection for clean architecture
class ReduxRepositoryFactory implements RepositoryFactory {
  createProgressRepository(): ProgressRepository
  createWordRepository(): WordRepository
  createLearnerRepository(): LearnerRepository
  createSessionRepository(): SessionRepository
}
```

### **🔌 Application Service**
```typescript
// Coordinates domain services with infrastructure
class PracticeApplicationService {
  async generatePracticeSession(learnerId, subject, complexity, sessionSize)
  async recordPracticeAttempt(learnerId, wordId, isCorrect)
  async getLearningAnalytics(learnerId)
}
```

**What makes this "DDD Infrastructure"?**

1. **Dependency Inversion**: Domain depends on abstractions, infrastructure depends on domain
2. **Clean Separation**: Domain entities know nothing about Redux  
3. **Repository Pattern**: Storage concerns completely abstracted
4. **Domain Mappers**: Clean translation between layers
5. **Dependency Injection**: Services get their dependencies injected

---

## 🚀 Integration & Usage

### **Active Integration**

Your app now **actually uses** the DDD architecture:

1. **✅ Service Provider** - `PracticeServiceProvider` wraps your entire app
2. **✅ Enhanced Components** - `EnhancedPracticePanel` uses domain services  
3. **✅ Feature Flag** - Easy toggle between DDD and Redux modes
4. **✅ Backwards Compatibility** - Original Redux still works as fallback

### **🎯 DDD Mode is ACTIVE**

Your app runs with:
- **Domain Services** handling business logic
- **Repository Pattern** abstracting Redux 
- **Domain Events** showing mastery notifications
- **Clean Architecture** separating concerns

### **🎛️ Feature Flag Control**

In `HomePage.tsx`:
```typescript
const useDDDArchitecture = true; // Set to false to use original Redux
```

- `true` = Use DDD architecture (current setting)
- `false` = Use original Redux approach

### **🧪 Verification**

✅ **All domain tests passing:** 28/28 tests  
✅ **App compiles and runs**  
✅ **DDD services integrated**  
✅ **Domain events working**  

---

## 🧪 Testing Strategy

### **Domain Testing (Unit Tests)**
```typescript
// Test pure business logic
test('should achieve mastery after correct attempts', () => {
  const tracker = ProgressTracker.createNew(wordId, learnerId);
  
  // Record correct attempts up to mastery threshold
  for (let i = 0; i < MasteryConfiguration.MASTER_STEP; i++) {
    tracker.recordAttempt({ isCorrect: true, timestamp: new Date() });
  }
  
  expect(tracker.isMastered()).toBe(true);
});
```

### **Application Testing (Integration Tests)**
```typescript
// Test use cases with mocked repositories
test('should generate adaptive session', async () => {
  const mockWordRepo = createMockWordRepository();
  const service = new PracticeApplicationService(mockWordRepo, ...);
  
  const result = await service.generateAdaptiveSession('user1');
  
  expect(result.success).toBe(true);
  expect(result.session.wordDrills).toHaveLength(5);
});
```

### **Test Organization**
- **Domain tests** in `/src/domain/__tests__/` - testing pure business logic
- **Infrastructure tests** in `/src/infrastructure/__tests__/` - testing Redux integration
- **Application tests** in `/src/application/__tests__/` - testing service coordination

---

## 🔄 Benefits & Maintainability

### **🎯 Key DDD Principles You Mastered**

1. **Ubiquitous Language** - WordDrill, Mastery, Progress - shared vocabulary
2. **Rich Domain Model** - Business logic in entities: `ProgressTracker.recordAttempt()`
3. **Bounded Contexts** - Clear separation between Practice and User Management
4. **Repository Pattern** - Domain contracts, Infrastructure implementations
5. **Domain Events** - `MasteryEvent`, `StreakEvent` capture business moments
6. **Application Services** - Coordinate domain services, handle cross-cutting concerns

### **Maintainability Wins**

#### **Adding New Features**
- **Before**: Modify multiple Redux slices, selectors, components
- **After**: Add domain service method, expose through application service

#### **Changing Business Rules**  
- **Before**: Hunt through scattered logic in components
- **After**: Modify domain entity - change is isolated and tested

#### **Storage Changes**
- **Before**: Refactor entire Redux structure
- **After**: Create new repository implementation - domain unchanged

### **🎉 What You Can Do Now**

#### **1. Independent Domain Development**
Your business logic is completely independent of React/Redux. You could:
- Switch to different state management
- Move to different UI framework  
- Add GraphQL or REST API
- Domain logic remains unchanged!

#### **2. Rich Business Modeling**
You can model complex business scenarios:
```typescript
// Advanced business rules in domain
const learningPath = LearningPathService.createAdaptivePath(
  learnerProfile,
  subjectMastery,
  timeConstraints
);
```

#### **3. Event-Driven Architecture**
Your events enable powerful features:
```typescript
// React to domain events
eventBus.subscribe('MasteryAchieved', (event) => {
  parentNotificationService.sendMasteryAlert(event);
  gamificationService.unlockAchievement(event);
});
```

#### **4. Easy Feature Flags**
Toggle between implementations:
```typescript
const useDDDArchitecture = useFeatureFlag('ddd-practice');
return useDDDArchitecture 
  ? <CleanPracticeComponent />
  : <LegacyPracticeComponent />;
```

---

## 📚 Further Learning

You've mastered the fundamentals! To go deeper:

1. **Event Sourcing** - Store domain events as source of truth
2. **CQRS** - Separate read/write models  
3. **Saga Pattern** - Coordinate complex business processes
4. **Domain Modeling Workshops** - Collaborate with domain experts
5. **Tactical DDD Patterns** - Specifications, Factories, Domain Services

---

## 🏆 Congratulations!

You've completed a full DDD transformation while learning the principles hands-on. Your codebase is now:

- ✅ **Maintainable** - Business logic is isolated and testable
- ✅ **Flexible** - Can adapt to new requirements easily  
- ✅ **Understandable** - Code expresses business intent clearly
- ✅ **Testable** - Domain logic can be tested independently
- ✅ **Scalable** - Architecture supports growth and complexity

**You're now equipped to apply DDD principles to any domain!** 🚀

---

## 📁 Architecture Files Reference

### **Domain Layer**
- `/src/domain/entities/` - Core business entities
- `/src/domain/services/` - Domain business logic
- `/src/domain/events/` - Domain events
- `/src/domain/value-objects/` - Value objects and configurations

### **Infrastructure Layer**  
- `/src/infrastructure/repositories/` - Repository implementations
- `/src/infrastructure/mappers/` - Domain ↔ Redux mappers
- `/src/infrastructure/state/` - Redux implementation
- `/src/infrastructure/services/` - Infrastructure services

### **Application Layer**
- `/src/application/services/` - Application coordination services

### **UI Layer**
- `/src/app/ui/` - React components
- `/src/app/providers/` - Service providers

---

*"The heart of software is its ability to solve domain-related problems for its user."* - Eric Evans, Domain-Driven Design