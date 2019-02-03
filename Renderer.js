const booleanify = require('booleanify'),
  { Readable } = require('stream')

class Renderer {
  static async render(application, request, response, route, payload) {

    if (response.finished)
      return null

    if (typeof payload.pipe === 'function' || application.socket)
      return payload

    let readable = new Readable(),
      suppress = booleanify(request.getGET('suppress')),
      pretty = booleanify(request.getGET('pretty'))

    if (suppress)
      response.statusCode = 200

    if (typeof payload == 'object')
      payload = JSON.stringify(payload, null, pretty ? 2 : 0)

    response.setHeader('Content-Type', 'application/json')

    readable._read = function noop() { }
    readable.push(payload)
    readable.push(null)

    return readable

  }
}

module.exports = Renderer