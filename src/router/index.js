import { createRouter, createWebHistory } from 'vue-router'
import ClientView from '@/views/ClientView.vue'
import CartView from '@/views/CartView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: ClientView
    },{
      path: '/cart',
      name: 'cart',
      component: CartView
    }
  ]
})

export default router
