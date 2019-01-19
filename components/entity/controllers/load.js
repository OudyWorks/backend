const updateController = require('./update')

module.exports = function (routes) {
  const _updateController = updateController(routes)
  return class Controller {
    static async run(application, request, response, route, payload) {

      if (['POST', 'PUT'].includes(request.method))
        return _updateController.run(application, request, response, route, payload)

      let Entity = routes[request.pathArray[1]],
        id = request.nextInPath(request.pathArray[1])
      return Entity.load(id)
    }
  }
}