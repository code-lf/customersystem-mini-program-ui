<template>
  <view class="crm-page product-page" :class="['theme--' + currentTheme]">
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
        <up-icon name="search" size="20" :color="searchIconColor" />
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

      <!-- 配色方案切换（低调内敛，方便现场对比选择） -->
      <view class="theme-switch-bar">
        <text class="theme-switch-bar__label">视觉配色</text>
        <scroll-view class="theme-scroll" scroll-x :show-scrollbar="false">
          <view class="theme-pills">
            <view
              v-for="item in themeList"
              :key="item.key"
              class="theme-pill-item"
              :class="{ 'is-active': currentTheme === item.key }"
              @click="setTheme(item.key)"
            >
              <view
                class="theme-dot"
                :style="{ background: item.previewColor, borderColor: item.borderColor || 'transparent' }"
              ></view>
              <text class="theme-name">{{ item.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 动态大类卡片 -->
      <view class="category-cards-wrapper">
        <view
          v-for="(cat, index) in categoryTree"
          :key="cat.id"
          class="hero-card"
          :class="['hero-card--idx-' + (index % 5)]"
          @click="openCategoryPage(cat.id, cat.category_name)"
        >
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
            <view class="white-pill">
              <text>进入选型</text>
              <up-icon name="arrow-right" size="12" :color="arrowIconColor" />
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
import { ref, computed, onMounted } from 'vue';
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { openPage } from '@/utils/pages';
import { getProductCategories, CATEGORY_IDS } from '@/api/product';
import { createShareAppMessageOptions, createShareTimelineOptions, showMiniProgramShareMenu } from '@/utils/share';

// 视觉配色方案定义：以低调、内敛、质感为核心
const themeList = [
  { key: 'minimal-white', name: '云白极简', previewColor: '#ffffff', borderColor: '#94a3b8' },
  { key: 'morandi-steel', name: '莫兰迪钢蓝', previewColor: '#3e536e', borderColor: 'transparent' },
  { key: 'slate-dark', name: '深空石墨', previewColor: '#1e293b', borderColor: 'transparent' },
  { key: 'classic-blue', name: '原版亮蓝', previewColor: '#246be9', borderColor: 'transparent' }
];

// 默认使用推荐的“云白极简”低调风格，并持久化用户选择
const currentTheme = ref('minimal-white');

const setTheme = (key) => {
  currentTheme.value = key;
  try {
    uni.setStorageSync('product_page_theme', key);
  } catch (e) {}
};

const arrowIconColor = computed(() => {
  switch (currentTheme.value) {
    case 'minimal-white': return '#475569';
    case 'morandi-steel': return '#2d3e52';
    case 'slate-dark': return '#0f172a';
    default: return '#2468e8';
  }
});

const searchIconColor = computed(() => {
  return currentTheme.value === 'minimal-white' ? '#64748b' : '#9aa5b5';
});

const isLoading = ref(true);
// 产品中心分享后统一进入公共首页，不携带用户筛选条件或登录数据。
const SHARE_TITLE = '格宏产品中心｜空调选型更轻松';
onShareAppMessage(() => createShareAppMessageOptions(SHARE_TITLE));
onShareTimeline(() => createShareTimelineOptions(SHARE_TITLE));
onShow(() => showMiniProgramShareMenu());
const categoryTree = ref([]);

onMounted(async () => {
  try {
    const saved = uni.getStorageSync('product_page_theme');
    if (saved && ['minimal-white', 'morandi-steel', 'slate-dark', 'classic-blue'].includes(saved)) {
      currentTheme.value = saved;
    }
  } catch (e) {}

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

const search = (event) => {
  // 键盘“搜索”可能先于 v-model 更新，优先读取确认事件里的实时输入值。
  const text = String(event?.detail?.value ?? keyword.value).trim();
  if (!text) return;
  keyword.value = text;
  openPage('/pages/product/list', { keyword: text });
};
</script>

<style lang="scss" scoped>
.product-page {
  min-height: 100vh;
  padding: 0;
  transition: background 0.3s ease;
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
  transition: all 0.3s ease;
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
  font-size: 25rpx;
  font-weight: 700;
  cursor: pointer;
  padding: 8rpx 12rpx;
}

/* 配色切换栏 */
.theme-switch-bar {
  display: flex;
  align-items: center;
  margin-top: 18rpx;
  padding: 4rpx 0 6rpx;
}

.theme-switch-bar__label {
  font-size: 22rpx;
  color: #64748b;
  font-weight: 600;
  white-space: nowrap;
  margin-right: 14rpx;
  flex-shrink: 0;
}

.theme-scroll {
  flex: 1;
  white-space: nowrap;
}

.theme-pills {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
}

.theme-pill-item {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 18rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.04);
  transition: all 0.2s ease;

  .theme-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    border: 1rpx solid rgba(0, 0, 0, 0.12);
  }

  .theme-name {
    font-size: 22rpx;
    color: #475569;
    font-weight: 500;
  }

  &.is-active {
    background: #1e293b;
    border-color: #1e293b;
    box-shadow: 0 4rpx 12rpx rgba(15, 23, 42, 0.15);

    .theme-name {
      color: #ffffff;
      font-weight: 600;
    }
    .theme-dot {
      border-color: rgba(255, 255, 255, 0.6);
    }
  }
}

.category-cards-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 20rpx;
}

.hero-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 170rpx;
  padding: 24rpx 28rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-sizing: border-box;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.985);
  }
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
  gap: 12rpx;
  width: 100%;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
  min-width: 0;
}

