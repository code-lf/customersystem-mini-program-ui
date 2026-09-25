import config from '@/config/app';
import { airProducts, getProductById } from './product-adapter';
import { getTaxonomy } from './product-taxonomy';

/**
 * Mock 数据中心。
 * 所有页面都通过 api/*.js 调用这里，未来把 config.apiMode 切换为 api 即可离开 Mock。
 */

const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

const demoUser = {
  member_id: 10001,
  nickname: '张工',
  username: 'demo',
  mobile: '13800000000',
  avatar: '/static/avatars/avatar-demo.png',
  company_name: '格宏电器科技有限公司',
  company: '格宏电器科技有限公司',
  position: '销售工程师',
  weapp_openid: 'mock-openid'
};

const state = {
  token: 'mock-token-demo',
  user: demoUser,
  balance: {
    money: 28600,
    balance: 12600,
    commission: 8600,
    point: 1280
  },
  balanceLogs: [
    { id: 1, account_type: 'money', from_type: 'cash_out', from_type_name: '提现申请', account_data: '-2000.00', create_time: '2026-07-10 11:30' },
    { id: 2, account_type: 'income', from_type: 'solution_income', from_type_name: '报价成交入账', account_data: '5800.00', create_time: '2026-07-09 16:20' },
    { id: 3, account_type: 'disburse', from_type: 'refund', from_type_name: '售后退款支出', account_data: '-800.00', create_time: '2026-07-07 10:15' }
  ],
  cashoutAccounts: [
    { account_id: 101, account_type: 'wechat_code', account_no: 'gh_service_001', realname: '张工', transfer_payment_code: '/static/avatars/avatar-demo.png' },
    { account_id: 102, account_type: 'alipay', account_no: 'gehong-pay@demo.com', realname: '张工' },
    { account_id: 103, account_type: 'bank', account_no: '6222028888881234', realname: '张工', bank_name: '中国工商银行' }
  ],
  monitors: [],
  solutions: [],
  messages: [
    { id: 1, type: 'price', title: '价格变动通知', content: 'VK系列部分型号价格已更新，点击查看详情。', time: '今天 10:30', unread: true },
    { id: 2, type: 'document', title: '资料更新通知', content: '新增中央空调安装说明书和参数表。', time: '昨天 16:20', unread: true },
    { id: 3, type: 'system', title: '系统公告', content: '系统将在今晚进行例行维护。', time: '06-01', unread: false }
  ],
  notices: [
    { id: 1, type: '价格调整', title: '关于 VK 系列多联机价格调整的通知', summary: '部分型号价格上调，具体调整请查看公告详情。', time: '2026-06-01', views: 1286, image: 'http://gh.starall.cn/static/resource/aircon/central-default.png' },
    { id: 2, type: '系统公告', title: '格宏助手小程序功能升级公告', summary: '产品资料、报价单和价格监控功能已上线。', time: '2026-05-20', views: 842, image: 'http://gh.starall.cn/static/resource/aircon/notice-cloud.png' },
    { id: 3, type: '活动政策', title: '2026 年夏季促销活动政策发布', summary: '夏季活动进行中，欢迎关注最新政策。', time: '2026-05-15', views: 1765, image: 'http://gh.starall.cn/static/resource/aircon/notice-summer.png' }
  ],
  cashouts: [
    {
      id: 9001,
      cash_out_no: 'TX202607100001',
      apply_money: '2000.00',
      service_money: '0.00',
      transfer_type: 'wechat_code',
      transfer_type_name: '微信收款码',
      status: 1,
      status_name: '待审核',
      create_time: '2026-07-10 11:30',
      audit_time: '',
      transfer_time: '',
      refuse_reason: '',
      account_type: 'money',
      transfer_account: 'gh_service_001',
      transfer_realname: '张工'
    }
  ],
  feedbacks: [],
  cooperation: [],
  payments: {},
  campaigns: [
    {
      id: 1,
      title: '2026年浙江格宏秋季暖通订货会',
      type: 'order',
      type_name: '订货会',
      cover_image: 'http://gh.starall.cn/static/resource/aircon/central-default.png',
      banner_image: 'http://gh.starall.cn/static/resource/aircon/central-default.png',
      summary: '核心经销商专属闭门订货会，全系列多联机及变频单元机阶梯让利，订货享最高8%返点补贴与辅材大礼包！',
      start_time: '2026-09-15 09:00',
      end_time: '2026-10-31 18:00',
      status: 'ongoing',
      status_name: '进行中',
      discount_desc: '订单满10万送全套安装辅材包，满20万返点8%',
      enrollment_count: 46,
      enrolled: false,
      policy: '1. 本次活动仅限浙江格宏认证经销商与签约服务商参与；\n2. 报名成功后，区域销售经理将在2小时内对接专享提货价；\n3. 支持分批提货，锁定活动低价至2026年底；\n4. 订货会特批专属账期与物流直达支持。',
      contact_person: '周经理',
      contact_phone: '13857108899',
      products: [
        { id: 1, name: '格宏智享系列 160变频多联室外机', model: 'GH-VK160-INV', original_price: 18800, campaign_price: 15600, discount_text: '直降 ¥3,200', stock_limit: 80, image: 'http://gh.starall.cn/static/resource/aircon/central-default.png' },
        { id: 2, name: '格宏全直流变频薄型风管机 36型', model: 'GH-FG36-DC', original_price: 4300, campaign_price: 3480, discount_text: '直降 ¥820', stock_limit: 150, image: 'http://gh.starall.cn/static/resource/aircon/notice-summer.png' },
        { id: 3, name: '格宏商用多联内机 71型四面出风', model: 'GH-4W71-INV', original_price: 6800, campaign_price: 5500, discount_text: '直降 ¥1,300', stock_limit: 60, image: 'http://gh.starall.cn/static/resource/aircon/notice-cloud.png' }
      ]
    },
    {
      id: 2,
      title: '秋季精选变频风管机限时促销',
      type: 'promotion',
      type_name: '限时促销',
      cover_image: 'http://gh.starall.cn/static/resource/aircon/notice-summer.png',
      banner_image: 'http://gh.starall.cn/static/resource/aircon/notice-summer.png',
      summary: '针对家装改善型与工装工程，指定机型整箱下单立减，限时限量供应！',
      start_time: '2026-09-20 00:00',
      end_time: '2026-10-15 23:59',
      status: 'ongoing',
      status_name: '进行中',
      discount_desc: '整箱采购立减15%，赠送原厂线控器',
      enrollment_count: 29,
      enrolled: false,
      policy: '1. 适用于住宅家装、小型餐饮及办公场所改造采购；\n2. 活动优惠不可与常规年度折扣重复叠加；\n3. 报名后业务员协助快速出具定制报价单。',
      contact_person: '陈主管',
      contact_phone: '13958116677',
      products: [
        { id: 4, name: '格宏臻悦系列 120超低温多联机', model: 'GH-ZY120-LT', original_price: 15200, campaign_price: 12900, discount_text: '直降 ¥2,300', stock_limit: 40, image: 'http://gh.starall.cn/static/resource/aircon/central-default.png' }
      ]
    },
    {
      id: 3,
      title: '全新VK6超低温空气源热泵新品上市品鉴会',
      type: 'new',
      type_name: '新品上市',
      cover_image: 'http://gh.starall.cn/static/resource/aircon/notice-cloud.png',
      banner_image: 'http://gh.starall.cn/static/resource/aircon/notice-cloud.png',
      summary: '格宏2026年度旗舰新品，超低温-35℃强劲制热，首批样机订购享50%样板房补贴！',
      start_time: '2026-10-01 09:00',
      end_time: '2026-11-20 18:00',
      status: 'upcoming',
      status_name: '预热中',
      discount_desc: '前20名报名者享工程样板补贴与免费技术培训',
      enrollment_count: 18,
      enrolled: false,
      policy: '1. 针对北方采暖及长江流域严寒工况重点推广；\n2. 优先为报名的认证服务商提供技术支持与方案设计配合。',
      contact_person: '王总工',
      contact_phone: '13738009922',
      products: [
        { id: 5, name: '格宏VK6 超低温空气源两联供热泵机组', model: 'GH-HP6-30KW', original_price: 36000, campaign_price: 29800, discount_text: '首发补贴 ¥6,200', stock_limit: 20, image: 'http://gh.starall.cn/static/resource/aircon/central-default.png' }
      ]
    },
    {
      id: 4,
      title: '2025款工程库存样机年终清仓让利',
      type: 'clearance',
      type_name: '清仓特惠',
      cover_image: 'http://gh.starall.cn/static/resource/aircon/ai-robot.png',
      banner_image: 'http://gh.starall.cn/static/resource/aircon/ai-robot.png',
      summary: '工程结余优质原厂未开封设备与展示样机，全场低至4折，一机一验，售完即止！',
      start_time: '2026-09-10 00:00',
      end_time: '2026-10-20 23:59',
      status: 'ongoing',
      status_name: '进行中',
      discount_desc: '低至4折，全机享原厂联保与检测报告',
      enrollment_count: 62,
      enrolled: false,
      policy: '1. 清仓设备均经过原厂出厂质检合格，保修政策等同全新设备；\n2. 库存先款先得，不支持口头留货。',
      contact_person: '周经理',
      contact_phone: '13857108899',
      products: [
        { id: 6, name: '格宏商用变频天花机 50型（原厂样机）', model: 'GH-TH50-DEMO', original_price: 5200, campaign_price: 2600, discount_text: '5折特价 ¥2,600', stock_limit: 12, image: 'http://gh.starall.cn/static/resource/aircon/notice-summer.png' }
      ]
    }
  ],
  enrollments: [
    {
      id: 1001,
      campaign_id: 1,
      campaign_title: '2026年浙江格宏秋季暖通订货会',
      campaign_type: 'order',
      campaign_cover: 'http://gh.starall.cn/static/resource/aircon/central-default.png',
      contact_name: '张工',
      mobile: '13800000000',
      company_name: '浙江格宏电器有限公司',
      intended_amount: '10-20万元',
      remark: '计划订购5套多联机及配套室内机，请业务经理联系确认交期。',
      status: 'followed',
      status_name: '已跟进',
      create_time: '2026-09-22 10:15',
      salesman_name: '周经理',
      salesman_phone: '13857108899',
      quote_info: '已出具初步选型清单'
    }
  ]
};

