<template>
  <view class="cooperation-page">
    <AppNavbar title="合作申请" />
    <view class="cooperation-tabs">
      <view :class="{ active: activeTab === 'apply' }" @click="switchTab('apply')">发起申请</view>
      <view :class="{ active: activeTab === 'records' }" @click="switchTab('records')">申请记录</view>
    </view>

    <!-- Hero Section -->
    <view v-if="activeTab === 'apply'" class="hero-section">
      <view class="hero-content">
        <text class="hero-title">成为我们的合作伙伴</text>
        <text class="hero-subtitle">共享行业资源，开启合作共赢新篇章</text>
      </view>
    </view>

    <!-- Form Section -->
    <view v-if="activeTab === 'apply'" class="form-container">
      <view class="form-card">
        <view class="form-header">
          <text class="form-header-title">基本信息登记</text>
          <text class="form-header-desc">请填写真实有效的合作信息</text>
        </view>

        <view class="field-group">
          <view class="field-item">
            <text class="field-label">联系人姓名 <text class="required">*</text></text>
            <input v-model="formData.name" placeholder="请输入您的姓名" placeholder-class="placeholder" />
          </view>
          
          <view class="field-item">
            <text class="field-label">联系电话 <text class="required">*</text></text>
            <input v-model="formData.phone" type="number" maxlength="11" placeholder="请输入手机号码" placeholder-class="placeholder" />
          </view>
          
          <view class="field-item">
            <text class="field-label">公司名称 <text class="required">*</text></text>
            <input v-model="formData.company" placeholder="请输入公司全称" placeholder-class="placeholder" />
          </view>
          
          <view class="field-item">
            <text class="field-label">经营区域</text>
            <input v-model="formData.region" placeholder="如：广东省 深圳市" placeholder-class="placeholder" />
          </view>
          
          <view class="field-item">
            <text class="field-label">公司地址</text>
            <input v-model="formData.address" placeholder="请输入详细办公地址" placeholder-class="placeholder" />
          </view>
          
          <view class="field-item field-item-area">
            <text class="field-label">公司基本介绍</text>
            <view class="textarea-box">
              <textarea v-model="formData.intro" maxlength="200" placeholder="请简要介绍公司情况、主营业务、团队规模等（最多 200 字）" placeholder-class="placeholder" />
              <text class="counter">{{ formData.intro.length }}/200</text>
            </view>
          </view>
        </view>

        <button class="submit-btn" :loading="isSubmitting" @click="handleSubmit">
          {{ isSubmitting ? '提交中...' : '提交合作申请' }}
        </button>
      </view>
    </view>
    <!-- 申请列表只展示服务端返回的当前账号记录，匿名提交后需登录才能查询。 -->
    <view v-else class="record-container">
      <view v-if="!userStore.isLoggedIn" class="record-state">
        <text>登录后可查看您的合作申请记录</text>
        <button @click="openPage('/pages/auth/login')">去登录</button>
      </view>
      <view v-else-if="recordLoading && !applications.length" class="record-state">正在加载申请记录...</view>
      <view v-else-if="recordError && !applications.length" class="record-state">
        <text>{{ recordError }}</text><button @click="loadApplications(true)">重试</button>
      </view>
      <view v-else-if="!applications.length" class="record-state">暂无合作申请记录</view>
      <template v-else>
        <view v-for="item in applications" :key="item.application_id" class="record-card" @click="openPage('/pages/cooperation/detail', { id: item.application_id })">
          <view class="record-head"><text>{{ item.company_name || '合作申请' }}</text><text class="record-status">{{ statusText(item.application_status) }}</text></view>
          <text class="record-no">申请编号：{{ item.application_no || item.application_id }}</text>
          <text class="record-time">申请时间：{{ item.create_time_text || '--' }}</text>
          <text class="record-link">查看详情 ›</text>
        </view>
        <view v-if="recordLoading" class="record-footer">正在加载更多...</view>
        <view v-else-if="recordError" class="record-footer" @click="loadApplications(false)">{{ recordError }}，点击重试</view>
        <view v-else-if="!hasMore" class="record-footer">已显示全部申请</view>
      </template>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onReachBottom, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { checkCooperation, getCooperationList, submitCooperation } from '@/api/content';
