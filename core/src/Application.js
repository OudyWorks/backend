import glob from 'fast-glob'
import path from 'path'
import fs from 'fs'
import {
  Router,
  urlencoded as urlencodedParser,
  json as jsonParser
} from 'express'
import cookieParser from 'cookie-parser'
import debug from 'debug'

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
    cookies = false
  } = {}) {
    this.server = server
    this.debug = this.server.debug.extend('application')
    this.directory = directory
    this.ready = new Promise(
      async (resolve, reject) => {
        this.router = new Router()
        this.router.use(jsonParser())
        this.router.use(urlencodedParser({
          extended: true
        }))
        if (cookies)
          this.router.use(cookieParser(cookies))

        this.debug('Init triggers')
        this.triggers = triggers.reduce(
          (triggers, trigger) =>
          Object.assign(
            triggers, {
              [trigger]: []
            }
          ), {}
        )

        this.debug('Load config')
        let configFile = path.join(this.directory, 'backend.config.js')
        if (fs.existsSync(configFile))
          await import(
            configFile
          ).then(
            async config => {
              this.debug('Config loaded')
              this.config = config
              if (this.config.middlewares && this.config.middlewares.length)
                this.router.use(this.config.middlewares)
              if (this.config.beforeStart)
                this.server.beforeStart.push(this.config.beforeStart)
              if (this.config.components) {
                this.debug('Load config components')
                await this.config.components.reduce(
                  (promise, component) =>
                  promise.then(
                    () => {
                      const debug = this.debug.extend('component:' + (component.name || 'anonymous'))
                      debug('loading started')
                      return component(this).then(
                        () =>
                        debug('loading ended')
                      ).catch(
                        () =>
                          debug('loading failed')
                      )
                    }
                  ),
                  Promise.resolve()
                )
                this.debug('Config components loaded')
              }
            }
          ).catch(
            error => {
              console.error('Error loading config', error)
            }
          )

        this.debug('Scanning for components')
        this.components = glob.sync(
          [
            'components/*/controller.js',
            'components/*/tasks/*/controller.js',
          ], {
            cwd: this.directory,
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
        this.debug('Found', this.components.length, 'components')
        await Promise.all(
          this.components.map(
            component => {
              return import(component.file).then(
                controller =>
                Object.assign(
                  component,
                  controller
                )
              ).catch(
                error => {
                  console.error('Error loading component', component, error)
                }
              )
            }
          )
        ).then(
          routes => {
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
                if (!route)
                  return
                if (route.default || route.controller)
                  this.router[(route.method && route.method.toLowerCase()) || 'all'](
                    route.route, // || (route.routes || []).concat(route.route),
                    (request, response, next) =>
                    Promise.resolve(
                      route.controller ? route.controller.bind(request.payload)(request, response, next).then(next) : route.default(request, response, next)
                    ).catch(
                      error => {
                        response.error(error, next)
                      }
                    )
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
            server.use(
              (request, response, next) => {
                // bind a payload
                request.payload = {}
                request.reroute = (url, next) => {
                  request.url = url
                  this.router.handle(request, response, next)
                }
                response.error = (error, next) => {
                  request.payload = {
                    error
                  }
                  if (error.status)
                    response.status(error.status)
                  if (next)
                    next()
                }
                next()
              },
              this.router,
              (request, response, next) => {
                if (!response.headersSent)
                  response.json(request.payload)
              },
            )
          }
        )
        resolve()
      }
    )
    server.ready.push(this.ready)
  }
}

export default Application