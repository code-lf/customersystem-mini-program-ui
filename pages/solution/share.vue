<template>
  <view class="share-page">
    <AppNavbar title="" :show-back="true" />

    <view v-if="loading" class="loading-state">正在加载报价详情...</view>
    <view v-else class="preview-container">
      <view class="company-head">
        {{ sellerName }}
      </view>

      <view class="quote-summary">
        <text class="summary-title">报价总计</text>
        <view class="summary-main">
          <view class="circle-total">
            <view class="circle-inner">
              <text class="circle-num">{{ money(finalTotalPrice) }}</text>
              <text class="circle-unit">元</text>
            </view>
          </view>
          
          <view class="summary-details">
            <view class="detail-row">
              <view class="dot green"></view>
              <text class="detail-label">设备折后</text>
              <text class="detail-val">{{ money(goodsPayableAmount) }}</text>
            </view>
            <view class="detail-row">
              <view class="dot blue"></view>
              <text class="detail-label">安装</text>
              <text class="detail-val">{{ money(installationAmount) }}</text>
            </view>
            <view class="detail-row">
              <view class="dot orange"></view>
              <text class="detail-label">增项</text>
              <text class="detail-val">{{ money(additionAmount) }}</text>
            </view>
          </view>
        </view>
        <text class="summary-tip">正式报价金额由后台统一核算</text>
      </view>
      
      <view class="order-no">
        报价单号：{{ quoteData.quote_no || '--' }}
      </view>
      <view v-if="quoteData.quote_status" class="quote-status" :class="quoteData.quote_status">
        {{ quoteStatusText }}
      </view>
      
      <!-- 品牌分组展示 -->
      <view class="brand-group">
        <view class="brand-header">
          <view class="brand-head-top">
            <text class="brand-name">{{ brandName }}</text>
            <text class="brand-total">共计：¥ {{ money(finalTotalPrice) }}</text>
          </view>
          <view class="brand-head-bottom">
            设备折后 {{ money(goodsPayableAmount) }}元  安装 {{ money(installationAmount) }}元  增项 {{ money(additionAmount) }}元
          </view>
        </view>
        
        <!-- 系列展示 (由于数据可能没按系列分，这里做个假分组或统一样式) -->
        <view class="series-group">
          <view class="series-header" @click="toggleSeries">
            <text class="series-name">全部系列</text>
            <view class="series-right">
              <text class="series-total">{{ money(goodsPayableAmount) }}元</text>
              <up-icon :name="seriesExpanded ? 'arrow-up' : 'arrow-down'" size="14" color="#999" />
            </view>
          </view>
          
          <view class="series-list" v-if="seriesExpanded">
            <view class="table-header">
              <text class="th-model">型号</text>
              <text class="th-price">单价</text>
              <text class="th-qty">数量</text>
              <text class="th-total">总价</text>
            </view>
            
            <view class="table-row" v-for="(product, idx) in quoteData.items" :key="idx">
              <text class="td-model">{{ product.model_snapshot || product.model }}</text>
              <text class="td-price">{{ money(product.quote_price ?? product.unitPrice ?? product.price ?? 0) }}元</text>
              <text class="td-qty">{{ product.quantity }}</text>
              <text class="td-total">{{ money(getItemSubtotal(product)) }}元</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view class="remark-box" v-if="quoteData.remark">
        <text class="remark-title">备注：</text>
        <text class="remark-content">{{ quoteData.remark }}</text>
      </view>
    </view>
    
    <view style="height: 140rpx;"></view>
    
    <!-- 底部操作按钮 -->
    <view v-if="!loading" class="bottom-actions">
      <button class="btn-download" :disabled="actionLoading" @click="downloadPdf">下载 PDF</button>
      <template v-if="isPublicShare">
        <template v-if="!isDecisionFinal">
          <button class="btn-reject" :disabled="actionLoading" @click="confirmQuote('rejected')">拒绝</button>
          <button class="btn-confirm" :disabled="actionLoading" @click="confirmQuote('accepted')">确认报价</button>
        </template>
      </template>
      <template v-else>
        <button v-if="!shareToken" class="btn-share" :disabled="actionLoading" @click="prepareShare">生成分享入口</button>
        <button v-else class="btn-share" open-type="share">分享给客户</button>
      </template>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import {
  getSolutionDetail,
  getShareQuote,
  sendQuote,
  downloadQuotePdf,
  confirmShareQuote
} from '@/api/solution';

