<template>
  <view class="brand-page" :class="{ 'brand-page--immersive': isImmersive }">
    <AppWatermark />

    <!-- 顶部状态栏占位 -->
    <view class="status-bar-placeholder" :style="{ height: metrics.statusBarHeight + 'px' }" />

    <!-- 顶部导航栏 -->
    <view
      v-if="!isImmersive"
      class="brand-navbar"
      :style="{
        height: metrics.navBarHeight + 'px',
        paddingRight: (metrics.capsuleOccupiedWidth ? (metrics.capsuleOccupiedWidth + 10) + 'px' : '24rpx')
      }"
    >
      <view class="nav-left" @click="handleBack">
        <up-icon name="arrow-left" size="20" color="#17233d" />
        <text class="nav-back-text">返回</text>
      </view>

      <view class="nav-title">
        <text>品牌集展示</text>
      </view>

      <view class="nav-right">
        <view class="nav-btn-immersive" @click="toggleImmersive">
          <up-icon name="scan" size="16" color="#2468e8" />
          <text>全屏漫游</text>
        </view>
      </view>
    </view>

    <!-- 沉浸式浮动返回悬浮球 -->
    <view
      v-else
      class="immersive-exit-bubble"
      :style="{ top: (metrics.statusBarHeight + 10) + 'px' }"
      @click="toggleImmersive"
    >
      <up-icon name="close" size="14" color="#ffffff" />
      <text>退出全屏</text>
    </view>

    <!-- 页面核心内容区域 -->
    <scroll-view
      scroll-y
      class="brand-scroll-container"
      :enable-back-to-top="true"
      :scroll-with-animation="true"
    >
      <!-- 顶部 Hero 视觉区：品牌背书与关键统计指标（参考用户设计图） -->
      <view class="hero-section">
        <view class="hero-glow-circle hero-glow-circle--1" />
        <view class="hero-glow-circle hero-glow-circle--2" />

        <view class="hero-tag-row">
          <view class="hero-tag">
            <view class="hero-tag__dot" />
            <text>权威合作品牌集 · 供应链矩阵</text>
          </view>
          <text class="hero-badge-sub">权威授权 · 原厂直供</text>
        </view>

        <view class="hero-title-box">
          <text class="hero-title">领军品牌集 · 战略合作矩阵</text>
          <text class="hero-desc">严选国内外顶级暖通空调、商用主机、智能控制与战略央国企集采伙伴</text>
        </view>

        <!-- 数据看点看板：对应参考图的“5000家全球用户 / 150家合作企业”高光数据 -->
        <view class="stats-card-grid">
          <view class="stat-box">
            <view class="stat-num-row">
              <text class="stat-num">{{ stats.userCount }}</text>
              <text class="stat-unit">家</text>
            </view>
            <text class="stat-label">工程与企业用户</text>
            <text class="stat-sub">截至2025年服务累计</text>
          </view>

          <view class="stat-divider" />

          <view class="stat-box">
            <view class="stat-num-row">
              <text class="stat-num">{{ stats.partnerCount }}</text>
              <text class="stat-unit">家</text>
            </view>
            <text class="stat-label">战略合作企业</text>
            <text class="stat-sub">头部客户与集采入库</text>
          </view>

          <view class="stat-divider" />

          <view class="stat-box">
            <view class="stat-num-row">
              <text class="stat-num">{{ stats.authRate }}</text>
            </view>
            <text class="stat-label">原厂特约授权</text>
            <text class="stat-sub">正品溯源品质保障</text>
          </view>
        </view>
      </view>

      <!-- 展示模式切换工具栏 -->
      <view class="mode-switch-wrapper">
        <view class="mode-tabs">
          <view
            class="mode-tab-btn"
            :class="{ active: currentMode === 'marquee' }"
            @click="currentMode = 'marquee'"
          >
            <up-icon name="list-dot" size="14" :color="currentMode === 'marquee' ? '#2468e8' : '#64748b'" />
            <text>流动全屏墙</text>
          </view>

          <view
            class="mode-tab-btn"
            :class="{ active: currentMode === 'grid' }"
            @click="currentMode = 'grid'"
          >
            <up-icon name="grid" size="14" :color="currentMode === 'grid' ? '#2468e8' : '#64748b'" />
            <text>矩阵分类网格</text>
          </view>
        </view>

        <!-- 跑马灯控制器（暂停/速度调节） -->
        <view v-if="currentMode === 'marquee'" class="marquee-controls">
          <view class="ctrl-btn" @click="isPaused = !isPaused">
            <up-icon :name="isPaused ? 'play-right-fill' : 'pause'" size="12" color="#2468e8" />
            <text>{{ isPaused ? '继续流动' : '轻触暂停' }}</text>
          </view>

          <view class="speed-selector">
            <text
              v-for="s in speedOptions"
              :key="s.value"
              class="speed-tag"
              :class="{ active: scrollSpeed === s.value }"
              @click="scrollSpeed = s.value"
            >
              {{ s.label }}
            </text>
          </view>
        </view>
      </view>

      <!-- 模式一：全屏流动滚动墙（连续跑马灯流动动效，铺满全屏滚动） -->
      <view
        v-if="currentMode === 'marquee'"
        class="marquee-wall-container"
        :class="{ 'is-paused': isPaused }"
      >
        <!-- 跑马灯提示 -->
        <view class="marquee-hint-bar">
          <up-icon name="volume-fill" size="13" color="#2468e8" />
          <text class="hint-text">支持任意点击品牌卡片查看官方授权与适配机型 · 长按可静止卡片</text>
        </view>

        <!-- 流动轨道 1：向左平滑滚动（暖通一线巨头） -->
        <view class="marquee-track-outer">
          <view
            class="marquee-track marquee-track--left"
            :style="{ animationDuration: currentDuration + 's' }"
          >
            <view
              v-for="brand in row1Double"
              :key="'r1-' + brand._uid"
              class="brand-card-marquee"
              @click="handleBrandClick(brand)"
            >
              <view class="b-logo-wrap" :style="{ backgroundColor: brand.bgColor }">
                <text class="b-logo-text" :style="{ color: brand.accentColor }">{{ brand.enName }}</text>
              </view>
              <view class="b-info-wrap">
                <view class="b-name-row">
                  <text class="b-name">{{ brand.name }}</text>
                  <text class="b-badge" :style="{ color: brand.accentColor, borderColor: brand.accentColor + '40' }">{{ brand.badge }}</text>
                </view>
                <text class="b-desc text-ellipsis">{{ brand.categoryName }} · {{ brand.years }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 流动轨道 2：向右平滑滚动（战略央国企及头部客户，对应用户图示） -->
        <view class="marquee-track-outer">
          <view
            class="marquee-track marquee-track--right"
            :style="{ animationDuration: (currentDuration * 1.15) + 's' }"
          >
            <view
              v-for="brand in row2Double"
              :key="'r2-' + brand._uid"
              class="brand-card-marquee brand-card-marquee--highlight"
              @click="handleBrandClick(brand)"
            >
              <view class="b-logo-wrap" :style="{ backgroundColor: brand.bgColor }">
                <text class="b-logo-text" :style="{ color: brand.accentColor }">{{ brand.enName }}</text>
              </view>
              <view class="b-info-wrap">
                <view class="b-name-row">
                  <text class="b-name">{{ brand.name }}</text>
                  <text class="b-badge b-badge--fill">{{ brand.badge }}</text>
                </view>
                <text class="b-desc text-ellipsis">{{ brand.tier }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 流动轨道 3：向左平滑滚动（商用主机与外资领军） -->
        <view class="marquee-track-outer">
          <view
            class="marquee-track marquee-track--left"
            :style="{ animationDuration: (currentDuration * 0.9) + 's' }"
          >
            <view
              v-for="brand in row3Double"
              :key="'r3-' + brand._uid"
              class="brand-card-marquee"
              @click="handleBrandClick(brand)"
            >
              <view class="b-logo-wrap" :style="{ backgroundColor: brand.bgColor }">
                <text class="b-logo-text" :style="{ color: brand.accentColor }">{{ brand.enName }}</text>
              </view>
              <view class="b-info-wrap">
                <view class="b-name-row">
                  <text class="b-name">{{ brand.name }}</text>
                  <text class="b-badge" :style="{ color: brand.accentColor, borderColor: brand.accentColor + '40' }">{{ brand.badge }}</text>
                </view>
                <text class="b-desc text-ellipsis">{{ brand.categoryName }} · {{ brand.years }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 流动轨道 4：向右平滑滚动（智能控制与精工辅材） -->
        <view class="marquee-track-outer">
          <view
            class="marquee-track marquee-track--right"
            :style="{ animationDuration: (currentDuration * 1.25) + 's' }"
          >
            <view
              v-for="brand in row4Double"
              :key="'r4-' + brand._uid"
              class="brand-card-marquee"
              @click="handleBrandClick(brand)"
            >
              <view class="b-logo-wrap" :style="{ backgroundColor: brand.bgColor }">
                <text class="b-logo-text" :style="{ color: brand.accentColor }">{{ brand.enName }}</text>
              </view>
              <view class="b-info-wrap">
                <view class="b-name-row">
                  <text class="b-name">{{ brand.name }}</text>
                  <text class="b-badge" :style="{ color: brand.accentColor, borderColor: brand.accentColor + '40' }">{{ brand.badge }}</text>
                </view>
                <text class="b-desc text-ellipsis">{{ brand.categoryName }} · {{ brand.tier }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 合作保障保障说明条 -->
        <view class="assurance-banner">
          <view class="assurance-item">
            <up-icon name="checkmark-circle-fill" size="16" color="#10b981" />
            <text>原厂正品保证</text>
          </view>
          <view class="assurance-item">
            <up-icon name="coupon-fill" size="16" color="#2468e8" />
            <text>特许集采折扣</text>
          </view>
          <view class="assurance-item">
            <up-icon name="car-fill" size="16" color="#f59e0b" />
            <text>省内现货调拨</text>
          </view>
          <view class="assurance-item">
            <up-icon name="kefu-ermai" size="16" color="#6366f1" />
            <text>官方工程联保</text>
          </view>
        </view>
      </view>

      <!-- 模式二：分类矩阵全景网格（带实时检索与分类筛选） -->
      <view v-else class="grid-mode-container">
        <!-- 搜索过滤条 -->
        <view class="search-filter-card">
          <view class="search-bar-wrap">
            <up-icon name="search" size="18" color="#94a3b8" />
            <input
              v-model="searchKeyword"
              class="brand-search-input"
              placeholder="搜索品牌名称、英文标识或品类 (如: 格力、大金、电信...)"
              placeholder-class="placeholder-style"
            />
            <view v-if="searchKeyword" class="clear-search-btn" @click="searchKeyword = ''">
              <up-icon name="close-circle-fill" size="16" color="#cbd5e1" />
            </view>
          </view>

          <!-- 分类胶囊标签 -->
          <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
            <view class="cat-pill-group">
              <view
                v-for="cat in categories"
                :key="cat.id"
                class="cat-pill"
                :class="{ active: selectedCategory === cat.id }"
                @click="selectedCategory = cat.id"
              >
                <text>{{ cat.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 居中战略推荐展板（类似参考图中央的“合作伙伴”特出位） -->
        <view v-if="!searchKeyword && selectedCategory === 'all'" class="centerpiece-banner">
          <view class="centerpiece-badge">
            <up-icon name="star-fill" size="12" color="#ffffff" />
            <text>核心战略共赢生态</text>
          </view>
          <text class="centerpiece-title">携手全球 30+ 暖通工业巨头与头部央国企</text>
          <text class="centerpiece-sub">为各级经销商、工程安装服务商提供更强供应链与更有竞争力的底价</text>
        </view>

        <!-- 品牌网格列表 -->
        <view v-if="filteredBrands.length > 0" class="brand-grid">
          <view
            v-for="brand in filteredBrands"
            :key="brand.id"
            class="grid-brand-card"
            @click="handleBrandClick(brand)"
          >
            <view class="grid-card-top">
              <view class="grid-logo-box" :style="{ backgroundColor: brand.bgColor }">
                <text class="grid-logo-text" :style="{ color: brand.accentColor }">{{ brand.enName }}</text>
              </view>
              <view class="grid-badge" :style="{ color: brand.accentColor, backgroundColor: brand.bgColor }">
                <text>{{ brand.badge }}</text>
              </view>
            </view>

            <view class="grid-card-body">
              <text class="grid-brand-name">{{ brand.name }}</text>
              <text class="grid-brand-en">{{ brand.enName }} · 合作{{ brand.years }}</text>
              <text class="grid-brand-desc text-ellipsis-2">{{ brand.summary }}</text>
            </view>

            <view class="grid-card-footer">
              <text class="footer-tag">{{ brand.categoryName }}</text>
              <view class="footer-arrow">
                <text>详情</text>
                <up-icon name="arrow-right" size="12" color="#2468e8" />
              </view>
            </view>
          </view>
        </view>

        <!-- 空态提示 -->
        <view v-else class="empty-brand-wrap">
          <up-icon name="search" size="48" color="#cbd5e1" />
          <text class="empty-title">未搜索到匹配的品牌</text>
          <text class="empty-sub">可尝试输入其他关键词，或切换至“全部品牌”查看</text>
          <button class="reset-search-btn" @click="resetFilter">重置筛选</button>
        </view>
      </view>

      <!-- 底部安全间隙 -->
      <view class="footer-safe-gap" />
    </scroll-view>

    <!-- 品牌详情抽屉弹窗 (高质感卡片与直达产品) -->
    <up-popup
      :show="showDetailModal"
      mode="bottom"
      round="28"
      :closeable="false"
      :safe-area-inset-bottom="true"
      @close="showDetailModal = false"
    >
      <view v-if="activeBrand" class="brand-drawer-content">
        <!-- 抽屉顶部头部 -->
        <view class="drawer-header">
          <view class="drawer-brand-identity">
            <view class="drawer-logo-badge" :style="{ backgroundColor: activeBrand.bgColor }">
              <text class="drawer-logo-text" :style="{ color: activeBrand.accentColor }">{{ activeBrand.enName }}</text>
            </view>
            <view class="drawer-name-col">
              <view class="drawer-name-row">
                <text class="drawer-name">{{ activeBrand.name }}</text>
                <text class="drawer-badge" :style="{ color: activeBrand.accentColor, backgroundColor: activeBrand.bgColor }">{{ activeBrand.badge }}</text>
              </view>
              <text class="drawer-en">{{ activeBrand.enName }} · {{ activeBrand.categoryName }}</text>
            </view>
          </view>

          <view class="drawer-close-btn" @click="showDetailModal = false">
            <up-icon name="close" size="18" color="#64748b" />
          </view>
        </view>

        <!-- 详细信息展示卡 -->
        <scroll-view scroll-y class="drawer-scroll-body">
          <!-- 认证与授权资质条 -->
          <view class="cert-status-card">
            <view class="cert-icon-box">
              <up-icon name="integral-fill" size="24" color="#2468e8" />
            </view>
            <view class="cert-info">
              <view class="cert-tier-row">
                <text class="cert-tier-title">{{ activeBrand.tier }}</text>
                <text class="cert-years-pill">官方合作 {{ activeBrand.years }}</text>
              </view>
              <text class="cert-no">授权认证备案编号：{{ activeBrand.certNo }}</text>
            </view>
          </view>

          <!-- 品牌介绍 -->
          <view class="drawer-section">
            <text class="section-title">品牌战略背景与合作概况</text>
            <text class="section-desc">{{ activeBrand.summary }}</text>
          </view>

          <!-- 主力供应产品系列 -->
          <view class="drawer-section">
            <text class="section-title">核心合作与供应产品</text>
            <view class="tags-cloud">
              <view
                v-for="(prod, idx) in activeBrand.featuredProducts"
                :key="idx"
                class="prod-tag-item"
              >
                <up-icon name="checkmark" size="12" color="#2468e8" />
                <text>{{ prod }}</text>
              </view>
            </view>
          </view>

          <!-- 标杆落地案例 -->
          <view class="drawer-section">
            <text class="section-title">标杆工程与落地案例</text>
            <view class="cases-row">
              <view
                v-for="(caseItem, cIdx) in activeBrand.cases"
                :key="cIdx"
                class="case-pill"
              >
                <up-icon name="map-fill" size="12" color="#64748b" />
                <text>{{ caseItem }}</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 抽屉底部操作条：一键查看在售商品、发起合作咨询 -->
        <view class="drawer-footer-actions">
          <button class="btn-consult" @click="handleConsult">
            <up-icon name="kefu-ermai" size="16" color="#2468e8" />
            <text>申请合作配额</text>
          </button>
          <button class="btn-goto-product" @click="handleGotoProduct">
            <up-icon name="search" size="16" color="#ffffff" />
            <text>查该品牌在售机型</text>
          </button>
        </view>
      </view>
    </up-popup>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { getNavMetrics } from '@/utils/system';
import { openPage } from '@/utils/pages';
import { createShareAppMessageOptions, createShareTimelineOptions } from '@/utils/share';
import AppWatermark from '@/components/app-watermark.vue';
import { BRAND_LIST, BRAND_STATS, BRAND_CATEGORIES } from '@/mock/brand-data';

// 页面导航及安全区
const metrics = computed(() => getNavMetrics());

// 分享配置
const SHARE_TITLE = '格宏电器｜合作品牌集与战略合作矩阵展示';
onShareAppMessage(() => createShareAppMessageOptions(SHARE_TITLE));
onShareTimeline(() => createShareTimelineOptions(SHARE_TITLE));

// 状态管理
const stats = BRAND_STATS;
const categories = BRAND_CATEGORIES;
const currentMode = ref('marquee'); // 'marquee' | 'grid'
const isImmersive = ref(false);
const isPaused = ref(false);
const scrollSpeed = ref('normal'); // 'slow' | 'normal' | 'fast'
const searchKeyword = ref('');
const selectedCategory = ref('all');

// 速度选项
const speedOptions = [
  { label: '慢速', value: 'slow', duration: 48 },
  { label: '标准', value: 'normal', duration: 32 },
  { label: '极速', value: 'fast', duration: 18 }
];

const currentDuration = computed(() => {
  const target = speedOptions.find((s) => s.value === scrollSpeed.value);
  return target ? target.duration : 32;
});

// 分割品牌到 4 个不同维度的流动轨道（并做双倍拼接保证 CSS 无缝衔接循环）
const row1 = BRAND_LIST.slice(0, 7);
const row2 = BRAND_LIST.slice(7, 15);
const row3 = BRAND_LIST.slice(15, 22);
const row4 = BRAND_LIST.slice(22, 30);

const makeDouble = (arr) => {
  return [...arr.map((item, i) => ({ ...item, _uid: `${item.id}-a-${i}` })), ...arr.map((item, i) => ({ ...item, _uid: `${item.id}-b-${i}` }))];
};

const row1Double = computed(() => makeDouble(row1));
const row2Double = computed(() => makeDouble(row2));
const row3Double = computed(() => makeDouble(row3));
const row4Double = computed(() => makeDouble(row4));

// 矩阵网格模式下的筛选
const filteredBrands = computed(() => {
  let list = BRAND_LIST;
  if (selectedCategory.value !== 'all') {
    list = list.filter((b) => b.category === selectedCategory.value);
  }
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase();
    list = list.filter((b) =>
      b.name.toLowerCase().includes(kw) ||
      b.enName.toLowerCase().includes(kw) ||
      b.categoryName.toLowerCase().includes(kw) ||
      b.summary.toLowerCase().includes(kw)
    );
  }
  return list;
});

// 弹窗详情状态
const showDetailModal = ref(false);
const activeBrand = ref(null);

const handleBrandClick = (brand) => {
  activeBrand.value = brand;
  showDetailModal.value = true;
};

// 交互操作
const handleBack = () => {
  const pages = getCurrentPages();
  if (pages && pages.length > 1) {
    uni.navigateBack();
  } else {
    openPage('/pages/index/index');
  }
};

const toggleImmersive = () => {
  isImmersive.value = !isImmersive.value;
  if (isImmersive.value) {
    currentMode.value = 'marquee';
    uni.showToast({ title: '已进入全屏漫游模式', icon: 'none' });
  }
};

const resetFilter = () => {
  searchKeyword.value = '';
  selectedCategory.value = 'all';
};

// 详情弹窗直达在售商品
const handleGotoProduct = () => {
  showDetailModal.value = false;
  if (!activeBrand.value) return;
  const kw = activeBrand.value.searchKeyword || activeBrand.value.name;
  openPage('/pages/product/list', { keyword: kw });
};

// 申请配额 / 合作咨询
const handleConsult = () => {
  showDetailModal.value = false;
  uni.showModal({
    title: '申请品牌集采合作',
    content: `您已选择申请【${activeBrand.value?.name}】专属工程集采配额与经销商政策，是否立即前往合作登记？`,
    confirmText: '立即登记',
    cancelText: '暂不需要',
    success: (res) => {
      if (res.confirm) {
        openPage('/pages/cooperation/index');
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.brand-page {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #eef4fe 0%, #f4f7fc 380rpx, #f8fafc 100%);
  color: #17233d;
  overflow: hidden;

  &--immersive {
    background: #0f172a;
    color: #f8fafc;

    .hero-section {
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      border-color: rgba(255, 255, 255, 0.08);
    }
    .hero-title {
      color: #ffffff;
    }
    .hero-desc {
      color: #94a3b8;
    }
    .stats-card-grid {
      background: rgba(30, 41, 59, 0.7);
      border-color: rgba(255, 255, 255, 0.1);
    }
    .stat-label {
      color: #e2e8f0;
    }
    .stat-sub {
      color: #94a3b8;
    }
    .mode-switch-wrapper {
      background: transparent;
    }
    .brand-card-marquee {
      background: rgba(30, 41, 59, 0.85);
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.4);
    }
    .b-name {
      color: #ffffff;
    }
    .b-desc {
      color: #94a3b8;
    }
    .marquee-hint-bar {
      background: rgba(30, 41, 59, 0.9);
      color: #cbd5e1;
    }
    .assurance-banner {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
    }
  }
}

.status-bar-placeholder {
  width: 100%;
  flex-shrink: 0;
}

/* 顶部导航条 */
.brand-navbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  flex-shrink: 0;
  z-index: 20;

  .nav-left {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;
    border-radius: 30rpx;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(8px);
    border: 1rpx solid rgba(255, 255, 255, 0.9);

    .nav-back-text {
      font-size: 26rpx;
      font-weight: 600;
      color: #17233d;
    }
  }

  .nav-title {
    font-size: 32rpx;
    font-weight: 800;
    color: #17233d;
    letter-spacing: 0.5rpx;
  }

  .nav-right {
    display: flex;
    align-items: center;

    .nav-btn-immersive {
      display: flex;
      align-items: center;
      gap: 6rpx;
      padding: 10rpx 18rpx;
      border-radius: 30rpx;
      background: #eaf1fe;
      border: 1rpx solid #d2e3fc;
      color: #2468e8;
      font-size: 24rpx;
      font-weight: 700;
    }
  }
}

/* 沉浸式悬浮退出按钮 */
.immersive-exit-bubble {
  position: fixed;
  left: 24rpx;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  background: rgba(15, 23, 42, 0.85);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
}

/* 滚动容器 */
.brand-scroll-container {
  flex: 1;
  height: 0;
  width: 100%;
}

/* 顶部视觉卡片 (Hero) */
.hero-section {
  position: relative;
  margin: 16rpx 24rpx 20rpx;
  padding: 32rpx 28rpx 28rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f6faff 100%);
  border: 1rpx solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 12rpx 36rpx rgba(36, 104, 232, 0.06);
  overflow: hidden;

  .hero-glow-circle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(35px);

    &--1 {
      top: -40rpx;
      right: -20rpx;
      width: 220rpx;
      height: 220rpx;
      background: rgba(36, 104, 232, 0.15);
    }
    &--2 {
      bottom: -60rpx;
      left: 10rpx;
      width: 200rpx;
      height: 200rpx;
      background: rgba(99, 102, 241, 0.12);
    }
  }

  .hero-tag-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;

    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 10rpx;
      padding: 6rpx 18rpx;
      border-radius: 20rpx;
      background: #eff6ff;
      border: 1rpx solid #bfdbfe;
      color: #2563eb;
      font-size: 22rpx;
      font-weight: 700;

      &__dot {
        width: 10rpx;
        height: 10rpx;
        border-radius: 50%;
        background: #2563eb;
      }
    }

    .hero-badge-sub {
      color: #94a3b8;
      font-size: 22rpx;
    }
  }

  .hero-title-box {
    margin-bottom: 24rpx;

    .hero-title {
      display: block;
      color: #0f172a;
      font-size: 38rpx;
      font-weight: 800;
      line-height: 1.35;
      letter-spacing: -0.5rpx;
    }

    .hero-desc {
      display: block;
      margin-top: 10rpx;
      color: #64748b;
      font-size: 24rpx;
      line-height: 1.45;
    }
  }

  /* 数据看点指标看板 */
  .stats-card-grid {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22rpx 18rpx;
    border-radius: 22rpx;
    background: linear-gradient(135deg, rgba(239, 246, 255, 0.7) 0%, rgba(243, 244, 246, 0.5) 100%);
    border: 1rpx solid #e2e8f0;

    .stat-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .stat-num-row {
        display: flex;
        align-items: baseline;
        gap: 2rpx;

        .stat-num {
          font-size: 40rpx;
          font-weight: 900;
          color: #2468e8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .stat-unit {
          font-size: 22rpx;
          font-weight: 700;
          color: #2468e8;
        }
      }

      .stat-label {
        margin-top: 4rpx;
        font-size: 23rpx;
        font-weight: 700;
        color: #1e293b;
      }

      .stat-sub {
        margin-top: 2rpx;
        font-size: 20rpx;
        color: #94a3b8;
      }
    }

    .stat-divider {
      width: 1rpx;
      height: 60rpx;
      background: #cbd5e1;
    }
  }
}

/* 展示模式与控制工具条 */
.mode-switch-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx 16rpx;
  flex-wrap: wrap;
  gap: 12rpx;

  .mode-tabs {
    display: flex;
    align-items: center;
    padding: 6rpx;
    border-radius: 36rpx;
    background: rgba(255, 255, 255, 0.85);
    border: 1rpx solid #e2e8f0;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

    .mode-tab-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 10rpx 24rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      font-weight: 600;
      color: #64748b;
      transition: all 0.2s ease;

      &.active {
        background: #2468e8;
        color: #ffffff;
        box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.3);

        :deep(.u-icon) {
          color: #ffffff !important;
        }
      }
    }
  }

  .marquee-controls {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .ctrl-btn {
      display: flex;
      align-items: center;
      gap: 6rpx;
      padding: 10rpx 20rpx;
      border-radius: 30rpx;
      background: #ffffff;
      border: 1rpx solid #e2e8f0;
      color: #2468e8;
      font-size: 22rpx;
      font-weight: 700;
    }

    .speed-selector {
      display: flex;
      align-items: center;
      background: #ffffff;
      border-radius: 30rpx;
      border: 1rpx solid #e2e8f0;
      padding: 4rpx;

      .speed-tag {
        padding: 6rpx 14rpx;
        border-radius: 20rpx;
        font-size: 20rpx;
        color: #64748b;

        &.active {
          background: #2468e8;
          color: #ffffff;
          font-weight: 700;
        }
      }
    }
  }
}

