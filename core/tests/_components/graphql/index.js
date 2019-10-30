import glob from 'fast-glob'
import path from 'path'

import {
    ApolloServerBase,
    runHttpQuery,
    convertNodeHttpToRequest
} from 'apollo-server-core'
import {
    ApolloServer
} from 'apollo-server-express'
import {
    SubscriptionServer
} from 'subscriptions-transport-ws'
import {
    execute,
    subscribe,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLBoolean
} from '@oudy/graphql'

export default async (application) => {
    const directories = [
            'types', 'queries', 'mutations', 'subscriptions'
        ],
        schema = directories.filter(
            (type, i) => i
        ).reduce(
            (schema, type) => Object.assign(schema, {
                [type]: {}
            }), {}
        )
    await Promise.all(
        directories.map(
            async directory => ({
                directory,
                modules: await Promise.all(
                    glob.sync(
                        path.join(`${directory}/*.js`), {
                            cwd: application.directory,
                            absolute: true
                        }
                    ).map(
                        file =>
                        import(file)
                    )
                )
            })
        )
    ).then(
        ([types, ...rest]) => {

            rest.forEach(
                ({
                    directory,
                    modules
                }) =>
                modules.forEach(
                    module =>
                    Object.assign(schema[directory], module)
                )
            )
            const ss = new GraphQLSchema({
                query: new GraphQLObjectType({
                    name: 'Query',
                    fields: schema.queries
                }),
                subscription: new GraphQLObjectType({
                    name: 'Subscription',
                    fields: {
                        listen: {
                            type: GraphQLBoolean,
                            resolve() {

                            },
                            subscribe() {

                            }
                        }
                    }
                  })
            })
            const sr = new ApolloServer({
                schema: ss,
                tracing: true,
                subscriptions: {
                    path: '/subscriptions',
                    async onConnect(connectionParams, webSocket, context) {
                    },
                    async onDisconnect(webSocket, context) {
                    }
                }
            })
            const subscriptionServer = new SubscriptionServer(
                {
                  keepAlive: 30000,
                  execute,
                  subscribe,
                  schema: ss,
                //   onOperation: async (message, params) => {
                //     const token = message.payload.authToken
                //     const context = await setupContext({token})
              
                //     return {
                //       ...params,
                //       context: {
                //         ...params.context,
                //         ...context,
                //       },
                //     }
                //   },
                },
                {
                  server: application.server.server,
                  path: '/subscriptions',
                }
              )
            sr.applyMiddleware({
                app: application.router
            })
            // application.router.use(
            //     '/graphql',
            //     (req, res, next) => {
            //         runHttpQuery([req, res], {
            //             method: req.method,
            //             options: {
            //                 schema: ss
            //             },
            //             query: req.method === 'POST' ? req.body : req.query,
            //             request: convertNodeHttpToRequest(req),
            //         }).then(
            //             ({
            //                 graphqlResponse,
            //                 responseInit
            //             }) => {
            //                 if (responseInit.headers) {
            //                     for (const [name, value] of Object.entries(responseInit.headers)) {
            //                         res.setHeader(name, value);
            //                     }
            //                 }

            //                 // Using `.send` is a best practice for Express, but we also just use
            //                 // `.end` for compatibility with `connect`.
            //                 if (typeof res.send === 'function') {
            //                     res.send(graphqlResponse);
            //                 } else {
            //                     res.end(graphqlResponse);
            //                 }
            //             },
            //             (error) => {
            //                 if ('HttpQueryError' !== error.name) {
            //                     return next(error);
            //                 }

            //                 if (error.headers) {
            //                     for (const [name, value] of Object.entries(error.headers)) {
            //                         res.setHeader(name, value);
            //                     }
            //                 }

            //                 res.statusCode = error.statusCode;
            //                 if (typeof res.send === 'function') {
            //                     // Using `.send` is a best practice for Express, but we also just use
            //                     // `.end` for compatibility with `connect`.
            //                     res.send(error.message);
            //                 } else {
            //                     res.end(error.message);
            //                 }
            //             },
            //         );
            //     }
            // )

        }
    )
}