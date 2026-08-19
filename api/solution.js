import { apiGet, apiPost, apiPut } from '../utils/api';

export function getSolutionList(params = {}) {
  return apiGet('solution/list', params);
}

export function getSolutionDetail(id) {
  return apiGet(`solution/detail/${id}`);
}

export function saveSolution(data) {
  return data.id ? apiPut('solution/save', data) : apiPost('solution/save', data);
}

export function shareSolution(id) {
  return apiPost(`solution/share/${id}`);
}
