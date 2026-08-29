const fs = require('fs');
let content = fs.readFileSync('pages/product/list.vue', 'utf-8');

const newScript = `<script setup>
import { computed, ref, onMounted } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions, openPage } from '@/utils/pages';
import { getProductList } from '@/api/product';

const pageOptions = getPageOptions();
const isHome = computed(() => pageOptions.type === 'home' || ['wall', 'cabinet'].includes(pageOptions.category));
const activeFilter = ref('');
const sortAsc = ref(true);
const products = ref([]);
const isLoading = ref(false);

const pageTitle = computed(() => {
  if (!isHome.value) return '中央空调产品列表';
  return pageOptions.category === 'cabinet' ? '柜式空调' : '壁挂式空调';
});
const filterLabels = computed(() => isHome.value ? ['匹数', '能效', '适用面积', '更多'] : ['冷量', '能效', '电源', '更多']);

const selectFilter = (item) => {
  activeFilter.value = activeFilter.value === item ? '' : item;
  uni.showToast({ title: \`已按 \${item} 筛选\`, icon: 'none' });
};
const toggleSort = () => {
  sortAsc.value = !sortAsc.value;
  uni.showToast({ title: sortAsc.value ? '按价格升序' : '按价格降序', icon: 'none' });
};

const loadProducts = async () => {
  isLoading.value = true;
  try {
    const params = { limit: 100 };
    if (pageOptions.keyword) params.keyword = pageOptions.keyword;
    if (pageOptions.category_id) params.category_id = pageOptions.category_id;
    const res = await getProductList(params);
    products.value = res.data || [];
  } catch(e) {}
  isLoading.value = false;
};

onMounted(() => {
  loadProducts();
});

const sortedProducts = computed(() => {
  const list = [...products.value];
  return list.sort((a, b) => sortAsc.value ? (a.price - b.price) : (b.price - a.price));
});

const sortedCentralProducts = computed(() => sortedProducts.value);
const sortedHomeProducts = computed(() => sortedProducts.value);

const money = (value) => Number(value || 0).toLocaleString();

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
content = content.replace(/:key="product\.id"/g, ':key="product.goods_id"');
content = content.replace(/product\.name/g, 'product.goods_name');
content = content.replace(/product\.specs/g, 'product.spec');
content = content.replace(/product\.spec \|\| \[\]/g, '(product.spec ? product.spec.split(" ") : [])');
content = content.replace(/@click="openPage\('\/pages\/product\/detail', { id: product\.id }\)"/g, '@click="openPage(\'/pages/product/detail\', { id: product.goods_id })"');
content = content.replace(/product\.tag/g, 'product.comment');

fs.writeFileSync('pages/product/list.vue', content);
console.log('patched list');
