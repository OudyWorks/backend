const falzy = require('falzy')

module.exports = function (routes) {
  return class Controller {
    static async run(application, request, response, route, payload) {
      let Entity = routes[request.pathArray[1]],
        singular = Entity.name.toLowerCase(),
        id = request.nextInPath(singular),
        state = request.getPOST(singular) || {},
        context = {},
        missingContext = []

      Entity[Entity.$context].forEach(
        key =>
          context[key] = request.getGET(key)
      )

      missingContext = Entity[Entity.$context].filter(
        key =>
          falzy(context[key])
      )

      if(missingContext.length)
        return {
          error: 'Missing context: '+missingContext.join()
        }

      return Entity.load(
        id,
        context
      ).then(
        entity =>
          entity.bind(state).then(
            async bind => {
              if (!bind.erred && bind.changed)
                await entity.save(bind)
              return bind
            }
          ).then(
            bind => ({
              [singular]: entity,
              ...bind
            })
          )
      )
    }
  }
}