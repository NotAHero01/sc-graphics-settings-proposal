import { defineConfig } from 'vitest/config';

// The core is pure TypeScript with no DOM. Tests run in the Node environment to
// reinforce that boundary, and only files under tests/ are treated as tests.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
