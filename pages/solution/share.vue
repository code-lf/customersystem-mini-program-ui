<template>
  <view class="share-page">
    <AppNavbar title="" :show-back="true" />
    
    <view class="preview-container">
      <view class="company-head">
        预估报价：{{ dealerInfo.dealer_name || dealerInfo.company_name || quoteData.company_name_snapshot || '浙江格宏电器有限公司' }}
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
              <text class="detail-label">设备</text>
              <text class="detail-val">{{ money(goodsAmount) }}</text>
            </view>
            <view class="detail-row">
              <view class="dot blue"></view>
              <text class="detail-label">安装</text>
              <text class="detail-val">{{ money(quoteData.install_fee || 0) }}</text>
            </view>
            <view class="detail-row">
              <view class="dot orange"></view>
              <text class="detail-label">增项</text>
              <text class="detail-val">{{ money(quoteData.additional_fee || 0) }}</text>
            </view>
          </view>
        </view>
        <text class="summary-tip">该价格来自系统估算，请以实际为准</text>
      </view>
      
      <view class="order-no">
        订单号：{{ quoteData.quote_no || ('BJ' + Date.now()) }}
      </view>
      
      <!-- 品牌分组展示 -->
      <view class="brand-group">
        <view class="brand-header">
          <view class="brand-head-top">
            <text class="brand-name">{{ brandName }}</text>
            <text class="brand-total">共计：¥ {{ money(finalTotalPrice) }}</text>
          </view>
          <view class="brand-head-bottom">
            设备 {{ money(goodsAmount) }}元  安装 {{ money(quoteData.install_fee || 0) }}元  增项 {{ money(quoteData.additional_fee || 0) }}元
          </view>
        </view>
        
        <!-- 系列展示 (由于数据可能没按系列分，这里做个假分组或统一样式) -->
        <view class="series-group">
          <view class="series-header" @click="toggleSeries">
            <text class="series-name">全部系列</text>
            <view class="series-right">
              <text class="series-total">{{ money(goodsAmount) }}元</text>
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
    <view class="bottom-actions">
      <button class="btn-download" @click="downloadPdf">下载pdf</button>
      <button class="btn-share" @click="shareToClient">分享</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions } from '@/utils/pages';
import { getSolutionDetail, getShareQuote, getMyDealer } from '@/api/solution';

const loading = ref(true);
const quoteData = ref({});
const dealerInfo = ref({});
const seriesExpanded = ref(true);

const toggleSeries = () => {
  seriesExpanded.value = !seriesExpanded.value;
};

const money = (val) => {
  return Number(val || 0).toFixed(2);
};

const goodsAmount = computed(() => {
  if (quoteData.value.goods_amount) return quoteData.value.goods_amount;
  let total = 0;
  if (quoteData.value.items) {
    quoteData.value.items.forEach(p => {
      total += getItemSubtotal(p);
    });
  }
  return total;
});

const finalTotalPrice = computed(() => {
  return quoteData.value.pay_amount || quoteData.value.totalPrice || (goodsAmount.value + (quoteData.value.install_fee || 0) + (quoteData.value.additional_fee || 0));
});

const brandName = computed(() => {
  if (quoteData.value.items && quoteData.value.items.length > 0) {
     return quoteData.value.items[0].category_name || '格力';
  }
  return '格力';
});

const getItemSubtotal = (product) => {
  const price = Number(product.quote_price ?? product.unitPrice ?? product.price ?? 0);
  const qty = Number(product.quantity || 1);
  return price * qty;
};

onMounted(async () => {
  const options = getPageOptions();
  
  if (options.data) {
    try {
      const decoded = decodeURIComponent(options.data);
      quoteData.value = JSON.parse(decoded);
    } catch(e) {}
  } else if (options.id) {
    try {
      const res = await getSolutionDetail(options.id);
      quoteData.value = res.data || res;
    } catch(e) {}
  }
  
  try {
    const dRes = await getMyDealer();
    if (dRes && dRes.data) {
      dealerInfo.value = dRes.data;
    }
  } catch(e) {}
  
  loading.value = false;
});

const downloadPdf = () => {
  uni.showToast({ title: 'PDF下载功能开发中', icon: 'none' });
};

const shareToClient = () => {
  uni.showShareMenu({ withShareTicket: true });
};
</script>

<style lang="scss" scoped>
.share-page {
  min-height: 100vh;
  background: #f5f6f8;
  padding-bottom: env(safe-area-inset-bottom);
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
</style>
