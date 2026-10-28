<template>
  <view class="page"><AppNavbar title="邀请同事" />
    <view v-if="loading" class="message">正在加载...</view>
    <view v-else-if="error" class="message" @click="load">{{ error }}，点击重试</view>
    <template v-else>
      <view class="invite-card"><text class="company">{{ invite.dealer_unit || invite.dealer_name || '经销商团队' }}</text><text class="hint">邀请同事加入团队</text>
        <image v-if="invite.qr_code_url" class="qr" :src="invite.qr_code_url" mode="aspectFit" @error="qrError = true" />
        <text v-if="qrError" class="error">二维码加载失败，请重新进入页面</text>
        <text class="hint">微信扫一扫，查看邀请信息</text>
        <button class="share" open-type="share">分享邀请</button>
      </view>
      <view class="list-card"><text class="title">我的同事</text>
        <view v-if="listError" class="message" @click="loadList(1)">{{ listError }}，点击重试</view>
        <view v-else-if="!list.length" class="message">暂无同事</view>
        <view v-for="item in list" :key="item.member_id" class="row"><view class="details"><text class="name">{{ item.colleague_name || item.nickname || '同事' }}</text><text class="hint">{{ item.mobile || item.member_no || '' }}</text></view><button class="remove" @click="remove(item)">移除</button></view>
        <button v-if="hasMore" class="more" :disabled="listLoading" @click="loadList(page + 1)">加载更多</button>
      </view>
    </template>
  </view>
</template>
<script setup>
import { ref } from 'vue';
import { onShow, onShareAppMessage } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { getInviteCode, getColleagues, removeColleague } from '@/api/dealer-colleague';
import { getMemberInfo } from '@/api/member';
import { useUserStore } from '@/store/user';

const user = useUserStore();
const loading = ref(true), error = ref(''), invite = ref({}), qrError = ref(false);
const list = ref([]), page = ref(1), hasMore = ref(false), listError = ref(''), listLoading = ref(false);
// 用运行版本请求对应的小程序码；无法识别版本时不冒用正式版。
function envVersion() {
  try { const value = wx.getAccountInfoSync().miniProgram.envVersion; return ['develop', 'trial', 'release'].includes(value) ? value : ''; } catch (_) { return ''; }
}
async function loadList(next) {
  if (listLoading.value) return;
  listLoading.value = true; listError.value = '';
  try { const res = await getColleagues(next); const items = Array.isArray(res?.data) ? res.data : []; list.value = next === 1 ? items : [...list.value, ...items]; page.value = next; hasMore.value = next < Number(res?.last_page || 1); }
  catch (e) { listError.value = e.message || '同事列表加载失败'; }
  finally { listLoading.value = false; }
}
async function load() {
  loading.value = true; error.value = ''; invite.value = {}; list.value = []; qrError.value = false;
  try {
    const member = await getMemberInfo({ showError: false });
    user.setUserInfo({ ...user.userInfo, ...member });
    if (member?.can_manage_colleagues !== true) throw new Error('当前账号无同事管理权限');
    const version = envVersion(); if (!version) throw new Error('无法识别小程序版本');
    const result = await getInviteCode(version);
    if (!result?.qr_code_url || !result?.parent_dealer_id) throw new Error('未获取到有效邀请二维码');
    invite.value = result; await loadList(1);
  } catch (e) { error.value = e.message || '邀请信息加载失败'; }
  finally { loading.value = false; }
}
function remove(item) {
  uni.showModal({ title: '移除同事', content: `确定移除${item.colleague_name || item.nickname || '该同事'}吗？`, success: async ({ confirm }) => {
    if (!confirm) return;
    try { await removeColleague(item.member_id); uni.showToast({ title: '移除成功', icon: 'success' }); await loadList(1); }
    catch (e) { uni.showToast({ title: e.message || '移除失败', icon: 'none' }); }
  } });
}
onShow(() => { if (user.isLoggedIn) load(); else { loading.value = false; error.value = '请先登录'; } });
onShareAppMessage(() => ({ title: `${invite.value.dealer_unit || '经销商'}邀请您加入团队`, path: `/pages/marketing/colleague-bind?parent_dealer_id=${encodeURIComponent(invite.value.parent_dealer_id || '')}` }));
</script>
<style scoped>
.page{min-height:100vh;background:linear-gradient(180deg,#2563eb,#eaf2ff 750rpx);padding-bottom:40rpx}.invite-card,.list-card{margin:32rpx;background:#fff;border-radius:24rpx;padding:32rpx;box-shadow:0 8rpx 30rpx rgba(20,50,110,.08)}.invite-card{display:flex;align-items:center;flex-direction:column}.company,.title{font-size:32rpx;font-weight:700;color:#17233d}.hint{font-size:24rpx;color:#71829b;margin-top:10rpx}.qr{width:420rpx;height:420rpx;margin:20rpx 0}.share{width:80%;margin-top:28rpx;background:#2563eb;color:#fff;border-radius:50rpx;font-size:28rpx}.row{display:flex;align-items:center;padding:24rpx 0;border-bottom:1rpx solid #edf2f8}.details{display:flex;flex:1;flex-direction:column}.name{font-size:28rpx;color:#17233d}.remove{margin:0;background:#fff1f2;color:#dc2626;font-size:24rpx;line-height:2.4}.more{margin-top:20rpx;font-size:25rpx;color:#2563eb;background:#eff6ff}.message,.error{padding:30rpx;text-align:center;color:#71829b;font-size:26rpx}.error{color:#dc2626}
</style>
