const path = require('path'),
  eTag = require('etag'),
  mime = require('mime'),
  {
    Readable
  } = require('stream'),
  zlib = require('zlib')

module.exports = {
  use(
    Application = require('@oudy/backend/Application'),
    options = {}
  ) {

    options.fs = options.fs || require('fs')
    options.route = options.route || /^\/static\//
    options.directory = options.directory || path.join(process.cwd(), 'static')

    const etags = new Map()

    Application.components.static = {
      default: class Controller {
        static async run(application, request, response, route, payload) {
          try {

            let file = request.path.replace(/^\/static/, ''),
              encoding = request.headers['accept-encoding'] || ''

            encoding = encoding.match(/\bgzip\b/) && 'gzip' || encoding.match(/\bdeflate\b/) && 'deflate' || ''

            console.log(file, encoding)

            let body = options.fs.readFileSync(path.join(options.directory, file)),
              etag = etags.get(file) || etags.set(
                file,
                eTag(body)
              ).get(file)

            let readable = new Readable()

            readable._read = function noop() { }
            readable.push(body)
            readable.push(null)
            if (encoding == 'gzip')
              readable = readable.pipe(zlib.createGzip())
            else if (encoding == 'deflate')
              readable = readable.pipe(zlib.createDeflate())

            response.setHeader('Cache-Control', 'max-age=290304000, public')
            response.setHeader('ETag', etag)
            response.setHeader('Content-Type', mime.getType(file))
            response.setHeader('Content-Encoding', encoding || undefined)

            return readable

          } catch (error) {
            return route.error(404, error)
          }
        }
      }
    }
    Application.routes.push(
      {
        url: options.route,
        component: 'static',
        task: 'default',
      }
    )

  }
}