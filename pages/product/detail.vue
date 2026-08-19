<template>
  <view class="design-page detail-page">
    <AppNavbar title="空调设备详情">
      <template #right>
        <view class="nav-actions">
          <view class="nav-btn-item" @click="toggleFavorite">
            <up-icon :name="isFav ? 'star-fill' : 'star'" size="20" :color="isFav ? '#f59e0b' : '#586477'" />
          </view>
          <view class="nav-btn-item" @click="shareProduct">
            <up-icon name="share" size="20" color="#586477" />
          </view>
        </view>
      </template>
    </AppNavbar>

    <!-- 产品大图展示区 -->
    <view class="hero">
      <image :src="product.image || '/static/aircon/outdoor-unit.png'" mode="aspectFit" />
      <text class="hero__count">官方正品 · 6年联保</text>
    </view>

    <!-- 核心标题与价格卡片 -->
    <view class="title-card">
      <view class="title-card__row">
        <text class="title-card__model">{{ product.model }}</text>
        <text class="tag-hot">热销选型</text>
      </view>
      <text class="title-card__name">{{ product.name }}</text>
      <text class="title-card__spec">{{ (product.specs || []).join(' | ') }}</text>

      <view class="feature-row">
        <text>全直流变频</text>
        <text>一级能效标准</text>
        <text>智能云温控</text>
        <text>超低静音运行</text>
      </view>

      <view class="price-row">
        <text class="price-label">参考指导面价</text>
        <view class="price-val-wrap">
          <text class="price-symbol">¥</text>
          <text class="price-num">{{ money(product.price) }}</text>
        </view>
        <view class="price-trend-btn" @click="openPage('/pages/monitor/index')">
          <text>价格走势</text>
          <up-icon name="arrow-right" size="14" color="#2468e8" />
        </view>
      </view>
    </view>

    <!-- 参数选项卡 -->
    <view class="tab-card">
      <view class="tab-row">
        <view
          v-for="item in tabs"
          :key="item.value"
          class="tab-item"
          :class="{ active: activeTab === item.value }"
          @click="activeTab = item.value"
        >
          <text>{{ item.label }}</text>
          <view v-if="activeTab === item.value" class="tab-indicator" />
        </view>
      </view>

      <!-- 基本信息 -->
      <view v-if="activeTab === 'base'" class="info-panel">
        <view v-for="item in baseInfo" :key="item.label" class="info-row">
          <text class="info-label">{{ item.label }}</text>
          <text class="info-val">{{ item.value }}</text>
        </view>
      </view>

      <!-- 技术参数 -->
      <view v-if="activeTab === 'tech'" class="info-panel">
        <view v-for="item in techInfo" :key="item.label" class="info-row">
          <text class="info-label">{{ item.label }}</text>
          <text class="info-val">{{ item.value }}</text>
        </view>
      </view>

      <!-- 图文详情 -->
      <view v-if="activeTab === 'rich'" class="rich-panel">
        <view class="rich-banner">
          <view class="rich-banner-text">
            <text class="rich-b-title">高效节能 · 智慧舒适</text>
            <text class="rich-b-sub">格宏云境多联中央空调系统</text>
          </view>
          <image src="/static/aircon/central-city.png" mode="aspectFill" />
        </view>
        <view class="icon-grid">
          <view v-for="item in richIcons" :key="item.text" class="icon-item">
            <view class="icon-circle">
              <up-icon :name="item.icon" size="24" color="#2468e8" />
            </view>
            <text>{{ item.text }}</text>
          </view>
        </view>
      </view>

      <!-- 产品技术手册下载 -->
      <view v-if="activeTab === 'files'" class="file-panel">
        <view v-for="file in uiFiles" :key="file.id" class="file-row">
          <view class="pdf-icon">PDF</view>
          <view class="file-info">
            <text class="file-row__name">{{ file.name }}</text>
            <text class="file-row__meta">{{ file.size }} · {{ file.date }}</text>
          </view>
          <button class="file-action-btn" @click="previewFile(file)">调阅</button>
        </view>
      </view>
    </view>

    <!-- 底部悬浮操作栏 -->
    <view class="bottom-action-bar">
      <button class="btn-sub-action" @click="followPrice">
        <up-icon name="eye" size="18" color="#586477" />
        <text>价格提醒</text>
      </button>
      <button class="btn-main-add" @click="addToSolution">加入方案报价单</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { uiFiles, uiProducts } from '@/mock/ui-fixtures';

const options = getPageOptions();
const product = computed(() => uiProducts.find((item) => String(item.id) === String(options.id)) || uiProducts[0]);
const isFav = ref(false);
const activeTab = ref('base');

const tabs = [
  { label: '基本信息', value: 'base' },
  { label: '技术参数', value: 'tech' },
  { label: '图文详情', value: 'rich' },
  { label: '技术资料', value: 'files' }
];

const baseInfo = computed(() => [
  { label: '设备型号', value: product.value.model },
  { label: '设备名称', value: product.value.name },
  { label: '产品系列', value: product.value.series || 'VK多联机系列' },
  { label: '设备分类', value: product.value.subCategory || '室外机/室内机' },
  { label: '适用参考面积', value: product.value.area || '120~280㎡' }
]);

const techInfo = computed(() => [
  { label: '额定制冷量', value: (product.value.specs && product.value.specs[0]) || '25.2 kW' },
  { label: '额定制热量', value: '28.0 kW' },
  { label: '综合能效 IPLV(C)', value: '6.50 (超一级能效)' },
  { label: '额定电源', value: '380V 3N~ 50Hz' },
  { label: '运转音 (dB)', value: '54 dB(A)' }
]);

