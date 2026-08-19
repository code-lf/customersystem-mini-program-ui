import { apiGet } from '../utils/api';

/** 产品分类 */
export function getProductCategories() {
  return apiGet('product/categories');
}

/** 产品列表，支持关键词、类型、系列和分页 */
export function getProductList(params = {}) {
  return apiGet('product/list', params);
}

/** 产品详情 */
export function getProductDetail(id) {
  return apiGet(`product/detail/${id}`);
}

/** 产品资料，真实接口接入时可直接映射后台文件接口 */
export function getProductMaterials(productId) {
  return apiGet('product/materials', { product_id: productId });
}
