<template>
  <view class="design-page preview-page">
    <AppNavbar title="客户方案报价预览" />

    <!-- 加载中骨架 -->
    <view v-if="loading" class="preview-card skeleton-wrap">
      <view class="skeleton-block sk-head" />
      <view class="skeleton-block sk-title" />
      <view class="skeleton-block sk-banner" />
      <view class="skeleton-block sk-price" />
      <view class="skeleton-block sk-list" />
    </view>

    <!-- 真实报价单卡片 -->
    <view v-else class="preview-card">
      <!-- 电器公司/经销商信息栏 -->
      <view class="company-row">
        <view class="company-icon"><up-icon name="home" size="20" color="#fff" /></view>
        <view class="company-text">
          <text class="company-name">{{ dealerInfo.dealer_name || dealerInfo.company_name || quoteData.company_name_snapshot || '格宏电器科技有限公司' }}</text>
          <text class="company-tagline">{{ dealerInfo.tagline || '官方认证服务商 · 专业空调系统方案 · 品质保障' }}</text>
        </view>
        <view v-if="quoteData.quote_status_text || quoteData.status_text" class="status-pill">
          {{ quoteData.quote_status_text || quoteData.status_text || '方案报价' }}
        </view>
      </view>

      <!-- 项目方案标题与编号 -->
      <view class="project-title-box">
        <view class="title-top-row">
          <text class="project-name">{{ quoteData.title || quoteData.projectName || '空调暖通方案报价单' }}</text>
        </view>
        <view class="project-meta-row">
          <text v-if="quoteData.quote_no" class="meta-tag">单号：{{ quoteData.quote_no }}</text>
          <text class="meta-tag">客户：{{ quoteData.contact_name_snapshot || quoteData.customerName || '贵宾客户' }}</text>
          <text v-if="quoteData.create_time_text || quoteData.date" class="meta-tag">日期：{{ (quoteData.create_time_text || quoteData.date || '').slice(0, 10) }}</text>
        </view>
      </view>

      <!-- 主形象图 -->
      <image
        class="project-image"
        :src="bannerImage"
        mode="aspectFill"
      />

      <!-- 报价总额面板 -->
      <view class="price-panel">
        <view class="price-panel-head">
          <text class="price-label">方案核算总额 (含税与设备)</text>
          <text v-if="quoteData.discount_rate && quoteData.discount_rate < 100" class="discount-badge">
            已享 {{ quoteData.discount_rate }}% 特惠折扣
          </text>
        </view>

        <view class="price-main-row">
          <text class="price-symbol">¥</text>
          <text class="price-number">{{ money(quoteData.pay_amount ?? quoteData.totalPrice) }}</text>
          <text v-if="quoteData.goods_amount && quoteData.goods_amount > (quoteData.pay_amount ?? quoteData.totalPrice)" class="origin-price-strike">
            原价 ¥{{ money(quoteData.goods_amount) }}
          </text>
        </view>

        <!-- 价格明细条目 -->
        <view class="price-breakdown">
          <view v-if="quoteData.goods_amount" class="breakdown-item">
            <text>设备面价：</text>
            <text class="bold">¥{{ money(quoteData.goods_amount) }}</text>
          </view>
          <view v-if="quoteData.discount_amount" class="breakdown-item discount">
            <text>折扣减免：</text>
            <text class="bold">- ¥{{ money(quoteData.discount_amount) }}</text>
          </view>
          <view v-if="quoteData.extra_amount" class="breakdown-item">
            <text>辅材/安装：</text>
            <text class="bold">¥{{ money(quoteData.extra_amount) }}</text>
          </view>
        </view>

        <!-- 备注说明 -->
        <view v-if="quoteData.remark" class="quote-remark-show">
          <text class="remark-title">方案备注：</text>
          <text class="remark-content">{{ quoteData.remark }}</text>
        </view>

        <!-- 服务保障 4 格 -->
        <view class="promise-grid">
          <view v-for="item in promises" :key="item.text" class="promise-item">
            <up-icon :name="item.icon" size="22" color="#2468e8" />
            <text>{{ item.text }}</text>
          </view>
        </view>
      </view>

      <!-- 设备选型清单 -->
      <view class="product-section">
        <view class="section-head">
          <text class="section-title">选配设备清单</text>
          <text class="section-count">共 {{ (quoteData.items || []).length }} 项产品</text>
        </view>

        <view class="product-list">
          <view
            v-for="(product, index) in (quoteData.items || [])"
            :key="product.id || product.goods_id || index"
            class="product-row"
          >
            <image
              class="p-thumb"
              :src="getProductImage(product)"
              mode="aspectFill"
            />
            <view class="p-info">
              <text class="p-name">{{ product.goods_name_snapshot || product.goods_name || product.name || '定制空调设备' }}</text>
              <text v-if="product.model_snapshot || product.model" class="p-model">型号：{{ product.model_snapshot || product.model }}</text>
              <view class="p-meta-line">
                <text class="p-qty">数量：{{ product.quantity || 1 }} 台</text>
                <text class="p-price">单价：¥{{ money(product.quote_price ?? product.unitPrice ?? product.price ?? 0) }}</text>
              </view>
            </view>
            <view class="p-subtotal">
              <text class="subtotal-label">小计</text>
              <text class="subtotal-val">¥{{ money(getItemSubtotal(product)) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 专属销售工程师联系名片 -->
      <view class="contact-row">
        <image class="engineer-avatar" :src="advisorAvatar" mode="aspectFill" />
        <view class="engineer-info">
          <text class="engineer-name">{{ advisorName }}</text>
          <text class="engineer-org">{{ advisorOrg }}</text>
          <text class="engineer-tel">服务热线：{{ advisorPhone }}</text>
        </view>
        <button class="call-btn" @click="call">
          <up-icon name="phone-fill" size="20" color="#2468e8" />
        </button>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="share-actions-wrap">
      <button class="share-btn" @click="shareToClient">
        <up-icon name="share-fill" size="18" color="#fff" style="margin-right: 10rpx;" />
        立即分享给客户 (微信/复制链接)
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions } from '@/utils/pages';
import { getSolutionDetail, getShareQuote, getMyDealer, sendQuote } from '@/api/solution';
import { getUserInfo } from '@/api/user';
import { uiSolutions } from '@/mock/ui-fixtures';

const options = getPageOptions();
const loading = ref(true);

const quoteData = ref({});
const dealerInfo = ref({});
const userInfo = ref({});

const promises = [
  { icon: 'file-text-fill', text: '清单透明' },
  { icon: 'leaf', text: '一级能效' },
  { icon: 'rmb-circle-fill', text: '含税专票' },
  { icon: 'checkmark-circle-fill', text: '官方质保' }
];

const money = (value) => Number(value || 0).toLocaleString();

const bannerImage = computed(() => {
  const firstItem = (quoteData.value.items || [])[0];
  return (
    firstItem?.image_snapshot ||
    firstItem?.goods_image ||
    firstItem?.image ||
    '/static/aircon/central-default.png'
  );
});

const getProductImage = (product) => {
  return (
    product.image_snapshot ||
    product.goods_image ||
    product.image ||
    '/static/aircon/central-default.png'
  );
};

const getItemSubtotal = (product) => {
  if (product.subtotal_price !== undefined) return product.subtotal_price;
  const price = Number(product.quote_price ?? product.unitPrice ?? product.price ?? 0);
  const qty = Number(product.quantity || 1);
  return price * qty;
};

const advisorName = computed(() => {
  return (
    quoteData.value.contact_name_snapshot ||
    dealerInfo.value.contact_name ||
    userInfo.value.nickname ||
    userInfo.value.username ||
    '张工 (资深方案工程师)'
  );
});

const advisorOrg = computed(() => {
  return (
    dealerInfo.value.dealer_name ||
    dealerInfo.value.company_name ||
    quoteData.value.company_name_snapshot ||
    '格宏电器工程技术部 · 专属顾问'
  );
});

const advisorPhone = computed(() => {
  return (
    quoteData.value.contact_mobile_snapshot ||
    dealerInfo.value.mobile ||
    dealerInfo.value.telephone ||
    userInfo.value.mobile ||
    '138 8888 8888'
  );
});

const advisorAvatar = computed(() => {
  return userInfo.value.avatar || '/static/avatars/avatar-demo.png';
});

const loadQuote = async () => {
  loading.value = true;
  const quoteId = options.id || options.quote_id;
  const shareToken = options.token || options.share_token;

  // 1. 尝试从后端接口拉取真实数据
  let fetchedQuote = null;

  if (shareToken) {
    try {
      fetchedQuote = await getShareQuote(shareToken);
    } catch (e) {
      console.warn('getShareQuote failed:', e);
    }
  }

  if (!fetchedQuote && quoteId) {
    try {
      fetchedQuote = await getSolutionDetail(quoteId);
    } catch (e) {
      console.warn('getSolutionDetail failed:', e);
    }
  }

  // 2. 如果后端未获取到，尝试从本地缓存中查找历史快照
  if (!fetchedQuote) {
    const localRecords = uni.getStorageSync('solution_history_records') || [];
    if (quoteId) {
      fetchedQuote = localRecords.find(
        (r) => String(r.id) === String(quoteId) || String(r.quote_id) === String(quoteId) || String(r.quote_no) === String(quoteId)
      );
    }
    if (!fetchedQuote && localRecords.length) {
      fetchedQuote = localRecords[0];
    }
  }

  // 3. 如果依然没有，兜底回 mock 方案数据
  if (!fetchedQuote) {
    const mockFound = uiSolutions.find((item) => String(item.id) === String(quoteId)) || uiSolutions[0];
    fetchedQuote = {
      ...mockFound,
      pay_amount: mockFound.total || mockFound.totalPrice,
      goods_amount: mockFound.productTotal,
      discount_rate: mockFound.discount || 95,
      items: mockFound.items || []
    };
  }

  quoteData.value = fetchedQuote || {};

  // 4. 并行加载经销商与用户信息
  try {
    const [dealer, user] = await Promise.allSettled([getMyDealer(), getUserInfo()]);
    if (dealer.status === 'fulfilled' && dealer.value) {
      dealerInfo.value = dealer.value;
    }
    if (user.status === 'fulfilled' && user.value) {
      userInfo.value = user.value;
    }
  } catch (e) {
    console.warn('load dealer/user info error:', e);
  }

  loading.value = false;
};

onMounted(() => {
  loadQuote();
});

const call = () => {
  const phone = advisorPhone.value.replace(/\s+/g, '');
  uni.makePhoneCall({
    phoneNumber: phone,
    fail: () => {
      uni.showToast({ title: `服务热线：${phone}`, icon: 'none' });
    }
  });
};

const shareToClient = async () => {
  const quoteId = quoteData.value.quote_id || quoteData.value.id;
  try {
    if (quoteId) {
      await sendQuote(quoteId).catch(() => {});
    }
  } catch (e) {
    // 忽略发送状态切换可能抛出的非关键错误
  }

  const shareText = `【${quoteData.value.title || '空调暖通方案报价单'}】核算总额：¥${money(quoteData.value.pay_amount ?? quoteData.value.totalPrice)}，请点击查看完整配置清单。`;

  // 复制文本或链接
  uni.setClipboardData({
    data: shareText,
    success: () => {
      uni.showToast({ title: '报价单分享信息已复制', icon: 'success' });
    }
  });
};
</script>

<style lang="scss" scoped>
.preview-page {
  min-height: 100vh;
  padding: 0 24rpx 160rpx;
  background: #f4f7fc;
}

.preview-card {
  border-radius: 24rpx;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(23, 35, 61, 0.05);
  margin-top: 16rpx;
}

.company-row {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  background: #f8faff;
  border-bottom: 1rpx solid #eef3fb;
}

.company-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  margin-right: 18rpx;
  border-radius: 50%;
  background: #2468e8;
  flex-shrink: 0;
}

