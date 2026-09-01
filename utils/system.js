/**
 * 系统与导航栏尺寸计算工具
 * 兼容微信小程序胶囊按钮、H5及各端安全区
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

  // 胶囊右侧占位宽度 (胶囊宽 + 左右边距)，避免右侧操作按钮被遮挡
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
