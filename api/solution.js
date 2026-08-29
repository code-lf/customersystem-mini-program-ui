import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import appConfig from '../config/app';

/**
 * 当前报价单暂存清单。
 *
 * 中文说明：统一请求层会自动剥离后端的 `{ code, msg, data }` 外包装，
 * 因此调用方拿到的就是 OpenAPI 中的 Cart 对象，不能再读取 `res.data`。
 */
export function getCart() {
  return apiGet('crm/quote/cart');
}

/** 清空报价单暂存清单。 */
export function clearCart() {
  return apiDelete('crm/quote/cart');
}

/**
 * 单个商品加入报价单暂存清单。
 * data 对应 OpenAPI 的 CartItemInput，至少需要传 `goods_id`；
 * quantity、box_quantity、carton_quantity、discount_rate、quote_price、remark 均为可选字段。
 */
export function addCartItem(data) {
  return apiPost('crm/quote/cart/item', data);
}

/** 批量加入报价单暂存清单。 */
export function addCartItems(data) {
  return apiPost('crm/quote/cart/items', data);
}

/**
 * 编辑报价单中的商品。
 * 注意路径参数是报价单暂存明细 ID `cart_item_id`，不是商品 ID `goods_id`。
 */
export function editCartItem(cartItemId, data) {
  return apiPut(`crm/quote/cart/item/${cartItemId}`, data);
}

/** 删除报价单商品；路径参数同样必须使用 cart_item_id。 */
export function removeCartItem(cartItemId) {
  return apiDelete(`crm/quote/cart/item/${cartItemId}`);
}

/** 设置报价单折扣。 */
export function setCartDiscount(data) {
  return apiPut('crm/quote/cart/discount', data);
}

/**
 * 把报价单暂存清单生成为正式报价单。
 * 成功时直接返回 `{ quote_id, quote_no, pay_amount }`，外层 code/data 已由请求层剥离。
 */
export function exportCart(data) {
  return apiPost('crm/quote/cart/export', data);
}

/**
 * 直接创建报价单。
 * data 必须符合 QuoteCreateInput，其中 `items` 至少一项，且每项必须有 `goods_id`。
 */
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

/** 删除历史报价单 */
export function deleteQuote(id) {
  return apiDelete(`crm/quote/${id}`);
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

/**
 * 旧版 Mock 页面专用接口。
 * `/solution/save` 不在当前后端 OpenAPI 中，真实 API 模式不得调用；
 * 保留该函数仅为了兼容尚未清理的纯 Mock 页面，后续应随旧页面一起删除。
 */
export function saveSolution(data) {
  if (appConfig.apiMode !== 'mock') {
    return Promise.reject(new Error('当前后端 OpenAPI 不存在 /solution/save，请先添加商品并生成报价单，或使用 POST /crm/quote'));
  }
  return data.id ? apiPut('solution/save', data) : apiPost('solution/save', data);
}

export function shareSolution(id) {
  if (appConfig.apiMode !== 'mock') {
    return Promise.reject(new Error('当前后端 OpenAPI 不存在 /solution/share/{id}，请使用报价单发送或分享 Token 接口'));
  }
  return apiPost(`solution/share/${id}`);
}