.company-text {
  flex: 1;
  min-width: 0;
}

.company-name {
  display: block;
  color: #17233d;
  font-size: 28rpx;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-tagline {
  display: block;
  margin-top: 4rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.status-pill {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.project-title-box {
  padding: 24rpx 28rpx 20rpx;
}

.title-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-name {
  display: block;
  color: #17233d;
  font-size: 34rpx;
  font-weight: 900;
}

.project-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}

.meta-tag {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #f1f4f9;
  color: #586477;
  font-size: 22rpx;
  font-weight: 600;
}

.project-image {
  width: 100%;
  height: 280rpx;
  background: #edf3fb;
}

.price-panel {
  padding: 24rpx 28rpx;
}

.price-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-label {
  color: #8b95a7;
  font-size: 24rpx;
}

.price-main-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.price-symbol {
  color: #ef543f;
  font-size: 32rpx;
  font-weight: 800;
}

.price-number {
  color: #ef543f;
  font-size: 52rpx;
  font-weight: 900;
}

.origin-price-strike {
  color: #a0abbd;
  font-size: 24rpx;
  text-decoration: line-through;
  margin-left: 12rpx;
}

.discount-badge {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
}

.price-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 14rpx;
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  background: #f9fbfd;
  font-size: 23rpx;
  color: #647389;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 6rpx;

  &.discount {
    color: #ef543f;
  }

  .bold {
    font-weight: 700;
  }
}

.quote-remark-show {
  margin-top: 14rpx;
  padding: 14rpx 18rpx;
  border-radius: 10rpx;
  background: #f8fafc;
  font-size: 24rpx;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.remark-title {
  color: #8b95a7;
  font-weight: 700;
}

.remark-content {
  color: #334155;
}

.promise-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #edf1f8;
}

.promise-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  color: #586477;
  font-size: 22rpx;
  font-weight: 600;
}

