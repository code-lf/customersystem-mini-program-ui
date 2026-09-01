# 格宏小助手 PHP 服务端接入包

这个目录用于交给现有 PHP 后端开发人员，将以下接口加入格宏现有系统：

```http
POST /api/ai/ask
```

小程序端已经按照该地址完成封装。服务端负责保存百炼 API Key、校验登录用户并调用百炼应用。

## 目录内容

- `BailianAiAssistantProxy.php`：无框架依赖的百炼代理类，包含请求校验、历史消息清洗、cURL 调用、错误处理和响应解析。
- `README.md`：当前接入说明。

## 已配置的百炼资源

| 项目 | 配置 |
| --- | --- |
| 应用名称 | 格宏小助手 |
| 应用 ID | `64455b17fc2c43efbc8ce2832c4eece4` |
| 地域 | 华北2（北京） |
| 知识库 | 格宏产品与服务知识库 |
| MCP | 格宏商品查询与选型服务 |
| 工具 | 商品搜索、商品详情、分类树、确认后创建报价单 |

## 运行要求

- PHP 7.4 或更高版本。
- 启用 PHP cURL 扩展。
- 服务器能够通过 HTTPS 访问 `dashscope.aliyuncs.com`。
- 后端接口超时建议设置为 120 秒。
- 生产环境必须使用 HTTPS。

## 环境变量

在后端服务器环境中配置：

```dotenv
DASHSCOPE_API_KEY=<请在服务器环境变量中填写百炼 API Key>
BAILIAN_APP_ID=64455b17fc2c43efbc8ce2832c4eece4
```

根据用户明确要求，完整 API Key 同时写入了 `BailianAiAssistantProxy.php` 的
`EMBEDDED_API_KEY`，因此即使后端暂未配置环境变量也可以读取到该值。程序的读取优先级为：

```text
构造函数传入值 > DASHSCOPE_API_KEY 环境变量
```

该 Key 属于敏感凭证。如果此目录被提交到 Gitee，Key 会进入 Git 历史；后续如需公开仓库，必须先在百炼控制台撤销该 Key 并创建新 Key。

注意事项：

1. 不要把真实 Key 写入 PHP 源码、Git、日志或接口响应。
2. 不要使用小程序传入的 `app_id` 覆盖服务端配置。
3. 用户提供的 API Key CSV 应保存在受控环境，不应进入代码仓库。
4. 如已发生密钥泄露，应立即在百炼控制台撤销并重新创建。

## ThinkPHP/NiuCloud 控制器接入示例

先把 `BailianAiAssistantProxy.php` 放入后端项目的服务类目录。以下代码只是适配示例，命名空间和公共返回方法应按现有系统调整：

```php
<?php

namespace app\api\controller;

use think\Response;

class AiAssistant
{
    public function ask(): Response
    {
        // 必须沿用现有会员登录中间件，并在这里取得真实登录会员。
        // 仅检查 token 字符串是否存在并不能代替后台的 Token 有效性校验。
        $member = request()->memberInfo ?? null;
        if (!$member) {
            return json(['code' => 401, 'msg' => '请先登录', 'data' => null], 401);
        }

        $payload = request()->post();

        try {
            require_once app_path() . 'service/BailianAiAssistantProxy.php';
            $proxy = new \BailianAiAssistantProxy();
            return json($proxy->ask($payload));
        } catch (\InvalidArgumentException $exception) {
            return json([
                'code' => 0,
                'msg' => $exception->getMessage(),
                'data' => null,
            ], 422);
        } catch (\Throwable $exception) {
            // 详细异常只写服务器日志，响应小程序时不要返回 Key、请求头或堆栈。
            trace('AI assistant error: ' . $exception->getMessage(), 'error');

            return json([
                'code' => 0,
                'msg' => 'AI 助手暂时不可用，请稍后重试',
                'data' => null,
            ], 502);
        }
    }
}
```

路由示例：

```php
// 必须挂载现有登录鉴权与限流中间件，实际中间件名称以项目为准。
Route::post('ai/ask', 'AiAssistant/ask')
    ->middleware([MemberAuth::class, AiRateLimit::class]);
```

## 请求格式

