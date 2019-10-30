import http from 'http'
import express from 'express'
import debug from 'debug'

class Server extends express {
  /**
   * 
   * @param {*} options 
   */
  constructor({
    host = '0.0.0.0',
    port = 80,
    websocket = false
  } = {}) {
    super()
    this.server = http.createServer()
    this.port = port
    this.host = host
    this.ready = []
    this.beforeStart = []
    this.afterStart = []
    this.start = function start() {
      this.debug('start')
      Promise.all(
        this.ready
      ).then(
        () => {
          this.debug('beforeStart')
          return Promise.all(this.beforeStart.map(
            beforeStart =>
            beforeStart()
          ))
        }
      ).then(
        () => {
          this.debug('listen')
          this.server.listen(
            this.port,
            this.host
          )
        }
      ).then(
        () => {
          this.debug('afterStart')
          return Promise.all(this.afterStart.map(
            afterStart =>
            afterStart()
          ))
        }
      ).then(
        () => {
          this.debug('started')
        }
      )
    }
    this.debug = debug('backend')
    this.server.on(
      'request',
      this
    )
    this.disable('x-powered-by')
  }
}

export default Server