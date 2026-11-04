import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      'universal-social-auth': fileURLToPath(new URL('../../src/index.ts', import.meta.url))
    }
  }
});
