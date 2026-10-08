<template>
  <view class="salesperson-page">
    <AppWatermark />
    <!-- 独立固定导航栏和等高占位，避免页面滚动后标题、返回键被内容挤出屏幕。 -->
    <view class="salesperson-navbar">
      <view :style="{ height: navMetrics.statusBarHeight + 'px' }" />
      <view class="salesperson-nav-row" :style="{ height: navMetrics.navBarHeight + 'px', paddingRight: navMetrics.capsuleOccupiedWidth + 'px' }">
        <view class="salesperson-back" @click="goBack"><up-icon name="arrow-left" size="20" color="#17233d" /></view>
        <text class="salesperson-nav-title">我的客户经理</text>
      </view>
    </view>
    <view :style="{ height: navMetrics.totalNavHeight + 'px' }" />
    <view class="page-content">
      <view v-if="loading" class="state-card">正在查询专属客户经理...</view>
      <view v-else-if="salesperson" class="manager-card">
        <view class="card-glow" />
        <view class="manager-badge">专属服务</view>
        <view class="manager-main">
          <view class="manager-identity">
            <text class="manager-label">您的专属客户经理</text>
            <text class="manager-name">{{ salesperson.name || '客户经理' }}</text>
            <text v-if="dealerUnit" class="dealer-unit">服务单位：{{ dealerUnit }}</text>
          </view>
        </view>
        <view class="divider" />
        <view class="contact-row">
          <view class="contact-copy">
            <text class="contact-label">联系电话</text>
            <text class="contact-number">{{ salesperson.mobile || '暂未提供联系电话' }}</text>
          </view>
        </view>
        <button class="call-button" :disabled="!canCall" @click="callSalesperson">
          <text>{{ canCall ? '拨打客户经理电话' : '暂无可拨打的电话' }}</text>
        </button>
        <text class="service-tip">如需产品选型、方案报价或订单协助，可直接联系您的客户经理。</text>
      </view>
      <view v-else class="state-card">
        <text class="state-title">{{ errorText || '暂未分配客户经理' }}</text>
        <text class="state-desc">分配后会在这里显示客户经理姓名与联系方式。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppWatermark from '@/components/app-watermark.vue';
import { requireDealerAccess } from '@/utils/dealer-access';
import { openPage } from '@/utils/pages';
import { getNavMetrics } from '@/utils/system';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const loading = ref(true);
const errorText = ref('');
// 与微信胶囊同一行显示导航标题；固定栏与占位共用这组实测尺寸。
const navMetrics = computed(() => getNavMetrics());
// 经销商和销售人员关系以会员接口的最新响应为准，不通过页面参数传递电话号码。
const salesperson = computed(() => {
  const value = userStore.userInfo?.salesperson;
  return userStore.isDealer && Number(value?.member_id) > 0 ? value : null;
});
const dealerUnit = computed(() => String(userStore.userInfo?.dealer_unit || '').trim());
const mobile = computed(() => String(salesperson.value?.mobile || '').trim());
const canCall = computed(() => /^\+?\d[\d\s-]{5,19}$/.test(mobile.value));

onShow(async () => {
  loading.value = true;
  errorText.value = '';
  try {
    // 直接打开页面也重新校验登录和经销商身份，并刷新分配的 CRM 销售人员。
    const allowed = await requireDealerAccess(userStore, () => openPage('/pages/my/my'));
    if (!allowed) return;
  } catch (error) {
    console.error('[客户经理] 读取会员信息失败：', error);
    errorText.value = '客户经理信息暂不可用';
  } finally {
    loading.value = false;
  }
});

/** 只在后端返回有效电话时调用系统拨号，不伪造或使用用户自己的手机号。 */
const callSalesperson = () => {
  if (!canCall.value) {
    uni.showToast({ title: '客户经理暂未提供联系电话', icon: 'none' });
    return;
  }
  uni.makePhoneCall({ phoneNumber: mobile.value.replace(/[\s-]/g, '') });
};

/** 从详情返回个人中心；直接打开详情时也能安全回到“我的”。 */
const goBack = () => {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  if (pages.length > 1) uni.navigateBack({ delta: 1, fail: () => openPage('/pages/my/my') });
  else openPage('/pages/my/my');
};
</script>

<style lang="scss" scoped>
.salesperson-page { min-height: 100vh; background: linear-gradient(180deg, #eef5ff 0%, #f5f8fd 430rpx); }
.salesperson-navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: #eef5ff; }
.salesperson-nav-row { box-sizing: border-box; display: flex; align-items: center; padding-left: 20rpx; }
.salesperson-back { display: flex; align-items: center; justify-content: center; width: 64rpx; height: 64rpx; flex-shrink: 0; border-radius: 50%; background: #ffffff; box-shadow: 0 2rpx 10rpx rgba(23, 35, 61, .08); }
.salesperson-nav-title { flex: 1; margin-left: 16rpx; color: #17233d; font-size: 32rpx; font-weight: 800; white-space: nowrap; }
.page-content { padding: 28rpx 28rpx 80rpx; }
.manager-card { position: relative; overflow: hidden; padding: 36rpx 32rpx 42rpx; border: 1rpx solid #e5eeff; border-radius: 28rpx; background: #ffffff; box-shadow: 0 18rpx 50rpx rgba(32, 91, 187, .08); }
.card-glow { position: absolute; top: -80rpx; right: -70rpx; width: 330rpx; height: 330rpx; border-radius: 50%; background: radial-gradient(circle, #dfebff 0%, rgba(223, 235, 255, 0) 72%); pointer-events: none; }
.manager-badge { position: relative; display: inline-flex; padding: 8rpx 18rpx; border-radius: 100rpx; background: #e7f0ff; color: #2468e8; font-size: 22rpx; font-weight: 700; }
.manager-main { position: relative; display: flex; align-items: center; margin-top: 24rpx; }
.manager-identity { display: flex; flex-direction: column; min-width: 0; gap: 6rpx; }
.manager-label { color: #718098; font-size: 23rpx; }
.manager-name { color: #17233d; font-size: 42rpx; font-weight: 800; }
.dealer-unit { color: #7d8ca4; font-size: 22rpx; word-break: break-all; }
.divider { height: 1rpx; margin: 28rpx 0 24rpx; background: #edf2f9; }
.contact-row { display: flex; align-items: center; }
.contact-copy { display: flex; flex-direction: column; gap: 4rpx; }
.contact-label { color: #7d8ca4; font-size: 23rpx; }
.contact-number { color: #17233d; font-size: 32rpx; font-weight: 700; }
.call-button { display: flex; align-items: center; justify-content: center; gap: 12rpx; height: 88rpx; margin-top: 40rpx; border-radius: 44rpx; background: #2468e8; color: #ffffff; font-size: 28rpx; font-weight: 700; box-shadow: 0 10rpx 24rpx rgba(36, 104, 232, .22); }
.call-button[disabled] { background: #a8b8d1; box-shadow: none; }
.call-button::after { border: none; }
.service-tip { display: block; margin-top: 24rpx; color: #9aa7b8; font-size: 22rpx; line-height: 34rpx; text-align: center; }
.state-card { display: flex; flex-direction: column; align-items: center; padding: 90rpx 30rpx; border-radius: 26rpx; background: #ffffff; color: #64748b; text-align: center; }
.state-title { color: #17233d; font-size: 30rpx; font-weight: 700; }
.state-desc { margin-top: 10rpx; font-size: 24rpx; line-height: 36rpx; }
</style>
