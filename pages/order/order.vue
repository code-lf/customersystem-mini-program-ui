<template>
  <view class="container">
    <AppWatermark />
    <text>订单页面</text>
  </view>
</template>

<script setup>
import AppWatermark from '@/components/app-watermark.vue';
</script>

<style>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
