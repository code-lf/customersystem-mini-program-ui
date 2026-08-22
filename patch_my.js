const fs = require('fs');
let content = fs.readFileSync('pages/my/my.vue', 'utf-8');

if (!content.includes('isLoading = ref')) {
  // Try to find imports
  if (content.includes('import ')) {
      content = content.replace(/import {([^}]+)} from 'vue';/, (match, p1) => {
        let imports = p1.split(',').map(s => s.trim());
        if (!imports.includes('onMounted')) imports.push('onMounted');
        if (!imports.includes('ref')) imports.push('ref');
        return `import { ${imports.join(', ')} } from 'vue';`;
      });
      content = content.replace(/(<script setup>[\s\S]*?)(const|let|function|return)/, `$1\nconst isLoading = ref(true);\nonMounted(() => {\n  setTimeout(() => { isLoading.value = false }, 400);\n});\n\n$2`);
  } else {
      content = content.replace(/<script setup>/, `<script setup>\nimport { ref, onMounted } from 'vue';\nconst isLoading = ref(true);\nonMounted(() => {\n  setTimeout(() => { isLoading.value = false }, 400);\n});\n`);
  }
}

if (!content.includes('.skeleton-block')) {
  content = content.replace(/<\/style>/, `.skeleton-block {\n  background: #e2e8f0;\n  background-image: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 37%, #e2e8f0 63%);\n  background-size: 400% 100%;\n  animation: skeleton-shimmer 1.4s ease infinite;\n}\n@keyframes skeleton-shimmer {\n  0% { background-position: 100% 50%; }\n  100% { background-position: 0 50%; }\n}\n</style>`);
}

if (!content.includes('v-if="isLoading"')) {
  const skeleton = `
      <template v-if="isLoading">
        <view class="skeleton-block" style="width: 100%; height: 200rpx; border-radius: 32rpx; margin-bottom: 24rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 160rpx; border-radius: 24rpx; margin-bottom: 24rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 380rpx; border-radius: 24rpx; margin-bottom: 24rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 380rpx; border-radius: 24rpx; margin-bottom: 40rpx;"></view>
      </template>
      <template v-else>
  `;
  content = content.replace(/<!-- 用户身份卡片 -->\n\s*<view class="profile-card"/, `${skeleton}\n    <!-- 用户身份卡片 -->\n    <view class="profile-card"`);
  content = content.replace(/<view class="tabbar-space" \/>/, `</template>\n    <view class="tabbar-space" />`);
}
fs.writeFileSync('pages/my/my.vue', content);
console.log('patched my/my.vue');
