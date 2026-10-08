import { getMemberInfo } from '../api/member';
import { openPage } from './pages';

const DEALER_PAGES = new Set([
  '/pages/solution/index',
  '/pages/marketing/index',
  '/pages/marketing/enrollments',
  '/pages/monitor/index',
  '/pages/message/index'
]);

/** 判断三个经销商专享功能的入口；页面也可调用同一校验防止从 TabBar 直接进入。 */
export const isDealerPage = (path) => DEALER_PAGES.has(path);

/** 每次使用前重新读取会员接口，以后端最新绑定关系判断，不信任本地缓存。 */
export async function requireDealerAccess(userStore, onDenied) {
  // 未登录先单独提示登录，不提前展示经销商限制；登录后才查询实际绑定状态。
  if (!userStore.isLoggedIn) {
    uni.showModal({
      title: '请先登录',
      content: '当前尚未登录，请先登录后使用该功能。',
      showCancel: false,
      success: () => onDenied?.()
    });
    return false;
  }

  try {
    const response = await getMemberInfo({ showError: false });
    const member = response?.data && typeof response.data === 'object' ? response.data : response;
    if (!member || typeof member !== 'object' || !Object.prototype.hasOwnProperty.call(member, 'is_dealer')) {
      throw new Error('会员接口未返回经销商状态');
    }
    userStore.setUserInfo({ ...userStore.userInfo, ...member });
  } catch (error) {
    uni.showModal({
      title: '暂无法验证身份',
      content: error?.message || '会员信息获取失败，请稍后重试。',
      showCancel: false,
      success: () => onDenied?.()
    });
    return false;
  }

  if (!userStore.isDealer) {
    uni.showModal({
      title: '经销商专享',
      content: '该功能仅经销商用户可使用，请先绑定经销商账号。',
      showCancel: false,
      success: () => onDenied?.()
    });
    return false;
  }
  return true;
}

/** 快捷入口统一走身份校验，非经销商停留原页并展示说明。 */
export async function openDealerPage(userStore, path) {
  if (isDealerPage(path) && !(await requireDealerAccess(userStore))) return;
  openPage(path);
}