.hero-card__title {
  font-size: 32rpx;
  font-weight: 800;
  line-height: 40rpx;
  letter-spacing: 0.5rpx;
  white-space: nowrap;
  flex-shrink: 0;
}

.hero-card__badge {
  display: inline-flex;
  align-items: center;
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
  font-size: 20rpx;
  font-weight: 600;
  line-height: 26rpx;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-sub-code {
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
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.card-tag {
  padding: 4rpx 16rpx;
  border-radius: 18rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14rpx;
}

.footer-tip {
  font-size: 22rpx;
  font-weight: 500;
}

.white-pill {
  display: flex;
  align-items: center;
  gap: 6rpx;
  height: 48rpx;
  padding: 0 20rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: 700;
}

/* ========================================================
   1. 推荐方案：【云白极简 · 工业选型风】
   白底卡片 + 哑光钛灰字 + 极细雅致色标饰条，沉稳低调，极度耐看
   ======================================================== */
.theme--minimal-white {
  background: #f4f6fa;

  .search-row {
    background: #ffffff;
    border: 1rpx solid #e2e8f0;
    box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.03);
  }
  .search-row__action {
    color: #1e293b;
  }

  .hero-card {
    background: #ffffff;
    border: 1rpx solid #e5e9f0;
    box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.04);

    /* 左侧极细微色条点缀品类，既能直观识别，又绝不高调刺眼 */
    &.hero-card--idx-0 { border-left: 8rpx solid #2563eb; }
    &.hero-card--idx-1 { border-left: 8rpx solid #0284c7; }
    &.hero-card--idx-2 { border-left: 8rpx solid #475569; }
    &.hero-card--idx-3 { border-left: 8rpx solid #059669; }
    &.hero-card--idx-4 { border-left: 8rpx solid #d97706; }
  }

  .hero-card__title {
    color: #0f172a;
  }
  .hero-card__badge {
    background: #f1f5f9;
    border: 1rpx solid #e2e8f0;
    color: #475569;
  }
  .card-sub-code {
    color: #94a3b8;
  }
  .card-tag {
    background: #f8fafc;
    border: 1rpx solid #e2e8f0;
    color: #334155;
  }
  .card-footer {
    border-top: 1rpx solid #f1f5f9;
  }
  .footer-tip {
    color: #64748b;
  }
  .white-pill {
    background: #f1f5f9;
    border: 1rpx solid #e2e8f0;
    color: #334155;
    box-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.03);
  }
}

/* ========================================================
   2. 方案二：【莫兰迪钢蓝 · 低饱和冷色微阶梯】
   大幅降低 60% 饱和度，各品类微冷色阶变化，柔和内敛
   ======================================================== */
.theme--morandi-steel {
  background: linear-gradient(180deg, #e9eff5 0%, #edf2f7 240rpx, #f4f6fa 100%);

  .search-row {
    background: #ffffff;
    border: 1rpx solid #dce4ee;
    box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.04);
  }
  .search-row__action {
    color: #2d3e52;
  }

  .hero-card {
    border: 1rpx solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 8rpx 22rpx rgba(30, 41, 59, 0.12);

    &.hero-card--idx-0 { background: linear-gradient(125deg, #2d3e52 0%, #3e536e 100%); }
    &.hero-card--idx-1 { background: linear-gradient(125deg, #32434f 0%, #465866 100%); }
    &.hero-card--idx-2 { background: linear-gradient(125deg, #373e4b 0%, #4d5666 100%); }
    &.hero-card--idx-3 { background: linear-gradient(125deg, #2b4150 0%, #3d5568 100%); }
    &.hero-card--idx-4 { background: linear-gradient(125deg, #384252 0%, #4b576b 100%); }
  }

  .hero-card__title {
    color: #ffffff;
  }
  .hero-card__badge {
    background: rgba(255, 255, 255, 0.14);
    border: 1rpx solid rgba(255, 255, 255, 0.28);
    color: #ffffff;
  }
  .card-sub-code {
    color: rgba(255, 255, 255, 0.62);
  }
  .card-tag {
    background: rgba(255, 255, 255, 0.1);
    border: 1rpx solid rgba(255, 255, 255, 0.22);
    color: #ffffff;
  }
  .card-footer {
    border-top: 1rpx solid rgba(255, 255, 255, 0.14);
  }
  .footer-tip {
    color: rgba(255, 255, 255, 0.72);
  }
  .white-pill {
    background: #ffffff;
    border: 1rpx solid #ffffff;
    color: #2d3e52;
    box-shadow: 0 4rpx 10rpx rgba(15, 23, 42, 0.08);
  }
}

/* ========================================================
   3. 方案三：【深空石墨 · 钛金哑光暗调】
   深邃石墨灰蓝，高端科技五金/工业级沉稳感
   ======================================================== */
.theme--slate-dark {
  background: #edf0f5;

  .search-row {
    background: #ffffff;
    border: 1rpx solid #dce2eb;
    box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.03);
  }
  .search-row__action {
    color: #1e293b;
  }

  .hero-card {
    background: linear-gradient(135deg, #1e293b 0%, #293548 100%);
    border: 1rpx solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.14);
  }

  .hero-card__title {
    color: #f8fafc;
  }
  .hero-card__badge {
    background: rgba(255, 255, 255, 0.1);
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    color: #f1f5f9;
  }
  .card-sub-code {
    color: rgba(255, 255, 255, 0.45);
  }
  .card-tag {
    background: rgba(255, 255, 255, 0.08);
    border: 1rpx solid rgba(255, 255, 255, 0.16);
    color: #e2e8f0;
  }
  .card-footer {
    border-top: 1rpx solid rgba(255, 255, 255, 0.1);
  }
  .footer-tip {
    color: rgba(255, 255, 255, 0.6);
  }
  .white-pill {
    background: rgba(255, 255, 255, 0.95);
    border: 1rpx solid #ffffff;
    color: #0f172a;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  }
}

/* ========================================================
   4. 原版保留：【原版亮蓝】
   供对比查看原版视觉效果
   ======================================================== */
.theme--classic-blue {
  background: linear-gradient(180deg, #d2e4ff 0%, #e8f1fd 280rpx, #f4f7fc 500rpx, #f4f7fc 100%);

  .search-row {
    background: #fff;
    box-shadow: 0 4rpx 18rpx rgba(23, 35, 61, 0.05);
  }
  .search-row__action {
    color: #2468e8;
  }

  .hero-card {
    border: 1rpx solid rgba(255, 255, 255, 0.18);
    background: linear-gradient(115deg, #234cbb 0%, #246be9 60%, #1e9be9 100%);
    box-shadow: 0 8rpx 20rpx rgba(31, 92, 200, 0.2);
  }
  .hero-card__title {
    color: #ffffff;
  }
  .hero-card__badge {
    background: rgba(255, 255, 255, 0.18);
    border: 1rpx solid rgba(255, 255, 255, 0.42);
    color: #ffffff;
  }
  .card-sub-code {
    color: rgba(255, 255, 255, 0.76);
  }
  .card-tag {
    background: rgba(255, 255, 255, 0.14);
    border: 1rpx solid rgba(255, 255, 255, 0.38);
    color: #ffffff;
  }
  .card-footer {
    border-top: 1rpx solid rgba(255, 255, 255, 0.25);
  }
  .footer-tip {
    color: rgba(255, 255, 255, 0.86);
  }
  .white-pill {
    background: #ffffff;
    border: 1rpx solid #c5daf8;
    color: #2468e8;
    box-shadow: 0 3rpx 10rpx rgba(36, 104, 232, 0.07);
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
