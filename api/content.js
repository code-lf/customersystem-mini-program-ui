import { apiGet, apiPost } from '../utils/api';

export function getMessages(params = {}) {
  return apiGet('content/messages', params);
}

export function getNotices(params = {}) {
  return apiGet('content/notices', params);
}

export function getNoticeDetail(id) {
  return apiGet(`content/notice/${id}`);
}

export function submitFeedback(data) {
  return apiPost('content/feedback', data);
}

export function submitCooperation(data) {
  return apiPost('content/cooperation', data);
}
