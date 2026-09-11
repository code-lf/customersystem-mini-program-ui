const fs = require('fs');
let content = fs.readFileSync('pages/product/category.vue', 'utf-8');

// 1. Remove ROOT_DEFS
content = content.replace(/const ROOT_DEFS = \[[\s\S]*?\];/g, '');

// 2. Fix rootCategories
const rootCategoriesRegex = /const rootCategories = computed\(\(\) => \{[\s\S]*?\}\);/;
const newRootCategories = `const rootCategories = computed(() => {
  return allTree.value.map(r => ({
    id: r.id,
    category_name: r.category_name,
    children: r.children || []
  }));
});`;
content = content.replace(rootCategoriesRegex, newRootCategories);

// 3. Fix loadCategories logic where it references ROOT_DEFS
const loadCategoriesRegex = /const queryRootId = pageOptions\.root_id \? Number\(pageOptions\.root_id\) : null;[\s\S]*?if \(queryRootId && ROOT_DEFS\.some\(r => r\.id === queryRootId\)\) \{[\s\S]*?locateAnyCategory\(queryCategoryId\);\n    \}/;
const newLoadCategories = `const queryRootId = pageOptions.root_id ? Number(pageOptions.root_id) : null;
    const queryCategoryId = pageOptions.category_id ? Number(pageOptions.category_id) : null;
    
    // Set initial root to the first available root if nothing is passed or found yet
    if (allTree.value.length > 0) {
      currentRootId.value = allTree.value[0].id;
    }

    if (queryRootId && allTree.value.some(r => r.id === queryRootId)) {
      currentRootId.value = queryRootId;
      if (queryCategoryId && queryCategoryId !== queryRootId) locateAnyCategory(queryCategoryId);
    } else if (queryCategoryId) {
      locateAnyCategory(queryCategoryId);
    }`;
content = content.replace(loadCategoriesRegex, newLoadCategories);

// 4. Initial currentRootId value
content = content.replace(/const currentRootId = ref\(58\);/, `const currentRootId = ref(null);`);

fs.writeFileSync('pages/product/category.vue', content);
