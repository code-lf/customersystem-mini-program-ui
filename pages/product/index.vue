<template>
  <view class="crm-page product-page">
    <AppNavbar title="产品中心" :show-back="false" />

    <view class="product-content">
      <view class="search-row">
        <up-icon name="search" size="18" color="#9aa5b5" />
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
            <up-icon :name="item.icon" size="22" color="#2468e8" />
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
            <up-icon :name="item.icon" size="22" color="#2468e8" />
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

// 中文说明：
// 产品中心这里继续往设计稿靠：
// 1. 页面主体改成白底，而不是“灰底 + 白色分组卡片”。
// 2. 热门分类、快捷筛选只保留“图标小底块”，不再额外包一层白色大卡片。
// 3. 中央空调 / 家用空调两张主卡片做得更高、更松，减少当前偏紧凑的问题。
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
  padding: 0;
  background: #ffffff;
}

.product-content {
  padding: 18rpx 24rpx 0;
  background: #ffffff;
}

.search-row {
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 22rpx;
  border-radius: 34rpx;
  background: #f8faff;
  box-shadow: inset 0 0 0 1rpx #eef2f7;
}

.search-row__input {
  flex: 1;
  height: 72rpx;
  margin-left: 12rpx;
  color: #17233d;
  font-size: 24rpx;
}

.search-placeholder {
  color: #9aa5b5;
}

.search-row__action {
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 700;
}

.hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 214rpx;
  margin-top: 24rpx;
  padding: 30rpx 30rpx 28rpx 30rpx;
  border-radius: 18rpx;
  overflow: hidden;
}

.hero-card--central {
  background: linear-gradient(135deg, #2f75f6, #165ddf);
}

.hero-card--home {
  background: linear-gradient(135deg, #35bf83, #1ea66d);
}

.hero-card__title,
.hero-card__desc {
  display: block;
}

.hero-card__title {
  color: #fff;
  font-size: 42rpx;
  font-weight: 900;
  line-height: 50rpx;
}

.hero-card__desc {
  margin-top: 10rpx;
  color: rgba(255, 255, 255, .9);
  font-size: 24rpx;
  line-height: 34rpx;
}

.hero-card image {
  width: 286rpx;
  height: 170rpx;
  margin-right: 2rpx;
}

.white-pill {
  width: 136rpx;
  height: 50rpx;
  margin: 22rpx 0 0;
  padding: 0;
  border-radius: 26rpx;
  background: #fff;
  color: #2468e8;
  font-size: 22rpx;
  line-height: 50rpx;
  font-weight: 700;
}

.white-pill--green {
  color: #20a66e;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 32rpx 0 18rpx;
}

.section-head text {
  color: #17233d;
  font-size: 31rpx;
  font-weight: 900;
}

.filter-title {
  margin-top: 30rpx;
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
  font-size: 23rpx;
  font-weight: 600;
}

.category-item__icon,
.quick-filter > view > view {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 66rpx;
  height: 66rpx;
  margin-bottom: 12rpx;
  border-radius: 18rpx;
  background: #f3f6ff;
}

.category-item :deep(.u-icon__icon),
.quick-filter :deep(.u-icon__icon) {
  font-size: 30rpx !important;
  color: #2e72f4 !important;
}

.quick-filter {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18rpx 10rpx;
  padding: 2rpx 2rpx 12rpx;
}

.tabbar-space {
  height: 128rpx;
}
</style>
