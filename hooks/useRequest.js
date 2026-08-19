import { ref } from 'vue';

/**
 * 通用请求状态 Hook。
 * 适合详情、提交表单、按钮操作等非分页请求场景。
 */
export function useRequest(requestFunction, options = {}) {
  const { immediate = false, initialData = null, onSuccess, onError } = options;
  const data = ref(initialData);
  const loading = ref(false);
  const error = ref(null);

  const execute = async (...args) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await requestFunction(...args);
      data.value = result;
      if (typeof onSuccess === 'function') onSuccess(result);
      return result;
    } catch (requestError) {
      error.value = requestError;
      if (typeof onError === 'function') onError(requestError);
      throw requestError;
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    data.value = initialData;
    error.value = null;
    loading.value = false;
  };

  if (immediate) execute().catch(() => {});

  return { data, loading, error, execute, reset };
}

export default useRequest;
