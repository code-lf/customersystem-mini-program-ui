/**
 * 页面导航工具。
 *
 * 统一使用 Promise 包装 uni 导航 API，页面可以用 async/await 编写，
 * 同时避免在业务代码里重复编写 success、fail 回调。
 */

function callNavigation(method, options = {}) {
  return new Promise((resolve, reject) => {
    uni[method]({
      ...options,
      success: resolve,
      fail: reject
    });
  });
}

export function navigateTo(url, options = {}) {
  return callNavigation('navigateTo', { ...options, url });
}

export function redirectTo(url, options = {}) {
  return callNavigation('redirectTo', { ...options, url });
}

export function reLaunch(url, options = {}) {
  return callNavigation('reLaunch', { ...options, url });
}

export function switchTab(url, options = {}) {
  return callNavigation('switchTab', { ...options, url });
}

export function navigateBack(delta = 1, options = {}) {
  return callNavigation('navigateBack', { ...options, delta });
}

/**
 * 获取当前页面路径，不依赖具体页面组件，适合做登录页判断和埋点。
 */
export function getCurrentRoute() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  if (!currentPage) return '';
  return `/${currentPage.route || ''}`;
}

const navigation = {
  navigateTo,
  redirectTo,
  reLaunch,
  switchTab,
  navigateBack,
  getCurrentRoute
};

export default navigation;
