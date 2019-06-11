import Vue from 'vue'
import router from '@router'
import store from '@store'
import meta from '@meta'

try {
  if (require.resolveWeak('@layout')) {
    const layout = require('@layout')
    Vue.component(
      'layout',
      layout.default || layout
      // () =>
      //   import(/* webpackChunkName: "layout" */ '@layout')
    )
  }
} catch (error) {
  console.log(error)
}

try {
  if (require.resolveWeak('@modules')) {
    const modules = require('@modules')
    Object.keys(modules).forEach(
      module =>
        Vue.component(
          `module-${module}`,
          modules[module].default || modules[module]
        )
    )
  }
} catch (error) {
  console.log(error)
}

if (!Vue.options.components.layout)
  Vue.component(
    'layout',
    {
      name: 'layout',
      render() {
        return <router-view></router-view>
      },
      meta() {
        return this.$store.state.meta
      }
    }
  )

export default context => ({
  app: new Vue({
    name: 'application',
    router,
    store,
    render(h) {
      return <layout></layout>
    },
    meta() {
      return {
        meta: [
          { charset: 'utf-8' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' }
        ]
      }
    }
  }),
  router,
  store
})