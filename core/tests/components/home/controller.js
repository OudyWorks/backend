export async function controller(request, response) {
  response.error({
    // status: 400,
    code: 100,
    message: `Unsupported ${request.method} request. Please read the API documentation`
  })
}

export const route = '/'