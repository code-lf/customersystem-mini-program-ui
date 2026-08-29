const fs = require('fs');
let content = fs.readFileSync('pages/solution/index.vue', 'utf-8');

const newScript = `<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { openPage } from '@/utils/pages';
import { getCart, addCartItem, editCartItem, removeCartItem, setCartDiscount, exportCart, getSolutionList } from '@/api/solution';
import { getProductList } from '@/api/product';

const safeTop = computed(() => {
  try {
    const windowInfo = typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : {};
    const systemInfo = typeof uni.getSystemInfoSync === 'function' ? uni.getSystemInfoSync() : {};
    return windowInfo.statusBarHeight || systemInfo.statusBarHeight || 20;
  } catch (error) {
    return 20;
  }
});

const activeTab = ref('current');
const isLoading = ref(true);

const showAddPanel = ref(false);
const showPricePanel = ref(false);
const addSearchKeyword = ref('');
const pricingMode = ref('discount');
const discountRate = ref(95);
const customTotalInput = ref('');
const taxRate = ref(13);
const quoteRemark = ref('');

const quoteItems = ref([]);
const cartData = ref({});
const historySolutions = ref([]);

const candidateProducts = ref([]);

const loadCart = async () => {
  isLoading.value = true;
  try {
    const res = await getCart();
    cartData.value = res.data || {};
    quoteItems.value = (res.data && res.data.items) ? res.data.items.map(item => ({
      ...item,
      id: item.cart_item_id,
      name: item.goods_name_snapshot,
      model: item.model_snapshot,
      image: item.image_snapshot,
      price: item.origin_price || item.quote_price,
      quantity: item.quantity
    })) : [];
    if(res.data) {
      pricingMode.value = res.data.pricing_mode || 'discount';
      discountRate.value = res.data.global_discount_rate || 100;
      quoteRemark.value = res.data.remark || '';
    }
  } catch(e) {}
  isLoading.value = false;
};

const loadHistory = async () => {
  try {
    const res = await getSolutionList({ limit: 100 });
    historySolutions.value = (res.data && res.data.data) ? res.data.data.map(item => ({
      ...item,
      id: item.quote_id,
      title: item.quote_no || '方案报价单',
      customerName: item.contact_name_snapshot || '客户',
      date: item.create_time_text,
      status: item.quote_status,
      items: item.items || Array(item.item_count).fill({}),
      totalPrice: item.pay_amount
    })) : [];
  } catch(e) {}
};

const loadCandidates = async () => {
  try {
    const res = await getProductList({ keyword: addSearchKeyword.value, limit: 20 });
    candidateProducts.value = res.data || [];
  } catch(e) {}
};

watch(addSearchKeyword, () => {
  loadCandidates();
});

onShow(() => {
  loadCart();
  loadHistory();
  checkPendingProduct();
});

const totalPrice = computed(() => cartData.value.goods_amount || 0);
const totalCount = computed(() => cartData.value.total_quantity || 0);
const finalTotal = computed(() => cartData.value.pay_amount || 0);
const finalDiscount = computed(() => {
  if (!totalPrice.value) return 100;
  return Math.round(finalTotal.value / totalPrice.value * 10000) / 100;
});
const discountAmount = computed(() => cartData.value.discount_amount || 0);

const formatPrice = (val) => Number(val || 0).toLocaleString();

const changeItemQty = async (item, delta) => {
  const newQty = item.quantity + delta;
  if (newQty < 1) return;
  uni.showLoading();
  await editCartItem(item.id, { quantity: newQty });
  await loadCart();
  uni.hideLoading();
};

const removeItem = async (id) => {
  uni.showLoading();
  await removeCartItem(id);
  await loadCart();
  uni.hideLoading();
};

const openAddPanel = (mode = 'search') => {
  if (mode === 'select') {
    openPage('/pages/product/category');
    return;
  }
  showAddPanel.value = true;
  loadCandidates();
};

const addProductToQuote = async (product) => {
  uni.showLoading();
  await addCartItem({ goods_id: product.goods_id, quantity: 1 });
  await loadCart();
  uni.hideLoading();
  uni.showToast({ title: '已添加', icon: 'success' });
};

const applyPricing = async () => {
  uni.showLoading();
  await setCartDiscount({
    pricing_mode: pricingMode.value,
    global_discount_rate: pricingMode.value === 'discount' ? discountRate.value : 100
  });
  await loadCart();
  showPricePanel.value = false;
  uni.hideLoading();
};

const exportQuote = async () => {
  if (!quoteItems.value.length) {
    uni.showToast({ title: '请先添加产品', icon: 'none' });
    return;
  }
  uni.showLoading();
  try {
    const res = await exportCart({ extra_amount: 0, remark: quoteRemark.value, clear_cart: 1 });
    uni.hideLoading();
    uni.showToast({ title: '生成成功', icon: 'success' });
    loadCart();
    loadHistory();
    activeTab.value = 'history';
  } catch(e) {
    uni.hideLoading();
  }
};

const checkPendingProduct = async () => {
  try {
    const pending = uni.getStorageSync('pendingSolutionProduct');
    if (pending && pending.name) {
      uni.showLoading();
      await addCartItem({ goods_id: pending.id, quantity: 1 });
      await loadCart();
      uni.removeStorageSync('pendingSolutionProduct');
      uni.hideLoading();
    }
  } catch (e) {
    // ignore
  }
};
</script>`;

content = content.replace(/<script setup>[\s\S]*?<\/script>/, newScript);

// update template
content = content.replace(/product\.name/g, 'product.goods_name');
content = content.replace(/product\.image/g, 'product.image');

fs.writeFileSync('pages/solution/index.vue', content);
console.log('patched solution index');