/* 跑马灯提示条 */
.marquee-hint-bar {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin: 0 24rpx 18rpx;
  padding: 14rpx 20rpx;
  border-radius: 18rpx;
  background: #f0f7ff;
  border: 1rpx solid #dbeafe;
  color: #1e40af;
  font-size: 22rpx;

  .hint-text {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

/* 跑马灯流动外层容器 */
.marquee-wall-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  width: 100%;
  overflow: hidden;

  &.is-paused {
    .marquee-track {
      animation-play-state: paused !important;
    }
  }
}

.marquee-track-outer {
  width: 100%;
  overflow: hidden;
  display: flex;
}

.marquee-track {
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: max-content;
  will-change: transform;

  &--left {
    animation: scrollLeft linear infinite;
  }

  &--right {
    animation: scrollRight linear infinite;
  }

  &:hover,
  &:active {
    animation-play-state: paused;
  }
}

@keyframes scrollLeft {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes scrollRight {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0);
  }
}

/* 跑马灯卡片样式 */
.brand-card-marquee {
  display: flex;
  align-items: center;
  width: 440rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #eef2f8;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.05);
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.97);
  }

  &--highlight {
    border-color: #dbeafe;
    background: linear-gradient(135deg, #ffffff 0%, #f9fcff 100%);
  }

  .b-logo-wrap {
    width: 96rpx;
    height: 96rpx;
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 18rpx;
    padding: 8rpx;

    .b-logo-text {
      font-size: 26rpx;
      font-weight: 900;
      letter-spacing: -0.5rpx;
      text-align: center;
      line-height: 1.15;
    }
  }

  .b-info-wrap {
    flex: 1;
    min-width: 0;

    .b-name-row {
      display: flex;
      align-items: center;
      gap: 10rpx;

      .b-name {
        font-size: 28rpx;
        font-weight: 800;
        color: #0f172a;
        white-space: nowrap;
      }

      .b-badge {
        padding: 2rpx 10rpx;
        border-radius: 12rpx;
        border: 1rpx solid;
        font-size: 20rpx;
        font-weight: 700;
        white-space: nowrap;

        &--fill {
          background: #2468e8;
          color: #ffffff !important;
          border-color: #2468e8;
        }
      }
    }

    .b-desc {
      display: block;
      margin-top: 6rpx;
      font-size: 22rpx;
      color: #64748b;
    }
  }
}

