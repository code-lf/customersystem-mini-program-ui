import { defineStore } from 'pinia';
import { STORAGE_KEYS } from '../config/storage';
import { getStorage, removeStorage, setStorage } from '../utils/storage';
import config from '../config/app';
import { getMemberInfo } from '../api/member';

const demoUser = {
  member_id: 10001,
  member_no: '0001',
  username: 'demo',
  nickname: '张工',
  mobile: '13800000000',
  avatar: '/static/avatars/avatar-demo.png',
  company_name: '格宏电器科技有限公司',
  position: '销售工程师',
  role_name: '认证服务商',
  balance: '3600.00',
  money: '12850.00',
  point: 580,
  commission: '12850.00'
};

// 后端的 is_dealer 可能由不同序列化方式返回布尔值、数字或字符串。
export const isDealerFlag = (value) => value === true || value === 1 || value === '1' || value === 'true';

// 会员等级以当前经销商分组为准，不再使用旧的 role_name / member_level_name 冒充价格等级。
export const resolveDealerLevel = (user = {}) => {
  if (!isDealerFlag(user.is_dealer)) return '普通用户';
  return String(user.dealer_level || '').trim() || '经销商';
};

const normalizeUserData = (user = {}) => {
  const data = { ...user };
  if (!data.avatar && data.headimg) {
    data.avatar = data.headimg;
  }
  // 企业/门店名是后端会员自填字段；空值也可能是用户主动清空，不覆盖为示例公司。
  if (!data.nickname) {
    data.nickname = data.username || (data.mobile ? ('用户_' + String(data.mobile).slice(-4)) : '格宏用户');
  }
  if (!data.role_name) {
    if (data.member_level_name) {
      data.role_name = data.member_level_name;
    } else if (data.member_level > 0) {
      data.role_name = `VIP${data.member_level} 会员`;
    } else {
      data.role_name = '认证会员';
    }
  }
  return data;
};

export const useUserStore = defineStore('user', {
  state: () => {
    const token = getStorage(STORAGE_KEYS.token, '');
    const rawUserInfo = token ? getStorage(STORAGE_KEYS.userInfo, {}) : {};
    return {
      token: token || '',
      userInfo: (token && rawUserInfo && typeof rawUserInfo === 'object') ? normalizeUserData(rawUserInfo) : {},
    };
  },
  getters: {
    // 页面可以直接使用 userStore.isLoggedIn 判断登录状态。
    isLoggedIn: (state) => Boolean(state.token),
    isDealer: (state) => Boolean(state.token) && isDealerFlag(state.userInfo.is_dealer),
    displayName: (state) => Boolean(state.token) ? (state.userInfo.nickname || state.userInfo.username || '格宏用户') : '请登录',
    displayCompany: (state) => Boolean(state.token) ? (state.userInfo.company_name || '格宏电器科技有限公司') : '未登录',
    displayRole: (state) => Boolean(state.token) ? resolveDealerLevel(state.userInfo) : '未登录'
  },
  actions: {
    setToken(token) {
      this.token = token || '';
      if (token) {
        setStorage(STORAGE_KEYS.token, token);
      } else {
        removeStorage(STORAGE_KEYS.token);
        this.userInfo = {};
        removeStorage(STORAGE_KEYS.userInfo);
      }
    },
    setUserInfo(userInfo = {}) {
      const normalized = normalizeUserData(userInfo);
      this.userInfo = normalized;
      setStorage(STORAGE_KEYS.userInfo, normalized);
    },
    async fetchUserInfo() {
      if (!this.token) return null;
      try {
        const res = await getMemberInfo();
        const raw = (res && typeof res === 'object' && res.data) ? res.data : res;
        if (raw && typeof raw === 'object') {
          const merged = { ...this.userInfo, ...raw };
          this.setUserInfo(merged);
          return merged;
        }
      } catch (err) {
        console.warn('fetchUserInfo error:', err);
      }
      return this.userInfo;
    },
    logout() {
      this.token = '';
      this.userInfo = {};
      removeStorage(STORAGE_KEYS.token);
      removeStorage(STORAGE_KEYS.userInfo);
    },
  },
});
 
