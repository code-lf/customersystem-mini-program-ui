<template>
  <view class="function-page wechat-page">
    <AppNavbar title="关注公众号" />

    <view class="qr-card">
      <text>关注「格宏助手」服务号</text>
      <text>获取最新产品资讯与专属服务</text>
      <!-- 微信原生组件由小程序后台配置的公众号决定，不能填写任意公众号或绕过场景限制。 -->
      <!-- #ifdef MP-WEIXIN -->
      <view v-if="!qrOnly" class="official-follow"><official-account @load="onOfficialLoad" @error="onOfficialError" /></view>
      <text v-if="!showQrFallback" class="follow-tip">请在上方微信关注卡片中直接关注，无需再次扫码</text>
      <text v-if="!showQrFallback" class="fallback-link" @click="showQrFallback = true">没有显示关注卡片？查看备用方式</text>
      <!-- #endif -->
      <view v-if="showQrFallback" class="qr-box">
        <!-- 服务号二维码直接读取 OSS 链接，不再占用小程序包体积。 -->
        <image class="qr-image" src="https://gehong-ai-knowledge-bj-20260829.oss-cn-beijing.aliyuncs.com/upload/attachment/image/202609/27/179050600978c2d5798e29674397fd0010309a1114_aliyun.jpg?x-oss-process=image/resize,h_200,w_200" mode="aspectFit" show-menu />
      </view>
      <text v-if="showQrFallback">当前入口若不支持关注卡片，可使用二维码关注服务号</text>
    </view>

    <view class="service-card">
      <text class="service-title">关注后可享受以下服务</text>
      <view v-for="item in services" :key="item.title" class="service-row">
        <view><up-icon :name="item.icon" size="24" color="#fff" /></view>
        <view>
          <text>{{ item.title }}</text>
          <text>{{ item.desc }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import AppNavbar from '@/components/app-navbar.vue';
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 非微信平台保留二维码；微信优先展示官方组件，错误或用户主动选择时才展示备用二维码。
const showQrFallback = ref(true);
const qrOnly = ref(false);
// #ifdef MP-WEIXIN
showQrFallback.value = false;
// #endif
// 从失败兜底入口进入时立即显示二维码，不再次尝试原生关注，避免重复失败或循环跳转。
onLoad((query = {}) => {
  if (query.mode === 'qr') {
    qrOnly.value = true;
    showQrFallback.value = true;
  }
});
const onOfficialLoad = () => { showQrFallback.value = false; };
const onOfficialError = () => { showQrFallback.value = true; };

const services = [
  { icon: 'clock', title: '价格变动提醒', desc: '第一时间获取价格调整通知' },
  { icon: 'file-text', title: '产品资料更新', desc: '最新资料及说明书，不错过任何更新' },
  { icon: 'volume', title: '最新活动与政策推送', desc: '促销活动、政策资讯及时送达' },
  { icon: 'server-man', title: '售后与技术支持服务', desc: '快速响应，专业团队为您服务' }
];
</script>

<style lang="scss" scoped>
.function-page {
  min-height: 100vh;
  padding: 0 24rpx 36rpx;
  background: #f3f7fd;
}
.official-follow { margin-top: 28rpx; }
.follow-tip { display: block; margin-top: 20rpx; color: #6482a7; font-size: 24rpx; line-height: 1.6; }
.fallback-link { display: block; padding: 20rpx 0; color: #2468e8; font-size: 23rpx; }

.qr-card,
.service-card {
  border-radius: 16rpx;
  background: #fff;
}

.qr-card {
  padding: 34rpx 24rpx;
  text-align: center;
  background: linear-gradient(180deg, #eaf4ff, #fff);
}

.qr-card > text {
  display: block;
}

.qr-card > text:first-child {
  color: #2468e8;
  font-size: 32rpx;
  font-weight: 900;
}

.qr-card > text:nth-child(2),
.qr-card > text:last-child {
  margin-top: 10rpx;
  color: #8b95a7;
  font-size: 22rpx;
}

.qr-box {
  width: 360rpx;
  height: 360rpx;
  margin: 30rpx auto 0;
  padding: 12rpx;
  box-sizing: border-box;
  border-radius: 14rpx;
  background: #fff;
}

.qr-image {
  /* 二维码保留原图比例，避免拉伸后影响识别。 */
  display: block;
  width: 100%;
  height: 100%;
}

.service-card {
  margin-top: 18rpx;
  padding: 24rpx;
}

.service-title {
  display: block;
  color: #17233d;
  font-size: 27rpx;
  font-weight: 900;
}

.service-row {
  display: flex;
  align-items: center;
  margin-top: 22rpx;
}

.service-row > view:first-child {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  margin-right: 18rpx;
  border-radius: 14rpx;
  background: #2468e8;
}

.service-row text {
  display: block;
}

.service-row text:first-child {
  color: #17233d;
  font-size: 25rpx;
  font-weight: 800;
}

.service-row text:last-child {
  margin-top: 6rpx;
  color: #8b95a7;
  font-size: 21rpx;
}
</style>
