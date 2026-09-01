/**
 * 应用级配置集中管理文件。
 *
 * 新项目通常只需要修改这里的应用名称、接口地址和登录页地址，
 * 其他工具类和业务 API 不需要跟着项目复制多份配置。
 */
const config = {
  // 应用的基础信息，可用于页面标题、日志和埋点。
  appName: '格宏助手',
  appVersion: '1.0.0',

  // 接口模式：mock 用于前端独立开发，api 用于后续切换真实后台接口。
  apiMode: 'api',
  mockDelay: 300,

  // 正式业务接口前缀。所有 api/*.js 中的相对路径都会自动拼接在该地址后面，
  // 例如 `crm/quote/lists` 最终请求为：
  // https://gh.starall.cn/api/crm/quote/lists
  env: 'production',
  baseUrl: 'https://gh.starall.cn/api',
  timeout: 60000,

  // 阿里云百炼 AI 助手配置。
  // appId 可以公开，但 DASHSCOPE_API_KEY 必须只配置在后端服务器环境变量中。
  aiAssistant: {
    appId: '64455b17fc2c43efbc8ce2832c4eece4',
    // 小程序调用自己的后端代理；最终请求地址为 baseUrl + /ai/ask。
    proxyPath: 'ai/ask',
    timeout: 120000,
    // 发送给后端的历史消息上限，20 条大约对应 10 轮用户与助手对话。
    maxHistoryMessages: 20
  },

  memberApiMode: 'inherit',
  memberBaseUrl: '',

  // 请求头中的客户端标识，后端可以据此区分 App、H5 和小程序请求。
  clientType: '1',

  // 响应数据约定。不同后端只需要调整字段名和成功码，不必重写请求封装。
  response: {
    codeField: 'code',
    dataField: 'data',
    messageField: 'msg',
    // niucloud / ThinkPHP 成功码为 1，HTTP 风格为 200；code: 0 为业务失败（如未绑定经销商）
    successCodes: [1, 200]
  },

  // 登录与鉴权配置。
  auth: {
    // 字段名沿用 niucloud，后续切换真实接口时无需改 Store。
    tokenKey: 'wapToken',
    userInfoKey: 'wap_member_info',
    headerName: 'token',
    tokenPrefix: '',
    // 登录页地址
    loginPath: '/pages/auth/login',
    autoRedirect: false,
    // 这些接口不会自动带 Authorization 请求头。
    whiteList: ['/login', '/captcha', '/register']
  },

  // 请求错误是否自动弹出提示。需要静默请求时可在单次请求中传 showError: false。
  showRequestError: true
};

export default config;
