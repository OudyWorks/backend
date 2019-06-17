import Renderer from '@oudy/backend/Renderer'
import fg from 'fast-glob'
import bundle from './application/webpack/bundle'
import frontend from './application/webpack/frontend'
import webpack from 'webpack'
import merge from 'webpack-merge'
import MemoryFileSystem from 'memory-fs'
import fs from 'fs'
import path from 'path'
import {
  createBundleRenderer
} from 'vue-server-renderer'
import accepts from 'accepts'

class VueRenderer extends Renderer {
  static use(
    Application = require('@oudy/backend/Application'),
    options = {}
  ) {
    options.directory = options.directory || process.cwd()
    options.webpack = options.webpack || {}
    const routes = fg.sync(
      [
        'components/*/route.js',
        'components/*/tasks/*/route.js',
      ],
      {
        cwd: options.directory,
        absolute: true
      }
    ),
      modules = fg.sync(
        [
          'modules/*.js',
        ],
        {
          cwd: options.directory,
          absolute: true
        }
      ),
      mfs = new MemoryFileSystem(),
      routesFile = path.join(options.directory, 'application.routes.js'),
      modulesFile = path.join(options.directory, 'application.modules.js')
    mfs.mkdirpSync(path.dirname(routesFile))
    mfs.writeFileSync(
      routesFile,
      `module.exports = [
  ${routes.map(
        route =>
          `require('${route}')`
      ).join(',\n')}
].map(route => route.default || route)`
    )
    mfs.writeFileSync(
      modulesFile,
      `module.exports = {
  ${modules.map(
        module =>
          `'${path.basename(module).replace(path.extname(module), '')}': require('${module}')`
      ).join(',\n')}
}`
    )
    const base = {
      routesFile,
      modulesFile,
      routes,
      modules,
      fs,
      mfs,
      directory: options.directory,
      publicPath: '/static/'
    },
      _bundle = webpack(merge(
        bundle(base),
        {
          entry: {
            app: require.resolve('./application/bundle.js')
          },
          resolve: {
            alias: [
              {
                name: '@app',
                alias: require.resolve(options.ssr ? './application/app.js' : './application/loader.js')
              }
            ]
          }
        },
        options.webpack
      )),
      _frontend = webpack(merge(
        frontend(base),
        {
          entry: {
            app: require.resolve('./application/frontend.js')
          }
        },
        options.webpack
      ))
    if (options.fs) {
      _bundle.outputFileSystem = options.fs
      _frontend.outputFileSystem = options.fs
    }
    _frontend.run(
      (error, c_stats) => {
        console.log(error, c_stats && [Object.keys(c_stats.compilation.assets), c_stats.compilation.errors])
        _bundle.run(
          (error, stats) => {
            console.log(error, stats && Object.keys(stats.compilation.assets))
            VueRenderer.renderer = createBundleRenderer(
              JSON.parse(stats.compilation.assets['vue-ssr-server-bundle.json'].source()),
              {
                runInNewContext: false,
                clientManifest: JSON.parse(c_stats.compilation.assets['vue-ssr-client-manifest.json'].source())
              }
            )
            console.log('done')
          }
        )
      }
    )
    Application.Renderer = VueRenderer
    Application.triggers.beforeInitiate.push(
      async (application, request, response) => {
        request.accept = accepts(request).type(['json', 'html'])
      }
    )
  }
  static async render(application, request, response, route, payload) {
    let context = { application, request, response, route, payload }

    if (request.accept == 'json')
      return super.render(application, request, response, route, payload)

    context.state = payload
    if (!context.state.meta)
      context.state.meta = {}
    if (!context.state.meta.htmlAttrs)
      context.state.meta.htmlAttrs = {}
    if (request.ssr)
      context.state.meta.htmlAttrs['data-vue-meta-server-rendered'] = true
    return VueRenderer.renderer.renderToString(
      context
    ).then(
      html => {
        response.setHeader('Content-Type', 'text/html')
        const {
          title, htmlAttrs, headAttrs, bodyAttrs, link,
          style, script, noscript, meta
        } = context.meta.inject()
        if (!request.ssr)
          html = html.replace(' data-server-rendered="true"', '')
        return super.render(
          application,
          request,
          response,
          route,
          `<!doctype html><html ${htmlAttrs.text()}><head ${headAttrs.text()}>${context.renderResourceHints()}${context.renderStyles()}${meta.text()}${title.text()}${link.text()}${style.text()}${script.text()}${noscript.text()}</head><body ${bodyAttrs.text()}>${html}${context.renderState()}${context.renderScripts()}${script.text({ body: true })}</body></html>`
        )
      }
    ).catch(
      error => {
        console.log(error)
        return super.render(application, request, response, route, 'Error')
      }
    )
  }
}

export default VueRenderer