import request from '../utils/request';
import pollUntil from '../utils/polling';

/**
 * 上传文件示例。
 * 新项目只需要替换 url，页面侧继续传 filePath 即可复用。
 */
export function uploadFile(filePath, name = 'file', options = {}) {
  return request.upload({
    ...options,
    url: '/common/upload',
    filePath,
    name
  });
}

/**
 * 创建支付订单示例。
 */
export function createPayment(data) {
  return request.post('/payment/create', data);
}

/**
 * 查询支付状态示例。
 */
export function getPaymentStatus(orderId) {
  return request.get(`/payment/status/${orderId}`);
}

function requestPayment(payParams) {
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      ...payParams,
      success: resolve,
      fail: reject
    });
  });
}

/**
 * 发起支付并轮询支付状态。
 * 通用轮询逻辑位于 utils/polling.js，其他异步任务也可以直接复用。
 */
export async function handlePaymentWithPolling(payParams, orderId) {
  await requestPayment(payParams);
  uni.showLoading({ title: '正在确认支付结果...' });

  try {
    const result = await pollUntil({
      request: () => getPaymentStatus(orderId),
      validate: (response) => response && response.status === 'SUCCESS',
      interval: 2000,
      timeout: 30000,
      // 临时网络错误时继续查询，避免用户已付款但网络抖动导致流程直接失败。
      continueOnError: true
    });

    uni.showToast({ title: '支付成功', icon: 'success' });
    return result;
  } finally {
    uni.hideLoading();
  }
}
