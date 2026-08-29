import { login as authLogin } from './auth';
import { getMemberInfo, updateMemberInfo, modifyMemberField } from './member';
import { uploadFile } from './common';

/**
 * 登录
 * @param {object} data 
 */
export function login(data) {
  return authLogin(data);
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return getMemberInfo();
}

/**
 * 更新用户个人资料
 */
export function updateUserInfo(data) {
  return updateMemberInfo(data);
}

/**
 * 修改指定字段
 */
export function updateUserField(field, value) {
  return modifyMemberField(field, value);
}

/**
 * 上传头像文件
 */
export function uploadUserAvatar(filePath) {
  return uploadFile(filePath, 'file');
}
 