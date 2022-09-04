import { createStore } from 'vuex'
import user from './user'
import menu from './menu'

export default createStore({
    state: () => ({

    }),
    modules: {
      user,
      menu
    },
    strict: false
})