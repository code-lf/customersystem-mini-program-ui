import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import path from 'node:path';

process.env.UNI_PLATFORM = process.env.UNI_PLATFORM || 'h5';
process.env.UNI_INPUT_DIR = process.env.UNI_INPUT_DIR || process.cwd();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'uni_modules': path.resolve(__dirname, 'uni_modules'),
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  }
});
