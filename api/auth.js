import { apiGet, apiPost } from '../utils/api';

// 登录相关请求始终使用真实接口；错误由页面统一提示，不返回模拟凭证。
const authOptions = { apiMode: 'api', showError: false };

/**
 * 账号密码登录
 * 严格按照 niucloud-admin 开源规范，请求 /login 获取 token 与登录凭证
 * @param {Object} data { username, password, captcha_key, captcha_code }
 */
export async function login(data = {}) {
  const username = String(data.username || data.account || data.mobile || '').trim();
  const password = String(data.password || '');

  // 后端规范：使用 GET /login 携带账号密码登录
  return apiGet('login', {
    username,
    password,
    captcha_key: data.captcha_key,
    captcha_code: data.captcha_code
  }, authOptions);
}

/**
 * 手机号快捷登录 / 注册
 * @param {Object} data { mobile, mobile_code, mobile_key }
 */
export function mobileLogin(data = {}) {
  return apiPost('login/mobile', {
    mobile: data.mobile,
    mobile_code: data.mobile_code,
    mobile_key: data.mobile_key
  }, authOptions);
}

/**
 * 微信小程序一键登录 / 注册
 * @param {Object} data { code, mobile_code }
 */
export function weappLogin(data = {}) {
  return apiPost('weapp/login', data, authOptions);
}

/**
 * 注册普通会员
 * @param {Object} data { username, password, mobile, code }
 */
export function register(data = {}) {
  return apiPost('register', data, authOptions);
}

/**
 * 发送短信验证码
 * @param {Object} data { mobile, type }
 */
export function sendMobileCode(data = {}) {
  // niucloud 以路径区分短信场景，图形验证码随请求提交，成功返回短信凭证 key。
  const { type = 'login', ...payload } = data;
  return apiPost(`send/mobile/${encodeURIComponent(type)}`, payload, authOptions);
}

/**
 * 获取图形验证码
 */
export function getCaptcha() {
  return apiGet('captcha', {}, authOptions);
}

/** 读取后台实际开放的登录方式，不在前端伪造已开启的手机号登录。 */
export function getLoginConfig() {
  return apiGet('login/config', {}, authOptions);
}

/**
 * 退出登录
 */
export function logout() {
  return apiPost('logout');
}


