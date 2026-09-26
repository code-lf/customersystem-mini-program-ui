<template>
  <view class="detail-page">
    <!-- 顶部系统统一导航：避免微信小程序右上角胶囊冲突，胶囊位置不放置按钮 -->
    <AppNavbar title="活动详情" bgColor="#ffffff" :border="true" />

    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <up-icon name="loading" size="32" color="#2563eb" />
      <text class="loading-text">正在加载活动详情...</text>
    </view>

    <!-- 详情内容区 -->
    <view v-else-if="campaign" class="detail-body">
      <!-- 头部大图与状态 -->
      <view class="hero-cover">
        <image
          class="hero-img"
          :src="campaign.cover_image || 'http://gh.starall.cn/static/resource/aircon/central-default.png'"
          mode="aspectFill"
        />
        <view class="hero-overlay" />
        <view class="hero-tag-bar">
          <view class="type-pill" :class="campaign.campaign_type">
            {{ formatTypeName(campaign.campaign_type) }}
          </view>
          <view class="status-pill" :class="campaign.campaign_status">
            {{ campaignStatusText }}
          </view>
        </view>
      </view>

      <!-- 活动主标题与倒计时 -->
      <view class="section-card title-card">
        <text class="campaign-title">{{ campaign.campaign_title }}</text>
        <text class="campaign-summary">{{ campaign.summary }}</text>

        <!-- 倒计时 / 时间卡条 -->
        <view class="time-strip">
          <view class="time-item">
            <up-icon name="calendar" size="14" color="#64748b" />
            <text class="time-label">活动周期：</text>
            <text class="time-val">{{ formatTimeRangeDisplay(campaign.start_time, campaign.end_time) }}</text>
          </view>
          <view v-if="daysRemaining >= 0" class="countdown-tag">
            <up-icon name="clock-fill" size="12" color="#ea580c" />
            <text>仅剩 {{ daysRemaining }} 天</text>
          </view>
        </view>

        <!-- 政策福利亮点 -->
        <view v-if="campaign.remark" class="benefit-box">
          <view class="benefit-head">
            <up-icon name="gift-fill" size="16" color="#dc2626" />
            <text class="benefit-head-title">专享优惠政策</text>
          </view>
          <text class="benefit-content">{{ campaign.remark }}</text>
        </view>
      </view>

      <!-- 页面内部专属分享卡片（按需求：将分享功能集中在活动详情页面内做分享） -->
      <view class="share-promo-card">
        <view class="share-promo-content">
          <view class="share-promo-left">
            <view class="share-icon-wrap">
              <up-icon name="share" size="20" color="#2563eb" />
            </view>
            <view class="share-text-wrap">
              <text class="share-main-title">分享特惠活动给同行或团队</text>
              <text class="share-sub-title">分享活动详情给同行或团队</text>
            </view>
          </view>
          <button class="share-card-btn" open-type="share" @click="handleNativeShare">
            <up-icon name="share" size="14" color="#ffffff" />
            <text>立即分享</text>
          </button>
        </view>
      </view>

      <!-- 已报名状态横幅 -->
      <view v-if="isEnrolled" class="enrolled-status-card">
        <view class="enrolled-icon">
          <up-icon name="checkmark-circle-fill" size="24" color="#10b981" />
        </view>
        <view class="enrolled-info">
          <text class="enrolled-title">您已成功报名此活动</text>
          <text class="enrolled-desc">您可在“我的报名”中查看报名状态。</text>
        </view>
        <view class="enrolled-action" @click="openPage('/pages/marketing/enrollments')">
          <text>查看进度</text>
          <up-icon name="arrow-right" size="12" color="#2563eb" />
        </view>
      </view>

      <!-- 活动特惠机型 -->
      <view v-if="campaign.items && campaign.items.length > 0" class="section-card">
        <view class="section-head">
          <view class="head-left">
            <view class="decor-bar" />
            <text class="head-title">活动商品 ({{ campaign.items.length }})</text>
          </view>
        </view>

        <view class="product-list">
          <view
            v-for="prod in campaign.items"
            :key="prod.item_id"
            class="prod-card"
            @click="handleProductClick(prod)"
          >
            <image
              class="prod-thumb"
              :src="prod.image_snapshot || 'http://gh.starall.cn/static/resource/aircon/central-default.png'"
              mode="aspectFit"
            />
            <view class="prod-detail">
              <text class="prod-name">{{ prod.goods_name_snapshot }}</text>
              <text class="prod-model">{{ prod.model_snapshot }}</text>

              <view class="price-row">
                <view class="price-current">
                  <text class="cur-symbol">¥</text>
                  <text class="cur-val">{{ Number(prod.campaign_price || 0).toLocaleString() }}</text>
                </view>
                <text v-if="prod.origin_price" class="price-origin">
                  原价 ¥{{ Number(prod.origin_price).toLocaleString() }}
                </text>
              </view>

            </view>
          </view>
        </view>
      </view>

      <!-- 活动规则与说明 -->
      <view v-if="campaign.content" class="section-card">
        <view class="section-head">
          <view class="head-left">
            <view class="decor-bar" />
            <text class="head-title">活动细则与政策说明</text>
          </view>
        </view>
        <view class="policy-body">
          <text class="policy-text">{{ campaign.content }}</text>
        </view>
      </view>

      <!-- 活动组织方与专属顾问 -->
      <view v-if="campaign.owner_name" class="section-card consultant-card">
        <view class="section-head">
          <view class="head-left">
            <view class="decor-bar" />
            <text class="head-title">活动专属服务对接</text>
          </view>
        </view>
        <view class="consultant-info">
          <view class="avatar-circle">
            <up-icon name="account-fill" size="24" color="#2563eb" />
          </view>
          <view class="consultant-text">
            <text class="c-name">{{ campaign.owner_name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 活动异常或未找到备用展示 -->
    <view v-else class="empty-state">
      <up-icon name="info-circle" size="48" color="#94a3b8" />
      <text class="empty-title">暂未获取到活动内容</text>
      <text class="empty-desc">可能活动已结束或已被调整</text>
      <button class="empty-btn" @click="handleBack">返回营销活动列表</button>
    </view>

    <!-- 底部固定操作栏 -->
    <view v-if="campaign" class="bottom-action-bar">
      <view class="bar-left">
        <!-- 详情页专属分享按钮 -->
        <button class="action-icon-btn action-icon-btn--share" open-type="share" @click="handleNativeShare">
          <up-icon name="share" size="20" color="#2563eb" />
          <text class="icon-label icon-label--share">分享活动</text>
        </button>
        <view class="action-icon-btn" @click="openPage('/pages/marketing/enrollments')">
          <up-icon name="order" size="20" color="#475569" />
          <text class="icon-label">我的报名</text>
        </view>
      </view>

      <view class="bar-right">
        <button
          v-if="isEnrolled"
          class="btn-enrolled-status"
          @click="openPage('/pages/marketing/enrollments')"
        >
          <up-icon name="checkmark" size="16" color="#ffffff" />
          <text>已报名 · 查看跟进</text>
        </button>
        <button v-else-if="campaign.can_enroll === false" class="btn-enrolled-status" disabled>
          <text>暂不可报名</text>
        </button>
        <button
          v-else
          class="btn-primary-enroll"
          @click="openEnrollModal"
        >
          立即报名参与活动
        </button>
      </view>
    </view>

    <!-- 报名信息提交弹窗 -->
    <up-popup
      :show="showEnrollModal"
      mode="bottom"
      round="24"
      :closeable="true"
      @close="showEnrollModal = false"
    >
      <view class="enroll-form-panel">
        <view class="panel-header">
          <text class="panel-title">报名参加活动</text>
          <text class="panel-sub">请填写真实联系人信息，以便后续跟进</text>
        </view>

        <scroll-view class="panel-scroll" scroll-y>
          <view class="form-group">
            <text class="field-label">联系人姓名 <text class="req">*</text></text>
            <view class="input-wrap">
              <input
                v-model="enrollForm.contact_name"
                class="form-input"
                placeholder="请输入联系人姓名"
                maxlength="20"
              />
            </view>
          </view>

          <view class="form-group">
            <text class="field-label">联系电话 <text class="req">*</text></text>
            <view class="input-wrap">
              <input
                v-model="enrollForm.contact_mobile"
                class="form-input"
                type="number"
                placeholder="请输入手机号"
                maxlength="11"
              />
            </view>
          </view>

          <view class="form-group">
            <text class="field-label">意向机型或需求备注</text>
            <view class="textarea-wrap">
              <textarea
                v-model="enrollForm.remark"
                class="form-textarea"
                placeholder="请填写您意向订购的机型、套数或交期要求等"
                maxlength="200"
              />
            </view>
          </view>
        </scroll-view>

        <view class="panel-footer">
          <button
            class="submit-enroll-btn"
            :loading="submitting"
            :disabled="submitting"
            @click="handleSubmitEnroll"
          >
            确认提交报名
          </button>
        </view>
      </view>
    </up-popup>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { onLoad, onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { getCampaignDetail, enrollCampaign } from '@/api/marketing';
import { openPage } from '@/utils/pages';
import { createShareAppMessageOptions, createShareTimelineOptions, showMiniProgramShareMenu } from '@/utils/share';
import AppNavbar from '@/components/app-navbar.vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

const campaignId = ref(null);
const campaign = ref(null);
const loading = ref(true);
const submitting = ref(false);
const showEnrollModal = ref(false);

const enrollForm = reactive({
  contact_name: '',
  contact_mobile: '',
  remark: ''
});

onShow(() => {
  showMiniProgramShareMenu();
});

onShareAppMessage(() => {
  const c = campaign.value;
  const title = c?.campaign_title ? `【营销活动】${c.campaign_title}` : '格宏营销活动详情';
  const img = c?.cover_image || '';
  const path = `/pages/marketing/detail?id=${campaignId.value}`;
  return createShareAppMessageOptions(title, img, path);
});

onShareTimeline(() => {
  const c = campaign.value;
  const title = c?.campaign_title ? `【营销活动】${c.campaign_title}` : '格宏营销活动详情';
  const img = c?.cover_image || '';
  const query = `id=${campaignId.value}`;
  return createShareTimelineOptions(title, img, query);
});

// 解析页面参数（支持 id, campaign_id, scene 二维码场景值, H5 URL 以及页面栈取参）
const resolveCampaignId = (options = {}) => {
  if (options?.id) return options.id;
  if (options?.campaign_id) return options.campaign_id;
  if (options?.campaignId) return options.campaignId;
  if (options?.activity_id) return options.activity_id;

  // 微信小程序扫码 scene 参数解析
  if (options?.scene) {
    try {
      const decoded = decodeURIComponent(options.scene);
      if (decoded.includes('id=')) {
        const match = decoded.match(/id=([^&]+)/);
        if (match && match[1]) return match[1];
      }
      if (/^\d+$/.test(decoded)) return decoded;
    } catch (e) {
      // ignore
    }
  }

  // #ifdef H5
  try {
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      const queryStr = search.includes('?') ? search.slice(1) : (hash.includes('?') ? hash.split('?')[1] : '');
      if (queryStr) {
        const params = new URLSearchParams(queryStr);
        const urlId = params.get('id') || params.get('campaign_id') || params.get('campaignId');
        if (urlId) return urlId;
      }
    }
  } catch (e) {
    // ignore
  }
  // #endif

  try {
    const pages = getCurrentPages();
    const cur = pages[pages.length - 1];
    if (cur?.options?.id || cur?.options?.campaign_id) {
      return cur.options.id || cur.options.campaign_id;
    }
    if (cur?.$page?.options?.id || cur?.$page?.options?.campaign_id) {
      return cur.$page.options.id || cur.$page.options.campaign_id;
    }
  } catch (e) {
    // ignore
  }

  return null;
};

onLoad((options) => {
  const targetId = resolveCampaignId(options);
  if (targetId) {
    campaignId.value = targetId;
    fetchDetail(targetId);
  } else {
    // 缺少活动 ID 时明确提示，避免误打开第一条活动。
    loading.value = false;
    uni.showToast({ title: '缺少活动编号', icon: 'none' });
  }
});

const isEnrolled = computed(() => {
  const record = campaign.value?.my_latest_enrollment;
  return Boolean(record && record.enroll_status !== 'cancelled');
});

// 根据后端发布时间和起止时间展示用户可理解的活动状态。
const campaignStatusText = computed(() => {
  const item = campaign.value;
  if (!item || item.campaign_status !== 'published') return '已结束';
  if (Number(item.start_time) > 0 && Date.now() < Number(item.start_time) * 1000) return '即将开始';
  if (Number(item.end_time) > 0 && Date.now() > Number(item.end_time) * 1000) return '已结束';
  return '进行中';
});

const daysRemaining = computed(() => {
  if (!campaign.value?.end_time) return -1;
  const end = Number(campaign.value.end_time) * 1000;
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const formatTypeName = (type) => {
  const map = { order: '订货会', promotion: '限时促销', new: '新品上市', clearance: '清仓特惠' };
  return map[type] || '专题活动';
};

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

const formatTimeRangeDisplay = (start, end) => {
  const s = formatDateVal(start);
  const e = formatDateVal(end);
  if (s && e) return `${s} 至 ${e}`;
  if (s) return `${s} 起`;
  if (e) return `截止至 ${e}`;
  return '长期有效';
};

const handleBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    openPage('/pages/marketing/index');
  }
};

const handleNativeShare = () => {
  // #ifndef MP-WEIXIN
  const title = campaign.value?.campaign_title || '格宏营销活动';
  if (typeof uni.setClipboardData === 'function') {
    uni.setClipboardData({
      data: `【格宏家电助手】${title}`,
      success: () => uni.showToast({ title: '活动已复制，可分享好友', icon: 'none' })
    });
  } else {
    uni.showToast({ title: '点击右上角“...”即可分享给同行朋友', icon: 'none' });
  }
  // #endif
};

const handleProductClick = (prod) => {
  if (prod.goods_id) {
    openPage('/pages/product/detail', { id: prod.goods_id });
  }
};

const fetchDetail = async (id) => {
  loading.value = true;
  try {
    const res = await getCampaignDetail(id);
    campaign.value = res?.campaign_id ? res : null;
  } catch (error) {
    console.warn('获取活动详情失败:', error);
    campaign.value = null;
    uni.showToast({ title: error?.message || '获取活动详情失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const openEnrollModal = () => {
  if (!campaign.value?.campaign_id || campaign.value.can_enroll === false) {
    uni.showToast({ title: '当前活动暂不可报名', icon: 'none' });
    return;
  }
  if (!userStore.isLoggedIn) {
    uni.showModal({
      title: '温馨提示',
      content: '请先登录后再报名参与营销活动',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) openPage('/pages/auth/login');
      }
    });
    return;
  }

  // 预填充用户信息
  const u = userStore.userInfo || {};
  enrollForm.contact_name = u.nickname || u.username || '';
  enrollForm.contact_mobile = u.mobile || '';
  showEnrollModal.value = true;
};

const handleSubmitEnroll = async () => {
  if (!enrollForm.contact_name.trim()) {
    return uni.showToast({ title: '请填写联系人姓名', icon: 'none' });
  }
  if (!enrollForm.contact_mobile.trim() || !/^1\d{10}$/.test(enrollForm.contact_mobile.trim())) {
    return uni.showToast({ title: '请填写正确的11位手机号', icon: 'none' });
  }

  submitting.value = true;
  uni.showLoading({ title: '正在提交报名...' });
  try {
    const payload = {
      contact_name: enrollForm.contact_name.trim(),
      contact_mobile: enrollForm.contact_mobile.trim(),
      remark: enrollForm.remark.trim()
    };
    const result = await enrollCampaign(campaignId.value, payload);
    if (!result?.enrollment_id) throw new Error('报名接口未返回报名编号');
    uni.hideLoading();
    showEnrollModal.value = false;

    // 报名成功后重新获取后端状态，避免本地状态与实际记录不一致。
    await fetchDetail(campaignId.value);

    uni.showModal({
      title: '报名提交成功',
      content: '报名已提交，可前往“我的报名”查看处理进度。',
      confirmText: '查看进度',
      cancelText: '留在本页',
      success: (modalRes) => {
        if (modalRes.confirm) {
          openPage('/pages/marketing/enrollments');
        }
      }
    });
  } catch (error) {
    uni.hideLoading();
    console.warn('报名提交失败:', error);
    uni.showToast({ title: error?.message || '报名提交失败，请重试', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding-bottom: 160rpx;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 180rpx 0;

  .loading-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #64748b;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 40rpx;
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
    margin-top: 10rpx;
    margin-bottom: 36rpx;
  }

  .empty-btn {
    padding: 0 40rpx;
    height: 76rpx;
    line-height: 76rpx;
    background: #2563eb;
    color: #ffffff;
    font-size: 26rpx;
    border-radius: 38rpx;
  }
}

.detail-body {
  padding: 0 0 40rpx;
}

.hero-cover {
  position: relative;
  width: 100%;
  height: 420rpx;
  background: #e2e8f0;

  .hero-img {
    width: 100%;
    height: 100%;
  }

  .hero-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120rpx;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(15, 23, 42, 0.45) 100%);
  }

  .hero-tag-bar {
    position: absolute;
    top: 24rpx;
    left: 28rpx;
    right: 28rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .type-pill {
      padding: 8rpx 20rpx;
      border-radius: 8rpx;
      font-size: 24rpx;
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

    .status-pill {
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.95);
      color: #059669;

      &.ongoing {
        color: #059669;
      }
      &.upcoming {
        color: #2563eb;
      }
    }
  }
}

.section-card {
  margin: 24rpx 28rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.04);
}

.title-card {
  margin-top: -30rpx;
  position: relative;
  z-index: 10;

  .campaign-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.4;
    display: block;
    margin-bottom: 12rpx;
  }

  .campaign-summary {
    font-size: 26rpx;
    color: #64748b;
    line-height: 1.5;
    display: block;
    margin-bottom: 24rpx;
  }

  .time-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 20rpx;
    background: #f8fafc;
    border-radius: 12rpx;
    margin-bottom: 20rpx;

    .time-item {
      display: flex;
      align-items: center;
      gap: 10rpx;

      .time-label {
        font-size: 24rpx;
        color: #64748b;
      }

      .time-val {
        font-size: 24rpx;
        color: #1e293b;
        font-weight: 600;
      }
    }

    .countdown-tag {
      display: flex;
      align-items: center;
      gap: 6rpx;
      padding: 4rpx 14rpx;
      background: #ffedd5;
      border-radius: 16rpx;
      font-size: 22rpx;
      font-weight: 600;
      color: #ea580c;
    }
  }

  .benefit-box {
    background: #fff1f2;
    border-radius: 14rpx;
    padding: 18rpx 20rpx;
    border: 1rpx solid #ffe4e6;

    .benefit-head {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 8rpx;

      .benefit-head-title {
        font-size: 26rpx;
        font-weight: 700;
        color: #dc2626;
      }
    }

    .benefit-content {
      font-size: 24rpx;
      color: #991b1b;
      line-height: 1.4;
    }
  }
}

