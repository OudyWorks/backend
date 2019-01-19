const updateController = require('./update')

module.exports = function (routes) {
  const _updateController = updateController(routes)
  return class Controller {
    static async run(application, request, response, route, payload) {

      if (request.method == 'POST')
        return _updateController.run(application, request, response, route, payload)

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
  }
}