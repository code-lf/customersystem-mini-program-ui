import { defineStore } from 'pinia';
import { STORAGE_KEYS } from '../config/storage';
import { getStorage, removeStorage, setStorage } from '../utils/storage';
import config from '../config/app';
import { getMemberInfo } from '../api/member';
import { isDealerFlag, isSalespersonAccount, canUseBusinessFeatures, resolveMemberRole } from '../utils/member-role';

// 登录、退出和资料保存都会使在途的旧会员请求失效，防止旧响应覆盖新账号资料。
let userRevision = 0;

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

// 保留原导出供已有调用使用，身份展示统一由会员角色规则处理。
export { isDealerFlag };
export const resolveDealerLevel = resolveMemberRole;

const normalizeUserData = (user = {}) => {
  const data = { ...user };
  if (!data.avatar && data.headimg) {
    data.avatar = data.headimg;
  }
  // 客户单位以经销商池返回的 dealer_unit 为准；空值可能是用户主动清空，不覆盖为示例公司。
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
    isSalesperson: (state) => Boolean(state.token) && isSalespersonAccount(state.userInfo),
    canUseBusinessFeatures: (state) => Boolean(state.token) && canUseBusinessFeatures(state.userInfo),
    displayName: (state) => Boolean(state.token) ? (state.userInfo.nickname || state.userInfo.username || '格宏用户') : '请登录',
    // 企业展示统一使用后端经销商池客户单位，不回退旧的会员自填公司名。
    displayCompany: (state) => Boolean(state.token) ? (state.userInfo.dealer_unit || '未填写企业/门店名称') : '未登录',
    displayRole: (state) => Boolean(state.token) ? resolveMemberRole(state.userInfo) : '未登录'
  },
  actions: {
    setToken(token) {
      const nextToken = token || '';
      if (this.token !== nextToken) {
        userRevision += 1;
        // 切换账号时先清除上一个会员资料，不能把旧公司名合并进新账号。
        this.userInfo = {};
        removeStorage(STORAGE_KEYS.userInfo);
      }
      this.token = nextToken;
      if (token) {
        setStorage(STORAGE_KEYS.token, token);
      } else {
        removeStorage(STORAGE_KEYS.token);
        this.userInfo = {};
        removeStorage(STORAGE_KEYS.userInfo);
      }
    },
    setUserInfo(userInfo = {}) {
      userRevision += 1;
      const normalized = normalizeUserData(userInfo);
      this.userInfo = normalized;
      setStorage(STORAGE_KEYS.userInfo, normalized);
    },
    async fetchUserInfo() {
      if (!this.token) return null;
      const requestRevision = userRevision;
      try {
        const res = await getMemberInfo();
        // 请求发出后若发生退出、重新登录或资料保存，忽略过期响应。
        if (!this.token || requestRevision !== userRevision) return null;
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
      userRevision += 1;
      this.token = '';
      this.userInfo = {};
      removeStorage(STORAGE_KEYS.token);
      removeStorage(STORAGE_KEYS.userInfo);
    },
  },
});
 
