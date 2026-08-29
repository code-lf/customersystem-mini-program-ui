import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

/** 当前报价篮 */
export function getCart() {
  return apiGet('crm/quote/cart');
}

/** 清空报价篮 */
export function clearCart() {
  return apiDelete('crm/quote/cart');
}

/** 单个商品加入报价篮 */
export function addCartItem(data) {
  return apiPost('crm/quote/cart/item', data);
}

/** 批量加入报价篮 */
export function addCartItems(data) {
  return apiPost('crm/quote/cart/items', data);
}

/** 编辑报价篮商品 */
export function editCartItem(id, data) {
  return apiPut(`crm/quote/cart/item/${id}`, data);
}

/** 删除报价篮商品 */
export function removeCartItem(id) {
  return apiDelete(`crm/quote/cart/item/${id}`);
}

/** 设置报价篮折扣 */
export function setCartDiscount(data) {
  return apiPut('crm/quote/cart/discount', data);
}

/** 报价篮生成报价单 */
export function exportCart(data) {
  return apiPost('crm/quote/cart/export', data);
}

/** 直接创建报价单 */
export function createQuote(data) {
  return apiPost('crm/quote', data);
}

/** 我的报价列表 */
export function getSolutionList(params = {}) {
  return apiGet('crm/quote/lists', params);
}

/** 我的报价详情 */
export function getSolutionDetail(id) {
  return apiGet(`crm/quote/${id}`);
}

/** 发送报价 */
export function sendQuote(id) {
  return apiPut(`crm/quote/${id}/send`);
}

/** 分享报价详情 */
export function getShareQuote(token) {
  return apiGet(`crm/quote/share/${token}`);
}

/** 当前会员绑定经销商 */
export function getMyDealer() {
  return apiGet('crm/quote/dealer/me');
}

/** 兼容旧版页面调用的 API，如果页面还没改造完的话 */
export function saveSolution(data) {
  return data.id ? apiPut('solution/save', data) : apiPost('solution/save', data);
}

export function shareSolution(id) {
  return apiPost(`solution/share/${id}`);
}
