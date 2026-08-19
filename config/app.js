/**
 * 应用级配置集中管理文件。
 *
 * 新项目通常只需要修改这里的应用名称、接口地址和登录页地址，
 * 其他工具类和业务 API 不需要跟着项目复制多份配置。
 */
const config = {
  // 应用的基础信息，可用于页面标题、日志和埋点。
  appName: 'UniApp Template',
  appVersion: '1.0.0',

  // 接口模式：mock 用于前端独立开发，api 用于后续切换真实后台接口。
  apiMode: 'mock',
  mockDelay: 300,

  // 接口环境配置。切换为 api 后，把 baseUrl 换成真实服务地址即可。
  env: 'development',
  baseUrl: 'https://api.example.com',
  timeout: 60000,

  // 中文说明：
  // 这里单独给“会员/余额/提现”链路留一个可独立切换真实接口的配置。
  // 这么做的目的，是避免全局还在 mock 开发时，余额提现页面必须跟着一起切换。
  // 你后续如果已经有 niucloud 的真实接口地址，只需要把 memberApiMode 改成 'api'，
  // 再把 memberBaseUrl 填成真实后端地址即可。
  // 例如：
  // memberApiMode: 'api',
  // memberBaseUrl: 'https://你的域名/api/'
  //
  // 三种模式含义：
  // 1. inherit：继承全局 apiMode（默认）
  // 2. mock：会员链路固定走 mock
  // 3. api：会员链路固定走真实接口
  memberApiMode: 'inherit',
  memberBaseUrl: '',

  // 请求头中的客户端标识，后端可以据此区分 App、H5 和小程序请求。
  clientType: 'uni-app',

  // 响应数据约定。不同后端只需要调整字段名和成功码，不必重写请求封装。
  response: {
    codeField: 'code',
    dataField: 'data',
    messageField: 'msg',
    // niucloud 后端成功码为 1，兼容常见的 0 和 HTTP 风格 200。
    successCodes: [0, 1, 200]
  },

  // 登录与鉴权配置。
  auth: {
    // 字段名沿用 niucloud，后续切换真实接口时无需改 Store。
    tokenKey: 'wapToken',
    userInfoKey: 'wap_member_info',
    headerName: 'token',
    tokenPrefix: '',
    // 没有登录页的项目可以留空，避免模板请求失败后跳转到不存在的页面。
    loginPath: '',
    autoRedirect: false,
    // 这些接口不会自动带 Authorization 请求头。
    whiteList: ['/login', '/captcha', '/register']
  },

  // 请求错误是否自动弹出提示。需要静默请求时可在单次请求中传 showError: false。
  showRequestError: true
};

export default config;
