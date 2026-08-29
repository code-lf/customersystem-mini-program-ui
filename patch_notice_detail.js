const fs = require('fs');
let content = fs.readFileSync('pages/notice/detail.vue', 'utf-8');

const newScript = `<script setup>
import { onMounted, ref } from 'vue';
import AppNavbar from '@/components/app-navbar.vue';
import { getPageOptions } from '@/utils/pages';
import { getNoticeDetail, readNotice } from '@/api/content';

const notice = ref(null);
const isLoading = ref(true);

onMounted(async () => {
  const options = getPageOptions();
  try {
    const result = await getNoticeDetail(options.id);
    if (result.data) {
      notice.value = {
        title: result.data.article_title,
        date: result.data.publish_time_text,
        views: result.data.read_count || result.data.read_visitor_count,
        tag: result.data.category_name,
        content: result.data.content,
        image: result.data.cover_image
      };
      // Record read
      readNotice(options.id, { visitor_key: 'guest' });
    }
  } catch(e) {}
  isLoading.value = false;
});
</script>`;

content = content.replace(/<script setup>[\s\S]*?<\/script>/, newScript);
fs.writeFileSync('pages/notice/detail.vue', content);
console.log('patched notice detail');
