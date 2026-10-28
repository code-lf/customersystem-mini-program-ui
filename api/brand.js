import { apiGet } from '../utils/api';

/** 获取后台已上架品牌；统一请求层已剥离 code/msg/data，保留服务端排序，不使用本地品牌兜底。 */
export function getBrandList() {
  return apiGet('crm/brand/list', {}, { apiMode: 'api' });
}
