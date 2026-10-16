<template>
  <!-- 库存统一在组件内校验业务员身份，列表和详情均不可向普通会员或经销商展示。 -->
  <view v-if="userStore.isSalesperson && stocks.length" class="product-stock" :class="{ 'product-stock--full': fullName }">
    <text v-if="fullName" class="stock-title">仓库库存</text>
    <view class="stock-items">
      <text v-for="stock in stocks" :key="stock.warehouse_id" class="stock-item">{{ stock.name }}：{{ stock.quantity }}<text v-if="fullName && product.unit"> {{ product.unit }}</text></text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/store/user';

const props = defineProps({
  product: { type: Object, default: () => ({}) },
  // 列表默认显示仓库名前三个字；详情通过 full-name 展示完整仓库名称。
  fullName: { type: Boolean, default: false }
});
const userStore = useUserStore();

/** 保留各仓库的真实零库存；缺失或无效数量不冒充零库存，不再使用旧合计字段。 */
const stocks = computed(() => {
  if (!userStore.isSalesperson || !Array.isArray(props.product?.stocks)) return [];
  return props.product.stocks.flatMap((stock) => {
    const name = String(stock?.warehouse_name || '').trim();
    const value = stock?.quantity;
    if (!name || value == null || String(value).trim() === '' || !Number.isFinite(Number(value))) return [];
    return [{
      warehouse_id: stock.warehouse_id,
      name: props.fullName ? name : Array.from(name).slice(0, 3).join(''),
      quantity: String(Number(value))
    }];
  });
});
</script>

<style lang="scss" scoped>
.product-stock {
  margin: 8rpx 0;
  color: #64748b;
  font-size: 22rpx;
  font-weight: 400;
  line-height: 1.5;
}
.stock-items { display: flex; flex-wrap: wrap; column-gap: 24rpx; row-gap: 6rpx; }
.stock-item { white-space: nowrap; }
.stock-title { display: block; margin-bottom: 10rpx; color: #334155; font-size: 25rpx; font-weight: 600; }
.product-stock--full { margin-top: 20rpx; padding: 18rpx; border-radius: 12rpx; background: #f8fafc; font-size: 24rpx; }
.product-stock--full .stock-items { flex-direction: column; gap: 10rpx; }
.product-stock--full .stock-item { white-space: normal; overflow-wrap: anywhere; }
</style>
