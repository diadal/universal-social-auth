import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'universal-social-auth': fileURLToPath(new URL('../../src/index.ts', import.meta.url))
    }
  }
});
