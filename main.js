import App from './App'

// 引入 uview-plus 的插件入口。
// 这样做可以把组件库提供的全局方法、主题能力和 mixin 注册到当前应用中，
// 页面里再通过 pages.json 的 easycom 规则自动使用 up-* 组件。
import uviewPlus from '@/uni_modules/uview-plus'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import store from './store';
import request from './utils/request';
import utils from './utils';
import navigation from './utils/navigation';

export function createApp() {
  const app = createSSRApp(App)
  app.use(store);

  // 注册 uview-plus。必须在 createSSRApp 创建实例后调用，
  // 否则组件库的全局能力不会挂载到当前 Vue 应用。
  app.use(uviewPlus)
  
  // 挂载到全局
  app.config.globalProperties.$request = request;
  app.config.globalProperties.$utils = utils;
  app.config.globalProperties.$navigate = navigation;

  return {
    app
  }
}
// #endif
