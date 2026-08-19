import { defineStore } from 'pinia';
import { STORAGE_KEYS } from '../config/storage';
import { getStorage, removeStorage, setStorage } from '../utils/storage';
import config from '../config/app';

const demoUser = {
  member_id: 10001,
  nickname: '张工',
  mobile: '13800000000',
  avatar: '/static/avatars/avatar-demo.png',
  company_name: '格宏暖通科技有限公司',
  position: '销售工程师'
};

const normalizeDemoUser = (user = {}) => {
  // 中文说明：开发阶段用户信息会缓存在本地，如果之前缓存过旧品牌，页面会继续显示旧名称。
  // 这里在 mock 模式下做一次品牌归一化，让旧缓存也自动切换为“格宏暖通科技有限公司”。
  const merged = { ...demoUser, ...(user || {}) };
  if (!merged.company_name || String(merged.company_name).includes('云境')) {
    merged.company_name = demoUser.company_name;
  }
  return merged;
};

export const useUserStore = defineStore('user', {
  state: () => ({
    // 统一通过 storage 工具读取，避免对象被当成 JSON 字符串使用。
    token: getStorage(STORAGE_KEYS.token, config.apiMode === 'mock' ? 'mock-token-demo' : ''),
    userInfo: config.apiMode === 'mock'
      ? normalizeDemoUser(getStorage(STORAGE_KEYS.userInfo, demoUser))
      : getStorage(STORAGE_KEYS.userInfo, {}),
  }),
  getters: {
    // 页面可以直接使用 userStore.isLoggedIn 判断登录状态。
    isLoggedIn: (state) => Boolean(state.token),
  },
  actions: {
    setToken(token) {
      this.token = token;
      setStorage(STORAGE_KEYS.token, token || '');
    },
    setUserInfo(userInfo = {}) {
      this.userInfo = userInfo || {};
      setStorage(STORAGE_KEYS.userInfo, this.userInfo);
    },
    logout() {
      this.token = '';
      this.userInfo = {};
      removeStorage(STORAGE_KEYS.token);
      removeStorage(STORAGE_KEYS.userInfo);
    },
  },
}); 