function priceOf(product) {
  return product.price || product.mockUnitPrice || 0;
}

function buildSolution(id, title, products) {
  const items = products.map((product, index) => ({
    productId: product.id,
    name: product.name,
    model: product.model,
    image: product.image,
    quantity: index + 1,
    unitPrice: priceOf(product),
    remark: ''
  }));
  const productTotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return {
    id,
    title,
    customerName: '未来科技大厦',
    projectName: title,
    items,
    pricingMode: 'discount',
    discount: 95,
    productTotal,
    totalPrice: Math.round(productTotal * 0.95),
    status: 'draft',
    shareToken: `mock-share-${id}`,
    updatedAt: now()
  };
}

// 使用数据文件中真实存在的商品生成两个演示报价单，避免写死不存在的商品 ID。
state.solutions = [
  buildSolution(1, '杭州·未来科技大厦', airProducts.slice(0, 3)),
  buildSolution(2, '绍兴·厂房降温改造', airProducts.slice(3, 5))
];
state.solutions[1].status = 'shared';

state.monitors = airProducts.slice(0, 4).map((product, index) => ({
  id: index + 1,
  productId: product.id,
  product,
  currentPrice: priceOf(product),
  previousPrice: priceOf(product) + (index + 1) * 300,
  changed: index !== 1,
  updatedAt: '2026-07-09 10:30',
  history: [
    { date: '2026-07-09', price: priceOf(product) },
    { date: '2026-06-21', price: priceOf(product) + (index + 1) * 300 },
    { date: '2026-05-10', price: priceOf(product) + (index + 1) * 600 }
  ]
}));

