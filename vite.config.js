import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import path from 'node:path';

process.env.UNI_PLATFORM = process.env.UNI_PLATFORM || 'h5';

/**
 * 把 uni-app 的输入、输出目录统一转换成绝对路径。
 */
const projectRoot = process.cwd();
const resolveProjectPath = (configuredPath, fallbackPath) => {
  const targetPath = configuredPath || fallbackPath;
  return path.isAbsolute(targetPath) ? targetPath : path.resolve(projectRoot, targetPath);
};

process.env.UNI_INPUT_DIR = resolveProjectPath(process.env.UNI_INPUT_DIR, '.');
process.env.UNI_OUTPUT_DIR = resolveProjectPath(process.env.UNI_OUTPUT_DIR, 'dist');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'uni_modules': path.resolve(__dirname, 'uni_modules'),
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import']
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  }
});

