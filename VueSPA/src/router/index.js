import { createRouter, createWebHistory,  } from 'vue-router'
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
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
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

const check = (route, claims) => {
  if (!route.meta || !route.meta.access) {
    debug.info('[router] Non guarded route selected');
    return true;
  }

  return claims.find(claim => {
    const rule = route.meta.access[claim.key];
    return rule ? rule.includes(claim.value) : false;
  });
}


const testClaims = [{
  key: 'Access.Secret',
  value: 'RW'
}]

router.beforeEach((to, from, next) => {
  from;

  // if non-guarded route, e.g. no to.meta.access field,
  // or if check function returns true, allow reting to 'to'
  if (check(to, testClaims)) {
    next();
  }

  // if not, go to Login
  else next({ name: 'Login' });
})

export default router
