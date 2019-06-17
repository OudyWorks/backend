const Application = require('@oudy/backend/Application'),
  Entity = require('@oudy/backend-component-entity'),
  GraphQL = require('@oudy/backend-component-graphql'),
  MongoDB = require('@oudy/mongodb')

Entity.use(Application)
GraphQL.use(Application)

class System {
  static async beforeStart(application, request, response) {
    console.log('Connecting to MongoDB')
    return Promise.all([
      MongoDB.configure('mongodb://localhost', { useNewUrlParser: true }, 'dev')
    ]).then(
      () => {
        console.log('Connected')
      }
    )
  }
}

module.exports = System