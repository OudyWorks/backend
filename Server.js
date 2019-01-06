const http = require('http'),
  WebSocket = require('ws'),
  Application = require('./Application'),
  Request = require('./Request')

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
    this.server.listen(port, hostname)
  }
  async request(request, response, socket = false) {
    return Request.wrap(request, socket).then(
      request => {
        
        response.end('Hellooo')
      }
    )
  }
  async upgrade(request, socket, head) {
    // response.end('Hellooo')
  }
}

module.exports = Server