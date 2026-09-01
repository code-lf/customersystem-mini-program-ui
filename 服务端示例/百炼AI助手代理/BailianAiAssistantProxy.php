<?php

declare(strict_types=1);

/**
 * 阿里云百炼“格宏小助手”服务端代理。
 *
 * 这个文件不依赖 ThinkPHP、Laravel 或其他第三方 SDK，只依赖 PHP cURL 扩展。
 * 后端同事可以直接 require_once 本文件，然后在现有控制器中调用 ask()。
 *
 * 安全边界：
 * 1. DASHSCOPE_API_KEY 只能从服务器环境变量读取，绝不能接收前端传入的 Key。
 * 2. APP ID 同样优先使用服务器配置，不信任小程序提交的 app_id。
 * 3. 用户登录校验、接口限流和操作审计应继续使用现有后台的中间件实现。
 */
final class BailianAiAssistantProxy
{
    /** 新版智能体（Agent 2.0）同步 Responses API 地址。 */
    private const ENDPOINT_TEMPLATE =
        'https://dashscope.aliyuncs.com/api/v2/apps/agent/%s/compatible-mode/v1/responses';

    /** 防止前端提交超长内容造成异常费用或拖慢接口。 */
    private const MAX_QUESTION_LENGTH = 4000;
    private const MAX_HISTORY_MESSAGES = 20;
    private const MAX_HISTORY_CONTENT_LENGTH = 8000;

    /** @var string */
    private $apiKey;

    /** @var string */
    private $appId;

    /** @var int */
    private $timeoutSeconds;

    /**
     * @param string|null $apiKey 为空时读取 DASHSCOPE_API_KEY
     * @param string|null $appId 为空时读取 BAILIAN_APP_ID
     * @param int $timeoutSeconds 包含 MCP 工具调用时可能较慢，建议 60~120 秒
     */
    public function __construct(
        ?string $apiKey = null,
        ?string $appId = null,
        int $timeoutSeconds = 120
    ) {
        // 优先级：构造函数显式传入 > 服务器环境变量。
        // 禁止在 PHP 文件中提供内置 Key，避免密钥随 Git 提交进入永久历史。
        $environmentApiKey = getenv('DASHSCOPE_API_KEY');
        $this->apiKey = trim((string) (
            $apiKey
            ?: $environmentApiKey
        ));
        $this->appId = trim((string) ($appId ?: getenv('BAILIAN_APP_ID')));
        $this->timeoutSeconds = max(10, min($timeoutSeconds, 180));

        if ($this->apiKey === '') {
            throw new RuntimeException('服务端未配置 DASHSCOPE_API_KEY');
        }

        if ($this->appId === '') {
            throw new RuntimeException('服务端未配置 BAILIAN_APP_ID');
        }
    }

    /**
     * 处理小程序提交的问答请求，并返回与现有前端一致的 code/data/msg 结构。
     *
     * 推荐传入结构：
     * {
     *   "question": "查询三款柜式空调",
     *   "history": [{"role":"user","content":"..."}]
     * }
     *
     * @param array $clientPayload 小程序请求 JSON 解析后的数组
     * @return array
     */
    public function ask(array $clientPayload): array
    {
        // 兼容小程序封装中的 question 和 prompt，但只取其中一个，避免重复发送。
        $question = trim((string) ($clientPayload['question'] ?? $clientPayload['prompt'] ?? ''));
        $this->validateQuestion($question);

        $history = $this->normalizeHistory($clientPayload['history'] ?? []);

        // Responses API 支持把完整历史消息数组放入 input。
        // 当前问题必须最后加入，确保模型把它作为本轮要回答的内容。
        $input = $history;
        $input[] = [
            'role' => 'user',
            'content' => $question,
        ];

        $remoteResponse = $this->requestBailian([
            'input' => $input,
        ]);

        $answer = $this->extractAnswer($remoteResponse);
        if ($answer === '') {
            throw new RuntimeException('百炼调用成功，但响应中没有可展示的文本');
        }

        return [
            'code' => 1,
            'msg' => 'SUCCESS',
            'data' => [
                'answer' => $answer,
                // Responses API 返回的 id 用于问题追踪，不应当当作登录凭证。
                'response_id' => (string) ($remoteResponse['id'] ?? ''),
                // 当前实现使用“完整 history”维持上下文，因此原样返回前端会话标识即可。
                'session_id' => (string) ($clientPayload['session_id'] ?? ''),
                // 为小程序商品卡片预留字段；没有结构化结果时返回空数组。
                'products' => [],
            ],
        ];
    }

    /**
     * 校验单次问题。mb_strlen 使用 UTF-8 字符数量，中文不会被按三个字节误算。
     */
    private function validateQuestion(string $question): void
    {
        if ($question === '') {
            throw new InvalidArgumentException('请输入要咨询的问题');
        }

        $length = function_exists('mb_strlen')
            ? mb_strlen($question, 'UTF-8')
            : strlen($question);

        if ($length > self::MAX_QUESTION_LENGTH) {
            throw new InvalidArgumentException(
                '问题长度不能超过 ' . self::MAX_QUESTION_LENGTH . ' 个字符'
            );
        }
    }

