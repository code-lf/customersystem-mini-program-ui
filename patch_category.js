const fs = require('fs');
let content = fs.readFileSync('pages/product/category.vue', 'utf-8');

const newScript = `<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { getProductCategories, getProductList } from '@/api/product';

const pageOptions = getPageOptions();
const isHome = computed(() => pageOptions.type === 'home');

const categories = ref([]);
const activeType = ref(0);
const activeSideCategory = ref(0);

const searchKeyword = ref('');
const products = ref([]);
const isLoading = ref(false);

const activeTypeName = computed(() => {
  const current = categories.value.find((item) => item.id === activeType.value);
  return current ? current.category_name : '分类';
});

const loadCategories = async () => {
  try {
    const res = await getProductCategories();
    categories.value = res || [];
    if (categories.value.length > 0) {
      activeType.value = categories.value[0].id;
      if (categories.value[0].children && categories.value[0].children.length > 0) {
        activeSideCategory.value = categories.value[0].children[0].id;
      }
    }
  } catch(e) {}
};

const loadProducts = async () => {
  if (!activeSideCategory.value && !activeType.value) return;
  isLoading.value = true;
  try {
    const res = await getProductList({
      category_id: activeSideCategory.value || activeType.value,
      keyword: searchKeyword.value,
      limit: 100
    });
    products.value = res.data || [];
  } catch(e) {}
  isLoading.value = false;
};

onMounted(async () => {
  await loadCategories();
  await loadProducts();
});

watch([activeSideCategory, activeType], () => {
  loadProducts();
});

const selectType = (typeId) => {
  activeType.value = typeId;
  const current = categories.value.find((item) => item.id === typeId);
  if (current && current.children && current.children.length > 0) {
    activeSideCategory.value = current.children[0].id;
  } else {
    activeSideCategory.value = 0;
  }
};

const selectSideCategory = (id) => {
  activeSideCategory.value = id;
};

const resetFilters = () => {
  searchKeyword.value = '';
  loadProducts();
};

const filteredProducts = computed(() => products.value);

const formatPrice = (val) => Number(val || 0).toLocaleString();

const addToSolution = (product) => {
  uni.setStorageSync('pendingSolutionProduct', {
    id: product.goods_id,
    name: product.goods_name,
    model: product.model,
    image: product.image,
    price: product.price,
    mockUnitPrice: product.price
  });
  uni.showToast({ title: '已加入报价单', icon: 'success' });
};
</script>`;

content = content.replace(/<script setup>[\s\S]*?<\/script>/, newScript);

// Update template for central category (tabs and sidebar)
content = content.replace(/v-for="item in uiCategories\.central"/g, 'v-for="item in categories" :key="item.id"');
content = content.replace(/item\.id === activeType/g, 'item.id === activeType');
content = content.replace(/item\.name/g, 'item.category_name');
content = content.replace(/@click="selectType\(item\.id\)"/g, '@click="selectType(item.id)"');

// Remove series tabs completely since API doesn't provide series
content = content.replace(/<scroll-view class="series-tabs-scroll"[\s\S]*?<\/scroll-view>/, '');

// Update sidebar
content = content.replace(/v-for="item in uiCategories\.centralSide"/g, 'v-for="item in (categories.find(c => c.id === activeType)?.children || [])" :key="item.id"');
content = content.replace(/item === activeSideCategory/g, 'item.id === activeSideCategory');
content = content.replace(/@click="activeSideCategory = item"/g, '@click="selectSideCategory(item.id)"');
content = content.replace(/>{{ item }}<\/text>/g, '>{{ item.category_name }}</text>');

// Update product rendering
content = content.replace(/:key="product\.id"/g, ':key="product.goods_id"');
content = content.replace(/product\.name/g, 'product.goods_name');
content = content.replace(/product\.model/g, 'product.model');
content = content.replace(/product\.image/g, 'product.image');
content = content.replace(/product\.specs/g, 'product.spec');
content = content.replace(/@click="openPage\('\/pages\/product\/detail', { id: product\.id }\)"/g, '@click="openPage(\'/pages/product/detail\', { id: product.goods_id })"');

fs.writeFileSync('pages/product/category.vue', content);
console.log('patched category');
