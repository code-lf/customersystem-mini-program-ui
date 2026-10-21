<template>
  <view class="brand-wall-page">
    <AppWatermark />

    <!-- 顶部状态栏安全区 -->
    <view class="status-bar-placeholder" :style="{ height: metrics.statusBarHeight + 'px' }" />

    <!-- 精简极简高质感顶部导航栏 -->
    <view
      class="brand-header"
      :style="{
        height: metrics.navBarHeight + 'px',
        paddingRight: (metrics.capsuleOccupiedWidth ? (metrics.capsuleOccupiedWidth + 10) + 'px' : '24rpx')
      }"
    >
      <view class="nav-back-btn" @click="handleBack">
        <up-icon name="arrow-left" size="18" color="#17233d" />
        <text class="back-text">返回</text>
      </view>

      <view class="nav-title-box">
        <text class="brand-title">战略合作品牌集</text>
        <text class="brand-subtitle">汇聚行业一线领军矩阵 · 原厂一级授权</text>
      </view>

      <view class="nav-right-placeholder" />
    </view>

    <!-- 全屏纯净品牌流动墙（6行错落交替滚动，铺满全屏，慢速丝滑流畅） -->
    <view class="brand-wall">
      <!-- 行 1：向左平滑慢速流动（暖通空调巨头） -->
      <view class="marquee-row">
        <view class="marquee-track marquee-track--left">
          <view
            v-for="(brand, idx) in row1Tracks"
            :key="'r1-' + idx"
            class="brand-tile"
            @click="handleBrandClick(brand)"
          >
            <view class="tile-logo-box" :style="{ backgroundColor: brand.bgColor }">
              <text class="tile-logo-text" :style="{ color: brand.accentColor }">{{ brand.enName }}</text>
            </view>
            <view class="tile-text-col">
              <view class="tile-name-row">
                <text class="tile-name">{{ brand.name }}</text>
                <text class="tile-tag" :style="{ color: brand.accentColor, borderColor: brand.accentColor + '40' }">{{ brand.badge }}</text>
              </view>
              <text class="tile-desc">{{ brand.categoryName }} · {{ brand.years }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 行 2：向右平滑慢速流动（战略央国企及头部互联网） -->
      <view class="marquee-row">
        <view class="marquee-track marquee-track--right">
          <view
            v-for="(brand, idx) in row2Tracks"
            :key="'r2-' + idx"
            class="brand-tile brand-tile--accent"
            @click="handleBrandClick(brand)"
          >
            <view class="tile-logo-box" :style="{ backgroundColor: brand.bgColor }">
              <text class="tile-logo-text" :style="{ color: brand.accentColor }">{{ brand.enName }}</text>
            </view>
            <view class="tile-text-col">
              <view class="tile-name-row">
                <text class="tile-name">{{ brand.name }}</text>
                <text class="tile-tag tile-tag--fill">{{ brand.badge }}</text>
              </view>
              <text class="tile-desc">{{ brand.tier }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 行 3：向左平滑慢速流动（商用主机与外资领军） -->
      <view class="marquee-row">
        <view class="marquee-track marquee-track--left-slow">
          <view
            v-for="(brand, idx) in row3Tracks"
            :key="'r3-' + idx"
            class="brand-tile"
            @click="handleBrandClick(brand)"
          >
            <view class="tile-logo-box" :style="{ backgroundColor: brand.bgColor }">
              <text class="tile-logo-text" :style="{ color: brand.accentColor }">{{ brand.enName }}</text>
            </view>
            <view class="tile-text-col">
              <view class="tile-name-row">
                <text class="tile-name">{{ brand.name }}</text>
                <text class="tile-tag" :style="{ color: brand.accentColor, borderColor: brand.accentColor + '40' }">{{ brand.badge }}</text>
              </view>
              <text class="tile-desc">{{ brand.categoryName }} · {{ brand.years }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 行 4：向右平滑慢速流动（大型客户、文娱与集采企业） -->
      <view class="marquee-row">
        <view class="marquee-track marquee-track--right-slow">
          <view
            v-for="(brand, idx) in row4Tracks"
            :key="'r4-' + idx"
            class="brand-tile brand-tile--accent"
            @click="handleBrandClick(brand)"
          >
            <view class="tile-logo-box" :style="{ backgroundColor: brand.bgColor }">
              <text class="tile-logo-text" :style="{ color: brand.accentColor }">{{ brand.enName }}</text>
            </view>
            <view class="tile-text-col">
              <view class="tile-name-row">
                <text class="tile-name">{{ brand.name }}</text>
                <text class="tile-tag tile-tag--fill">{{ brand.badge }}</text>
              </view>
              <text class="tile-desc">{{ brand.tier }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 行 5：向左平滑慢速流动（楼宇智控、精工辅材与智能制造） -->
      <view class="marquee-row">
        <view class="marquee-track marquee-track--left">
          <view
            v-for="(brand, idx) in row5Tracks"
            :key="'r5-' + idx"
            class="brand-tile"
            @click="handleBrandClick(brand)"
          >
            <view class="tile-logo-box" :style="{ backgroundColor: brand.bgColor }">
              <text class="tile-logo-text" :style="{ color: brand.accentColor }">{{ brand.enName }}</text>
            </view>
            <view class="tile-text-col">
              <view class="tile-name-row">
                <text class="tile-name">{{ brand.name }}</text>
                <text class="tile-tag" :style="{ color: brand.accentColor, borderColor: brand.accentColor + '40' }">{{ brand.badge }}</text>
              </view>
              <text class="tile-desc">{{ brand.categoryName }} · {{ brand.tier }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 行 6：向右平滑慢速流动（核心特许全案伙伴） -->
      <view class="marquee-row">
        <view class="marquee-track marquee-track--right">
          <view
            v-for="(brand, idx) in row6Tracks"
            :key="'r6-' + idx"
            class="brand-tile brand-tile--accent"
            @click="handleBrandClick(brand)"
          >
            <view class="tile-logo-box" :style="{ backgroundColor: brand.bgColor }">
              <text class="tile-logo-text" :style="{ color: brand.accentColor }">{{ brand.enName }}</text>
            </view>
            <view class="tile-text-col">
              <view class="tile-name-row">
                <text class="tile-name">{{ brand.name }}</text>
                <text class="tile-tag tile-tag--fill">{{ brand.badge }}</text>
              </view>
              <text class="tile-desc">{{ brand.tier }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

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

    <!-- 品牌详情抽屉弹窗 (点击任意卡片查看) -->
    <up-popup
      :show="showDetailModal"
      mode="bottom"
      round="28"
      :closeable="false"
      :safe-area-inset-bottom="true"
      @close="showDetailModal = false"
    >
      <view v-if="activeBrand" class="brand-drawer-content">
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

        <scroll-view scroll-y class="drawer-scroll-body">
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

          <view class="drawer-section">
            <text class="section-title">品牌战略背景与合作概况</text>
            <text class="section-desc">{{ activeBrand.summary }}</text>
          </view>

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
import { BRAND_LIST } from '@/mock/brand-data';

// 页面导航及安全区
const metrics = computed(() => getNavMetrics());

// 分享配置
const SHARE_TITLE = '格宏电器｜合作品牌集与战略合作矩阵展示';
onShareAppMessage(() => createShareAppMessageOptions(SHARE_TITLE));
onShareTimeline(() => createShareTimelineOptions(SHARE_TITLE));

// 将全部34家合作品牌分配到6条全屏错落滚动的轨道中
const r1 = BRAND_LIST.filter((b) => b.category === 'hvac').slice(0, 6);
const r2 = BRAND_LIST.filter((b) => b.category === 'enterprise').slice(0, 6);
const r3 = BRAND_LIST.filter((b) => b.category === 'commercial');
const r4 = BRAND_LIST.filter((b) => b.category === 'enterprise').slice(6);
const r5 = BRAND_LIST.filter((b) => b.category === 'smart');
const r6 = [
  ...BRAND_LIST.filter((b) => b.category === 'hvac').slice(6),
  ...BRAND_LIST.filter((b) => ['gree', 'daikin', 'midea', 'china-telecom', 'byd'].includes(b.id))
];

// 双份复制实现 CSS 100% 平滑无缝跑马灯循环
const duplicate = (arr) => [...arr, ...arr];

const row1Tracks = computed(() => duplicate(r1.length ? r1 : BRAND_LIST.slice(0, 6)));
const row2Tracks = computed(() => duplicate(r2.length ? r2 : BRAND_LIST.slice(6, 12)));
const row3Tracks = computed(() => duplicate(r3.length ? r3 : BRAND_LIST.slice(12, 18)));
const row4Tracks = computed(() => duplicate(r4.length ? r4 : BRAND_LIST.slice(18, 24)));
const row5Tracks = computed(() => duplicate(r5.length ? r5 : BRAND_LIST.slice(24, 30)));
const row6Tracks = computed(() => duplicate(r6.length ? r6 : BRAND_LIST.slice(0, 6)));

// 弹窗状态
const showDetailModal = ref(false);
const activeBrand = ref(null);

const handleBrandClick = (brand) => {
  activeBrand.value = brand;
  showDetailModal.value = true;
};

const handleBack = () => {
  const pages = getCurrentPages();
  if (pages && pages.length > 1) {
    uni.navigateBack();
  } else {
    openPage('/pages/my/my');
  }
};

const handleGotoProduct = () => {
  showDetailModal.value = false;
  if (!activeBrand.value) return;
  const kw = activeBrand.value.searchKeyword || activeBrand.value.name;
  openPage('/pages/product/list', { keyword: kw });
};

const handleConsult = () => {
  showDetailModal.value = false;
  uni.showModal({
    title: '申请品牌集采合作',
    content: `您已选择申请【${activeBrand.value?.name}】专属工程集采配额与政策，是否立即前往登记？`,
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
.brand-wall-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(180deg, #f0f5fe 0%, #f7f9fd 40%, #ffffff 100%);
  overflow: hidden;
  box-sizing: border-box;
}

.status-bar-placeholder {
  width: 100%;
  flex-shrink: 0;
}

/* 顶部紧凑导航 */
.brand-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  flex-shrink: 0;
  z-index: 20;

  .nav-back-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 10rpx 20rpx;
    border-radius: 30rpx;
    background: rgba(255, 255, 255, 0.9);
    border: 1rpx solid #e2e8f0;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

    .back-text {
      font-size: 26rpx;
      font-weight: 600;
      color: #17233d;
    }
  }

  .nav-title-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .brand-title {
      font-size: 32rpx;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.5rpx;
    }

    .brand-subtitle {
      font-size: 20rpx;
      color: #64748b;
      margin-top: 2rpx;
    }
  }

  .nav-right-placeholder {
    width: 110rpx;
  }
}

/* 全屏品牌流动墙：直接平分并充满整个高度，空间紧凑无多余空白 */
.brand-wall {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  width: 100%;
  overflow: hidden;
  padding: 8rpx 0;
  box-sizing: border-box;
}

/* 跑马灯单行容器 */
.marquee-row {
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
  flex: 1;
  min-height: 110rpx;
}

/* 轨道容器 */
.marquee-track {
  display: flex;
  align-items: center;
  gap: 18rpx;
  width: max-content;
  flex-shrink: 0;
  will-change: transform;

  /* 慢速丝滑流畅动效：45s - 52s，平缓从容 */
  &--left {
    animation: flowLeft 46s linear infinite;
  }

  &--left-slow {
    animation: flowLeft 52s linear infinite;
  }

  &--right {
    animation: flowRight 48s linear infinite;
  }

  &--right-slow {
    animation: flowRight 54s linear infinite;
  }

  &:hover,
  &:active {
    animation-play-state: paused;
  }
}

@keyframes flowLeft {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes flowRight {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0);
  }
}

/* 品牌单个卡片：高质感圆角白卡与投影（参考用户图示） */
.brand-tile {
  display: flex;
  align-items: center;
  width: 380rpx;
  height: 98rpx;
  padding: 0 18rpx;
  border-radius: 20rpx;
  background: #ffffff;
  border: 1rpx solid #eef2f8;
  box-shadow: 0 6rpx 20rpx rgba(15, 23, 42, 0.04);
  flex-shrink: 0;
  box-sizing: border-box;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.97);
  }

  &--accent {
    background: linear-gradient(135deg, #ffffff 0%, #f9fcff 100%);
    border-color: #dbeafe;
  }

  .tile-logo-box {
    width: 72rpx;
    height: 72rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 14rpx;
    padding: 4rpx;

    .tile-logo-text {
      font-size: 22rpx;
      font-weight: 900;
      letter-spacing: -0.5rpx;
      text-align: center;
      line-height: 1.1;
    }
  }

  .tile-text-col {
    flex: 1;
    min-width: 0;

    .tile-name-row {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .tile-name {
        font-size: 26rpx;
        font-weight: 800;
        color: #0f172a;
        white-space: nowrap;
      }

      .tile-tag {
        padding: 2rpx 8rpx;
        border-radius: 10rpx;
        border: 1rpx solid;
        font-size: 18rpx;
        font-weight: 700;
        white-space: nowrap;

        &--fill {
          background: #2468e8;
          color: #ffffff !important;
          border-color: #2468e8;
        }
      }
    }

    .tile-desc {
      display: block;
      margin-top: 4rpx;
      font-size: 20rpx;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

/* 底部极简背书保障 */
.bottom-endorsement-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16rpx 20rpx calc(14rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.92);
  border-top: 1rpx solid #edf2f7;
  flex-shrink: 0;

  .endorse-item {
    display: flex;
    align-items: center;
    gap: 6rpx;
    font-size: 22rpx;
    font-weight: 600;
    color: #475569;
  }
}

/* 抽屉弹窗样式 */
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
    max-height: 55vh;
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
