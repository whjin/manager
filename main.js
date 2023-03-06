import Vue from "vue";
import App from "./App";
import config from "@/common/config";
// import socket from "@/common/utils/plus-websocket/index.js";
import store from './store/store';

Vue.config.productionTip = false;

// 全局注册应用配置
Vue.prototype.$config = config;

App.mpType = "app";

// 替换 uni-app 内置的 websocket API
// #ifdef APP-PLUS
// Object.assign(uni, socket);
// #endif

const app = new Vue({
  store,
  ...App,
});
app.$mount();
