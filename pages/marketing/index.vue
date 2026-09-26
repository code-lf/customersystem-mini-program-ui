<template>
  <view class="marketing-page">
    <!-- 标准系统导航栏：避开微信小程序胶囊区域，右侧不堆放按钮 -->
    <AppNavbar title="营销活动" bgColor="#ffffff" :border="true" />

    <!-- 搜索与类型筛选项 -->
    <view class="sticky-filter">
      <!-- 搜索框 -->
      <view class="search-wrap">
        <view class="search-box">
          <up-icon name="search" size="18" color="#94a3b8" />
          <input
            v-model="keyword"
            class="search-input"
            type="text"
            placeholder="搜索活动主题、机型或促销关键词"
            placeholder-class="placeholder-text"
            confirm-type="search"
            @confirm="handleSearch"
          />
          <view v-if="keyword" class="clear-btn" @click="clearSearch">
            <up-icon name="close-circle-fill" size="16" color="#cbd5e1" />
          </view>
        </view>
      </view>

      <!-- 分类标签栏：强制单行不换行、不挤压 -->
      <scroll-view class="type-scroll" scroll-x :show-scrollbar="false" :enable-flex="true">
        <view class="type-bar">
          <view
            v-for="tab in typeTabs"
            :key="tab.key"
            class="type-tab-item"
            :class="{ active: currentType === tab.key }"
            @click="switchType(tab.key)"
          >
            <text class="tab-label">{{ tab.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 活动列表内容区 -->
    <view class="campaign-container">
      <!-- “我的活动报名”专属入口卡片（从右侧胶囊移至页面内，视觉更清晰且不冲突） -->
      <view class="my-enroll-bar" @click="openPage('/pages/marketing/enrollments')">
        <view class="enroll-bar-left">
          <view class="enroll-bar-icon">
            <up-icon name="order" size="20" color="#2563eb" />
          </view>
          <view class="enroll-bar-info">
            <view class="enroll-bar-title-row">
              <text class="enroll-bar-title">我的活动报名</text>
              <text v-if="enrollCount > 0" class="enroll-bar-badge">已报 {{ enrollCount }} 项</text>
            </view>
            <text class="enroll-bar-desc">查看活动报名记录、专属经理对接及特惠锁定进度</text>
          </view>
        </view>
        <view class="enroll-bar-right">
          <text class="enroll-bar-link">跟进进度</text>
          <up-icon name="arrow-right" size="13" color="#2563eb" />
        </view>
      </view>

      <!-- 加载中 -->
      <view v-if="loading" class="loading-state">
        <up-icon name="loading" size="28" color="#2563eb" />
        <text class="loading-text">正在获取最新营销活动...</text>
      </view>

      <!-- 列表内容 -->
      <view v-else-if="campaignList.length > 0" class="campaign-list">
        <view
          v-for="item in campaignList"
          :key="item.campaign_id"
          class="campaign-card"
          @click="openDetail(item)"
        >
          <!-- 封面图与状态角标 -->
          <view class="card-cover-box">
            <image
              class="card-cover-img"
              :src="item.cover_image || 'http://gh.starall.cn/static/resource/aircon/central-default.png'"
              mode="aspectFill"
            />
            <view class="cover-overlay" />
            <view class="cover-type-tag" :class="item.campaign_type">
              {{ formatTypeName(item.campaign_type) }}
            </view>
            <view class="cover-status-badge" :class="item.campaign_status">
              {{ formatCampaignStatus(item) }}
            </view>
          </view>

          <!-- 卡片信息区 -->
          <view class="card-body">
            <view class="card-title-row">
              <text class="card-title">{{ item.campaign_title }}</text>
            </view>
            <text class="card-summary">{{ item.summary }}</text>

            <!-- 政策亮点标签 -->
            <!-- 特惠商品简要预览 -->
            <view v-if="item.items && item.items.length > 0" class="preview-products">
              <view
                v-for="p in item.items.slice(0, 2)"
                :key="p.item_id"
                class="preview-prod-item"
              >
                <text class="prod-model">{{ p.model_snapshot || p.goods_name_snapshot }}</text>
                <text class="prod-price-text">
                  活动价 ¥<text class="price-val">{{ Number(p.campaign_price || 0).toLocaleString() }}</text>
                </text>
              </view>
            </view>

            <!-- 卡片底栏：时间与查看按钮（分享按钮统一在活动详情页展现） -->
            <view class="card-footer">
              <view class="time-box">
                <up-icon name="clock" size="13" color="#64748b" />
                <text class="time-text">{{ formatTimeRange(item) }}</text>
              </view>

              <view class="action-btn-wrap">
                <view v-if="item.my_latest_enrollment && item.my_latest_enrollment.enroll_status !== 'cancelled'" class="status-enrolled">
                  <up-icon name="checkmark-circle-fill" size="14" color="#10b981" />
                  <text>已报名 · 查看</text>
                </view>
                <view v-else class="btn-enroll-now">
                  <text>查看详情</text>
                  <up-icon name="arrow-right" size="12" color="#ffffff" />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <up-icon name="order" size="48" color="#cbd5e1" />
        <text class="empty-title">暂无相关营销活动</text>
        <text class="empty-desc">换个筛选类别或搜索关键词试试看吧</text>
        <button class="empty-reset-btn" @click="resetFilter">重置筛选条件</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { onPullDownRefresh, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app';
import { getCampaigns, getEnrollments } from '@/api/marketing';
import { openPage } from '@/utils/pages';
import { createShareAppMessageOptions, createShareTimelineOptions, showMiniProgramShareMenu } from '@/utils/share';
import AppNavbar from '@/components/app-navbar.vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

onShareAppMessage(() => {
  return createShareAppMessageOptions('格宏家电助手·营销活动专区', '', '/pages/marketing/index');
});

onShareTimeline(() => createShareTimelineOptions('格宏家电助手·营销活动专区', '', ''));

const keyword = ref('');
const currentType = ref('all');
const loading = ref(false);
const campaignList = ref([]);
const enrollCount = ref(0);

const typeTabs = [
  { key: 'all', label: '全部活动' },
  { key: 'order', label: '订货会' },
  { key: 'promotion', label: '限时促销' },
  { key: 'new', label: '新品上市' },
  { key: 'clearance', label: '清仓特惠' }
];

const formatTypeName = (type) => {
  const map = {
    order: '订货会',
    promotion: '限时促销',
    new: '新品上市',
    clearance: '清仓特惠'
  };
  return map[type] || '专题活动';
};

// 活动发布状态与活动时间分开计算，接口没有 ongoing/upcoming 字段。
const formatCampaignStatus = (item) => {
  if (item.campaign_status !== 'published') return '已结束';
  const now = Date.now();
  if (Number(item.start_time) > 0 && now < Number(item.start_time) * 1000) return '即将开始';
  if (Number(item.end_time) > 0 && now > Number(item.end_time) * 1000) return '已结束';
  return '进行中';
};

// 格式化时间字符串/时间戳，防止类型错误或显示为空
const formatDateVal = (val) => {
  if (!val) return '';
  if (typeof val === 'number') {
    const ts = val < 10000000000 ? val * 1000 : val;
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}.${m}.${day}`;
    }
  }
  const str = String(val).trim();
  if (/^\d{10,13}$/.test(str)) {
    const num = Number(str);
    const ts = num < 10000000000 ? num * 1000 : num;
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}.${m}.${day}`;
    }
  }
  const match = str.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (match) {
    const y = match[1];
    const m = match[2].padStart(2, '0');
    const d = match[3].padStart(2, '0');
    return `${y}.${m}.${d}`;
  }
  return str.slice(0, 10).replace(/-/g, '.');
};

const formatTimeRange = (itemOrStart, end) => {
  let s = '';
  let e = '';
  if (typeof itemOrStart === 'object' && itemOrStart !== null) {
    s = itemOrStart.start_time || itemOrStart.startTime || itemOrStart.begin_time || itemOrStart.start || '';
    e = itemOrStart.end_time || itemOrStart.endTime || itemOrStart.finish_time || itemOrStart.end || '';
    if (!s && !e && itemOrStart.create_time) {
      s = itemOrStart.create_time;
    }
  } else {
    s = itemOrStart;
    e = end;
  }
  const sStr = formatDateVal(s);
  const eStr = formatDateVal(e);
  if (sStr && eStr) {
    return `${sStr} ~ ${eStr}`;
  }
  if (sStr && !eStr) {
    return `${sStr} 起有效`;
  }
  if (!sStr && eStr) {
    return `截止至 ${eStr}`;
  }
  return '长期有效';
};

const switchType = (key) => {
  currentType.value = key;
  fetchCampaigns();
};

const handleSearch = () => {
  fetchCampaigns();
};

const clearSearch = () => {
  keyword.value = '';
  fetchCampaigns();
};

const resetFilter = () => {
  keyword.value = '';
  currentType.value = 'all';
  fetchCampaigns();
};

const openDetail = (item) => {
  if (item?.campaign_id) openPage('/pages/marketing/detail', { id: item.campaign_id });
};

// 获取活动列表数据
const fetchCampaigns = async () => {
  loading.value = true;
  try {
    const params = {
      page: 1,
      limit: 100,
      ...(currentType.value !== 'all' ? { campaign_type: currentType.value } : {}),
      ...(keyword.value.trim() ? { keyword: keyword.value.trim() } : {})
    };
    const res = await getCampaigns(params);
    // request 工具已拆掉外层 code/data，列表本身是分页对象。
    campaignList.value = Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    console.warn('获取营销活动失败:', error);
    campaignList.value = [];
    uni.showToast({ title: error?.message || '获取活动失败', icon: 'none' });
  } finally {
    loading.value = false;
    uni.stopPullDownRefresh();
  }
};

// 获取当前用户报名总数
const fetchEnrollCount = async () => {
  if (!userStore.isLoggedIn) return;
  try {
    const res = await getEnrollments({ page: 1, limit: 100 });
    const list = Array.isArray(res?.data) ? res.data : [];
    enrollCount.value = list.filter((i) => i.enroll_status !== 'cancelled').length;
  } catch (e) {
    // 静默处理
  }
};

onPullDownRefresh(() => {
  fetchCampaigns();
  fetchEnrollCount();
});

onShow(() => {
  showMiniProgramShareMenu();
  fetchCampaigns();
  fetchEnrollCount();
});

onMounted(() => {
  fetchCampaigns();
  fetchEnrollCount();
});
</script>

<style lang="scss" scoped>
.marketing-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding-bottom: 40rpx;
}

