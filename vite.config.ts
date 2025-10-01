/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// Minimal Vite config without Storybook Vitest integration
export default defineConfig({
  plugins: [react()],
  // No base path needed for Netlify deployment
  // base: '/kids-deliberate-practice/', // only needed for GitHub Pages
});