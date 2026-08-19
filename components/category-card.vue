<template>
  <view class="category-card" :class="`category-card--${type}`" @click="$emit('click', category)">
    <view><text class="category-card__title">{{ category.name }}</text><text class="category-card__desc">{{ category.description }}</text><text class="category-card__link">查看产品 →</text></view>
    <up-icon :name="category.icon || 'grid'" color="#fff" size="42" />
  </view>
</template>

<script setup>
defineProps({ category: { type: Object, required: true }, type: { type: String, default: 'central' } });
defineEmits(['click']);
</script>

<style lang="scss" scoped>
.category-card { display: flex; align-items: center; justify-content: space-between; min-height: 180rpx; padding: 28rpx 32rpx; margin-bottom: 20rpx; color: #fff; border-radius: 24rpx; background: linear-gradient(135deg, #3478f6, #1c54ca); box-shadow: 0 12rpx 24rpx rgba(45, 102, 224, .18); }
.category-card--home { background: linear-gradient(135deg, #44bd8a, #20a66e); }
.category-card__title, .category-card__desc, .category-card__link { display: block; }
.category-card__title { font-size: 36rpx; font-weight: 700; }
.category-card__desc { margin-top: 10rpx; font-size: 22rpx; opacity: .86; }
.category-card__link { width: fit-content; margin-top: 20rpx; padding: 8rpx 18rpx; color: #2b67d8; background: #fff; border-radius: 30rpx; font-size: 21rpx; }
</style>
