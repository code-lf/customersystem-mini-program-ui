import { apiGet } from '../utils/api';

/** 产品分类树 */
export function getProductCategories() {
  return apiGet('crm/quote/product/category/tree');
}

/** 产品列表 */
export function getProductList(params = {}) {
  return apiGet('crm/quote/product/goods', params);
}

/** 产品详情 */
export function getProductDetail(id) {
  return apiGet(`crm/quote/product/goods/${id}`);
}
