import { apiDelete, apiGet, apiPost } from '../utils/api';

// AI 接口文档要求 channel=weapp；登录 token 由通用请求层自动添加。
const aiRequestOptions = { header: { channel: 'weapp' } };

/** 获取当前会员的 AI 会话分页列表。 */
export function getAiSessions(params = {}) {
  return apiGet('ai/sessions', params, aiRequestOptions);
}

/** 显式创建新会话；普通提问不传 session_id 时后端也会自动创建。 */
export function createAiSession() {
  return apiPost('ai/session', {}, aiRequestOptions);
}

/** 读取会话及其完整消息记录，用于进入历史会话后继续对话。 */
export function getAiSessionDetail(sessionId) {
  return apiGet(`ai/session/${encodeURIComponent(sessionId)}`, {}, aiRequestOptions);
}

/** 删除当前会员的一条 AI 会话。 */
export function deleteAiSession(sessionId) {
  return apiDelete(`ai/session/${encodeURIComponent(sessionId)}`, {}, aiRequestOptions);
}
