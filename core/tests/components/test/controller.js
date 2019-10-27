export async function controller(request, response, next) {
  this.message = 'Ok this is from test'
}

export const route = '/test'