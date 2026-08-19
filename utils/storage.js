/**
 * uni-app 本地缓存工具。
 *
 * uni.setStorageSync 只能保存基础类型或对象，但对象在不同平台的序列化行为可能不完全一致，
 * 这里统一转成 JSON 保存，并在读取时自动还原，避免 userInfo 变成字符串的问题。
 */

/**
 * 读取缓存并自动尝试 JSON 反序列化。
 * @param {string} key 缓存键名
 * @param {*} defaultValue 读取不到或解析失败时的默认值
 * @returns {*}
 */
export function getStorage(key, defaultValue = null) {
  try {
    const value = uni.getStorageSync(key);

    // uni.getStorageSync 在不同平台上可能返回空字符串或 undefined。
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }

    if (typeof value !== 'string') {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      // 兼容历史上直接保存的普通字符串，例如旧版本 token。
      return value;
    }
  } catch (error) {
    console.warn(`[storage] 读取缓存失败：${key}`, error);
    return defaultValue;
  }
}

/**
 * 写入缓存。对象、数组和基础类型都统一转为字符串保存。
 * @param {string} key 缓存键名
 * @param {*} value 缓存值
 * @returns {boolean} 是否写入成功
 */
export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] 写入缓存失败：${key}`, error);
    return false;
  }
}

/**
 * 删除指定缓存。
 * @param {string} key 缓存键名
 */
export function removeStorage(key) {
  try {
    uni.removeStorageSync(key);
  } catch (error) {
    console.warn(`[storage] 删除缓存失败：${key}`, error);
  }
}

/**
 * 判断缓存是否存在。
 * @param {string} key 缓存键名
 * @returns {boolean}
 */
export function hasStorage(key) {
  try {
    const value = uni.getStorageSync(key);
    return value !== undefined && value !== null && value !== '';
  } catch (error) {
    return false;
  }
}

export default {
  get: getStorage,
  set: setStorage,
  remove: removeStorage,
  has: hasStorage
};
