import glob from 'fast-glob'
import path from 'path'

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
    GraphQLSchema
} from '@oudy/graphql'
import {
    $query,
    $listQuery,
    $mutation,
    $subscription
} from '@oudy/graphql-entity'

export default function () {
    return async function (application) {
        const directories = [
                'types', 'queries', 'mutations', 'subscriptions'
            ],
            schemaModules = directories.filter(
                (type, i) => i
            ).reduce(
                (modules, type) => Object.assign(modules, {
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
                            import(file).then(
                                module =>
                                module.default || module
                            )
                        )
                    )
                })
            )
        ).then(
            ([types, ...rest]) => {

                types.modules.forEach(
                    Entity => {
                        Object.assign(
                            schemaModules.queries,
                            Entity[$query]()
                        )
                        Object.assign(
                            schemaModules.queries,
                            Entity[$listQuery]()
                        )
                        Object.assign(
                            schemaModules.mutations,
                            Entity[$mutation]()
                        )
                        Object.assign(
                            schemaModules.subscriptions,
                            Entity[$subscription]()
                        )
                    }
                )

                rest.forEach(
                    ({
                        directory,
                        modules
                    }) =>
                    modules.forEach(
                        module =>
                        Object.assign(schemaModules[directory], module)
                    )
                )
                let GraphQLSchemaConfig = {}
                if (Object.keys(schemaModules.queries).length)
                    GraphQLSchemaConfig.query = new GraphQLObjectType({
                        name: 'Query',
                        fields: schemaModules.queries
                    })
                if (Object.keys(schemaModules.mutations).length)
                    GraphQLSchemaConfig.mutation = new GraphQLObjectType({
                        name: 'Mutation',
                        fields: schemaModules.mutations
                    })
                if (Object.keys(schemaModules.subscriptions).length)
                    GraphQLSchemaConfig.subscription = new GraphQLObjectType({
                        name: 'Subscription',
                        fields: schemaModules.subscriptions
                    })
                const graphQLSchema = new GraphQLSchema(GraphQLSchemaConfig),
                    graphqlServer = new ApolloServer({
                        schema: graphQLSchema,
                        tracing: true,
                        subscriptions: {
                            path: '/subscriptions'
                        }
                    }),
                    subscriptionServer = new SubscriptionServer({
                        keepAlive: 30000,
                        execute,
                        subscribe,
                        schema: graphQLSchema,
                    }, {
                        server: application.server.server,
                        path: '/subscriptions',
                    })
                graphqlServer.applyMiddleware({
                    app: application.router
                })

            }
        )
    }
}