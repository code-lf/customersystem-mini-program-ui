/** 微信按运行版本开放 AI：开发版/体验版可用，正式版及无法识别的版本默认关闭。 */
export function isAiAvailable() {
  // 非微信端保持原有能力，微信端必须以宿主提供的 envVersion 为准，不信任页面参数。
  let allowed = true;
  // #ifdef MP-WEIXIN
  allowed = false;
  try {
    const version = wx.getAccountInfoSync()?.miniProgram?.envVersion;
    allowed = version === 'develop' || version === 'trial';
  } catch (error) {
    // 获取版本失败按关闭处理，防止正式包意外开放。
  }
  // #endif
  return allowed;
}
