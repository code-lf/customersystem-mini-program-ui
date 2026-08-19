import config from '../config/app';
import request from './request';
import mockRequest from '../mock';

/**
 * 统一 API 入口：Mock 和真实接口使用同一套业务 API 方法。
 */
export function apiCall({ method = 'GET', url, data = {}, options = {} }) {
  // 中文说明：
  // options.apiMode 用来支持“单条业务链路单独切换请求模式”。
  // 例如会员余额/提现页可以单独走真实接口，而其他页面仍然保留 mock。
  const requestMode = options.apiMode || config.apiMode;

  if (requestMode === 'mock') {
    return mockRequest({ method, url, data });
  }
  return request.send({ ...options, method, url, data });
}

export const apiGet = (url, data = {}, options = {}) => apiCall({ method: 'GET', url, data, options });
export const apiPost = (url, data = {}, options = {}) => apiCall({ method: 'POST', url, data, options });
export const apiPut = (url, data = {}, options = {}) => apiCall({ method: 'PUT', url, data, options });
export const apiDelete = (url, data = {}, options = {}) => apiCall({ method: 'DELETE', url, data, options });

export default {
  call: apiCall,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete
};
