<template>
  <view class="design-page tab-page notice-detail-page">
    <AppNavbar title="公告详情" />

    <view class="article-card">
      <text class="article-title">关于 VK8R 多联机价格调整的通知</text>
      <view class="article-meta">
        <text>价格调整</text>
        <text>2025-05-28 09:30</text>
        <text>阅读 1286</text>
      </view>
      <text class="paragraph">尊敬的合作伙伴：</text>
      <text class="paragraph">您好！由于原材料价格波动及成本结构变化，自 2025 年 6 月 1 日起，VK8R 系列多联机产品价格将进行调整，具体调整明细如下：</text>
      <text class="paragraph">1. 部分型号价格上调，最高上调 8%；</text>
      <text class="paragraph">2. 新价格将于 2025 年 6 月 1 日起执行；</text>
      <text class="paragraph">3. 已下单未发货的订单，将按新价格执行。</text>
      <text class="paragraph">感谢您的理解与支持！如有疑问，请联系您的销售经理或致电 400-888-8888。</text>

      <view class="file-box">
        <view class="pdf-icon">PDF</view>
        <view>
          <text>VK8R 系列价格调整明细.pdf</text>
          <text>1.28 MB</text>
        </view>
        <up-icon name="download" size="22" color="#8b95a7" />
      </view>
    </view>

    <view class="article-actions">
      <button><up-icon name="eye" size="18" color="#667286" />1286</button>
      <button><up-icon name="share" size="18" color="#667286" />分享</button>
      <button><up-icon name="thumb-up" size="18" color="#667286" />点赞</button>
    </view>
  </view>
</template>

<script setup>
import AppNavbar from '@/components/app-navbar.vue';
</script>

<style lang="scss" scoped>
.article-card {
  padding: 26rpx;
  border-radius: 16rpx;
  background: #fff;
}

.article-title {
  display: block;
  color: #17233d;
  font-size: 34rpx;
  font-weight: 900;
  line-height: 48rpx;
}

.article-meta {
  display: flex;
  gap: 18rpx;
  margin-top: 18rpx;
  color: #8b95a7;
  font-size: 21rpx;
}

.article-meta text:first-child {
  padding: 3rpx 10rpx;
  border-radius: 6rpx;
  background: #edf4ff;
  color: #2468e8;
}

.paragraph {
  display: block;
  margin-top: 26rpx;
  color: #586477;
  font-size: 25rpx;
  line-height: 43rpx;
}

.file-box {
  display: flex;
  align-items: center;
  margin-top: 28rpx;
  padding: 18rpx;
  border-radius: 16rpx;
  background: #f7f9fc;
}

.pdf-icon {
  width: 62rpx;
  height: 70rpx;
  margin-right: 18rpx;
  border-radius: 8rpx;
  background: #ef543f;
  color: #fff;
  font-size: 18rpx;
  font-weight: 900;
  line-height: 70rpx;
  text-align: center;
}

.file-box view:nth-child(2) {
  flex: 1;
}

.file-box text {
  display: block;
}

.file-box text:first-child {
  color: #17233d;
  font-size: 24rpx;
  font-weight: 800;
}

.file-box text:last-child {
  margin-top: 8rpx;
  color: #8b95a7;
  font-size: 20rpx;
}

.article-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 22rpx;
}

.article-actions button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 62rpx;
  margin: 0;
  padding: 0;
  border-radius: 31rpx;
  background: #fff;
  color: #667286;
  font-size: 22rpx;
  line-height: 62rpx;
}

.tab-page {
  padding-bottom: 120rpx;
}
</style>