const loading = ref(true);
const actionLoading = ref(false);
const quoteData = ref({});
const seriesExpanded = ref(true);
const quoteId = ref('');
const shareToken = ref('');
const isPublicShare = ref(false);

const toggleSeries = () => {
  seriesExpanded.value = !seriesExpanded.value;
};

const money = (val) => {
  return Number(val || 0).toFixed(2);
};

// 后端新字段为 installation_amount / addition_amount，同时兼容本地旧快照字段。
const installationAmount = computed(() => Number(
  quoteData.value.installation_amount ?? quoteData.value.install_fee ?? 0
));
const additionAmount = computed(() => Number(
  quoteData.value.addition_amount ?? quoteData.value.additional_fee ?? 0
));

// 商品展示使用折后金额，保证“设备 + 安装 + 增项”与后端 pay_amount 可核对。
const goodsPayableAmount = computed(() => {
  const itemTotal = (quoteData.value.items || []).reduce(
    (sum, item) => sum + Number(item.line_amount ?? getItemSubtotal(item)),
    0
  );
  if (itemTotal > 0) return itemTotal;
  const goodsAmount = Number(quoteData.value.goods_amount || 0);
  const discountAmount = Number(quoteData.value.discount_amount || 0);
  return Math.max(0, goodsAmount - discountAmount);
});

const finalTotalPrice = computed(() => {
  // 正式报价优先展示后端核算的 pay_amount；旧本地草稿才使用前端合计兜底。
  return quoteData.value.pay_amount
    ?? quoteData.value.totalPrice
    ?? (goodsPayableAmount.value + installationAmount.value + additionAmount.value);
});

const sellerName = computed(() => quoteData.value.seller?.company_name
  || quoteData.value.seller?.company_short_name
  || quoteData.value.dealer_name_snapshot
  || '格宏电器');
const isDecisionFinal = computed(() => ['accepted', 'rejected', 'void'].includes(quoteData.value.quote_status));
const quoteStatusText = computed(() => ({
  draft: '草稿',
  sent: '已发送，等待客户确认',
  accepted: '客户已确认',
  rejected: '客户已拒绝',
  void: '报价已作废'
}[quoteData.value.quote_status] || ''));

const brandName = computed(() => {
  if (quoteData.value.items && quoteData.value.items.length > 0) {
     return quoteData.value.items[0].category_name || '格力';
  }
  return '格力';
});

const getItemSubtotal = (product) => {
  if (product.line_amount !== undefined && product.line_amount !== null) {
    return Number(product.line_amount || 0);
  }
  const price = Number(product.quote_price ?? product.unitPrice ?? product.price ?? 0);
  const qty = Number(product.quantity || 1);
  return price * qty;
};

