import { apiPost } from '../utils/api';

/**
 * AI 问答接口。Mock 阶段返回产品卡片，真实接入时保持参数和返回结构不变。
 */
export function askAi(question, history = []) {
  return apiPost('ai/ask', { question, history });
}