    /**
     * 清洗历史消息：
     * - 只允许 user/assistant，防止客户端伪造 system 消息覆盖应用提示词；
     * - 只保留最近 20 条，限制 Token 消耗；
     * - 跳过空消息和非数组数据。
     *
     * @param mixed $history
     * @return array
     */
    private function normalizeHistory($history): array
    {
        if (!is_array($history)) {
            return [];
        }

        $history = array_slice($history, -self::MAX_HISTORY_MESSAGES);
        $normalized = [];

        foreach ($history as $message) {
            if (!is_array($message)) {
                continue;
            }

            $role = (string) ($message['role'] ?? '');
            // 兼容旧页面中使用的 ai 角色名。
            if ($role === 'ai') {
                $role = 'assistant';
            }

            if (!in_array($role, ['user', 'assistant'], true)) {
                continue;
            }

            $content = trim((string) ($message['content'] ?? $message['text'] ?? ''));
            if ($content === '') {
                continue;
            }

            if (function_exists('mb_substr')) {
                $content = mb_substr($content, 0, self::MAX_HISTORY_CONTENT_LENGTH, 'UTF-8');
            } else {
                $content = substr($content, 0, self::MAX_HISTORY_CONTENT_LENGTH);
            }

            $normalized[] = [
                'role' => $role,
                'content' => $content,
            ];
        }

        return $normalized;
    }

    /**
     * 使用 cURL 调用阿里云百炼。
     *
     * @param array $requestBody
     * @return array
     */
    private function requestBailian(array $requestBody): array
    {
        if (!function_exists('curl_init')) {
            throw new RuntimeException('PHP 未安装或未启用 cURL 扩展');
        }

        $url = sprintf(self::ENDPOINT_TEMPLATE, rawurlencode($this->appId));
        $jsonBody = json_encode($requestBody, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($jsonBody === false) {
            throw new RuntimeException('百炼请求参数 JSON 编码失败');
        }

        $curl = curl_init($url);
        if ($curl === false) {
            throw new RuntimeException('无法初始化 cURL');
        }

        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json',
                'Authorization: Bearer ' . $this->apiKey,
            ],
            CURLOPT_POSTFIELDS => $jsonBody,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => $this->timeoutSeconds,
            // 必须校验 HTTPS 证书，不能为了省事关闭证书验证。
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $rawBody = curl_exec($curl);
        $curlError = curl_error($curl);
        $httpStatus = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($rawBody === false) {
            // 错误内容里不包含 API Key，可以写入服务端错误日志。
            throw new RuntimeException('请求百炼失败：' . ($curlError ?: '未知网络错误'));
        }

        $decoded = json_decode($rawBody, true);
        if (!is_array($decoded)) {
            throw new RuntimeException('百炼返回了无法解析的 JSON，HTTP 状态：' . $httpStatus);
        }

        if ($httpStatus < 200 || $httpStatus >= 300) {
            // 只向上抛出错误码和消息，不记录 Authorization 请求头或完整密钥。
            $remoteCode = (string) ($decoded['code'] ?? $decoded['error']['code'] ?? 'UNKNOWN');
            $remoteMessage = (string) (
                $decoded['message']
                ?? $decoded['error']['message']
                ?? '百炼服务调用失败'
            );

            throw new RuntimeException(sprintf(
                '百炼服务异常（HTTP %d，%s）：%s',
                $httpStatus,
                $remoteCode,
                $remoteMessage
            ));
        }

        return $decoded;
    }

    /**
     * 从 Responses API 响应中提取最终文本。
     *
     * 标准结构通常为：
     * output[].type = message
     * output[].content[].type = output_text
     * output[].content[].text = 最终回答
     *
     * 同时兼容 output_text、output.text 等常见代理结构，便于后续升级。
     */
    private function extractAnswer(array $response): string
    {
        if (!empty($response['output_text']) && is_string($response['output_text'])) {
            return trim($response['output_text']);
        }

        $texts = [];
        $outputs = $response['output'] ?? [];

        if (is_array($outputs)) {
            foreach ($outputs as $output) {
                if (!is_array($output)) {
                    continue;
                }

                if (!empty($output['text']) && is_string($output['text'])) {
                    $texts[] = $output['text'];
                }

                $contents = $output['content'] ?? [];
                if (!is_array($contents)) {
                    continue;
                }

                foreach ($contents as $content) {
                    if (!is_array($content)) {
                        continue;
                    }

                    if (
                        in_array((string) ($content['type'] ?? ''), ['output_text', 'text'], true)
                        && isset($content['text'])
                        && is_string($content['text'])
                    ) {
                        $texts[] = $content['text'];
                    }
                }
            }
        }

        // 兼容部分旧代理把最终文本放在 output.text 的情况。
        if (isset($response['output']['text']) && is_string($response['output']['text'])) {
            $texts[] = $response['output']['text'];
        }

        return trim(implode("\n", array_filter($texts, 'strlen')));
    }
}
