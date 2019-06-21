import webpack from 'webpack'
import VueLoaderPlugin from 'vue-loader/lib/plugin'
import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

export default options => ({
  output: {
    path: options.directory,
    filename: '[name].[hash].js',
    publicPath: options.publicPath
  },
  resolve: {
    alias: [
      {
        name: 'vue',
        alias: require.resolve('vue')
      },
      {
        name: '@routes',
        alias: options.routesFile
      },
      {
        name: '@modules',
        alias: options.modulesFile
      },
      {
        name: '@locales',
        alias: options.localesFile
      },
    ].concat(
      ['router', 'store', 'meta', 'i18n'].map(
        file => ({
          name: `@${file}`,
          alias: path.resolve(__dirname, `../${file}`)
        })
      )
    ).concat(
      ['layout'].map(
        file => ({
          name: `@${file}`,
          alias: path.resolve(options.directory, `${file}`)
        })
      )
    )
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    {
      apply(compiler) {
        compiler.hooks.beforeRun.tap('Application', (compilation, callback) => {
          ['routes', 'modules', 'locales'].forEach(
            type => {
              compiler.inputFileSystem._statStorage.data.set(
                options[type+'File'],
                [
                  null,
                  options.mfs.statSync(options[type+'File'])
                ]
              )
              compiler.inputFileSystem._readFileStorage.data.set(
                options[type+'File'],
                [
                  null,
                  options.mfs.readFileSync(options[type+'File'])
                ]
              )
              options[type].forEach(
                file => {
                  compiler.inputFileSystem._statStorage.data.set(
                    file,
                    [
                      null,
                      options.fs.statSync(file)
                    ]
                  )
                  compiler.inputFileSystem._readFileStorage.data.set(
                    file,
                    [
                      null,
                      options.fs.readFileSync(file)
                    ]
                  )
                }
              )
            }
          )
        })
      }
    },
    new VueLoaderPlugin()
  ],
  mode: 'development',
  // devtool: 'source-map',
})