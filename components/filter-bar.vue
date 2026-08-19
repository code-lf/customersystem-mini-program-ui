<template>
  <scroll-view class="filter-bar" scroll-x>
    <view v-for="item in options" :key="item.value" class="filter-bar__item" :class="{ active: modelValue === item.value }" @click="$emit('update:modelValue', item.value)">
      {{ item.label }}
    </view>
  </scroll-view>
</template>

<script setup>
defineProps({ modelValue: { type: [String, Number], default: 'all' }, options: { type: Array, default: () => [] } });
defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
.filter-bar { width: 100%; white-space: nowrap; padding: 18rpx 0; }
.filter-bar__item { display: inline-block; margin-right: 34rpx; color: #8b95a7; font-size: 25rpx; line-height: 52rpx; border-bottom: 4rpx solid transparent; }
.filter-bar__item.active { color: #2468e8; font-weight: 600; border-bottom-color: #2468e8; }
</style>
