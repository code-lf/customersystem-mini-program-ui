import { computed, ref } from 'vue';

/**
 * 把不同后端常见的分页返回结构统一成 list/total。
 * 支持：数组、{ list, total }、{ records, total }、{ rows, total }。
 */
function normalizePageResult(result) {
  if (Array.isArray(result)) {
    return { list: result, total: null };
  }

  const data = result && typeof result === 'object' ? result : {};
  const list = data.list || data.records || data.rows || data.items || [];
  const total = data.total ?? data.count ?? null;
  return {
    list: Array.isArray(list) ? list : [],
    total: Number.isFinite(Number(total)) ? Number(total) : null
  };
}

/**
 * 通用分页 Hook。
 *
 * 通过 serial 解决“刷新时上一页请求晚返回，覆盖新数据”的竞态问题；
 * 通过 getList/getTotal 兼容不同后端字段，不要求每个项目修改分页核心代码。
 */
export function usePage(fetchData, options = {}) {
  const {
    pageSize: initialPageSize = 10,
    initialPage = 1,
    immediate = false,
    getList,
    getTotal,
    onError
  } = options;

  const page = ref(initialPage);
  const pageSize = ref(initialPageSize);
  const total = ref(null);
  const list = ref([]);
  const loading = ref(false);
  const finished = ref(false);
  let requestSerial = 0;

  const hasMore = computed(() => !finished.value);

  const loadMore = async ({ reset = false } = {}) => {
    // 正常加载时阻止重复请求；刷新允许打断上一轮请求并开启新一轮。
    if (loading.value && !reset) return list.value;

    const currentSerial = ++requestSerial;
    if (reset) {
      page.value = initialPage;
      list.value = [];
      total.value = null;
      finished.value = false;
    }

    loading.value = true;
    try {
      const response = await fetchData({
        page: page.value,
        pageSize: pageSize.value
      });

      // 只处理最后一次请求，丢弃已经过期的响应。
      if (currentSerial !== requestSerial) return list.value;

      const normalized = normalizePageResult(response);
      const nextList = typeof getList === 'function' ? getList(response) : normalized.list;
      const nextTotal = typeof getTotal === 'function' ? getTotal(response) : normalized.total;
      const safeList = Array.isArray(nextList) ? nextList : [];

      list.value = reset ? safeList : list.value.concat(safeList);
      total.value = Number.isFinite(Number(nextTotal)) ? Number(nextTotal) : null;

      // 有 total 时按总数判断；没有 total 时按本页数量不足 pageSize 判断。
      finished.value = total.value !== null
        ? list.value.length >= total.value
        : safeList.length < pageSize.value;

      if (!finished.value) page.value += 1;
      return list.value;
    } catch (error) {
      if (currentSerial === requestSerial) {
        if (typeof onError === 'function') onError(error);
        else console.error('[usePage] 加载分页数据失败', error);
      }
      throw error;
    } finally {
      if (currentSerial === requestSerial) loading.value = false;
    }
  };

  const refresh = () => loadMore({ reset: true });

  if (immediate) {
    // 不阻塞 setup 执行，页面可以立即渲染 loading 状态。
    loadMore().catch(() => {});
  }

  return {
    page,
    pageSize,
    total,
    list,
    loading,
    finished,
    hasMore,
    loadMore,
    refresh
  };
}

export default usePage;
