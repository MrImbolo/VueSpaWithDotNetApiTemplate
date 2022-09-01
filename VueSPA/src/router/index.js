import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { debug }  from '../lib/debug';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/secret',
    name: 'Secret',
    component: () => import('../views/SecretView.vue'),
    meta: {
      title: 'Secret page',
      access: {
        'Access.Secret': ["R", "W", "RW"]
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach((to, from) => {
  
})

export default router
