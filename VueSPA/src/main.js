import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import SecKyPlugin from './plugins/SecKyPlugin'
import { RetryPolicy, BasicExecutionPolicy } from './lib/SecKy'
import { createVuetify } from 'vuetify'
import { vuetifyOptions } from './plugins/vuetify'

// Global options for secky instance creation. For detailed info see ../lib/SecKy.ts
const secKyOptions = {
  baseUrl: process.env.NODE_ENV !== 'development' ? 'https://someurl.com/' : 'https://localhost:44316',
  authToken: '',
  policy: RetryPolicy.createBasic(BasicExecutionPolicy.RetryOnce),
  reauthAction: () => store.dispatch('user/refresh')
};

// application creation pipeline.
const app = createApp(App);
const vuetify = createVuetify(vuetifyOptions) // Replaces new Vuetify()

// Method use applies plugins to Vue instance, created by createApp method.
app
  .use(SecKyPlugin, secKyOptions)
  .use(vuetify)
  .use(store)
  .use(router)
  .mount('#app')
