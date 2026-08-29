import { login as authLogin } from './auth';
import { getMemberInfo } from './member';

/**
 * 登录
 * @param {object} data 
 */
export function login(data) {
  return authLogin(data);
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return getMemberInfo();
}
 