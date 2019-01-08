// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

// 样式
import '@/assets/seat.css'

// axios
import axios from 'axios'
// 导入seat组件,注册为全局
import Seat from '@/components/seat.vue'

Vue.config.productionTip = false

Vue.prototype.axios = axios
Vue.component('my-seat',Seat)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