/* 合作保障条 */
.assurance-banner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 20rpx 24rpx 0;
  padding: 24rpx 16rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #eef2f8;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.03);

  .assurance-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 22rpx;
    font-weight: 600;
    color: #334155;
  }
}

/* 模式二：分类矩阵全景网格 */
.grid-mode-container {
  padding: 0 24rpx;
}

.search-filter-card {
  margin-bottom: 24rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #eef2f8;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.03);

  .search-bar-wrap {
    display: flex;
    align-items: center;
    gap: 12rpx;
    height: 72rpx;
    padding: 0 20rpx;
    border-radius: 20rpx;
    background: #f1f5f9;

    .brand-search-input {
      flex: 1;
      font-size: 24rpx;
      color: #0f172a;
    }

    .placeholder-style {
      color: #94a3b8;
    }

    .clear-search-btn {
      padding: 6rpx;
    }
  }

  .category-scroll {
    width: 100%;
    margin-top: 18rpx;

    .cat-pill-group {
      display: flex;
      align-items: center;
      gap: 12rpx;
      width: max-content;

      .cat-pill {
        padding: 10rpx 24rpx;
        border-radius: 30rpx;
        background: #f8fafc;
        border: 1rpx solid #e2e8f0;
        font-size: 24rpx;
        color: #475569;
        font-weight: 600;
        transition: all 0.2s ease;

        &.active {
          background: #2468e8;
          color: #ffffff;
          border-color: #2468e8;
          box-shadow: 0 4rpx 14rpx rgba(36, 104, 232, 0.25);
        }
      }
    }
  }
}

