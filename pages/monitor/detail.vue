<template><view class="crm-page"><app-navbar title="价格变化" /><view v-if="item" class="crm-card"><view class="product"><image :src="item.product.image" mode="aspectFit" /><view><text>{{ item.product.name }}</text><text>{{ item.product.model }}</text></view></view><view class="current"><text>当前价格</text><text>¥{{ Number(item.currentPrice).toLocaleString() }}</text></view><view class="history-title">价格变化记录</view><view v-for="row in item.history" :key="row.date" class="history-row"><text>{{ row.date }}</text><text>¥{{ Number(row.price).toLocaleString() }}</text></view></view><empty-state v-else text="暂无价格记录" /></view></template>
<script setup>
import { onMounted, ref } from 'vue';
import { getMonitorList } from '@/api/monitor';
import { getPageOptions } from '@/utils/pages';

const item = ref(null);
onMounted(async () => {
  try {
    const options = getPageOptions();
    const result = await getMonitorList();
    const watches = result.data || [];
    const watch = watches.find(row => String(row.goods_id) === String(options.productId));
    if (watch) {
      item.value = {
        product: {
          name: watch.goods_name_snapshot,
          model: watch.model_snapshot,
          image: watch.image_snapshot
        },
        currentPrice: watch.last_price || watch.base_price,
        history: [
          { date: watch.create_time_text, price: watch.base_price }
        ]
      };
      if (watch.last_price && watch.last_price !== watch.base_price) {
        item.value.history.unshift({ date: watch.last_notify_time_text || '最近', price: watch.last_price });
      }
    }
  } catch(e) {}
});
</script>
<style lang="scss" scoped>.product{display:flex;align-items:center}.product image{width:150rpx;height:150rpx;margin-right:20rpx;background:#f4f8ff;border-radius:14rpx}.product text{display:block}.product text:first-child{color:#17233d;font-size:28rpx;font-weight:600}.product text:last-child{margin-top:8rpx;color:#8b95a7;font-size:22rpx}.current{display:flex;justify-content:space-between;padding:30rpx 0;margin-top:24rpx;border-top:1rpx solid #edf0f5;border-bottom:1rpx solid #edf0f5;color:#8b95a7;font-size:25rpx}.current text:last-child{color:#ef543f;font-size:38rpx;font-weight:700}.history-title{margin-top:26rpx;color:#17233d;font-size:28rpx;font-weight:600}.history-row{display:flex;justify-content:space-between;padding:18rpx 0;color:#718098;font-size:24rpx;border-bottom:1rpx solid #edf0f5}.history-row text:last-child{color:#17233d}</style>