function wait(data) {
  return new Promise((resolve) => setTimeout(() => resolve(clone(data)), config.mockDelay || 0));
}

function success(data) {
  // Mock 直接返回 data，保持和 utils/api.js 对真实请求的最终返回值一致。
  return wait(data);
}

function fail(message) {
  return wait(null).then(() => Promise.reject(new Error(message)));
}

function getProductList(params = {}) {
  const keyword = String(params.keyword || '').trim().toLowerCase();
  const type = params.type && params.type !== 'all' ? params.type : '';
  const category = params.category && params.category !== 'all' ? String(params.category) : '';
  const page = Math.max(Number(params.page) || 1, 1);
  const pageSize = Math.max(Number(params.pageSize) || 20, 1);

  const matchesCategory = (product) => {
    if (!category) return true;
    const text = `${product.name} ${product.model} ${product.categoryName}`;
    if (category === 'multi') return product.productType === 'central' && /多联|GMV/.test(text);
    if (category === 'commercial') return product.productType === 'central' && !/多联|GMV|空气能/.test(text);
    if (category === 'air-energy') return /空气能/.test(text);
    if (category === 'wall') return product.productType === 'home' && !/柜|立式|柜机/.test(text);
    if (category === 'cabinet') return product.productType === 'home' && /柜|立式|柜机/.test(text);
    return product.series.toLowerCase().includes(category.toLowerCase()) || String(product.categoryId) === category;
  };

  const filtered = airProducts.filter((product) => {
    const text = `${product.name} ${product.model} ${product.sku} ${product.categoryName}`.toLowerCase();
    return (!type || product.productType === type)
      && matchesCategory(product)
      && (!keyword || text.includes(keyword));
  });

  return success({
    list: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageSize
  });
}