import { openPage } from '@/utils/pages';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const activeTab = ref('apply');
const applications = ref([]);
const recordLoading = ref(false);
const recordError = ref('');
const currentPage = ref(1);
const hasMore = ref(true);
const pageSize = 20;
const statusLabels = { pending: '待处理', assigned: '已分配', following: '跟进中', converted: '已转化', rejected: '已拒绝', invalid: '无效' };
const statusText = (status) => statusLabels[status] || '待处理';

const formData = reactive({
  name: '',
  phone: '',
  company: '',
  region: '',
  address: '',
  intro: ''
});

const isSubmitting = ref(false);

/** 申请记录由接口分页返回；切换到记录页或提交成功后重新读取。 */
const loadApplications = async (reset = false) => {
  if (!userStore.isLoggedIn || recordLoading.value) return;
  if (reset) {
    applications.value = [];
    currentPage.value = 1;
    hasMore.value = true;
  }
  if (!hasMore.value) return;
  recordLoading.value = true;
  recordError.value = '';
  try {
    const result = await getCooperationList({ page: currentPage.value, limit: pageSize });
    const rows = Array.isArray(result) ? result : result?.data;
    if (!Array.isArray(rows)) throw new Error('申请记录格式不正确');
    applications.value = [...applications.value, ...rows];
    const lastPage = Number(result?.last_page || 0);
    hasMore.value = lastPage > 0 ? currentPage.value < lastPage : rows.length >= pageSize;
    currentPage.value += 1;
  } catch (error) {
    console.error('[合作申请] 获取申请列表失败：', error);
    recordError.value = error?.message || '申请记录加载失败';
  } finally {
    recordLoading.value = false;
  }
};

const switchTab = (tab) => {
  activeTab.value = tab;
  if (tab === 'records') loadApplications(true);
};

onShow(() => {
  if (activeTab.value === 'records') loadApplications(true);
});
onReachBottom(() => {
  if (activeTab.value === 'records' && hasMore.value) loadApplications(false);
});

/** 先做重复申请检查，再按正式合作申请接口提交字段。 */
const handleSubmit = async () => {
  if (isSubmitting.value) return;
  if (!formData.name.trim() || !formData.phone.trim() || !formData.company.trim()) {
    uni.showToast({ title: '请填写完整的带*必填项', icon: 'none' });
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    uni.showToast({ title: '手机号码格式不正确', icon: 'none' });
    return;
  }
  isSubmitting.value = true;
  try {
    let duplicate = null;
    try {
      duplicate = await checkCooperation(
        { mobile: formData.phone.trim(), company_name: formData.company.trim() },
        { showError: false }
      );
    } catch (error) {
      // 预检异常不阻断匿名提交；正式提交接口仍会拦截重复申请。
      console.warn('[合作申请] 重复检查暂不可用，交由提交接口校验：', error);
    }
    if (duplicate?.has_open_application) {
      uni.showModal({ title: '已有合作申请', content: '该联系方式或公司已有处理中的申请，请勿重复提交。', showCancel: false });
      return;
    }
    const regionParts = formData.region.trim().split(/\s+/).filter(Boolean);
    await submitCooperation({
      applicant_name: formData.name.trim(),
      mobile: formData.phone.trim(),
      company_name: formData.company.trim(),
      province_name: regionParts[0] || '',
      city_name: regionParts[1] || '',
      district_name: regionParts[2] || '',
      business_address: formData.address.trim(),
      introduction: formData.intro.trim(),
      source_url: '/pages/cooperation/index'
    });
    uni.showToast({ title: '申请提交成功', icon: 'success' });
    Object.keys(formData).forEach(key => formData[key] = '');
    if (userStore.isLoggedIn) switchTab('records');
  } catch (error) {
    // 请求层会展示接口错误，这里保留日志供排查，不再叠加提示。
    console.error('[合作申请] 提交失败：', error);
  } finally {
    isSubmitting.value = false;
  }
};

