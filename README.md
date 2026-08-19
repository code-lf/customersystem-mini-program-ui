# 空调 CRM uni-app Vue 3 模板

这是一个基于 Vue 3、Pinia 和 uview-plus 的空调 CRM 小程序模板，当前默认使用本地 Mock 数据，适合先完成 UI 和业务流程，再切换真实后台接口。

## 开始使用

1. 修改 `config/app.js` 中的 `apiMode`、`baseUrl`、应用名称和鉴权配置。
2. 执行 `npm install` 安装项目依赖。
3. 使用 HBuilderX 打开项目并重新编译。
4. 页面组件优先使用 `up-*` 前缀，例如 `up-button`、`up-icon`，避免和 uni-app 原生组件重名。

## 目录说明

```text
api/       按业务拆分的接口文件
config/    应用配置和缓存键名
components/ 通用导航、产品卡片、方案卡片和消息组件
hooks/     可复用的 Vue 组合式逻辑
mock/      商品 JSON 适配、分类和本地业务 Mock
store/     Pinia 状态仓库
styles/    页面共享的 SCSS 样式
utils/     请求、缓存、导航、校验、格式化等工具
pages/     页面文件
uni_modules/uview-plus/  UI 组件库
```

## 常用工具

```js
import request from '@/utils/request'
import { formatTime, debounce } from '@/utils'
import { getStorage, setStorage } from '@/utils/storage'
import { useRequest } from '@/hooks/useRequest'
import { usePage } from '@/hooks/usePage'
```

请求封装会统一处理以下逻辑：

- 自动拼接 `config/app.js` 中的接口地址。
- 自动携带登录 token，并支持白名单接口。
- 自动解析 `{ code, data, msg }` 形式的接口响应。
- 统一处理网络错误、业务错误和 401 登录失效。
- 提供 `get`、`post`、`put`、`delete` 和 `upload` 方法。

## Mock 与真实接口

当前 `config/app.js` 默认配置为：

```js
apiMode: 'mock'
```

Mock 商品来自 `文档/商品目前数据.json`，通过 `mock/product-adapter.js` 转成页面统一结构。商品中心默认只展示空调类商品，冰箱、电风扇等原始记录不会进入主流程。

后续接入 `niucloud-admin` 后，将 `apiMode` 改成 `api`，并配置 `baseUrl`。登录、用户、余额、提现和支付接口已经按照 `niucloud` 的字段和路径预留。

Mock 阶段可以在登录页点击“使用演示账号快速登录”，默认用户为张工。

## 新项目迁移清单

- 把 `pages.json` 中的示例页面替换成自己的页面。
- 替换 `static/tabbar` 中的示例图标，或删除不需要的 `tabBar` 配置。
- 如果有登录页，将 `config/app.js` 中的 `auth.loginPath` 设置为实际页面路径，并开启 `autoRedirect`。
- 根据后端实际返回格式调整 `config.app.response` 的字段名和成功码。
- `api/common.js` 和 `api/user.js` 是示例接口，可以保留结构并替换地址，也可以直接删除后重新创建业务 API。

## 状态管理

Pinia 用于跨页面共享状态，用户 Store 已经内置 token 和 userInfo 的持久化逻辑：

```js
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
userStore.setToken('your-token')
userStore.setUserInfo({ name: '用户' })
```

模板中的工具类都带有中文注释，后续新增业务工具时建议继续按照“单一职责、可独立导入”的方式扩展，避免所有逻辑堆在一个文件中。
