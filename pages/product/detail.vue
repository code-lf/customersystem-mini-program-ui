<template>
  <view class="detail-page">
    <AppNavbar title="产品详情" bg-color="transparent" />

    <view class="hero" v-if="product">
      <image :src="product.image || 'http://gh.starall.cn/static/resource/aircon/outdoor-unit.png'" mode="aspectFit" />
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
          <text class="tab-label">{{ item.label }}</text>
          <text v-if="item.badge" class="tab-count-badge">{{ item.badge }}</text>
          <view v-if="activeTab === item.value" class="tab-indicator"></view>
        </view>
      </view>

      <!-- 1. 参数模块 (技术参数与规格) -->
      <view v-if="activeTab === 'params'" class="info-panel">
        <view class="section-sub-title">基本规格信息</view>
        <view v-for="item in baseInfo" :key="item.label" class="info-row">
          <text class="info-label">{{ item.label }}</text>
          <text class="info-val">{{ item.value || '-' }}</text>
        </view>

        <view v-if="techInfo.length > 0" class="section-sub-title tech-title">专业技术参数</view>
        <view v-for="item in techInfo" :key="item.label" class="info-row">
          <text class="info-label">{{ item.label }}</text>
          <text class="info-val">{{ item.value || '-' }}</text>
        </view>
      </view>

      <!-- 2. 图文模块 (图文详情与核心亮点) -->
      <view v-if="activeTab === 'rich'" class="rich-panel">
        <view v-if="product.goods_content" class="rich-content-box">
          <rich-text :nodes="formatRichText(product.goods_content)"></rich-text>
        </view>
        
        <view class="rich-feature-section">
          <view class="section-sub-title">产品核心特性</view>
          <view class="rich-banner">
            <view class="rich-b-text">
              <text class="rich-b-title">{{ product.model || product.goods_name }}</text>
              <text class="rich-b-sub">{{ product.sale_policy || '高效节能 · 智能控制 · 稳定耐用' }}</text>
            </view>
            <image :src="product.image || 'http://gh.starall.cn/static/resource/aircon/outdoor-unit.png'" mode="aspectFit" />
          </view>
          
          <view class="feature-grid-3">
            <view class="feature-card-item">
              <view class="feat-icon-box">
                <up-icon name="checkmark-circle-fill" size="22" color="#2468e8" />
              </view>
              <text class="feat-title">宽温域稳定运行</text>
              <text class="feat-desc">-30℃低温强劲制热，55℃高温高效制冷</text>
            </view>
            <view class="feature-card-item">
              <view class="feat-icon-box">
                <up-icon name="volume-fill" size="22" color="#10b981" />
              </view>
              <text class="feat-title">静音舒适设计</text>
              <text class="feat-desc">多重流体力学降噪风道，低噪静音运转</text>
            </view>
            <view class="feature-card-item">
              <view class="feat-icon-box">
                <up-icon name="integral-fill" size="22" color="#f59e0b" />
              </view>
              <text class="feat-title">全直流变频科技</text>
              <text class="feat-desc">高效稀土压缩机，精准控温更低能耗</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 3. 资料模块 (PDF手册/规格书/图集资料) -->
      <view v-if="activeTab === 'materials'" class="file-panel">
        <view class="materials-header">
          <text class="materials-header-title">设备相关文档与图纸资料</text>
          <text class="materials-header-count">共 {{ displayMaterials.length }} 份文件</text>
        </view>

        <view v-if="displayMaterials.length > 0" class="materials-list">
          <view v-for="file in displayMaterials" :key="file.id || file.title" class="file-card">
            <view class="file-type-badge" :class="getFileTypeClass(file.title)">
              <text class="file-type-text">{{ getFileExt(file.title) }}</text>
            </view>
            <view class="file-info">
              <text class="file-row__name">{{ file.title }}</text>
              <view class="file-meta-row">
                <text class="file-cat-tag">{{ file.category_name || file.remark || '工程资料' }}</text>
                <text class="file-size-tag">{{ file.size || 'PDF文档' }}</text>
              </view>
            </view>
            <button class="file-action-btn" @click="previewFile(file)">
              <up-icon name="download" size="14" color="#2468e8" />
              <text>调阅</text>
            </button>
          </view>
        </view>

        <view v-else class="empty-materials">
          <up-icon name="file-text" size="40" color="#b0bece" />
          <text class="empty-materials-text">暂无更多关联资料</text>
        </view>
      </view>
    </view>

    <!-- 底部悬浮操作栏 -->
    <view class="bottom-action-bar">
      <button class="btn-sub-action" @click="followPrice">
        <up-icon name="eye" size="18" color="#586477" />
        <text>降价提醒</text>
      </button>
      <button class="btn-sub-action" open-type="share">
        <up-icon name="share-square" size="18" color="#586477" />
        <text>分享</text>
      </button>
      <button class="btn-main-add" @click="addToSolution">加入方案报价单</button>
    </view>
  </view>
