/** 从会员资料读取账户余额；字段缺失或格式异常必须报错，不能将流水响应当作零余额。 */
export function readMemberAmount(member, type = 'money') {
  const value = member?.[type];
  if (value === undefined || value === null || String(value).trim() === '' || !Number.isFinite(Number(value))) {
    throw new Error('账户余额读取失败，请重新加载');
  }
  return Number(value);
}
