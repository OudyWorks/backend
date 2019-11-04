import _base from './base'
import merge from 'webpack-merge'
import VueSSRClientPlugin from 'vue-server-renderer/client-plugin'

export default (options, {
    base = {},
    client = {}
}) => merge(
    _base(options, base), {
        module: {
            rules: [{
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
                        ],
                        require.resolve('@vue/babel-preset-jsx'),
                    ],
                    plugins: []
                }
            }]
        },
        plugins: [
            new VueSSRClientPlugin()
        ]
    },
    client
)