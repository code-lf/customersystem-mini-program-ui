<template>
  <view class="cash-page" v-if="!pageLoading">
    <AppNavbar title="申请提现" />

    <view v-if="config.is_open === 1" class="cash-scroll">
      <view class="amount-card">
        <text class="amount-title">最小提现金额为</text>

        <view class="amount-input-row">
          <text class="amount-symbol">¥</text>
          <input
            v-model="applyData.apply_money"
            type="digit"
            class="amount-input"
            :placeholder="applyData.apply_money ? '' : `最小提现金额为 ¥${moneyFormat(config.min)}`"
            placeholder-class="amount-placeholder"
          />
          <text v-if="Number(serviceMoney)" class="service-text">手续费 {{ serviceMoney }}</text>
          <up-icon v-if="applyData.apply_money" name="close" size="18" color="#b0bac7" @click="clearMoney" />
        </view>

        <view class="amount-desc-row">
          <text>可提现余额：¥{{ moneyFormat(cashOutMoney) }}，手续费为 {{ config.rate }}%</text>
          <text class="all-btn" @click="allMoney">全部提现</text>
        </view>
      </view>

      <view class="transfer-card">
        <text class="transfer-title">到账方式</text>

        <view
          v-for="item in transferCards"
          :key="item.transfer_type"
          class="transfer-item"
          :class="item.activeClass"
          @click="selectTransfer(item)"
        >
          <view class="transfer-icon">
            <up-icon :name="item.icon" size="26" :color="item.iconColor" />
          </view>
          <view class="transfer-info">
            <text>{{ item.title }}</text>
            <text>{{ item.desc }}</text>
          </view>
          <up-icon
            :name="applyData.transfer_type === item.transfer_type ? 'checkmark-circle-fill' : 'arrow-right'"
            size="20"
            :color="applyData.transfer_type === item.transfer_type ? item.iconColor : '#b0bac7'"
          />
        </view>
      </view>

      <view class="footer-space" />
      <view class="submit-bar">
        <up-button
          type="primary"
          shape="circle"
          text="立即提现"
          :disabled="applyData.apply_money === '' || Number(applyData.apply_money) === 0"
          :loading="loading"
          @click="cashOut"
        />
        <text @click="openPage('/pages/member/cash-out')">提现记录</text>
      </view>
    </view>

    <view v-else class="empty-wrap">
      <up-empty
        mode="list"
        text="提现设置未开启"
        text-size="16"
        text-color="#667286"
        icon-color="#b7c5d8"
        margin-top="140"
      />
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { cashOutApply, cashOutConfig, getBalance, getCashoutAccountInfo, getFirstCashOutAccountInfo } from '@/api/member';
import { getPageOptions, openPage } from '@/utils/pages';

// 中文说明：
// 这页按 niucloud 的提现字段来组织数据：
// apply_money=金额，transfer_type=提现渠道，account_type=余额/佣金账户，account_id=提现账号。
// 后续如果你把账号管理页接进来，这里只需要继续复用 account_id，不用重写提交逻辑。
const pageLoading = ref(true);
const loading = ref(false);
const query = reactive(getPageOptions());

const balance = reactive({
  money: 0,
  commission: 0
});

const applyData = reactive({
  apply_money: '',
  transfer_type: '',
  account_type: 'money',
  account_id: 0,
  transfer_payee: {
    open_id: '',
    channel: ''
  }
});

const config = reactive({
  is_auto_transfer: 0,
  is_auto_verify: 0,
  is_open: 0,
  min: 0,
  rate: 0,
  transfer_type: []
});

const bankAccountInfo = ref(null);
const alipayAccountInfo = ref(null);
const wechatCodeInfo = ref(null);

const cashOutMoney = computed(() => {
  return Number(balance[applyData.account_type] || 0);
});

const serviceMoney = computed(() => {
  if (!applyData.apply_money || !Number(config.rate)) return '0.00';
  return (Number(applyData.apply_money) * Number(config.rate) / 100).toFixed(2);
});

const moneyFormat = (value) => Number(value || 0).toFixed(2);

