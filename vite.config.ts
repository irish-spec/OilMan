import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/OilMan/',            // <-- important for GitHub Pages
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts']
  }
});
