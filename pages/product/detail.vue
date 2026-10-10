<template>
  <view class="detail-page">
    <!-- 导航栏放在滚动容器外，商品内容滚动时标题和返回按钮始终留在顶部。 -->
    <AppNavbar title="产品详情" bg-color="#eaf2ff" />
    <scroll-view
      class="detail-scroll"
      scroll-y
      :style="{ height: `calc(100vh - ${navMetrics.totalNavHeight}px)` }"
    >

    <view class="title-card" v-if="product">
      <!-- 商品名称作为主标题，型号作为次级信息；规格说明继续放在型号下方。 -->
      <view class="title-card__row">
        <text class="title-card__name">{{ product.goods_name }}</text>
      </view>
      <text class="title-card__model">{{ product.model }}</text>
      <text v-if="product.spec" class="title-card__spec">规格：{{ product.spec }}</text>
      <!-- 标签来自 tags/tag_list；卖点和关键词仅在接口确有内容时显示。 -->
      <view v-if="productTags.length" class="product-tags">
        <text v-for="tag in productTags" :key="tag" class="product-tag">{{ tag }}</text>
      </view>
      <view v-if="sellingPoint" class="product-extra"><text class="product-extra__label">卖点</text><text>{{ sellingPoint }}</text></view>
      <view v-if="productKeywords" class="product-extra"><text class="product-extra__label">关键词</text><text>{{ productKeywords }}</text></view>
      
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

      <!-- 2. 图文模块：原顶部商品图片改为纵向展示，不再自动轮播。 -->
      <view v-if="activeTab === 'rich'" class="rich-panel">
        <view v-for="(imageUrl, index) in productGallery" :key="`${imageUrl}-${index}`" class="rich-image-box">
          <image :src="imageUrl" mode="widthFix" class="rich-image" />
        </view>
        <view v-if="richContent" class="rich-content-box">
          <rich-text :nodes="formatRichText(richContent)"></rich-text>
        </view>
        <view v-if="product.sale_policy" class="sale-policy">销售政策：{{ product.sale_policy }}</view>
        <view v-if="!productGallery.length && !richContent && !product.sale_policy" class="rich-empty">暂无图文详情</view>
      </view>

      <!-- 3. 资料模块 (PDF手册/规格书/图集资料) -->
      <view v-if="activeTab === 'materials'" class="file-panel">
        <view class="materials-header">
          <text class="materials-header-title">设备相关文档与图纸资料</text>
          <text class="materials-header-count">共 {{ product.materials_total ?? displayMaterials.length }} 份文件</text>
        </view>
        <view class="material-notice" @click="contactManager">页面只提供预览；需要原文件请联系客户经理 ›</view>

        <view v-if="displayMaterials.length > 0" class="materials-list">
          <view v-for="file in displayMaterials" :key="file.id || file.title" class="file-card">
            <view class="file-type-badge" :class="getFileTypeClass(file.title)">
              <text class="file-type-text">{{ getFileExt(file.title) }}</text>
            </view>
            <view class="file-info">
              <text class="file-row__name">{{ file.title }}</text>
              <view class="file-meta-row">
                <text class="file-cat-tag">{{ file.category_name || file.remark || '工程资料' }}</text>
                <text class="file-size-tag">{{ getFileExt(file.title, file.file_url || file.link_url) }}</text>
              </view>
            </view>
            <button class="file-action-btn" @click="previewFile(file)">
              <up-icon name="eye" size="14" color="#2468e8" />
              <text>预览</text>
            </button>
          </view>
        </view>

        <view v-else class="empty-materials">
          <up-icon name="file-text" size="40" color="#b0bece" />
          <text class="empty-materials-text">暂无更多关联资料</text>
        </view>
      </view>
    </view>
    </scroll-view>

    <!-- 图片类资料只在本页查看，不提供保存或复制文件地址的入口。 -->
    <view v-if="previewImageUrl" class="image-preview" @click="previewImageUrl = ''">
      <text class="image-preview__close">关闭预览 ×</text>
      <image :src="previewImageUrl" mode="aspectFit" :show-menu-by-longpress="false" @click.stop />
    </view>

    <!-- 底部悬浮操作栏 -->
    <view class="bottom-action-bar">
      <button class="btn-sub-action" :disabled="favoriteBusy" @click="toggleFavorite">
        <up-icon :name="isFav ? 'star-fill' : 'star'" size="18" :color="isFav ? '#ef543f' : '#586477'" />
        <text>{{ isFav ? '已收藏' : '收藏' }}</text>
      </button>
      <button class="btn-sub-action" :disabled="monitorBusy" @click="followPrice">
        <up-icon name="eye" size="18" color="#586477" />
        <text>{{ monitorBusy ? '监控中' : '价格监控' }}</text>
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
import { computed, ref } from 'vue';
import { onLoad, onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import { addFavoriteProduct, getFavoriteProducts, getProductDetail, removeFavoriteProduct } from '@/api/product';
import appConfig from '@/config/app';
import { useUserStore } from '@/store/user';
import { openPage } from '@/utils/pages';
import { getNavMetrics } from '@/utils/system';
import { watchMonitorGoods } from '@/api/monitor';
import { requireDealerAccess } from '@/utils/dealer-access';

const product = ref(null);
// 固定导航栏的占位高度与公共导航组件保持一致，兼容不同机型状态栏和微信胶囊尺寸。
const navMetrics = computed(() => getNavMetrics());
// 保存 onLoad 中解析出的商品 ID，供详情请求和分享路径共同使用。
const productId = ref('');
const isFav = ref(false);
const favoriteBusy = ref(false);
const monitorBusy = ref(false);
const previewImageUrl = ref('');
const userStore = useUserStore();
const activeTab = ref('params'); // 默认展示参数模块
const isLoading = ref(true);

const loadDetail = async (goodsId) => {
  if (!goodsId) {
    isLoading.value = false;
    // 输出页面参数，方便后续从开发者工具快速判断是哪一个入口漏传商品 ID。
    console.error('[商品详情] 缺少商品ID，已阻止无效详情请求');
    uni.showToast({ title: '缺少商品ID，请返回重试', icon: 'none' });
    return;
  }

  try {
    const res = await getProductDetail(goodsId);
    product.value = res;
    if (res?.is_favorite !== undefined) isFav.value = Number(res.is_favorite) === 1;
    else if (userStore.isLoggedIn) await loadFavoriteState(goodsId, res);
  } catch (e) {
    console.error('[商品详情] 加载失败：', e);
  } finally {
    isLoading.value = false;
  }
};

/** 详情未返回 is_favorite 时，按名称检索收藏列表并逐页核对 goods_id。 */
const loadFavoriteState = async (goodsId, detail) => {
  try {
    let currentPage = 1;
    let found = false;
    let lastPage = 1;
    do {
      const result = await getFavoriteProducts({ keyword: detail?.goods_name || detail?.sku || '', page: currentPage, limit: 100 });
      const rows = Array.isArray(result) ? result : (result?.data || []);
      found = rows.some((item) => Number(item.goods_id) === Number(goodsId));
      lastPage = Number(result?.last_page || 1);
      currentPage += 1;
    } while (!found && currentPage <= lastPage);
    isFav.value = found;
  } catch (error) {
    console.warn('[商品收藏] 查询收藏状态失败：', error);
  }
};

/** 用户操作成功后再更新按钮状态，失败时保留原状态。 */
const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    openPage('/pages/auth/login');
    return;
  }
  if (!productId.value || favoriteBusy.value) return;
  favoriteBusy.value = true;
  try {
    if (isFav.value) await removeFavoriteProduct(productId.value);
    else await addFavoriteProduct(productId.value);
    isFav.value = !isFav.value;
    uni.showToast({ title: isFav.value ? '收藏成功' : '已取消收藏', icon: 'success' });
  } catch (error) {
    uni.showToast({ title: error?.message || '收藏操作失败', icon: 'none' });
  } finally {
    favoriteBusy.value = false;
  }
};

