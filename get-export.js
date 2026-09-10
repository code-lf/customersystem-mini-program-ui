const fs = require('fs');
const content = fs.readFileSync('pages/solution/index.vue', 'utf-8');
const match = content.match(/const exportQuote = ([\s\S]*?)};/);
if (match) console.log(match[0]);
