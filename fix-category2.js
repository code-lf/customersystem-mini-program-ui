const fs = require('fs');
let content = fs.readFileSync('pages/product/category.vue', 'utf-8');

content = content.replace(/\}\);\n\}\);/g, '});');

fs.writeFileSync('pages/product/category.vue', content);
