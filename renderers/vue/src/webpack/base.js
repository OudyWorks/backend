import webpack from 'webpack'
import merge from 'webpack-merge'
import VueLoaderPlugin from 'vue-loader/lib/plugin'
import path from 'path'

export default (options, base = {}) =>
    merge({
        output: {
            path: options.directory,
            filename: '[name].[hash].js',
            publicPath: options.publicPath
        },
        resolve: {
            alias: [{
                    name: 'vue',
                    alias: require.resolve('vue')
                },
                {
                    name: '@routes',
                    alias: options.routesFile
                },
                //   {
                //     name: '@modules',
                //     alias: options.modulesFile
                //   },
                options.i18n && {
                    name: '@locales',
                    alias: options.localesFile
                },
            ].concat(
                [
                    'router',
                    options.store && 'store',
                    options.meta && 'meta',
                    options.i18n && 'i18n',
                ].map(
                    file => ({
                        name: `@${file}`,
                        alias: path.resolve(__dirname, `../application/${file}`)
                    })
                )
            ).concat(
                ['layout'].map(
                    file => ({
                        name: `@${file}`,
                        alias: path.resolve(options.directory, `${file}`)
                    })
                )
            ).filter(
                alias =>
                alias
            )
        },
        module: {
            rules: [{
                test: /\.vue$/,
                loader: 'vue-loader'
            }]
        },
        plugins: [{
                apply(compiler) {
                    compiler.hooks.beforeRun.tap('Application', (compilation, callback) => {
                        [
                            'routes',
                            options.i18n && 'locales'
                        ].filter(
                            type =>
                            type
                        ).forEach( //, 'modules'
                            type => {
                                compiler.inputFileSystem._statStorage.data.set(
                                    options[type + 'File'],
                                    [
                                        null,
                                        options.mfs.statSync(options[type + 'File'])
                                    ]
                                )
                                compiler.inputFileSystem._readFileStorage.data.set(
                                    options[type + 'File'],
                                    [
                                        null,
                                        options.mfs.readFileSync(options[type + 'File'])
                                    ]
                                )
                                options[type].forEach(
                                    ({
                                        file
                                    }) => {
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
    },
    base
)