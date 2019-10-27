import glob from 'fast-glob'
import {
  Router,
  urlencoded as urlencodedParser,
  json as jsonParser
} from 'express'
import cookieParser from 'cookie-parser'

export const triggers = [
  'beforeStart',
  'afterStart',
  // 'beforeInitiate',
  // 'initiate',
  // 'afterInitiate',
  // 'beforeRoute',
  // 'afterRoute',
  // 'beforeLoad',
  // 'afterLoad'
]

class Application {
  constructor({
    server,
    directory = process.cwd(),
    cookie = false
  } = {}) {
    this.server = server
    this.components = glob.sync(
      [
        'components/*/controller.js',
        'components/*/tasks/*/controller.js',
      ], {
        cwd: directory,
        absolute: true
      }
    ).map(
      file => {
        const [, component, , task = 'default'] = file.match(/components\/([0-9a-zA-Z.]+)(\/tasks\/([0-9a-zA-Z.]+))?\/controller\.js$/)
        return {
          component,
          task,
          file
        }
      }
    )
    console.log(this.components)
    this.triggers = triggers.reduce(
      (triggers, trigger) =>
      Object.assign(
        triggers, {
          [trigger]: []
        }
      ), {}
    )
    console.log('Load components')
    Promise.all(
      this.components.map(
        component =>
        import(component.file).then(
          controller =>
          Object.assign(
            component,
            controller
          )
        )
      )
    ).then(
      routes => {
        this.router = new Router()
        this.router.use(jsonParser())
        this.router.use(urlencodedParser({
          extended: true
        }))
        if (cookie)
          this.router.use(cookieParser())
        // this.router.use(
        //   (request, response, next) => {
        //     [
        //       'beforeInitiate',
        //       'initiate',
        //       'afterInitiate'
        //     ].reduce(
        //       (promise, trigger) =>
        //         promise.then(
        //           () =>
        //             Promise.all(
        //               this.triggers[trigger].map(
        //                 trigger =>
        //                   trigger(request, response)
        //               )
        //             )
        //         ),
        //       Promise.resolve()
        //     ).then(
        //       () =>
        //         next()
        //     )
        //   }
        // )
        // this.router.use(
        //   (request, response, next) => {
        //     next()
        //   }
        // )
        routes.forEach(
          route => {
            if (route.default || route.controller)
              this.router[(route.method && route.method.toLowerCase()) || 'all'](
                route.route, // || (route.routes || []).concat(route.route),
                (request, response, next) =>
                route.controller ? route.controller.bind(request.payload)(request, response, next).then(next) : route.default(request, response, next)
              )
            triggers.forEach(
              trigger =>
              route[trigger] && this.triggers[trigger].push(route[trigger])
            )
          }
        )
        // this.router.use(
        //   (request, response, next) => {
        //     next()
        //   }
        // )
        console.log('Load triggers', this.triggers)
        server.use(
          (request, response, next) => {
            // bind a payload
            console.log('Hii')
            request.payload = {}
            request.reroute = (url, next) => {
              request.url = url
              this.router.handle(request, response, next)
            }
            response.error = (error) => {
              request.payload = {
                error
              }
              if (error.status)
                response.status(error.status)
            }
            next()
          },
          this.router,
          (request, response, next) => {
            response.json(request.payload)
          },
        )
      }
    )
  }
}

export default Application