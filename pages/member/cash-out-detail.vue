<template>
  <view class="detail-page" v-if="detail">
    <AppNavbar title="提现详情" />

    <view class="status-card">
      <text class="status-money">¥{{ Number(detail.apply_money || 0).toFixed(2) }}</text>
      <text class="status-name">{{ detail.status_name || currentStatusDesc(detail.status) }}</text>
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
      <up-button plain type="primary" shape="circle" text="取消提现" @click="cancelCashOut" />
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getCashOutDetail, memberCancel } from '@/api/member';
import { getPageOptions } from '@/utils/pages';

// 中文说明：
// 提现详情页尽量复用 niucloud 返回的标准字段。
// 如果后端直接返回 status_name，这里优先展示；否则再用本地映射兜底。
const detail = ref(null);

const currentStatusDesc = (status) => {
  switch (Number(status)) {
    case 1:
      return '待审核';
    case 2:
      return '待转账';
    case 3:
      return '已转账';
    case 4:
      return '转账处理中';
    case -2:
      return '已取消';
    case -1:
      return '已拒绝';
    default:
      return '处理中';
  }
};

const fetchDetail = async () => {
  const options = getPageOptions();
  if (!options.id) return;
  detail.value = await getCashOutDetail(options.id);
};

const cancelCashOut = async () => {
  if (!detail.value?.id) return;
  await memberCancel({ id: detail.value.id });
  uni.showToast({ title: '提现已取消', icon: 'success' });
  await fetchDetail();
};

onMounted(fetchDetail);
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
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 24rpx calc(env(safe-area-inset-bottom) + 24rpx);
  background: #f3f7fd;
}

.bottom-bar :deep(.u-button) {
  height: 78rpx;
  border-radius: 40rpx !important;
  font-size: 26rpx !important;
  font-weight: 900 !important;
}
</style>
