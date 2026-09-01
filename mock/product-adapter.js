import rawData from '../文档/商品目前数据.json';
import { uiProducts } from './ui-fixtures';

/**
 * 将原始商品数据标准化为系统统一模型
 */
export function normalizeProduct(item = {}) {
  if (!item) return null;

  const isHome = item.category_name && (
    item.category_name.includes('家用') ||
    item.category_name.includes('生活') ||
    item.category_name.includes('春兰') ||
    item.category_name.includes('冰箱') ||
    item.category_name.includes('风扇')
  );

  const price = Number(item.cost || item.price || item.chengbencost || 0);
  const defaultImg = isHome
    ? 'http://gh.starall.cn/static/resource/aircon/home-green.png'
    : 'http://gh.starall.cn/static/resource/aircon/outdoor-unit.png';

  const firstPic = item.pics ? item.pics.split('###')[0] : '';
  const image = firstPic
    ? (firstPic.startsWith('http') ? firstPic : `http://gh.starall.cn${firstPic}`)
    : defaultImg;

  const specs = [];
  if (item.pishu) specs.push(item.pishu);
  if (item.nengxiao) specs.push(`${item.nengxiao}能效`);
  if (item.db_type) specs.push(item.db_type);
  if (item.lengnuan) specs.push(item.lengnuan);
  if (specs.length === 0) {
    if (item.guige) specs.push(item.guige);
    else specs.push(item.unit ? `单位:${item.unit}` : '一级能效');
  }

  return {
    id: item.id,
    sku: item.sku || '',
    name: item.goodsname || item.name || '空调设备',
    model: item.type || item.model || item.yaohuoname || item.goodsname || '标准型号',
    image: item.image || image,
    price: item.price || price || (item.mockUnitPrice || 2980),
    mockUnitPrice: item.mockUnitPrice || price || 2980,
    cost: item.cost || item.chengbencost || price || 0,
    series: item.category_name || item.series || (isHome ? '家用空调' : '中央空调'),
    categoryName: item.category_name || item.categoryName || (isHome ? '家用空调' : '中央空调'),
    categoryId: item.category || item.categoryId || 0,
    productType: item.productType || (isHome ? 'home' : 'central'),
    tag: item.tag || (item.sales > 0 ? '热销' : ''),
    greenTag: item.greenTag || (item.nengxiao ? `${item.nengxiao}能效` : '一级能效'),
    specs: item.specs || specs,
    area: item.area || (item.mianji ? `${item.mianji}㎡` : (isHome ? '15-25㎡' : '80-120㎡')),
    unit: item.unit || '套',
    comment: item.comment || ''
  };
}

export function normalizeProducts(list = []) {
  return list.map(normalizeProduct).filter(Boolean);
}

// 组合原始数据与 UI Fixture 数据
const rawList = (rawData && Array.isArray(rawData.data)) ? rawData.data : [];
const normalizedRaw = normalizeProducts(rawList);

// 提取并去重
const combinedMap = new Map();

// 优先放入 UI 预置商品
uiProducts.forEach((p) => {
  combinedMap.set(String(p.id), normalizeProduct(p));
});

// 补充原始数据库商品
normalizedRaw.forEach((p) => {
  if (!combinedMap.has(String(p.id))) {
    combinedMap.set(String(p.id), p);
  }
});

export const allProducts = Array.from(combinedMap.values());
export const airProducts = allProducts;

export function getProductById(id) {
  if (!id) return null;
  const targetId = String(id);
  return combinedMap.get(targetId) || allProducts.find((p) => String(p.id) === targetId || String(p.sku) === targetId) || null;
}

export default {
  allProducts,
  airProducts,
  normalizeProduct,
  normalizeProducts,
  getProductById
};
