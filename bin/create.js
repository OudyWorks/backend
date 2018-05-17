#!/usr/bin/env node

const shell = require('shelljs'),
    colors = require('colors'),
    fs = require('fs'),
    path = require('path')

console.log('Creating app...')
Promise.resolve().then(
    () => new Promise(
        (resolve, reject) => {

            console.log('Install dev packages')

            shell.exec(
                'npm install -D babel-plugin-module-resolver',
                {silent: true},
                (code, stdout, stderr) => {
                    if(code)
                        reject('Error while installing dev packages: '+stderr)
                    else {
                        console.log('dev packages installed'.green)
                        resolve()
                    }
                }
            )

        }
    )
).then(
    () => new Promise(
        (resolve, reject) => {

            console.log('Install @oudyworks/backend')

            shell.exec(
                'npm install @oudyworks/backend',
                {silent: true},
                (code, stdout, stderr) => {
                    if(code)
                        reject('Error while installing @oudyworks/backend: '+stderr)
                    else {
                        console.log('@oudyworks/backend installed'.green)
                        resolve()
                    }
                }
            )

        }
    )
).then(
    () => new Promise(
        (resolve, reject) => {

            console.log('Create folders')

            shell.cp(
                '-R',
                `${path.join(__dirname, 'skeleton', '*')}`,
                `${path.join(__dirname, 'skeleton', '.*')}`,
                shell.pwd().toString()
            )

        }
    )
).catch(
    error => {
        console.log('Error'.red)
        console.log(error.red)
    }
)