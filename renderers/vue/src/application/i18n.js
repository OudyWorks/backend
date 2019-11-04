import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from '@locales'
import routes from '@routes'

routes.forEach(
  route =>
    Object.keys(messages).forEach(
      language => {
        if (messages[language][route.meta.component]) {
          route.component.i18n = route.component.i18n || {
            messages: {}
          }
          route.component.i18n.messages[language] = messages[language][route.meta.component][route.meta.task] || messages[language][route.meta.component]
        }
      }
    )
)

Vue.use(VueI18n)

export default new VueI18n({
  locale: 'en', // set locale
  messages: {}, // set locale messages
})