const loadQuote = async (options = {}) => {
  loading.value = true;
  try {
    const token = options.token || options.share_token || '';
    isPublicShare.value = Boolean(token);
    if (token) {
      shareToken.value = token;
      const result = await getShareQuote(token);
      quoteData.value = result?.data || result || {};
    } else if (options.id) {
      quoteId.value = options.id;
      const result = await getSolutionDetail(options.id);
      quoteData.value = result?.data || result || {};
      shareToken.value = quoteData.value.share_token || '';
    } else if (options.data) {
      const decoded = decodeURIComponent(options.data);
      quoteData.value = JSON.parse(decoded);
      quoteId.value = quoteData.value.quote_id || quoteData.value.id || '';
      shareToken.value = quoteData.value.share_token || '';
    } else {
      throw new Error('缺少报价单参数');
    }
  } catch (error) {
    console.error('[报价预览] 加载详情失败：', error);
    uni.showToast({ title: error?.message || '报价详情加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

onLoad((options) => {
  loadQuote(options);
});

/** 调用发送报价接口，生成或复用 share_token。 */
const ensureShareToken = async () => {
  if (shareToken.value) return shareToken.value;
  const id = quoteId.value || quoteData.value.quote_id;
  if (!id) throw new Error('缺少报价单 ID，无法生成分享入口');

  const result = await sendQuote(id);
  const data = result?.data || result || {};
  if (!data.share_token) throw new Error('后端未返回 share_token');
  shareToken.value = data.share_token;
  quoteData.value = {
    ...quoteData.value,
    quote_status: 'sent',
    share_token: data.share_token,
    share_url: data.share_url || ''
  };
  return shareToken.value;
};

const prepareShare = async () => {
  actionLoading.value = true;
  uni.showLoading({ title: '正在生成分享入口...' });
  try {
    await ensureShareToken();
    uni.showShareMenu({ withShareTicket: true });
    uni.showToast({ title: '分享入口已生成，请再次点击分享', icon: 'none' });
  } catch (error) {
    console.error('[报价预览] 生成分享入口失败：', error);
    uni.showToast({ title: error?.message || '生成分享入口失败', icon: 'none' });
  } finally {
    actionLoading.value = false;
    uni.hideLoading();
  }
};

onShareAppMessage(() => ({
  title: `报价单 ${quoteData.value.quote_no || ''}`.trim(),
  path: shareToken.value
    ? `/pages/solution/share?token=${encodeURIComponent(shareToken.value)}`
    : '/pages/index/index'
}));

/** 下载 PDF 文件流并在微信内打开。 */
const downloadPdf = async () => {
  actionLoading.value = true;
  uni.showLoading({ title: '正在生成 PDF...' });
  try {
    const token = isPublicShare.value ? shareToken.value : await ensureShareToken();
    const fileData = await downloadQuotePdf(token);
    if (!(fileData instanceof ArrayBuffer)) throw new Error('后端未返回有效 PDF 文件流');

    // #ifdef MP-WEIXIN
    const safeNo = String(quoteData.value.quote_no || 'quote').replace(/[^0-9a-zA-Z_-]/g, '_');
    const filePath = `${wx.env.USER_DATA_PATH}/报价单-${safeNo}.pdf`;
    await new Promise((resolve, reject) => {
      wx.getFileSystemManager().writeFile({ filePath, data: fileData, success: resolve, fail: reject });
    });
    await new Promise((resolve, reject) => {
      wx.openDocument({ filePath, fileType: 'pdf', showMenu: true, success: resolve, fail: reject });
    });
    // #endif

    // #ifndef MP-WEIXIN
    uni.showToast({ title: '请在微信小程序中下载 PDF', icon: 'none' });
    // #endif
  } catch (error) {
    console.error('[报价预览] 下载 PDF 失败：', error);
    uni.showToast({ title: error?.message || 'PDF 下载失败', icon: 'none' });
  } finally {
    actionLoading.value = false;
    uni.hideLoading();
  }
};

/** 客户通过分享 token 确认或拒绝报价。 */
const confirmQuote = (status) => {
  const accepted = status === 'accepted';
  uni.showModal({
    title: accepted ? '确认报价' : '拒绝报价',
    content: accepted ? '确认接受该报价方案吗？' : '确认拒绝该报价方案吗？',
    confirmColor: accepted ? '#10b981' : '#ef4444',
    success: async (modalResult) => {
      if (!modalResult.confirm) return;
      actionLoading.value = true;
      try {
        await confirmShareQuote(shareToken.value, {
          quote_status: status,
          remark: accepted ? '客户确认' : '客户拒绝'
        });
        quoteData.value = { ...quoteData.value, quote_status: status };
        uni.showToast({ title: accepted ? '报价已确认' : '报价已拒绝', icon: 'success' });
      } catch (error) {
        console.error('[报价预览] 更新客户确认状态失败：', error);
        uni.showToast({ title: error?.message || '操作失败', icon: 'none' });
      } finally {
        actionLoading.value = false;
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.share-page {
  min-height: 100vh;
  background: #f5f6f8;
  padding-bottom: env(safe-area-inset-bottom);
}

.loading-state {
  padding: 160rpx 24rpx;
  color: #8b95a7;
  font-size: 26rpx;
  text-align: center;
}

.preview-container {
  padding: 24rpx;
}

.company-head {
  text-align: center;
  font-size: 32rpx;
  color: #333;
  margin-bottom: 30rpx;
}

.quote-summary {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
}

.summary-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.summary-main {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.circle-total {
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  border: 16rpx solid #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 60rpx;
}

.circle-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.circle-num {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.circle-unit {
  font-size: 24rpx;
  color: #666;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.detail-row {
  display: flex;
  align-items: center;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  
  &.green { background: #10b981; }
  &.blue { background: #3b82f6; }
  &.orange { background: #f59e0b; }
}

.detail-label {
  font-size: 28rpx;
  color: #666;
  width: 80rpx;
}

.detail-val {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.summary-tip {
  display: block;
  font-size: 24rpx;
  color: #999;
  text-align: center;
}

.order-no {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.quote-status {
  display: inline-flex;
  margin-bottom: 18rpx;
  padding: 6rpx 16rpx;
  border-radius: 10rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 23rpx;
}

.quote-status.accepted {
  background: #e9f8f0;
  color: #10a06a;
}

.quote-status.rejected,
.quote-status.void {
  background: #fff0f0;
  color: #ef4444;
}

.brand-group {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.brand-header {
  background: #10b981;
  padding: 24rpx 30rpx;
  color: #fff;
}

.brand-head-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
  font-size: 30rpx;
}

.brand-total {
  font-weight: bold;
}

.brand-head-bottom {
  font-size: 24rpx;
  opacity: 0.9;
}

.series-group {
  border-top: 1rpx solid #eee;
}

.series-header {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  background: #fafafa;
}

.series-name {
  font-size: 28rpx;
  color: #333;
}

.series-right {
  display: flex;
  align-items: center;
}

.series-total {
  font-size: 28rpx;
  color: #333;
  margin-right: 12rpx;
}

.series-list {
  padding: 0 30rpx 20rpx;
}

.table-header {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
  
  text {
    font-size: 24rpx;
    color: #999;
  }
}

.table-row {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  align-items: center;
  
  text {
    font-size: 26rpx;
    color: #666;
  }
}

.th-model, .td-model { flex: 2; word-break: break-all; padding-right: 10rpx; }
.th-price, .td-price { flex: 1; text-align: right; }
.th-qty, .td-qty { flex: 0.8; text-align: center; }
.th-total, .td-total { flex: 1; text-align: right; }

.remark-box {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.remark-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.remark-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40rpx;
  box-shadow: 0 -4rpx 10rpx rgba(0,0,0,0.05);
  padding-bottom: env(safe-area-inset-bottom);
}

.btn-download {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  background: #10b981;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  margin-right: 20rpx;
}

.btn-share {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  background: #3b82f6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  margin-left: 20rpx;
}

.btn-reject,
.btn-confirm {
  flex: 1;
  height: 80rpx;
  margin: 0 0 0 14rpx;
  padding: 0 16rpx;
  border-radius: 40rpx;
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 80rpx;
}

.btn-reject {
  background: #ef4444;
}

.btn-confirm {
  background: #10b981;
}

.bottom-actions button[disabled] {
  opacity: 0.55;
}
</style>