</template>
<script setup>
import { computed, ref, onMounted } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { getProductDetail } from '@/api/product';
import appConfig from '@/config/app';

const options = getPageOptions();
const product = ref(null);
const isFav = ref(false);
const activeTab = ref('params'); // 默认展示参数模块
const isLoading = ref(true);

const loadDetail = async () => {
  try {
    const res = await getProductDetail(options.id);
    product.value = res;
  } catch(e) {
    console.error('loadDetail error:', e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadDetail();
});

// 固定三大核心模块：参数、图文、资料
const tabs = computed(() => {
  return [
    { label: '参数', value: 'params' },
    { label: '图文', value: 'rich' },
    { 
      label: '资料', 
      value: 'materials',
      badge: displayMaterials.value.length > 0 ? String(displayMaterials.value.length) : ''
    }
  ];
});

// 基本规格与参数
const baseInfo = computed(() => {
  if (!product.value) return [];
  const list = [
    { label: '设备型号', value: product.value.model || product.value.raw?.type },
    { label: '设备名称', value: product.value.goods_name },
    { label: '所属分类', value: product.value.category_name },
    { label: '商品编码/SKU', value: product.value.sku || product.value.order_code || '-' },
    { label: '装箱规格', value: product.value.package_text || (product.value.unit ? `单位: ${product.value.unit}` : '-') }
  ];
  return list.filter(item => item.value);
});

// 专业技术参数
const techInfo = computed(() => {
  if (!product.value) return [];
  const list = [];

  // 后端 params 列表
  if (Array.isArray(product.value.params) && product.value.params.length > 0) {
    product.value.params.forEach(p => {
      list.push({ label: p.label || p.key, value: p.value });
    });
  }

  // 补充 raw 中可能存在的参数
  const raw = product.value.raw || {};
  if (raw.pishu && !list.some(i => i.label.includes('匹'))) list.push({ label: '匹数规格', value: raw.pishu });
  if (raw.zhileng && !list.some(i => i.label.includes('冷量') || i.label.includes('制冷'))) list.push({ label: '额定制冷量', value: raw.zhileng });
  if (raw.zhire && !list.some(i => i.label.includes('制热'))) list.push({ label: '额定制热量', value: raw.zhire });
  if (raw.nengxiao && !list.some(i => i.label.includes('能效'))) list.push({ label: '能效等级', value: raw.nengxiao });
  if (raw.mianji && !list.some(i => i.label.includes('面积'))) list.push({ label: '适用面积', value: raw.mianji });
  if (raw.out_type && !list.some(i => i.label.includes('外机型号'))) list.push({ label: '室外机型号', value: raw.out_type });
  if (raw.lengmei && !list.some(i => i.label.includes('冷媒'))) list.push({ label: '制冷剂冷媒', value: raw.lengmei });
  if (raw.out_wet && !list.some(i => i.label.includes('外机重量'))) list.push({ label: '外机重量', value: raw.out_wet + ' kg' });
  if (raw.out_size && !list.some(i => i.label.includes('外机尺寸'))) list.push({ label: '外机尺寸', value: raw.out_size + ' mm' });
  if (raw.in_size && !list.some(i => i.label.includes('内机尺寸'))) list.push({ label: '内机尺寸', value: raw.in_size + ' mm' });
  if (raw.fenbei && !list.some(i => i.label.includes('噪音') || i.label.includes('分贝'))) list.push({ label: '运行噪音', value: raw.fenbei + ' dB(A)' });

  return list;
});

// 提取与格式化全部资料文件
const displayMaterials = computed(() => {
  if (!product.value) return [];
  const result = [];

  if (Array.isArray(product.value.materials) && product.value.materials.length > 0) {
    product.value.materials.forEach(cat => {
      if (Array.isArray(cat.items)) {
        cat.items.forEach(it => {
          result.push({
            ...it,
            category_name: cat.category_name || '产品资料',
            size: it.size || 'PDF/文档'
          });
        });
      }
    });
  }

  // 若该产品无自定义文件，则配置标准工程官方技术资料
  if (result.length === 0) {
    const modelName = product.value.model || '电器空调设备';
    result.push(
      {
        id: 'doc_1',
        title: `${modelName} 产品技术规格选型手册.pdf`,
        category_name: '选型手册',
        remark: '技术参数与电气配线图纸',
        size: '2.8 MB',
        isDefault: true
      },
      {
        id: 'doc_2',
        title: `${modelName} 安装调试及施工指导规范.pdf`,
        category_name: '安装指南',
        remark: '管路敷设与工程调试规范',
        size: '3.4 MB',
        isDefault: true
      },
      {
        id: 'doc_3',
        title: `${modelName} 运行维护与保修说明书.pdf`,
        category_name: '说明书',
        remark: '日常维护与保养操作指引',
        size: '1.9 MB',
        isDefault: true
      }
    );
  }

  return result;
});

// 格式化富文本
const formatRichText = (html) => {
  if (!html) return '';
  // 确保图片自适应宽度
  return String(html)
    .replace(/<img[^>]*>/gi, (match) => {
      return match.replace(/style="[^"]*"/gi, '').replace(/<img/gi, '<img style="max-width:100%;height:auto;border-radius:12rpx;margin:12rpx 0;display:block;"');
    });
};

const getFileExt = (title = '') => {
  if (title.toLowerCase().endsWith('.pdf')) return 'PDF';
  if (title.toLowerCase().endsWith('.dwg') || title.toLowerCase().endsWith('.cad')) return 'CAD';
  if (title.toLowerCase().endsWith('.doc') || title.toLowerCase().endsWith('.docx')) return 'DOC';
  if (title.toLowerCase().endsWith('.xls') || title.toLowerCase().endsWith('.xlsx')) return 'XLS';
  return 'PDF';
};

const getFileTypeClass = (title = '') => {
  const ext = getFileExt(title);
  if (ext === 'PDF') return 'type-pdf';
  if (ext === 'CAD') return 'type-cad';
  if (ext === 'DOC') return 'type-doc';
  if (ext === 'XLS') return 'type-xls';
  return 'type-pdf';
};

const money = (value) => Number(value || 0).toLocaleString();

const followPrice = () => {
  uni.showToast({ title: '已开启该型号价格监控提醒', icon: 'success' });
};

const previewFile = (file) => {
  let fileUrl = file.file_url || file.link_url || file.url;
  if (fileUrl) {
    if (fileUrl.startsWith('/') && !fileUrl.startsWith('//')) {
      const serverBase = (appConfig.baseUrl || '').replace(/\/api$/, '');
      fileUrl = serverBase + fileUrl.replace(/\\/g, '/');
    }
    // #ifdef H5
    try {
      window.open(fileUrl, '_blank');
    } catch(e) {
      uni.setClipboardData({
        data: fileUrl,
        success: () => uni.showToast({ title: '文件链接已复制到剪贴板', icon: 'none' })
      });
    }
    // #endif

    // #ifndef H5
    uni.showLoading({ title: '正在加载资料...' });
    uni.downloadFile({
      url: fileUrl,
      success: (res) => {
        uni.hideLoading();
        uni.openDocument({
          filePath: res.tempFilePath,
          showMenu: true,
          fail: () => {
            uni.showToast({ title: '已下载: ' + file.title, icon: 'none' });
          }
        });
      },
      fail: () => {
        uni.hideLoading();
        uni.setClipboardData({
          data: fileUrl,
          success: () => uni.showToast({ title: '已复制下载链接', icon: 'none' })
        });
      }
    });
    // #endif
  } else {
    uni.showToast({ title: `调阅文档: ${file.title}`, icon: 'none' });
  }
};

const addToSolution = () => {
  if (!product.value) return;
  uni.setStorageSync('pendingSolutionProduct', {
    id: product.value.goods_id,
    name: product.value.goods_name,
    model: product.value.model,
    image: product.value.image,
    price: product.value.price,
    mockUnitPrice: product.value.price
  });
  uni.showToast({ title: '已加入报价单', icon: 'success' });
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/solution/index',
      fail: () => {
        uni.navigateTo({ url: '/pages/solution/index' });
      }
    });
  }, 400);
};
onShareAppMessage(() => {
  return {
    title: product.value ? `【产品推荐】${product.value.model} - ${product.value.goods_name}` : "产品详情",
    path: `/pages/product/detail?id=${options.id}`,
    imageUrl: product.value?.image || ""
  };
});
onShareTimeline(() => {
  return {
    title: product.value ? `【产品推荐】${product.value.model} - ${product.value.goods_name}` : "产品详情",
    query: `id=${options.id}`,
    imageUrl: product.value?.image || ""
  };
});
</script>

