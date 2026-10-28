<template>
  <view class="brand-wall-page">
    <AppWatermark />

    <AppNavbar title="公司代理品牌" />
    <!-- 普通竖屏网格：每个品牌只展示一次，不复制轨道、不播放动画。 -->
    <scroll-view scroll-y class="brand-list-scroll">
      <!-- 公司介绍与 Logo 共用滚动区域，小屏不会因头部固定文案挤压品牌展示空间。 -->
      <view class="brand-intro">
        <view class="intro-eyebrow"><view class="intro-line" /><text>浙江格宏电器</text></view>
        <text class="intro-title">深耕家电品牌</text>
        <text class="intro-subtitle">好货集中，服务保障</text>
        <text class="intro-description">浙江格宏电器是您值得信赖的合作伙伴！</text>
      </view>
      <view class="brand-section-heading">
        <view class="section-heading-line" />
        <text>旗下代理经销品牌</text>
        <view class="section-heading-line" />
      </view>
      <view v-if="loading || loadError || !displayBrands.length" class="brand-state">{{ loading ? '正在加载品牌...' : (loadError || '暂无上架品牌') }}</view>
      <view v-else class="brand-grid">
        <view v-for="brand in displayBrands" :key="brand.brand_id" class="brand-tile">
          <!-- 每格只有真实 Logo 图片，保持比例，不显示品牌名称、标签或英文文字占位。 -->
          <image class="brand-logo-image" :src="brand.brand_image" mode="aspectFit" />
        </view>
      </view>
    </scroll-view>

    <!-- 底部极简品牌背书说明 -->
    <view class="bottom-endorsement-bar">
      <view class="endorse-item">
        <up-icon name="checkmark-circle-fill" size="14" color="#10b981" />
        <text>原厂特许授权</text>
      </view>
      <view class="endorse-item">
        <up-icon name="coupon-fill" size="14" color="#2468e8" />
        <text>专属集采底价</text>
      </view>
      <view class="endorse-item">
        <up-icon name="car-fill" size="14" color="#f59e0b" />
        <text>现货极速调拨</text>
      </view>
      <view class="endorse-item">
        <up-icon name="kefu-ermai" size="14" color="#6366f1" />
        <text>官方工程联保</text>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { createShareAppMessageOptions, createShareTimelineOptions } from '@/utils/share';
import AppWatermark from '@/components/app-watermark.vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getBrandList } from '@/api/brand';

const displayBrands = ref([]);
const loading = ref(false);
const loadError = ref('');

/** 每次回到页面重新获取上架列表，及时反映后台上下架与排序；失败不回退静态品牌。 */
onShow(async () => {
  if (loading.value) return;
  loading.value = true;
  loadError.value = '';
  displayBrands.value = [];
  try {
    const brands = await getBrandList();
    if (!Array.isArray(brands)) throw new Error('品牌列表格式异常');
    displayBrands.value = brands;
  } catch (error) {
    loadError.value = '品牌加载失败，请稍后重新进入';
  } finally {
    loading.value = false;
  }
});

// 分享配置
const SHARE_TITLE = '格宏电器｜公司代理品牌';
onShareAppMessage(() => createShareAppMessageOptions(SHARE_TITLE));
onShareTimeline(() => createShareTimelineOptions(SHARE_TITLE));

// 品牌卡片仅作展示，不绑定点击事件，不打开详情或发起合作申请。
</script>

<style lang="scss" scoped>
/* 竖屏固定导航与底部说明，品牌区域独立滚动，长列表不挤压卡片。 */
.brand-wall-page {
  position: fixed; inset: 0; display: flex; flex-direction: column;
  background: #f3f7fd; overflow: hidden;
}
.brand-list-scroll { flex: 1; height: 0; min-height: 0; }
.brand-state { padding: 48rpx 32rpx; text-align: center; font-size: 26rpx; color: #64748b; }
.brand-intro {
  margin: 24rpx 32rpx 0; padding: 32rpx 28rpx;
  border-radius: 24rpx; border: 1rpx solid #dce9fc;
  background: linear-gradient(135deg, #e7f0ff 0%, #f9fcff 100%);
}
.intro-eyebrow { display: flex; align-items: center; gap: 12rpx; color: #6483ad; font-size: 21rpx; letter-spacing: 2rpx; }
.intro-line { width: 24rpx; height: 4rpx; border-radius: 4rpx; background: #4384eb; }
.intro-title { display: block; margin-top: 18rpx; color: #153e7d; font-size: 42rpx; line-height: 1.35; font-weight: 800; letter-spacing: 2rpx; }
.intro-subtitle { display: block; margin-top: 10rpx; color: #2468d8; font-size: 29rpx; font-weight: 600; letter-spacing: 2rpx; }
.intro-description { display: block; margin-top: 24rpx; padding-top: 20rpx; border-top: 1rpx solid #dce8f8; color: #64748b; font-size: 24rpx; line-height: 1.8; }
.brand-section-heading { display: flex; align-items: center; justify-content: center; gap: 18rpx; margin: 32rpx 32rpx 0; color: #34527b; font-size: 26rpx; font-weight: 600; }
.section-heading-line { width: 44rpx; height: 1rpx; background: #cbdcf3; }
.brand-grid {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24rpx; padding: 32rpx; box-sizing: border-box;
}
.brand-tile {
  display: flex; align-items: center; justify-content: center;
  // 缩小卡片与标识，增加内外留白，让纯 Logo 网格更疏朗。
  min-width: 0; height: 112rpx; padding: 22rpx; border: 1rpx solid #e3ecfa;
  border-radius: 20rpx; background: #fff; box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.03);
}
.brand-logo-image { display: block; width: 100%; height: 100%; }
.tile-logo-box {
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; width: 90rpx; height: 78rpx; padding: 5rpx; border-radius: 12rpx; box-sizing: border-box;
}
.tile-logo-text { max-width: 100%; font-size: 19rpx; font-weight: 900; text-align: center; line-height: 1.2; overflow-wrap: anywhere; }
.tile-text-col { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 10rpx; }
.tile-name { font-size: 25rpx; font-weight: 800; color: #17233d; line-height: 1.4; }
.tile-tag { max-width: 100%; padding: 3rpx 8rpx; border-radius: 8rpx; font-size: 18rpx; line-height: 1.4; }
.bottom-endorsement-bar {
  flex-shrink: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10rpx;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom)); background: #fff; border-top: 1rpx solid #e3ecfa;
}
.endorse-item { display: flex; align-items: center; justify-content: center; gap: 8rpx; color: #64748b; font-size: 21rpx; }
</style>
