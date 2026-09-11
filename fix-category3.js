const fs = require('fs');
let content = fs.readFileSync('pages/product/category.vue', 'utf-8');

const regex = /\} else if \(queryCategoryId\) \{\n\s*locateAnyCategory\(queryCategoryId\);\n\s*\}/g;
let matchCount = 0;
content = content.replace(regex, (match) => {
  matchCount++;
  if (matchCount === 1) return match;
  return '';
});

fs.writeFileSync('pages/product/category.vue', content);
