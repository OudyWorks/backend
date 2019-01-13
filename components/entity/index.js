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
          let Entity = routes[request.pathArray[1]],
            {
              query = '{}', limit = 20, page = 1, sort = '{}'
            } = request.queryObject

          try {

            query = JSON.parse(query)
            sort = JSON.parse(sort)
            limit = parseInt(limit)
            page = parseInt(page)

          } catch (error) {
            return Promise.reject(error)
          }

          return Entity.loadAll({
            query, limit, page, sort
          })
        }
      },
      entity: class Controller {
        static async run(application, request, response, route, payload) {
          let Entity = routes[request.pathArray[1]],
            id = request.nextInPath(request.pathArray[1])
          return Entity.load(id)
        }
      },
      update: class Controller {
        static async run(application, request, response, route, payload) {
          let Entity = routes[request.pathArray[1]],
            id = request.nextInPath(request.pathArray[1]),
            state = request.getPOST(request.pathArray[1])
          return Entity.load(
            id
          ).then(
            entity =>
              entity.bind(state).then(
                async bind => {
                  if(!bind.erred && bind.changed)
                    await entity.save(bind)
                  return bind
                }
              ).then(
                bind => ({
                  [request.pathArray[1]]: entity,
                  ...bind
                })
              )
          )
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
        url: new RegExp(`^\/(${singulars.join('|')})\/([0-9a-fA-F]{24}\/)?$`),
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