const fs = require('fs');
let content = fs.readFileSync('pages/solution/index.vue', 'utf-8');

// 1. replace openAddPanel('search') with openPage('/pages/product/category')
content = content.replace(/openAddPanel\('search'\)/g, "openPage('/pages/product/category')");

// 2. We can just delete the add panel modal since it's no longer needed, 
// but we also need to change the share modal. Let's find out how the share modal is structured.
fs.writeFileSync('pages/solution/index.vue', content);
