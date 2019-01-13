#!/usr/bin/env node

const chalk = require('chalk'),
  program = require('commander')

// console.log(__dirname)
// console.log(__filename)
// console.log(process.cwd())

program
  .version(require('../package').version)
  .usage('<command> [options]')

program
  .command('create')
  .description('create a new project powered by backend')
  .option('-c, --clone [value]', 'Use git clone when fetching remote template')
  .action(function (args) {
    console.log('Create')
    require('./create')(args)
  })

program
  .command('serve')
  .description('serve the project')
  .option('-p, --port <n>', 'Port', 8080)
  .option('-h, --host [value]', 'Host', 'localhost')
  .option('-w, --websocket', 'WebSocket')
  .action(function (args) {
    console.log('Serve')
    require('./serve')(args)
  })

program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp()
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
    console.log()
  })

// add some useful info on help
// program.on('--help', () => {
//   console.log()
//   console.log(`  Run ${chalk.cyan(`backend <command> --help`)} for detailed usage of given command.`)
//   console.log()
// })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}