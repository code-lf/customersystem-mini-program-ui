<template>
  <view class="crm-page product-page">
    <AppNavbar title="产品中心" :show-back="false" />

    <view class="product-content">
      
      <template v-if="isLoading">
        <view class="search-row" style="margin-bottom: 30rpx; border: none; padding: 0;">
          <view class="skeleton-block" style="width: 100%; height: 80rpx; border-radius: 40rpx;"></view>
        </view>
        <view class="skeleton-block" style="width: 100%; height: 260rpx; border-radius: 24rpx; margin-bottom: 24rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 260rpx; border-radius: 24rpx; margin-bottom: 40rpx;"></view>
        <view style="display: flex; gap: 20rpx; margin-bottom: 40rpx;">
          <view class="skeleton-block" style="flex: 1; height: 160rpx; border-radius: 20rpx;"></view>
          <view class="skeleton-block" style="flex: 1; height: 160rpx; border-radius: 20rpx;"></view>
        </view>
      </template>
      <template v-else>
  
      <view class="search-row">
        <up-icon name="search" size="20" color="#9aa5b5" />
        <input
          v-model="keyword"
          class="search-row__input"
          confirm-type="search"
          placeholder="搜索产品型号、系列、关键词"
          placeholder-class="search-placeholder"
          @confirm="search"
        />
        <text class="search-row__action" @click="search">搜索</text>
      </view>

      <view class="hero-card hero-card--central" @click="openPage('/pages/product/category', { type: 'central' })">
        <view>
          <text class="hero-card__title">中央空调</text>
          <text class="hero-card__desc">多联机 / 模块机</text>
          <text class="hero-card__desc">末端 / 控制系统</text>
          <button class="white-pill">进入选型</button>
        </view>
        <image src="/static/aircon/central-vk.png" mode="aspectFit" />
      </view>

      <view class="hero-card hero-card--home" @click="openPage('/pages/product/category', { type: 'home' })">
        <view>
          <text class="hero-card__title">家用空调</text>
          <text class="hero-card__desc">壁挂式 / 柜式</text>
          <text class="hero-card__desc">新风空调</text>
          <button class="white-pill white-pill--green">进入选型</button>
        </view>
        <image src="/static/aircon/home-cabinet-green.png" mode="aspectFit" />
      </view>

      <view class="section-head">
        <text>热门分类</text>
      </view>
      <view class="category-grid">
        <view
          v-for="item in categoryEntrances"
          :key="item.title"
          class="category-item"
          @click="openCategoryItem(item)"
        >
          <view class="category-item__icon" :class="'cat-icon--' + (item.theme || 'blue')">
            <up-icon :name="item.icon" size="26" :color="item.color || '#2468e8'" />
          </view>
          <text>{{ item.title }}</text>
        </view>
      </view>

      <view class="section-head filter-title">
        <text>快速筛选</text>
      </view>
      <view class="quick-filter">
        <view v-for="item in quickFilters" :key="item.title" class="quick-filter__item" @click="openQuickFilter(item)">
          <view class="filter-icon-box">
            <up-icon :name="item.icon" size="24" :color="item.color || '#2468e8'" />
          </view>
          <text class="filter-title-text">{{ item.title }}</text>
          <text class="filter-sub-text">{{ item.sub }}</text>
        </view>
      </view>

      </template>
      <view class="tabbar-space" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { openPage } from '@/utils/pages';
import { getProductCategories } from '@/api/product';

const isLoading = ref(true);
const categoryTree = ref([]);

onMounted(async () => {
  try {
    const res = await getProductCategories();
    categoryTree.value = Array.isArray(res) ? res : (res?.data || []);
  } catch(e) {}
  setTimeout(() => { isLoading.value = false }, 300);
});

const keyword = ref('');

// 真实业务分类映射
const categoryEntrances = [
  { title: '格力多联', icon: 'grid', color: '#2468e8', theme: 'blue', type: 'central', category_id: 40, name: '格力大多联' },
  { title: '家用空调', icon: 'gift', color: '#10b981', theme: 'green', type: 'home', category_id: 14, name: '格力家用空调' },
  { title: '格力风管', icon: 'file-text', color: '#0ea5e9', theme: 'sky', type: 'central', category_id: 51, name: '格力风管机' },
  { title: '商用空调', icon: 'home', color: '#6366f1', theme: 'indigo', type: 'central', category_id: 18, name: '格力中央空调' },
  { title: '春兰柜机', icon: 'tags', color: '#f59e0b', theme: 'amber', type: 'home', category: 'cabinet', category_id: 19, name: '春兰' },
  { title: '生活电器', icon: 'scan', color: '#ec4899', theme: 'pink', type: 'home', category_id: 25, name: '格力生活家电' },
  { title: '辅材配件', icon: 'setting', color: '#8b5cf6', theme: 'purple', type: 'central', category_id: 29, name: '辅材类' },
  { title: '全部电器', icon: 'more-dot-fill', color: '#64748b', theme: 'gray', path: '/pages/product/list' }
];

