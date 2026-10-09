<template>
  <view class="detail-page">
    <AppNavbar title="申请详情" />
    <view v-if="loading" class="state-card">正在加载申请详情...</view>
    <view v-else-if="errorText" class="state-card">
      <text>{{ errorText }}</text>
      <button @click="loadDetail">重试</button>
    </view>
    <view v-else-if="application" class="detail-card">
      <view class="detail-head">
        <text class="company-name">{{ application.company_name || '合作申请' }}</text>
        <text class="status">{{ statusText }}</text>
      </view>
      <text class="application-no">申请编号：{{ application.application_no || application.application_id }}</text>
      <view v-for="row in detailRows" :key="row.label" class="detail-row">
        <text>{{ row.label }}</text><text>{{ row.value || '—' }}</text>
      </view>
      <view v-if="application.handled_remark" class="remark">
        <text>处理备注</text><text>{{ application.handled_remark }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { getCooperationDetail } from '@/api/content';

const applicationId = ref('');
const application = ref(null);
const loading = ref(false);
const errorText = ref('');
const statusLabels = { pending: '待处理', assigned: '已分配', following: '跟进中', converted: '已转化', rejected: '已拒绝', invalid: '无效' };
const statusText = computed(() => statusLabels[application.value?.application_status] || '待处理');
// 详情字段完全来自合作申请详情接口，不用列表快照代替处理结果。
const detailRows = computed(() => {
  const item = application.value || {};
  return [
    { label: '申请人', value: item.applicant_name },
    { label: '联系电话', value: item.mobile },
    { label: '经营区域', value: item.area_text || [item.province_name, item.city_name, item.district_name].filter(Boolean).join(' ') },
    { label: '经营地址', value: item.business_address },
    { label: '经营类型', value: item.business_type },
    { label: '主营品牌', value: item.main_brand },
    { label: '年销售规模', value: item.annual_sales },
    { label: '基本介绍', value: item.introduction },
    { label: '申请时间', value: item.create_time_text },
    { label: '处理时间', value: item.handled_time_text }
  ];
});

onLoad((options = {}) => { applicationId.value = String(options.id || ''); });
onShow(() => loadDetail());

/** 使用申请 ID 读取本人申请详情，接口失败时保留可重试状态。 */
const loadDetail = async () => {
  if (!applicationId.value) {
    errorText.value = '缺少申请编号';
    return;
  }
  loading.value = true;
  errorText.value = '';
  try {
    const result = await getCooperationDetail(applicationId.value);
    if (!result || typeof result !== 'object' || !result.application_id) throw new Error('申请详情格式不正确');
    application.value = result;
  } catch (error) {
    console.error('[合作申请] 获取详情失败：', error);
    errorText.value = error?.message || '申请详情加载失败';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.detail-page { min-height: 100vh; padding-bottom: 50rpx; background: #f3f7fd; }
.state-card, .detail-card { margin: 28rpx; padding: 30rpx; border-radius: 20rpx; background: #fff; }
.state-card { display: flex; flex-direction: column; align-items: center; gap: 20rpx; color: #718098; font-size: 26rpx; }
.state-card button { margin: 0; padding: 0 44rpx; background: #2468e8; color: #fff; font-size: 24rpx; }
.detail-head { display: flex; justify-content: space-between; align-items: center; gap: 20rpx; }
.company-name { flex: 1; color: #17233d; font-size: 32rpx; font-weight: 700; }
.status { color: #2468e8; font-size: 24rpx; }
.application-no { display: block; margin: 14rpx 0 26rpx; color: #94a3b8; font-size: 23rpx; }
.detail-row { display: flex; justify-content: space-between; gap: 24rpx; padding: 20rpx 0; border-top: 1rpx solid #edf1f5; font-size: 25rpx; }
.detail-row text:first-child { flex-shrink: 0; color: #718098; }
.detail-row text:last-child { color: #17233d; text-align: right; word-break: break-all; }
.remark { display: flex; flex-direction: column; gap: 10rpx; padding-top: 22rpx; border-top: 1rpx solid #edf1f5; color: #718098; font-size: 25rpx; }
.remark text:last-child { color: #17233d; }
</style>
