import URL from 'url'
import QueryString from 'qs'
import cookie from 'cookie'
import {
  unsign
} from 'cookie-signature'

const cookieSignature = process.env.BACKEND_COOKIE_SIGNATURE

class Request {
  constructor(request, socket = false) {
    this.request = request
    this.socket = socket
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
  get cookies() {
    if (this._cookies)
      return this._cookies
    this._cookies = cookie.parse(this.headers.cookie || '')
    Object.keys(this._cookies).forEach(
      key => {
        if (this._cookies[key].match(/^s:/))
          this._cookies[key] = unsign(this._cookies[key].replace(/^s:/, ''), cookieSignature) || this._cookies[key]
        if (this._cookies[key].match(/^j:/))
          this._cookies[key] = JSON.parse(this._cookies[key].replace(/^j:/, ''))
      }
    )
    return this._cookies
  }
  getCookie(cookie) {
    return this.cookies[cookie]
  }
  isInPath(component) {
    return this.pathArray.includes(component.toString())
  }
  nextInPath(component) {
    let index
    if ((index = this.pathArray.indexOf(component.toString())) !== -1)
      if (typeof this.pathArray[++index] !== 'undefined')
        return this.pathArray[index]
    return undefined
  }

  isInPOST(key) {
    return typeof this.bodyObject[key] !== 'undefined'
  }

  getPOST(key) {
    return this.isInPOST(key) ? this.bodyObject[key] : undefined
  }

  isInGET(key) {
    return typeof this.queryObject[key] !== 'undefined'
  }

  getGET(key) {
    return this.isInGET(key) ? this.queryObject[key] : undefined
  }
  parseBody(body, type = '') {
    this.body = body
    let typeArray = type.trim().split(';')
    switch (typeArray[0]) {
      case 'application/json':
      case 'json':
        try {
          this.bodyObject = JSON.parse(body.toString())
        } catch (e) {
          this.bodyObject = {}
        }
        break
      case 'object':
        Object.assign(this.bodyObject, body)
        break
      case 'multipart/form-data':
        try {
          let boundary = multipart.getBoundary(type)
          this.files = multipart.Parse(body, boundary)
        } catch (e) {
          this.files = []
        }
        break
      case 'application/x-www-form-urlencoded':
      default:
        this.bodyObject = QueryString.parse(body.toString())
        break
    }
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

          request.parseBody(Buffer.concat(body), request.headers['content-type'])

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

export default Request