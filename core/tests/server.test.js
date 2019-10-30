import Server from '../Server'
import Application from '../Application'

// test('adds 1 + 2 to equal 3', () => {
const server = new Server({
  port: 8080,
  host: 'localhost'
}),
  app = new Application({
    server,
    directory: __dirname,
    cookie: true
  })
server.start()
    // expect(1 + 2).toBe(3)
// })