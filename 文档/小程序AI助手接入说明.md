# 小程序 AI 助手接入说明

## 当前配置

- 百炼应用：`格宏小助手`
- 应用 ID：`64455b17fc2c43efbc8ce2832c4eece4`
- 小程序代理接口：`POST /api/ai/ask`
- 前端统一封装：`api/ai-assistant.js`
- 已关联 MCP：商品搜索、商品详情、分类树、确认后创建报价单
- 已关联知识库：`格宏产品与服务知识库`

## 为什么不能让小程序直接调用百炼

百炼 API 使用 `DASHSCOPE_API_KEY` 鉴权。微信小程序代码发布后可以被下载和分析，因此把密钥写进源码、前端 `.env` 或本地缓存都会导致密钥泄露。正确链路如下：

```text
微信小程序 -> 格宏业务后端 /api/ai/ask -> 阿里云百炼应用 API
```

小程序登录 Token 仍由现有 `utils/request.js` 自动加入请求头；百炼 API Key 只由格宏后端读取。

## 后端代理接口约定

请求示例：

```json
{
  "question": "查询三款柜式空调",
  "prompt": "查询三款柜式空调",
  "session_id": "可为空",
  "history": [
    { "role": "user", "content": "上一轮问题" },
    { "role": "assistant", "content": "上一轮回答" }
  ],
  "app_id": "64455b17fc2c43efbc8ce2832c4eece4"
}
```

推荐响应：

```json
{
  "code": 1,
  "msg": "SUCCESS",
  "data": {
    "answer": "AI 返回的文本答案",
    "session_id": "百炼会话ID",
    "products": []
  }
}
```

后端应从服务器环境变量读取：

```text
DASHSCOPE_API_KEY=真实密钥
BAILIAN_APP_ID=64455b17fc2c43efbc8ce2832c4eece4
```

后端不要信任前端传入的 `app_id`，生产环境应始终用 `BAILIAN_APP_ID` 覆盖。

## 小程序测试步骤

1. 后端实现并部署 `POST /api/ai/ask`。
2. 确认 `config/app.js` 的 `baseUrl` 指向后端 HTTPS 地址。
3. 在微信公众平台把该 HTTPS 域名加入“request 合法域名”。
4. 微信开发者工具中重新编译小程序。
5. 打开 TabBar 的 AI 页面，进入聊天页。
6. 先测试只读问题：`查询目前前三个空调商品名称和型号`。
7. 再测试连续对话，确认上下文有效。
8. 测试开单时，在用户明确回复“确认创建”前，不应产生业务单。

## 后续修改位置

- 更换百炼应用或代理路径：修改 `config/app.js` 的 `aiAssistant`。
- 兼容后端新返回字段：只修改 `api/ai-assistant.js` 的 `normalizeResponse`。
- 修改聊天界面：修改 `pages/ai/chat.vue`，不需要接触密钥或百炼请求结构。
