import {
  ApolloServerBase,
  runHttpQuery,
  convertNodeHttpToRequest
} from 'apollo-server-core'
import {
  SubscriptionServer
} from 'subscriptions-transport-ws'
import {
  execute,
  subscribe,
  GraphQLSchema,
  GraphQLObjectType
} from '@oudy/graphql'
import {
  $query,
  $listQuery,
  $mutation,
  $subscription
} from '@oudy/graphql-entity'
import fg from 'fast-glob'
import path from 'path'

export default {
  use(Application = require('@oudy/backend/Application'), options = {}) {

    let files = [
      'types', 'queries', 'mutations', 'subscriptions'
    ].map(
      directory => ({
        directory,
        pattern: `${directory}/*.js`
      })
    ).map(
      async ({ directory, pattern }) => ({
        directory,
        pattern,
        modules: await Promise.all(fg.sync([
          path.join(process.cwd(), pattern)
        ]).map(
          file => {
            try {
              return import(file).then(
                module =>
                  module.default || module
              )
            } catch (error) {
              throw {
                message: `Error while loading ${file}`,
                error
              }
            }
          }
        ))
      })
    )
    return Promise.all(files).then(
      async ([types, ...rest]) => {
        let schema = {
          queries: {},
          mutations: {},
          subscriptions: {},
        }

        types.modules.forEach(
          Entity => {
            Object.assign(
              schema.queries,
              Entity[$query]()
            )
            Object.assign(
              schema.queries,
              Entity[$listQuery]()
            )
            Object.assign(
              schema.mutations,
              Entity[$mutation]()
            )
            Object.assign(
              schema.subscriptions,
              Entity[$subscription]()
            )
          }
        )

        rest.forEach(
          ({ directory, modules }) =>
            modules.forEach(
              module =>
                Object.assign(schema[directory], module)
            )
        )

        if (Object.keys(schema.queries).length)
          schema.query = new GraphQLObjectType({
            name: 'Query',
            fields: schema.queries
          })

        if (Object.keys(schema.mutations).length)
          schema.mutation = new GraphQLObjectType({
            name: 'Mutation',
            fields: schema.mutations
          })

        if (Object.keys(schema.subscriptions).length)
          schema.subscription = new GraphQLObjectType({
            name: 'Subscription',
            fields: schema.subscriptions
          })

        return new GraphQLSchema(schema)
      }
    ).then(
      schema => {
        const server = new ApolloServerBase(Object.assign(
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
    )
  }
}