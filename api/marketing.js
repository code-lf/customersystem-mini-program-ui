import { apiGet, apiPost, apiPut } from '../utils/api';

/** 经销商可见活动列表 */
export function getCampaigns(params = {}) {
  return apiGet('crm/marketing/campaigns', params);
}

/** 经销商活动详情 */
export function getCampaignDetail(id) {
  return apiGet(`crm/marketing/campaign/${id}`);
}

/** 提交营销活动报名 */
export function enrollCampaign(id, data) {
  return apiPost(`crm/marketing/campaign/${id}/enroll`, data);
}

/** 我的报名列表 */
export function getEnrollments(params = {}) {
  return apiGet('crm/marketing/enrollments', params);
}

/** 我的报名详情 */
export function getEnrollmentDetail(id) {
  return apiGet(`crm/marketing/enrollment/${id}`);
}

/** 取消我的报名 */
export function cancelEnrollment(id, data = {}) {
  return apiPut(`crm/marketing/enrollment/${id}/cancel`, data);
}
