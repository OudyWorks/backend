const URL = require('url'),
  QueryString = require('querystring')

class Request {
  constructor(request, socket = false) {
    this.request = request
    this.socket = socket
    // console.log(this.request)
  }
  get headers() {
    return this.request.headers
  }
  get method() {
    return this.request.method
  }
  get ip() {
    return this.headers['x-forwarded-for'] || this.request.connection.remoteAddress
  }
  get parsedURL() {
    return this._parsedURL || (this._parsedURL = URL.parse(this.constructor.fullURL(this.request), true))
  }
  get url() {
    return this.parsedURL.path
  }
  get path() {
    return this.parsedURL.pathname || ''
  }
  get pathArray() {
    return this.path.split('/')
  }
  get query() {
    return (this.parsedURL.search || '').replace(/^\?/, '')
  }
  get queryObject() {
    return this.parsedURL.query
  }
  get body() {
    return this._parsedBody || null
  }
  static wrap(request, socket = false) {
    return new Promise(
      resolve => {

        let body = []

        request.on(
          'data',
          chunk =>
            body.push(chunk)
        )

        request.on('end', () => {

          request = new this(request, socket)

          // request.parseBody(Buffer.concat(body), request.headers['content-type'])

          resolve(request)

        })

      }
    )
  }
  static fullURL(request) {
    const secure = request.connection.encrypted || request.headers['x-forwarded-proto'] === 'https'
    return 'http' + (secure ? 's' : '') + '://username:password@' +
      request.headers.host +
      request.url
  }
}

module.exports = Request