/* 详情页专属分享横幅 */
.share-promo-card {
  margin: 20rpx 28rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 18rpx;
  padding: 20rpx 24rpx;
  border: 1rpx solid #bfdbfe;

  .share-promo-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .share-promo-left {
      display: flex;
      align-items: center;
      gap: 16rpx;
      flex: 1;

      .share-icon-wrap {
        width: 64rpx;
        height: 64rpx;
        border-radius: 16rpx;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .share-text-wrap {
        display: flex;
        flex-direction: column;
        gap: 4rpx;

        .share-main-title {
          font-size: 26rpx;
          font-weight: 700;
          color: #1e3a8a;
        }

        .share-sub-title {
          font-size: 22rpx;
          color: #3b82f6;
          line-height: 1.3;
        }
      }
    }

    .share-card-btn {
      display: inline-flex;
      align-items: center;
      gap: 6rpx;
      padding: 12rpx 24rpx;
      background: #2563eb;
      border-radius: 30rpx;
      font-size: 24rpx;
      font-weight: 600;
      color: #ffffff;
      border: none;
      outline: none;
      line-height: normal;
      margin: 0 0 0 16rpx;
      box-shadow: 0 4rpx 10rpx rgba(37, 99, 235, 0.25);
      flex-shrink: 0;

      &::after {
        border: none;
      }
    }
  }
}

