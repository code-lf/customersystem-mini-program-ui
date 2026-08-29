const fs = require('fs');
let content = fs.readFileSync('pages/notice/index.vue', 'utf-8');

const newScript = `<script setup>
import { computed, ref, onMounted } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { openPage } from '@/utils/pages';
import { getNotices, getNoticeCategories } from '@/api/content';

const active = ref('全部');
const isLoading = ref(true);

const uiNotices = ref([]);
const categories = ref([{ id: 0, category_name: '全部' }]);

const loadNotices = async () => {
  isLoading.value = true;
  try {
    const [catRes, listRes] = await Promise.all([
      getNoticeCategories(),
      getNotices({ limit: 100 })
    ]);
    if (catRes.data) {
      categories.value = [{ id: 0, category_name: '全部' }, ...catRes.data];
    }
    if (listRes.data && listRes.data.data) {
      uiNotices.value = listRes.data.data.map(n => ({
        id: n.article_id,
        title: n.article_title,
        tag: n.category_name,
        date: n.publish_time_text,
        views: n.read_count || n.read_visitor_count,
        image: n.cover_image,
        type: n.category_name
      }));
    }
  } catch(e) {}
  isLoading.value = false;
};

onMounted(() => {
  loadNotices();
});

const shownNotices = computed(() => {
  if (active.value === '全部') return uiNotices.value;
  return uiNotices.value.filter((item) => item.type === active.value);
});

const tabs = computed(() => categories.value.map(c => c.category_name));

const handleTabClick = (tab) => {
  active.value = tab;
};
</script>`;

content = content.replace(/<script setup>[\s\S]*?<\/script>/, newScript);

// update template
content = content.replace(/v-for="tab in \['全部', '系统通知', '产品动态', '行业资讯'\]"/, 'v-for="tab in tabs"');
content = content.replace(/@click="active = tab"/, '@click="handleTabClick(tab)"');

fs.writeFileSync('pages/notice/index.vue', content);
console.log('patched notice index');
