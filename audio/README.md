# Pre-Generated Audio Assets

This directory contains pre-generated WAV audio files for Kannada words and alphabets, created using the Sarvam TTS API.

## Purpose

Pre-generating audio files provides several benefits:
- **Reduced API costs**: Avoid calling the TTS API at runtime for every word
- **Improved performance**: No API latency for pre-generated words
- **Better offline experience**: Audio works even without API access
- **Consistent quality**: All audio uses the same settings (Anushka voice, 0.5x pace)

## Directory Structure

```
public/audio/
└── kannada/
    ├── rama.wav
    ├── nala.wav
    ├── swaragalu_01.wav
    └── ... (more files)
```

## Generating Audio Files

To generate audio files for all Kannada words and alphabets:

```bash
# Set your Sarvam API key
export SARVAM_API_KEY="your-api-key-here"

# Run the generation script
node scripts/generate-kannada-audio.mjs
```

The script will:
1. Read word banks from `src/assets/kannada_words_bank.json` and `src/assets/kannada_alphabets_bank.json`
2. For each word, call the Sarvam TTS API with these settings:
   - Speaker: Anushka
   - Pace: 0.5x
   - Model: bulbul:v2
   - Language: kn-IN (Kannada)
3. Save WAV files to `public/audio/kannada/{word-id}.wav`
4. Skip files that already exist

### Script Features

- **Progress logging**: Shows which words are being processed
- **Error handling**: Continues processing even if some words fail
- **Rate limiting**: 500ms delay between API calls to avoid overwhelming the API
- **Resume capability**: Skips already-generated files, so you can resume if interrupted

### Script Output

```
🚀 Kannada Audio Pre-Generation Script
=====================================

📁 Output directory: /path/to/public/audio/kannada
🎤 TTS settings: speaker=anushka, pace=0.5, model=bulbul:v2

📚 Processing Kannada Words: 100 entries
🎵 [1/100] Kannada Words - rama: Generating audio for "ರಾಮ"...
✅ [1/100] Kannada Words - rama: Saved to /path/to/public/audio/kannada/rama.wav
...

📊 Summary
==========
Kannada Words:     98 generated, 2 skipped, 0 failed
Kannada Alphabets: 150 generated, 0 skipped, 0 failed

Total: 248 generated, 2 skipped, 0 failed

✨ Done!
```

## How It Works

When the TTS service is called, it follows this priority:

1. **Pre-generated audio**: Check if `public/audio/kannada/{wordId}.wav` exists
   - If found, use it immediately (no API call)
2. **API fallback**: If no pre-generated file exists, call the Sarvam TTS API
   - Creates audio on-demand (requires user API key)

This ensures that:
- Pre-generated words play instantly
- New words added later still work via API
- Users can generate their own audio files if needed

## Git Configuration

By default, audio files are **not tracked in git** (see `.gitignore`). This keeps the repository size small.

To commit a few sample audio files for demo purposes:

```bash
# Force-add specific files (bypasses .gitignore)
git add -f public/audio/kannada/rama.wav
git add -f public/audio/kannada/nala.wav
git commit -m "Add sample pre-generated audio files"
```

Or, to track all audio files, comment out this line in `.gitignore`:

```
# public/audio/
```

## Deployment

When deploying to GitHub Pages or other static hosts:

1. Generate audio files locally (before build/deploy)
2. Commit them to git (or ensure they're included in deployment)
3. The app will automatically use pre-generated files

Example workflow:

```bash
# Generate audio
SARVAM_API_KEY=your-key node scripts/generate-kannada-audio.mjs

# Build and deploy
npm run build
npm run deploy
```

## Maintenance

When adding new Kannada words to the word banks:

1. Add the word to `src/assets/kannada_words_bank.json` or `kannada_alphabets_bank.json`
2. Run the generation script to create audio for the new word
3. The app will automatically use the new audio file

To regenerate all audio files (e.g., after changing TTS settings):

```bash
# Delete existing files
rm -rf public/audio/kannada/*.wav

# Regenerate
SARVAM_API_KEY=your-key node scripts/generate-kannada-audio.mjs
```

## Troubleshooting

**Script fails with "SARVAM_API_KEY environment variable is required"**
- Make sure to export your API key before running the script
- Get an API key from https://www.sarvam.ai/

**Some words fail to generate**
- Check the error message in the script output
- Verify your API key is valid and has sufficient quota
- Try running the script again (it will skip already-generated files)

**Audio files are too large**
- WAV files are uncompressed and relatively large (10-50KB per file)
- For ~200 words, expect ~5-10MB total
- Consider using MP3 encoding instead if size is a concern (requires modifying the script)
