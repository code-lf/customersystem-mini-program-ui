/**
 * 应用级配置集中管理文件。
 *
 * 新项目通常只需要修改这里的应用名称、接口地址和登录页地址，
 * 其他工具类和业务 API 不需要跟着项目复制多份配置。
 */
// 小程序运行时没有 Node.js 的 url 模块。若在通用配置中直接读取 import.meta.env，
// 当前 uni-app 编译器会把它转换成 require('url')，导致微信小程序启动时报模块缺失。
// 因此先给所有非 H5 平台设置可直接使用的正式接口地址。
let apiBaseUrl = 'https://gh.starall.cn/api';
// #ifdef H5
// H5 开发时通过 Vite 环境变量覆盖接口；未配置时交给 vite.config.js 的 /api 代理。
apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
// #endif

// 渠道必须与 niucloud ChannelDict 对齐，不能使用数字客户端编号。
// 后端支付驱动根据 weapp 选择小程序 AppID，否则可能误用公众号 AppID。
let clientChannel = 'h5';
// #ifdef MP-WEIXIN
clientChannel = 'weapp';
// #endif
// #ifdef APP-PLUS
clientChannel = 'app';
// #endif
// #ifdef H5
// 微信内网页与普通浏览器分开，保持与参考项目 getAppChannel 一致。
clientChannel = typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent) ? 'wechat' : 'h5';
// #endif

const config = {
  // 应用的基础信息，可用于页面标题、日志和埋点。
  appName: '格宏家电助手',
  appVersion: '1.0.0',
  // 服务号原始 ID（gh_ 开头），不是 AppID、显示名称或普通微信号。
  // 在微信公众平台“账号详情”中获取；未配置时直接使用真实二维码页兜底，不填演示 ID。
  officialAccount: { originalId: 'gh_20f063b3e60a' },

  // 接口模式：mock 用于前端独立开发，api 用于后续切换真实后台接口。
  apiMode: 'api',
  mockDelay: 300,

  // 正式业务接口前缀。所有 api/*.js 中的相对路径都会自动拼接在该地址后面，
  // 例如 `crm/quote/lists` 最终请求为：
  // H5 预览环境下使用 /api 同源反向代理，彻底解决浏览器跨域拦截；
  // 小程序生产环境直连 https://gh.starall.cn/api
  env: 'production',
  baseUrl: apiBaseUrl,
  timeout: 60000,

  // 阿里云百炼 AI 助手配置。
  // appId 可以公开，但 DASHSCOPE_API_KEY 必须只配置在后端服务器环境变量中。
  aiAssistant: {
    appId: '64455b17fc2c43efbc8ce2832c4eece4',
    // 小程序调用自己的后端代理；最终请求地址为 baseUrl + /ai/ask。
    proxyPath: 'ai/ask',
    // 微信小程序流式接口，后端以 text/event-stream 返回统一 SSE 事件。
    streamProxyPath: 'ai/ask-stream',
    timeout: 120000,
    // 工具查询可能延迟首字；预留 30 秒等待，避免 3 秒即中止正常流式请求并重复生成。
    streamFirstDeltaTimeout: 30000,
    // 发送给后端的历史消息上限，20 条大约对应 10 轮用户与助手对话。
    maxHistoryMessages: 20
  },

  memberApiMode: 'inherit',
  memberBaseUrl: '',

  // 通用请求/文件上传使用的 channel 请求头：小程序 weapp，微信网页 wechat，普通网页 h5，App app。
  clientType: clientChannel,

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
