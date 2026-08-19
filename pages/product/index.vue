<template>
  <view class="crm-page product-page">
    <AppNavbar title="产品中心" :show-back="false" />

    <view class="product-content">
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
          @click="openPage(item.path, item.query)"
        >
          <view class="category-item__icon">
            <up-icon :name="item.icon" size="26" color="#2468e8" />
          </view>
          <text>{{ item.title }}</text>
        </view>
      </view>

      <view class="section-head filter-title">
        <text>快速筛选</text>
      </view>
      <view class="quick-filter">
        <view v-for="item in quickFilters" :key="item.title" @click="openPage('/pages/product/list', item.query)">
          <view>
            <up-icon :name="item.icon" size="26" color="#2468e8" />
          </view>
          <text>{{ item.title }}</text>
        </view>
      </view>

      <view class="tabbar-space" />
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { openPage } from '@/utils/pages';

const keyword = ref('');

const categoryEntrances = [
  { title: '多联机', icon: 'grid', path: '/pages/product/category', query: { type: 'central' } },
  { title: '模块机', icon: 'photo', path: '/pages/product/category', query: { type: 'central' } },
  { title: '风管机', icon: 'file-text', path: '/pages/product/category', query: { type: 'central' } },
  { title: '末端设备', icon: 'list', path: '/pages/product/category', query: { type: 'central' } },
  { title: '控制系统', icon: 'scan', path: '/pages/product/category', query: { type: 'central' } },
  { title: '配件耗材', icon: 'grid', path: '/pages/product/category', query: { type: 'central' } },
  { title: '新风系统', icon: 'setting', path: '/pages/product/category', query: { type: 'central' } },
  { title: '全部产品', icon: 'more-dot-fill', path: '/pages/product/list', query: { type: 'central' } }
];

const quickFilters = [
  { title: '按应用场景', icon: 'map', query: { type: 'central' } },
  { title: '按冷量范围', icon: 'rmb-circle', query: { type: 'central' } },
  { title: '能效等级', icon: 'checkmark-circle', query: { type: 'central' } },
  { title: '品牌系列', icon: 'star', query: { type: 'central' } }
];

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
  margin-top: 32rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28rpx 10rpx;
  padding: 4rpx 2rpx 2rpx;
}

.category-item,
.quick-filter > view {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #17233d;
  font-size: 25rpx;
  font-weight: 600;
}

.category-item__icon,
.quick-filter > view > view {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 14rpx;
  border-radius: 22rpx;
  background: #f1f5ff;
}

.quick-filter {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx 10rpx;
  padding: 2rpx 2rpx 12rpx;
}

.tabbar-space {
  height: 140rpx;
}
</style>
