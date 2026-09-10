import { apiGet } from '../utils/api';

/**
 * 后台定死的三大核心商品分类及子分类 ID
 * 1. 格力中央空调 (ID: 58)
 * 2. 格力生活电器 (ID: 87)
 * 3. 分体式空调 (ID: 86)
 */
export const CATEGORY_IDS = {
  // 三大根分类
  CENTRAL: 58,           // 格力中央空调
  APPLIANCE: 87,         // 格力生活电器
  SPLIT: 86,             // 分体式空调
  HOME: 86,              // 兼容历史调用

  // 1. 格力中央空调核心二级分类
  CENTRAL_HOME_MULTI: 14, // 家用中央空调 (包含颐居60、star62、雅居61、星悦119等三级)
  CENTRAL_DUCT: 51,       // 一拖一风管机 (包含K+Pro66、F系列65、领风67等三级)
  CENTRAL_COMMERCIAL: 18, // 商用中央空调
  CENTRAL_ACCESSORY: 115, // 线控器辅件

  // 2. 格力生活电器核心二级分类
  APPLIANCE_AIR_ENERGY: 63,      // 格力空气能 (包含家用空气能55、商用空气能56等三级)
  APPLIANCE_REFRIGERATOR: 107,   // 格力冰箱
  APPLIANCE_WASHING: 108,        // 格力洗衣机
  APPLIANCE_WATER_PURIFIER: 109, // 格力净水

  // 3. 分体式空调核心二级分类
  HOME_WALL_1P: 69,       // 1匹挂机 (包含格力77、美的78、奥克斯79等三级品牌)
  HOME_WALL_1_5P: 70,     // 1.5匹挂机 (包含格力80、美的81、海信82、奥克斯83等三级品牌)
  HOME_WALL_2P: 71,       // 2匹挂机 (包含格力84、美的98、奥克斯112等三级品牌)
  HOME_CABINET_2P: 95,    // 2匹柜机 (包含格力99、美的100、奥克斯111等三级品牌)
  HOME_WALL_3P: 96,       // 3匹挂机 (包含格力97等三级品牌)
  HOME_CABINET_3P: 72,    // 3匹柜机 (包含格力85、美的92、海信93、奥克斯94等三级品牌)
  HOME_CABINET_4P: 73,    // 4匹柜机 (包含格力88等三级品牌)
  HOME_CABINET_5P: 74,    // 5匹柜机 (包含格力89、美的113、奥克斯114等三级品牌)
  HOME_CABINET_7P: 75,    // 7匹柜机 (包含格力90等三级品牌)
  HOME_CABINET_10P: 76,   // 10匹柜机 (包含格力91、美的110等三级品牌)
  HOME_CEILING: 101,      // 天井机 (包含格力103、奥克斯104、美的105等三级品牌)
  HOME_EXPLOSION_PROOF: 102 // 防爆空调 (包含格力原装106等三级品牌)
};

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
