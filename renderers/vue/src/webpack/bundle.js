import _base from './base'
import merge from 'webpack-merge'
import VueSSRServerPlugin from 'vue-server-renderer/server-plugin'
import nodeExternals from 'webpack-node-externals'

export default (options, {
    base = {},
    bundle = {}
}) => merge(
    _base(options, base), {
        target: 'node',
        output: {
            libraryTarget: 'commonjs2',
        },
        module: {
            rules: [{
                test: /\.js$/,
                loader: require.resolve('babel-loader'),
                exclude: /node_modules/,
                options: {
                    presets: [
                        require.resolve('@babel/preset-env'),
                        require.resolve('@vue/babel-preset-jsx')
                    ],
                    plugins: []
                }
            }]
        },
        externals: nodeExternals({
            whitelist: /\.(css|less|svg)$/
        }),
        plugins: [
            new VueSSRServerPlugin()
        ]
    },
    bundle
)