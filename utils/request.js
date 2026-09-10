import config from '../config/app';
import { useUserStore } from '../store/user';
import store from '../store';
import { getCurrentRoute, reLaunch } from './navigation';

export class RequestError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'RequestError';
    this.statusCode = options.statusCode || 0;
    this.businessCode = options.businessCode;
    this.data = options.data;
  }
}

function resolveUrl(url, customBaseUrl = '') {
  if (!url) return config.baseUrl || '';
  if (/^(https?:)?\/\//i.test(url)) return url;
  const baseUrl = String(customBaseUrl || config.baseUrl || '').replace(/\/$/, '');
  const path = String(url).replace(/^\//, '');
  return baseUrl ? `${baseUrl}/${path}` : `/${path}`;
}

function getPath(url) {
  try {
    return String(url).split('?')[0].replace(/^https?:\/\/[^/]+/i, '') || '/';
  } catch (error) {
    return String(url || '');
  }
}

function isWhiteListed(url) {
  const path = getPath(url);
  return (config.auth.whiteList || []).some((item) => {
    const rule = String(item).replace(/\/$/, '');
    return path === rule || path.startsWith(`${rule}/`);
  });
}

function parseResponseData(data) {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch (error) {
    return data;
  }
}

function showError(message) {
  if (!message || typeof uni === 'undefined' || !uni.showToast) return;
  uni.showToast({
    title: String(message).slice(0, 80),
    icon: 'none'
  });
}

function getUserStore() {
  return useUserStore(store);
}

function getHeader(options) {
  const header = {
    'Content-Type': 'application/json',
    'channel': config.clientType,
    ...(options.header || {})
  };
  const userStore = getUserStore();
  if (userStore.token && !isWhiteListed(options.url)) {
    header[config.auth.headerName] = `${config.auth.tokenPrefix || ''}${userStore.token}`;
  }
  return header;
}

function prepareOptions(options = {}) {
  const url = resolveUrl(options.url, options.baseUrl);
  return {
    ...options,
    url,
    timeout: options.timeout || config.timeout,
    header: getHeader({ ...options, url })
  };
}

function rawRequest(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      withCredentials: false,
      ...options,
      success: resolve,
      fail: reject
    });
  });
}

function handleUnauthorized(options, body, statusCode, businessCode) {
  const userStore = getUserStore();
  userStore.logout();
  if (options.showError !== false && config.showRequestError) {
    showError('登录已过期，请重新登录');
  }
  if (
    config.auth.autoRedirect &&
    config.auth.loginPath &&
    getCurrentRoute() !== config.auth.loginPath
  ) {
    reLaunch(config.auth.loginPath).catch(() => {});
  }
  throw new RequestError('登录已过期', {
    statusCode,
    businessCode,
    data: body
  });
}

function handleResponse(response, options = {}) {
  const body = parseResponseData(response.data);
  const statusCode = response.statusCode || 0;
  const responseConfig = config.response || {};
  const codeField = responseConfig.codeField || 'code';
  const dataField = responseConfig.dataField || 'data';
  const messageField = responseConfig.messageField || 'msg';

  const businessCode = body && typeof body === 'object' ? body[codeField] : undefined;
  const hasBusinessCode = businessCode !== undefined && businessCode !== null;
  const successCodes = responseConfig.successCodes || [1, 200];

  const statusSuccess = statusCode >= 200 && statusCode < 300;
  const businessSuccess = !hasBusinessCode || successCodes.some((code) => String(code) === String(businessCode));

  if (statusSuccess && businessSuccess) {
    return hasBusinessCode && body && Object.prototype.hasOwnProperty.call(body, dataField)
      ? body[dataField]
      : body;
  }

  const message = body && typeof body === 'object'
    ? body[messageField] || body.message
    : '';

  const isAuthError = statusCode === 401 ||
    String(businessCode) === '401' ||
    (typeof message === 'string' && (
      message.includes('请先登录') ||
      message.includes('登录已过期') ||
      message.includes('登录已失效') ||
      message.includes('未登录')
    ));

  if (isAuthError) {
    return handleUnauthorized(options, body, statusCode, businessCode);
  }

  let finalErrorMsg = message || options.errorMessage || '请求失败';
  
  if (options.showError !== false && config.showRequestError) {
    showError(finalErrorMsg);
  }

  throw new RequestError(finalErrorMsg, {
    statusCode,
    businessCode,
    data: body
  });
}

async function send(options = {}) {
  const preparedOptions = prepareOptions(options);
  try {
    const response = await rawRequest(preparedOptions);
    return handleResponse(response, preparedOptions);
  } catch (error) {
    if (error instanceof RequestError) throw error;
    if (preparedOptions.showError !== false && config.showRequestError) {
      showError(preparedOptions.errorMessage || '网络错误，请稍后重试');
    }
    throw new RequestError(preparedOptions.errorMessage || '网络错误，请稍后重试', {
      data: error
    });
  }
}

async function upload(options = {}) {
  const preparedOptions = prepareOptions(options);
  const uploadHeader = { ...(preparedOptions.header || {}) };
  delete uploadHeader['Content-Type'];
  delete uploadHeader['content-type'];

  try {
    const response = await new Promise((resolve, reject) => {
      uni.uploadFile({
        ...preparedOptions,
        header: uploadHeader,
        success: resolve,
        fail: reject
      });
    });
    return handleResponse({ ...response, data: parseResponseData(response.data) }, preparedOptions);
  } catch (error) {
    if (error instanceof RequestError) throw error;
    if (preparedOptions.showError !== false && config.showRequestError) {
      showError(preparedOptions.errorMessage || '文件上传失败');
    }
    throw new RequestError(preparedOptions.errorMessage || '文件上传失败', { data: error });
  }
}

const request = {
  send,
  upload,
  get: (url, data = {}, options = {}) => send({ ...options, url, data, method: 'GET' }),
  post: (url, data = {}, options = {}) => send({ ...options, url, data, method: 'POST' }),
  put: (url, data = {}, options = {}) => send({ ...options, url, data, method: 'PUT' }),
  delete: (url, data = {}, options = {}) => send({ ...options, url, data, method: 'DELETE' })
};

export default request;
