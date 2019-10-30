import {
  default as MongoDB
} from './libraries/MongoDB'
import GraphQL from './_components/graphql'

module.exports = {
  middlewares: [
    // function midi(request, response, next) {
    //   next()
    // }
  ],
  components: [
    GraphQL
  ],
  async beforeStart() {
    return new Promise(
      async (resolve, reject) => {
        await MongoDB.ready
        setTimeout(
          () => {
            resolve()
          },
          1000
        )
      }
    )
  }
}