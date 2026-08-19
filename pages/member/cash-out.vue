<template>
  <view class="record-page">
    <AppNavbar title="提现记录" />

    <view v-if="cashOutList.length" class="record-list">
      <view
        v-for="item in cashOutList"
        :key="item.id"
        class="record-card"
        @click="openPage('/pages/member/cash-out-detail', { id: item.id })"
      >
        <view class="record-head">
          <text class="record-money">{{ moneyFormat(item.apply_money) }}</text>
          <text class="record-status">{{ item.status_name || currentStatusDesc(item.status) }}</text>
        </view>

        <text class="record-line">提现方式：{{ item.transfer_type_name || '--' }}</text>
        <text class="record-line">申请时间：{{ item.create_time || '--' }}</text>
        <text class="record-desc">{{ Number(item.status) !== -1 ? currentStatusDesc(item.status) : item.refuse_reason }}</text>
      </view>
    </view>

    <up-empty
      v-else
      mode="list"
      text="暂无提现记录"
      text-size="16"
      text-color="#667286"
      icon-color="#b7c5d8"
      margin-top="140"
    />
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { getCashOutList } from '@/api/member';
import { openPage } from '@/utils/pages';

// 中文说明：
// 记录列表对齐 niucloud 的提现记录字段：apply_money、status_name、transfer_type_name、create_time、refuse_reason。
// 这里保留了 status 数字到文案的兜底映射，避免某些环境只返回状态码没有返回 status_name。
const cashOutList = ref([]);

const moneyFormat = (value) => `¥${Number(value || 0).toFixed(2)}`;

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

const fetchList = async () => {
  const accountType = uni.getStorageSync('cashOutAccountType') || 'money';
  const result = await getCashOutList({
    page: 1,
    page_size: 50,
    account_type: accountType
  });
  cashOutList.value = result?.data || result?.list || [];
};

onMounted(fetchList);
onShow(fetchList);
</script>

<style lang="scss" scoped>
.record-page {
  min-height: 100vh;
  padding: 0 24rpx 34rpx;
  background: #f3f7fd;
}

.record-list {
  margin-top: 18rpx;
}

.record-card {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 18rpx;
  background: #fff;
  box-shadow: 0 8rpx 22rpx rgba(23, 35, 61, .04);
}

.record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.record-money {
  color: #ff0d3e;
  font-size: 36rpx;
  font-weight: 900;
}

.record-status {
  color: #17233d;
  font-size: 25rpx;
  font-weight: 700;
}

.record-line {
  display: block;
  margin-bottom: 10rpx;
  color: #8b95a7;
  font-size: 22rpx;
  line-height: 32rpx;
}

.record-desc {
  display: block;
  color: #667286;
  font-size: 22rpx;
  line-height: 32rpx;
}
</style>
