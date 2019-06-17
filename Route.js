

class Route {
  constructor(route) {
    Object.assign(this, route)
  }
  error(code = 404, error = '') {
    Object.keys(this).forEach(
      key =>
        delete this[key]
    )
    this.component = 'error'
    this.task = 'default'
    Object.assign(
      this,
      {
        code,
        error
      }
    )
    return {
      code,
      error
    }
  }
}

module.exports = Route