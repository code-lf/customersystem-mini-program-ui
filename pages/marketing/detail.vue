<template>
  <view class="detail-page">
    <!-- 顶部系统统一导航：避免微信小程序右上角胶囊冲突，胶囊位置不放置按钮 -->
    <AppNavbar title="活动详情" bgColor="#ffffff" :border="true" />

    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <AppLoadingSpinner />
      <text class="loading-text">正在加载活动详情...</text>
    </view>

    <!-- 详情内容区 -->
    <view v-else-if="campaign" class="detail-body">
      <!-- 活动没有封面时不展示默认测试图，也不保留大图占位。 -->
      <view v-if="campaign.cover_image" class="hero-cover">
        <image
          class="hero-img"
          :src="campaign.cover_image"
          mode="aspectFill"
        />
        <view class="hero-overlay" />
        <view class="hero-tag-bar">
          <view class="type-pill" :class="campaign.campaign_type">
            {{ campaign.campaign_type_name || campaign.campaign_type }}
          </view>
          <view class="status-pill" :class="campaignStatusClass">
            {{ campaignStatusText }}
          </view>
        </view>
      </view>

      <!-- 活动主标题与倒计时 -->
      <view class="section-card title-card" :class="{ 'title-card--no-cover': !campaign.cover_image }">
        <view v-if="!campaign.cover_image" class="text-tag-bar">
          <text class="text-type-tag">{{ campaign.campaign_type_name || campaign.campaign_type }}</text>
          <text class="text-status-badge" :class="campaignStatusClass">{{ campaignStatusText }}</text>
        </view>
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
          <text class="enrolled-title">{{ formatEnrollmentStatus(latestEnrollment.enroll_status) }}</text>
          <text class="enrolled-desc">您可在“我的报名”中查看报名状态。</text>
        </view>
        <view class="enrolled-action" @click="openPage('/pages/marketing/enrollments')">
          <text>查看报名</text>
          <up-icon name="arrow-right" size="12" color="#2563eb" />
        </view>
      </view>

      <view v-if="latestEnrollment && (latestEnrollment.items?.length || latestEnrollment.total_amount != null)" class="section-card">
        <CampaignEnrollmentSummary :record="latestEnrollment" title="我的报名商品" />
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
            <!-- 活动商品统一使用文字明细，即使有图片也不展示缩略图和占位。 -->
            <view class="prod-detail">
              <text class="prod-name">{{ prod.goods_name_snapshot }}</text>
              <text class="prod-model">{{ prod.model_snapshot }}</text>
              <!-- 每组商品数量直接使用后台配置，不使用起订量替代。 -->
              <text v-if="prod.group_quantity != null" class="group-description">每组含 {{ prod.group_quantity }} {{ prod.unit_snapshot || '件' }}</text>

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
          <!-- 富文本由小程序原生组件渲染，兼容旧活动的纯文字与换行。 -->
          <rich-text class="policy-text" :nodes="campaignRichContent" />
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
      <button class="empty-btn" @click="handleBack">返回特惠货源活动列表</button>
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
          v-if="isEnrolled && campaign.can_enroll !== true"
          class="btn-enrolled-status"
          @click="openPage('/pages/marketing/enrollments')"
        >
          <up-icon name="checkmark" size="16" color="#ffffff" />
          <text>{{ formatEnrollmentStatus(latestEnrollment.enroll_status) }} · 查看报名</text>
        </button>
        <button
          v-else-if="!userStore.isLoggedIn"
          class="btn-primary-enroll"
          @click="openEnrollModal"
        >
          登录后报名参与
        </button>
        <button v-else-if="campaign.can_enroll === false || !enrollmentProducts.length" class="btn-enrolled-status" disabled>
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
      @close="closeEnrollModal"
    >
      <view class="enroll-form-panel">
        <view class="panel-header">
          <text class="panel-title">报名参加活动</text>
          <text class="panel-sub">全部商品组成一组，仅支持按整组订购</text>
        </view>

        <scroll-view class="panel-scroll" scroll-y>
          <!-- 统一填写订购组数；组内商品配置由后台维护，不提供单品数量编辑。 -->
          <view class="form-group">
            <view class="group-selector-row">
              <text class="field-label">订购组数 <text class="req">*</text></text>
              <view class="group-selector">
                <button class="group-step" :disabled="submitting || Number(packageCount || 0) <= 1" @click="changePackageCount(-1)">−</button>
                <input v-model="packageCount" class="group-input" type="number" :disabled="submitting" placeholder="1" />
                <button class="group-step" :disabled="submitting" @click="changePackageCount(1)">+</button>
              </view>
            </view>
            <text class="selection-hint">每组包含以下全部商品，具体组成见活动说明</text>
            <view v-for="prod in enrollmentProducts" :key="prod.item_id" class="enroll-product">
              <text class="enroll-product-name">{{ prod.goods_name_snapshot }}</text>
              <text v-if="prod.model_snapshot" class="enroll-product-model">{{ prod.model_snapshot }}</text>
              <text v-if="prod.group_quantity != null" class="group-description">每组含 {{ prod.group_quantity }} {{ prod.unit_snapshot || '件' }}</text>
              <text class="group-description">活动单价 ¥{{ Number(prod.campaign_price || 0).toLocaleString() }}</text>
            </view>
            <text class="selection-hint">最终数量和金额以提交后的核算结果为准</text>
          </view>

          <view class="form-group">
            <text class="field-label">联系人姓名 <text class="req">*</text></text>
            <view class="input-wrap">
              <input
                v-model="enrollForm.contact_name"
                :disabled="submitting"
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
                :disabled="submitting"
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
                :disabled="submitting"
                class="form-textarea"
                placeholder="请填写交期要求或其他需求"
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
import { getMemberInfo } from '@/api/member';
import { requireDealerAccess } from '@/utils/dealer-access';
import { openPage } from '@/utils/pages';
import { createShareAppMessageOptions, createShareTimelineOptions, showMiniProgramShareMenu } from '@/utils/share';
import AppNavbar from '@/components/app-navbar.vue';
import AppLoadingSpinner from '@/components/app-loading-spinner.vue';
import CampaignEnrollmentSummary from '@/components/campaign-enrollment-summary.vue';
import { getSelectableCampaignItems, buildCampaignEnrollmentItems } from '@/utils/marketing-enrollment';
import { useUserStore } from '@/store/user';
import appConfig from '@/config/app';
import { formatEnrollmentStatus } from '@/utils/marketing-status';

