const Server = require('../Server'),
  Application = require('../Application')

module.exports = function({port, host, websocket}) {
  console.log(port, host, websocket)
  new Server(port, host, websocket)
}