/* 产品清单列表 */
.product-section {
  padding: 24rpx 28rpx;
  border-top: 1rpx solid #edf1f8;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-title {
  color: #17233d;
  font-size: 28rpx;
  font-weight: 900;
}

.section-count {
  color: #8b95a7;
  font-size: 22rpx;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.product-row {
  display: flex;
  align-items: center;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #f8fafc;
}

.p-thumb {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  background: #fff;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.p-info {
  flex: 1;
  min-width: 0;
}

.p-name {
  display: block;
  color: #17233d;
  font-size: 26rpx;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.p-model {
  display: block;
  margin-top: 2rpx;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 600;
}

.p-meta-line {
  display: flex;
  gap: 16rpx;
  margin-top: 4rpx;
  color: #8b95a7;
  font-size: 21rpx;
}

.p-subtotal {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 12rpx;
}

.subtotal-label {
  color: #8b95a7;
  font-size: 20rpx;
}

.subtotal-val {
  color: #ef543f;
  font-size: 27rpx;
  font-weight: 800;
  margin-top: 2rpx;
}

.contact-row {
  display: flex;
  align-items: center;
  margin: 0 28rpx;
  padding: 24rpx 0 28rpx;
  border-top: 1rpx solid #edf1f8;
}

.engineer-avatar {
  width: 84rpx;
  height: 84rpx;
  margin-right: 18rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: #edf3fb;
}

.engineer-info {
  flex: 1;
  min-width: 0;
}

.engineer-name {
  display: block;
  color: #17233d;
  font-size: 27rpx;
  font-weight: 800;
}

.engineer-org,
.engineer-tel {
  display: block;
  margin-top: 4rpx;
  color: #647389;
  font-size: 22rpx;
}

.call-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #edf4ff;
  flex-shrink: 0;
}

.share-actions-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 28rpx calc(18rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -6rpx 24rpx rgba(23, 35, 61, 0.08);
  z-index: 50;
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 44rpx;
  background: #2468e8;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 88rpx;
  box-shadow: 0 8rpx 24rpx rgba(36, 104, 232, 0.35);
}

.skeleton-wrap {
  padding: 28rpx;
}

.skeleton-block {
  background: #e9eff8;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.sk-head {
  height: 80rpx;
}

.sk-title {
  height: 60rpx;
  width: 60%;
}

.sk-banner {
  height: 240rpx;
}

.sk-price {
  height: 120rpx;
}

.sk-list {
  height: 200rpx;
}
</style>
