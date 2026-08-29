import { apiGet, apiPost } from '../utils/api';

/** 公告分类列表 */
export function getNoticeCategories(params = {}) {
  return apiGet('crm/notice/categories', params);
}

/** 公告列表 */
export function getNotices(params = {}) {
  return apiGet('crm/notice/articles', params);
}

/** 公告详情 */
export function getNoticeDetail(id) {
  return apiGet(`crm/notice/article/${id}`);
}

/** 记录公告阅读 */
export function readNotice(id, data = {}) {
  return apiPost(`crm/notice/article/${id}/read`, data);
}

/** 提交用户反馈 */
export function submitFeedback(data) {
  return apiPost('crm/feedback/record', data);
}

/** 我的反馈列表 */
export function getFeedbackRecords(params = {}) {
  return apiGet('crm/feedback/records', params);
}

/** 我的反馈详情 */
export function getFeedbackDetail(id) {
  return apiGet(`crm/feedback/record/${id}`);
}

/** 提交合作申请 */
export function submitCooperation(data) {
  return apiPost('crm/cooperation/application', data);
}

/** 合作申请重复检查 */
export function checkCooperation(params = {}) {
  return apiGet('crm/cooperation/application/check', params);
}

/** 我的合作申请列表 */
export function getCooperationList(params = {}) {
  return apiGet('crm/cooperation/applications', params);
}

/** 我的合作申请详情 */
export function getCooperationDetail(id) {
  return apiGet(`crm/cooperation/application/${id}`);
}

/** 获取消息列表 (保留原有以便不报错) */
export function getMessages(params = {}) {
  return apiGet('content/messages', params);
}
