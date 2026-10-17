import { apiPost } from '../utils/api';

// 反馈类型为可选字段，页面不再要求分类；强制真实接口，不使用模拟提交结果。
export function createFeedback(data) {
  return apiPost('/crm/feedback/record', data, { apiMode: 'api', showError: false });
}
