/** 系统预设使用真实 PNG 文件，兼容后端上传白名单；SVG 源保存在 scripts 中。 */
export const AVATAR_CATEGORIES = [
  { key: 'guofeng', name: '国风·中国风' },
  { key: 'anime', name: '动漫·二次元' },
  { key: 'business', name: '商务·暖通' }
];

export const PRESET_AVATAR_GROUPS = {
  guofeng: [
    { id: 'gf-1', name: '国风·赤霄墨客', url: '/static/avatars/gf-1.png' },
    { id: 'gf-2', name: '国风·青花雅韵', url: '/static/avatars/gf-2.png' },
    { id: 'gf-3', name: '国风·锦鲤瑞兽', url: '/static/avatars/gf-3.png' },
    { id: 'gf-4', name: '国风·松竹墨侠', url: '/static/avatars/gf-4.png' }
  ],
  anime: [
    { id: 'an-1', name: '动漫·热血少年', url: '/static/avatars/an-1.png' },
    { id: 'an-2', name: '动漫·元气少女', url: '/static/avatars/an-2.png' },
    { id: 'an-3', name: '动漫·极客工程师', url: '/static/avatars/an-3.png' },
    { id: 'an-4', name: '动漫·Q版暖通萌友', url: '/static/avatars/an-4.png' }
  ],
  business: [
    { id: 'bs-1', name: '商务·首席工程师', url: '/static/avatars/bs-1.png' },
    { id: 'bs-2', name: '商务·金牌顾问', url: '/static/avatars/bs-2.png' },
    { id: 'bs-3', name: '系统·默认会员', url: '/static/avatars/avatar-demo.png' }
  ]
};