const quickFilters = [
  { title: '商用办公', sub: '多联机/中央空调', icon: 'map', color: '#2468e8', query: { type: 'central', keyword: 'GMV' } },
  { title: '大匹数柜机', sub: '春兰/10P商用', icon: 'rmb-circle', color: '#f59e0b', query: { type: 'home', category: 'cabinet', filter_horse: '10P' } },
  { title: '家用静音', sub: '一级能效/变频', icon: 'checkmark-circle', color: '#10b981', query: { type: 'home', category: 'wall' } },
  { title: '辅材工程', sub: '安装配件/耗材', icon: 'star', color: '#8b5cf6', query: { category_id: 29 } }
];

const openCategoryItem = (item) => {
  if (item.path) {
    openPage(item.path);
    return;
  }
  if (item.type === 'home') {
    openPage('/pages/product/category', { type: 'home', category_id: item.category_id });
  } else {
    openPage('/pages/product/category', { type: 'central', category_id: item.category_id });
  }
};

const openQuickFilter = (item) => {
  openPage('/pages/product/list', item.query);
};

const search = () => {
  const text = keyword.value.trim();
  if (text) openPage('/pages/product/list', { keyword: text });
};
</script>

<style lang="scss" scoped>
.product-page {
  min-height: 100vh;
  padding: 0;
  background: linear-gradient(180deg, #d2e4ff 0%, #e8f1fd 280rpx, #f4f7fc 500rpx, #f4f7fc 100%);
}

.product-content {
  padding: 18rpx 24rpx 0;
  background: transparent;
}

.search-row {
  display: flex;
  align-items: center;
  height: 76rpx;
  padding: 0 24rpx;
  border-radius: 38rpx;
  background: #fff;
  box-shadow: 0 4rpx 18rpx rgba(23, 35, 61, 0.05);
}

.search-row__input {
  flex: 1;
  height: 76rpx;
  margin-left: 14rpx;
  color: #17233d;
  font-size: 26rpx;
}

.search-placeholder {
  color: #9aa5b5;
}

.search-row__action {
  color: #2468e8;
  font-size: 25rpx;
  font-weight: 700;
}

.hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 220rpx;
  margin-top: 24rpx;
  padding: 32rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.hero-card--central {
  background: linear-gradient(135deg, #2d72f5 0%, #1555d4 100%);
  box-shadow: 0 8rpx 28rpx rgba(21, 85, 212, 0.28);
}

.hero-card--home {
  background: linear-gradient(135deg, #32bd80 0%, #1a9e65 100%);
  box-shadow: 0 8rpx 28rpx rgba(26, 158, 101, 0.28);
}

.hero-card__title,
.hero-card__desc {
  display: block;
}

.hero-card__title {
  color: #fff;
  font-size: 42rpx;
  font-weight: 900;
  line-height: 52rpx;
}

.hero-card__desc {
  margin-top: 8rpx;
  color: rgba(255, 255, 255, .92);
  font-size: 24rpx;
  line-height: 34rpx;
}

.hero-card image {
  width: 286rpx;
  height: 170rpx;
  margin-right: 2rpx;
}

.white-pill {
  width: 144rpx;
  height: 52rpx;
  margin: 22rpx 0 0;
  padding: 0;
  border-radius: 26rpx;
  background: #fff;
  color: #2468e8;
  font-size: 23rpx;
  line-height: 52rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.white-pill--green {
  color: #1a9e65;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 34rpx 0 20rpx;
}

.section-head text {
  color: #17233d;
  font-size: 32rpx;
  font-weight: 900;
}

.filter-title {
  margin-top: 36rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28rpx 10rpx;
  padding: 8rpx 2rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(23, 35, 61, 0.04);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 0;
  color: #17233d;
  font-size: 25rpx;
  font-weight: 600;
}

.category-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 86rpx;
  height: 86rpx;
  margin-bottom: 14rpx;
  border-radius: 24rpx;
  transition: transform 0.2s ease;

  &.cat-icon--blue { background: #edf4ff; }
  &.cat-icon--green { background: #e8f8f0; }
  &.cat-icon--sky { background: #e0f2fe; }
  &.cat-icon--indigo { background: #eef2ff; }
  &.cat-icon--amber { background: #fef3c7; }
  &.cat-icon--pink { background: #fce7f3; }
  &.cat-icon--purple { background: #f3e8ff; }
  &.cat-icon--gray { background: #f1f5f9; }
}

.category-item:active .category-item__icon {
  transform: scale(0.94);
}

.quick-filter {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 2rpx 2rpx 12rpx;
}

.quick-filter__item {
  display: flex;
  flex-direction: column;
  padding: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.04);
  position: relative;
}

.filter-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 16rpx;
  background: #f4f8fe;
  margin-bottom: 14rpx;
}

.filter-title-text {
  color: #17233d;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 38rpx;
}

.filter-sub-text {
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.tabbar-space {
  height: 140rpx;
}
.skeleton-block {
  background: #e2e8f0;
  background-image: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 37%, #e2e8f0 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
</style>