.sticky-filter {
  background: #ffffff;
  padding-bottom: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.03);

  .search-wrap {
    padding: 16rpx 28rpx 12rpx;

    .search-box {
      display: flex;
      align-items: center;
      height: 76rpx;
      background: #f1f5f9;
      border-radius: 16rpx;
      padding: 0 24rpx;

      .search-input {
        flex: 1;
        font-size: 26rpx;
        color: #1e293b;
        margin-left: 16rpx;
      }

      .placeholder-text {
        color: #94a3b8;
        font-size: 26rpx;
      }

      .clear-btn {
        padding: 8rpx;
      }
    }
  }

  .type-scroll {
    width: 100%;
    white-space: nowrap;

    .type-bar {
      display: inline-flex;
      flex-wrap: nowrap;
      align-items: center;
      padding: 8rpx 28rpx 12rpx;
      gap: 16rpx;
      box-sizing: border-box;

      .type-tab-item {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        white-space: nowrap;
        padding: 12rpx 26rpx;
        border-radius: 32rpx;
        background: #f1f5f9;
        transition: all 0.2s ease;

        .tab-label {
          font-size: 26rpx;
          color: #64748b;
          font-weight: 500;
          white-space: nowrap;
          word-break: keep-all;
          line-height: 1.2;
        }

        &.active {
          background: #eff6ff;

          .tab-label {
            color: #2563eb;
            font-weight: 600;
          }
        }
      }
    }
  }
}

