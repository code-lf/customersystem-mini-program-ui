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

/** 微信小程序授权手机号后，按 niucloud 接口绑定当前登录会员手机号。 */
export function bindMemberMobile(mobileCode) {
  return apiPut('member/mobile', { mobile_code: mobileCode }, getMemberRequestOptions());
}

/** 修改会员资料：经销商客户单位使用专用接口，不再写入自填 company_name 或暂无接口的职位。 */
export async function updateMemberInfo(data = {}) {
  const updates = [];
  if (Object.prototype.hasOwnProperty.call(data, 'nickname')) updates.push(['nickname', data.nickname]);
  const avatar = data.headimg || data.avatar;
  if (avatar) updates.push(['headimg', avatar]);
  if (Object.prototype.hasOwnProperty.call(data, 'dealer_unit')) {
    if (String(data.dealer_unit).length > 100) throw new Error('企业/门店名称不能超过100个字');
    updates.push(['dealer_unit', data.dealer_unit]);
  }
  // 同一会员的字段更新依次提交，避免并发写入在后端互相覆盖。
  for (const [field, value] of updates) {
    if (field === 'dealer_unit') {
      await apiPut('member/dealer/unit', { dealer_unit: value }, getMemberRequestOptions());
    } else {
      await modifyMemberField(field, value);
    }
  }
  if (!updates.length) return null;

  // PUT 成功与 GET 立即读到新值是两件事；短暂重试后仍不一致时返回待核对状态，不能误报写入失败。
  let member = null;
  let synced = false;
  const checkedFields = ['dealer_unit'].filter(field => Object.prototype.hasOwnProperty.call(data, field));
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (attempt) await new Promise(resolve => setTimeout(resolve, 400));
    try {
      const response = await getMemberInfo({ showError: false });
      member = response?.data && typeof response.data === 'object' ? response.data : response;
      synced = Boolean(member && typeof member === 'object') && checkedFields.every(field =>
        Object.prototype.hasOwnProperty.call(member, field)
        && String(member[field] ?? '').trim() === String(data[field] ?? '').trim());
      if (synced) break;
    } catch (error) {
      console.warn('[会员资料] 修改接口成功，但回读失败：', error);
    }
  }
  return { member: member && typeof member === 'object' ? member : {}, synced };
}

/** 修改特定会员字段 (如 nickname, headimg) */
export function modifyMemberField(field, value) {
  // OpenAPI 约定请求体只有 value 字段，避免额外字段被严格校验的后端拒绝。
  return apiPut(`member/modify/${field}`, { value }, getMemberRequestOptions());
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
