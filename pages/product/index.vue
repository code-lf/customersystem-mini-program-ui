<template>
  <view class="crm-page product-page">
    <AppNavbar title="产品中心" :show-back="false" :title-screen-center="true" />

    <view class="product-content">
      
      <template v-if="isLoading">
        <view class="search-row" style="margin-bottom: 30rpx; border: none; padding: 0;">
          <view class="skeleton-block" style="width: 100%; height: 80rpx; border-radius: 40rpx;"></view>
        </view>
        <view class="skeleton-block" style="width: 100%; height: 250rpx; border-radius: 24rpx; margin-bottom: 24rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 250rpx; border-radius: 24rpx; margin-bottom: 24rpx;"></view>
        <view class="skeleton-block" style="width: 100%; height: 250rpx; border-radius: 24rpx; margin-bottom: 24rpx;"></view>
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

      <!-- 动态大类卡片 -->
      <view class="category-cards-wrapper">
        <view
          v-for="(cat, index) in categoryTree"
          :key="cat.id"
          class="hero-card"
          :class="['hero-card--central', 'hero-card--appliance', 'hero-card--split'][index % 3] || 'hero-card--central'"
          @click="openCategoryPage(cat.id, cat.category_name)"
        >
          <view class="card-glass-glow" />
          <view class="card-head">
            <view class="card-title-group">
              <text class="hero-card__title">{{ cat.category_name }}</text>
              <text class="hero-card__badge">{{ ['专业暖通', '全屋智能', '变频高效', '品质甄选'][index % 4] || '优选产品' }}</text>
            </view>
            <text class="card-sub-code">{{ ['HVAC', 'SMART LIVING', 'SPLIT AIRCON', 'PREMIUM'][index % 4] || 'PRODUCT' }}</text>
          </view>
          
          <view class="card-tags-row" v-if="cat.children && cat.children.length > 0">
            <text class="card-tag" v-for="sub in cat.children.slice(0, 4)" :key="sub.id">{{ sub.category_name }}</text>
          </view>

          <view class="card-footer">
            <text class="footer-tip">点击探索更多型号配比</text>
            <view class="white-pill" :class="['white-pill--central', 'white-pill--appliance', 'white-pill--split'][index % 3] || 'white-pill--central'">
              <text>进入选型</text>
              <up-icon name="arrow-right" size="12" :color="['#1d4ed8', '#c2410c', '#047857'][index % 3] || '#1d4ed8'" />
            </view>
          </view>
        </view>
      </view>

      <!-- 热门分类和快速筛选按用户要求暂时隐藏 (v-if="false") -->
      <view v-if="false">
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
      </view>

      </template>
      <view class="tabbar-space" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { openPage } from '@/utils/pages';
import { getProductCategories, CATEGORY_IDS } from '@/api/product';
import { createShareAppMessageOptions, createShareTimelineOptions, showMiniProgramShareMenu } from '@/utils/share';

const isLoading = ref(true);
// 产品中心分享后统一进入公共首页，不携带用户筛选条件或登录数据。
const SHARE_TITLE = '格宏产品中心｜空调选型更轻松';
onShareAppMessage(() => createShareAppMessageOptions(SHARE_TITLE));
onShareTimeline(() => createShareTimelineOptions(SHARE_TITLE));
onShow(() => showMiniProgramShareMenu());
const categoryTree = ref([]);

onMounted(async () => {
  try {
    const res = await getProductCategories();
    categoryTree.value = Array.isArray(res) ? res : (res?.data || []);
  } catch(e) {}
  setTimeout(() => { isLoading.value = false }, 300);
});

const keyword = ref('');

const openCategoryPage = (rootId, title) => {
  openPage('/pages/product/category', {
    root_id: rootId,
    category_id: rootId,
    title: title || ''
  });
};

