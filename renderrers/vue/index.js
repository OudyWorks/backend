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

class VueRenderer extends Renderer {
  static use(
    Application = require('@oudy/backend/Application'),
    directory = process.cwd(),
    options = {}
  ) {
    options.webpack = options.webpack || {}
    const routes = fg.sync(
      [
        'components/*/route.js',
        'components/*/tasks/*/route.js',
      ],
      {
        cwd: directory,
        absolute: true
      }
    ),
      modules = fg.sync(
        [
          'modules/*.js',
        ],
        {
          cwd: directory,
          absolute: true
        }
      ),
      mfs = new MemoryFileSystem(),
      routesFile = path.join(directory, 'application.routes.js'),
      modulesFile = path.join(directory, 'application.modules.js')
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
      directory,
      publicPath: '/static/'
    },
      _bundle = webpack(merge(
        bundle(base),
        {
          entry: {
            app: require.resolve('./application/bundle.js')
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
  }
  static async render(application, request, response, route, payload) {
    let context = { application, request, response, route, payload }
    context.state = payload
    return VueRenderer.renderer.renderToString(
      context
    ).then(
      html => {
        response.setHeader('Content-Type', 'text/html')
        const {
          title, htmlAttrs, headAttrs, bodyAttrs, link,
          style, script, noscript, meta
        } = context.meta.inject()
        return super.render(
          application,
          request,
          response,
          route,
          `<!doctype html><html data-vue-meta-server-rendered ${htmlAttrs.text()}><head ${headAttrs.text()}>${context.renderResourceHints()}${context.renderStyles()}${meta.text()}${title.text()}${link.text()}${style.text()}${script.text()}${noscript.text()}</head><body ${bodyAttrs.text()}><div id="app">${html}</div>${context.renderState()}${context.renderScripts()}${script.text({ body: true })}</body></html>`
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

module.exports = VueRenderer