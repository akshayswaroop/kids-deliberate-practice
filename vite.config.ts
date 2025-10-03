/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// Minimal Vite config without Storybook Vitest integration
export default defineConfig({
  plugins: [react()],
  base: '/kids-deliberate-practice/', // required for GitHub Pages asset loading
});