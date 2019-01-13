const http = require('http'),
  WebSocket = require('ws'),
  Application = require('./Application'),
  Request = require('./Request'),
  Response = require('./Response'),
  URL = require('url')

class Server {
  constructor(port, hostname, websocket = false, application = undefined) {
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
    if (this.websocket) {
      this.constructor.wsServers = {
        '/': this.wsServer = new WebSocket.Server({
          noServer: true
        })
      }
      this.server.on(
        'upgrade',
        (request, socket, head) => {
          this.upgrade(request, socket, head)
        }
      )
      this.wsServer.on(
        'connection',
        (response, request) =>
          this.request(request, response, true)
      )
    }
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
    let url = URL.parse(request.url).pathname
    if (this.constructor.wsServers[url])
      this.constructor.wsServers[url].handleUpgrade(
        request,
        socket,
        head,
        ws =>
          this.constructor.wsServers[url].emit('connection', ws, request)
      )
    else
      socket.destroy()
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