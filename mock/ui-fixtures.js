/**
 * 设计稿还原用的前端假数据。
 * 这里的数据优先服务 UI 结构和排版，字段保持接近真实业务，后续接接口时可以逐步替换为 API 返回值。
 */

export const uiProducts = [
  {
    id: 101,
    model: 'VK8R',
    name: 'VK8R 多联式空调室外机',
    image: '/static/aircon/outdoor-unit.png',
    price: 26800,
    tag: '热销',
    greenTag: '新品',
    specs: ['8HP', '25.2kW', 'IPLV(C) 6.50', '380V 3N~50Hz'],
    area: '90-120㎡',
    category: 'multi',
    series: 'VK系列',
    subCategory: '室外机'
  },
  {
    id: 102,
    model: 'VK10R',
    name: 'VK10R 智慧多联机室外机',
    image: '/static/aircon/outdoor-unit.png',
    price: 29800,
    tag: '热销',
    greenTag: '一级能效',
    specs: ['10HP', '28.0kW', '一级能效', '380V 3N~50Hz'],
    area: '100-130㎡',
    category: 'multi',
    series: 'VK系列',
    subCategory: '室外机'
  },
  {
    id: 103,
    model: 'VK12R',
    name: 'VK12R 高效多联机室外机',
    image: '/static/aircon/outdoor-unit.png',
    price: 33500,
    tag: '',
    greenTag: '',
    specs: ['12HP', '33.5kW', 'IPLV(C) 6.40', 'R410A'],
    area: '120-150㎡',
    category: 'multi',
    series: 'VK系列',
    subCategory: '室外机'
  },
  {
    id: 104,
    model: 'VK14R',
    name: 'VK14R 变频多联机室外机',
    image: '/static/aircon/outdoor-unit.png',
    price: 36800,
    tag: '',
    greenTag: '一级能效',
    specs: ['14HP', '40.0kW', '一级能效', 'R410A'],
    area: '140-180㎡',
    category: 'multi',
    series: 'VK系列',
    subCategory: '室外机'
  },
  {
    id: 105,
    model: 'VM08A',
    name: 'VM系列 模块化多联室外机',
    image: '/static/aircon/central-default.png',
    price: 24500,
    tag: '新品',
    greenTag: '一级能效',
    specs: ['8HP', '22.4kW', '直流变频', '380V'],
    area: '80-110㎡',
    category: 'multi',
    series: 'VM系列',
    subCategory: '室外机'
  },
  {
    id: 106,
    model: 'VM10A',
    name: 'VM系列 模块化多联室外机',
    image: '/static/aircon/central-default.png',
    price: 28000,
    tag: '',
    greenTag: '',
    specs: ['10HP', '28.0kW', '变频节能', '380V'],
    area: '100-140㎡',
    category: 'multi',
    series: 'VM系列',
    subCategory: '室外机'
  },
  {
    id: 107,
    model: 'V6-120',
    name: 'V6系列 旗舰商用多联机',
    image: '/static/aircon/outdoor-unit.png',
    price: 41200,
    tag: '旗舰',
    greenTag: '一级能效',
    specs: ['12HP', '33.5kW', '全直流变频', '超低噪音'],
    area: '130-160㎡',
    category: 'multi',
    series: 'V6系列',
    subCategory: '室外机'
  },
  {
    id: 108,
    model: 'V-mini 06',
    name: 'V mini系列 小型商用多联机',
    image: '/static/aircon/central-default.png',
    price: 18900,
    tag: '推荐',
    greenTag: '',
    specs: ['6HP', '16.0kW', '小型化机身', '220V/380V'],
    area: '60-90㎡',
    category: 'multi',
    series: 'V mini系列',
    subCategory: '室外机'
  },
  {
    id: 109,
    model: 'VK-IN36',
    name: 'VK系列 静音超薄风管式室内机',
    image: '/static/aircon/home-green.png',
    price: 3600,
    tag: '静音',
    greenTag: '新一级',
    specs: ['1.5匹', '3.6kW', '超薄190mm', '220V'],
    area: '16-24㎡',
    category: 'multi',
    series: 'VK系列',
    subCategory: '室内机'
  },
  {
    id: 110,
    model: 'VK-IN72',
    name: 'VK系列 高静压风管室内机',
    image: '/static/aircon/home-green.png',
    price: 5200,
    tag: '',
    greenTag: '一级能效',
    specs: ['3匹', '7.2kW', '高静压送风', '220V'],
    area: '30-45㎡',
    category: 'multi',
    series: 'VK系列',
    subCategory: '室内机'
  },
  {
    id: 111,
    model: 'XF-800',
    name: '全热交换新风处理机组',
    image: '/static/aircon/central-default.png',
    price: 8900,
    tag: '除霾',
    greenTag: 'PM2.5净化',
    specs: ['800m³/h风量', '全热交换', '双向流', '220V'],
    area: '150-250㎡',
    category: 'multi',
    series: 'VK系列',
    subCategory: '新风处理机'
  },
  {
    id: 112,
    model: 'CC-Pro',
    name: '智能触摸集中控制器',
    image: '/static/aircon/central-default.png',
    price: 1580,
    tag: '智能',
    greenTag: '',
    specs: ['7寸触控屏', '云端远程控制', '分户计费', 'RS485'],
    area: '多区域管理',
    category: 'multi',
    series: 'VK系列',
    subCategory: '控制器'
  },
  {
    id: 113,
    model: 'FQ-02',
    name: '专业分歧管组件套装',
    image: '/static/aircon/central-default.png',
    price: 360,
    tag: '原厂',
    greenTag: '',
    specs: ['紫铜加厚', '耐高压', '标准接口', '原厂配件'],
    area: '系统管路',
    category: 'multi',
    series: 'VK系列',
    subCategory: '配件组件'
  },
  {
    id: 201,
    model: 'KFR-35GW/YJ1',
    name: '1.5匹 变频冷暖壁挂式空调',
    image: '/static/aircon/home-green.png',
    price: 2699,
    tag: '热销',
    greenTag: '新一级能效',
    specs: ['1.5匹', '新一级能效', '快速冷暖', '智能防直吹'],
    area: '15-22㎡',
    category: 'wall'
  },
  {
    id: 202,
    model: 'KFR-72LW/YJ1',
    name: '3匹 变频冷暖立式柜机',
    image: '/static/aircon/home-cabinet.png',
    price: 5899,
    tag: '爆款',
    greenTag: '一级能效',
    specs: ['3匹', '柜式', '1300m³/h大风量', '自清洁'],
    area: '30-45㎡',
    category: 'cabinet'
  },
  {
    id: 203,
    model: 'KFR-50LW/YJ2',
    name: '2匹 客厅圆柱艺术柜机',
    image: '/static/aircon/home-cabinet-green.png',
    price: 4699,
    tag: '',
    greenTag: '节能省电',
    specs: ['2匹', '艺术造型', '全直流变频', '静音舒适'],
    area: '22-34㎡',
    category: 'cabinet'
  }
];

