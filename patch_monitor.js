const fs = require('fs');
let content = fs.readFileSync('pages/monitor/index.vue', 'utf-8');

const newScript = `<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { openPage } from '@/utils/pages';
import { getMonitorList } from '@/api/monitor';

const active = ref('all');
const isLoading = ref(true);
const watches = ref([]);

const loadWatches = async () => {
  isLoading.value = true;
  try {
    const res = await getMonitorList({ limit: 100 });
    watches.value = res.data || [];
  } catch(e) {}
  isLoading.value = false;
};

onMounted(() => {
  loadWatches();
});

watch(active, () => {
  // locally filter
});

const tabs = [
  { label: '全部机型', value: 'all' },
  { label: '近期降价', value: 'down' },
  { label: '价格波动', value: 'changed' }
];

const allItems = computed(() => {
  return watches.value.map((item) => {
    return {
      ...item,
      id: item.goods_id,
      model: item.model_snapshot,
      image: item.image_snapshot,
      price: item.last_price || item.base_price,
      change: (item.base_price || 0) - (item.last_price || 0)
    };
  });
});

const filteredList = computed(() => {
  if (active.value === 'down') {
    return allItems.value.filter(item => item.change > 0);
  }
  if (active.value === 'changed') {
    return allItems.value.filter(item => item.change !== 0);
  }
  return allItems.value;
});

const money = (value) => Number(value || 0).toLocaleString();
</script>`;

content = content.replace(/<script setup>[\s\S]*?<\/script>/, newScript);
fs.writeFileSync('pages/monitor/index.vue', content);
console.log('patched monitor');
