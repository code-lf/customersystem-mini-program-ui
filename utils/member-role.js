/** 兼容接口中的数字、字符串和布尔开关。 */
export const isDealerFlag = (value) => value === true || value === 1 || value === '1' || value === 'true';

/** 当前会员关联的启用后台管理员统一作为业务员，不依赖后台角色名称。 */
export const isSalespersonAccount = (member = {}) => {
  const account = member?.admin_account;
  const uid = Number(account?.uid);
  return Number.isSafeInteger(uid) && uid > 0 && isDealerFlag(account?.status);
};

/** 报价、特惠货源、价格监控等业务功能同时向经销商和业务员开放。 */
export const canUseBusinessFeatures = (member = {}) => {
  // 新协议明确给出权限时只认布尔值；旧接口无此字段时维持原身份兼容。
  if (Object.prototype.hasOwnProperty.call(member, 'can_use_dealer_features')) return member.can_use_dealer_features === true;
  return isSalespersonAccount(member) || isDealerFlag(member?.is_dealer);
};

/** 业务员身份优先展示；经销商仍显示接口返回的价格等级。 */
export const resolveMemberRole = (member = {}) => {
  if (member.account_type === 'colleague') {
    if (member.can_use_dealer_features !== true) return '普通用户';
    return member.effective_role === 'sales' ? '业务员' : (String(member.dealer_level || '').trim() || '经销商');
  }
  if (isSalespersonAccount(member)) return '业务员';
  if (!isDealerFlag(member?.is_dealer)) return '普通用户';
  return String(member.dealer_level || '').trim() || '经销商';
};
