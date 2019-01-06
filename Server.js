const http = require('http'),
  WebSocket = require('ws'),
  Application = require('./Application'),
  Request = require('./Request'),
  Response = require('./Response')

class Server {
  constructor(port, hostname, websocket = true, application = undefined) {
    this.port = port
    this.hostname = hostname
    this.websocket = websocket
    this.application = application || Application
    this.server = http.createServer()
    this.server.on(
      'request',
      (request, response) => {
        this.request(request, response)
      }
    )
    this.server.on(
      'upgrade',
      (request, socket, head) => {

      }
    )
    this.constructor.Application.load(process.cwd())
    this.server.listen(port, hostname)
  }
  async request(request, response, socket = false) {
    return Request.wrap(request, socket).then(
      async request => {
        response = Response.wrap(response)
        let application = new this.constructor.Application(socket)
        await application.initiate(request, response)
        if (socket)
          response.on(
            'message',
            message => {

              message = JSON.parse(message)

              let _request = deepClone(request)

              _request.append(message)

              this.process(application, _request, response)

            }
          )
        else
          return this.process(application, request, response)
      }
    )
  }
  async upgrade(request, socket, head) {
    // response.end('Hellooo')
  }
  async process(application, request, response) {

    let route = await application.route(request, response)

    let payload = await application.load(request, response, route)

    // response.end('Hellooo')

    application.render(request, response, route, payload).then(
      body =>
        application.socket ? response.send(JSON.stringify({ id: request.id, response: body })) : (!response.finished && body.pipe(response))
    )

  }
}

Server.Application = Application

module.exports = Server