# 📖 Ubiquitous Language Glossary
*Domain-Driven Design vocabulary for the Kids Deliberate Practice App*

> **📋 Authoritative Rules**: For the complete business rules, see [`Domain Rules.md`](./Domain%20Rules.md) - this glossary provides DDD context and technical implementation details for those rules.

## 🎯 **Core Learning Concepts**

### **Word**
A single learning item (question, vocabulary word, math problem, etc.) that tracks mastery progress through steps (0-5).

### **Progress** 
Progress counter showing how well a child knows a word. Correct answer → +1 progress (max 5), wrong answer → -1 progress (min 0). Progress ≥ 2 = **Mastered**.

### **Mastery**
When a child has learned a word well enough (progress ≥ 2). Mastered words enter cooldown cycle.

### **Complexity Level**
Difficulty ranking of words (Level 1 = easiest, Level 2 = harder). Children progress through complexity levels sequentially.

### **Practice Session**
A focused learning activity with up to 12 words. Contains only unmastered words from current complexity level. Shows fewer than 12 if not enough unmastered words remain.

### **Cooldown**
Waiting period before mastered words appear for revision.

### **Level Progression**
Advancing to harder material after mastering current complexity level. Auto-progress when ALL words in current complexity level are mastered.

### **Word Drills**
Collections of related words grouped by subject and complexity. Words within drills share the same subject and complexity level.

---

*This glossary defines the shared vocabulary between developers and domain experts. For detailed business rules and examples, see [`Domain Rules.md`](./Domain%20Rules.md).*