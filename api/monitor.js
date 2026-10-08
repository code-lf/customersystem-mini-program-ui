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

/** 按商品 ID 新增或更新价格监控；后端会处理重复关注。 */
export function watchMonitorGoods(goodsId) {
  const id = Number(goodsId);
  if (!Number.isInteger(id) || id <= 0) {
    return Promise.reject(new Error('商品ID无效，无法开启价格监控'));
  }
  // 接口要求 watch_targets 数组，商品监控必须显式传 goods 类型和真实商品 ID。
  return apiPost('crm/price-monitor/watch', {
    watch_targets: [{ watch_target_type: 'goods', watch_target_value: id }]
  });
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

/** 我关注商品的近期降价事件，返回 PriceChange 分页数据。 */
export function getRecentPriceDrops(params = {}) {
  return apiGet('crm/price-monitor/recent-drops', params);
}

/** 我关注商品的全部价格波动事件，包含上涨与下降。 */
export function getPriceFluctuations(params = {}) {
  return apiGet('crm/price-monitor/fluctuations', params);
}
