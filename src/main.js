import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "axios";
import "./plugins/element";
import TreeTable from 'vue-table-with-tree-grid'
Vue.component("tree-table", TreeTable )

Vue.config.productionTip = false;
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