// 严格按照后台定死的三大类及其子分类编写对应的 category_id
const categoryEntrances = [
  // 中央空调核心分类
  { title: '家用多联', icon: 'grid', color: '#2468e8', theme: 'blue', type: 'central', category_id: CATEGORY_IDS.CENTRAL_HOME_MULTI, name: '家用中央空调' },
  { title: '变频风管', icon: 'file-text', color: '#0ea5e9', theme: 'sky', type: 'central', category_id: CATEGORY_IDS.CENTRAL_DUCT, name: '一拖一风管机' },
  { title: '商用多联', icon: 'home', color: '#6366f1', theme: 'indigo', type: 'central', category_id: CATEGORY_IDS.CENTRAL_COMMERCIAL, name: '商用中央空调' },
  { title: '线控辅件', icon: 'setting', color: '#8b5cf6', theme: 'purple', type: 'central', category_id: CATEGORY_IDS.CENTRAL_ACCESSORY, name: '线控器辅件' },
  // 家用空调核心分类
  { title: '1.5匹挂机', icon: 'gift', color: '#10b981', theme: 'green', type: 'home', category_id: CATEGORY_IDS.HOME_WALL_1_5P, name: '1.5匹挂机' },
  { title: '2匹挂机', icon: 'tags', color: '#f59e0b', theme: 'amber', type: 'home', category_id: CATEGORY_IDS.HOME_WALL_2P, name: '2匹挂机' },
  { title: '3匹柜机', icon: 'scan', color: '#ec4899', theme: 'pink', type: 'home', category_id: CATEGORY_IDS.HOME_CABINET_3P, name: '3匹柜机' },
  { title: '天井/工程', icon: 'more-dot-fill', color: '#0284c7', theme: 'cyan', type: 'home', category_id: CATEGORY_IDS.HOME_CEILING, name: '天井机' }
];

const quickFilters = [
  { title: '中央多联机', sub: '商用/写字楼/大空间', icon: 'map', color: '#2468e8', query: { type: 'central', category_id: CATEGORY_IDS.CENTRAL_COMMERCIAL } },
  { title: '隐藏式风管', sub: '一拖一/变频/超薄', icon: 'star', color: '#0ea5e9', query: { type: 'central', category_id: CATEGORY_IDS.CENTRAL_DUCT } },
  { title: '客餐厅大柜机', sub: '3匹高效节能立式', icon: 'rmb-circle', color: '#f59e0b', query: { type: 'home', category_id: CATEGORY_IDS.HOME_CABINET_3P } },
  { title: '卧室静音挂机', sub: '1.5匹一级能效', icon: 'checkmark-circle', color: '#10b981', query: { type: 'home', category_id: CATEGORY_IDS.HOME_WALL_1_5P } }
];

const openCategoryItem = (item) => {
  if (item.path) {
    openPage(item.path);
    return;
  }
  openPage('/pages/product/category', { root_id: item.type === 'home' ? 86 : 58, category_id: item.category_id });
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

.category-cards-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-top: 24rpx;
}

.hero-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 250rpx;
  padding: 34rpx 32rpx;
  border-radius: 28rpx;
  overflow: hidden;
  box-sizing: border-box;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.985);
  }
}

.card-glass-glow {
  position: absolute;
  right: -50rpx;
  top: -50rpx;
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
  gap: 12rpx;
  width: 100%;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex-shrink: 0;
  min-width: 0;
}

.hero-card__title {
  color: #fff;
  font-size: 36rpx;
  font-weight: 900;
  line-height: 46rpx;
  letter-spacing: 1rpx;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08);
  white-space: nowrap;
  flex-shrink: 0;
}

.hero-card__badge {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 14rpx;
  background: rgba(255, 255, 255, 0.22);
  border: 1rpx solid rgba(255, 255, 255, 0.35);
  border-radius: 12rpx;
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 600;
  line-height: 28rpx;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-sub-code {
  color: rgba(255, 255, 255, 0.65);
  font-size: 18rpx;
  font-weight: 700;
  letter-spacing: 1.5rpx;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
  flex-shrink: 1;
}

.card-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-bottom: 26rpx;
}

.card-tag {
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.16);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
  border-radius: 24rpx;
  color: #ffffff;
  font-size: 23rpx;
  font-weight: 500;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1rpx solid rgba(255, 255, 255, 0.18);
  padding-top: 22rpx;
}

.footer-tip {
  color: rgba(255, 255, 255, 0.85);
  font-size: 22rpx;
  font-weight: 500;
}

.white-pill {
  display: flex;
  align-items: center;
  gap: 8rpx;
  height: 54rpx;
  padding: 0 24rpx;
  border-radius: 27rpx;
  background: #ffffff;
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.1);
}

.hero-card--central {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%);
  box-shadow: 0 12rpx 32rpx rgba(30, 64, 175, 0.28);

  .white-pill--central {
    color: #1d4ed8;
  }
}

.hero-card--appliance {
  background: linear-gradient(135deg, #b45309 0%, #ea580c 50%, #f43f5e 100%);
  box-shadow: 0 12rpx 32rpx rgba(234, 88, 12, 0.28);

  .white-pill--appliance {
    color: #c2410c;
  }
}

.hero-card--split {
  background: linear-gradient(135deg, #047857 0%, #059669 50%, #0891b2 100%);
  box-shadow: 0 12rpx 32rpx rgba(4, 120, 87, 0.28);

  .white-pill--split {
    color: #047857;
  }
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
