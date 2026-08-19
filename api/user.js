import request from '../utils/request';

/**
 * 登录
 * @param {object} data 
 */
export function login(data) {
  return request.send({
    url: '/login',
    method: 'POST',
    data,
  });
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request.send({
    url: '/user/info',
    method: 'GET',
  });
} 