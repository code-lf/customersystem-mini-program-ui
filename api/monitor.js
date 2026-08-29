import { apiGet, apiPost, apiPut } from '../utils/api';

/** 价格监控分类树 */
export function getMonitorCategories() {
  return apiGet('crm/price-monitor/categories');
}

/** 价格监控商品列表 */
export function getMonitorGoods(params = {}) {
  return apiGet('crm/price-monitor/goods', params);
}

/** 我的价格关注列表 */
export function getMonitorList(params = {}) {
  return apiGet('crm/price-monitor/watches', params);
}

/** 新增或更新价格关注 */
export function toggleMonitor(data) {
  // data should be { watch_targets: [...] }
  return apiPost('crm/price-monitor/watch', data);
}

/** 暂停关注 */
export function pauseMonitor(id) {
  return apiPut(`crm/price-monitor/watch/${id}/pause`);
}

/** 恢复关注 */
export function resumeMonitor(id) {
  return apiPut(`crm/price-monitor/watch/${id}/resume`);
}

/** 取消关注 */
export function cancelMonitor(id) {
  return apiPut(`crm/price-monitor/watch/${id}/cancel`);
}
