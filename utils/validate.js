/**
 * 常用表单校验工具。
 * 规则保持简单通用，复杂业务规则建议在具体页面中组合使用。
 */

export const isPhone = (value) => /^1[3-9]\d{9}$/.test(String(value || ''));
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
export const isUrl = (value) => /^(https?:\/\/)[^\s]+$/i.test(String(value || ''));
export const isIdCard = (value) => /(^\d{15}$)|(^\d{17}[\dXx]$)/.test(String(value || ''));

/**
 * 生成适用于 uni-form 的校验函数。
 * @param {Function} validator 实际校验函数
 * @param {string} message 校验失败提示
 */
export function createRule(validator, message) {
  return {
    validator: (_rule, value, callback) => {
      if (validator(value)) {
        callback();
      } else {
        callback(new Error(message));
      }
    }
  };
}

export default {
  isPhone,
  isEmail,
  isUrl,
  isIdCard,
  createRule
};