watch(() => applyData.transfer_type, (value) => {
  if (value === 'bank') applyData.account_id = bankAccountInfo.value?.account_id || 0;
  else if (value === 'alipay') applyData.account_id = alipayAccountInfo.value?.account_id || 0;
  else if (value === 'wechat_code') applyData.account_id = wechatCodeInfo.value?.account_id || 0;
  else applyData.account_id = 0;
}, { immediate: true });

const transferCards = computed(() => {
  const list = [];

  if (config.transfer_type.includes('wechat_code')) {
    list.push({
      transfer_type: 'wechat_code',
      title: '提现至微信',
      desc: wechatCodeInfo.value ? `提现到微信号 ${wechatCodeInfo.value.account_no}` : '请先配置微信收款账号',
      icon: 'weixin-fill',
      iconColor: '#00c800',
      activeClass: applyData.transfer_type === 'wechat_code' ? 'is-wechat' : ''
    });
  }

  if (config.transfer_type.includes('alipay')) {
    list.push({
      transfer_type: 'alipay',
      title: '提现至支付宝',
      desc: alipayAccountInfo.value ? `提现到支付宝账号 ${alipayAccountInfo.value.account_no}` : '请先配置支付宝账号',
      icon: 'rmb-circle',
      iconColor: '#009fe8',
      activeClass: applyData.transfer_type === 'alipay' ? 'is-alipay' : ''
    });
  }

  if (config.transfer_type.includes('bank')) {
    list.push({
      transfer_type: 'bank',
      title: '提现至银行卡',
      desc: bankAccountInfo.value
        ? `提现到${bankAccountInfo.value.bank_name}尾号${String(bankAccountInfo.value.account_no || '').slice(-4)}`
        : '请先配置银行卡',
      icon: 'order',
      iconColor: '#089c98',
      activeClass: applyData.transfer_type === 'bank' ? 'is-bank' : ''
    });
  }

  return list;
});

const loadAccountInfo = async (type) => {
  if (!config.transfer_type.includes(type)) return null;
  const requestData = query.type === type && query.account_id
    ? { account_id: query.account_id }
    : { account_type: type, account_id: 0 };

  const result = query.type === type && query.account_id
    ? await getCashoutAccountInfo(requestData)
    : await getFirstCashOutAccountInfo(requestData);

  return result || null;
};

const allMoney = () => {
  if (cashOutMoney.value > 0) applyData.apply_money = moneyFormat(cashOutMoney.value);
};

const clearMoney = () => {
  applyData.apply_money = '';
};

const verify = () => {
  if (!applyData.transfer_type) {
    uni.showToast({ title: '没有可用的提现方式', icon: 'none' });
    return false;
  }
  if (!applyData.apply_money) {
    uni.showToast({ title: '请输入提现金额', icon: 'none' });
    return false;
  }
  if (!uni.$u.test.amount(applyData.apply_money)) {
    uni.showToast({ title: '提现金额格式错误', icon: 'none' });
    return false;
  }
  if (Number(applyData.apply_money) > cashOutMoney.value) {
    uni.showToast({ title: '提现金额超出可提现金额', icon: 'none' });
    return false;
  }
  if (Number(applyData.apply_money) < Number(config.min || 0)) {
    uni.showToast({ title: '提现金额小于最低提现金额', icon: 'none' });
    return false;
  }
  if (['bank', 'alipay', 'wechat_code'].includes(applyData.transfer_type) && !applyData.account_id) {
    uni.showToast({ title: '当前提现方式未配置账号', icon: 'none' });
    return false;
  }
  return true;
};

const selectTransfer = (item) => {
  if (item.transfer_type === 'wechat_code' && !wechatCodeInfo.value) {
    uni.showToast({ title: '请先配置微信收款账号', icon: 'none' });
    return;
  }
  if (item.transfer_type === 'alipay' && !alipayAccountInfo.value) {
    uni.showToast({ title: '请先配置支付宝账号', icon: 'none' });
    return;
  }
  if (item.transfer_type === 'bank' && !bankAccountInfo.value) {
    uni.showToast({ title: '请先配置银行卡', icon: 'none' });
    return;
  }
  applyData.transfer_type = item.transfer_type;
};

