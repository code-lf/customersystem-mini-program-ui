import config from '../config/app';
import { openPage } from './pages';

/** 点击时直接打开服务号主页；原生 API 不支持、配置缺失或调用失败则回退二维码页。 */
export function openOfficialAccount() {
  const username = String(config.officialAccount?.originalId || '').trim();
  let fallbackStarted = false;
  const fallback = () => {
    // 防止原生失败回调与同步异常重复触发导航。
    if (fallbackStarted) return;
    fallbackStarted = true;
    return openPage('/pages/wechat/index', { mode: 'qr' });
  };
  // 必须在点击回调里直接调用微信原生方法，不能等待请求配置后丢失用户操作上下文。
  // #ifdef MP-WEIXIN
  if (/^gh_[a-zA-Z0-9]+$/.test(username) && typeof wx !== 'undefined' && typeof wx.openOfficialAccountProfile === 'function') {
    try {
      wx.openOfficialAccountProfile({ username, fail: fallback });
      // 成功仅代表打开主页，不伪造已关注状态。
      return;
    } catch (error) {
      return fallback();
    }
  }
  // #endif
  return fallback();
}
