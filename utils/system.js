/**
 * 系统状态栏与自定义导航栏尺寸计算工具。
 *
 * 本项目的 tabBar 页面使用 navigationStyle: "custom"，系统不会自动替页面
 * 避开状态栏与微信右上角胶囊。因此页面需要同时知道：
 * 1. statusBarHeight：正文从状态栏下方开始；
 * 2. navBarHeight：与胶囊同一行的标题区域高度；
 * 3. capsuleOccupiedWidth：胶囊在右侧占用的宽度，右侧按钮应在它左边结束。
 *
 * 尺寸在一次应用运行期间不会变化，所以结果会缓存，避免每个页面重复调用系统 API。
 */

let cachedNavInfo = null;

export function getNavMetrics() {
  if (cachedNavInfo) return cachedNavInfo;

  let statusBarHeight = 20;
  let navBarHeight = 44;
  let capsuleTop = 26;
  let capsuleBottom = 58;
  let capsuleLeft = 280;
  let capsuleWidth = 87;
  let capsuleHeight = 32;
  let capsuleRightMargin = 10;
  let isMiniProgram = false;

  try {
    const sys = (typeof uni.getSystemInfoSync === 'function') ? uni.getSystemInfoSync() : {};
    if (sys.statusBarHeight) {
      statusBarHeight = sys.statusBarHeight;
    }

    // 微信小程序或其他支持胶囊的平台
    if (typeof uni.getMenuButtonBoundingClientRect === 'function') {
      const menu = uni.getMenuButtonBoundingClientRect();
      if (menu && menu.top && menu.height && menu.width) {
        isMiniProgram = true;
        capsuleTop = menu.top;
        capsuleBottom = menu.bottom;
        capsuleLeft = menu.left;
        capsuleWidth = menu.width;
        capsuleHeight = menu.height;
        capsuleRightMargin = (sys.windowWidth || 375) - menu.right;
        // 导航栏高度 = (胶囊top - 状态栏height) * 2 + 胶囊height
        const gap = menu.top - statusBarHeight;
        navBarHeight = gap > 0 ? (gap * 2 + menu.height) : 44;
      }
    }
  } catch (e) {
    console.warn('Get nav metrics error:', e);
  }

  // 胶囊右侧占位宽度 = 胶囊宽度 + 屏幕右边距 + 额外间隔。
  // 页面把这个值设为 paddingRight 后，“AI 在线”等控件会自然停在胶囊左侧。
  const capsuleOccupiedWidth = isMiniProgram ? (capsuleWidth + capsuleRightMargin + 10) : 0;
  const totalNavHeight = statusBarHeight + navBarHeight;

  cachedNavInfo = {
    statusBarHeight,
    navBarHeight,
    totalNavHeight,
    capsuleTop,
    capsuleBottom,
    capsuleLeft,
    capsuleWidth,
    capsuleHeight,
    capsuleRightMargin,
    capsuleOccupiedWidth,
    isMiniProgram
  };

  return cachedNavInfo;
}

export default {
  getNavMetrics
};
