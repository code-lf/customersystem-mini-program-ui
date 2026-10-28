/** 将原有 SVG 渲染为真实 PNG；仅开发时运行，小程序运行端不依赖 sharp。 */
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PRESET_AVATAR_GROUPS } from './avatar-presets-source.mjs';

// 生成环境需提供 sharp，可通过 NODE_PATH 指向开发机已有的图片处理依赖。
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const directory = new URL('../static/avatars/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const avatar of Object.values(PRESET_AVATAR_GROUPS).flat()) {
  if (!avatar.url.startsWith('data:image/svg+xml;')) continue;
  const svg = decodeURIComponent(avatar.url.slice(avatar.url.indexOf(',') + 1));
  // 原图 viewBox 为 120，输出 360 像素以保留高分屏头像细节。
  await sharp(Buffer.from(svg)).resize(360, 360).png().toFile(fileURLToPath(new URL(`${avatar.id}.png`, directory)));
  console.log(`已生成 ${avatar.id}.png`);
}
