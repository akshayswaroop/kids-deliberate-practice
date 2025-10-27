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
    threads: false,
    pool: {
      type: 'forks'
    },
    // 📊 Visual Reporting Configuration
    reporters: [
      'default', // Keep console output
      'json'     // Generate JSON for other tools
    ],
    outputFile: {
      json: './.reports/vitest/results.json'
    },
    // 🎯 UI Configuration
    ui: false,
  },
});