const fetchBalance = async () => {
  Object.assign(balance, await getBalance() || {});
};

const cashOut = async () => {
  if (!verify() || loading.value) return;
  loading.value = true;
  try {
    const result = await cashOutApply(applyData);
    const detailId = typeof result === 'number' || typeof result === 'string'
      ? result
      : result?.id;
    await fetchBalance();
    uni.showToast({ title: '提现申请已提交', icon: 'success' });
    setTimeout(() => {
      if (detailId) openPage('/pages/member/cash-out-detail', { id: detailId });
      else openPage('/pages/member/cash-out');
    }, 500);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  applyData.account_type = uni.getStorageSync('cashOutAccountType') || 'money';
  await fetchBalance();
  Object.assign(config, await cashOutConfig() || {});

  bankAccountInfo.value = await loadAccountInfo('bank');
  alipayAccountInfo.value = await loadAccountInfo('alipay');
  wechatCodeInfo.value = await loadAccountInfo('wechat_code');

  applyData.transfer_type = query.type || config.transfer_type[0] || '';
  pageLoading.value = false;
});

onShow(fetchBalance);
</script>

<style lang="scss" scoped>
.cash-page {
  min-height: 100vh;
  background: #f3f7fd;
}

.cash-scroll {
  padding: 0 24rpx 34rpx;
}

.amount-card,
.transfer-card {
  margin-top: 18rpx;
  padding: 24rpx;
  border-radius: 18rpx;
  background: #fff;
  box-shadow: 0 8rpx 22rpx rgba(23, 35, 61, .04);
}

.amount-title,
.transfer-title {
  display: block;
  color: #17233d;
  font-size: 28rpx;
  font-weight: 900;
}

.amount-input-row {
  display: flex;
  align-items: center;
  margin-top: 22rpx;
  padding: 0 8rpx 10rpx;
  border-bottom: 2rpx solid #f1f2f5;
}

.amount-symbol {
  color: #17233d;
  font-size: 42rpx;
  font-weight: 900;
}

.amount-input {
  flex: 1;
  height: 76rpx;
  margin-left: 10rpx;
  color: #17233d;
  font-size: 50rpx;
  font-weight: 900;
  background: transparent;
}

.amount-placeholder {
  color: #b0bac7;
  font-size: 26rpx;
  font-weight: 400;
}

.service-text {
  margin-right: 20rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.amount-desc-row {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;
  gap: 16rpx;
}

.amount-desc-row > text:first-child {
  flex: 1;
  color: #8b95a7;
  font-size: 22rpx;
  line-height: 32rpx;
}

.all-btn {
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 800;
}

.transfer-item {
  display: flex;
  align-items: center;
  margin-top: 18rpx;
  padding: 20rpx;
  border: 1rpx solid #eee;
  border-radius: 16rpx;
}

.transfer-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
}

.transfer-info {
  flex: 1;
  margin-left: 16rpx;
  padding-right: 14rpx;
}

.transfer-info text {
  display: block;
}

.transfer-info text:first-child {
  color: #17233d;
  font-size: 26rpx;
  font-weight: 800;
}

.transfer-info text:last-child {
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 22rpx;
  line-height: 30rpx;
}

.transfer-item.is-wechat {
  border-color: #00c800;
  background: #ecf9ef;
}

.transfer-item.is-alipay {
  border-color: #009fe8;
  background: #eef8fc;
}

.transfer-item.is-bank {
  border-color: #089c98;
  background: #f6ffff;
}

.footer-space {
  height: 150rpx;
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  padding: 18rpx 24rpx calc(env(safe-area-inset-bottom) + 26rpx);
  background: #f3f7fd;
}

.submit-bar :deep(.u-button) {
  height: 80rpx;
  border-radius: 40rpx !important;
  font-size: 26rpx !important;
  font-weight: 900 !important;
}

.submit-bar > text {
  display: block;
  margin-top: 22rpx;
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 800;
  text-align: center;
}

.empty-wrap {
  min-height: 100vh;
  padding: 0 24rpx;
}
</style>
