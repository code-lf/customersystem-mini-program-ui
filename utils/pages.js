/**
 * 页面参数和跳转辅助方法，支持自动识别 TabBar 页面与参数拼接。
 */
const tabPages = [
  '/pages/index/index',
  '/pages/product/index',
  '/pages/solution/index',
  '/pages/ai/index',
  '/pages/my/my',
  'pages/index/index',
  'pages/product/index',
  'pages/solution/index',
  'pages/ai/index',
  'pages/my/my'
];

export function getPageOptions() {
  try {
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    return page && page.options ? page.options : {};
  } catch (e) {
    return {};
  }
}

export function stringifyQuery(params = {}) {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

export function openPage(path, params = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const isTab = tabPages.some((tab) => cleanPath === (tab.startsWith('/') ? tab : `/${tab}`));
  
  if (isTab) {
    return uni.switchTab({
      url: cleanPath,
      fail: () => uni.reLaunch({ url: cleanPath })
    });
  }

  const query = stringifyQuery(params);
  const targetUrl = query ? `${cleanPath}?${query}` : cleanPath;

  return uni.navigateTo({
    url: targetUrl,
    fail: () => {
      uni.redirectTo({
        url: targetUrl,
        fail: () => uni.reLaunch({ url: targetUrl })
      });
    }
  });
}

export function replacePage(path, params = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const isTab = tabPages.some((tab) => cleanPath === (tab.startsWith('/') ? tab : `/${tab}`));
  
  if (isTab) {
    return uni.switchTab({ url: cleanPath });
  }

  const query = stringifyQuery(params);
  return uni.redirectTo({ url: query ? `${cleanPath}?${query}` : cleanPath });
}

export default { getPageOptions, stringifyQuery, openPage, replacePage };
