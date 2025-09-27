// Runtime Error Detection Script
// Use this script to systematically check for browser console errors

import { chromium } from 'playwright';

async function checkRuntimeErrors(url = 'http://localhost:5173') {
  console.log('🔍 Checking for runtime errors...');
  
  let hasErrors = false;
  const errors = [];
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const error = `CONSOLE ERROR: ${msg.text()}`;
      errors.push(error);
      console.log(`❌ ${error}`);
      hasErrors = true;
    }
  });
  
  // Listen for page errors  
  page.on('pageerror', err => {
    const error = `PAGE ERROR: ${err.message}`;
    errors.push(error);
    console.log(`❌ ${error}`);
    hasErrors = true;
  });
  
  // Listen for network errors
  page.on('response', response => {
    if (response.status() >= 400) {
      const error = `NETWORK ERROR: ${response.status()} ${response.url()}`;
      errors.push(error);
      console.log(`❌ ${error}`);
      hasErrors = true;
    }
  });
  
  try {
    console.log(`📡 Navigating to ${url}...`);
    await page.goto(url, { 
      waitUntil: 'networkidle', 
      timeout: 10000 
    });
    
    // Wait for any async errors to appear
    await page.waitForTimeout(3000);
    
    if (!hasErrors) {
      console.log('✅ No runtime errors detected');
    } else {
      console.log(`\n📊 Summary: ${errors.length} error(s) found:`);
      errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
  } catch (err) {
    console.log(`❌ NAVIGATION FAILED: ${err.message}`);
    hasErrors = true;
  }
  
  await browser.close();
  
  if (hasErrors) {
    console.log('\n🚨 Runtime errors detected! Fix these before proceeding.');
    process.exit(1);
  } else {
    console.log('\n🎉 Runtime validation passed!');
    process.exit(0);
  }
}

// Run if called directly
const url = process.argv[2] || 'http://localhost:5173';
checkRuntimeErrors(url).catch(err => {
  console.error('❌ Script failed:', err.message);
  process.exit(1);
});