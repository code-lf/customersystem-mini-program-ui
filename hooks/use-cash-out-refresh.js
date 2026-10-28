import { onShow, onHide, onUnload } from '@dcloudio/uni-app';

/** 仅查询状态：前台每5秒刷新，最多12次；离开页面停止，绝不在轮询中发起转账。 */
export function useCashOutRefresh(load) {
  let timer;
  let revision = 0;
  let active = false;
  const stop = () => { active = false; revision += 1; clearTimeout(timer); };
  const refresh = async () => {
    // 微信确认页可能在后台回调，隐藏状态不重启轮询，等 onShow 再查询。
    if (!active) return;
    clearTimeout(timer);
    const current = ++revision;
    let remaining = 12;
    const run = async () => {
      try {
        const pending = await load();
        if (active && current === revision && pending && remaining-- > 0) timer = setTimeout(run, 5000);
      } catch (error) {
        // 页面自行显示查询失败提示，暂停自动刷新，留给用户主动重试。
      }
    };
    await run();
  };
  onShow(() => { active = true; refresh(); });
  onHide(stop);
  onUnload(stop);
  return { refresh };
}
