const {
  GraphQLString
} = require('@oudy/graphql')

module.exports = {
  hello: {
    type: GraphQLString,
    resolve() {
      return 'world'
    }
  }
}