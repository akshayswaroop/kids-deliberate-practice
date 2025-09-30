/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Simple unit test configuration - separate from Storybook tests
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.shims.d.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['src/**/*.stories.*', 'node_modules/**'],
    // 📊 Visual Reporting Configuration
    reporters: [
      'default', // Keep console output
      'html',    // Generate HTML report
      'json'     // Generate JSON for other tools
    ],
    outputFile: {
      html: './test-results/index.html',
      json: './test-results/results.json'
    },
    // 🎯 UI Configuration
    ui: true,
    open: false, // Don't auto-open browser
  },
});