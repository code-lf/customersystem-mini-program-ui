<template>
  <view class="monitor-page">
    <AppNavbar title="价格监控" />
    
    <!-- 头部品牌与统计信息 -->
    <view class="header-section">
      <view class="brand-head">
        <image class="brand-logo" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%232468e8' /%3E%3Cstop offset='100%25' stop-color='%2306b6d4' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M85,60 H60 V75 H70 C66,85 58,90 50,90 C35,90 25,78 25,60 C25,42 35,30 50,30 C58,30 65,34 69,40 L82,30 C74,18 64,12 50,12 C24,12 8,30 8,60 C8,90 24,108 50,108 C75,108 85,90 85,75 Z' fill='url(%23grad1)' /%3E%3Ccircle cx='85' cy='45' r='10' fill='%2310b981' /%3E%3C/svg%3E" mode="aspectFit" />
        <text class="brand-name">格宏助手智能监控</text>
      </view>
      
      <!-- 自定义精美 Tabs -->
      <view class="tabs">
        <view 
          v-for="item in tabs" 
          :key="item.value" 
          class="tab-item"
          :class="{ active: active === item.value }" 
          @click="active = item.value"
        >
          <text class="tab-text">{{ item.label }}</text>
          <view v-if="active === item.value" class="tab-indicator"></view>
        </view>
      </view>
    </view>

    <!-- 列表区 -->
    <view class="list-container">
      <view 
        v-for="item in filteredList" 
        :key="item.id" 
        class="monitor-card" 
        @click="openPage('/pages/monitor/detail', { productId: item.id })"
      >
        <!-- 图片区 -->
        <view class="image-box">
          <image :src="item.image" mode="aspectFit" />
          <view class="tag">多联机</view>
        </view>
        
        <!-- 内容区 -->
        <view class="card-content">
          <view class="card-header">
            <text class="model-text">{{ item.model }}</text>
            <view v-if="item.change" class="change-badge down">
              <text class="arrow">↓</text>
              <text>¥{{ money(item.change) }}</text>
            </view>
            <view v-else class="change-badge flat">
              <text>无变化</text>
            </view>
          </view>
          
          <view class="price-section">
            <view class="current-price">
              <text class="label">当前底价</text>
              <text class="symbol">¥</text>
              <text class="amount">{{ money(item.price) }}</text>
            </view>
            <text class="original-price">历史价 ¥{{ money(item.price + item.change) }}</text>
          </view>
          
          <view class="card-footer">
            <text class="update-time">最近更新：2026-06-20</text>
            <button class="action-btn">查看详情</button>
          </view>
        </view>
      </view>
      
      <!-- 列表为空时 -->
      <view v-if="filteredList.length === 0" class="empty-state">
        <text>暂无相关机型数据</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { openPage } from '@/utils/pages';
import { uiProducts } from '@/mock/ui-fixtures';

const active = ref('all');
const tabs = [
  { label: '全部机型', value: 'all' },
  { label: '近期降价', value: 'down' },
  { label: '价格波动', value: 'changed' }
];

// 模拟数据源
const allItems = computed(() => uiProducts.filter((item) => item.category === 'multi').map((item, index) => ({
  ...item,
  change: index === 1 ? 0 : (index + 1) * 600
})));

// 根据当前 tab 过滤数据
const filteredList = computed(() => {
  if (active.value === 'down' || active.value === 'changed') {
    return allItems.value.filter(item => item.change > 0);
  }
  return allItems.value;
});

const money = (value) => Number(value || 0).toLocaleString();
</script>

<style lang="scss" scoped>
.monitor-page {
  min-height: 100vh;
  background-color: #f4f7fb;
  padding-bottom: 40rpx;
}

.header-section {
  background-color: #ffffff;
  padding: 24rpx 32rpx 0;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand-head {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.brand-logo {
  width: 48rpx;
  height: 48rpx;
  margin-right: 16rpx;
}

.brand-name {
  color: #1a2233;
  font-size: 32rpx;
  font-weight: bold;
  letter-spacing: 1rpx;
}

/* Tabs 样式优化 */
.tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
}

.tab-item {
  position: relative;
  padding-bottom: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.tab-text {
  font-size: 28rpx;
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s;
}

.tab-item.active .tab-text {
  color: #2468e8;
  font-weight: bold;
  font-size: 30rpx;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  width: 32rpx;
  height: 6rpx;
  background: #2468e8;
  border-radius: 6rpx;
  transition: all 0.3s;
}

/* 列表容器 */
.list-container {
  padding: 24rpx;
}

/* 精美卡片设计 */
.monitor-card {
  display: flex;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
}

.monitor-card:active {
  transform: scale(0.98);
}

.image-box {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin-right: 24rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.image-box image {
  width: 120rpx;
  height: 120rpx;
}

.tag {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #2468e8, #4f86f7);
  color: #fff;
  font-size: 18rpx;
  padding: 4rpx 10rpx;
  border-radius: 16rpx 0 16rpx 0;
  font-weight: bold;
}

.card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.model-text {
  color: #1a2233;
  font-size: 30rpx;
  font-weight: bold;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 10rpx;
}

.change-badge {
  display: flex;
  align-items: center;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: bold;
}

.change-badge.down {
  background: #ecfdf5;
  color: #10b981;
}

.change-badge.flat {
  background: #f1f5f9;
  color: #94a3b8;
}

.arrow {
  font-size: 20rpx;
  margin-right: 2rpx;
}

.price-section {
  margin: 12rpx 0;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
}

.current-price {
  display: flex;
  align-items: baseline;
  color: #ef4444;
  margin-right: 16rpx;
}

.current-price .label {
  font-size: 22rpx;
  color: #64748b;
  margin-right: 8rpx;
}

.current-price .symbol {
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 2rpx;
}

.current-price .amount {
  font-size: 36rpx;
  font-weight: 900;
  letter-spacing: -1rpx;
}

.original-price {
  font-size: 22rpx;
  color: #94a3b8;
  text-decoration: line-through;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6rpx;
}

.update-time {
  font-size: 22rpx;
  color: #cbd5e1;
}

.action-btn {
  margin: 0;
  padding: 0 24rpx;
  height: 52rpx;
  line-height: 52rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  font-weight: bold;
  border-radius: 26rpx;
  border: none;
}

.action-btn::after {
  border: none;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300rpx;
  color: #94a3b8;
  font-size: 28rpx;
}
</style>

