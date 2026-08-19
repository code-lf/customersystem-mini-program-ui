<template>
  <view class="design-page tab-page message-page">
    <AppNavbar title="消息通知" />

    <view class="tabs">
      <text v-for="item in tabs" :key="item.value" :class="{ active: active === item.value }" @click="active = item.value">{{ item.label }}</text>
    </view>

    <view v-for="message in shownMessages" :key="message.id" class="message-card">
      <view class="message-card__icon" :style="{ background: message.color }">
        <up-icon :name="message.icon" size="26" color="#fff" />
      </view>
      <view>
        <view class="message-card__top">
          <text>{{ message.title }}</text>
          <text>{{ message.time }}</text>
        </view>
        <text class="message-card__desc">{{ message.desc }}</text>
      </view>
      <text v-if="message.unread" class="badge">{{ message.unread }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { uiMessages } from '@/mock/ui-fixtures';

const active = ref('all');
const tabs = [
  { label: '全部', value: 'all' },
  { label: '价格变动', value: 'price' },
  { label: '资料更新', value: 'document' },
  { label: '系统公告', value: 'system' }
];
const shownMessages = computed(() => active.value === 'all' ? uiMessages : uiMessages.filter((item) => item.type === active.value));
</script>

<style lang="scss" scoped>
.tabs {
  display: flex;
  justify-content: space-between;
  height: 76rpx;
  align-items: center;
}

.tabs text {
  height: 76rpx;
  color: #667286;
  font-size: 24rpx;
  line-height: 76rpx;
  border-bottom: 4rpx solid transparent;
}

.tabs text.active {
  color: #2468e8;
  font-weight: 800;
  border-bottom-color: #2468e8;
}

.message-card {
  position: relative;
  display: flex;
  min-height: 122rpx;
  padding: 20rpx;
  margin-bottom: 18rpx;
  border-radius: 16rpx;
  background: #fff;
}

.tab-page {
  padding-bottom: 120rpx;
}

.message-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  margin-right: 18rpx;
  border-radius: 14rpx;
}

.message-card > view:nth-child(2) {
  flex: 1;
  min-width: 0;
}

.message-card__top {
  display: flex;
  justify-content: space-between;
}

.message-card__top text:first-child {
  color: #17233d;
  font-size: 26rpx;
  font-weight: 800;
}

.message-card__top text:last-child {
  color: #8b95a7;
  font-size: 20rpx;
}

.message-card__desc {
  display: block;
  margin-top: 10rpx;
  color: #8b95a7;
  font-size: 22rpx;
  line-height: 32rpx;
}

.badge {
  position: absolute;
  right: 22rpx;
  bottom: 22rpx;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background: #f14d45;
  color: #fff;
  font-size: 18rpx;
  line-height: 30rpx;
  text-align: center;
}
</style>
