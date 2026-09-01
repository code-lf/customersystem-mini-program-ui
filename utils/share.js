/**
 * 小程序分享公共配置。
 *
 * 注意：分享生命周期必须直接写在各页面的 <script setup> 中，uni-app 编译器
 * 才能识别并生成微信页面方法。因此这里仅封装分享参数和显示菜单的通用逻辑。
 */
export const HOME_PAGE_ROUTE = '/pages/index/index';
export const DEFAULT_SHARE_TITLE = '格宏助手｜智能选型与报价平台';

/**
 * 生成“发送给朋友”的参数，统一落到公共首页，避免携带账户或报价单私有状态。
 *
 * @param {string} title 分享卡片标题
 * @param {string} imageUrl 可选的 5:4 分享封面；留空时由微信自动生成
 */
export const createShareAppMessageOptions = (title = DEFAULT_SHARE_TITLE, imageUrl = '') => {
  const options = { title, path: HOME_PAGE_ROUTE };
  if (imageUrl) options.imageUrl = imageUrl;
  return options;
};

/** 生成朋友圈分享参数，不附带任何用户查询参数。 */
export const createShareTimelineOptions = (title = DEFAULT_SHARE_TITLE, imageUrl = '') => {
  const options = { title, query: '' };
  if (imageUrl) options.imageUrl = imageUrl;
  return options;
};

/** 显式显示微信的“发送给朋友”和“分享到朋友圈”菜单。 */
export const showMiniProgramShareMenu = () => {
  // #ifdef MP-WEIXIN
  if (typeof uni.showShareMenu === 'function') {
    uni.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  }
  // #endif
};
