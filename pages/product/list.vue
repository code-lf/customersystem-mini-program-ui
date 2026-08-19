<template>
  <view class="design-page list-page">
    <AppNavbar :title="pageTitle">
      <template #right>
        <view class="nav-actions">
          <view @click="toggleCollect"><up-icon :name="isCollected ? 'star-fill' : 'star'" size="18" :color="isCollected ? '#ffb020' : '#586477'" /><text>{{ isCollected ? '已收藏' : '收藏' }}</text></view>
          <view @click="openPage('/pages/ai/chat', { question: '对比 VK8R 和 VK10R' })"><up-icon name="share" size="18" color="#586477" /><text>对比</text></view>
        </view>
      </template>
    </AppNavbar>

    <!-- 面包屑导航 -->
    <view v-if="!isHome" class="crumb-line">
      <text>多联机</text>
      <text class="divider">/</text>
      <text>室外机</text>
      <text class="divider">/</text>
      <text>{{ currentSeries }}</text>
    </view>

    <!-- 筛选横条 -->
    <view class="filter-row">
      <view
        v-for="item in filterLabels"
        :key="item"
        class="filter-tab"
        :class="{ active: activeFilter === item }"
        @click="selectFilter(item)"
      >
        <text>{{ item }}</text>
        <up-icon name="arrow-down-fill" size="10" :color="activeFilter === item ? '#2468e8' : '#8b95a7'" />
      </view>
      <view class="filter-sort" @click="toggleSort">
        <up-icon :name="sortAsc ? 'arrow-up' : 'arrow-down'" size="16" color="#2468e8" />
        <text>价格</text>
      </view>
    </view>

    <!-- 家用空调网格布局 -->
    <view v-if="isHome" class="home-grid">
      <view
        v-for="product in sortedHomeProducts"
        :key="product.id"
        class="home-product-card"
        @click="openPage('/pages/product/detail', { id: product.id })"
      >
        <text v-if="product.tag" class="hot-tag">{{ product.tag }}</text>
        <image class="home-product-img" :src="product.image" mode="aspectFit" />
        <view class="home-product-info">
          <text class="home-product__name">{{ product.name }}</text>
          <text class="home-product__model">{{ product.model }}</text>
          <view class="home-product-bottom">
            <view class="home-product__price">
              <text class="symbol">¥</text>
              <text class="num">{{ money(product.price) }}</text>
            </view>
            <button class="home-add-btn" @click.stop="addToSolution(product)">+ 报价</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 中央空调列表布局 -->
    <view v-else class="central-list">
      <view
        v-for="product in sortedCentralProducts"
        :key="product.id"
        class="list-product-card"
        @click="openPage('/pages/product/detail', { id: product.id })"
      >
        <image class="list-product-img" :src="product.image" mode="aspectFit" />
        <view class="list-product__body">
          <view class="list-product__title-row">
            <text class="list-product__model">{{ product.model }}</text>
            <text v-if="product.tag" class="red-tag">{{ product.tag }}</text>
            <text v-if="product.greenTag" class="green-tag">{{ product.greenTag }}</text>
          </view>
          <text class="list-product__name-sub">{{ product.name }}</text>
          <text class="list-product__spec">{{ (product.specs || []).slice(0, 2).join(' | ') }}</text>
          <text class="list-product__spec">{{ (product.specs || []).slice(2).join(' | ') }}</text>
          <view class="list-product__bottom">
            <view class="price-box">
              <text class="price-label">参考价</text>
              <text class="price-val">¥{{ money(product.price) }}</text>
            </view>
            <view class="btn-box">
              <button class="btn-detail" @click.stop="openPage('/pages/product/detail', { id: product.id })">查看详情</button>
              <button class="btn-quote" @click.stop="addToSolution(product)">加入报价单</button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { uiProducts } from '@/mock/ui-fixtures';

const pageOptions = getPageOptions();
const isHome = computed(() => pageOptions.type === 'home' || ['wall', 'cabinet'].includes(pageOptions.category));
const currentSeries = ref('VK系列');
const isCollected = ref(false);
const activeFilter = ref('');
const sortAsc = ref(true);

const pageTitle = computed(() => {
  if (!isHome.value) return '中央空调产品列表';
  return pageOptions.category === 'cabinet' ? '柜式空调' : '壁挂式空调';
});

const filterLabels = computed(() => isHome.value ? ['匹数', '能效', '适用面积', '更多'] : ['冷量', '能效', '电源', '更多']);

const toggleCollect = () => {
  isCollected.value = !isCollected.value;
  uni.showToast({ title: isCollected.value ? '已加入收藏' : '已取消收藏', icon: 'none' });
};

const selectFilter = (item) => {
  activeFilter.value = activeFilter.value === item ? '' : item;
  uni.showToast({ title: `已按 ${item} 筛选`, icon: 'none' });
};

const toggleSort = () => {
  sortAsc.value = !sortAsc.value;
  uni.showToast({ title: sortAsc.value ? '按价格升序' : '按价格降序', icon: 'none' });
};

