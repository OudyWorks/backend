import Vue from 'vue'
import meta from '@meta'

export default context => ({
  app: new Vue({
    functional: true,
    name: 'application',
    render(h) {
      return <div id="app">Loading...</div>
    },
    meta() {
      return {
        meta: [
          { charset: 'utf-8' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' }
        ]
      }
    }
  })
})