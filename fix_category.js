const fs = require('fs');
let content = fs.readFileSync('pages/product/category.vue', 'utf-8');

// fix home
content = content.replace(/uiCategories\.home/, `[{id: 'wall', category_name: '壁挂式空调', desc: '节能静音 / 快速冷暖', count: 68, image: '/static/aircon/home-green.png'}, {id: 'cabinet', category_name: '柜式空调', desc: '大风量 / 快速制冷制热', count: 48, image: '/static/aircon/home-cabinet-green.png'}]`);

// fix series
content = content.replace(/<!-- 二级系列横向标签 -->[\s\S]*?<\/view>\s*<!-- 左侧/m, '<!-- 左侧');

// fix centralSide
content = content.replace(/v-for="name in uiCategories\.centralSide"/, 'v-for="item in (categories.find(c => c.id === activeType)?.children || [])"');
content = content.replace(/:key="name"/, ':key="item.id"');
content = content.replace(/activeSideCategory === name/g, 'activeSideCategory === item.id');
content = content.replace(/@click="activeSideCategory = name"/g, '@click="selectSideCategory(item.id)"');
content = content.replace(/<text>{{ name }}<\/text>/g, '<text>{{ item.category_name }}</text>');

fs.writeFileSync('pages/product/category.vue', content);
console.log('fixed category');
