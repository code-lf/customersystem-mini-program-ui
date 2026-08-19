<template>
  <view class="monitor-card" @click="$emit('click', item)">
    <image :src="item.product.image" mode="aspectFit" />
    <view class="monitor-card__body"><text class="name">{{ item.product.model }}</text><text class="desc">当前价格 {{ item.currentPrice ? `¥${item.currentPrice.toLocaleString()}` : '待询价' }}</text><text class="date">{{ item.updatedAt }}</text></view>
    <view class="monitor-card__right"><text v-if="item.changed" class="change">↓ ¥{{ Math.max(item.previousPrice - item.currentPrice, 0).toLocaleString() }}</text><text v-else class="stable">价格暂无变化</text><text class="link">查看详情 ›</text></view>
  </view>
</template>
<script setup>defineProps({ item: { type: Object, required: true } }); defineEmits(['click']);</script>
<style lang="scss" scoped>.monitor-card{display:flex;align-items:center;padding:20rpx;margin-bottom:18rpx;background:#fff;border-radius:18rpx}.monitor-card image{width:120rpx;height:120rpx;margin-right:18rpx;background:#f4f8ff;border-radius:12rpx}.monitor-card__body{flex:1;min-width:0}.name,.desc,.date{display:block}.name{color:#17233d;font-size:28rpx;font-weight:600}.desc{margin-top:8rpx;color:#ef543f;font-size:25rpx}.date{margin-top:8rpx;color:#9aa5b5;font-size:20rpx}.monitor-card__right{text-align:right}.change{display:block;color:#2fa777;font-size:24rpx}.stable{display:block;color:#9aa5b5;font-size:21rpx}.link{display:block;margin-top:12rpx;color:#3474e8;font-size:21rpx}</style>