.enrolled-status-card {
  margin: 20rpx 28rpx;
  background: #ecfdf5;
  border-radius: 18rpx;
  padding: 24rpx;
  border: 1rpx solid #a7f3d0;
  display: flex;
  align-items: center;
  gap: 16rpx;

  .enrolled-icon {
    flex-shrink: 0;
  }

  .enrolled-info {
    flex: 1;

    .enrolled-title {
      font-size: 28rpx;
      font-weight: 700;
      color: #065f46;
      display: block;
    }

    .enrolled-desc {
      font-size: 22rpx;
      color: #047857;
      margin-top: 6rpx;
      display: block;
      line-height: 1.3;
    }
  }

  .enrolled-action {
    display: flex;
    align-items: center;
    gap: 4rpx;
    font-size: 24rpx;
    color: #2563eb;
    font-weight: 600;
    flex-shrink: 0;
  }
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;

  .head-left {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .decor-bar {
      width: 6rpx;
      height: 28rpx;
      background: #2563eb;
      border-radius: 4rpx;
    }

    .head-title {
      font-size: 30rpx;
      font-weight: 700;
      color: #0f172a;
    }
  }

  .head-tip {
    font-size: 22rpx;
    color: #94a3b8;
  }
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  .prod-card {
    display: flex;
    gap: 20rpx;
    padding: 16rpx;
    background: #f8fafc;
    border-radius: 14rpx;

    .prod-thumb {
      width: 160rpx;
      height: 160rpx;
      border-radius: 10rpx;
      background: #ffffff;
      flex-shrink: 0;
    }

    .prod-detail {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .prod-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #1e293b;
        line-height: 1.3;
      }

      .prod-model {
        font-size: 22rpx;
        color: #64748b;
        margin-top: 4rpx;
      }

      .price-row {
        display: flex;
        align-items: baseline;
        gap: 14rpx;
        margin-top: 10rpx;

        .price-current {
          color: #ef4444;
          font-weight: 700;

          .cur-symbol {
            font-size: 22rpx;
          }

          .cur-val {
            font-size: 32rpx;
          }
        }

        .price-origin {
          font-size: 22rpx;
          color: #94a3b8;
          text-decoration: line-through;
        }
      }

      .prod-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8rpx;

        .prod-discount-tag {
          font-size: 20rpx;
          color: #e11d48;
          background: #fff1f2;
          padding: 2rpx 10rpx;
          border-radius: 6rpx;
          font-weight: 500;
        }

        .prod-stock {
          font-size: 20rpx;
          color: #64748b;
        }
      }
    }
  }
}

