// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

// 样式
import '@/assets/seat.css'

// 导入axios
import axios from 'axios'
Vue.prototype.axios = axios
//插件


// 导入组件,注册为全局
import Seat from '@/components/seat.vue'
import SeatNum from '@/components/seatnum.vue'
import Recommend from '@/components/recommend.vue'
import Complete from '@/components/complete.vue'


Vue.config.productionTip = false


Vue.component('my-seat',Seat)
Vue.component('my-seatnum',SeatNum)
Vue.component('my-recommend',Recommend)
Vue.component('my-complete',Complete)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
