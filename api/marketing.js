import { apiGet, apiPost, apiPut } from '../utils/api';
// 营销接口仅返回后端真实结果；失败交给页面处理，不能用模拟数据伪造报名成功。

/** 经销商可见活动列表 */
export function getCampaigns(params = {}) {
  return apiGet('crm/marketing/campaigns', params, { showError: false });
}

/** 经销商活动详情 */
export function getCampaignDetail(id) {
  return apiGet(`crm/marketing/campaign/${id}`, {}, { showError: false });
}

/** 提交营销活动报名 */
export function enrollCampaign(id, data) {
  return apiPost(`crm/marketing/campaign/${id}/enroll`, data, { showError: false });
}

/** 我的报名列表 */
export function getEnrollments(params = {}) {
  return apiGet('crm/marketing/enrollments', params, { showError: false });
}

/** 我的报名详情 */
export function getEnrollmentDetail(id) {
  return apiGet(`crm/marketing/enrollment/${id}`, {}, { showError: false });
}

/** 取消我的报名 */
export function cancelEnrollment(id, data = {}) {
  return apiPut(`crm/marketing/enrollment/${id}/cancel`, data, { showError: false });
}