const richIcons = [
  { icon: 'checkmark-circle-fill', text: '一级能效节能' },
  { icon: 'thumb-up-fill', text: '宽温域强劲制热' },
  { icon: 'setting-fill', text: '全直流变频电机' },
  { icon: 'volume-off-fill', text: '超薄静音风道' }
];

const money = (value) => Number(value || 0).toLocaleString();

const toggleFavorite = () => {
  isFav.value = !isFav.value;
  uni.showToast({ title: isFav.value ? '已加入我的收藏' : '已取消收藏', icon: 'none' });
};

const shareProduct = () => {
  uni.showToast({ title: '已复制设备选型链接', icon: 'none' });
};

const followPrice = () => {
  uni.showToast({ title: '已开启该型号价格监控提醒', icon: 'success' });
};

const previewFile = (file) => {
  uni.showToast({ title: `正在调阅: ${file.name}`, icon: 'none' });
};

const addToSolution = () => {
  uni.setStorageSync('pendingSolutionProduct', {
    id: product.value.id,
    name: product.value.name,
    model: product.value.model,
    image: product.value.image,
    price: product.value.price,
    specs: product.value.specs
  });
  uni.showToast({ title: '已加入报价单', icon: 'success' });
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/solution/index',
      fail: () => {
        uni.navigateTo({ url: '/pages/solution/index' });
      }
    });
  }, 400);
};
</script>

<style lang="scss" scoped>
.detail-page {
  padding-bottom: 220rpx;
  background: #f4f7fc;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.nav-btn-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 2rpx 10rpx rgba(23, 35, 61, 0.08);
}

.hero {
  position: relative;
  height: 420rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.hero image {
  width: 540rpx;
  height: 350rpx;
}

.hero__count {
  position: absolute;
  right: 24rpx;
  bottom: 20rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(23, 35, 61, 0.6);
  color: #fff;
  font-size: 22rpx;
}

.title-card {
  padding: 28rpx;
  border-radius: 24rpx;
  background: #fff;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.title-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-card__model {
  color: #17233d;
  font-size: 36rpx;
  font-weight: 900;
}

.tag-hot {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: #fff0ed;
  color: #ef543f;
  font-size: 22rpx;
  font-weight: 700;
}

.title-card__name {
  display: block;
  margin-top: 8rpx;
  color: #586477;
  font-size: 26rpx;
}

.title-card__spec {
  display: block;
  margin-top: 10rpx;
  color: #8b95a7;
  font-size: 24rpx;
}

.feature-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.feature-row text {
  padding: 8rpx 18rpx;
  border-radius: 20rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
}

.price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #edf1f8;
}

.price-label {
  color: #8b95a7;
  font-size: 24rpx;
}

.price-val-wrap {
  display: flex;
  align-items: baseline;
  color: #ef543f;
}

.price-symbol {
  font-size: 26rpx;
  font-weight: 700;
}

.price-num {
  font-size: 44rpx;
  font-weight: 900;
  margin-left: 2rpx;
}

.price-trend-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 700;
}

.tab-card {
  border-radius: 24rpx;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.tab-row {
  display: flex;
  border-bottom: 1rpx solid #edf1f8;
}

.tab-item {
  flex: 1;
  height: 88rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #647389;
  font-size: 26rpx;
  font-weight: 700;
}

.tab-item.active {
  color: #2468e8;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 6rpx;
  border-radius: 3rpx;
  background: #2468e8;
}

.info-panel {
  padding: 24rpx 28rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  min-height: 72rpx;
  align-items: center;
  border-bottom: 1rpx solid #edf1f8;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #8b95a7;
  font-size: 26rpx;
}

.info-val {
  color: #17233d;
  font-size: 26rpx;
  font-weight: 700;
}

.rich-panel {
  padding: 24rpx 28rpx;
}

.rich-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #eef6ff;
}

.rich-b-title {
  display: block;
  color: #17233d;
  font-size: 30rpx;
  font-weight: 900;
}

.rich-b-sub {
  display: block;
  margin-top: 8rpx;
  color: #586477;
  font-size: 22rpx;
}

.rich-banner image {
  width: 200rpx;
  height: 120rpx;
  border-radius: 12rpx;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-top: 24rpx;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #edf4ff;
}

.icon-item text {
  color: #586477;
  font-size: 22rpx;
  font-weight: 700;
  text-align: center;
}

.file-panel {
  padding: 20rpx 28rpx;
}

.file-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #edf1f8;
}

.pdf-icon {
  width: 64rpx;
  height: 76rpx;
  margin-right: 20rpx;
  border-radius: 10rpx;
  background: #ef543f;
  color: #fff;
  font-size: 20rpx;
  font-weight: 900;
  line-height: 76rpx;
  text-align: center;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-row__name {
  display: block;
  color: #17233d;
  font-size: 26rpx;
  font-weight: 800;
}

.file-row__meta {
  display: block;
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.file-action-btn {
  height: 52rpx;
  padding: 0 24rpx;
  border-radius: 26rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 52rpx;
}

/* 底部操作栏 */
.bottom-action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -6rpx 24rpx rgba(23, 35, 61, 0.06);
}

.btn-sub-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 80rpx;
  padding: 0 28rpx;
  border-radius: 40rpx;
  background: #f1f4f9;
  color: #586477;
  font-size: 26rpx;
  font-weight: 700;
}

.btn-main-add {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  background: #2468e8;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 80rpx;
  box-shadow: 0 8rpx 24rpx rgba(36, 104, 232, 0.35);
}
</style>
