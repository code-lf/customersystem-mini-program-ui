<template>
  <view class="detail-page">
    <AppNavbar title="提现详情" />
    <view class="refresh-tip" @click="refresh">{{ loadError || '点击刷新提现状态' }}</view>

    <template v-if="detail">
    <view class="status-card">
      <text class="status-money">¥{{ Number(detail.apply_money || 0).toFixed(2) }}</text>
      <text class="status-name">{{ cashOutStatus(detail) }}</text>
      <text v-if="canConfirm" class="refresh-tip">审核已通过，请确认提现；到账结果以后端状态为准</text>
    </view>

    <view class="info-card">
      <view class="info-row">
        <text>提现单号</text>
        <text>{{ detail.cash_out_no || '--' }}</text>
      </view>
      <view v-if="Number(detail.service_money)" class="info-row">
        <text>手续费</text>
        <text>¥{{ Number(detail.service_money || 0).toFixed(2) }}</text>
      </view>
      <view class="info-row">
        <text>申请时间</text>
        <text>{{ detail.create_time || '--' }}</text>
      </view>
      <view v-if="detail.audit_time" class="info-row">
        <text>审核时间</text>
        <text>{{ detail.audit_time }}</text>
      </view>
      <view v-if="Number(detail.status) === -1 && detail.refuse_reason" class="info-row">
        <text>拒绝原因</text>
        <text>{{ detail.refuse_reason }}</text>
      </view>
    </view>

    <view class="info-card">
      <view class="info-row">
        <text>到账方式</text>
        <text>{{ detail.transfer_type_name || '--' }}</text>
      </view>
      <view v-if="detail.transfer_account" class="info-row">
        <text>到账账户</text>
        <text>{{ detail.transfer_account }}</text>
      </view>
      <view v-if="detail.transfer_realname" class="info-row">
        <text>收款人</text>
        <text>{{ detail.transfer_realname }}</text>
      </view>
      <view v-if="detail.transfer_bank" class="info-row">
        <text>开户行</text>
        <text>{{ detail.transfer_bank }}</text>
      </view>
    </view>

    <view v-if="[1, 2, 4].includes(Number(detail.status))" class="bottom-bar">
      <up-button :disabled="operating" plain type="primary" shape="circle" text="取消提现" @click="cancelCashOut" />
      <!-- 确认操作与提现入口统一深蓝底白字，取消仍使用描边次要样式。 -->
      <up-button v-if="canConfirm" :loading="operating" color="#1e40af" type="primary" shape="circle" text="确认提现" @click="confirmTransfer" />
    </view>
    </template>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { getCashOutDetail, getCashOutTransfer, getMemberInfo, memberCancel } from '@/api/member';
import { cashOutStatus, merchantTransferOptions, openMerchantTransfer } from '@/utils/cash-out';
import { useCashOutRefresh } from '@/hooks/use-cash-out-refresh';
import { getPageOptions } from '@/utils/pages';

// 中文说明：
// 提现详情页尽量复用 niucloud 返回的标准字段。
// 如果后端直接返回 status_name，这里优先展示；否则再用本地映射兜底。
const detail = ref(null);
const operating = ref(false);
const loadError = ref('');
const detailId = ref('');
onLoad(options => { detailId.value = options.id || ''; });
const canConfirm = computed(() => detail.value?.transfer_type === 'wechatpay' && [2, 4].includes(Number(detail.value?.status)));

const fetchDetail = async () => {
  try {
    const id = detailId.value || getPageOptions().id;
    if (!id) throw new Error('缺少提现记录编号');
    detail.value = await getCashOutDetail(id);
    loadError.value = '';
    return [1, 2, 4].includes(Number(detail.value?.status));
  } catch (error) {
    loadError.value = '状态读取失败，点击重试';
    throw error;
  }
};
const { refresh } = useCashOutRefresh(fetchDetail);

/** 仅用户点击后发起：状态2创建转账，状态4复用已有签名包，避免重复发起。 */
const confirmTransfer = async () => {
  if (operating.value) return;
  operating.value = true;
  try {
    let client;
    // #ifdef MP-WEIXIN
    client = wx;
    // #endif
    // 先检查客户端能力，避免不支持的环境先创建真实转账。
    if (!client || typeof client.requestMerchantTransfer !== 'function') throw new Error('请在新版微信小程序中确认提现');
    await fetchDetail();
    if (!canConfirm.value) return;
    let transfer = detail.value.transfer;
    if (Number(detail.value.status) === 2) {
      const member = await getMemberInfo();
      if (!member?.weapp_openid) throw new Error('请先使用微信登录后再确认提现');
      transfer = await getCashOutTransfer({ id: detail.value.id, open_id: member.weapp_openid });
    }
    await openMerchantTransfer(merchantTransferOptions(transfer), client);
    uni.showToast({ title: '请以最新到账状态为准', icon: 'none' });
  } catch (error) {
    const message = error?.message || error?.errMsg || '确认收款失败，请刷新后重试';
    uni.showToast({ title: /cancel/i.test(message) ? '已取消确认收款' : message, icon: 'none' });
  } finally {
    operating.value = false;
    await refresh();
  }
};

const cancelCashOut = async () => {
  if (!detail.value?.id || operating.value) return;
  const result = await new Promise(resolve => uni.showModal({ title: '取消提现', content: '确定取消这笔提现吗？', success: resolve, fail: () => resolve({ confirm: false }) }));
  if (!result.confirm) return;
  operating.value = true;
  try {
    await memberCancel({ id: detail.value.id });
    uni.showToast({ title: '提现已取消', icon: 'success' });
  } finally {
    operating.value = false;
    await refresh();
  }
};
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  padding: 0 24rpx 150rpx;
  background: #f3f7fd;
}

.status-card,
.info-card {
  margin-top: 18rpx;
  padding: 26rpx 24rpx;
  border-radius: 18rpx;
  background: #fff;
  box-shadow: 0 8rpx 22rpx rgba(23, 35, 61, .04);
}

.status-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-money {
  color: #17233d;
  font-size: 54rpx;
  font-weight: 900;
}

.status-name {
  margin-top: 12rpx;
  color: #2468e8;
  font-size: 26rpx;
  font-weight: 800;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #edf0f5;
}

.info-row:last-child {
  border-bottom: 0;
}

.info-row text:first-child {
  color: #8b95a7;
  font-size: 24rpx;
}

.info-row text:last-child {
  flex: 1;
  color: #17233d;
  font-size: 24rpx;
  text-align: right;
  word-break: break-all;
}

.bottom-bar {
  display: flex;
  gap: 20rpx;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 24rpx calc(env(safe-area-inset-bottom) + 24rpx);
  background: #f3f7fd;
}
.refresh-tip { display: block; margin-top: 16rpx; color: #667286; font-size: 24rpx; line-height: 1.6; }

.bottom-bar :deep(.u-button) {
  height: 78rpx;
  border-radius: 40rpx !important;
  font-size: 26rpx !important;
  font-weight: 900 !important;
}
</style>
