<template>
  <!-- 数量和金额均读取报名响应快照，不使用当前活动价格重新计算历史订单。 -->
  <view v-if="rows.length || hasTotals" class="enrollment-summary">
    <text class="summary-title">{{ title }}</text>
    <view v-for="item in rows" :key="item.campaign_item_id" class="summary-product">
      <text class="product-name">{{ item.goods_name_snapshot || '活动商品' }}</text>
      <text class="product-quantity">每套 {{ formatNumber(item.group_quantity) }} · 购买 {{ formatNumber(item.group_count) }} 套 · 实际数量 {{ formatNumber(item.quantity) }}</text>
      <view class="product-amount-row">
        <text>活动单价 ¥{{ formatMoney(item.campaign_price) }}</text>
        <text class="product-amount">小计 ¥{{ formatMoney(item.line_amount) }}</text>
      </view>
    </view>
    <view v-if="hasTotals" class="summary-total">
      <text>总数量 {{ formatNumber(record.total_quantity) }}</text>
      <text class="total-amount">合计 ¥{{ formatMoney(record.total_amount) }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  record: { type: Object, default: () => ({}) },
  title: { type: String, default: '报名商品明细' }
});

// 老报名记录没有商品快照时隐藏模块；缺失字段不能被格式化成真实的零数量或零金额。
const rows = computed(() => Array.isArray(props.record?.items) ? props.record.items : []);
const hasValue = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
const hasTotals = computed(() => hasValue(props.record?.total_quantity) && hasValue(props.record?.total_amount));
const formatNumber = (value) => hasValue(value) ? Number(value).toLocaleString() : '—';
const formatMoney = (value) => hasValue(value) ? Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
</script>

<style lang="scss" scoped>
.enrollment-summary { margin-top: 20rpx; padding: 22rpx; border-radius: 16rpx; background: #eff6ff; }
.summary-title { display: block; color: #1e40af; font-size: 26rpx; font-weight: 600; }
.summary-product { padding: 18rpx 0; border-bottom: 1rpx solid #dbeafe; }
.product-name { display: block; font-size: 26rpx; color: #1e293b; font-weight: 600; word-break: break-all; }
.product-quantity { display: block; margin-top: 8rpx; color: #64748b; font-size: 22rpx; line-height: 1.6; }
.product-amount-row, .summary-total { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12rpx; margin-top: 12rpx; color: #64748b; font-size: 22rpx; }
.product-amount { color: #334155; }
.summary-total { padding-top: 8rpx; color: #334155; font-size: 26rpx; }
.total-amount { color: #dc2626; font-weight: 700; }
</style>
