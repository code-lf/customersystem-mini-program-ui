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
  company_name: '格宏暖通科技有限公司',
  company: '格宏暖通科技有限公司',
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
    { id: 1, type: '价格调整', title: '关于 VK 系列多联机价格调整的通知', summary: '部分型号价格上调，具体调整请查看公告详情。', time: '2026-06-01', views: 1286, image: '/static/aircon/central-vk.png' },
    { id: 2, type: '系统公告', title: '格宏助手小程序功能升级公告', summary: '产品资料、报价单和价格监控功能已上线。', time: '2026-05-20', views: 842, image: '/static/aircon/notice-cloud.png' },
    { id: 3, type: '活动政策', title: '2026 年夏季促销活动政策发布', summary: '夏季活动进行中，欢迎关注最新政策。', time: '2026-05-15', views: 1765, image: '/static/aircon/notice-summer.png' }
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
  payments: {}
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

  return fail(`Mock 未匹配接口：${key}`);
}

export { state };