const userStore = useUserStore();

const campaignId = ref(null);
const campaign = ref(null);
/** 活动说明支持 HTML；旧纯文本转义后保留换行，图片补齐资源域名并适配容器宽度。 */
const campaignRichContent = computed(() => {
  const content = String(campaign.value?.content || '');
  if (!/<\/?[a-z][^>]*>/i.test(content)) {
    return content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r\n|\r|\n/g, '<br/>');
  }
  const serverBase = String(appConfig.baseUrl || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
  return content.replace(/<img\b[^>]*>/gi, (tag) => tag
    .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
    .replace(/\bsrc\s*=\s*(['"])(.*?)\1/i, (_, quote, value) => {
      const path = value.trim().replace(/\\/g, '/');
      const url = path.startsWith('//') ? `https:${path}` : (/^(?:https?:|data:)/i.test(path) ? path : `${serverBase}/${path.replace(/^\/+/, '')}`);
      return `src=${quote}${url}${quote}`;
    })
    .replace(/<img\b/i, '<img style="max-width:100%;height:auto;display:block;margin:12px 0;"'));
});
const loading = ref(true);
const submitting = ref(false);
const openingEnroll = ref(false);
const showEnrollModal = ref(false);
// 报名成功响应独立保存，即使后续刷新活动失败也能展示已提交的真实明细。
const submittedEnrollment = ref(null);
const packageCount = ref(1);
const enrollmentProducts = computed(() => getSelectableCampaignItems(campaign.value?.items));
const latestEnrollment = computed(() => submittedEnrollment.value || campaign.value?.my_latest_enrollment || campaign.value?.my_enrollments?.[0] || null);

/** 订购组数仅接受正整数，组内实际件数与金额由服务端计算。 */
const changePackageCount = (delta) => {
  if (submitting.value) return;
  const current = Number(packageCount.value);
  const next = Math.max(1, (Number.isSafeInteger(current) ? current : 1) + delta);
  if (Number.isSafeInteger(next)) packageCount.value = next;
};

const closeEnrollModal = () => {
  // 提交过程中保留当前表单，避免连续点击造成重复报名。
  if (!submitting.value) showEnrollModal.value = false;
};

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
  const title = c?.campaign_title ? `【特惠货源活动】${c.campaign_title}` : '格宏特惠货源活动详情';
  const img = c?.cover_image || '';
  const path = `/pages/marketing/detail?id=${campaignId.value}`;
  return createShareAppMessageOptions(title, img, path);
});

