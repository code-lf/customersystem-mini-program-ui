<template>
  <view class="balance-page">
    <AppNavbar title="账户余额" />

    <view class="hero-card">
      <text class="hero-label">账户总余额</text>
      <view class="hero-money">
        <text>¥</text>
        <text>{{ moneyParts.integer }}</text>
        <text>.{{ moneyParts.decimal }}</text>
      </view>
    </view>

    <view class="summary-card">
      <view class="summary-main">
        <text>可提现余额（元）</text>
        <view>
          <text>¥</text>
          <text>{{ withdrawMoneyParts.integer }}</text>
          <text>.{{ withdrawMoneyParts.decimal }}</text>
        </view>
      </view>

      <view class="summary-actions">
        <view class="summary-btn summary-btn--outline" @click="openPage('/pages/member/cash-out')">
          <up-icon name="file-text" size="18" color="#2468e8" />
          <text>提现记录</text>
        </view>
        <view class="summary-btn summary-btn--primary" @click="goCashOut">
          <up-icon name="rmb-circle" size="18" color="#ffffff" />
          <text>提现</text>
        </view>
      </view>
    </view>

    <view class="filter-card">
      <up-tabs
        :list="typeTabs"
        :current="typeTabIndex"
        key-name="name"
        shape-mode="tag"
        line-color="transparent"
        :scrollable="false"
        @change="handleTypeChange"
      />
    </view>

    <view v-if="list.length" class="log-list">
      <view v-for="item in list" :key="item.id" class="log-card">
        <view class="log-icon" :class="logColorClass(item)">
          <text>{{ logSymbol(item) }}</text>
        </view>
        <view class="log-main">
          <text>{{ item.from_type_name || '账户变动' }}</text>
          <text>{{ item.create_time || '--' }}</text>
        </view>
        <view class="log-side">
          <text :class="logTextClass(item)">{{ formatChange(item.account_data) }}</text>
        </view>
      </view>
    </view>

    <up-empty
      v-else
      mode="list"
      text="暂无余额流水"
      text-size="16"
      text-color="#667286"
      icon-color="#b7c5d8"
      margin-top="120"
    />
  </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { getBalance, getBalanceListAll } from '@/api/member';
import { openPage } from '@/utils/pages';

// 中文说明：
// 余额页字段和 niucloud-admin 对齐：
// 1. 余额总览使用 money + balance。
// 2. 流水使用 member/account/balance_list 返回的 from_type_name、account_data、create_time。
// 3. 提现入口会把 cashOutAccountType 写入本地，申请提现页直接复用这个字段。
const summary = reactive({
  money: 0,
  balance: 0
});

const list = ref([]);
const tradeType = ref('');

const typeTabs = [
  { name: '全部', key: '' },
  { name: '收入', key: 'income' },
  { name: '支出', key: 'disburse' },
  { name: '提现', key: 'cash_out' }
];

const typeTabIndex = computed(() => {
  const index = typeTabs.findIndex((item) => item.key === tradeType.value);
  return index >= 0 ? index : 0;
});

const totalMoney = computed(() => Number(summary.money || 0) + Number(summary.balance || 0));

const splitMoney = (value) => {
  const [integer, decimal = '00'] = Number(value || 0).toFixed(2).split('.');
  return { integer, decimal };
};

const moneyParts = computed(() => splitMoney(totalMoney.value));
const withdrawMoneyParts = computed(() => splitMoney(summary.money));

const logSymbol = (item) => {
  if (item.account_type === 'money' || item.from_type === 'cash_out') return '提';
  return Number(item.account_data || 0) > 0 ? '收' : '支';
};

const logColorClass = (item) => {
  if (item.account_type === 'money' || item.from_type === 'cash_out') return 'is-blue';
  return Number(item.account_data || 0) > 0 ? 'is-red' : 'is-green';
};

const logTextClass = (item) => {
  return Number(item.account_data || 0) > 0 ? 'text-red' : 'text-green';
};

const formatChange = (value) => {
  const amount = Number(value || 0);
  if (amount > 0) return `+${amount.toFixed(2)}`;
  return amount.toFixed(2);
};

