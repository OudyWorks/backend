import glob from 'fast-glob'
import fs from 'fs'
import path from 'path'
import MemoryFileSystem from '@oudy/memfs'
import _webpack from 'webpack'
import merge from 'webpack-merge'
import client from './webpack/client'
import bundle from './webpack/bundle'
import join from 'memory-fs/lib/join'
import {
  createBundleRenderer
} from 'vue-server-renderer'

import routesBuilder from './builders/routes'
import localesBuilder from './builders/locales'

export default function ({
  outputFileSystem,
  store,
  meta = true,
  i18n,
  webpack = {}
} = {}) {
  return async function (application) {
    const routes = glob.sync(
        [
          'components/*/route.js',
          'components/*/tasks/*/route.js',
        ], {
          cwd: application.directory,
          absolute: true
        }
      ).map(
        file => {
          const [, component, , task = 'default'] = file.match(/components\/([0-9a-zA-Z.]+)(\/tasks\/([0-9a-zA-Z.]+))?\/route\.js$/)
          return {
            component,
            task,
            file
          }
        }
      ),
      locales = glob.sync(
        [
          'components/*/i18n/*.{js,json}',
          'components/*/tasks/*/i18n/*.{js,json}',
        ], {
          cwd: application.directory,
          absolute: true
        }
      ).map(
        file => {
          const [, component, , task, language] = file.match(/components\/(.*?)\/(tasks\/(.*?)\/)?i18n\/(.*?)\.js/)
          return {
            file,
            component,
            task,
            language
          }
        }
      ),

      mfs = await MemoryFileSystem.configure(Date.now())

    if (outputFileSystem && !outputFileSystem.join)
      outputFileSystem.join = join

    const routesFile = path.join(application.directory, 'routes.js'),
      localesFile = path.join(application.directory, 'locales.js')

    mfs.mkdirpSync(application.directory)
    mfs.writeFileSync(
      routesFile,
      routesBuilder(routes)
    )
    mfs.writeFileSync(
      localesFile,
      localesBuilder(locales)
    )

    const options = {
        routesFile,
        routes,
        localesFile,
        locales,
        fs,
        mfs,
        directory: application.directory,
        publicPath: '/static/',
        store,
        meta,
        i18n
      },
      compiler = _webpack(merge(
        client(options, webpack), {
          entry: {
            app: require.resolve('./application/frontend.js')
          },
        }
      )),
      bundleCompiler = _webpack(merge(
        bundle(options, webpack), {
          entry: {
            app: require.resolve('./application/bundle.js')
          },
          resolve: {
            alias: [{
              name: '@app',
              alias: require.resolve('./application/loader.js')
            }]
          }
        }
      ))
    compiler.outputFileSystem = outputFileSystem
    bundleCompiler.outputFileSystem = outputFileSystem

    compiler.run(
      (error, c_stats) => {
        console.log(error, c_stats && [Object.keys(c_stats.compilation.assets), c_stats.compilation.errors])
        bundleCompiler.run(
          (error, stats) => {
            console.log(error, stats && Object.keys(stats.compilation.assets))
            const renderer = createBundleRenderer(
              JSON.parse(stats.compilation.assets['vue-ssr-server-bundle.json'].source()), {
                runInNewContext: true,
                clientManifest: JSON.parse(c_stats.compilation.assets['vue-ssr-client-manifest.json'].source())
              }
            )
            application.ready.then(
              () => {
                application.router.use(
                  '/',
                  function (request, response, next) {
                    if (request.accepts('html', 'json') != 'html')
                      next()
                    else {
                      let context = {}
                      renderer.renderToString(
                        context
                      ).then(
                        html => {
                          const {
                            title,
                            htmlAttrs,
                            headAttrs,
                            bodyAttrs,
                            link,
                            style,
                            script,
                            noscript,
                            meta
                          } = context.meta.inject()
                          html = html.replace(' data-server-rendered="true"', '')
                          response.setHeader('Content-Type', 'text/html')
                          response.end(`<!doctype html><html ${htmlAttrs.text()}><head ${headAttrs.text()}>${context.renderResourceHints()}${context.renderStyles()}${meta.text()}${title.text()}${link.text()}${style.text()}${script.text()}${noscript.text()}</head><body ${bodyAttrs.text()}>${html}${context.renderState()}${context.renderScripts()}${script.text({ body: true })}</body></html>`)
                        }
                      )
                    }
                  }
                )
              }
            )
          }
        )
      }
    )
  }
}