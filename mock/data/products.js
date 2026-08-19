// 商品数据统一从原始 JSON 适配而来，避免在多个文件复制同一份商品记录。
export { allProducts, airProducts, normalizeProduct, normalizeProducts } from '../product-adapter';