const fetchSummary = async () => {
  Object.assign(summary, await getBalance() || {});
};

const fetchList = async () => {
  const result = await getBalanceListAll({
    page: 1,
    limit: 20,
    trade_type: tradeType.value
  });
  list.value = result?.data || result?.list || [];
};

const handleTypeChange = (item, index) => {
  tradeType.value = typeTabs[index]?.key || '';
  fetchList();
};

const goCashOut = () => {
  uni.setStorageSync('cashOutAccountType', 'money');
  openPage('/pages/member/apply-cash-out');
};

onMounted(async () => {
  await fetchSummary();
  await fetchList();
});

onShow(async () => {
  await fetchSummary();
  await fetchList();
});
</script>

<style lang="scss" scoped>
.balance-page {
  min-height: 100vh;
  padding: 0 24rpx 34rpx;
  background: #f3f7fd;
}

.hero-card {
  padding: 34rpx 32rpx 150rpx;
  border-radius: 0 0 28rpx 28rpx;
  background: linear-gradient(180deg, #2e78f0 0%, #1e58d6 100%);
}

.hero-label {
  display: block;
  color: rgba(255, 255, 255, .92);
  font-size: 25rpx;
}

.hero-money {
  display: flex;
  align-items: baseline;
  margin-top: 14rpx;
  color: #fff;
}

.hero-money text:first-child {
  font-size: 34rpx;
  font-weight: 700;
}

.hero-money text:nth-child(2) {
  margin-left: 4rpx;
  font-size: 62rpx;
  font-weight: 900;
}

.hero-money text:last-child {
  font-size: 34rpx;
  font-weight: 800;
}

.summary-card {
  margin-top: -104rpx;
  padding: 30rpx 28rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 14rpx 30rpx rgba(23, 35, 61, .08);
}

.summary-main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-main > text {
  color: #8b95a7;
  font-size: 24rpx;
}

.summary-main view {
  display: flex;
  align-items: baseline;
  margin-top: 12rpx;
  color: #17233d;
}

.summary-main view text:first-child {
  font-size: 30rpx;
}

.summary-main view text:nth-child(2) {
  margin-left: 4rpx;
  font-size: 56rpx;
  font-weight: 900;
}

.summary-main view text:last-child {
  font-size: 32rpx;
  font-weight: 800;
}

.summary-actions {
  display: flex;
  justify-content: center;
  gap: 28rpx;
  margin-top: 38rpx;
}

.summary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 250rpx;
  height: 72rpx;
  border-radius: 40rpx;
}

.summary-btn text {
  margin-left: 8rpx;
  font-size: 25rpx;
  font-weight: 800;
}

.summary-btn--outline {
  border: 2rpx solid #2468e8;
}

.summary-btn--outline text {
  color: #2468e8;
}

.summary-btn--primary {
  background: linear-gradient(94deg, #fb7939 0%, #fe120e 99%);
}

.summary-btn--primary text {
  color: #fff;
}

.filter-card {
  margin-top: 26rpx;
  padding: 8rpx;
  border-radius: 16rpx;
  background: #eef4fb;
}

.filter-card :deep(.u-tabs__wrapper__scroll-view-wrapper) {
  background: #eef4fb;
}

.log-list {
  margin-top: 18rpx;
}

.log-card {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 22rpx;
  border-radius: 18rpx;
  background: #fff;
  box-shadow: 0 8rpx 22rpx rgba(23, 35, 61, .04);
}

.log-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
}

.log-icon text {
  color: #fff;
  font-size: 32rpx;
  font-weight: 900;
}

.log-icon.is-blue {
  background: #1379ff;
}

.log-icon.is-red {
  background: #ef000c;
}

.log-icon.is-green {
  background: #03b521;
}

.log-main {
  flex: 1;
  margin-left: 18rpx;
}

.log-main text {
  display: block;
}

.log-main text:first-child {
  color: #17233d;
  font-size: 27rpx;
  font-weight: 800;
}

.log-main text:last-child {
  margin-top: 10rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.log-side text {
  font-size: 30rpx;
  font-weight: 900;
}

.text-red {
  color: #ef000c;
}

.text-green {
  color: #03b521;
}
</style>
