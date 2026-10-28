/** 按真实品牌快照分组；缺少品牌时使用中性标题，不把商品分类误当品牌或硬编码格力。 */
export function groupQuoteItems(items) {
  const groups = new Map();
  for (const item of items) {
    const name = String(item.brand_name_snapshot || item.brand_name || item.goods?.brand_name || '').trim() || '商品明细';
    if (!groups.has(name)) groups.set(name, { name, items: [], total: 0 });
    const group = groups.get(name);
    group.items.push(item);
    // 优先使用后端折后行金额，仅兼容旧草稿的单价乘数量。
    group.total += Number(item.line_amount ?? (Number(item.quote_price ?? item.unitPrice ?? item.price ?? 0) * Number(item.quantity ?? 1)));
  }
  return [...groups.values()];
}
