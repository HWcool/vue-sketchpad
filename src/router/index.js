import Vue from 'vue'
import Router from 'vue-router'
import Sketchpad from '@/components/Sketchpad.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Sketchpad',
      component: Sketchpad
    }
  ]
})
