import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: typeof window != 'undefined' && window.__INITIAL_STATE__ || {}
})