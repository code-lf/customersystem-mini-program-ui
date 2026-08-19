/**
 * 时间格式化工具。
 * 支持时间戳（秒/毫秒）、Date 和可被 Date 识别的字符串。
 * 可用占位符：YYYY、MM、DD、HH、mm、ss，也支持单字母写法。
 */
export function formatTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
  if (time === undefined || time === null || time === '') return '';

  let value = time;
  // 十位时间戳通常是秒，需要转换为 JavaScript 使用的毫秒。
  if (typeof value === 'number' && String(value).length === 10) {
    value *= 1000;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (number) => String(number).padStart(2, '0');
  const tokens = {
    YYYY: date.getFullYear(),
    YY: String(date.getFullYear()).slice(-2),
    M: date.getMonth() + 1,
    MM: pad(date.getMonth() + 1),
    D: date.getDate(),
    DD: pad(date.getDate()),
    H: date.getHours(),
    HH: pad(date.getHours()),
    h: date.getHours(),
    hh: pad(date.getHours()),
    m: date.getMinutes(),
    mm: pad(date.getMinutes()),
    s: date.getSeconds(),
    ss: pad(date.getSeconds())
  };

  return format.replace(/YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s/g, (token) => tokens[token]);
}

/**
 * 金额格式化，默认保留两位小数。
 * @param {number|string} value 金额
 * @param {number} digits 小数位数
 * @returns {string}
 */
export function formatMoney(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0.00';
  return number.toFixed(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 判断值是否为空，适合表单校验和列表展示。
 */
export function isEmpty(value) {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 将数字限制在指定区间内。
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value), min), max);
}

/**
 * 防抖函数。返回的函数带有 cancel 方法，页面卸载时可以主动取消定时器。
 */
export function debounce(fn, delay = 500) {
  let timer = null;
  const debounced = function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, delay);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return debounced;
}

/**
 * 节流函数，保证连续触发时在指定时间内最多执行一次。
 */
export function throttle(fn, delay = 500) {
  let lastTime = 0;
  let timer = null;
  const throttled = function(...args) {
    const now = Date.now();
    const remaining = delay - (now - lastTime);
    if (remaining <= 0) {
      if (timer) clearTimeout(timer);
      timer = null;
      lastTime = now;
      fn.apply(this, args);
      return;
    }
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        lastTime = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  };
  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastTime = 0;
  };
  return throttled;
}

/**
 * Promise 延时工具，适合轮询、动画和简单的重试间隔。
 */
export function sleep(delay = 0) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

const utils = {
  formatTime,
  formatMoney,
  isEmpty,
  clamp,
  debounce,
  throttle,
  sleep
};

export default utils;
