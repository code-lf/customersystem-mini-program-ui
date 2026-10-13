/** 商品或其任一祖先分类禁用报价折扣时，后端会返回 0。旧接口缺少字段时维持原有折扣行为。 */
export function isQuoteDiscountExcluded(item) {
  const flag = item?.quote_discount_enabled ?? item?.goods?.quote_discount_enabled;
  return flag === 0 || flag === '0';
}

/** 仅用于接口返回前的本地金额预览；正式报价金额仍以服务端核价为准。 */
export function calculateQuotePreview(items = [], rate = 100) {
  const discountRate = Number(rate);
  const safeRate = Number.isFinite(discountRate) ? Math.max(0, Math.min(100, discountRate)) : 100;
  let goodsAmount = 0;
  let discountableAmount = 0;
  let totalQuantity = 0;

  for (const item of items) {
    const price = Number(item.price || item.origin_price || item.quote_price || 0);
    const quantity = Number(item.quantity || 1);
    const lineAmount = price * quantity;
    goodsAmount += lineAmount;
    totalQuantity += quantity;
    if (!isQuoteDiscountExcluded(item)) discountableAmount += lineAmount;
  }

  const discountAmount = Math.round(discountableAmount * (100 - safeRate)) / 100;
  return {
    goods_amount: Math.round(goodsAmount * 100) / 100,
    total_quantity: totalQuantity,
    pay_amount: Math.round((goodsAmount - discountAmount) * 100) / 100,
    discount_amount: discountAmount
  };
}