onShow(() => {
  if (product.value && userStore.isLoggedIn) loadFavoriteState(productId.value, product.value);
});

onLoad((query = {}) => {
  // 微信小程序应从 onLoad 回调读取路由参数；setup 阶段读取 getCurrentPages 可能拿到上一页。
  // 同时兼容 id 与 OpenAPI 使用的 goods_id，避免不同入口字段名不一致。
  const goodsId = query.goods_id || query.id;
  productId.value = goodsId || '';
  if (!goodsId) {
    console.error('[商品详情] 页面参数异常：', query);
  }
  loadDetail(goodsId);
});

/** 文件和图片可能返回相对路径，统一补齐静态资源域名。 */
const resolveResourceUrl = (value) => {
  const path = String(value || '').trim().replace(/\\/g, '/');
  if (!path) return '';
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (path.startsWith('//')) return `https:${path}`;
  const serverBase = String(appConfig.baseUrl || '').replace(/\/api\/?$/, '');
  return `${serverBase}/${path.replace(/^\/+/, '')}`;
};

// 商品图片只读取详情接口的 image/images，不再为缺图商品补造展示图。
const productGallery = computed(() => {
  if (!product.value) return [];
  const p = product.value;
  return [...new Set([p.image, ...(Array.isArray(p.images) ? p.images : [])].map(resolveResourceUrl).filter(Boolean))];
});

