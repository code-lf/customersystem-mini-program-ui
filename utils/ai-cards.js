// 百炼在普通回答末尾附加卡片数据；历史消息保存同一段文本，重新打开也能恢复卡片。
const CARD_BLOCK = /<gh_cards>\s*([\s\S]*?)\s*<\/gh_cards>/i;

const validId = (value) => /^\d+$/.test(String(value ?? '')) && Number(value) > 0;

/** 清除面向小程序的结构化片段，避免 JSON 出现在聊天气泡中。 */
export function parseAiCardText(value = '') {
  const source = String(value || '');
  const match = source.match(CARD_BLOCK);
  let cards = {};
  if (match) {
    try {
      cards = JSON.parse(match[1]);
    } catch (error) {
      // 非法片段不生成卡片；正文仍保持可读，不执行模型输出中的任何指令。
      console.warn('[AI卡片] 结构化片段解析失败：', error);
    }
  }
  const markerStart = source.search(/<gh_cards>/i);
  // 流式输出中标签尚未闭合时也先截掉尾部，避免短暂露出原始 JSON。
  const partialStart = markerStart >= 0 ? markerStart : source.search(/<gh_cards?[^>]*$/i);
  const text = (partialStart >= 0 ? source.slice(0, partialStart) : source).trim();
  return { text, cards };
}

/** 只接受接口或模型返回的真实数字 ID，禁止把虚构链接渲染成可点击卡片。 */
export function normalizeAiCards(data = {}) {
  const products = (Array.isArray(data.products) ? data.products : [])
    .filter((item) => validId(item?.goods_id ?? item?.id))
    .map((item) => ({
      id: Number(item.goods_id ?? item.id),
      goods_id: Number(item.goods_id ?? item.id),
      name: String(item.goods_name || item.name || '商品'),
      model: String(item.model || ''),
      image: String(item.image || ''),
      // 未返回价格时不显示 0 元，避免把缺失值误当成真实报价。
      price: item.price == null || item.price === '' ? null : Number(item.price),
      series: String(item.category_name || item.series || ''),
      specs: Array.isArray(item.specs) ? item.specs : (item.spec ? [String(item.spec)] : []),
      area: String(item.area || ''),
      materials_total: Number(item.materials_total || 0)
    }));
  const rawQuotes = Array.isArray(data.quotes) ? [...data.quotes] : [];
  if (validId(data.quote_id) && !rawQuotes.some((item) => String(item?.quote_id) === String(data.quote_id))) {
    rawQuotes.unshift({ quote_id: data.quote_id, quote_no: data.quote_no, pay_amount: data.pay_amount });
  }
  const quotes = rawQuotes.filter((item) => validId(item?.quote_id)).map((item) => ({
    quote_id: Number(item.quote_id),
    quote_no: String(item.quote_no || ''),
    pay_amount: item.pay_amount == null ? null : Number(item.pay_amount),
    quote_status: String(item.quote_status || ''),
    item_count: Number(item.item_count || 0)
  }));
  // 商品详情接口的 materials 按分类分组，AI 片段则是扁平数组；两种形状统一展开。
  const materialsSource = (Array.isArray(data.materials) ? data.materials : []).flatMap((group) =>
    Array.isArray(group?.items)
      ? group.items.map((item) => ({ ...item, goods_id: item.goods_id || data.goods_id, category_name: group.category_name }))
      : [{ ...group, goods_id: group?.goods_id || data.goods_id }]
  );
  const materials = materialsSource
    .filter((item) => validId(item?.goods_id) && (item?.title || item?.category_name))
    .map((item) => ({
      id: validId(item.id) ? Number(item.id) : null,
      goods_id: Number(item.goods_id),
      title: String(item.title || item.category_name),
      category_name: String(item.category_name || '')
    }));
  return { products, quotes, materials };
}

/** 合并后端结构化字段与回答尾部卡片数据，优先采用后端提供的字段。 */
export function resolveAiCards(answer, data = {}) {
  const parsed = parseAiCardText(answer);
  const marker = parsed.cards || {};
  const cards = normalizeAiCards({
    products: Array.isArray(data.products) && data.products.length ? data.products : marker.products,
    quotes: Array.isArray(data.quotes) && data.quotes.length ? data.quotes : marker.quotes,
    materials: Array.isArray(data.materials) && data.materials.length ? data.materials : marker.materials,
    goods_id: data.goods_id || marker.goods_id,
    quote_id: data.quote_id || marker.quote_id,
    quote_no: data.quote_no || marker.quote_no,
    pay_amount: data.pay_amount ?? marker.pay_amount
  });
  return { text: parsed.text, ...cards };
}
