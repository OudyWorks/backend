const Server = require('../Server'),
  Application = require('../Application')

module.exports = function({port, host}) {
  new Server(port, host)
  console.log('Ready')
}