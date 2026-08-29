const fs = require('fs');
let content = fs.readFileSync('pages/monitor/detail.vue', 'utf-8');

const newScript = `<script setup>
import { onMounted, ref } from 'vue';
import { getMonitorList } from '@/api/monitor';
import { getPageOptions } from '@/utils/pages';

const item = ref(null);
onMounted(async () => {
  try {
    const options = getPageOptions();
    const result = await getMonitorList();
    const watches = result.data || [];
    const watch = watches.find(row => String(row.goods_id) === String(options.productId));
    if (watch) {
      item.value = {
        product: {
          name: watch.goods_name_snapshot,
          model: watch.model_snapshot,
          image: watch.image_snapshot
        },
        currentPrice: watch.last_price || watch.base_price,
        history: [
          { date: watch.create_time_text, price: watch.base_price }
        ]
      };
      if (watch.last_price && watch.last_price !== watch.base_price) {
        item.value.history.unshift({ date: watch.last_notify_time_text || '最近', price: watch.last_price });
      }
    }
  } catch(e) {}
});
</script>`;

content = content.replace(/<script setup>[\s\S]*?<\/script>/, newScript);
fs.writeFileSync('pages/monitor/detail.vue', content);
console.log('patched monitor detail');
