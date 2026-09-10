const fs = require('fs');
let content = fs.readFileSync('utils/request.js', 'utf-8');

const getHeaderRegex = /function getHeader\(options\) \{[\s\S]*?return header;\n\}/;
const prepareOptionsRegex = /function prepareOptions\(options = \{\}\) \{[\s\S]*?return \{[\s\S]*?header: getHeader\(\{ \.\.\.options, url \}\)\n  \};\n\}/;

const newPrepareOptions = `function prepareOptions(options = {}) {
  const url = resolveUrl(options.url, options.baseUrl);
  const header = {
    'channel': config.clientType,
    ...(options.header || {})
  };

  const userStore = getUserStore();
  if (userStore.token && !isWhiteListed(url)) {
    header[config.auth.headerName] = \`\${config.auth.tokenPrefix || ''}\${userStore.token}\`;
  }

  // CORS 终极绕过：将导致预检(OPTIONS)失败的自定义 header 移动到 URL 参数中
  let finalUrl = url;
  const query = [];
  if (header['channel']) {
    query.push(\`channel=\${header['channel']}\`);
    delete header['channel'];
  }
  if (header[config.auth.headerName]) {
    query.push(\`token=\${header[config.auth.headerName]}\`);
    delete header[config.auth.headerName];
  }
  
  if (query.length > 0) {
    finalUrl += (finalUrl.includes('?') ? '&' : '?') + query.join('&');
  }

  // 针对 GET 请求，移除 Content-Type 避免触发 OPTIONS
  if (!options.method || options.method.toUpperCase() === 'GET') {
    delete header['Content-Type'];
  } else {
    header['Content-Type'] = header['Content-Type'] || 'application/json';
  }

  return {
    ...options,
    url: finalUrl,
    timeout: options.timeout || config.timeout,
    header
  };
}`;

content = content.replace(prepareOptionsRegex, newPrepareOptions);
// We also need to remove the old getHeader function since we inlined its logic
content = content.replace(getHeaderRegex, '');

fs.writeFileSync('utils/request.js', content);
