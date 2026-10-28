import { apiGet, apiPost, apiDelete } from '@/utils/api';

// 接口仅使用当前登录者 token，父级身份和权限由后端核验。
const options = { apiMode: 'api', header: { channel: 'weapp' }, showError: false };
export const getInviteCode = (envVersion) => apiGet('crm/dealer/invite-qrcode', { env_version: envVersion }, options);
export const getParentPreview = (parentId) => apiGet('crm/dealer/parent-preview', { parent_dealer_id: parentId }, options);
// 扫码接口提交审核申请，返回待审核状态，不代表关系已生效。
export const submitColleagueApplication = (parentId) => apiPost('crm/dealer/bind-parent', { parent_dealer_id: Number(parentId) }, options);
export const getColleagueApplication = () => apiGet('crm/dealer/colleague-application', {}, options);
export const getColleagues = (page) => apiGet('crm/dealer/colleagues', { page, limit: 20 }, options);
export const removeColleague = (memberId) => apiDelete(`crm/dealer/colleagues/${encodeURIComponent(memberId)}`, {}, options);
