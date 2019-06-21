import Vue from 'vue'
import router from '@router'
import store from '@store'
import meta from '@meta'
import i18n from '@i18n'

try {
  if (require.resolveWeak('@layout')) {
    const _layout = require('@layout')
    Vue.component(
      'layout',
      _layout.__esModule ? _layout.default : _layout
    )
  }
} catch (error) {
  // console.log(error)
}

try {
  if (require.resolveWeak('@modules')) {
    const modules = require('@modules')
    Object.keys(modules).forEach(
      module =>
        Vue.component(
          `module-${module}`,
          modules[module].__esModule ? modules[module].default : modules[module]
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
    i18n,
    render(h) {
      return <layout id="app"></layout>
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
  store,
  i18n
})