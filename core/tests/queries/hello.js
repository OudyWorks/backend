import {
    GraphQLString
} from '@oudy/graphql'

export let hello = {
    type: GraphQLString,
    resolve() {
        return 'World !'
    }
}