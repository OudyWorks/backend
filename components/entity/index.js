const recursiveReadSync = require('recursive-readdir-sync'),
  path = require('path'),

  typeRegex = /types[\\\/][a-zA-Z0-9]+.js$/

module.exports = {
  use(Application) {

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
      plural = types[i][types[i].$pluralName]().toLowerCase()
      singulars.push(singular)
      plurals.push(plural)
      routes[singular] = routes[plural] = types[i]
    }

    console.log(singulars, plurals)

    Application.components.entity = {
      list: class Controller {
        static async run(application, request, response, route, payload) {
          const Entity = routes[request.pathArray[1]]
          return Entity.load('')
        }
      },
      entity: class Controller {
        static async run(application, request, response, route, payload) {
          return {
            entity: 'entity'
          }
        }
      },
      update: class Controller {
        static async run(application, request, response, route, payload) {
          return {
            entity: 'update'
          }
        }
      },
    }

    Application.routes.push(
      {
        url: new RegExp(`^\/(${singulars.join('|')})\/[0-9a-fA-F]{24}$`),
        component: 'entity',
        task: 'entity',
      },
      {
        url: new RegExp(`^\/(${singulars.join('|')})\/([0-9a-fA-F]{24}\/edit|new)$`),
        component: 'entity',
        task: 'update',
      },
      {
        url: new RegExp(`^\/(${plurals.join('|')})$`),
        component: 'entity',
        task: 'list',
      },
    )

  }
}