/* 居中核心生态宣传条 */
.centerpiece-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 24rpx;
  padding: 30rpx 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
  border: 1rpx solid #bfdbfe;

  .centerpiece-badge {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 6rpx 18rpx;
    border-radius: 20rpx;
    background: #2468e8;
    color: #ffffff;
    font-size: 20rpx;
    font-weight: 700;
  }

  .centerpiece-title {
    margin-top: 14rpx;
    font-size: 30rpx;
    font-weight: 800;
    color: #1e3a8a;
  }

  .centerpiece-sub {
    margin-top: 6rpx;
    font-size: 22rpx;
    color: #475569;
    line-height: 1.4;
  }
}

/* 品牌网格 */
.brand-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.grid-brand-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 22rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #edf2f7;
  box-shadow: 0 6rpx 20rpx rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease;

  &:active {
    transform: translateY(2rpx);
  }

  .grid-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .grid-logo-box {
      width: 88rpx;
      height: 88rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6rpx;

      .grid-logo-text {
        font-size: 22rpx;
        font-weight: 900;
        text-align: center;
        line-height: 1.1;
      }
    }

    .grid-badge {
      padding: 4rpx 12rpx;
      border-radius: 12rpx;
      font-size: 20rpx;
      font-weight: 700;
    }
  }

  .grid-card-body {
    margin-top: 16rpx;

    .grid-brand-name {
      display: block;
      font-size: 28rpx;
      font-weight: 800;
      color: #0f172a;
    }

    .grid-brand-en {
      display: block;
      margin-top: 4rpx;
      font-size: 20rpx;
      color: #94a3b8;
    }

    .grid-brand-desc {
      display: block;
      margin-top: 12rpx;
      font-size: 22rpx;
      color: #64748b;
      line-height: 1.4;
      height: 60rpx;
    }
  }

  .grid-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16rpx;
    padding-top: 14rpx;
    border-top: 1rpx solid #f1f5f9;

    .footer-tag {
      font-size: 20rpx;
      color: #64748b;
      background: #f1f5f9;
      padding: 4rpx 10rpx;
      border-radius: 8rpx;
    }

    .footer-arrow {
      display: flex;
      align-items: center;
      gap: 4rpx;
      color: #2468e8;
      font-size: 22rpx;
      font-weight: 700;
    }
  }
}