function getProductDetail(id) {
  const product = getProductById(id);
  if (!product) return fail('商品不存在');
  return success({
    ...product,
    basicInfo: [
      { label: '产品系列', value: product.series },
      { label: '产品类别', value: product.categoryName },
      { label: '产品编码', value: product.sku || '暂无数据' },
      { label: '适用场景', value: product.productType === 'central' ? '商业及住宅中央空调' : '家庭居住空间' }
    ],
    materials: [
      { id: 1, type: '参数表', name: `${product.model}产品参数表.pdf`, size: '2.68MB' },
      { id: 2, type: '说明书', name: `${product.model}安装使用说明书.pdf`, size: '3.12MB' },
      { id: 3, type: '认证资料', name: `${product.model}产品认证资料.pdf`, size: '0.98MB' }
    ],
    richText: `<h3>${product.name}</h3><p>高效节能、稳定可靠的空调产品。当前为 Mock 展示内容，真实图文资料由后台返回。</p>`
  });
}

function getMonitorList(params = {}) {
  const list = state.monitors.filter((item) => {
    if (params.status === 'changed') return item.changed;
    if (params.status === 'decreased') return item.currentPrice < item.previousPrice;
    return true;
  });
  return success({ list, total: list.length });
}

function saveSolution(payload = {}) {
  const productItems = (payload.items || []).map((item) => ({
    ...item,
    quantity: Math.max(Number(item.quantity) || 1, 1),
    unitPrice: Number(item.unitPrice) || 0
  }));
  const productTotal = productItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const pricingMode = payload.pricingMode === 'total' ? 'total' : 'discount';
  const discount = Number(payload.discount) || 100;
  const totalPrice = pricingMode === 'total'
    ? Number(payload.totalPrice) || productTotal
    : Math.round(productTotal * discount / 100);
  const item = {
    ...payload,
    id: payload.id || Date.now(),
    items: productItems,
    pricingMode,
    discount,
    productTotal,
    totalPrice,
    status: payload.status || 'draft',
    shareToken: payload.shareToken || `mock-share-${Date.now()}`,
    updatedAt: now()
  };
  const index = state.solutions.findIndex((solution) => String(solution.id) === String(item.id));
  if (index >= 0) state.solutions.splice(index, 1, item);
  else state.solutions.unshift(item);
  return success(item);
}

function routeKey(method, url) {
  return `${String(method).toUpperCase()} ${String(url).split('?')[0].replace(/^\//, '')}`;
}

