import base from './base'
import webpack from 'webpack'
import merge from 'webpack-merge'
import VueSSRClientPlugin from 'vue-server-renderer/client-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserJSPlugin from 'terser-webpack-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'

export default options =>
  merge(
    base(options),
    {
      // target: 'node',
      // output: {
      //   libraryTarget: 'commonjs2',
      // },
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: require.resolve('babel-loader'),
            exclude: /node_modules/,
            options: {
              presets: [
                [
                  require.resolve('@babel/preset-env'),
                  {
                    targets: {
                      browsers: [
                        "> 1%",
                        "last 2 versions"
                      ]
                    }
                  }
                ]
              ],
              plugins: [
                require.resolve('babel-plugin-transform-vue-jsx'),
                require.resolve('@babel/plugin-syntax-dynamic-import'),
              ]
            }
          },
          {
            test: /\.(less|css)$/,
            use: [
              MiniCssExtractPlugin.loader,
              // require.resolve('vue-style-loader'),
              require.resolve('css-loader'),
              {
                loader: require.resolve('less-loader'),
                options: {
                  relativeUrls: true,
                  globalVars: {
                    '@internal-style': 'white-red'
                  }
                }
              }
            ]
          },
          {
            test: /\.svg$/,
            use: require.resolve('raw-loader')
          }
        ]
      },
      plugins: [
        new VueSSRClientPlugin(),
        new MiniCssExtractPlugin({
          filename: '[name].[hash].css',
          chunkFilename: '[name].[hash].css'
        })
      ],
      optimization: {
        minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
        runtimeChunk: {
          name: 'manifest'
        }
      }
    }
  )