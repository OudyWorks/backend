import MongoDB from '@oudy/mongodb'

export async function controller(request, response, next) {
  return MongoDB.client.collection('tests').find().toArray().then(
    list => {
      this.list = list
      // throw new Error(
      //   'ServerError'
      // )
    }
  ).catch(
    error => {
      return Promise.reject(error)
    }
  )
}

export const route = '/mongodb'