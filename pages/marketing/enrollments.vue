<template>
  <view class="enrollments-page">
    <AppNavbar title="我的活动报名" bgColor="#ffffff" :border="true" />

    <!-- 状态筛选切换栏 -->
    <view class="status-tab-bar">
      <view
        v-for="tab in statusTabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: currentStatus === tab.key }"
        @click="switchStatus(tab.key)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <view v-if="currentStatus === tab.key" class="tab-indicator" />
      </view>
    </view>

    <!-- 报名列表区域 -->
    <view class="list-container">
      <!-- 加载中 -->
      <view v-if="loading" class="loading-state">
        <up-icon name="loading" size="28" color="#2563eb" />
        <text class="loading-text">正在查询报名记录...</text>
      </view>

      <!-- 列表渲染 -->
      <view v-else-if="enrollmentList.length > 0" class="records-wrap">
        <view
          v-for="item in enrollmentList"
          :key="item.id"
          class="enroll-card"
        >
          <!-- 头部：活动标题与状态标签 -->
          <view class="card-head">
            <view class="head-title-wrap" @click="openCampaign(item.campaign_id)">
              <text class="campaign-title">{{ item.campaign_title || '营销活动报名' }}</text>
              <up-icon name="arrow-right" size="12" color="#94a3b8" />
            </view>
            <view class="status-pill" :class="item.status">
              {{ formatStatusName(item.status) }}
            </view>
          </view>

          <!-- 报名基本信息 -->
          <view class="card-body">
            <view class="info-row">
              <text class="info-label">报名时间：</text>
              <text class="info-val">{{ item.create_time }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">联系人：</text>
              <text class="info-val">{{ item.contact_name }} ({{ item.mobile }})</text>
            </view>
            <view v-if="item.company_name" class="info-row">
              <text class="info-label">申报企业：</text>
              <text class="info-val">{{ item.company_name }}</text>
            </view>
            <view v-if="item.intended_amount" class="info-row">
              <text class="info-label">意向规模：</text>
              <text class="info-val highlight">{{ item.intended_amount }}</text>
            </view>
            <view v-if="item.remark" class="info-row">
              <text class="info-label">需求备注：</text>
              <text class="info-val">{{ item.remark }}</text>
            </view>

            <!-- 业务员对接进度卡 -->
            <view v-if="item.status !== 'cancelled'" class="salesman-box">
              <view class="salesman-left">
                <up-icon name="kefu-ermai" size="18" color="#2563eb" />
                <view class="salesman-detail">
                  <text class="sm-name">专属对接：{{ item.salesman_name || '大客户经理' }}</text>
                  <text class="sm-tip">{{ item.quote_info || (item.status === 'followed' ? '已安排专属特惠配单' : '2小时内电话沟通方案') }}</text>
                </view>
              </view>
              <button
                v-if="item.salesman_phone"
                class="phone-call-btn"
                @click="callSalesman(item.salesman_phone)"
              >
                <up-icon name="phone-fill" size="12" color="#2563eb" />
                <text>致电</text>
              </button>
            </view>
          </view>

          <!-- 底部操作按钮 -->
          <view class="card-actions">
            <button
              class="action-btn action-btn--secondary"
              @click="openCampaign(item.campaign_id)"
            >
              查看活动
            </button>

            <button
              v-if="item.status === 'submitted' || item.status === 'followed'"
              class="action-btn action-btn--cancel"
              @click="handleCancelEnrollment(item)"
            >
              取消报名
            </button>

            <button
              v-if="item.salesman_phone"
              class="action-btn action-btn--primary"
              @click="callSalesman(item.salesman_phone)"
            >
              联系业务经理
            </button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <up-icon name="order" size="48" color="#cbd5e1" />
        <text class="empty-title">暂无相关报名记录</text>
        <text class="empty-desc">您尚未报名此分类活动，立即前往浏览热门营销政策吧</text>
        <button class="go-marketing-btn" @click="openPage('/pages/marketing/index')">
          去浏览热门营销活动
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { onPullDownRefresh, onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { getEnrollments, cancelEnrollment } from '@/api/marketing';
import { openPage } from '@/utils/pages';
import { createShareAppMessageOptions, createShareTimelineOptions, showMiniProgramShareMenu } from '@/utils/share';
import AppNavbar from '@/components/app-navbar.vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

onShareAppMessage(() => createShareAppMessageOptions('格宏家电助手·营销活动专区', '', '/pages/marketing/index'));
onShareTimeline(() => createShareTimelineOptions('格宏家电助手·营销活动专区', '', ''));

const currentStatus = ref('all');
const loading = ref(false);
const enrollmentList = ref([]);

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'submitted', label: '待跟进' },
  { key: 'followed', label: '已跟进' },
  { key: 'quoted', label: '已出报价' },
  { key: 'cancelled', label: '已取消' }
];

const formatStatusName = (status) => {
  const map = {
    submitted: '待跟进',
    followed: '已跟进',
    quoted: '已出报价',
    cancelled: '已取消'
  };
  return map[status] || '已提交';
};

const handleBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    openPage('/pages/marketing/index');
  }
};

const switchStatus = (key) => {
  currentStatus.value = key;
  fetchList();
};

