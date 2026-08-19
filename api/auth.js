import { apiPost } from '../utils/api';

export function login(data = {}) {
  return apiPost('login', data);
}

export function mobileLogin(data = {}) {
  return apiPost('login/mobile', data);
}

export function weappLogin(data = {}) {
  return apiPost('weapp/login', data);
}

export function logout() {
  return apiPost('logout');
}
