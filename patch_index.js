const fs = require('fs');
let content = fs.readFileSync('pages/index/index.vue', 'utf-8');

const newScript = `<script setup>
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/store/user';
import { getNotices } from '@/api/content';
import { getSolutionList } from '@/api/solution';
import { openPage } from '@/utils/pages';

const isLoading = ref(true);
const userStore = useUserStore();
const keyword = ref('');
const notices = ref([]);
const solutions = ref([]);

const quickTools = [
  { title: '型号查询', icon: 'search', path: '/pages/password/index' },
  { title: '我的报价单', icon: 'file-text-fill', path: '/pages/solution/index' },
  { title: '新建方案', icon: 'order', path: '/pages/solution/index' },
  { title: '产品对比', icon: 'grid-fill', path: '/pages/product/list' },
  { title: '资料中心', icon: 'coupon', path: '/pages/product/index' }
];

const formatMoney = (value) => Number(value || 0).toLocaleString();

const handleSearch = () => {
  const text = keyword.value.trim();
  if (!text) return;
  openPage('/pages/product/list', { keyword: text });
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const [noticeResult, solutionResult] = await Promise.all([getNotices({ limit: 10 }), getSolutionList({ limit: 10 })]);
    notices.value = noticeResult.data && noticeResult.data.data ? noticeResult.data.data.map(n => ({
      id: n.article_id,
      title: n.article_title,
      type: n.category_name,
      time: n.publish_time_text,
      image: n.cover_image
    })) : [];
    solutions.value = solutionResult.data && solutionResult.data.data ? solutionResult.data.data.map(item => ({
      id: item.quote_id,
      title: item.quote_no,
      items: item.items || Array(item.item_count).fill({}),
      totalPrice: item.pay_amount,
      customerName: item.contact_name_snapshot,
      date: item.create_time_text
    })) : [];
  } catch(e) {}
  isLoading.value = false;
});
</script>`;

content = content.replace(/<script setup>[\s\S]*?<\/script>/, newScript);
fs.writeFileSync('pages/index/index.vue', content);
console.log('patched home index');
