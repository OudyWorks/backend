export async function afterStart(request, response, next) {

}

export default async function controller(request, response, next) {
  // console.log('home', )
  // request.payload.id = 'Okey'

  response.send('This is home page')
  // payload()
  // request.reroute('/test', next)
}

export const route = '/'
// export const method = 'POST'