onShareAppMessage(() => ({ title: '诚邀合作 - 欢迎申请成为我们的合作伙伴', path: '/pages/cooperation/index' }));
onShareTimeline(() => ({ title: '诚邀合作 - 欢迎申请成为我们的合作伙伴', query: '' }));
</script>

<style lang="scss" scoped>
.cooperation-page {
  min-height: 100vh;
  background: #f3f7fd;
  padding-bottom: 60rpx;
}

.cooperation-tabs { display: flex; padding: 0 30rpx; background: #fff; }
.cooperation-tabs view { flex: 1; padding: 24rpx 0; text-align: center; color: #718098; font-size: 28rpx; }
.cooperation-tabs view.active { color: #2468e8; font-weight: 700; border-bottom: 5rpx solid #2468e8; }
.record-container { padding: 28rpx 30rpx; }
.record-state { display: flex; flex-direction: column; align-items: center; gap: 22rpx; padding: 120rpx 20rpx; color: #718098; font-size: 27rpx; }
.record-state button { margin: 0; padding: 0 48rpx; border-radius: 40rpx; background: #2468e8; color: #fff; font-size: 26rpx; }
.record-card { margin-bottom: 20rpx; padding: 28rpx; border-radius: 20rpx; background: #fff; box-shadow: 0 4rpx 20rpx rgba(0,0,0,.04); }
.record-head { display: flex; justify-content: space-between; gap: 20rpx; color: #17233d; font-size: 29rpx; font-weight: 700; }
.record-status { flex-shrink: 0; color: #2468e8; font-size: 24rpx; }
.record-no, .record-time { display: block; margin-top: 14rpx; color: #718098; font-size: 23rpx; }
.record-link { display: block; margin-top: 18rpx; color: #2468e8; font-size: 24rpx; text-align: right; }
.record-footer { padding: 22rpx; color: #94a3b8; font-size: 23rpx; text-align: center; }

/* 顶部视觉横幅 */
.hero-section {
  width: 100%;
  height: 320rpx;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero-section::after {
  content: '';
  position: absolute;
  right: -50rpx;
  top: -50rpx;
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.hero-section::before {
  content: '';
  position: absolute;
  left: -80rpx;
  bottom: -80rpx;
  width: 300rpx;
  height: 300rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%;
}

.hero-content {
  text-align: center;
  z-index: 1;
}

.hero-title {
  display: block;
  font-size: 44rpx;
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 2rpx;
  margin-bottom: 16rpx;
  text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.15);
}

.hero-subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1rpx;
}

/* 表单主体区 */
.form-container {
  padding: 0 30rpx;
  margin-top: -60rpx;
  position: relative;
  z-index: 2;
}

.form-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.04);
}

.form-header {
  margin-bottom: 40rpx;
  text-align: center;
}

.form-header-title {
  display: block;
  font-size: 34rpx;
  color: #1a2233;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.form-header-desc {
  display: block;
  font-size: 24rpx;
  color: #8b95a7;
}

/* 表单字段样式 */
.field-group {
  margin-bottom: 40rpx;
}

.field-item {
  margin-bottom: 30rpx;
}

.field-label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.required {
  color: #ff4d4f;
  margin-left: 6rpx;
}

.field-item input {
  width: 100%;
  height: 88rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #1a2233;
  box-sizing: border-box;
  transition: all 0.3s;
}

.field-item input:focus {
  border-color: #2468e8;
  background: #ffffff;
}

.field-item-area .textarea-box {
  position: relative;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 24rpx;
  box-sizing: border-box;
}

.field-item-area textarea {
  width: 100%;
  height: 200rpx;
  font-size: 28rpx;
  color: #1a2233;
  line-height: 1.5;
}

.counter {
  position: absolute;
  right: 24rpx;
  bottom: 20rpx;
  font-size: 22rpx;
  color: #94a3b8;
}

.placeholder {
  color: #94a3b8;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #2468e8 0%, #1e58c8 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(36, 104, 232, 0.3);
}

.submit-btn::after {
  border: none;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(36, 104, 232, 0.2);
}
</style>
