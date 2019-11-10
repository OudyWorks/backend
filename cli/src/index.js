#!/usr/bin/env node

require('@babel/register')({
  // rootMode: 'upward',
  // ignore: [
  //   /node_modules\/(?!@oudy)/
  // ],
  presets: [
    [
      require('@babel/preset-env').default,
      {
        targets: {
          node: process.versions.node
        },
      }
    ],
  ],
  plugins: [
    [
      require('babel-plugin-module-resolver'),
      {
        root: [
          process.cwd()
        ]
      }
    ]
  ]
})

const chalk = require('chalk'),
  program = require('commander'),
  {
    Server,
    Application
  } = require('@backend/core')

program
  .version(require('./package.json').version)
  .usage('<command> [options]')

program
  .command('serve')
  .description('serve the project')
  .option('-p, --port <n>', 'Port', 8080)
  .option('-h, --host [value]', 'Host', 'localhost')
  .option('-w, --websocket', 'WebSocket')
  .option('-c, --cookies', 'Cookies')
  .action(function ({
    port,
    host,
    websocket,
    cookies
  }) {
    const server = new Server({
        port,
        host,
        websocket
      }),
      application = new Application({
        server,
        directory: process.cwd(),
        cookies
      })
    Promise.all(
      server.ready
    ).then(
      () =>
      server.start()
    )
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}