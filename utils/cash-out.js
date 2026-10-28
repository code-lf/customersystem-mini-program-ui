/** 审核通过对应待转账，不能把审核通过或微信页面打开成功当成已到账。 */
export function cashOutStatus(record = {}) {
  return ({ 1: '待审核', 2: '审核通过，待转账', 3: '已转账', 4: '转账处理中', '-1': '已拒绝', '-2': '已取消' })[Number(record.status)]
    || record.status_name || '处理中';
}

/** 按 Gitee 标准字段透传签名包，不拼装、解码或修改 package_info。 */
export function merchantTransferOptions(transfer) {
  const options = { mchId: transfer?.extra?.mch_id, appId: transfer?.extra?.appid, package: transfer?.package_info };
  if (!options.mchId || !options.appId || !options.package) throw new Error('收款参数不完整，请刷新后重试或联系管理员');
  return options;
}

/** 只检查并调起微信原生确认页；调用成功仅表示展示成功，到账以后端查询为准。 */
export function openMerchantTransfer(options, client) {
  return new Promise((resolve, reject) => {
    if (!client || typeof client.requestMerchantTransfer !== 'function') {
      reject(new Error('请使用支持确认收款的新版微信小程序'));
      return;
    }
    client.requestMerchantTransfer({ ...options, success: resolve, fail: reject, cancel: reject });
  });
}
