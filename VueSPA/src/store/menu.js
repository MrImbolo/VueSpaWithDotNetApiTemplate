//import { SecKyInstance } from '../lib/SecKy';
//import { debug } from '../lib/debug';

const createDefaultState = () => ({
  items: [
    { name: 'Home', url: '/',         icon: 'mdi-home' },
    { name: 'About', url: '/about',   icon: 'mdi-info' },
    { name: 'Login', url: '/login',   icon: 'mdi-login' },
    { name: 'Secret', url: '/secret', icon: 'mdi-secret' },
  ],
  count: 0,
  opened: false
})


export default {
  namespaced: true,
  state: createDefaultState,
  getters: {
    
  },
  actions: {
    
  },
  mutations: {
    mReset(state) {
      Object.assign(state, createDefaultState());
    },
    mSetOpened(state, val) {
      state.opened = val;
    }
  },
}