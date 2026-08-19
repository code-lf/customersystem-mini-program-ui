import config from '../config/app';
import { useUserStore } from '../store/user';
import store from '../store';
import { getCurrentRoute, reLaunch } from './navigation';

/**
 * 请求异常类。
 * 统一错误结构后，页面可以通过 error.statusCode、error.businessCode 和 error.data
 * 精确判断错误来源，而不是只能依赖一段提示文本。
 */
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

  // 中文说明：
  // 这里允许单次请求传入自定义 baseUrl。
  // 这样会员余额/提现可以单独走 niucloud 真实后台，其他页面继续使用当前全局配置。
  const baseUrl = String(customBaseUrl || config.baseUrl || '').replace(/\/$/, '');
  const path = String(url).replace(/^\//, '');
  return baseUrl ? `${baseUrl}/${path}` : `/${path}`;
}

function getPath(url) {
  try {
    // URL 在部分小程序环境不可用，所以这里只做轻量字符串处理。
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
    // 上传接口有时返回普通文本，解析失败时保留原始内容。
    return data;
  }
}

function showError(message) {
  if (!message || typeof uni === 'undefined' || !uni.showToast) return;
  uni.showToast({
    // 小程序 toast 对标题长度有限制，统一截取避免超长提示影响展示。
    title: String(message).slice(0, 80),
    icon: 'none'
  });
}

function getUserStore() {
  // 显式传入 Pinia 实例，保证在 API 文件、定时器等组件外部调用时也能正常获取 Store。
  return useUserStore(store);
}

function getHeader(options) {
  const header = {
    'Content-Type': 'application/json',
    'source-client': config.clientType,
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

  // 模板不默认创建登录页，所以只有明确开启后才自动跳转。
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
  const successCodes = responseConfig.successCodes || [0, 200];
  const statusSuccess = statusCode >= 200 && statusCode < 300;
  const businessSuccess = !hasBusinessCode || successCodes.some((code) => String(code) === String(businessCode));

  if (statusSuccess && businessSuccess) {
    // 有标准响应包装时只返回 data，普通接口则原样返回响应体。
    return hasBusinessCode && body && Object.prototype.hasOwnProperty.call(body, dataField)
      ? body[dataField]
      : body;
  }

  if (statusCode === 401 || String(businessCode) === '401') {
    return handleUnauthorized(options, body, statusCode, businessCode);
  }

  const message = body && typeof body === 'object'
    ? body[messageField] || body.message
    : '';
  if (options.showError !== false && config.showRequestError) {
    showError(options.errorMessage || message || '请求失败');
  }

  throw new RequestError(options.errorMessage || message || '请求失败', {
    statusCode,
    businessCode,
    data: body
  });
}

/**
 * 发起普通请求。
 * @param {object} options uni.request 参数
 * @returns {Promise<*>} 默认返回后端 data 字段
 */
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

/**
 * 上传文件。与普通请求保持相同的鉴权、错误处理和返回值结构。
 */
async function upload(options = {}) {
  const preparedOptions = prepareOptions(options);
  const uploadHeader = { ...(preparedOptions.header || {}) };
  // uploadFile 会自行生成 multipart boundary，不能强制使用 application/json。
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
