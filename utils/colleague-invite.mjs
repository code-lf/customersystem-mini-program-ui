// 只处理从首页进入的同事邀请，避免影响其他扫码业务。
export function getColleagueInviteId(options = {}) {
  if (String(options.path || '').replace(/^\//, '') !== 'pages/index/index') return '';
  const query = options.query || {};
  let scene = '';
  try { scene = decodeURIComponent(query.scene || ''); } catch (_) { return ''; }
  const match = scene.match(/(?:^|&)parent_dealer_id=([1-9]\d*)(?:&|$)/);
  const id = String(query.parent_dealer_id || (match && match[1]) || '');
  return /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id)) ? id : '';
}
