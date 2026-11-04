import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/adapters/capacitor/index.ts'),
      name: 'UniversalSocialAuthCapacitor',
      formats: ['umd', 'es'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    outDir: 'dist/capacitor',
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