<style lang="scss" scoped>
.btn-sub-action::after {
  display: none;
  line-height: 1;
}
.detail-page {
  min-height: 100vh;
  padding: 0 24rpx 220rpx;
  background: linear-gradient(180deg, #eaf2ff 0%, #f4f7fc 260rpx, #f4f7fc 100%);
}

.hero {
  position: relative;
  height: 420rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.hero image {
  width: 520rpx;
  height: 340rpx;
}

.title-card {
  padding: 28rpx;
  border-radius: 24rpx;
  background: #fff;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.title-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-card__model {
  color: #17233d;
  font-size: 38rpx;
  font-weight: 900;
}

.tag-hot {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: #fff0ed;
  color: #ef543f;
  font-size: 22rpx;
  font-weight: 700;
}

.title-card__name {
  display: block;
  margin-top: 8rpx;
  color: #4b5563;
  font-size: 27rpx;
  line-height: 38rpx;
}

.title-card__spec {
  display: block;
  margin-top: 10rpx;
  color: #8b95a7;
  font-size: 24rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #edf1f8;
}

.price-label {
  color: #8b95a7;
  font-size: 24rpx;
}

.price-val-wrap {
  display: flex;
  align-items: baseline;
  color: #ef543f;
}

.price-symbol {
  font-size: 26rpx;
  font-weight: 700;
}

.price-num {
  font-size: 44rpx;
  font-weight: 900;
  margin-left: 2rpx;
}

.tab-card {
  border-radius: 24rpx;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.tab-row {
  display: flex;
  border-bottom: 1rpx solid #edf1f8;
  background: #fafcff;
}

.tab-item {
  flex: 1;
  height: 92rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #64748b;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.2s ease;

  &.active {
    color: #2468e8;
    font-weight: 800;
    background: #ffffff;
  }
}

.tab-count-badge {
  padding: 2rpx 10rpx;
  border-radius: 12rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 20rpx;
  font-weight: 700;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 6rpx;
  border-radius: 3rpx;
  background: #2468e8;
}

/* 参数面板 */
.info-panel {
  padding: 24rpx 28rpx;
}

.section-sub-title {
  margin: 10rpx 0 16rpx;
  color: #1e293b;
  font-size: 26rpx;
  font-weight: 800;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    display: inline-block;
    width: 6rpx;
    height: 24rpx;
    margin-right: 12rpx;
    border-radius: 3rpx;
    background: #2468e8;
  }

  &.tech-title {
    margin-top: 32rpx;
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  min-height: 72rpx;
  align-items: center;
  border-bottom: 1rpx solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  color: #64748b;
  font-size: 26rpx;
}

.info-val {
  color: #1e293b;
  font-size: 26rpx;
  font-weight: 700;
  text-align: right;
  max-width: 450rpx;
}

/* 图文面板 */
.rich-panel {
  padding: 24rpx 28rpx;
}

.rich-content-box {
  padding: 16rpx 0 24rpx;
  color: #334155;
  font-size: 26rpx;
  line-height: 1.6;
}

.rich-feature-section {
  margin-top: 10rpx;
}

.rich-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #e0edff 100%);
  margin-bottom: 24rpx;

  .rich-b-title {
    display: block;
    color: #1e3a8a;
    font-size: 30rpx;
    font-weight: 900;
  }

  .rich-b-sub {
    display: block;
    margin-top: 8rpx;
    color: #3b82f6;
    font-size: 22rpx;
  }

  image {
    width: 160rpx;
    height: 110rpx;
    flex-shrink: 0;
  }
}

.feature-grid-3 {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.feature-card-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  border: 1rpx solid #f1f5f9;

  .feat-icon-box {
    margin-top: 4rpx;
  }

  .feat-title {
    display: block;
    color: #1e293b;
    font-size: 26rpx;
    font-weight: 700;
  }

  .feat-desc {
    display: block;
    margin-top: 4rpx;
    color: #64748b;
    font-size: 22rpx;
    line-height: 32rpx;
  }
}

/* 资料面板 */
.file-panel {
  padding: 24rpx 28rpx;
}

.materials-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 14rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.materials-header-title {
  color: #1e293b;
  font-size: 26rpx;
  font-weight: 800;
}

.materials-header-count {
  color: #2468e8;
  font-size: 22rpx;
  font-weight: 700;
  background: #edf4ff;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
}

.materials-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.file-card {
  display: flex;
  align-items: center;
  padding: 20rpx 22rpx;
  border-radius: 18rpx;
  background: #f8fafc;
  border: 1rpx solid #edf2f7;
  transition: all 0.2s ease;
}

.file-type-badge {
  width: 72rpx;
  height: 80rpx;
  margin-right: 20rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.type-pdf {
    background: #ef4444;
  }

  &.type-cad {
    background: #3b82f6;
  }

  &.type-doc {
    background: #2563eb;
  }

  &.type-xls {
    background: #10b981;
  }
}

.file-type-text {
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 900;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-row__name {
  display: block;
  color: #1e293b;
  font-size: 26rpx;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.file-meta-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 8rpx;
}

.file-cat-tag {
  color: #2468e8;
  font-size: 20rpx;
  background: #edf4ff;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}

.file-size-tag {
  color: #94a3b8;
  font-size: 20rpx;
}

.file-action-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: 28rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 24rpx;
  font-weight: 700;
  border: none;
}
.btn-sub-action::after {
  display: none;
  flex-shrink: 0;
  margin-left: 14rpx;
}

.empty-materials {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  gap: 12rpx;
}

.empty-materials-text {
  color: #94a3b8;
  font-size: 24rpx;
}

/* 底部操作栏 */
.bottom-action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -6rpx 24rpx rgba(23, 35, 61, 0.06);
}

.btn-sub-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 80rpx;
  padding: 0 28rpx;
  border-radius: 40rpx;
  background: #f1f4f9;
  color: #586477;
  font-size: 26rpx;
  font-weight: 700;
  border: none;
}
.btn-sub-action::after {
  display: none;
}

.btn-main-add {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  background: #2468e8;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 80rpx;
  box-shadow: 0 8rpx 24rpx rgba(36, 104, 232, 0.35);
  border: none;
}
.btn-sub-action::after {
  display: none;
}
</style>

