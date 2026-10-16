import { getMemberInfo } from '../api/member';
import { openPage } from './pages';
import { canUseBusinessFeatures } from './member-role';

const DEALER_PAGES = new Set([
  '/pages/solution/index',
  '/pages/marketing/index',
  '/pages/marketing/enrollments',
  '/pages/monitor/index',
  '/pages/message/index'
]);

/** 判断业务功能入口；经销商和业务员从快捷入口、分享链接或 TabBar 进入时使用相同规则。 */
export const isDealerPage = (path) => DEALER_PAGES.has(path);

/** 每次使用前重新读取会员接口，以后端最新绑定关系判断，不信任本地缓存。 */
export async function requireDealerAccess(userStore, onDenied) {
  // 未登录先单独提示登录，不提前展示经销商限制；登录后才查询实际绑定状态。
  if (!userStore.isLoggedIn) {
    uni.showModal({
      title: '请先登录',
      content: '当前尚未登录，请先登录后使用该功能。',
      cancelText: '取消',
      confirmText: '去登录',
      success: ({ confirm }) => {
        // 登录按钮直接打开登录页；取消时才执行页面提供的返回动作。
        if (confirm) openPage('/pages/auth/login');
        else onDenied?.();
      }
    });
    return false;
  }

  try {
    const response = await getMemberInfo({ showError: false });
    const member = response?.data && typeof response.data === 'object' ? response.data : response;
    if (!member || typeof member !== 'object' || (!Object.prototype.hasOwnProperty.call(member, 'is_dealer') && !Object.prototype.hasOwnProperty.call(member, 'admin_account'))) {
      throw new Error('会员接口未返回身份信息');
    }
    // 权限字段必须使用本次响应；字段缺失时清空，避免沿用缓存中的旧业务员身份。
    userStore.setUserInfo({ ...userStore.userInfo, ...member, is_dealer: member.is_dealer ?? 0, admin_account: member.admin_account ?? null });
  } catch (error) {
    uni.showModal({
      title: '暂无法验证身份',
      content: error?.message || '会员信息获取失败，请稍后重试。',
      showCancel: false,
      success: () => onDenied?.()
    });
    return false;
  }

  if (!canUseBusinessFeatures(userStore.userInfo)) {
    uni.showModal({
      title: '业务功能',
      content: '该功能面向经销商和业务员开放，请联系工作人员绑定账号。',
      showCancel: false,
      success: () => onDenied?.()
    });
    return false;
  }
  return true;
}

/** 快捷入口统一校验经销商或业务员身份，普通会员停留原页并展示说明。 */
export async function openDealerPage(userStore, path) {
  if (isDealerPage(path) && !(await requireDealerAccess(userStore))) return;
  openPage(path);
}
