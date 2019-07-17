import base from './base'
import merge from 'webpack-merge'
import VueSSRServerPlugin from 'vue-server-renderer/server-plugin'
import nodeExternals from 'webpack-node-externals'

export default options =>
  merge(
    base(options),
    {
      target: 'node',
      output: {
        libraryTarget: 'commonjs2',
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: require.resolve('babel-loader'),
            exclude: /node_modules/,
            options: {
              presets: [
                require.resolve('@babel/preset-env'),
                require.resolve('@vue/babel-preset-jsx'),
              ],
              plugins: [
                [
                  require('babel-plugin-module-resolver'),
                  {
                    root: options.directory,
                    alias: [
                      'components',
                      'libraries',
                      'types',
                    ].reduce(
                      (alias, file) =>
                        Object.assign(
                          alias,
                          {
                            [file]: `./${file}`
                          }
                        ),
                      {}
                    )
                  }
                ],
                require.resolve('@babel/plugin-syntax-dynamic-import')
              ]
            }
          },
          {
            test: /\.less$/,
            use: require.resolve('raw-loader')
          }
        ]
      },
      externals: nodeExternals({
        whitelist: /\.(css|less|svg)$/
      }),
      plugins: [
        new VueSSRServerPlugin()
      ]
    }
  )