import { apiGet, apiPost } from '../utils/api';

export function createPayment(data = {}) {
  return apiPost('pay', data);
}

export function getPaymentInfo(tradeType, tradeId, params = {}) {
  return apiGet(`pay/info/${tradeType}/${tradeId}`, params);
}
