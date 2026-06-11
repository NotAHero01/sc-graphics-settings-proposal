import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// The UI imports the core only through its public barrel.
// This alias keeps that single entry point during development.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@scgs/core': fileURLToPath(new URL('./core/src/index.ts', import.meta.url)),
    },
  },
});