const centralProducts = computed(() => {
  if (pageOptions.keyword) {
    const kw = pageOptions.keyword.toLowerCase();
    return uiProducts.filter((p) => `${p.model} ${p.name}`.toLowerCase().includes(kw));
  }
  return uiProducts.filter((item) => item.category === 'multi');
});

const homeProducts = computed(() => {
  if (pageOptions.keyword) {
    const kw = pageOptions.keyword.toLowerCase();
    return uiProducts.filter((p) => `${p.model} ${p.name}`.toLowerCase().includes(kw));
  }
  if (pageOptions.category) {
    return uiProducts.filter((item) => item.category === pageOptions.category);
  }
  return uiProducts.filter((item) => ['wall', 'cabinet'].includes(item.category));
});

const sortedCentralProducts = computed(() => {
  const list = [...centralProducts.value];
  return list.sort((a, b) => sortAsc.value ? (a.price - b.price) : (b.price - a.price));
});

const sortedHomeProducts = computed(() => {
  const list = [...homeProducts.value];
  return list.sort((a, b) => sortAsc.value ? (a.price - b.price) : (b.price - a.price));
});

const money = (value) => Number(value || 0).toLocaleString();

const addToSolution = (product) => {
  uni.setStorageSync('pendingSolutionProduct', {
    id: product.id,
    name: product.name,
    model: product.model,
    image: product.image,
    price: product.price,
    mockUnitPrice: product.price
  });
  uni.showToast({ title: '已加入报价单', icon: 'success' });
};
</script>

<style lang="scss" scoped>
.list-page {
  min-height: 100vh;
  padding: 0 24rpx 100rpx;
  background: #f4f7fc;
}

.nav-actions {
  display: flex;
  gap: 20rpx;
  color: #586477;
  font-size: 22rpx;
}

.nav-actions view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.crumb-line {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 14rpx 4rpx 6rpx;
  color: #7b889d;
  font-size: 24rpx;
}

.crumb-line .divider {
  color: #bac4d4;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84rpx;
  margin: 10rpx 0 16rpx;
  padding: 0 16rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(23, 35, 61, 0.03);
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: #586477;
  font-size: 25rpx;
  font-weight: 500;
}

.filter-tab.active {
  color: #2468e8;
  font-weight: 700;
}

.filter-sort {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 700;
}

.central-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.list-product-card {
  display: flex;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.list-product-img {
  width: 168rpx;
  height: 168rpx;
  margin-right: 22rpx;
  border-radius: 16rpx;
  background: #f7f9fc;
  flex-shrink: 0;
}

.list-product__body {
  flex: 1;
  min-width: 0;
}

.list-product__title-row {
  display: flex;
  align-items: center;
}

.list-product__model {
  color: #17233d;
  font-size: 32rpx;
  font-weight: 900;
}

.red-tag,
.green-tag {
  margin-left: 12rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 700;
}

.red-tag {
  background: #fff0ed;
  color: #ef543f;
}

.green-tag {
  background: #e9f8f0;
  color: #2fa777;
}

.list-product__name-sub {
  display: block;
  margin-top: 4rpx;
  color: #647389;
  font-size: 24rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-product__spec {
  display: block;
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.list-product__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18rpx;
  padding-top: 14rpx;
  border-top: 1rpx solid #f1f4f9;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.price-label {
  color: #8b95a7;
  font-size: 22rpx;
}

.price-val {
  color: #ef543f;
  font-size: 32rpx;
  font-weight: 900;
}

.btn-box {
  display: flex;
  gap: 14rpx;
}

.btn-detail {
  height: 56rpx;
  padding: 0 22rpx;
  border-radius: 28rpx;
  background: #f1f4f9;
  color: #586477;
  font-size: 22rpx;
  line-height: 56rpx;
}

.btn-quote {
  height: 56rpx;
  padding: 0 26rpx;
  border-radius: 28rpx;
  background: #2468e8;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 56rpx;
  box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.25);
}

/* 家用空调网格 */
.home-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.home-product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 6rpx 20rpx rgba(23, 35, 61, 0.04);
}

.hot-tag {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  z-index: 2;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #ef543f;
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
}

.home-product-img {
  width: 100%;
  height: 180rpx;
  border-radius: 14rpx;
  background: #f7f9fc;
}

.home-product-info {
  margin-top: 14rpx;
}

.home-product__name {
  display: block;
  color: #17233d;
  font-size: 26rpx;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-product__model {
  display: block;
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.home-product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14rpx;
}

.home-product__price {
  color: #ef543f;
  font-weight: 900;
}

.home-product__price .symbol {
  font-size: 22rpx;
}

.home-product__price .num {
  font-size: 30rpx;
  margin-left: 2rpx;
}

.home-add-btn {
  height: 52rpx;
  padding: 0 20rpx;
  border-radius: 26rpx;
  background: #2468e8;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 52rpx;
}
</style>
