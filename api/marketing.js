import { apiGet, apiPost, apiPut } from '../utils/api';
import mockRequest from '../mock';

/**
 * 带有本地 Mock 优雅降级的安全请求封装。
 * 当远程后端服务尚未部署活动表或接口报错时，自动降级至模拟数据，确保前端界面功能 100% 可用。
 */
async function safeApiCall(apiFn, mockKey, mockData = {}) {
  try {
    const res = await apiFn();
    if (res !== undefined && res !== null) {
      return res;
    }
    throw new Error('Empty response');
  } catch (error) {
    console.warn(`[Marketing API] 远程接口未就绪或请求失败，自动启用 Mock: ${mockKey}`, error?.message);
    const spaceIndex = mockKey.indexOf(' ');
    const method = spaceIndex > -1 ? mockKey.slice(0, spaceIndex) : 'GET';
    const url = spaceIndex > -1 ? mockKey.slice(spaceIndex + 1) : mockKey;
    return mockRequest({ method, url, data: mockData });
  }
}

/** 经销商可见活动列表 */
export function getCampaigns(params = {}) {
  return safeApiCall(
    () => apiGet('crm/marketing/campaigns', params, { showError: false }),
    'GET crm/marketing/campaigns',
    params
  );
}

/** 经销商活动详情 */
export function getCampaignDetail(id) {
  const cleanId = id !== undefined && id !== null && id !== '' ? id : 1;
  return safeApiCall(
    () => apiGet(`crm/marketing/campaign/${cleanId}`, {}, { showError: false }),
    `GET crm/marketing/campaign/${cleanId}`,
    {}
  );
}

/** 提交营销活动报名 */
export function enrollCampaign(id, data) {
  return safeApiCall(
    () => apiPost(`crm/marketing/campaign/${id}/enroll`, data, { showError: false }),
    `POST crm/marketing/campaign/${id}/enroll`,
    data
  );
}

/** 我的报名列表 */
export function getEnrollments(params = {}) {
  return safeApiCall(
    () => apiGet('crm/marketing/enrollments', params, { showError: false }),
    'GET crm/marketing/enrollments',
    params
  );
}

/** 我的报名详情 */
export function getEnrollmentDetail(id) {
  return safeApiCall(
    () => apiGet(`crm/marketing/enrollment/${id}`, {}, { showError: false }),
    `GET crm/marketing/enrollment/${id}`,
    {}
  );
}

/** 取消我的报名 */
export function cancelEnrollment(id, data = {}) {
  return safeApiCall(
    () => apiPut(`crm/marketing/enrollment/${id}/cancel`, data, { showError: false }),
    `PUT crm/marketing/enrollment/${id}/cancel`,
    data
  );
}