const openCampaign = (campaignId) => {
  if (campaignId) {
    openPage('/pages/marketing/detail', { id: campaignId });
  }
};

const callSalesman = (phone) => {
  if (!phone) return;
  uni.makePhoneCall({
    phoneNumber: phone,
    fail: () => {}
  });
};

const fetchList = async () => {
  if (!userStore.isLoggedIn) {
    enrollmentList.value = [];
    return;
  }

  loading.value = true;
  try {
    const res = await getEnrollments({ status: currentStatus.value });
    const list = Array.isArray(res) ? res : (res?.data || []);
    enrollmentList.value = list;
  } catch (error) {
    console.warn('获取我的报名记录失败:', error);
  } finally {
    loading.value = false;
    uni.stopPullDownRefresh();
  }
};

const handleCancelEnrollment = (item) => {
  uni.showModal({
    title: '确认取消报名？',
    content: `取消后专属业务经理将停止活动政策锁定（活动：${item.campaign_title || ''}）。`,
    confirmText: '确定取消',
    confirmColor: '#ef4444',
    cancelText: '再想想',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在取消...' });
        try {
          await cancelEnrollment(item.id);
          uni.hideLoading();
          uni.showToast({ title: '已取消报名', icon: 'success' });
          fetchList();
        } catch (e) {
          uni.hideLoading();
          uni.showToast({ title: e?.message || '取消失败，请重试', icon: 'none' });
        }
      }
    }
  });
};

onPullDownRefresh(() => {
  fetchList();
});

onShow(() => {
  showMiniProgramShareMenu();
  fetchList();
});

onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.enrollments-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding-bottom: 40rpx;
}

.status-tab-bar {
  display: flex;
  background: #ffffff;
  padding: 12rpx 20rpx 0;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.03);

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 16rpx;
    position: relative;

    .tab-text {
      font-size: 26rpx;
      color: #64748b;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    &.active {
      .tab-text {
        color: #2563eb;
        font-weight: 600;
      }

      .tab-indicator {
        position: absolute;
        bottom: 0;
        width: 48rpx;
        height: 4rpx;
        background: #2563eb;
        border-radius: 4rpx;
      }
    }
  }
}

.list-container {
  padding: 24rpx 28rpx;

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;

    .loading-text {
      margin-top: 20rpx;
      font-size: 26rpx;
      color: #64748b;
    }
  }

  .records-wrap {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  .enroll-card {
    background: #ffffff;
    border-radius: 18rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.04);
    border: 1rpx solid #f1f5f9;

    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 18rpx;
      border-bottom: 1rpx solid #f1f5f9;

      .head-title-wrap {
        display: flex;
        align-items: center;
        gap: 8rpx;
        flex: 1;
        margin-right: 16rpx;

        .campaign-title {
          font-size: 28rpx;
          font-weight: 700;
          color: #0f172a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .status-pill {
        padding: 6rpx 16rpx;
        border-radius: 12rpx;
        font-size: 22rpx;
        font-weight: 600;

        &.submitted {
          background: #fef3c7;
          color: #d97706;
        }

        &.followed {
          background: #eff6ff;
          color: #2563eb;
        }

        &.quoted {
          background: #ecfdf5;
          color: #059669;
        }

        &.cancelled {
          background: #f1f5f9;
          color: #94a3b8;
        }
      }
    }

    .card-body {
      padding: 18rpx 0;
      display: flex;
      flex-direction: column;
      gap: 12rpx;

      .info-row {
        display: flex;
        font-size: 24rpx;

        .info-label {
          color: #64748b;
          width: 140rpx;
          flex-shrink: 0;
        }

        .info-val {
          color: #1e293b;
          flex: 1;

          &.highlight {
            color: #2563eb;
            font-weight: 600;
          }
        }
      }

      .salesman-box {
        margin-top: 12rpx;
        background: #f8fafc;
        border-radius: 12rpx;
        padding: 16rpx 20rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1rpx solid #edf2f7;

        .salesman-left {
          display: flex;
          align-items: center;
          gap: 14rpx;

          .salesman-detail {
            .sm-name {
              display: block;
              font-size: 24rpx;
              font-weight: 600;
              color: #1e293b;
            }

            .sm-tip {
              display: block;
              font-size: 20rpx;
              color: #64748b;
              margin-top: 2rpx;
            }
          }
        }

        .phone-call-btn {
          display: flex;
          align-items: center;
          gap: 6rpx;
          background: #eff6ff;
          color: #2563eb;
          font-size: 22rpx;
          font-weight: 600;
          padding: 8rpx 18rpx;
          border-radius: 20rpx;
          border: 1rpx solid #bfdbfe;
        }
      }
    }

    .card-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 16rpx;
      padding-top: 18rpx;
      border-top: 1rpx solid #f1f5f9;

      .action-btn {
        height: 60rpx;
        line-height: 60rpx;
        padding: 0 24rpx;
        font-size: 24rpx;
        border-radius: 30rpx;
        font-weight: 500;

        &--secondary {
          background: #f1f5f9;
          color: #475569;
        }

        &--cancel {
          background: #fff1f2;
          color: #e11d48;
        }

        &--primary {
          background: #2563eb;
          color: #ffffff;
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
      font-size: 30rpx;
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

    .go-marketing-btn {
      padding: 0 40rpx;
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
