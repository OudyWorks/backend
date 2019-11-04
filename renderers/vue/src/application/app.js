import Vue from 'vue'
import router from '@router'
// import store from '@store'
// import meta from '@meta'
// import i18n from '@i18n'

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

// try {
//   if (require.resolveWeak('@modules')) {
//     const modules = require('@modules')
//     Object.keys(modules).forEach(
//       module =>
//         Vue.component(
//           `module-${module}`,
//           modules[module].__esModule ? modules[module].default : modules[module]
//         )
//     )
//   }
// } catch (error) {
//   console.log(error)
// }

if (!Vue.options.components.layout)
  Vue.component(
    'layout',
    {
      name: 'layout',
      render() {
        return <router-view></router-view>
      }
    }
  )

export default context => {

  let addons = {}

  try {
    if (require.resolveWeak('@store')) {
      const store = require('@store')
      addons.store = store.__esModule ? store.default : store
    }
  } catch (error) {}

  try {
    if (require.resolveWeak('@meta')) {
      require('@meta')
      addons.meta = function meta() {
        return {
          meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' }
          ]
        }
      }
    }
  } catch (error) {}

  try {
    if (require.resolveWeak('@i18n')) {
      const i18n = require('@i18n')
      addons.i18n = i18n.__esModule ? i18n.default : i18n
    }
  } catch (error) {}

  return {
    app: new Vue({
      name: 'application',
      router,
      ...addons,
      render(h) {
        return <layout id="app"></layout>
      }
    }),
    router,
    ...addons
  }

}