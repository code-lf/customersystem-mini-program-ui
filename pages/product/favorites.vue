<template>
  <view class="crm-page favorites-page">
    <AppNavbar title="我的收藏" />
    <view class="search-box">
      <input v-model="keyword" confirm-type="search" placeholder="搜索已收藏的商品" @confirm="reload" />
      <text @click="reload">搜索</text>
    </view>
    <view v-if="loading && !items.length" class="status">正在加载收藏商品...</view>
    <view v-else-if="error && !items.length" class="status">{{ error }}<text class="retry" @click="reload">重试</text></view>
    <view v-else-if="!items.length" class="status">暂无收藏商品，去商品详情点击“收藏”试试</view>
    <view v-for="item in items" :key="item.goods_id" class="favorite-card" @click="openDetail(item)">
      <image v-if="item.image" :src="imageUrl(item.image)" mode="aspectFit" class="product-image" />
      <view class="product-info">
        <text class="name">{{ item.goods_name || item.model || item.sku }}</text>
        <text class="model">{{ item.model || item.sku || '暂无型号' }}</text>
        <text v-if="item.price !== undefined && item.price !== null" class="price">¥{{ Number(item.price).toLocaleString() }}</text>
      </view>
      <button class="remove-btn" :disabled="removingId === item.goods_id" @click.stop="remove(item)">取消收藏</button>
    </view>
    <view v-if="items.length && page < lastPage" class="load-more" @click="loadMore">{{ loading ? '加载中...' : '加载更多' }}</view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { getFavoriteProducts, removeFavoriteProduct } from '@/api/product';
import { openPage } from '@/utils/pages';
import { useUserStore } from '@/store/user';
import appConfig from '@/config/app';

const userStore = useUserStore();
const keyword = ref('');
const items = ref([]);
const page = ref(1);
const lastPage = ref(1);
const loading = ref(false);
const removingId = ref(0);
const error = ref('');

/** 收藏接口图片可能是站内相对路径，补齐域名后供小程序 image 加载。 */
const imageUrl = (url) => {
  if (!url || /^(https?:)?\/\//i.test(url)) return url;
  const serverBase = String(appConfig.baseUrl || '').replace(/\/api\/?$/, '');
  return `${serverBase}/${String(url).replace(/^\//, '')}`;
};

/** 分页加载收藏列表；请求失败时保留已加载商品，避免误显示为空。 */
const loadPage = async (targetPage) => {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  try {
    const result = await getFavoriteProducts({ page: targetPage, limit: 15, keyword: keyword.value.trim() });
    const rows = Array.isArray(result) ? result : (result?.data || []);
    items.value = targetPage === 1 ? rows : [...items.value, ...rows];
    page.value = targetPage;
    lastPage.value = Number(result?.last_page || targetPage);
  } catch (err) {
    error.value = err?.message || '收藏列表加载失败';
  } finally {
    loading.value = false;
  }
};

const reload = () => loadPage(1);
const loadMore = () => { if (!loading.value && page.value < lastPage.value) loadPage(page.value + 1); };
const openDetail = (item) => openPage('/pages/product/detail', { id: item.goods_id });

/** 后端取消成功后才从列表移除，防止页面状态与服务端不一致。 */
const remove = async (item) => {
  removingId.value = item.goods_id;
  try {
    await removeFavoriteProduct(item.goods_id);
    items.value = items.value.filter((row) => row.goods_id !== item.goods_id);
    uni.showToast({ title: '已取消收藏', icon: 'success' });
  } catch (err) {
    uni.showToast({ title: err?.message || '取消收藏失败', icon: 'none' });
  } finally {
    removingId.value = 0;
  }
};

onShow(() => {
  if (!userStore.isLoggedIn) {
    openPage('/pages/auth/login');
    return;
  }
  reload();
});
</script>

<style lang="scss" scoped>
.favorites-page { min-height: 100vh; padding: 0 24rpx 48rpx; background: #f5f8fd; }
.search-box { display: flex; align-items: center; gap: 16rpx; margin: 22rpx 0; padding: 20rpx 24rpx; border-radius: 20rpx; background: #fff; color: #2468e8; font-size: 26rpx; }
.search-box input { flex: 1; min-width: 0; color: #17233d; }
.status { padding: 100rpx 20rpx; text-align: center; color: #8b95a7; font-size: 26rpx; }
.retry { display: block; margin-top: 20rpx; color: #2468e8; }
.favorite-card { display: flex; align-items: center; gap: 18rpx; margin-bottom: 18rpx; padding: 24rpx; border-radius: 20rpx; background: #fff; }
.product-image { width: 110rpx; height: 110rpx; flex: none; }
.product-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10rpx; }
.name { color: #17233d; font-size: 28rpx; font-weight: 700; }
.model { color: #718098; font-size: 23rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.price { color: #ef543f; font-size: 27rpx; font-weight: 700; }
.remove-btn { flex: none; margin: 0; padding: 0 12rpx; background: #f0f3f8; color: #667286; font-size: 22rpx; line-height: 58rpx; }
.load-more { padding: 32rpx; text-align: center; color: #2468e8; font-size: 25rpx; }
</style>
