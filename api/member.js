import config from '../config/app';
import { apiDelete, apiGet, apiPost, apiPut } from '../utils/api';

// 中文说明：
// 会员、余额、提现链路优先按 niucloud-admin 的真实接口字段来写。
// 这里再额外做一个“请求模式适配层”，避免页面里到处写 if/else。
// 后续如果你要把这条链路改成真实接口，只改 config/app.js 里的：
// memberApiMode 和 memberBaseUrl 即可。
function getMemberRequestOptions() {
  if (config.memberApiMode === 'mock') {
    return { apiMode: 'mock' };
  }

  if (config.memberApiMode === 'api') {
    return {
      apiMode: 'api',
      baseUrl: config.memberBaseUrl || config.baseUrl
    };
  }

  return {};
}

export function getMemberInfo(options = {}) {
  // 权限校验可关闭通用错误提示，由页面统一展示经销商身份验证弹窗。
  const requestOptions = { ...getMemberRequestOptions(), ...options };
  // 新版 OpenAPI 使用 /member；仅在接口不存在时回退旧版 /member/member。
  return apiGet('member', {}, { ...requestOptions, showError: false }).catch((error) => {
    const routeMissing = error?.statusCode === 404 || /路由.*(未定义|不匹配)|not found/i.test(String(error?.message || ''));
    if (routeMissing) return apiGet('member/member', {}, requestOptions);
    throw error;
  });
}

/** 修改会员资料：只提交有变化的字段，任一接口失败都不伪造保存成功。 */
export async function updateMemberInfo(data = {}) {
  const promises = [];
  if (Object.prototype.hasOwnProperty.call(data, 'nickname')) promises.push(modifyMemberField('nickname', data.nickname));
  const avatar = data.headimg || data.avatar;
  if (avatar) promises.push(modifyMemberField('headimg', avatar));
  // 企业/门店名称和职位是会员自填资料，并不代表经销商认证状态。
  if (Object.prototype.hasOwnProperty.call(data, 'company_name')) promises.push(modifyMemberField('company_name', data.company_name));
  if (Object.prototype.hasOwnProperty.call(data, 'job_title')) promises.push(modifyMemberField('job_title', data.job_title));
  await Promise.all(promises);
  return data;
}

/** 修改特定会员字段 (如 nickname, headimg) */
export function modifyMemberField(field, value) {
  return apiPut(`member/modify/${field}`, { value, [field]: value }, getMemberRequestOptions());
}

export function getBalance() {
  return apiGet('member/account/balance', {}, getMemberRequestOptions());
}

// 中文说明：
// 这里的接口命名和路径尽量与 niucloud-admin 保持一致。
// 这样后续把 config.apiMode 切到 api，并填入真实 baseUrl 后，页面层基本不用再改字段。
export function getBalanceListAll(params = {}) {
  return apiGet('member/account/balance_list', params, getMemberRequestOptions());
}

export function getMoneyList(params = {}) {
  return apiGet('member/account/money', params, getMemberRequestOptions());
}

export function cashOutTransferType() {
  return apiGet('member/cash_out/transfertype', {}, getMemberRequestOptions());
}

export function cashOutConfig() {
  return apiGet('member/cash_out/config', {}, getMemberRequestOptions());
}

export function cashOutApply(data = {}) {
  return apiPost('member/cash_out/apply', data, getMemberRequestOptions());
}

export function getCashoutAccountInfo(data = {}) {
  return apiGet(`member/cashout_account/${data.account_id}`, {}, getMemberRequestOptions());
}

export function getFirstCashOutAccountInfo(data = {}) {
  return apiGet('member/cashout_account/firstinfo', data, getMemberRequestOptions());
}

export function getCashOutList(params = {}) {
  return apiGet('member/cash_out', params, getMemberRequestOptions());
}

export function getCashOutDetail(id) {
  return apiGet(`member/cash_out/${id}`, {}, getMemberRequestOptions());
}

export function memberCancel(params = {}) {
  return apiPut(`member/cash_out/cancel/${params.id}`, params, getMemberRequestOptions());
}

export function addCashoutAccount(data = {}) {
  return apiPost('member/cashout_account', data, getMemberRequestOptions());
}

export function editCashoutAccount(data = {}) {
  return apiPut(`member/cashout_account/${data.account_id}`, data, getMemberRequestOptions());
}

export function deleteCashoutAccount(accountId) {
  return apiDelete(`member/cashout_account/${accountId}`, {}, getMemberRequestOptions());
}
