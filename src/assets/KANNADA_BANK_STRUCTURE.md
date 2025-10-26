# Kannada Learning Bank Structure

## Overview
The `kannada_words_bank.json` now contains a merged, pedagogically-ordered curriculum combining alphabets and words for progressive Kannada learning.

## Learning Progression (547 total entries)

### 1. **Vowels (Swaragalu)** - 15 entries
- **Complexity**: 1
- **Answer Format**: English phonetic descriptions
- **Example**: ಅ → "The A sound in ABOUT"
- **Construction Mode**: ❌ Not available (non-Devanagari answers)
- **Purpose**: Learn basic vowel sounds

### 2. **Consonants (Vyanjanagalu)** - 34 entries  
- **Complexity**: 1-2
- **Answer Format**: English phonetic descriptions
- **Example**: ಕ → "The K sound in KITE"
- **Construction Mode**: ❌ Not available
- **Purpose**: Learn consonant sounds

### 3. **First Simple Words** - 10 entries
- **Complexity**: 1
- **Answer Format**: Devanagari (Hindi transliteration)
- **Examples**: 
  - ರಾಮ → राम (Rama)
  - ನಲ → नल (Nala)
  - ದಿನ → दिन (Din)
- **Construction Mode**: ✅ Available
- **Purpose**: Early application of learned sounds, maintain engagement

### 4. **Matras (Diacritics)** - 12 entries
- **Complexity**: 3
- **Answer Format**: Mixed (Hindi matra + English sound)
- **Example**: ಾ → "Hindi Matra: ा | Sound: aa"
- **Construction Mode**: ❌ Not available
- **Purpose**: Understand vowel diacritics

### 5. **Barakhadi Combinations (Initial)** - 50 entries
- **Complexity**: 2-3
- **Answer Format**: Devanagari combinations
- **Example**: ಕಾ → का (Ka + aa matra)
- **Construction Mode**: ✅ Available (if answer is pure Devanagari)
- **Purpose**: Practice consonant + matra combinations

### 6. **Remaining Simple Words** - 2 entries
- **Complexity**: 1
- **Answer Format**: Devanagari
- **Construction Mode**: ✅ Available
- **Purpose**: Reinforce word-building skills

### 7. **Full Barakhadi** - 358 remaining entries
- **Complexity**: 2-4
- **Answer Format**: Devanagari
- **Construction Mode**: ✅ Available
- **Purpose**: Complete mastery of all consonant-vowel combinations

### 8. **Medium Complexity Words** - 30 entries
- **Complexity**: 2
- **Answer Format**: Devanagari
- **Examples**:
  - Multi-syllable words
  - Common phrases
- **Construction Mode**: ✅ Available
- **Purpose**: Build fluency with longer words

### 9. **Complex Words** - 36 entries
- **Complexity**: 3+
- **Answer Format**: Devanagari
- **Examples**:
  - Advanced vocabulary
  - Compound words
- **Construction Mode**: ✅ Available
- **Purpose**: Advanced reading practice

## Technical Details

### Construction Mode Availability
Construction mode is automatically enabled when:
1. Mode is 'kannada'
2. Answer contains Devanagari script (Unicode range U+0900-U+097F)
3. Card status is 'idle'

The system detects Devanagari using regex: `/[\u0900-\u097F]/`

### Answer Format Types
1. **English phonetics**: "The [sound] in [word]"
2. **Pure Devanagari**: "राम"
3. **Mixed**: "Hindi Matra: ा | Sound: aa"
4. **With transliteration notes**: Devanagari + "Transliteration: Rāma"

### Backup
Original words-only bank preserved at: `kannada_words_bank.backup.json`

## Pedagogical Rationale

**Why This Order?**
1. **Foundation First**: Vowels and consonants provide sound recognition
2. **Early Success**: Simple words after 49 letters prevents fatigue, demonstrates practical application
3. **Building Blocks**: Matras and barakhadi teach script mechanics systematically  
4. **Gradual Complexity**: Progress from letters → syllables → simple words → complex words
5. **Spaced Practice**: Spaced repetition algorithm handles review timing automatically

**Construction Mode Strategy**:
- Only available for Devanagari answers (words, not phonetic descriptions)
- Teaches script structure through interactive assembly
- Reinforces matra decomposition (e.g., आज = अ + ा + ज)
