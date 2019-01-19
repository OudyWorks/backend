module.exports = function (routes) {
  return class Controller {
    static async run(application, request, response, route, payload) {
      let Entity = routes[request.pathArray[1]],
        singular = Entity.name.toLowerCase(),
        id = request.nextInPath(singular),
        state = request.getPOST(singular) || {}

      return Entity.load(
        id
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