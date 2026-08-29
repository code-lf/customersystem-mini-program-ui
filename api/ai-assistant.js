import config from '../config/app';
import request from '../utils/request';

/**
 * 格宏 AI 助手统一接入层。
 *
 * 设计目的：
 * 1. 页面只关心“发送问题”和“显示答案”，不直接依赖阿里云百炼的数据结构。
 * 2. 百炼应用 ID、代理接口路径、超时时间都集中放在 config/app.js，后续更换应用时只改配置。
 * 3. 小程序始终请求自己的业务后端，由后端携带 DASHSCOPE_API_KEY 调用百炼。
 *
 * 安全说明：
 * API Key 绝对不能写进 uni-app 源码、.env 前端变量或 uni.setStorageSync。
 * 微信小程序发布后代码可以被用户下载和分析，任何前端密钥都等同于公开。
 */

/**
 * 将页面消息转换成后端容易处理的精简历史记录。
 * 只保留最近若干轮文本消息，避免历史无限增长导致请求体和模型 Token 费用持续增加。
 */
function normalizeHistory(history = []) {
  const maxMessages = Number(config.aiAssistant?.maxHistoryMessages || 20);

  return history
    .filter((item) => item && item.text && ['user', 'assistant', 'ai'].includes(item.role))
    .slice(-maxMessages)
    .map((item) => ({
      // 页面历史代码使用 ai，百炼/大多数模型接口使用 assistant，这里统一转换。
      role: item.role === 'ai' ? 'assistant' : item.role,
      content: String(item.text)
    }));
}

/**
 * 兼容后端代理和百炼常见的多种返回结构。
 * 推荐后端最终统一返回：
 * { code: 1, data: { answer, session_id, products } }
 */
function normalizeResponse(result = {}) {
  const output = result.output || {};
  const text = result.answer
    || result.text
    || result.message
    || output.text
    || output.answer
    || output.message
    || (Array.isArray(output.texts) ? output.texts[0]?.text || output.texts[0] : '');

  return {
    text: String(text || 'AI 助手暂未返回文本内容，请稍后重试。'),
    sessionId: result.session_id || result.sessionId || output.session_id || '',
    // products 是为后续商品卡片预留的结构化字段；没有时正常显示纯文本答案。
    products: Array.isArray(result.products)
      ? result.products
      : (Array.isArray(output.products) ? output.products : []),
    raw: result
  };
}

/**
 * 发送一条 AI 消息。
 *
 * @param {string} question 用户本次提问
 * @param {Array} history 当前页面历史消息
 * @param {object} options 可选会话参数
 * @returns {Promise<{text: string, sessionId: string, products: Array, raw: object}>}
 */
export async function askAi(question, history = [], options = {}) {
  const content = String(question || '').trim();
  if (!content) throw new Error('请输入要咨询的问题');

  const aiConfig = config.aiAssistant || {};
  const payload = {
    // 同时提供 question 与 prompt，方便现有后端和百炼代理逐步迁移。
    question: content,
    prompt: content,
    history: normalizeHistory(history),
    session_id: options.sessionId || '',
    // 应用 ID 不是密钥，可以传递；生产后端仍建议使用自己的环境变量覆盖该值。
    app_id: aiConfig.appId || ''
  };

  const result = await request.post(aiConfig.proxyPath || 'ai/ask', payload, {
    // AI 链路无论全局是否处于 mock 模式，都明确走后端代理。
    apiMode: 'api',
    timeout: aiConfig.timeout || 120000,
    // 页面会显示更友好的失败消息，避免网络层与页面层重复弹 Toast。
    showError: false,
    errorMessage: 'AI 助手暂时不可用'
  });

  return normalizeResponse(result);
}

export default {
  ask: askAi
};
