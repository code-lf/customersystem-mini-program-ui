/**
 * 通用轮询工具。
 * 支付、订单状态、导出任务等场景都可以复用，不再每个 API 文件重复写 setInterval。
 */
export function pollUntil({
  request,
  validate,
  interval = 2000,
  timeout = 30000,
  immediate = true,
  continueOnError = false
}) {
  if (typeof request !== 'function' || typeof validate !== 'function') {
    return Promise.reject(new TypeError('pollUntil 需要 request 和 validate 函数'));
  }

  return new Promise((resolve, reject) => {
    let timer = null;
    let timeoutTimer = null;
    let settled = false;

    const finish = (handler, value) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      handler(value);
    };

    const check = async () => {
      if (settled) return;
      try {
        const result = await request();
        if (validate(result)) {
          finish(resolve, result);
          return;
        }
        timer = setTimeout(check, interval);
      } catch (error) {
        if (continueOnError) {
          timer = setTimeout(check, interval);
        } else {
          finish(reject, error);
        }
      }
    };

    timeoutTimer = setTimeout(() => {
      finish(reject, new Error('轮询操作超时'));
    }, timeout);

    timer = setTimeout(check, immediate ? 0 : interval);
  });
}

export default pollUntil;