.campaign-container {
  padding: 24rpx 28rpx;

  /* 我的活动报名入口卡片 */
  .my-enroll-bar {
    margin-bottom: 24rpx;
    background: #ffffff;
    border-radius: 18rpx;
    padding: 20rpx 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.04);
    border: 1rpx solid #e0e7ff;
    transition: all 0.2s ease;

    &:active {
      background: #f8fafc;
    }

    .enroll-bar-left {
      display: flex;
      align-items: center;
      gap: 18rpx;
      flex: 1;

      .enroll-bar-icon {
        width: 72rpx;
        height: 72rpx;
        border-radius: 16rpx;
        background: #eff6ff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .enroll-bar-info {
        display: flex;
        flex-direction: column;
        gap: 6rpx;

        .enroll-bar-title-row {
          display: flex;
          align-items: center;
          gap: 12rpx;

          .enroll-bar-title {
            font-size: 28rpx;
            font-weight: 600;
            color: #1e293b;
          }

          .enroll-bar-badge {
            padding: 2rpx 12rpx;
            background: #dbeafe;
            border-radius: 12rpx;
            font-size: 20rpx;
            font-weight: 600;
            color: #2563eb;
          }
        }

        .enroll-bar-desc {
          font-size: 22rpx;
          color: #64748b;
          line-height: 1.3;
        }
      }
    }

    .enroll-bar-right {
      display: flex;
      align-items: center;
      gap: 4rpx;
      padding-left: 16rpx;
      flex-shrink: 0;

      .enroll-bar-action {
        font-size: 24rpx;
        font-weight: 600;
        color: #2563eb;
      }
    }
  }

  .promo-banner {
    margin-bottom: 28rpx;
    background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
    border-radius: 20rpx;
    padding: 24rpx 28rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.18);

    .promo-banner__content {
      flex: 1;

      .promo-badge {
        display: inline-flex;
        align-items: center;
        gap: 6rpx;
        background: rgba(255, 255, 255, 0.2);
        padding: 4rpx 14rpx;
        border-radius: 8rpx;
        font-size: 20rpx;
        color: #ffffff;
        font-weight: 500;
        margin-bottom: 8rpx;
      }

      .promo-title {
        display: block;
        font-size: 30rpx;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 0.5rpx;
      }

      .promo-desc {
        display: block;
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.85);
        margin-top: 6rpx;
      }
    }

    .promo-banner__action {
      display: flex;
      align-items: center;
      gap: 4rpx;
      padding: 10rpx 18rpx;
      background: rgba(255, 255, 255, 0.16);
      border-radius: 28rpx;
      font-size: 22rpx;
      color: #ffffff;
      font-weight: 500;
      white-space: nowrap;
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;

    .loading-text {
      margin-top: 20rpx;
      font-size: 26rpx;
      color: #64748b;
    }
  }

  .campaign-list {
    display: flex;
    flex-direction: column;
    gap: 28rpx;
  }

  .campaign-card {
    background: #ffffff;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 18rpx rgba(15, 23, 42, 0.05);
    border: 1rpx solid #f1f5f9;
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.99);
    }

    .card-cover-box {
      position: relative;
      width: 100%;
      height: 300rpx;
      background: #e2e8f0;

      .card-cover-img {
        width: 100%;
        height: 100%;
      }

      .cover-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 80rpx;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.35) 100%);
      }

      .cover-type-tag {
        position: absolute;
        top: 20rpx;
        left: 20rpx;
        padding: 6rpx 16rpx;
        border-radius: 8rpx;
        font-size: 22rpx;
        font-weight: 600;
        color: #ffffff;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(4px);

        &.order {
          background: #2563eb;
        }

        &.promotion {
          background: #e11d48;
        }

        &.new {
          background: #059669;
        }

        &.clearance {
          background: #d97706;
        }
      }

      .cover-status-badge {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        font-size: 22rpx;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.92);
        color: #059669;

        &.ongoing {
          color: #059669;
        }

        &.upcoming {
          color: #2563eb;
        }

        &.ended {
          color: #94a3b8;
          background: rgba(241, 245, 249, 0.92);
        }
      }
    }

    .card-body {
      padding: 24rpx;

      .card-title-row {
        margin-bottom: 8rpx;

        .card-title {
          font-size: 32rpx;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.4;
        }
      }

      .card-summary {
        font-size: 24rpx;
        color: #64748b;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        margin-bottom: 16rpx;
      }

      .discount-row {
        display: flex;
        align-items: center;
        gap: 8rpx;
        background: #fff1f2;
        padding: 10rpx 16rpx;
        border-radius: 10rpx;
        margin-bottom: 16rpx;

        .discount-text {
          font-size: 24rpx;
          font-weight: 600;
          color: #e11d48;
        }
      }

      .preview-products {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
        background: #f8fafc;
        border-radius: 12rpx;
        padding: 14rpx 18rpx;
        margin-bottom: 20rpx;

        .preview-prod-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 22rpx;

          .prod-model {
            color: #334155;
            font-weight: 500;
            max-width: 60%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .prod-price-text {
            color: #ef4444;
            font-weight: 500;

            .price-val {
              font-weight: 700;
              font-size: 24rpx;
            }
          }
        }
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 16rpx;
        border-top: 1rpx solid #f1f5f9;

        .time-box {
          display: flex;
          align-items: center;
          gap: 8rpx;

          .time-text {
            font-size: 24rpx;
            color: #64748b;
            font-weight: 500;
          }
        }

        .action-btn-wrap {
          display: flex;
          align-items: center;
          gap: 12rpx;

          .status-enrolled {
            display: flex;
            align-items: center;
            gap: 6rpx;
            padding: 10rpx 20rpx;
            background: #ecfdf5;
            border-radius: 24rpx;
            font-size: 24rpx;
            font-weight: 600;
            color: #059669;
          }

          .btn-enroll-now {
            display: flex;
            align-items: center;
            gap: 6rpx;
            padding: 10rpx 24rpx;
            background: #2563eb;
            border-radius: 28rpx;
            font-size: 24rpx;
            font-weight: 600;
            color: #ffffff;
            box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.25);
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 40rpx;
    text-align: center;

    .empty-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #334155;
      margin-top: 24rpx;
    }

    .empty-desc {
      font-size: 24rpx;
      color: #94a3b8;
      margin-top: 8rpx;
      margin-bottom: 32rpx;
    }

    .empty-reset-btn {
      padding: 0 36rpx;
      height: 72rpx;
      line-height: 72rpx;
      background: #2563eb;
      color: #ffffff;
      font-size: 26rpx;
      border-radius: 36rpx;
    }
  }
}
</style>
