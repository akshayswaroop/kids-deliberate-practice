# Unified Question Bank Schema

## Standard Schema
All question banks should follow this unified JSON structure:

```json
[
  {
    "id": "unique_identifier",
    "complexity": 1,
    "question": "The main content to display (text, word, problem, etc.)",
    "answer": "The correct answer or translation (optional)",
    "notes": "Additional explanation or context (optional)"
  }
]
```

## Field Definitions

- **id** (required): Unique identifier within the bank
- **complexity** (required): Difficulty level (1-10 scale)
- **question** (required): The primary content to display to the user
- **answer** (optional): The correct answer when revealed
- **notes** (optional): Additional explanation or learning context

## Benefits

1. **Consistency**: All banks use the same core fields
2. **Simplicity**: Minimal schema makes it easy to create new question banks
3. **Generic Processing**: Single loader can handle any standardized bank
4. **Clear Structure**: Just 5 simple fields cover all use cases