const recursiveReadSync = require('recursive-readdir-sync'),
  path = require('path'),
  fs = require('fs'),
  {
    $pluralName
  } = require('@oudy/entity'),

  listController = require('./controllers/list'),
  loadController = require('./controllers/load'),

  typeRegex = /types[\\\/][a-zA-Z0-9]+.js$/

module.exports = {
  use(Application) {

    if (!fs.existsSync(path.join(process.cwd(), 'types')))
      return

    let files = recursiveReadSync(
      path.join(process.cwd(), 'types')
    ).filter(
      // filter 
      file =>
        file.match(typeRegex)
    )

    if (!files.length)
      return

    let types = [],
      singulars = [],
      plurals = [],
      routes = {}

    for (let i = 0; i < files.length; i++) {
      types[i] = require(files[i])
      let singular = types[i].name.toLowerCase(),
        plural = types[i][$pluralName]().toLowerCase()
      singulars.push(singular)
      plurals.push(plural)
      routes[singular] = routes[plural] = types[i]
    }

    Application.components.entity = {
      list: listController(routes),
      load: loadController(routes)
    }

    Application.routes.push(
      {
        url: new RegExp(`^\/(${singulars.join('|')})\/[0-9a-fA-F]{24}$`),
        component: 'entity',
        task: 'load',
      },
      {
        url: new RegExp(`^\/(${plurals.join('|')})$`),
        component: 'entity',
        task: 'list',
      },
    )

  }
}