.policy-body {
  .policy-text {
    font-size: 26rpx;
    color: #475569;
    line-height: 1.7;
    white-space: pre-line;
  }
}

.consultant-card {
  .consultant-info {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 16rpx;
    background: #f8fafc;
    border-radius: 16rpx;

    .avatar-circle {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background: #eff6ff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .consultant-text {
      flex: 1;

      .c-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #1e293b;
        display: block;
      }

      .c-phone {
        font-size: 24rpx;
        color: #64748b;
        margin-top: 4rpx;
        display: block;
      }
    }

    .call-btn {
      display: flex;
      align-items: center;
      gap: 6rpx;
      padding: 12rpx 24rpx;
      background: #059669;
      border-radius: 28rpx;
      font-size: 24rpx;
      font-weight: 600;
      color: #ffffff;
      border: none;
      outline: none;
      line-height: normal;
      margin: 0;

      &::after {
        border: none;
      }
    }
  }
}

.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #ffffff;
  padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4rpx 16rpx rgba(15, 23, 42, 0.05);

  .bar-left {
    display: flex;
    align-items: center;
    gap: 32rpx;

    .action-icon-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      outline: none;
      padding: 0;
      margin: 0;
      line-height: 1;

      &::after {
        border: none;
      }

      .icon-label {
        font-size: 20rpx;
        color: #64748b;
        margin-top: 6rpx;
      }

      &--share {
        .icon-label--share {
          color: #2563eb;
          font-weight: 600;
        }
      }
    }
  }

  .bar-right {
    flex: 1;
    margin-left: 28rpx;

    .btn-primary-enroll {
      width: 100%;
      height: 84rpx;
      line-height: 84rpx;
      text-align: center;
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
      color: #ffffff;
      font-size: 30rpx;
      font-weight: 600;
      border-radius: 42rpx;
      box-shadow: 0 6rpx 16rpx rgba(37, 99, 235, 0.35);
      border: none;
      outline: none;

      &::after {
        border: none;
      }
    }

    .btn-enrolled-status {
      width: 100%;
      height: 84rpx;
      background: #059669;
      color: #ffffff;
      font-size: 28rpx;
      font-weight: 600;
      border-radius: 42rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10rpx;
      border: none;
      outline: none;

      &::after {
        border: none;
      }
    }
  }
}