/* 空搜索 */
.empty-brand-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  text-align: center;

  .empty-title {
    margin-top: 24rpx;
    font-size: 28rpx;
    font-weight: 700;
    color: #475569;
  }

  .empty-sub {
    margin-top: 8rpx;
    font-size: 24rpx;
    color: #94a3b8;
  }

  .reset-search-btn {
    margin-top: 32rpx;
    padding: 14rpx 36rpx;
    border-radius: 30rpx;
    background: #2468e8;
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 600;
  }
}

.footer-safe-gap {
  height: 60rpx;
}

/* 品牌抽屉内容 */
.brand-drawer-content {
  padding: 32rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top-left-radius: 28rpx;
  border-top-right-radius: 28rpx;

  .drawer-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f1f5f9;

    .drawer-brand-identity {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .drawer-logo-badge {
        width: 104rpx;
        height: 104rpx;
        border-radius: 22rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8rpx;

        .drawer-logo-text {
          font-size: 26rpx;
          font-weight: 900;
          text-align: center;
          line-height: 1.1;
        }
      }

      .drawer-name-col {
        .drawer-name-row {
          display: flex;
          align-items: center;
          gap: 12rpx;

          .drawer-name {
            font-size: 34rpx;
            font-weight: 800;
            color: #0f172a;
          }

          .drawer-badge {
            padding: 4rpx 14rpx;
            border-radius: 14rpx;
            font-size: 20rpx;
            font-weight: 700;
          }
        }

        .drawer-en {
          margin-top: 6rpx;
          font-size: 22rpx;
          color: #64748b;
        }
      }
    }

    .drawer-close-btn {
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .drawer-scroll-body {
    max-height: 58vh;
    padding: 24rpx 0;

    .cert-status-card {
      display: flex;
      align-items: center;
      gap: 18rpx;
      padding: 20rpx;
      border-radius: 20rpx;
      background: #eff6ff;
      border: 1rpx solid #dbeafe;
      margin-bottom: 24rpx;

      .cert-icon-box {
        width: 72rpx;
        height: 72rpx;
        border-radius: 16rpx;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cert-info {
        flex: 1;

        .cert-tier-row {
          display: flex;
          align-items: center;
          gap: 12rpx;

          .cert-tier-title {
            font-size: 26rpx;
            font-weight: 800;
            color: #1e40af;
          }

          .cert-years-pill {
            padding: 2rpx 10rpx;
            border-radius: 10rpx;
            background: #dbeafe;
            color: #1d4ed8;
            font-size: 20rpx;
            font-weight: 600;
          }
        }

        .cert-no {
          display: block;
          margin-top: 4rpx;
          font-size: 20rpx;
          color: #64748b;
        }
      }
    }

    .drawer-section {
      margin-bottom: 28rpx;

      .section-title {
        display: block;
        font-size: 26rpx;
        font-weight: 800;
        color: #1e293b;
        margin-bottom: 12rpx;
      }

      .section-desc {
        display: block;
        font-size: 24rpx;
        color: #475569;
        line-height: 1.55;
      }

      .tags-cloud {
        display: flex;
        flex-direction: column;
        gap: 12rpx;

        .prod-tag-item {
          display: flex;
          align-items: center;
          gap: 10rpx;
          padding: 14rpx 18rpx;
          border-radius: 16rpx;
          background: #f8fafc;
          border: 1rpx solid #e2e8f0;
          font-size: 24rpx;
          color: #334155;
        }
      }

      .cases-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;

        .case-pill {
          display: flex;
          align-items: center;
          gap: 8rpx;
          padding: 10rpx 20rpx;
          border-radius: 24rpx;
          background: #f1f5f9;
          font-size: 22rpx;
          color: #475569;
        }
      }
    }
  }

  /* 抽屉底部按钮 */
  .drawer-footer-actions {
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f1f5f9;

    .btn-consult {
      flex: 1;
      height: 84rpx;
      border-radius: 42rpx;
      background: #eff6ff;
      border: 1rpx solid #bfdbfe;
      color: #2468e8;
      font-size: 26rpx;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10rpx;
    }

    .btn-goto-product {
      flex: 1.2;
      height: 84rpx;
      border-radius: 42rpx;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      font-size: 26rpx;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10rpx;
      box-shadow: 0 6rpx 20rpx rgba(37, 99, 235, 0.35);
    }
  }
}
</style>
