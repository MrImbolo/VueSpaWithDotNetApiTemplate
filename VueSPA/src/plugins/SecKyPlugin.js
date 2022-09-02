import { createSecKyInstance, SecKyInstance } from '../lib/SecKy'


export default {
  install: (app, options) => {
    createSecKyInstance(options);
    app;
    SecKyInstance;
    // Enable if it is required to use SecKy as a plugin aka $secKy.get(...)
    // app.config.globalProperties.$secKy = SecKyInstance;
  }
}