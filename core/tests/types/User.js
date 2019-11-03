import {
    default as Entity,
    $type,
    GraphQLObjectType,
    GraphQLID,
    GraphQLString
} from '../libraries/Entity'

class User extends Entity {

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
        }
    }
})

export default User