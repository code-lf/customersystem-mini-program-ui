/**
 * 本地缓存键名统一管理。
 *
 * 统一键名可以避免业务页面到处手写字符串，也便于未来修改缓存结构或做版本迁移。
 */
export const STORAGE_KEYS = Object.freeze({
  // 沿用 niucloud 的本地 Token 字段，方便以后直接接入真实后台。
  token: 'wapToken',
  userInfo: 'wap_member_info',
  appConfig: 'appConfig'
});

export default STORAGE_KEYS;