// 商品标签优先读取详情接口的 tags，旧数据仅返回 tag_list 时取其中的名称。
const productTags = computed(() => {
  const detail = product.value || {};
  const source = Array.isArray(detail.tags) && detail.tags.length ? detail.tags : detail.tag_list;
  if (!Array.isArray(source)) return [];
  return [...new Set(source.map(item => String(typeof item === 'string' ? item : item?.name || '').trim()).filter(Boolean))];
});

// 历史商品把卖点备注和关键词保存在 raw.comment、raw.gjz；空字段不占页面空间。
const sellingPoint = computed(() => String(product.value?.comment || product.value?.raw?.comment || '').trim());
const productKeywords = computed(() => String(product.value?.gjz || product.value?.raw?.gjz || '').trim());

// 正规字段为空时兼容旧商品原始 HTML，仍交给微信 rich-text 组件渲染。
const richContent = computed(() => String(product.value?.goods_content || product.value?.raw?.goods_content || '').trim());

// 参数、图文和资料分别对应详情接口字段。
const tabs = computed(() => {
  return [
    { label: '规格参数', value: 'params' },
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

  // OpenAPI 参数项字段是 name/value，旧数据的 label/key 仅作兼容。
  if (Array.isArray(product.value.params) && product.value.params.length > 0) {
    product.value.params.forEach(p => {
      const label = p.name || p.label || p.key;
      if (label && p.value !== undefined && p.value !== null && p.value !== '') {
        list.push({ label, value: p.value });
      }
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

// 仅展现接口 materials 分类中的真实文件，不虚构产品手册或下载地址。
const displayMaterials = computed(() => {
  if (!product.value) return [];
  const result = [];

  if (Array.isArray(product.value.materials) && product.value.materials.length > 0) {
    product.value.materials.forEach(cat => {
      if (Array.isArray(cat.items)) {
        cat.items.forEach(it => {
          result.push({
            ...it,
            category_name: cat.category_name || '产品资料'
          });
        });
      }
    });
  }

  return result;
});

// 格式化富文本
const formatRichText = (html) => {
  if (!html) return '';
  // 富文本内图片也可能是相对路径；补齐域名并限制到页面宽度。
  return String(html)
    .replace(/<img[^>]*>/gi, (match) => {
      return match
        .replace(/src=(['"])(.*?)\1/i, (_, quote, src) => `src=${quote}${resolveResourceUrl(src)}${quote}`)
        .replace(/style="[^"]*"/gi, '')
        .replace(/<img/gi, '<img style="max-width:100%;height:auto;border-radius:12rpx;margin:12rpx 0;display:block;"');
    });
};

const getFileExt = (title = '', url = '') => {
  // 文件名可能不带扩展名，优先取标题，再尝试去掉查询参数后的真实 URL。
  const path = [title, String(url).split('?')[0]].find(value => /\.(pdf|docx?|xlsx?|pptx?|dwg|cad|png|jpe?g|webp)$/i.test(String(value))) || '';
  return String(path).match(/\.([a-z0-9]+)$/i)?.[1]?.toUpperCase() || '文件';
};

const getFileTypeClass = (title = '') => {
  const ext = getFileExt(title);
  if (ext === 'PDF') return 'type-pdf';
  if (ext === 'CAD') return 'type-cad';
  if (ext === 'DOC') return 'type-doc';
  if (ext === 'XLS') return 'type-xls';
  return '';
};

const money = (value) => Number(value || 0).toLocaleString();

/** 商品详情的价格监控按钮先校验经销商身份，再按接口创建或更新真实关注。 */
const followPrice = async () => {
  if (monitorBusy.value || !(await requireDealerAccess(userStore))) return;
  monitorBusy.value = true;
  try {
    await watchMonitorGoods(product.value?.goods_id || productId.value);
    uni.showToast({ title: '已加入价格监控', icon: 'success' });
  } catch (error) {
    // 统一请求层已提示接口错误，这里只记录原因，避免连续出现两个错误弹窗。
    console.error('[价格监控] 添加商品失败：', error);
  } finally {
    monitorBusy.value = false;
  }
};

/** 原文件通过客户经理获取；该页不暴露下载、分享或复制链接入口。 */
const contactManager = () => {
  if (userStore.isDealer && Number(userStore.userInfo?.salesperson?.member_id) > 0) {
    openPage('/pages/member/salesperson');
    return;
  }
  uni.showModal({ title: '联系业务员', content: '如需下载原文件，请联系对应业务员获取。', showCancel: false });
};

/** 小程序文档预览需先取得临时文件；关闭转发菜单不等于服务端防下载。 */
const previewFile = (file) => {
  const fileUrl = resolveResourceUrl(file.file_url || file.link_url);
  if (!fileUrl) {
    uni.showToast({ title: '该资料暂无预览地址', icon: 'none' });
    return;
  }
  const fileType = getFileExt(file.title, fileUrl).toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp'].includes(fileType)) {
    previewImageUrl.value = fileUrl;
    return;
  }
  if (!['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileType)) {
    uni.showModal({ title: '暂不支持预览', content: '此格式无法在小程序中预览，请联系客户经理获取原文件。', showCancel: false });
    return;
  }
  // #ifdef H5
  // 浏览器直接打开公开文件通常自带下载功能，因此 H5 不伪称“仅预览”。
  uni.showModal({ title: '请在小程序预览', content: '网页端无法限制浏览器下载。请在微信小程序预览，原文件请联系客户经理。', showCancel: false });
  // #endif
  // #ifndef H5
  uni.showLoading({ title: '正在加载资料...' });
  uni.downloadFile({
    url: fileUrl,
    success: (res) => {
      uni.hideLoading();
      if (res.statusCode !== 200 || !res.tempFilePath) {
        uni.showToast({ title: '资料预览失败', icon: 'none' });
        return;
      }
      uni.openDocument({
        filePath: res.tempFilePath,
        fileType,
        showMenu: false,
        fail: () => uni.showToast({ title: '无法预览，请联系客户经理', icon: 'none' })
      });
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({ title: '资料加载失败', icon: 'none' });
    }
  });
  // #endif
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
    path: `/pages/product/detail?id=${productId.value}`,
    imageUrl: product.value?.image || ""
  };
});
onShareTimeline(() => {
  return {
    title: product.value ? `【产品推荐】${product.value.model} - ${product.value.goods_name}` : "产品详情",
    query: `id=${productId.value}`,
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
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #eaf2ff 0%, #f4f7fc 260rpx, #f4f7fc 100%);
}

.detail-scroll {
  box-sizing: border-box;
  padding: 0 24rpx 220rpx;
}

.image-preview {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(13, 24, 43, .94);
}
.image-preview image { width: 100%; max-height: 80vh; }
.image-preview__close { position: absolute; top: 90rpx; right: 32rpx; color: #fff; font-size: 27rpx; }

.title-card {
  padding: 28rpx;
  border-radius: 24rpx;
  background: #fff;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 22rpx rgba(23, 35, 61, 0.04);
}

.title-card__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.title-card__model {
  display: block;
  margin-top: 8rpx;
  color: #4b5563;
  font-size: 27rpx;
  font-weight: 400;
  line-height: 38rpx;
}

.title-card__name {
  display: block;
  flex: 1;
  min-width: 0;
  color: #17233d;
  font-size: 38rpx;
  font-weight: 800;
  line-height: 46rpx;
}

.title-card__spec {
  display: block;
  margin-top: 10rpx;
  color: #8b95a7;
  font-size: 24rpx;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 18rpx;
}

.product-tag {
  padding: 6rpx 14rpx;
  border-radius: 10rpx;
  background: #edf4ff;
  color: #2468e8;
  font-size: 22rpx;
  line-height: 30rpx;
}

.product-extra {
  display: flex;
  gap: 12rpx;
  margin-top: 14rpx;
  color: #475569;
  font-size: 24rpx;
  line-height: 34rpx;
}

.product-extra__label {
  flex: none;
  color: #8b95a7;
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

.rich-image-box { margin-bottom: 18rpx; overflow: hidden; border-radius: 16rpx; background: #f8fafc; }
.rich-image { display: block; width: 100%; }
.rich-empty { padding: 100rpx 0; color: #94a3b8; font-size: 26rpx; text-align: center; }
.sale-policy { margin-top: 18rpx; padding: 20rpx; border-radius: 12rpx; background: #f0f6ff; color: #334155; font-size: 25rpx; }

.rich-content-box {
  padding: 16rpx 0 24rpx;
  color: #334155;
  font-size: 26rpx;
  line-height: 1.6;
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

.material-notice { margin-bottom: 20rpx; color: #64748b; font-size: 23rpx; line-height: 34rpx; }

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
  background: #64748b;

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
  gap: 10rpx;
  padding: 16rpx 18rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -6rpx 24rpx rgba(23, 35, 61, 0.06);
}

.btn-sub-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 80rpx;
  padding: 0 14rpx;
  border-radius: 40rpx;
  background: #f1f4f9;
  color: #586477;
  font-size: 22rpx;
  font-weight: 700;
  border: none;
}
.btn-sub-action::after {
  display: none;
}

.btn-main-add {
  flex: 1;
  min-width: 0;
  height: 80rpx;
  border-radius: 40rpx;
  background: #2468e8;
  color: #fff;
  font-size: 23rpx;
  font-weight: 800;
  line-height: 80rpx;
  box-shadow: 0 8rpx 24rpx rgba(36, 104, 232, 0.35);
  border: none;
}
.btn-sub-action::after {
  display: none;
}
</style>
