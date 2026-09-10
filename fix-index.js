const fs = require('fs');
let content = fs.readFileSync('pages/index/index.vue', 'utf-8');

// 1. replace quickTools
const oldToolsRegex = /const quickTools = \[[\s\S]*?\];/;
const newTools = `const quickTools = [
  { title: '我的报价', icon: 'file-text-fill', color: '#6366f1', bg: '#eef2ff', path: '/pages/solution/index' },
  { title: '价格监控', icon: 'order', color: '#f59e0b', bg: '#fef3c7', path: '/pages/monitor/index' },
  { title: 'AI 顾问', icon: 'kefu-ermai', color: '#0ea5e9', bg: '#e0f2fe', path: '/pages/ai/index' },
  { title: '品牌资讯', icon: 'volume-fill', color: '#ec4899', bg: '#fce7f3', path: '/pages/notice/index' }
];`;
content = content.replace(oldToolsRegex, newTools);

// 2. update greeting-card style
const greetingCardRegex = /\.greeting-card \{([\s\S]*?)\}/;
const newGreetingStyle = `.greeting-card {
  position: relative;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 24rpx;
  padding: 36rpx 36rpx 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(59, 130, 246, 0.2);
  overflow: hidden;
}
.greeting-card::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 300rpx;
  height: 300rpx;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
}`;
content = content.replace(greetingCardRegex, newGreetingStyle);

// text colors inside greeting-card
content = content.replace(/\.greeting-name \{[\s\S]*?\}/, `.greeting-name { font-size: 34rpx; font-weight: 700; color: #ffffff; margin-right: 12rpx; }`);
content = content.replace(/\.greeting-badge \{[\s\S]*?\}/, `.greeting-badge { font-size: 20rpx; color: #1e3a8a; background: #e0f2fe; padding: 2rpx 12rpx; border-radius: 20rpx; }`);
content = content.replace(/\.greeting-badge--unlogin \{[\s\S]*?\}/, `.greeting-badge--unlogin { color: #ffffff; background: rgba(255,255,255,0.2); }`);
content = content.replace(/\.greeting-company \{[\s\S]*?\}/, `.greeting-company { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-left: 8rpx; }`);
content = content.replace(/<up-icon :name="userStore.isLoggedIn \? 'home' : 'lock'" size="14" color="#7a8b9e" \/>/, `<up-icon :name="userStore.isLoggedIn ? 'home' : 'lock'" size="14" color="rgba(255,255,255,0.8)" />`);

// Update search row inside greeting card to look better on dark bg
content = content.replace(/\.search-row \{[\s\S]*?\}/, `.search-row {
  display: flex;
  align-items: center;
  margin-top: 32rpx;
  height: 80rpx;
  background: rgba(255,255,255,0.9);
  border-radius: 40rpx;
  padding: 0 10rpx 0 28rpx;
}`);

fs.writeFileSync('pages/index/index.vue', content);
