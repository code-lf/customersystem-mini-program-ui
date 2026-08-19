import { apiGet, apiPost } from '../utils/api';

export function getMonitorList(params = {}) {
  return apiGet('monitor/list', params);
}

export function toggleMonitor(productId) {
  return apiPost(`monitor/toggle/${productId}`);
}

export function getMonitorHistory(productId) {
  return apiGet(`monitor/history/${productId}`);
}
