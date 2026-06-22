import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/providers/index.ts'),
      name: 'Providers',
      formats: ['umd', 'es'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    outDir: 'dist/providers',
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
