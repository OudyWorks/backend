import http from 'http'
import express from 'express'

class Server extends express {
  /**
   * 
   * @param {*} options 
   */
  constructor(
    {
      host = '0.0.0.0',
      port = 80,
      websocket = false
    } = {}
  ) {
    super()
    this.server = http.createServer()
    this.port = port
    this.host = host

    this.server.on(
      'request',
      this
    )
    this.disable('x-powered-by')
  }
}

export default Server