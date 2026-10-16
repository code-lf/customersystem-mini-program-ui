/** 历史已跟进、已转报价记录统一视为已通过；筛选请求只使用新版状态码。 */
export const normalizeEnrollmentStatus = (status) => ['followed', 'quoted'].includes(status) ? 'approved' : status;

/** 客户端报名状态文案：初始待处理状态按产品要求显示“已报名”。 */
export const formatEnrollmentStatus = (status) => ({
  submitted: '已报名',
  approved: '已通过',
  cancelled: '已作废'
}[normalizeEnrollmentStatus(status)] || '状态未知');

/** 新接口允许已报名、已通过取消，作废记录不能再次取消。 */
export const canCancelEnrollment = (status) => ['submitted', 'approved'].includes(normalizeEnrollmentStatus(status));
