import { apiGet, apiPost } from '../utils/api';
import { getMemberInfo } from './member';

/**
 * 账号密码登录
 * 严格按照 niucloud-admin 开源规范，请求 /login 获取 token 与登录凭证
 * @param {Object} data { username, password, captcha_key, captcha_code }
 */
export async function login(data = {}) {
  const username = String(data.username || data.account || data.mobile || '').trim();
  const password = String(data.password || '').trim();

  // 首先使用标准 GET /login 登录
  try {
    const res = await apiGet('login', {
      username,
      password,
      captcha_key: data.captcha_key,
      captcha_code: data.captcha_code
    });
    return res;
  } catch (err) {
    // 兼容 POST /login
    return apiPost('login', {
      username,
      password,
      captcha_key: data.captcha_key,
      captcha_code: data.captcha_code
    });
  }
}

/**
 * 手机号快捷登录 / 注册
 * @param {Object} data { mobile, code, password }
 */
export function mobileLogin(data = {}) {
  return apiPost('login/mobile', data);
}

/**
 * 微信小程序一键登录 / 注册
 * @param {Object} data { code, mobile_code }
 */
export function weappLogin(data = {}) {
  return apiPost('weapp/login', data);
}

/**
 * 注册普通会员
 * @param {Object} data { username, password, mobile, code }
 */
export function register(data = {}) {
  return apiPost('register', data);
}

/**
 * 发送短信验证码
 * @param {Object} data { mobile, type }
 */
export function sendMobileCode(data = {}) {
  return apiPost('send/mobile_code', data);
}

/**
 * 获取图形验证码
 */
export function getCaptcha() {
  return apiGet('captcha');
}

/**
 * 退出登录
 */
export function logout() {
  return apiPost('logout');
}