.enroll-form-panel {
  background: #ffffff;
  padding: 32rpx 28rpx calc(32rpx + env(safe-area-inset-bottom));

  .panel-header {
    text-align: center;
    margin-bottom: 28rpx;

    .panel-title {
      font-size: 34rpx;
      font-weight: 700;
      color: #0f172a;
      display: block;
    }

    .panel-sub {
      font-size: 22rpx;
      color: #64748b;
      margin-top: 6rpx;
      display: block;
    }
  }

  .panel-scroll {
    max-height: 60vh;
  }

  .form-group {
    margin-bottom: 24rpx;

    .field-label {
      font-size: 26rpx;
      font-weight: 600;
      color: #334155;
      display: block;
      margin-bottom: 12rpx;

      .req {
        color: #ef4444;
      }
    }

    .input-wrap {
      background: #f8fafc;
      border-radius: 14rpx;
      padding: 0 20rpx;
      height: 76rpx;
      display: flex;
      align-items: center;
      border: 1rpx solid #e2e8f0;

      .form-input {
        width: 100%;
        font-size: 26rpx;
        color: #0f172a;
      }
    }

    .budget-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 14rpx;

      .budget-tag {
        padding: 12rpx 22rpx;
        border-radius: 12rpx;
        background: #f1f5f9;
        font-size: 24rpx;
        color: #475569;
        transition: all 0.2s;

        &.active {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 600;
          border: 1rpx solid #bfdbfe;
        }
      }
    }

    .textarea-wrap {
      background: #f8fafc;
      border-radius: 14rpx;
      padding: 16rpx 20rpx;
      border: 1rpx solid #e2e8f0;

      .form-textarea {
        width: 100%;
        height: 140rpx;
        font-size: 26rpx;
        color: #0f172a;
      }
    }
  }

  .panel-footer {
    margin-top: 32rpx;

    .submit-enroll-btn {
      width: 100%;
      height: 84rpx;
      line-height: 84rpx;
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
      color: #ffffff;
      font-size: 30rpx;
      font-weight: 600;
      border-radius: 42rpx;
      box-shadow: 0 6rpx 16rpx rgba(37, 99, 235, 0.35);
      border: none;
      outline: none;

      &::after {
        border: none;
      }
    }
  }
}
</style>
