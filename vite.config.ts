import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UniversalSocialauth',
      formats: ['umd', 'es'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: ['axios'],
      output: {
        globals: {
          axios: 'axios'
        }
      }
    },
    sourcemap: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
});