```json
{
  "question": "查询目前前三个空调商品名称和型号",
  "prompt": "查询目前前三个空调商品名称和型号",
  "session_id": "",
  "history": [
    {
      "role": "user",
      "content": "有哪些商用空调"
    },
    {
      "role": "assistant",
      "content": "目前包含柜式空调、多联机等产品。"
    }
  ],
  "app_id": "64455b17fc2c43efbc8ce2832c4eece4"
}
```

服务端会忽略前端 `app_id`，使用 `BAILIAN_APP_ID` 环境变量。`prompt` 只是兼容字段，存在 `question` 时优先使用 `question`。

## 成功响应

```json
{
  "code": 1,
  "msg": "SUCCESS",
  "data": {
    "answer": "以下是查询到的三个商品……",
    "response_id": "百炼响应ID",
    "session_id": "",
    "products": []
  }
}
```

当前商品结果由智能体整理为文本。如果后续需要小程序展示商品卡片，可以在后端解析 MCP 结果并把统一商品结构写入 `products`。

## 必须补充的生产安全措施

### 1. 登录鉴权

`/api/ai/ask` 必须复用现有会员 Token 鉴权。未登录用户建议返回 HTTP 401。

### 2. 限流

建议至少设置：

- 单用户：每分钟不超过 10 次。
- 单 IP：每分钟不超过 30 次。
- 单用户每日调用量和 Token 费用上限。
- 同一问题短时间重复提交时进行去重。

### 3. 开单保护

百炼提示词已经要求用户确认后才能创建报价单，但服务端仍需要二次保护：

- MCP 创建报价单接口必须校验当前登录用户 Token。
- 创建请求使用幂等键，避免网络重试产生重复业务单。
- 保存用户确认文本、商品、数量、价格、折扣及创建结果审计记录。
- 客户手机号和地址不得写入普通调试日志。

### 4. 日志脱敏

建议只记录：用户 ID、请求时间、百炼 `response_id`、耗时、HTTP 状态和错误码。不要记录：API Key、Authorization、完整手机号、安装地址、客户姓名。

## 联调步骤

1. 后端配置两个环境变量并重启 PHP-FPM/应用进程。
2. 注册 `POST /api/ai/ask` 路由并挂载登录、限流中间件。
3. 用登录后的业务 Token 调用只读问题。
4. 确认返回 `code=1` 且 `data.answer` 有内容。
5. 在微信开发者工具打开 AI 聊天页测试连续问答。
6. 将后端 HTTPS 域名加入微信公众平台的 `request 合法域名`。
7. 最后测试开单流程：未明确确认时不得创建；确认后只能创建一次。

PowerShell 联调示例：

```powershell
$body = @{
  question = '查询目前前三个空调商品名称和型号'
  history = @()
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri 'https://你的后端域名/api/ai/ask' `
  -Method Post `
  -Headers @{ token = '登录后取得的业务Token'; channel = '1' } `
  -ContentType 'application/json' `
  -Body $body
```

## 故障排查

| 现象 | 排查方向 |
| --- | --- |
| HTTP 401 | Key 无效、Key 与业务空间不匹配或用户未登录 |
| HTTP 403 | API Key 权限/IP 白名单配置不正确 |
| HTTP 404 | 后端未注册 `/api/ai/ask` 路由 |
| HTTP 429 | 百炼或业务接口触发限流 |
| HTTP 502 | 后端连接百炼失败，查看脱敏后的服务端日志 |
| cURL 超时 | 检查服务器公网访问、DNS、代理和接口超时配置 |
| 能回答但不查商品 | 检查线上应用版本是否已关联 MCP 并发布 |
| 知识库无结果 | 当前知识库没有资料或资料仍在解析中 |

## 接口依据

本示例使用阿里云百炼新版智能体同步 Responses API：

```text
POST https://dashscope.aliyuncs.com/api/v2/apps/agent/{APP_ID}/compatible-mode/v1/responses
Authorization: Bearer {DASHSCOPE_API_KEY}
```

后续如阿里云调整接口，只需修改 `BailianAiAssistantProxy.php` 中的地址、请求结构和 `extractAnswer()`，小程序页面无需改变。