/**
 * Mock 路由分发器。API 文件只需要传 method/url/data，切换真实服务时不改页面。
 */
export default function mockRequest({ method = 'GET', url = '', data = {} } = {}) {
  const key = routeKey(method, url);
  if (key === 'GET product/categories') return success({ central: getTaxonomy('central'), home: getTaxonomy('home') });
  if (key === 'GET product/list') return getProductList(data);
  if (key.startsWith('GET product/detail/')) return getProductDetail(key.split('/').pop());
  if (key === 'GET product/materials') return success([]);

  if (key === 'GET monitor/list') return getMonitorList(data);
  if (key.startsWith('POST monitor/toggle/')) {
    const productId = key.split('/').pop();
    const index = state.monitors.findIndex((item) => String(item.productId) === String(productId));
    if (index >= 0) state.monitors.splice(index, 1);
    else {
      const product = getProductById(productId);
      if (product) state.monitors.unshift({ id: Date.now(), productId: product.id, product, currentPrice: priceOf(product), previousPrice: priceOf(product), changed: false, updatedAt: now(), history: [] });
    }
    return success({ followed: index < 0 });
  }
  if (key.startsWith('GET monitor/history/')) {
    const item = state.monitors.find((monitor) => String(monitor.productId) === String(key.split('/').pop()));
    return success(item ? item.history : []);
  }

  if (key === 'GET solution/list') return success({ list: state.solutions, total: state.solutions.length });
  if (key.startsWith('GET solution/detail/')) return success(state.solutions.find((item) => String(item.id) === String(key.split('/').pop())) || null);
  if (key === 'POST solution/save' || key === 'PUT solution/save') return saveSolution(data);
  if (key.startsWith('POST solution/share/')) {
    const item = state.solutions.find((solution) => String(solution.id) === String(key.split('/').pop()));
    if (!item) return fail('报价单不存在');
    item.status = 'shared';
    return success({ ...item, shareUrl: `/pages/share/solution?id=${item.id}&token=${item.shareToken}` });
  }

  if (key === 'GET content/messages') return success({ list: state.messages, total: state.messages.length });
  if (key === 'GET content/notices') return success({ list: state.notices, total: state.notices.length });
  if (key.startsWith('GET content/notice/')) return success(state.notices.find((item) => String(item.id) === String(key.split('/').pop())) || null);
  if (key === 'POST content/feedback') { state.feedbacks.unshift({ ...data, id: Date.now(), createdAt: now() }); return success({ submitted: true }); }
  if (key === 'POST content/cooperation') { state.cooperation.unshift({ ...data, id: Date.now(), createdAt: now() }); return success({ submitted: true }); }

  if (key === 'POST login' || key === 'POST login/mobile' || key === 'POST weapp/login') return success({ token: state.token, user: state.user });
  if (key === 'POST logout') { state.token = ''; return success(true); }
  if (key === 'GET member/member') return success(state.user);
  if (key === 'PUT member/member') {
    state.user = { ...state.user, ...(data || {}) };
    if (data?.headimg && !data?.avatar) state.user.avatar = data.headimg;
    if (data?.avatar && !data?.headimg) state.user.headimg = data.avatar;
    return success(state.user);
  }
  if (key === 'PUT member/modify/nickname') {
    state.user.nickname = data?.nickname || state.user.nickname;
    return success(state.user);
  }
  if (key === 'PUT member/modify/headimg') {
    state.user.headimg = data?.headimg || state.user.headimg;
    state.user.avatar = data?.headimg || state.user.avatar;
    return success(state.user);
  }
  if (key === 'POST common/upload' || key === 'POST file/image') {
    return success({
      url: data?.filePath || '/static/avatars/avatar-demo.png',
      file_path: data?.filePath || '/static/avatars/avatar-demo.png',
      id: Date.now()
    });
  }
  if (key === 'GET member/account/balance') return success(state.balance);
  if (key === 'GET member/account/balance_list') {
    const tradeType = String(data.trade_type || '');
    const list = !tradeType
      ? state.balanceLogs
      : state.balanceLogs.filter((item) => item.from_type === tradeType || item.account_type === tradeType);
    return success({ data: list, total: list.length });
  }
  if (key === 'GET member/account/money') return success({ data: state.balanceLogs.filter((item) => item.account_type === 'money'), total: state.balanceLogs.length });
  if (key === 'GET member/cash_out/transfertype') return success(['wechat_code', 'alipay', 'bank']);
  if (key === 'GET member/cash_out/config') {
    return success({
      is_auto_transfer: 0,
      is_auto_verify: 0,
      is_open: 1,
      min: 10,
      rate: 0,
      transfer_type: ['wechat_code', 'alipay', 'bank']
    });
  }
  if (key === 'GET member/cashout_account/firstinfo') {
    const accountType = String(data.account_type || '');
    const item = state.cashoutAccounts.find((account) => account.account_type === accountType) || null;
    return success(item);
  }
  if (key.startsWith('GET member/cashout_account/')) {
    const item = state.cashoutAccounts.find((account) => String(account.account_id) === String(key.split('/').pop())) || null;
    return success(item);
  }
  if (key === 'POST member/cash_out/apply') {
    const account = state.cashoutAccounts.find((item) => String(item.account_id) === String(data.account_id));
    const record = {
      id: Date.now(),
      cash_out_no: `TX${Date.now()}`,
      apply_money: Number(data.apply_money || 0).toFixed(2),
      service_money: Number((Number(data.apply_money || 0) * Number((data.rate || 0)) / 100) || 0).toFixed(2),
      transfer_type: data.transfer_type,
      transfer_type_name: {
        wechat_code: '微信收款码',
        alipay: '支付宝',
        bank: '银行卡',
        wechatpay: '微信零钱'
      }[data.transfer_type] || '余额提现',
      status: 1,
      status_name: '待审核',
      create_time: now(),
      audit_time: '',
      transfer_time: '',
      refuse_reason: '',
      account_type: data.account_type || 'money',
      transfer_account: account?.account_no || '',
      transfer_realname: account?.realname || '张工',
      transfer_bank: account?.bank_name || ''
    };
    state.cashouts.unshift(record);
    return success(record.id);
  }
  if (key === 'GET member/cash_out') {
    const accountType = String(data.account_type || '');
    const list = accountType ? state.cashouts.filter((item) => String(item.account_type || 'money') === accountType) : state.cashouts;
    return success({ data: list, total: list.length });
  }
  if (key.startsWith('GET member/cash_out/')) {
    const item = state.cashouts.find((cashout) => String(cashout.id) === String(key.split('/').pop())) || null;
    return success(item);
  }
  if (key.startsWith('PUT member/cash_out/cancel/')) {
    const item = state.cashouts.find((cashout) => String(cashout.id) === String(key.split('/').pop()));
    if (!item) return fail('提现记录不存在');
    item.status = -2;
    item.status_name = '已取消';
    return success(true);
  }

  if (key === 'POST pay') {
    const tradeId = `MOCK-${Date.now()}`;
    state.payments[tradeId] = { trade_id: tradeId, status: 1, money: data.money || 0, trade_type: data.trade_type || 'solution' };
    return success({ trade_id: tradeId, trade_type: 'solution', status: 1 });
  }
  if (key.startsWith('GET pay/info/')) {
    const tradeId = key.split('/').pop();
    const info = state.payments[tradeId] || { trade_id: tradeId, status: 2, money: 0 };
    return success({ ...info, status: 2 });
  }

  if (key === 'POST ai/ask') {
    const question = String(data.question || '');
    const matched = airProducts.filter((product) => `${product.name} ${product.model} ${product.categoryName}`.includes(question)).slice(0, 3);
    const products = matched.length ? matched : airProducts.slice(0, 3);
    return success({
      answer: question.includes('参数')
        ? '我为你找到相关产品参数，下面可以直接查看详情。'
        : question.includes('报价') || question.includes('方案')
          ? '可以，建议先选择产品，我可以继续帮你组合报价单。'
          : '根据当前商品库，我为你推荐以下空调产品。',
      products,
      suggestions: ['帮我找适合120㎡的中央空调', '查看VK系列参数', '帮我做一个报价单']
    });
  }

  // 营销活动系列接口
  if (key === 'GET crm/marketing/campaigns') {
    let list = [...state.campaigns];
    if (data.type && data.type !== 'all') {
      list = list.filter((item) => item.type === data.type);
    }
    if (data.keyword) {
      const kw = String(data.keyword).trim().toLowerCase();
      list = list.filter((item) => (item.title && item.title.toLowerCase().includes(kw)) || (item.summary && item.summary.toLowerCase().includes(kw)));
    }
    // 标记当前用户是否已报名
    const enrolledIds = new Set(state.enrollments.filter((e) => e.status !== 'cancelled').map((e) => Number(e.campaign_id)));
    list = list.map((item) => ({
      ...item,
      enrolled: enrolledIds.has(Number(item.id))
    }));
    return success({ data: list, total: list.length });
  }

  if (key.startsWith('GET crm/marketing/campaign/')) {
    const rawId = key.split('?')[0].split('/').pop();
    const campaignId = Number(rawId);
    let campaign = state.campaigns.find(
      (item) => Number(item.id) === campaignId || String(item.id) === String(rawId)
    );
    if (!campaign && state.campaigns.length > 0) {
      campaign = state.campaigns[0];
    }
    if (!campaign) return fail('活动不存在或已下架');
    const myEnrollment = state.enrollments.find(
      (e) => (Number(e.campaign_id) === Number(campaign.id) || String(e.campaign_id) === String(campaign.id)) && e.status !== 'cancelled'
    );
    return success({
      ...campaign,
      enrolled: Boolean(myEnrollment),
      my_enrollment: myEnrollment || null
    });
  }

  if (key.startsWith('POST crm/marketing/campaign/') && key.endsWith('/enroll')) {
    const parts = key.split('/');
    const campaignId = Number(parts[3]);
    const campaign = state.campaigns.find((item) => Number(item.id) === campaignId);
    if (!campaign) return fail('活动不存在');
    const existing = state.enrollments.find((e) => Number(e.campaign_id) === campaignId && e.status !== 'cancelled');
    if (existing) return fail('您已报名该活动，无需重复提交');

    const newEnrollment = {
      id: Date.now(),
      campaign_id: campaignId,
      campaign_title: campaign.title,
      campaign_type: campaign.type,
      campaign_cover: campaign.cover_image,
      contact_name: data.contact_name || state.user?.nickname || '客户',
      mobile: data.mobile || state.user?.mobile || '',
      company_name: data.company_name || state.user?.company_name || '浙江格宏电器有限公司',
      intended_amount: data.intended_amount || '待确认',
      remark: data.remark || '',
      status: 'submitted',
      status_name: '待跟进',
      create_time: now(),
      salesman_name: campaign.contact_person || '专属业务经理',
      salesman_phone: campaign.contact_phone || '13857108899',
      quote_info: ''
    };
    state.enrollments.unshift(newEnrollment);
    campaign.enrollment_count = (campaign.enrollment_count || 0) + 1;
    return success(newEnrollment);
  }

  if (key === 'GET crm/marketing/enrollments') {
    let list = [...state.enrollments];
    if (data.status && data.status !== 'all') {
      list = list.filter((item) => item.status === data.status);
    }
    return success({ data: list, total: list.length });
  }

  if (key.startsWith('GET crm/marketing/enrollment/')) {
    const id = Number(key.split('/').pop());
    const enrollment = state.enrollments.find((item) => Number(item.id) === id);
    if (!enrollment) return fail('报名记录不存在');
    return success(enrollment);
  }

  if (key.startsWith('PUT crm/marketing/enrollment/') && key.endsWith('/cancel')) {
    const parts = key.split('/');
    const id = Number(parts[3]);
    const enrollment = state.enrollments.find((item) => Number(item.id) === id);
    if (!enrollment) return fail('报名记录不存在');
    if (enrollment.status === 'cancelled') return fail('该报名已取消');
    enrollment.status = 'cancelled';
    enrollment.status_name = '已取消';
    return success(true);
  }

  return fail(`Mock 未匹配接口：${key}`);
}

export { state };
