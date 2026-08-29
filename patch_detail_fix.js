const fs = require('fs');
let content = fs.readFileSync('pages/product/detail.vue', 'utf-8');

// Find the start of script
const scriptIndex = content.indexOf('<script setup>');
let scriptPart = content.substring(scriptIndex);

const newTemplate = `<template>
  <view class="detail-page">
    <AppNavbar title="产品详情" bg-color="transparent" />

    <view class="hero" v-if="product">
      <image :src="product.image || '/static/aircon/outdoor-unit.png'" mode="aspectFit" />
    </view>

    <view class="title-card" v-if="product">
      <view class="title-card__row">
        <text class="title-card__model">{{ product.model }}</text>
        <text v-if="product.comment" class="tag-hot">{{ product.comment }}</text>
      </view>
      <text class="title-card__name">{{ product.goods_name }}</text>
      <text class="title-card__spec">{{ product.spec }}</text>
      
      <view class="price-row">
        <text class="price-label">参考价</text>
        <view class="price-val-wrap">
          <text class="price-symbol">¥</text>
          <text class="price-num">{{ money(product.price) }}</text>
        </view>
      </view>
    </view>

    <view class="tab-card" v-if="product">
      <view class="tab-row">
        <view 
          v-for="item in tabs" 
          :key="item.value"
          class="tab-item"
          :class="{ active: activeTab === item.value }"
          @click="activeTab = item.value"
        >
          <text>{{ item.label }}</text>
          <view v-if="activeTab === item.value" class="tab-indicator"></view>
        </view>
      </view>

      <view v-if="activeTab === 'base' || activeTab === 'tech'" class="info-panel">
        <view v-for="item in (activeTab === 'base' ? baseInfo : techInfo)" :key="item.label" class="info-row">
          <text class="info-label">{{ item.label }}</text>
          <text class="info-val">{{ item.value || '-' }}</text>
        </view>
      </view>

      <view v-if="activeTab === 'rich'" class="rich-panel">
        <rich-text :nodes="product.goods_content || '暂无详情'"></rich-text>
      </view>

      <view v-if="activeTab.startsWith('material_')" class="file-panel">
        <view v-for="file in product.materials[parseInt(activeTab.split('_')[1])].items" :key="file.id" class="file-row">
          <view class="pdf-icon">PDF</view>
          <view class="file-info">
            <text class="file-row__name">{{ file.title }}</text>
            <text class="file-row__meta">{{ file.remark || '文件资料' }}</text>
          </view>
          <button class="file-action-btn" @click="previewFile(file)">调阅</button>
        </view>
      </view>
    </view>

    <!-- 底部悬浮操作栏 -->
    <view class="bottom-action-bar">
      <button class="btn-sub-action" @click="followPrice">
        <up-icon name="eye" size="18" color="#586477" />
        <text>降价提醒</text>
      </button>
      <button class="btn-main-add" @click="addToSolution">加入方案报价单</button>
    </view>
  </view>
</template>
`;

fs.writeFileSync('pages/product/detail.vue', newTemplate + scriptPart);
console.log('patched template full');
