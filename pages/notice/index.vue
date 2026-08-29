<template>
  <view class="design-page tab-page notice-page">
    <AppNavbar title="公告列表" />

    <view class="tabs">
      <text v-for="item in tabs" :key="item" :class="{ active: active === item }" @click="active = item">{{ item }}</text>
    </view>

    <view v-for="notice in shownNotices" :key="notice.id" class="notice-card" @click="openPage('/pages/notice/detail', { id: notice.id })">
      <view>
        <view class="notice-card__title">
          <text>{{ notice.title }}</text>
          <text v-if="notice.tag">{{ notice.tag }}</text>
        </view>
        <view class="notice-card__meta">
          <text>{{ notice.date }}</text>
          <text>阅读 {{ notice.views }}</text>
        </view>
      </view>
      <image :src="notice.image" mode="aspectFill" />
    </view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { openPage } from '@/utils/pages';
import { getNotices, getNoticeCategories } from '@/api/content';

const active = ref('全部');
const isLoading = ref(true);

const uiNotices = ref([]);
const categories = ref([{ id: 0, category_name: '全部' }]);

const loadNotices = async () => {
  isLoading.value = true;
  try {
    const [catRes, listRes] = await Promise.allSettled([
      getNoticeCategories(),
      getNotices({ limit: 100 })
    ]);
    
    if (catRes.status === 'fulfilled' && catRes.value) {
      const rawCats = Array.isArray(catRes.value)
        ? catRes.value
        : (Array.isArray(catRes.value.data) ? catRes.value.data : []);
      if (rawCats.length > 0) {
        categories.value = [{ id: 0, category_name: '全部' }, ...rawCats];
      }
    }
    
    if (listRes.status === 'fulfilled' && listRes.value) {
      const val = listRes.value;
      const rawArticles = Array.isArray(val)
        ? val
        : (Array.isArray(val.data) ? val.data : (val.data?.data || []));
      
      if (rawArticles.length > 0) {
        uiNotices.value = rawArticles.map(n => ({
          id: n.article_id || n.id,
          title: n.article_title || n.title,
          tag: n.category_name || '调价公告',
          date: n.publish_time_text || (n.publish_time ? new Date(n.publish_time * 1000).toLocaleDateString() : ''),
          views: n.read_count || n.read_visitor_count || 1,
          image: n.cover_image || '',
          type: n.category_name || '调价公告'
        }));
      }
    }
  } catch(e) {
    console.warn('loadNotices error:', e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadNotices();
});

const shownNotices = computed(() => {
  if (active.value === '全部') return uiNotices.value;
  return uiNotices.value.filter((item) => item.type === active.value);
});

const tabs = computed(() => categories.value.map(c => c.category_name));

const handleTabClick = (tab) => {
  active.value = tab;
};
</script>

<style lang="scss" scoped>
.tabs {
  display: flex;
  justify-content: space-between;
  height: 76rpx;
  align-items: center;
}

.tab-page {
  padding-bottom: 120rpx;
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

.notice-card {
  display: flex;
  min-height: 142rpx;
  padding: 18rpx;
  margin-bottom: 18rpx;
  border-radius: 16rpx;
  background: #fff;
}

.notice-card > view {
  flex: 1;
  min-width: 0;
  padding-right: 18rpx;
}

.notice-card image {
  width: 170rpx;
  height: 108rpx;
  border-radius: 12rpx;
}

.notice-card__title {
  display: flex;
}

.notice-card__title text:first-child {
  flex: 1;
  color: #17233d;
  font-size: 25rpx;
  font-weight: 800;
  line-height: 34rpx;
}

.notice-card__title text:last-child {
  align-self: flex-start;
  margin-left: 8rpx;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  background: #fff1ef;
  color: #ef543f;
  font-size: 18rpx;
}

.notice-card__meta {
  display: flex;
  gap: 32rpx;
  margin-top: 22rpx;
  color: #8b95a7;
  font-size: 20rpx;
}
</style>
