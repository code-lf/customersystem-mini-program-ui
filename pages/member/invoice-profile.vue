<template>
  <view class="crm-page invoice-page">
    <AppNavbar title="开票资料" />
    <view class="intro">
      <view class="intro-icon"><up-icon name="order" size="22" color="#2468e8" /></view>
      <view class="intro-text"><text class="intro-title">基础开票资料</text><text class="intro-desc">请填写准确的开票信息，方便后续开票使用</text></view>
    </view>
    <view v-if="loading" class="state">正在加载开票资料...</view>
    <view v-else-if="loadError" class="state" @click="loadProfile">{{ loadError }}，点击重试</view>
    <template v-else>
      <view class="form-card">
        <view v-for="field in fields" :key="field.key" class="form-row">
          <text class="label">{{ field.label }}</text>
          <textarea v-if="field.multiline" v-model="form[field.key]" class="input textarea" :maxlength="field.max" :disabled="saving" :placeholder="field.placeholder" placeholder-class="placeholder" auto-height />
          <input v-else v-model="form[field.key]" class="input" :maxlength="field.max" :disabled="saving" :placeholder="field.placeholder" placeholder-class="placeholder" />
        </view>
      </view>
      <text class="notice">同事账号维护的是所属经销商共享的开票资料</text>
      <text v-if="saveError" class="error">{{ saveError }}</text>
      <button class="save-btn" :disabled="saving" :loading="saving" @click="saveProfile">保存资料</button>
    </template>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { getMemberInfo, updateInvoiceProfile } from '@/api/member';
import { useUserStore } from '@/store/user';

// 字段及长度与后端接口保持一致，只提交这五项，不传经销商或档案 ID。
const fields = [
  { key: 'invoice_company_name', label: '开票公司名称', placeholder: '请输入开票公司名称', max: 255 },
  { key: 'taxpayer_id', label: '纳税人识别号', placeholder: '请输入纳税人识别号', max: 255 },
  { key: 'invoice_address_phone', label: '注册地址及电话', placeholder: '请输入注册地址及电话', max: 2000, multiline: true },
  { key: 'bank_account', label: '开户行及账号', placeholder: '请输入开户行及账号', max: 2000, multiline: true },
  { key: 'invoice_email', label: '电子邮箱', placeholder: '请输入电子邮箱', max: 100 }
];
const user = useUserStore();
const form = reactive(Object.fromEntries(fields.map(field => [field.key, ''])));
const loading = ref(true), saving = ref(false), loadError = ref(''), saveError = ref('');

// 缺字段时禁止编辑，避免旧接口或异常响应被当作空资料覆盖到服务端。
function readFields(member) {
  if (!member || typeof member !== 'object' || fields.some(field => typeof member[field.key] !== 'string')) throw new Error('开票资料返回不完整');
  return Object.fromEntries(fields.map(field => [field.key, member[field.key]]));
}

async function loadProfile() {
  if (!user.isLoggedIn) { loading.value = false; loadError.value = '请先登录'; return; }
  loading.value = true; loadError.value = '';
  const token = user.token;
  try {
    const member = await getMemberInfo({ showError: false });
    if (user.token !== token) throw new Error('登录状态已变化，请重新进入');
    Object.assign(form, readFields(member));
  } catch (error) { loadError.value = error.message || '开票资料加载失败'; }
  finally { loading.value = false; }
}

// 保存成功后再读取服务端资料；回读失败时保留输入并明确提示，不误报保存失败。
async function saveProfile() {
  if (saving.value) return;
  saving.value = true; saveError.value = '';
  const token = user.token;
  const payload = Object.fromEntries(fields.map(field => [field.key, form[field.key]]));
  try {
    await updateInvoiceProfile(payload);
    try {
      const member = await getMemberInfo({ showError: false });
      if (user.token !== token) throw new Error('登录状态已变化');
      const fresh = readFields(member);
      Object.assign(form, fresh);
      if (fields.some(field => fresh[field.key] !== payload[field.key])) {
        saveError.value = '保存已提交，最新资料与提交内容不一致，请核对后重试';
      } else {
        user.setUserInfo({ ...user.userInfo, ...member });
        uni.showToast({ title: '保存成功', icon: 'success' });
      }
    } catch (_) { saveError.value = '保存已提交，但最新资料读取失败，请稍后重新进入核对'; }
  } catch (error) { saveError.value = error.message || '保存失败，请稍后重试'; }
  finally { saving.value = false; }
}
onLoad(loadProfile);
</script>

<style scoped>
.invoice-page{min-height:100vh;padding-bottom:60rpx;background:#f3f7fd}.intro{display:flex;align-items:center;margin:24rpx 0;background:#eaf2ff;border:1rpx solid #d8e8ff;border-radius:22rpx;padding:24rpx}.intro-icon{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:64rpx;height:64rpx;border-radius:18rpx;background:#fff}.intro-text{display:flex;flex-direction:column;margin-left:20rpx}.intro-title{font-size:30rpx;font-weight:700;color:#1b3156}.intro-desc{margin-top:6rpx;font-size:23rpx;color:#788ca8}.form-card{background:#fff;border-radius:24rpx;padding:0 28rpx;box-shadow:0 8rpx 28rpx rgba(31,61,110,.05)}.form-row{padding:25rpx 0;border-bottom:1rpx solid #edf1f7}.form-row:last-child{border-bottom:0}.label{display:block;font-size:27rpx;font-weight:600;color:#26364f;margin-bottom:15rpx}.input{box-sizing:border-box;width:100%;min-height:80rpx;padding:20rpx 22rpx;border:1rpx solid #e5ebf3;border-radius:14rpx;background:#f8fafc;font-size:27rpx;color:#1f2d43}.textarea{min-height:100rpx}.placeholder{color:#a7b3c2}.notice{display:block;margin:22rpx 4rpx;color:#8a9ab0;font-size:23rpx;line-height:1.6}.save-btn{margin-top:28rpx;background:#2468e8;color:#fff;border-radius:50rpx;font-size:30rpx;font-weight:600;box-shadow:0 8rpx 20rpx rgba(36,104,232,.2)}.state{text-align:center;padding:80rpx 20rpx;color:#8292a9;font-size:27rpx}.error{display:block;margin:16rpx 4rpx;color:#d34c4c;font-size:24rpx;line-height:1.6}
</style>
