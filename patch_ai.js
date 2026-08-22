const fs = require('fs');
let content = fs.readFileSync('pages/ai/index.vue', 'utf-8');

if (!content.includes('isLoading = ref')) {
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
        <view class="skeleton-block" style="width: 100%; height: 160rpx; border-radius: 24rpx; margin-bottom: 30rpx; margin-top: 20rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 280rpx; border-radius: 32rpx; margin-bottom: 30rpx;"></view>
        <view style="display: flex; flex-wrap: wrap; gap: 20rpx; margin-bottom: 30rpx;">
          <view class="skeleton-block" style="width: calc(50% - 10rpx); height: 180rpx; border-radius: 24rpx;"></view>
          <view class="skeleton-block" style="width: calc(50% - 10rpx); height: 180rpx; border-radius: 24rpx;"></view>
          <view class="skeleton-block" style="width: calc(50% - 10rpx); height: 180rpx; border-radius: 24rpx;"></view>
          <view class="skeleton-block" style="width: calc(50% - 10rpx); height: 180rpx; border-radius: 24rpx;"></view>
        </view>
        <view class="skeleton-block" style="width: 100%; height: 220rpx; border-radius: 24rpx;"></view>
      </template>
      <template v-else>
  `;
  content = content.replace(/<!-- 问候语 -->/, `${skeleton}\n    <!-- 问候语 -->`);
  content = content.replace(/<view class="tabbar-space" \/>/, `</template>\n    <view class="tabbar-space" />`);
}
fs.writeFileSync('pages/ai/index.vue', content);
console.log('patched ai/index.vue');
