<template>
  <view class="product-card" @click="$emit('click', product)">
    <image class="product-card__image" :src="product.image" mode="aspectFit" />
    <view class="product-card__body">
      <view class="product-card__title">{{ product.name }}</view>
      <view class="product-card__model">{{ product.model }}</view>
      <view class="product-card__tags"><text v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</text></view>
      <view class="product-card__bottom">
        <text class="price">{{ product.priceLabel }}</text>
        <up-button size="small" type="primary" shape="circle" @click.stop="$emit('add', product)">加入报价单</up-button>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({ product: { type: Object, required: true } });
defineEmits(['click', 'add']);
</script>

<style lang="scss" scoped>
.product-card { display: flex; padding: 22rpx; margin-bottom: 20rpx; background: #fff; border-radius: 20rpx; box-shadow: 0 8rpx 24rpx rgba(31, 64, 120, .05); }
.product-card__image { flex: 0 0 180rpx; width: 180rpx; height: 180rpx; border-radius: 16rpx; background: #f4f8ff; }
.product-card__body { flex: 1; min-width: 0; padding-left: 20rpx; }
.product-card__title { color: #17233d; font-size: 29rpx; font-weight: 600; line-height: 42rpx; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.product-card__model { margin-top: 4rpx; color: #8b95a7; font-size: 23rpx; }
.product-card__tags { display: flex; flex-wrap: wrap; gap: 8rpx; margin: 14rpx 0; }
.tag { padding: 4rpx 10rpx; color: #3474e8; background: #edf4ff; border-radius: 6rpx; font-size: 20rpx; }
.product-card__bottom { display: flex; align-items: center; justify-content: space-between; }
.price { color: #ef543f; font-size: 30rpx; font-weight: 700; }
</style>