onShareTimeline(() => {
  const c = campaign.value;
  const title = c?.campaign_title ? `【特惠货源活动】${c.campaign_title}` : '格宏特惠货源活动详情';
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

onLoad(async (options) => {
  // 分享链接同样校验经销商或业务员身份。
  if (!(await requireDealerAccess(userStore, () => openPage('/pages/index/index')))) {
    loading.value = false;
    return;
  }
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
  const record = latestEnrollment.value;
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

const campaignStatusClass = computed(() => {
  const text = campaignStatusText.value;
  if (text === '已结束') return 'ended';
  if (text === '即将开始') return 'upcoming';
  return 'ongoing';
});

const daysRemaining = computed(() => {
  if (!campaign.value?.end_time) return -1;
  const end = Number(campaign.value.end_time) * 1000;
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

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
  const title = campaign.value?.campaign_title || '格宏特惠货源活动';
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

const fetchDetail = async (id, keepCurrent = false) => {
  loading.value = true;
  try {
    const res = await getCampaignDetail(id);
    campaign.value = res?.campaign_id ? res : null;
  } catch (error) {
    console.warn('获取活动详情失败:', error);
    // 报名已经成功后，刷新失败仍保留活动与本次报名响应，避免误导用户重复提交。
    if (!keepCurrent) campaign.value = null;
    uni.showToast({ title: error?.message || '获取活动详情失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// 联系人优先取会员资料中的姓名；账号编号不能冒充真实联系人姓名。
const getMemberContactName = (member = {}) => {
  const name = [member.realname, member.real_name, member.full_name, member.contact_name, member.name, member.admin_account?.real_name]
    .map((value) => String(value || '').trim())
    .find(Boolean);
  if (name) return name;
  const nickname = String(member.nickname || '').trim();
  const account = String(member.username || member.member_no || '').trim();
  if (nickname && nickname !== account) return nickname;
  return /[\u3400-\u9fff]/.test(account) ? account : '';
};

// 只预填可直接用于报名的完整手机号，避免把账号或脱敏号码当成联系电话。
const getMemberContactMobile = (member = {}) => {
  const candidates = [member.mobile, member.member_mobile, member.phone, member.username];
  return candidates.map((value) => String(value || '').trim()).find((value) => /^1\d{10}$/.test(value)) || '';
};

const openEnrollModal = async () => {
  if (!campaign.value?.campaign_id || campaign.value.can_enroll === false || !enrollmentProducts.value.length) {
    uni.showToast({ title: '当前活动暂不可报名', icon: 'none' });
    return;
  }
  if (!userStore.isLoggedIn) {
    uni.showModal({
      title: '温馨提示',
      content: '请先登录后再报名参与特惠货源活动',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) openPage('/pages/auth/login');
      }
    });
    return;
  }

  if (openingEnroll.value || submitting.value) return;
  openingEnroll.value = true;
  try {
    // 打开报名弹窗时重新读取会员资料；读取失败才回退到本地缓存，表单仍允许手动修改。
    let member = {};
    try {
      const response = await getMemberInfo({ showError: false, timeout: 5000 });
      member = response?.data && typeof response.data === 'object' ? response.data : response || {};
    } catch (error) {
      console.warn('[特惠货源活动] 读取会员联系人信息失败，改用本地资料：', error);
    }
    const cachedMember = userStore.userInfo || {};
    enrollForm.contact_name = getMemberContactName(member) || getMemberContactName(cachedMember);
    enrollForm.contact_mobile = getMemberContactMobile(member) || getMemberContactMobile(cachedMember);
    showEnrollModal.value = true;
  } finally {
    openingEnroll.value = false;
  }
};

const handleSubmitEnroll = async () => {
  if (submitting.value) return;
  if (!enrollForm.contact_name.trim()) {
    return uni.showToast({ title: '请填写联系人姓名', icon: 'none' });
  }
  if (!enrollForm.contact_mobile.trim() || !/^1\d{10}$/.test(enrollForm.contact_mobile.trim())) {
    return uni.showToast({ title: '请填写正确的11位手机号', icon: 'none' });
  }

  let items;
  try {
    items = buildCampaignEnrollmentItems(enrollmentProducts.value, packageCount.value);
  } catch (error) {
    return uni.showToast({ title: error.message, icon: 'none' });
  }

  submitting.value = true;
  uni.showLoading({ title: '正在提交报名...' });
  try {
    const payload = {
      contact_name: enrollForm.contact_name.trim(),
      contact_mobile: enrollForm.contact_mobile.trim(),
      remark: enrollForm.remark.trim(),
      items
    };
    const result = await enrollCampaign(campaignId.value, payload);
    const enrollId = Number(result?.enrollment_id);
    if (!Number.isSafeInteger(enrollId) || enrollId <= 0) throw new Error('报名结果缺少编号，请到我的报名核对');
    submittedEnrollment.value = { ...result, enroll_status: 'submitted' };
    // 成功后清空已提交套数；再次报名必须重新选择，避免无意重复提交。
    packageCount.value = 1;
    uni.hideLoading();
    showEnrollModal.value = false;

    // 报名成功后重新获取后端状态，避免本地状态与实际记录不一致。
    await fetchDetail(campaignId.value, true);

    uni.showModal({
      title: '报名提交成功',
      content: result.total_amount != null && result.total_quantity != null
        ? `总数量 ${result.total_quantity}，合计 ¥${Number(result.total_amount).toLocaleString()}。可在“我的报名”查看明细。`
        : '报名已提交，可前往“我的报名”查看处理进度。',
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
      &.ended {
        color: #94a3b8;
        background: rgba(241, 245, 249, 0.95);
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

  /* 无封面时标题卡按正常间距排列，类型与状态仍可见。 */
  &.title-card--no-cover { margin-top: 24rpx; }

  .text-tag-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  .text-type-tag {
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
    background: #e8f1ff;
    color: #2468e8;
    font-size: 24rpx;
    font-weight: 600;
  }

  .text-status-badge {
    color: #059669;
    font-size: 24rpx;
    font-weight: 600;

    &.upcoming { color: #2563eb; }
    &.ended { color: #94a3b8; }
  }

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

    .prod-detail {
      flex: 1;
      min-width: 0;
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
  overflow-x: auto;
  .policy-text {
    display: block;
    font-size: 26rpx;
    color: #475569;
    line-height: 1.7;
    overflow-wrap: anywhere;
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
    /* 明确滚动区高度，商品较多时让套数输入和联系人表单在弹窗内滚动。 */
    height: 52vh;
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

.group-description { display: block; margin-top: 10rpx; color: #2563eb; font-size: 23rpx; line-height: 1.6; }
.selection-hint { display: block; margin: 10rpx 0; color: #64748b; font-size: 22rpx; line-height: 1.6; }
.enroll-product { padding: 22rpx; margin: 16rpx 0; border: 1rpx solid #dbeafe; border-radius: 16rpx; background: #f8fbff; }
.enroll-product-name { display: block; color: #1e293b; font-size: 26rpx; font-weight: 600; word-break: break-all; }
.enroll-product-model { display: block; margin-top: 6rpx; color: #64748b; font-size: 22rpx; word-break: break-all; }
.group-selector-row { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; margin-top: 18rpx; color: #334155; font-size: 24rpx; }
.group-selector { display: flex; align-items: center; border: 1rpx solid #bfdbfe; border-radius: 10rpx; overflow: hidden; }
.group-step { width: 64rpx; height: 60rpx; padding: 0; margin: 0; line-height: 60rpx; text-align: center; background: #eff6ff; color: #2563eb; font-size: 32rpx; border-radius: 0; }
.group-step::after { border: none; }
.group-step[disabled] { color: #b6c4d6; background: #f1f5f9; }
.group-input { width: 116rpx; height: 60rpx; text-align: center; background: #fff; color: #1e293b; font-size: 26rpx; }
</style>
