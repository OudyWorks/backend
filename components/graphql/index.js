const {
  ApolloServerBase,
  runHttpQuery,
  convertNodeHttpToRequest
} = require('apollo-server-core'),
  {
    SubscriptionServer
  } = require('subscriptions-transport-ws'),
  {
    execute,
    subscribe,
    GraphQLSchema,
    GraphQLObjectType
  } = require('@oudy/graphql'),
  {
    $query, $listQuery, $mutation, $subscription
  } = Entity = require('@oudy/graphql-entity'),
  recursiveReadSync = require('recursive-readdir-sync'),
  path = require('path'),
  fs = require('fs')

module.exports = {
  use(Application, options = {}) {

    let files = [
      'types', 'queries', 'mutations', 'subscriptions'
    ].map(
      directory => ({
        directory,
        regex: new RegExp(`${directory}[\\\/][a-zA-Z0-9]+.js$`)
      })
    ).map(
      ({ directory, regex }) =>
        fs.existsSync(path.join(process.cwd(), directory)) ? recursiveReadSync(
          path.join(process.cwd(), directory)
        ).filter(
          file =>
            file.match(regex)
        ).map(
          file => {
            try {
              return require(file)
            } catch (error) {
              throw {
                message: `Error while loading ${file}`,
                error
              }
            }
          }
        ).filter(
          module =>
            module
        ) : []
    ),
      schema = (
        () => {
          let schema = {},
            queries = {},
            mutations = {},
            subscriptions = {}

          // types
          files[0].forEach(
            Entity => {
              Object.assign(
                queries,
                Entity[$query]()
              )
              Object.assign(
                queries,
                Entity[$listQuery]()
              )
              Object.assign(
                mutations,
                Entity[$mutation]()
              )
              Object.assign(
                subscriptions,
                Entity[$subscription]()
              )
            }
          )

          // queries
          files[1].forEach(
            query =>
              Object.assign(queries, query)
          )

          // mutations
          files[2].forEach(
            mutation =>
              Object.assign(mutations, mutation)
          )

          // subscriptions
          files[3].forEach(
            subscription =>
              Object.assign(subscriptions, subscription)
          )

          if (Object.keys(queries).length)
            schema.query = new GraphQLObjectType({
              name: 'Query',
              fields: queries
            })

          if (Object.keys(mutations).length)
            schema.mutation = new GraphQLObjectType({
              name: 'Mutation',
              fields: mutations
            })

          if (Object.keys(subscriptions).length)
            schema.subscription = new GraphQLObjectType({
              name: 'Subscription',
              fields: subscriptions
            })

          return new GraphQLSchema(schema)
        }
      )(),
      server = new ApolloServerBase(Object.assign(
        options,
        {
          schema
        }
      )),
      ss = new SubscriptionServer(
        {
          execute, subscribe, schema: server.schema
        },
        {
          noServer: true
        }
      )

    options = server.graphQLServerOptions()

    Application.triggers.beforeStart.push(
      async (server) => {
        server.constructor.wsServers['/graphql'] = ss.server
      }
    )

    Application.components.graphql = {
      default: class Controller {
        static async run(application, request, response, route, payload) {
          return runHttpQuery(
            [request, response],
            {
              method: request.method,
              options,
              query: request.method === 'POST' ? request.bodyObject : request.queryObject,
              request: convertNodeHttpToRequest(request)
            }
          ).then(
            ({ graphqlResponse, responseInit }) => {
              return graphqlResponse
            },
            (error) => {
              return error.message
            }
          )
        }
      }
    }

    Application.routes.push(
      {
        url: /^\/graphql$/,
        component: 'graphql',
        task: 'default',
      }
    )

  }
}