#!/usr/bin/env node
/**
 * Pre-generate WAV audio files for Kannada words using Sarvam TTS API.
 * 
 * Usage:
 *   SARVAM_API_KEY=<key> node scripts/generate-kannada-audio.mjs
 * 
 * This script:
 * 1. Reads Kannada word banks (words and alphabets)
 * 2. Calls Sarvam TTS API with Anushka voice at 0.5x pace
 * 3. Saves WAV files to public/audio/kannada/{id}.wav
 * 4. Logs progress and handles errors gracefully
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio', 'kannada');
const WORD_BANK_PATH = path.join(__dirname, '..', 'src', 'assets', 'kannada_words_bank.json');
const ALPHABET_BANK_PATH = path.join(__dirname, '..', 'src', 'assets', 'kannada_alphabets_bank.json');

// TTS settings (matching hardcoded UI values)
const TTS_SPEAKER = 'anushka';
const TTS_PACE = 0.5;
const TTS_MODEL = 'bulbul:v2';
const TTS_LANGUAGE = 'kn-IN';

// Rate limiting (to avoid overwhelming API)
const DELAY_MS = 500; // 500ms between requests

/**
 * Ensure output directory exists
 */
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${OUTPUT_DIR}`);
  }
}

/**
 * Call Sarvam TTS API
 */
async function synthesizeSpeech(text, id) {
  if (!SARVAM_API_KEY) {
    throw new Error('SARVAM_API_KEY environment variable is required');
  }

  const body = {
    text,
    target_language_code: TTS_LANGUAGE,
    speaker: TTS_SPEAKER,
    enable_preprocessing: true,
    pace: TTS_PACE,
    model: TTS_MODEL,
  };

  const response = await fetch(SARVAM_TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Subscription-Key': SARVAM_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TTS API failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  // Handle both response shapes (audio vs audios[])
  const base64Audio = data.audios?.[0] || data.audio;
  
  if (!base64Audio) {
    throw new Error('No audio data in response');
  }

  return base64Audio;
}

/**
 * Save base64 audio to WAV file
 */
function saveAudioFile(base64Audio, id) {
  const buffer = Buffer.from(base64Audio, 'base64');
  const filePath = path.join(OUTPUT_DIR, `${id}.wav`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

/**
 * Process a single word/alphabet entry
 */
async function processEntry(entry, index, total, bankName) {
  const { id, question } = entry;
  
  // Skip if file already exists
  const outputPath = path.join(OUTPUT_DIR, `${id}.wav`);
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  [${index + 1}/${total}] ${bankName} - ${id}: Already exists, skipping`);
    return { id, status: 'skipped', text: question };
  }

  try {
    console.log(`🎵 [${index + 1}/${total}] ${bankName} - ${id}: Generating audio for "${question}"...`);
    
    const base64Audio = await synthesizeSpeech(question, id);
    const filePath = saveAudioFile(base64Audio, id);
    
    console.log(`✅ [${index + 1}/${total}] ${bankName} - ${id}: Saved to ${filePath}`);
    
    return { id, status: 'success', text: question, filePath };
  } catch (error) {
    console.error(`❌ [${index + 1}/${total}] ${bankName} - ${id}: Failed - ${error.message}`);
    return { id, status: 'error', text: question, error: error.message };
  }
}

/**
 * Add delay between requests
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process a word bank file
 */
async function processWordBank(filePath, bankName) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  ${bankName} not found: ${filePath}`);
    return { processed: 0, skipped: 0, failed: 0 };
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const entries = Array.isArray(data) ? data : [];
  
  console.log(`\n📚 Processing ${bankName}: ${entries.length} entries`);
  
  const results = {
    processed: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const result = await processEntry(entry, i, entries.length, bankName);
    
    if (result.status === 'success') {
      results.processed++;
    } else if (result.status === 'skipped') {
      results.skipped++;
    } else if (result.status === 'error') {
      results.failed++;
      results.errors.push({ id: result.id, text: result.text, error: result.error });
    }
    
    // Rate limiting: delay between requests (skip delay for skipped entries)
    if (result.status === 'success' && i < entries.length - 1) {
      await delay(DELAY_MS);
    }
  }

  return results;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Kannada Audio Pre-Generation Script');
  console.log('=====================================\n');
  
  if (!SARVAM_API_KEY) {
    console.error('❌ Error: SARVAM_API_KEY environment variable is required');
    console.error('Usage: SARVAM_API_KEY=<key> node scripts/generate-kannada-audio.mjs');
    process.exit(1);
  }

  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🎤 TTS settings: speaker=${TTS_SPEAKER}, pace=${TTS_PACE}, model=${TTS_MODEL}\n`);

  // Ensure output directory exists
  ensureOutputDir();

  // Process both word banks
  const wordResults = await processWordBank(WORD_BANK_PATH, 'Kannada Words');
  const alphabetResults = await processWordBank(ALPHABET_BANK_PATH, 'Kannada Alphabets');

  // Summary
  console.log('\n\n📊 Summary');
  console.log('==========');
  console.log(`Kannada Words:     ${wordResults.processed} generated, ${wordResults.skipped} skipped, ${wordResults.failed} failed`);
  console.log(`Kannada Alphabets: ${alphabetResults.processed} generated, ${alphabetResults.skipped} skipped, ${alphabetResults.failed} failed`);
  
  const totalProcessed = wordResults.processed + alphabetResults.processed;
  const totalSkipped = wordResults.skipped + alphabetResults.skipped;
  const totalFailed = wordResults.failed + alphabetResults.failed;
  
  console.log(`\nTotal: ${totalProcessed} generated, ${totalSkipped} skipped, ${totalFailed} failed`);

  // Show errors if any
  if (totalFailed > 0) {
    console.log('\n\n❌ Errors:');
    [...wordResults.errors, ...alphabetResults.errors].forEach(err => {
      console.log(`  - ${err.id} ("${err.text}"): ${err.error}`);
    });
  }

  console.log('\n✨ Done!');
  
  // Exit with error code if there were failures
  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