export const uiSolutions = [
  {
    id: 1,
    title: '杭州 · 未来科技大厦',
    subtitle: '多联机空调系统报价单',
    products: 6,
    total: 98600,
    status: 'draft',
    time: '2026-06-02 10:30',
    items: [
      { ...uiProducts[0], quantity: 2 },
      { ...uiProducts[1], quantity: 1 },
      { ...uiProducts[2], quantity: 1 },
      { ...uiProducts[4], quantity: 2 }
    ]
  },
  {
    id: 2,
    title: '宁波 · 万象城商铺改造',
    subtitle: '空调 + 新风报价单',
    products: 4,
    total: 52300,
    status: 'shared',
    time: '2026-06-01 16:20',
    items: [
      { ...uiProducts[1], quantity: 1 },
      { ...uiProducts[4], quantity: 2 }
    ]
  },
  {
    id: 3,
    title: '绍兴 · 厂房降温报价',
    subtitle: '商用多联机报价单',
    products: 3,
    total: 46800,
    status: 'draft',
    time: '2025-05-31 11:05',
    items: [
      { ...uiProducts[2], quantity: 1 },
      { ...uiProducts[3], quantity: 1 }
    ]
  }
];

export const uiMessages = [
  { id: 1, type: 'price', icon: 'chart', title: '价格变动通知', desc: 'VK8R 系列多联机价格已更新，点击查看详情。', time: '10:30', unread: 2, color: '#ff5c4d' },
  { id: 2, type: 'document', icon: 'book', title: '资料更新通知', desc: '《VK8R 系列产品手册》已更新至最新版。', time: '昨天 16:20', unread: 1, color: '#3478f6' },
  { id: 3, type: 'system', icon: 'volume', title: '系统公告', desc: '格宏助手小程序将于 2026-06-05 02:00-04:00 维护。', time: '06-01', unread: 0, color: '#35bf83' },
  { id: 4, type: 'price', icon: 'tags', title: '价格变动通知', desc: 'VK10R 系列多联机价格已更新，点击查看详情。', time: '05-31', unread: 0, color: '#ffb23e' }
];

export const uiNotices = [
  { id: 1, type: '价格调整', title: '关于 VK8R 多联机价格调整的通知', tag: '重要', date: '2025-05-28', views: 1286, image: '/static/aircon/outdoor-unit.png' },
  { id: 2, type: '最新通知', title: '格宏助手小程序功能升级公告', tag: '', date: '2025-05-20', views: 842, image: '/static/aircon/notice-cloud.png' },
  { id: 3, type: '活动政策', title: '2025 年夏季促销活动政策发布', tag: '', date: '2025-05-15', views: 1765, image: '/static/aircon/notice-summer.png' },
  { id: 4, type: '最新通知', title: '家用空调安装规范更新通知', tag: '', date: '2025-05-10', views: 632, image: '/static/aircon/home-green.png' },
  { id: 5, type: '系统公告', title: '关于系统维护的公告', tag: '', date: '2025-05-05', views: 413, image: '/static/aircon/central-default.png' }
];

export const uiCategories = {
  central: [
    { id: 'multi', name: '多联机' },
    { id: 'module', name: '模块机' },
    { id: 'terminal', name: '末端设备' },
    { id: 'control', name: '控制系统' }
  ],
  centralSide: ['多联机', '室外机', '室内机', '新风处理机', '控制器', '配件组件'],
  series: ['VK系列', 'VM系列', 'V6系列', 'V mini系列'],
  home: [
    { id: 'wall', name: '壁挂式空调', desc: '节能静音 / 快速冷暖', count: 68, image: '/static/aircon/home-green.png' },
    { id: 'cabinet', name: '柜式空调', desc: '大风量 / 快速制冷制热', count: 48, image: '/static/aircon/home-cabinet-green.png' }
  ]
};

export const uiFiles = [
  { id: 1, name: 'VK系列产品样本.pdf', size: '2.68 MB', date: '2026-05-20', type: 'PDF' },
  { id: 2, name: 'VK8R安装使用说明书.pdf', size: '3.12 MB', date: '2026-05-20', type: 'PDF' },
  { id: 3, name: 'VK8R技术参数表.pdf', size: '1.56 MB', date: '2026-05-20', type: 'PDF' },
  { id: 4, name: 'VK8R能效认证证书.pdf', size: '0.98 MB', date: '2026-05-20', type: 'PDF' }
];
