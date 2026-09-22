import { apiPost } from '../utils/api';

/** 按内机条码查询密码；统一请求层返回接口 data 字段。 */
export function queryBarcodePassword(innerBarcode) {
  return apiPost('crm/barcode-password/query', { inner_barcode: innerBarcode }, { showError: false });
}
