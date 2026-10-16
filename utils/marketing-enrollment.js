/** 旧活动未配置每组数量时按接口约定显示为 1，不参与客户端计价。 */
export const getCampaignGroupQuantity = (item = {}) => {
  const quantity = Number(item.group_quantity);
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1;
};

/** 只允许选择启用且具有有效活动商品 ID 的商品，商品 goods_id 不能用于报名。 */
export const getSelectableCampaignItems = (items = []) => (Array.isArray(items) ? items : []).filter((item) => {
  const id = Number(item?.item_id);
  return Number.isSafeInteger(id) && id > 0 && (item.item_status == null || Number(item.item_status) === 1);
});

/** 整套购买：所有启用商品使用同一套数，后台配置的每套件数和价格不允许拆改。 */
export const buildCampaignEnrollmentItems = (campaignItems, packageCount) => {
  const text = String(packageCount ?? '').trim();
  const count = Number(text);
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(count) || count < 1) {
    throw new Error('购买套数请填写大于或等于 1 的整数');
  }
  const selected = [];
  const seen = new Set();
  for (const item of getSelectableCampaignItems(campaignItems)) {
    const id = Number(item.item_id);
    if (seen.has(id)) throw new Error('活动商品重复，请刷新活动后重试');
    seen.add(id);
    selected.push({ campaign_item_id: id, group_count: count });
  }
  if (!selected.length) throw new Error('当前套餐暂无可报名商品');
  return selected;
};
