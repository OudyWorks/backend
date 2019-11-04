import Vue from 'vue'

export default context => {

  let addons = {}

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

  return {
    app: new Vue({
      name: 'application',
      render(h) {
        return <div id="app">Loading...</div>
      },
      ...addons
    })
  }
}