<template>
  <view class="page"><AppNavbar title="加入团队" /><view class="card">
    <text class="title">同事邀请</text>
    <text v-if="error" class="hint">{{ error }}</text>
    <template v-else-if="!user.isLoggedIn"><text class="hint">请先登录后查看邀请信息</text><button class="primary" @click="login">登录 / 注册</button></template>
    <template v-else-if="loading"><text class="hint">正在查询邀请信息...</text></template>
    <template v-else>
      <template v-if="parent"><text class="company">{{ parent.dealer_unit || parent.dealer_name || '经销商团队' }}</text><text class="hint">邀请您加入团队</text></template>
      <view v-if="application" class="notice">
        <text>{{ statusText }}</text>
        <text v-if="application.status === 2 && application.review_remark" class="reason">驳回原因：{{ application.review_remark }}</text>
        <text v-if="application.status === 0 && String(application.parent_dealer_id) !== parentId && parentId" class="reason">当前有其他团队申请等待审核，请先等待处理。</text>
      </view>
      <text v-else-if="!parentId" class="hint">暂无加入申请，请扫描经销商邀请二维码。</text>
      <button v-if="canApply" class="primary" :disabled="submitting" :loading="submitting" @click="submit">{{ application?.status === 2 ? '重新申请加入' : '申请加入' }}</button>
      <button class="refresh" :disabled="loading || submitting" @click="refresh">刷新审核状态</button>
      <text v-if="refreshError" class="reason">{{ refreshError }}</text>
    </template>
  </view></view>
</template>
<script setup>
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { getParentPreview, getColleagueApplication, submitColleagueApplication } from '@/api/dealer-colleague';
import { getMemberInfo } from '@/api/member';
import { useUserStore } from '@/store/user';
import { openPage } from '@/utils/pages';
const user = useUserStore(), parentId = ref(''), parent = ref(null), loading = ref(false), error = ref('');
const application = ref(null), submitting = ref(false), refreshError = ref('');
const statusText = computed(() => ({ 0: '申请已提交，等待后台审核', 1: '审核已通过', 2: '申请已驳回' })[application.value?.status] || '申请状态未知，请刷新');
const canApply = computed(() => Boolean(parentId.value && parent.value && !refreshError.value && (!application.value || application.value.status === 2)));
// 同时支持微信小程序码 scene 和分享卡片参数；仅接受正整数经销商档案 ID。
onLoad((options = {}) => {
  let scene = ''; try { scene = decodeURIComponent(options.scene || ''); } catch (_) { scene = ''; }
  const match = scene.match(/(?:^|&)parent_dealer_id=(\d+)(?:&|$)/);
  const raw = String(options.parent_dealer_id || match?.[1] || '');
  if (!raw && options.view === 'application') return;
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) { error.value = '邀请参数无效，请重新扫码'; return; }
  parentId.value = raw;
});
function login() { openPage('/pages/auth/login', { returnTo: 'colleague', parent_dealer_id: parentId.value }); }
// 只接受文档约定的申请结构，避免旧版直接绑定接口响应被误判为待审核。
function parseApplication(value) {
  if (Array.isArray(value) && value.length === 0) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Number.isInteger(value.status) || ![0, 1, 2].includes(value.status) || !value.application_id || !value.parent_dealer_id) throw new Error('申请状态返回异常，请稍后重试');
  return value;
}
async function refresh() {
  if (!user.isLoggedIn || loading.value) return;
  loading.value = true; refreshError.value = '';
  try {
    application.value = parseApplication(await getColleagueApplication());
    if (application.value?.status === 1) {
      // 审核通过后读取真实会员资料；权限以服务端返回为准，不使用申请状态推断。
      const member = await getMemberInfo({ showError: false });
      if (!member || typeof member !== 'object' || Array.isArray(member)) throw new Error('会员信息返回异常');
      const updated = { ...user.userInfo, ...member };
      for (const field of ['can_use_dealer_features', 'can_manage_colleagues', 'account_type', 'effective_role', 'relation_status']) {
        if (!Object.prototype.hasOwnProperty.call(member, field)) delete updated[field];
      }
      user.setUserInfo(updated);
    }
    if (parentId.value) {
      parent.value = await getParentPreview(parentId.value);
      if (!parent.value?.parent_dealer_id) throw new Error('邀请信息无效');
    }
  } catch (e) { refreshError.value = e.message || '查询失败，请稍后重试'; }
  finally { loading.value = false; }
}
async function submit() {
  if (!canApply.value || submitting.value) return;
  submitting.value = true; refreshError.value = '';
  try {
    const result = parseApplication(await submitColleagueApplication(parentId.value));
    if (!result) throw new Error('申请响应异常，请刷新状态');
    application.value = result;
    uni.showToast({ title: result.status === 0 ? '申请已提交，等待审核' : '请查看申请状态', icon: 'none' });
  } catch (e) { refreshError.value = e.message || '提交失败，请重试'; }
  finally { submitting.value = false; }
}
onShow(() => { if (user.isLoggedIn && !error.value) refresh(); });
</script>
<style scoped>
.page{min-height:100vh;background:#f1f6ff}.card{margin:36rpx;background:#fff;border-radius:24rpx;padding:48rpx 32rpx;display:flex;align-items:center;flex-direction:column}.title{font-size:36rpx;font-weight:700;color:#16233c}.company{margin-top:40rpx;font-size:32rpx;color:#2563eb;font-weight:700}.hint,.notice{margin-top:24rpx;font-size:26rpx;color:#71829b;text-align:center}.notice{padding:24rpx;background:#eff6ff;border-radius:16rpx}.reason{display:block;margin-top:16rpx;color:#b45309;font-size:24rpx;word-break:break-all}.primary{margin-top:36rpx;background:#2563eb;color:white;border-radius:50rpx;width:80%;font-size:28rpx}.refresh{margin-top:20rpx;background:#eff6ff;color:#2563eb;border-radius:50rpx;width:80%;font-size:26rpx}
</style>
