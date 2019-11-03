import MongoDBEntity from '@oudy/entity-mongodb'
import {
    use
} from '@oudy/graphql-entity'

class Entity extends use(MongoDBEntity) {

}

export {
    $collection,
    $database
} from '@oudy/entity-mongodb'
export * from '@oudy/graphql'
export * from '@oudy/graphql-entity'
export default Entity