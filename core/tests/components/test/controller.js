export async function afterStart(request, response, next) {

}

export default async function controller(request, response, next) {
  // response.send('This is test')
  this.test = 'Ok this is from test'
  next()
}

export const route = '/test'