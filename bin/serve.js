const Server = require('../Server')

module.exports = function({port, host}) {
  new Server(port, host)
  console.log('Ready')
}