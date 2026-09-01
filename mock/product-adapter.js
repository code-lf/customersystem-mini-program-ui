import productSource from '@/文档/商品目前数据.json';

/**
 * 商品适配层：原始 JSON 字段很多且部分字段为空，页面不直接依赖原始结构，
 * 统一从这里读取，后续接真实接口时只需要替换这一层。
 */

const DEFAULT_IMAGES = {
  central: 'http://gh.starall.cn/static/resource/aircon/central-default.png',
  home: 'http://gh.starall.cn/static/resource/aircon/home-green.png',
  other: 'http://gh.starall.cn/static/resource/aircon/central-default.png'
};

const EMPTY_VALUE = '暂无数据';

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function toText(value) {
  return value === undefined || value === null || value === '' ? '' : String(value);
}

/**
 * 只把空调类商品放入产品主流程，冰箱、电风扇等仍保留在 rawData 中。
 */
export function isAirConditioner(raw = {}) {
  const text = `${raw.category_name || ''} ${raw.goodsname || ''} ${raw.type || ''}`;
  if (/冰箱|风扇|净水|电视|电饭|加湿|饮水|洗衣|厨房|生活家电/.test(text)) return false;
  return /空调|GMV|KFR|MSZ|LF-|空气能/.test(text);
}

export function getProductType(raw = {}) {
  const text = `${raw.category_name || ''} ${raw.goodsname || ''} ${raw.type || ''}`;
  if (/中央|商用|多联|GMV|空气能/.test(text)) return 'central';
  if (/家用|壁挂|柜机|KFR|MSZ/.test(text)) return 'home';
  return 'other';
}

function getSeries(raw = {}) {
  const model = toText(raw.type || raw.goodsname);
  return model.split(/[\s-]/)[0] || toText(raw.category_name) || '空调产品';
}

function getDisplaySpecs(raw = {}) {
  const fields = [
    ['匹数', raw.pishu],
    ['能效', raw.nengxiao],
    ['适用面积', raw.mianji],
    ['制冷量', raw.zhileng],
    ['制热量', raw.zhire],
    ['制冷剂', raw.lengmei],
    ['电源规格', raw.guige],
    ['室内机尺寸', raw.in_size],
    ['室外机尺寸', raw.out_size],
    ['噪音', raw.fenbei]
  ];

  return fields.map(([label, value]) => ({
    label,
    value: toText(value) || EMPTY_VALUE
  }));
}

function getLocalImage(raw, productType) {
  // 原始 pics 是后端上传地址，当前 Mock 统一使用项目内素材，避免跨域和失效链接。
  const name = `${raw.goodsname || ''} ${raw.type || ''}`;
  if (productType === 'central') return 'http://gh.starall.cn/static/resource/aircon/central-default.png';
  if (/柜|立式|柜机/.test(name)) return 'http://gh.starall.cn/static/resource/aircon/home-cabinet.png';
  if (productType === 'home') return 'http://gh.starall.cn/static/resource/aircon/home-green.png';
  return DEFAULT_IMAGES[productType] || DEFAULT_IMAGES.other;
}

export function normalizeProduct(raw = {}) {
  const productType = getProductType(raw);
  const price = toNumber(raw.price);
  const cost = toNumber(raw.cost);

  return {
    id: raw.id,
    name: toText(raw.goodsname) || toText(raw.type) || '未命名商品',
    model: toText(raw.type) || toText(raw.goodsname) || EMPTY_VALUE,
    sku: toText(raw.sku),
    categoryId: raw.category,
    categoryName: toText(raw.category_name) || '未分类',
    productType,
    series: getSeries(raw),
    image: getLocalImage(raw, productType),
    tags: [raw.nengxiao, raw.lengnuan, raw.pishu].filter(Boolean),
    // price 是对外售价字段；为空时不能把成本误当成真实销售价。
    price,
    referencePrice: price,
    // Mock 报价计算允许临时使用成本作为演示基准，但页面会标注“演示价”。
    mockUnitPrice: price || cost || 0,
    priceLabel: price ? `¥${price.toLocaleString()}` : '价格待询',
    displaySpecs: getDisplaySpecs(raw),
    rawData: raw
  };
}

export function normalizeProducts(source = productSource) {
  const rows = Array.isArray(source) ? source : source.data || [];
  return rows.map(normalizeProduct);
}

export const rawProducts = Array.isArray(productSource) ? productSource : productSource.data || [];
export const allProducts = normalizeProducts(productSource);
export const airProducts = allProducts.filter((item) => isAirConditioner(item.rawData));

export function getProductById(id) {
  return airProducts.find((item) => String(item.id) === String(id));
}

export default {
  allProducts,
  airProducts,
  normalizeProduct,
  normalizeProducts,
  getProductById,
  isAirConditioner,
  getProductType
};
