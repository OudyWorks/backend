import param from 'jquery-param'
import serialize from 'form-serialize'

const possibleCharsForID = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export default class Client {
  constructor(url, websocket = true) {
    if (!url) {
      url = location.href.replace(location.pathname, '')
    }
    url = new URL(url)
    this.server = url.protocol + '//' + url.host
  }
  request(options = {}) {
    return Promise.resolve(
      this.generateID()
    ).then(
      id => new Promise(
        (resolve, reject) => {
          if (!options.method)
            options.method = 'GET'
          if (options.method == 'GET' && options.data) {
            if (Object.keys(options.data).length)
              options.url += '?' + param(options.data)
            delete options.data
          }
          let body = undefined,
            headers = new Headers(options.headers || { 'Accept': 'application/json' })
          if (options.data) {
            if (options.data.constructor)
              switch (options.data.constructor.name) {
                case 'Object':
                  body = options.data
                  headers.append('Content-Type', 'application/json')
                  break
                case 'URLSearchParams':
                case 'FormData':
                case 'Blob':
                  body = options.data
                  break
                case 'HTMLFormElement':
                  body = serialize(options.data, { hash: true, empty: true })
                  headers.append('Content-Type', 'application/json')
                  break
              }
          }
          if (body)
            body = body.constructor.name == 'Object' ? JSON.stringify(body) : body
          return fetch(options.url, {
            credentials: 'same-origin',
            method: options.method,
            body,
            headers
          }).then(
            response =>
              response.json().then(resolve)
          ).catch(reject)
        }
      )
    )
  }
  generateID(length = 16) {
    let text = ''
    for (let i = 0; i < length; i++)
      text += possibleCharsForID.charAt(Math.floor(Math.random() * possibleCharsForID.length))
    return text
  }
  get(url, data = {}) {
    return this.request({
      method: 'GET',
      url,
      data
    })
  }
  post(url, data = {}) {
    return this.request({
      method: 'POST',
      url,
      data
    })
  }
}