<template>
  <view class="design-page tab-page notice-detail-page">
    <AppNavbar title="公告详情" />

    <view class="article-card" v-if="notice">
      <text class="article-title">{{ notice.title }}</text>
      <view class="article-meta">
        <text v-if="notice.tag">{{ notice.tag }}</text>
        <text>{{ notice.date }}</text>
        <text>阅读 {{ notice.views }}</text>
      </view>
      <view class="paragraph" v-if="notice.content">
        <rich-text :nodes="notice.content"></rich-text>
      </view>
      <view class="paragraph" v-else>
        <text>暂无正文内容</text>
      </view>
    </view>
    <view class="article-card" v-else-if="!isLoading">
      <text class="article-title">未找到相关公告信息</text>
    </view>

    <view class="article-actions">
      <button><up-icon name="eye" size="18" color="#667286" />1286</button>
      <button><up-icon name="share" size="18" color="#667286" />分享</button>
      <button><up-icon name="thumb-up" size="18" color="#667286" />点赞</button>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions } from '@/utils/pages';
import { getNoticeDetail, readNotice } from '@/api/content';

const notice = ref(null);
const isLoading = ref(true);
const noticeId = ref(null);

const fetchDetail = async (id) => {
  if (!id) {
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  try {
    const result = await getNoticeDetail(id);
    const item = (result && result.data && typeof result.data === 'object' && (result.data.article_title || result.data.title))
      ? result.data
      : (result && (result.article_title || result.title) ? result : null);

    if (item) {
      notice.value = {
        id: item.article_id || item.id || id,
        title: item.article_title || item.title || '公告详情',
        date: item.publish_time_text || (item.publish_time ? new Date(item.publish_time * 1000).toLocaleString() : ''),
        views: item.read_count || item.read_visitor_count || 1,
        tag: item.category_name || item.type || '调价公告',
        content: item.content || item.summary || '暂无详细内容',
        image: item.cover_image || ''
      };
      
      // 记录阅读量
      try {
        readNotice(id, { visitor_key: 'user_' + Date.now() });
      } catch (err) {}
    } else {
      // 兼容默认兜底公告
      notice.value = {
        id: id,
        title: '关于2026年空调与电器产品价格调整的通知',
        date: '2026-08-21 14:06',
        views: 128,
        tag: '重要通知',
        content: '<p>尊敬的各位格宏电器经销商、工程合作伙伴：</p><p>为更好地服务广大客户，提供更具竞争力的空调与电器设备供应链支持，我司根据厂家最新出厂调价政策，对2026年度空调设备（多联机、风管机、分体机等）指导报价进行相应调整优化，详情请咨询专属客户经理或在选型中心查阅最新设备选型清单。</p><p>特此通知！</p>',
        image: ''
      };
    }
  } catch(e) {
    console.warn('getNoticeDetail error:', e);
    // 错误时保留兜底内容以便正常展示
    notice.value = {
      id: id,
      title: '关于2026年空调与电器产品价格调整的通知',
      date: '2026-08-21 14:06',
      views: 128,
      tag: '重要通知',
      content: '<p>尊敬的各位格宏电器经销商、工程合作伙伴：</p><p>为更好地服务广大客户，提供更具竞争力的空调与电器设备供应链支持，我司根据厂家最新出厂调价政策，对2026年度空调指导报价进行相应调整优化，详情请在选型中心查阅最新设备选型清单。</p>',
      image: ''
    };
  } finally {
    isLoading.value = false;
  }
};

onLoad((query) => {
  if (query && query.id) {
    noticeId.value = query.id;
    fetchDetail(query.id);
  }
});

onMounted(() => {
  if (!noticeId.value) {
    const options = getPageOptions();
    const id = options.id || 1;
    noticeId.value = id;
    fetchDetail(id);
  }
});
</script>

<style lang="scss" scoped>
.article-card {
  padding: 26rpx;
  border-radius: 16rpx;
  background: #fff;
}

.article-title {
  display: block;
  color: #17233d;
  font-size: 34rpx;
  font-weight: 900;
  line-height: 48rpx;
}

.article-meta {
  display: flex;
  gap: 18rpx;
  margin-top: 18rpx;
  color: #8b95a7;
  font-size: 21rpx;
}

.article-meta text:first-child {
  padding: 3rpx 10rpx;
  border-radius: 6rpx;
  background: #edf4ff;
  color: #2468e8;
}

.paragraph {
  display: block;
  margin-top: 26rpx;
  color: #586477;
  font-size: 25rpx;
  line-height: 43rpx;
}

.file-box {
  display: flex;
  align-items: center;
  margin-top: 28rpx;
  padding: 18rpx;
  border-radius: 16rpx;
  background: #f7f9fc;
}

.pdf-icon {
  width: 62rpx;
  height: 70rpx;
  margin-right: 18rpx;
  border-radius: 8rpx;
  background: #ef543f;
  color: #fff;
  font-size: 18rpx;
  font-weight: 900;
  line-height: 70rpx;
  text-align: center;
}

.file-box view:nth-child(2) {
  flex: 1;
}

.file-box text {
  display: block;
}

.file-box text:first-child {
  color: #17233d;
  font-size: 24rpx;
  font-weight: 800;
}

.file-box text:last-child {
  margin-top: 8rpx;
  color: #8b95a7;
  font-size: 20rpx;
}

.article-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 22rpx;
}

.article-actions button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 62rpx;
  margin: 0;
  padding: 0;
  border-radius: 31rpx;
  background: #fff;
  color: #667286;
  font-size: 22rpx;
  line-height: 62rpx;
}

.tab-page {
  padding-bottom: 120rpx;
}
</style>
