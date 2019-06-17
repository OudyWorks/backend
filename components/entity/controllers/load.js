const updateController = require('./update'),
falzy = require('falzy')

module.exports = function (routes) {
  const _updateController = updateController(routes)
  return class Controller {
    static async run(application, request, response, route, payload) {

      if (['POST', 'PUT'].includes(request.method))
        return _updateController.run(application, request, response, route, payload)

      let Entity = routes[request.pathArray[1]],
        id = request.nextInPath(request.pathArray[1]),
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
        
      return Entity.load(id, context)
    }
  }
}