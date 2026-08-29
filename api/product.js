import { apiGet } from '../utils/api';

/** 产品分类树 */
export function getProductCategories() {
  return apiGet('crm/quote/product/category/tree');
}

/** 产品列表 */
export function getProductList(params = {}) {
  return apiGet('crm/quote/product/goods', params);
}

/**
 * 产品详情。
 *
 * 中文说明：OpenAPI 中路径占位符叫 `goods_id`，实际 HTTP 地址仍然是
 * `/goods/438` 这种形式，不会把字符串 `{goods_id}` 原样发送给后端。
 * 这里把变量名改为 goodsId，避免以后误传分类 ID 或报价单明细 ID。
 */
export function getProductDetail(goodsId) {
  return apiGet(`crm/quote/product/goods/${goodsId}`);
}
