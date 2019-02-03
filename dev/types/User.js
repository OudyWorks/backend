const Entity = require('@oudy/entity-mongodb'),
  {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
  } = require('@oudy/graphql'),
  {
    $type,
    $pubsub
  } = GraphQLEntity = require('@oudy/graphql-entity'),
  {
    RedisPubSub
  } = require('graphql-redis-subscriptions')

class User extends GraphQLEntity.use(Entity) {

}

User[$type] = new GraphQLObjectType({
  name: 'User',
  fields() {
    return {
      id: {
        type: GraphQLID
      },
      name: {
        type: GraphQLString
      },
      email: {
        type: GraphQLString
      }
    }
  }
})

User[$pubsub] = new RedisPubSub({
  connection: {
      // keyPrefix: 'crawlo:shepherd:',
      port: 6379,
      retry_strategy: options =>
          Math.max(options.attempt * 100, 3000)
  }
})

module.exports = User