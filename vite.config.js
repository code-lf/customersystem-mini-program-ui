import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import path from 'node:path';

process.env.UNI_PLATFORM = process.env.UNI_PLATFORM || 'h5';

/**
 * 把 uni-app 的输入、输出目录统一转换成绝对路径。
 *
 * 当前 uni-app 5.24 在 Windows 上存在一个静态资源复制问题：当 UNI_INPUT_DIR
 * 使用“.”、UNI_OUTPUT_DIR 使用“unpackage/...”这类相对路径时，JS 和 app.json
 * 可以正常生成，但负责递归复制 static 目录的文件监听器找不到正确目录，最终导致
 * tabBar 图标在每次重新编译后消失。
 *
 * HBuilderX 和命令行可能传入不同形式的路径，因此这里统一标准化；已经是绝对路径
 * 时保持不变，相对路径则以当前项目根目录为基准解析。
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
    uni(),
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
