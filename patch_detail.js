const fs = require('fs');
let content = fs.readFileSync('pages/product/detail.vue', 'utf-8');

const newScript = `<script setup>
import { computed, ref, onMounted } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { getProductDetail } from '@/api/product';

const options = getPageOptions();
const product = ref(null);
const isFav = ref(false);
const activeTab = ref('base');
const isLoading = ref(true);

const loadDetail = async () => {
  try {
    const res = await getProductDetail(options.id);
    product.value = res.data;
  } catch(e) {}
  isLoading.value = false;
};

onMounted(() => {
  loadDetail();
});

const tabs = computed(() => {
  const t = [];
  if (product.value) {
    t.push({ label: '基本信息', value: 'base' });
    if (product.value.params && product.value.params.length > 0) t.push({ label: '技术参数', value: 'tech' });
    if (product.value.goods_content) t.push({ label: '图文详情', value: 'rich' });
    if (product.value.materials && product.value.materials.length > 0) {
      product.value.materials.forEach((m, idx) => {
        t.push({ label: m.category_name, value: 'material_' + idx });
      });
    }
  }
  return t;
});

const baseInfo = computed(() => {
  if(!product.value) return [];
  return [
    { label: '设备型号', value: product.value.model },
    { label: '设备名称', value: product.value.goods_name },
    { label: '订货编码', value: product.value.order_code },
    { label: '商品分类', value: product.value.category_name },
    { label: '装箱包装', value: product.value.package_text }
  ];
});

const techInfo = computed(() => {
  if(!product.value || !product.value.params) return [];
  return product.value.params;
});

const money = (value) => Number(value || 0).toLocaleString();

const toggleFavorite = () => {
  isFav.value = !isFav.value;
  uni.showToast({ title: isFav.value ? '已加入我的收藏' : '已取消收藏', icon: 'none' });
};

const shareProduct = () => {
  uni.showToast({ title: '已复制设备选型链接', icon: 'none' });
};

const followPrice = () => {
  uni.showToast({ title: '已开启该型号价格监控提醒', icon: 'success' });
};

const previewFile = (file) => {
  uni.showToast({ title: \`正在调阅: \${file.title}\`, icon: 'none' });
};

const addToSolution = () => {
  if(!product.value) return;
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
</script>`;

content = content.replace(/<script setup>[\s\S]*?<\/script>/, newScript);

// update template
content = content.replace(/product\.name/g, 'product.goods_name');
content = content.replace(/item\.label/g, 'item.label');
content = content.replace(/item\.value/g, 'item.value');
content = content.replace(/v-if="activeTab === 'rich'"/g, 'v-if="activeTab === \'rich\'"');

// Fix rich panel
content = content.replace(/<view v-if="activeTab === 'rich'"[\s\S]*?<\/view>/, `<view v-if="activeTab === 'rich'" class="rich-panel">
          <rich-text :nodes="product.goods_content"></rich-text>
        </view>`);

// Fix file panel
content = content.replace(/<view v-if="activeTab === 'files'"[\s\S]*?<\/view>/, `<view v-if="activeTab.startsWith('material_')" class="file-panel">
          <view v-for="file in product.materials[parseInt(activeTab.split('_')[1])].items" :key="file.id" class="file-row">
            <view class="pdf-icon">PDF</view>
            <view class="file-info">
              <text class="file-row__name">{{ file.title }}</text>
              <text class="file-row__meta">{{ file.remark }}</text>
            </view>
            <button class="file-action-btn" @click="previewFile(file)">调阅</button>
          </view>
        </view>`);

// add v-if="product"
content = content.replace(/<view class="hero">/, '<view class="hero" v-if="product">');
content = content.replace(/<view class="title-card">/, '<view class="title-card" v-if="product">');
content = content.replace(/<view class="tab-card">/, '<view class="tab-card" v-if="product">');

fs.writeFileSync('pages/product/detail.vue', content);
console.log('patched detail');
