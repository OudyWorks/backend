import Vue from 'vue'
import App from './app'

const {
  app,
  store
} = App()
if (window.__INITIAL_STATE__)
  store.replaceState(window.__INITIAL_STATE__)
app.$mount('#app')