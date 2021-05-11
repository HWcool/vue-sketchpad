import Vue from 'vue'
import App from './App.vue'
import './assets/app.css'
import './assets/font/iconfont.css'
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
